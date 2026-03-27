import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { FiShield, FiUser, FiPercent, FiArrowLeft, FiCheckCircle } from 'react-icons/fi';
import { useBookings, useAuth } from '@/hooks';
import { promoAPI } from '@/api/api';
import { SUBSCRIPTION_PLANS, CAR_IMAGES } from '@/constants';

const BookingCheckout: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const { createBooking } = useBookings();

   const { vehicle, bookingData: partialBookingData, subscriptionPlan: subscriptionPlanId } = location.state as any;
  const subscriptionPlan = subscriptionPlanId ? SUBSCRIPTION_PLANS[subscriptionPlanId] : null;

  const [extras, setExtras] = useState({ 
    insurance: false, 
    gps: false, 
    childSeat: false, 
    additionalDrivers: 0 
  });
  const [couponCode, setCouponCode] = useState('');
  const [couponDiscount, setCouponDiscount] = useState(0);
  const [couponApplied, setCouponApplied] = useState(false);
  const [couponError, setCouponError] = useState('');
  const [error, setError] = useState('');

  const RATES = { insurance: 150, gps: 50, childSeat: 75, driver: 100 };

  const days = Math.max(1, Math.ceil((new Date(partialBookingData.returnDate).getTime() - new Date(partialBookingData.pickupDate).getTime()) / 86400000));
  
  const discount = (() => {
    const adv = Math.ceil((new Date(partialBookingData.pickupDate).getTime() - Date.now()) / 86400000);
    const pct = adv >= 30 ? 15 : adv >= 14 ? 10 : adv >= 7 ? 5 : 0;
    return { pct, amt: (vehicle.dailyRate * days * pct) / 100 };
  })();

  const extraCharges = (extras.insurance ? RATES.insurance : 0) * days + 
                     (extras.gps ? RATES.gps : 0) * days + 
                     (extras.childSeat ? RATES.childSeat : 0) * days + 
                     extras.additionalDrivers * RATES.driver * days;

  const subtotal = subscriptionPlan 
    ? subscriptionPlan.price + extraCharges + partialBookingData.deliveryFee
    : (vehicle.dailyRate * days - discount.amt + extraCharges + partialBookingData.deliveryFee);
    
  const total = subtotal - couponDiscount;

  const applyCoupon = async () => {
    setCouponError('');
    if (!couponCode.trim()) {
      setCouponError('Please enter a coupon code');
      return;
    }
    
    try {
      const response = await promoAPI.validate(couponCode, user?.id);
      const data = response.data;
      
      if (data.valid) {
        const discountPct = parseFloat(data.discountPercentage) / 100;
        let discountAmt = subtotal * discountPct;
        
        if (data.maxDiscountAmount && discountAmt > parseFloat(data.maxDiscountAmount)) {
          discountAmt = parseFloat(data.maxDiscountAmount);
        }
        
        setCouponDiscount(discountAmt);
        setCouponApplied(true);
      } else {
        setCouponError(data.message || 'Invalid promo code');
        setCouponDiscount(0);
        setCouponApplied(false);
      }
    } catch (err: any) {
      setCouponError(err.response?.data?.message || 'Invalid promo code');
      setCouponDiscount(0);
      setCouponApplied(false);
    }
  };

  const removeCoupon = () => {
    setCouponCode('');
    setCouponDiscount(0);
    setCouponApplied(false);
    setCouponError('');
  };

  const handleProceedToPayment = async () => {
    if (!user) return navigate('/login');

    const finalBookingData = {
      ...partialBookingData,
      includeInsurance: extras.insurance,
      includeGps: extras.gps,
      includeChildSeat: extras.childSeat,
      additionalDrivers: extras.additionalDrivers,
      couponCode: couponApplied ? couponCode : null,
      couponDiscount: couponDiscount,
      subscriptionPlanId: subscriptionPlanId // Add this if backend supports it or just use totalAmount
    };

    createBooking.mutate(finalBookingData, {
      onSuccess: (response: any) => {
        const createdBooking = response.data;
        navigate(`/payment/${createdBooking.id}`, { 
          state: { 
            booking: createdBooking, 
            vehicle, 
            totalAmount: createdBooking.totalAmount || total,
            couponCode: couponApplied ? couponCode : null,
            couponDiscount: couponDiscount
          } 
        });
      },
      onError: (err: any) => {
        setError(err.response?.data?.message || 'Failed to create booking');
      }
    });
  };

  if (!vehicle || !partialBookingData) {
    return <div className="min-h-screen flex items-center justify-center"><button onClick={() => navigate('/cars')} className="bg-blue-600 text-white px-6 py-2 rounded-lg">Return to Browse</button></div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4">
        <button onClick={() => navigate(-1)} className="mb-8 text-gray-600 hover:text-gray-900 flex items-center gap-2">
          <FiArrowLeft /> Back to Booking Details
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            {/* Header */}
            <div className="bg-white rounded-2xl shadow-sm p-6 flex items-center justify-between border border-gray-100">
              <div className="flex items-center gap-4">
                <div className="bg-blue-100 p-3 rounded-full text-blue-600 font-bold">2</div>
                <div>
                  <h1 className="text-2xl font-bold">Options & Offers</h1>
                  <p className="text-gray-500 text-sm">Customize your ride and apply discounts</p>
                </div>
              </div>
              <div className="flex items-center gap-2 text-green-600 font-semibold bg-green-50 px-4 py-2 rounded-full text-sm">
                <FiCheckCircle /> Step 1 Complete
              </div>
            </div>

            {/* Extra Options */}
            <div className="bg-white rounded-2xl shadow-sm p-8 border border-gray-100">
              <h2 className="text-xl font-bold mb-6 flex items-center gap-2"><FiShield className="text-blue-600" /> Protective Extras</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  {key: 'insurance', label: '🛡️ Comprehensive Insurance', desc: 'Zero liability in case of accidents', rate: RATES.insurance},
                  {key: 'gps', label: '📍 High-Precision GPS', desc: 'Stay on track with offline maps', rate: RATES.gps},
                  {key: 'childSeat', label: '👶 Premium Child Seat', desc: 'Safety first for your little ones', rate: RATES.childSeat}
                ].map(opt => (
                  <label key={opt.key} className={`p-5 border-2 rounded-2xl transition cursor-pointer flex items-start gap-4 ${extras[opt.key as keyof typeof extras] ? 'border-blue-500 bg-blue-50/30' : 'border-gray-100 hover:border-blue-200'}`}>
                    <input 
                      type="checkbox" 
                      className="mt-1 w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500" 
                      checked={extras[opt.key as keyof typeof extras] as boolean} 
                      onChange={e => setExtras({...extras, [opt.key]: e.target.checked})} 
                    />
                    <div className="flex-1">
                      <div className="flex justify-between">
                        <span className="font-bold text-gray-800">{opt.label}</span>
                        <span className="text-blue-600 font-bold">₹{opt.rate}/day</span>
                      </div>
                      <p className="text-sm text-gray-500 mt-1">{opt.desc}</p>
                    </div>
                  </label>
                ))}
              </div>

              <div className="mt-6 p-5 border-2 border-dashed border-gray-200 rounded-2xl flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="bg-gray-100 p-3 rounded-full"><FiUser className="text-gray-600" /></div>
                  <div>
                    <span className="font-bold text-gray-800">Additional Drivers</span>
                    <p className="text-sm text-gray-500">Share the driving and stay fresh</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-blue-600 font-bold">₹{RATES.driver}/day</span>
                  <select 
                    value={extras.additionalDrivers} 
                    onChange={e => setExtras({...extras, additionalDrivers: parseInt(e.target.value)})} 
                    className="px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  >
                    {[0, 1, 2, 3].map(n => <option key={n} value={n}>{n}</option>)}
                  </select>
                </div>
              </div>
            </div>

            {/* Coupons */}
            <div className="bg-white rounded-2xl shadow-sm p-8 border border-gray-100">
              <h2 className="text-xl font-bold mb-6 flex items-center gap-2"><FiPercent className="text-blue-600" /> Exclusive Offers</h2>
              {!couponApplied ? (
                <div className="flex gap-4">
                  <div className="relative flex-1">
                    <FiPercent className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      type="text"
                      value={couponCode}
                      onChange={(e) => {
                        setCouponCode(e.target.value.toUpperCase());
                        setCouponError('');
                      }}
                      placeholder="Enter promo code (e.g., WELCOME10)"
                      className="w-full pl-11 pr-4 py-4 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none font-semibold uppercase tracking-wider"
                    />
                  </div>
                  <button
                    onClick={applyCoupon}
                    className="px-8 py-4 bg-blue-600 text-white font-bold rounded-2xl hover:bg-blue-700 transition shadow-lg shadow-blue-200"
                  >
                    Apply
                  </button>
                </div>
              ) : (
                <div className="flex items-center justify-between p-6 bg-green-50 border border-green-200 rounded-2xl">
                  <div className="flex items-center gap-4">
                    <div className="bg-green-100 p-3 rounded-full text-green-600"><FiCheckCircle size={24} /></div>
                    <div>
                      <p className="font-bold text-green-800">Coupon "{couponCode}" Applied!</p>
                      <p className="text-sm text-green-600">You saved ₹{couponDiscount.toLocaleString()} on this ride</p>
                    </div>
                  </div>
                  <button
                    onClick={removeCoupon}
                    className="text-red-500 hover:text-red-600 font-bold px-4 py-2 rounded-xl hover:bg-red-50 transition"
                  >
                    Remove
                  </button>
                </div>
              )}
              {couponError && <p className="text-red-500 text-sm mt-3 font-semibold ml-1">{couponError}</p>}
              
            </div>
          </div>

          {/* Pricing Summary */}
          <div className="space-y-6">
            <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100 sticky top-8">
              <h3 className="text-xl font-bold mb-6">Fare Details</h3>
              
              <div className="space-y-4">
                {subscriptionPlan ? (
                  <div className="flex justify-between text-gray-600">
                    <span>Subscription Plan ({subscriptionPlan.name})</span>
                    <span className="font-semibold text-gray-800">₹{subscriptionPlan.price.toLocaleString()}</span>
                  </div>
                ) : (
                  <div className="flex justify-between text-gray-600">
                    <span>Base Fare ({days} days)</span>
                    <span className="font-semibold text-gray-800">₹{(vehicle.dailyRate * days).toLocaleString()}</span>
                  </div>
                )}
                
                {!subscriptionPlan && discount.pct > 0 && (
                  <div className="flex justify-between text-green-600 italic">
                    <span>Early Booking Discount ({discount.pct}%)</span>
                    <span className="font-semibold">-₹{discount.amt.toLocaleString()}</span>
                  </div>
                )}

                {extraCharges > 0 && (
                  <div className="flex justify-between text-gray-600">
                    <span>Add-ons & Insurance</span>
                    <span className="font-semibold text-gray-800">₹{extraCharges.toLocaleString()}</span>
                  </div>
                )}

                {partialBookingData.deliveryFee > 0 && (
                  <div className="flex justify-between text-gray-600">
                    <span>Delivery Charges</span>
                    <span className="font-semibold text-gray-800">₹{partialBookingData.deliveryFee.toLocaleString()}</span>
                  </div>
                )}

                {couponDiscount > 0 && (
                  <div className="flex justify-between text-green-600 font-bold border-t border-dashed pt-4 mt-4">
                    <span>Coupon Savings</span>
                    <span>-₹{couponDiscount.toLocaleString()}</span>
                  </div>
                )}

                <div className="border-t border-gray-100 pt-6 mt-6">
                  <div className="flex justify-between items-end">
                    <div>
                      <p className="text-gray-400 text-sm uppercase font-bold tracking-wider">Total Payable</p>
                      <p className="text-4xl font-black text-blue-600">₹{total.toLocaleString()}</p>
                    </div>
                  </div>
                </div>

                {error && <p className="text-red-500 text-sm font-bold bg-red-50 p-4 rounded-xl mt-4">{error}</p>}

                <button 
                  onClick={handleProceedToPayment}
                  disabled={createBooking.isLoading}
                  className="w-full bg-gradient-to-r from-blue-600 to-indigo-700 text-white font-black py-4 rounded-2xl hover:from-blue-700 hover:to-indigo-800 disabled:opacity-50 transition shadow-xl shadow-blue-200 mt-6"
                >
                  {createBooking.isLoading ? 'Preparing Booking...' : 'Confirm & Proceed to Payment →'}
                </button>
                
                <p className="text-center text-xs text-gray-400 mt-4">
                  By clicking confirm, you agree to our <span className="underline cursor-pointer">Terms of Service</span>
                </p>
              </div>
            </div>

             {/* Selected Vehicle Card */}
            <div className="bg-white rounded-2xl shadow-sm overflow-hidden border border-gray-100">
              <img src={CAR_IMAGES[`${vehicle.make} ${vehicle.model}`] || CAR_IMAGES[vehicle.model] || vehicle.imageUrl || 'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=400&h=250&fit=crop'} alt={vehicle.model} className="w-full h-40 object-cover" />
              <div className="p-4">
                <h4 className="font-bold text-gray-800">{vehicle.make} {vehicle.model}</h4>
                <div className="flex gap-3 text-xs text-gray-500 mt-1">
                  <span>{vehicle.year}</span>
                  <span>•</span>
                  <span>{vehicle.transmission}</span>
                  <span>•</span>
                  <span>{vehicle.fuelType}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookingCheckout;
