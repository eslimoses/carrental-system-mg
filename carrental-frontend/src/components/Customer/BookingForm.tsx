import React, { useState } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { FiCalendar, FiTruck, FiMapPin, FiPercent } from 'react-icons/fi';

import { useCarDetail, useAuth } from '../../hooks';
import { SUBSCRIPTION_PLANS, CAR_IMAGES } from '../../constants';

const LANDMARKS_BY_CITY: Record<string, string[]> = {
  'Chennai': ['Anna Nagar Tower', 'Marina Beach', 'T Nagar Bus Stand', 'Velachery MRTS', 'Adyar Signal', 'Guindy Station'],
  'Mumbai': ['Gateway of India', 'Bandra Terminus', 'Andheri Station', 'Juhu Beach', 'Dadar TT Circle', 'Marine Drive'],
  'Delhi': ['Connaught Place', 'India Gate', 'Karol Bagh Market', 'Laxmi Nagar', 'Saket Metro', 'Hauz Khas'],
  'Bangalore': ['MG Road', 'Indiranagar BDA', 'Koramangala Forum Mall', 'Whitefield Tech Park', 'Hebbal Flyover', 'Majestic'],
  'Hyderabad': ['Charminar', 'Hi-Tech City', 'Secunderabad Station', 'Banjara Hills', 'Gachibowli Stadium', 'Hussain Sagar'],
  'Pune': ['Shivaji Nagar', 'Hinjewadi IT Park', 'Viman Nagar', 'Koregaon Park', 'Pune Railway Station', 'Deccan Gymkhana'],
  'Kolkata': ['Howrah Bridge', 'Park Street', 'Salt Lake Sector V', 'Victoria Memorial', 'Esplanade', 'New Town']
};

const DEFAULT_LANDMARKS = ['City Center', 'Main Railway Station', 'Airport', 'Bus Terminus', 'Town Hall'];

const BookingForm: React.FC = () => {
  const { vehicleId } = useParams<{ vehicleId: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const subscriptionPlanId = (location.state as any)?.subscriptionPlan;
  const subscriptionPlan = subscriptionPlanId ? SUBSCRIPTION_PLANS[subscriptionPlanId] : null;

  const { car: vehicle, isLoading: loading } = useCarDetail(parseInt(vehicleId || '0'));

  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    pickupDate: (location.state as any)?.pickupDate || new Date().toISOString().split('T')[0],
    pickupTime: (location.state as any)?.pickupTime || '10:00',
    returnDate: (location.state as any)?.dropoffDate || '',
    returnTime: (location.state as any)?.dropoffTime || '10:00',
    deliveryType: 'PICKUP',
    deliveryAddress: (location.state as any)?.pickupLocation || '',
    deliveryLandmark: '',
    deliveryDistance: 0
  });

  // Remove default cityName as address to let users type their actual address
  // We will instead display the city name as a disabled field.

  const RATES = { delivery: 15 };

  const days = formData.pickupDate && formData.returnDate ? Math.max(1, Math.ceil((new Date(formData.returnDate).getTime() - new Date(formData.pickupDate).getTime()) / 86400000)) : 1;
  
  const discount = (() => {
    if (!formData.pickupDate) return { pct: 0, amt: 0 };
    const adv = Math.ceil((new Date(formData.pickupDate).getTime() - Date.now()) / 86400000);
    const pct = adv >= 30 ? 15 : adv >= 14 ? 10 : adv >= 7 ? 5 : 0;
    return { pct, amt: ((vehicle?.dailyRate || 0) * days * pct) / 100 };
  })();

  const deliveryFee = formData.deliveryType === 'HOME_DELIVERY' ? formData.deliveryDistance * RATES.delivery : 0;
  const subtotal = subscriptionPlan 
    ? subscriptionPlan.price + deliveryFee
    : (vehicle ? vehicle.dailyRate * days - discount.amt + deliveryFee : 0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!vehicle || !formData.pickupDate || !formData.returnDate) return setError('Please fill all required fields');
    
    if (!user) {
      return navigate('/login', { state: { from: `/booking/${vehicleId}` } });
    }
    
    setError('');
    
    const bookingData = {
      customerId: user.id,
      vehicleId: vehicle.id,
      pickupDate: formData.pickupDate,
      returnDate: formData.returnDate,
      pickupTime: formData.pickupTime + ':00',
      returnTime: formData.returnTime + ':00',
      deliveryType: formData.deliveryType,
      deliveryLocation: formData.deliveryType === 'HOME_DELIVERY' 
        ? `${formData.deliveryAddress}, Near ${formData.deliveryLandmark}, ${vehicle.cityName}` 
        : null,
      deliveryDistance: formData.deliveryType === 'HOME_DELIVERY' ? formData.deliveryDistance : 0,
      deliveryFee: deliveryFee
    };
    
    navigate(`/checkout/${vehicleId}`, {
      state: {
        vehicle,
        bookingData,
        days,
        subtotal,
        subscriptionPlan: subscriptionPlanId
      }
    });
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100"><div className="animate-spin rounded-full h-16 w-16 border-t-4 border-blue-600"></div></div>;
  if (!vehicle) return <div className="min-h-screen flex items-center justify-center"><button onClick={() => navigate('/cars')} className="bg-blue-600 text-white px-6 py-2 rounded-lg">Browse Cars</button></div>;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8">
      <div className="max-w-7xl mx-auto px-4">
        <button onClick={() => navigate('/cars')} className="mb-6 text-gray-600 hover:text-gray-900">← Back to Cars</button>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            {/* Vehicle Card */}
            <div className="bg-white rounded-2xl shadow-lg p-6 flex gap-6">
              <img src={CAR_IMAGES[`${vehicle.make} ${vehicle.model}`] || CAR_IMAGES[vehicle.model] || vehicle.imageUrl || 'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=400&h=300&fit=crop'} alt={`${vehicle.make} ${vehicle.model}`} className="w-48 h-32 object-cover rounded-xl" />
              <div>
                <h2 className="text-2xl font-bold">{vehicle.make} {vehicle.model}</h2>
                <p className="text-gray-500">{vehicle.year} • {vehicle.type}</p>
                <div className="flex gap-4 mt-2 text-sm text-gray-600"><span>🚗 {vehicle.transmission}</span><span>⛽ {vehicle.fuelType}</span><span>👥 {vehicle.seatingCapacity} seats</span></div>
                <p className="mt-3 text-2xl font-bold text-blue-600">₹{vehicle.dailyRate}<span className="text-sm text-gray-500">/day</span></p>
              </div>
            </div>

            {/* Booking Form */}
            <div className="bg-white rounded-2xl shadow-lg p-8">
              <h2 className="text-2xl font-bold mb-6 flex items-center gap-2"><FiCalendar className="text-blue-600" /> Booking Details</h2>
              {error && <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg">{error}</div>}
              <form onSubmit={handleSubmit}>
                <div className="grid grid-cols-2 gap-6 mb-6">
                  <div><label className="block font-semibold mb-2">Pickup Date</label><input type="date" value={formData.pickupDate} onChange={e => setFormData({...formData, pickupDate: e.target.value})} min={new Date().toISOString().split('T')[0]} className="w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500" required /></div>
                  <div><label className="block font-semibold mb-2">Pickup Time</label><input type="time" value={formData.pickupTime} onChange={e => setFormData({...formData, pickupTime: e.target.value})} className="w-full px-4 py-3 border rounded-xl" required /></div>
                  <div><label className="block font-semibold mb-2">Return Date</label><input type="date" value={formData.returnDate} onChange={e => setFormData({...formData, returnDate: e.target.value})} min={formData.pickupDate} className="w-full px-4 py-3 border rounded-xl" required /></div>
                  <div><label className="block font-semibold mb-2">Return Time</label><input type="time" value={formData.returnTime} onChange={e => setFormData({...formData, returnTime: e.target.value})} className="w-full px-4 py-3 border rounded-xl" required /></div>
                </div>

                {discount.pct > 0 && <div className="mb-6 p-4 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl flex items-center gap-3"><FiPercent className="text-2xl" /><div><p className="font-bold">🎉 Early Booking Discount!</p><p className="text-sm">Save {discount.pct}% (₹{discount.amt.toFixed(0)}) by booking in advance</p></div></div>}

                {/* Delivery Options */}
                <div className="mb-6">
                  <h3 className="text-lg font-semibold mb-4 flex items-center gap-2"><FiTruck className="text-blue-600" /> Delivery Options</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <label className={`p-4 border-2 rounded-xl cursor-pointer ${formData.deliveryType === 'PICKUP' ? 'border-blue-500 bg-blue-50' : 'border-gray-200'}`}>
                      <input type="radio" checked={formData.deliveryType === 'PICKUP'} onChange={() => setFormData({...formData, deliveryType: 'PICKUP'})} className="sr-only" />
                      <div className="flex items-center gap-3"><FiMapPin className="text-2xl text-blue-600" /><div><p className="font-semibold">Self Pickup</p><p className="text-green-600 font-semibold">FREE</p></div></div>
                    </label>
                    <label className={`p-4 border-2 rounded-xl cursor-pointer ${formData.deliveryType === 'HOME_DELIVERY' ? 'border-blue-500 bg-blue-50' : 'border-gray-200'}`}>
                      <input type="radio" checked={formData.deliveryType === 'HOME_DELIVERY'} onChange={() => setFormData({...formData, deliveryType: 'HOME_DELIVERY'})} className="sr-only" />
                      <div className="flex items-center gap-3"><FiTruck className="text-2xl text-blue-600" /><div><p className="font-semibold">Home Delivery</p><p className="text-blue-600 font-semibold">₹{RATES.delivery}/km</p></div></div>
                    </label>
                  </div>
                  {formData.deliveryType === 'HOME_DELIVERY' && (
                    <div className="mt-4 space-y-4 bg-blue-50/50 p-5 rounded-xl border border-blue-100">
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1">City</label>
                        <input type="text" value={vehicle?.cityName || ''} disabled className="w-full px-4 py-3 bg-gray-100 border border-gray-200 rounded-xl text-gray-500 cursor-not-allowed font-medium" />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1">Select Landmark</label>
                        <select 
                          value={formData.deliveryLandmark} 
                          onChange={e => setFormData({...formData, deliveryLandmark: e.target.value})} 
                          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 bg-white" 
                          required
                        >
                          <option value="">-- Choose a nearby landmark --</option>
                          {(LANDMARKS_BY_CITY[vehicle?.cityName || ''] || DEFAULT_LANDMARKS).map(lm => (
                            <option key={lm} value={lm}>{lm}</option>
                          ))}
                          <option value="Other">Other</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1">Detailed Address</label>
                        <textarea 
                          value={formData.deliveryAddress} 
                          onChange={e => setFormData({...formData, deliveryAddress: e.target.value})} 
                          placeholder="House/Flat No, Street, Area" 
                          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500" 
                          rows={2} 
                          required 
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1">Distance from Landmark (km)</label>
                        <div className="relative">
                          <input 
                            type="number" 
                            value={formData.deliveryDistance || ''} 
                            onChange={e => setFormData({...formData, deliveryDistance: parseInt(e.target.value) || 0})} 
                            placeholder="e.g. 5" 
                            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 disabled:opacity-50 pl-16" 
                            min="1" 
                            required 
                          />
                          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 font-medium">km</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Steps indicator can be added here */}


                <button type="submit" className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold py-4 rounded-xl hover:from-blue-700 hover:to-indigo-700 transition shadow-lg">
                  Next: Options & Offers →
                </button>
              </form>
            </div>
          </div>

          {/* Summary */}
          <div className="bg-white rounded-2xl shadow-lg p-6 h-fit sticky top-8">
            <h3 className="text-xl font-bold mb-6">Booking Summary</h3>
            <div className="space-y-4 text-sm">
              <div className="flex justify-between"><span>Vehicle</span><span className="font-semibold">{vehicle.make} {vehicle.model}</span></div>
              {subscriptionPlan ? (
                <>
                  <div className="flex justify-between"><span>Subscription Plan</span><span className="font-semibold">{subscriptionPlan.name}</span></div>
                  <div className="flex justify-between"><span>Plan Price</span><span className="font-semibold">₹{subscriptionPlan.price.toLocaleString()}</span></div>
                </>
              ) : (
                <>
                  <div className="flex justify-between"><span>Daily Rate</span><span className="font-semibold">₹{vehicle.dailyRate}</span></div>
                  <div className="flex justify-between"><span>Duration</span><span className="font-semibold">{days} day{days > 1 ? 's' : ''}</span></div>
                </>
              )}
              <div className="flex justify-between"><span>Subtotal</span><span className="font-semibold">₹{(subscriptionPlan ? subscriptionPlan.price : vehicle.dailyRate * days).toLocaleString()}</span></div>
              {!subscriptionPlan && discount.pct > 0 && <div className="flex justify-between text-green-600"><span>Early Booking ({discount.pct}%)</span><span>-₹{discount.amt.toFixed(0)}</span></div>}
              {deliveryFee > 0 && <div className="flex justify-between"><span>Delivery</span><span>+₹{deliveryFee}</span></div>}
              <div className="border-t pt-4"><div className="flex justify-between"><span className="text-lg font-bold">Total Est.</span><span className="text-2xl font-bold text-blue-600">₹{subtotal.toLocaleString()}</span></div></div>
            </div>
            <div className="mt-6 pt-6 border-t"><h4 className="font-semibold mb-3">Included</h4><ul className="space-y-2 text-sm text-gray-600"><li>✅ Free Cancellation (24hrs)</li><li>✅ Unlimited Kilometers</li><li>✅ 24/7 Roadside Assistance</li></ul></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookingForm;
