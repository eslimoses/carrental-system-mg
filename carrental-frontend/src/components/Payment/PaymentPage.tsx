import React, { useState } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { FiCreditCard, FiCheckCircle, FiArrowLeft, FiShield, FiFileText } from 'react-icons/fi';
import { usePayments, useBookings, useAuth } from '../../hooks';
import api from '../../api/api';

const PaymentPage: React.FC = () => {
  const { bookingId } = useParams<{ bookingId: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const stateData = location.state as any;
  const { user } = useAuth();

  const { getBookingById } = useBookings();
  const bookingQuery = getBookingById(parseInt(bookingId || '0'));
  const booking = bookingQuery.data || stateData?.booking;
  const loading = bookingQuery.isLoading && !booking;

  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [transactionId, setTransactionId] = useState('');

  const [paymentMethod, setPaymentMethod] = useState('CREDIT_CARD');
  const [showInvoice, setShowInvoice] = useState(false);

  const { processFullPayment, processAdvancePayment } = usePayments();
  const processing = processFullPayment.isLoading || processAdvancePayment.isLoading;

  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handlePayment = async () => {
    if (!booking) return;

    setError('');
    
    // Use Razorpay for Online methods (Card & UPI)
    const isOnline = paymentMethod === 'CREDIT_CARD' || paymentMethod === 'DEBIT_CARD' || paymentMethod === 'UPI';

    if (isOnline) {
      const res = await loadRazorpayScript();
      if (!res) {
        setError('Razorpay SDK failed to load. Are you online?');
        return;
      }

      try {
        const amount = booking.advanceAmount || (booking.totalAmount / 3);
        const [orderResponse, keyResponse] = await Promise.all([
          api.post('/payments/create-order', {
            amount: amount,
            bookingNumber: booking.bookingNumber || `BK-${booking.id}`
          }),
          api.get('/payments/razorpay-key')
        ]);

        const { orderId } = orderResponse.data;
        const razorpayKey = keyResponse.data.keyId;

        const options = {
          key: razorpayKey,
          amount: Math.round(amount * 100),
          currency: 'INR',
          name: 'MotoGlide Car Rental',
          description: `Advance Payment for Booking #${booking.bookingNumber}`,
          order_id: orderId,
          handler: async (response: any) => {
            try {
              const verifyRes = await api.post('/payments/verify-signature', {
                orderId: response.razorpay_order_id,
                paymentId: response.razorpay_payment_id,
                signature: response.razorpay_signature
              });

              if (verifyRes.data.status === 'SUCCESS') {
                finalizeBooking('RAZORPAY', response.razorpay_payment_id);
              } else {
                setError('Payment signature verification failed.');
              }
            } catch (err) {
              setError('Payment verification failed.');
            }
          },
          prefill: {
            name: `${user?.firstName} ${user?.lastName}`,
            email: user?.email,
            contact: user?.phoneNumber
          },
          theme: { color: '#2563EB' }
        };

        const razorpay = new (window as any).Razorpay(options);
        razorpay.open();
      } catch (err: any) {
        setError('Error initiating payment: ' + (err.response?.data?.message || err.message));
      }
    } else {
      finalizeBooking(paymentMethod);
    }
  };

  const finalizeBooking = (method: string, txnId?: string) => {
    processAdvancePayment.mutate(
      { 
        bookingId: booking.id, 
        paymentMethod: method,
        transactionId: txnId || 'DIRECT-' + Date.now()
      },
      {
        onSuccess: (data: any) => {
          setTransactionId(data.transactionId || txnId || 'SUCCESS');
          setSuccess(true);
        },
        onError: (err: any) => {
          console.error('Finalization error:', err);
          setError('Booking confirmation failed. Please contact support.');
        }
      }
    );
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100"><div className="animate-spin rounded-full h-16 w-16 border-t-4 border-blue-600"></div></div>;

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-6">
        <div className="bg-white rounded-3xl shadow-2xl p-10 max-w-lg w-full text-center">
          <div className="w-24 h-24 mx-auto mb-6 bg-green-100 rounded-full flex items-center justify-center"><FiCheckCircle className="text-green-600 text-5xl" /></div>
          <h1 className="text-3xl font-bold text-green-700 mb-3">Payment Successful! 🎉</h1>
          <p className="text-gray-600 mb-6">Your booking has been confirmed. A confirmation email has been sent.</p>
          
          <div className="bg-gray-50 rounded-2xl p-6 mb-6 text-left space-y-3">
            <div className="flex justify-between"><span className="text-gray-500">Transaction ID</span><span className="font-semibold text-xs truncate max-w-[150px]">{transactionId}</span></div>
            <div className="flex justify-between"><span className="text-gray-500">Booking Number</span><span className="font-semibold">{booking?.bookingNumber || `BK-${booking?.id}`}</span></div>
            <div className="flex justify-between"><span className="text-gray-500">Amount Paid</span><span className="font-bold text-green-600">₹{(booking?.advanceAmount || (booking?.totalAmount / 3))?.toLocaleString()}</span></div>
            <div className="flex justify-between"><span className="text-gray-500">Total Amount</span><span className="font-bold">₹{booking?.totalAmount?.toLocaleString()}</span></div>
            <div className="flex justify-between"><span className="text-gray-500">Payment Method</span><span className="font-semibold uppercase text-xs">{paymentMethod.replace('_', ' ')}</span></div>
          </div>
          
          <div className="flex flex-col gap-3">
            <button onClick={() => setShowInvoice(true)} className="flex-1 bg-white border-2 border-blue-600 text-blue-600 font-bold py-3 rounded-xl hover:bg-blue-50 flex items-center justify-center gap-2 transition">
              <FiFileText /> View Invoice
            </button>
            <div className="flex gap-3">
              <button onClick={() => navigate('/dashboard')} className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold py-3 rounded-xl hover:from-blue-700 hover:to-indigo-700 transition shadow-md">My Bookings</button>
              <button onClick={() => navigate('/')} className="flex-1 bg-gray-200 text-gray-800 font-bold py-3 rounded-xl hover:bg-gray-300 transition">Back to Home</button>
            </div>
          </div>
        </div>

        {/* Invoice Modal */}
        {showInvoice && booking && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl scale-in-center">
              <div className="p-8">
                <div className="flex justify-between items-start mb-8">
                  <div>
                    <h2 className="text-3xl font-black text-blue-600 italic">MOTOGLIDE</h2>
                    <p className="text-gray-500 text-xs">Premium Car Rental Solution</p>
                  </div>
                  <div className="text-right">
                    <h3 className="text-xl font-bold text-gray-800">INVOICE</h3>
                    <p className="text-gray-500 text-sm">#{booking.bookingNumber || `BK-${booking.id}`}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-8 mb-8 pb-8 border-b border-gray-100">
                  <div>
                    <p className="text-xs font-bold text-gray-400 uppercase mb-2">Billed To</p>
                    <p className="font-bold text-gray-800">{user?.firstName} {user?.lastName}</p>
                    <p className="text-gray-500 text-xs">{user?.email}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs font-bold text-gray-400 uppercase mb-2">Details</p>
                    <p className="text-gray-500 text-xs">Date: {new Date().toLocaleDateString()}</p>
                    <p className="text-gray-500 text-xs">Method: {paymentMethod.replace('_', ' ')}</p>
                  </div>
                </div>

                <div className="mb-8">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b-2 border-gray-100 text-gray-400 uppercase text-xs">
                        <th className="text-left pb-4">Description</th>
                        <th className="text-center pb-4">Qty</th>
                        <th className="text-right pb-4">Amount</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      <tr>
                        <td className="py-4">
                          <p className="font-bold text-gray-800">{stateData?.vehicle ? `${stateData.vehicle.make} ${stateData.vehicle.model}` : 'Premium Rental Car'}</p>
                          <p className="text-gray-400 text-[10px]">{booking.pickupDate} to {booking.returnDate}</p>
                        </td>
                        <td className="text-center py-4">1</td>
                        <td className="text-right py-4 font-semibold">₹{(booking.rentalCost || 0).toLocaleString()}</td>
                      </tr>
                      {booking.deliveryFee > 0 && (
                        <tr>
                          <td className="py-4 text-gray-600">Home Delivery Charge</td>
                          <td className="text-center py-4">1</td>
                          <td className="text-right py-4 font-semibold">₹{booking.deliveryFee.toLocaleString()}</td>
                        </tr>
                      )}
                      {booking.extraCharges > 0 && (
                        <tr>
                          <td className="py-4 text-gray-600">Insurance & Extras</td>
                          <td className="text-center py-4">1</td>
                          <td className="text-right py-4 font-semibold">₹{booking.extraCharges.toLocaleString()}</td>
                        </tr>
                      )}
                      {booking.discountAmount > 0 && (
                        <tr>
                          <td className="py-4 text-green-600 font-semibold italic">Loyalty/Promo Discount</td>
                          <td className="text-center py-4">- </td>
                          <td className="text-right py-4 font-semibold text-green-600">-₹{booking.discountAmount.toLocaleString()}</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>

                <div className="flex justify-end mb-8 pt-8 border-t-2 border-gray-100">
                  <div className="w-1/2 space-y-3">
                    <div className="flex justify-between text-gray-600">
                      <span>Total Invoice</span>
                      <span className="font-bold">₹{booking.totalAmount.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-green-600 font-bold bg-green-50 p-2 rounded-lg">
                      <span>Advance Received</span>
                      <span>₹{(booking.advanceAmount || (booking.totalAmount / 3)).toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-gray-800 font-black text-xl border-t-2 border-gray-100 pt-3">
                      <span>Balance Due</span>
                      <span>₹{(booking.totalAmount - (booking.advanceAmount || (booking.totalAmount / 3))).toLocaleString()}</span>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-50 p-6 rounded-2xl flex items-center justify-between">
                  <p className="text-[10px] text-gray-400 max-w-[70%]">
                    This is a secure electronic invoice from MotoGlide. No signature required.
                    Questions? Contact support@motoglide.com
                  </p>
                  <button 
                    onClick={() => setShowInvoice(false)}
                    className="bg-gray-800 text-white px-6 py-2 rounded-xl font-bold text-sm hover:bg-gray-900 transition"
                  >
                    Done
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12">
      <div className="max-w-4xl mx-auto px-4">
        <button onClick={() => navigate(-1)} className="mb-6 text-gray-600 hover:text-gray-900 flex items-center gap-2 font-medium transition"><FiArrowLeft /> Back to Checkout</button>
        {error && <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 text-red-700 rounded-lg shadow-sm font-medium animate-pulse">{error}</div>}
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 bg-white rounded-3xl shadow-xl p-10">
            <h2 className="text-3xl font-black text-gray-800 mb-8 flex items-center gap-3">
              <div className="bg-blue-600 p-2 rounded-lg"><FiCreditCard className="text-white" /></div> 
              Secure Payment
            </h2>
            
            <div className="mb-10">
              <h3 className="font-bold text-gray-400 uppercase text-xs tracking-widest mb-4">Choose Your Method</h3>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                  {value: 'CREDIT_CARD', label: '💳 Credit Card'}, 
                  {value: 'DEBIT_CARD', label: '💳 Debit Card'}, 
                  {value: 'UPI', label: '📱 UPI'}, 
                  {value: 'CASH', label: '💵 Cash'}
                ].map(m => (
                  <label key={m.value} className={`p-4 border-2 rounded-2xl cursor-pointer text-center transition-all ${paymentMethod === m.value ? 'border-blue-600 bg-blue-50/50 ring-4 ring-blue-50' : 'border-gray-100 hover:border-gray-300'}`}>
                    <input type="radio" value={m.value} checked={paymentMethod === m.value} onChange={() => setPaymentMethod(m.value)} className="sr-only" />
                    <span className="text-sm font-black whitespace-nowrap">{m.label}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Hint for Online Methods */}
            {(paymentMethod !== 'CASH') && (
              <div className="p-8 bg-blue-50/50 rounded-2xl border border-blue-100 mb-10 text-center">
                <p className="text-blue-800 font-bold text-lg mb-2">Proceed with Razorpay</p>
                <p className="text-blue-600/70 text-sm">You will be redirected to our secure payment partner to complete the transaction.</p>
              </div>
            )}

            {paymentMethod === 'CASH' && (
              <div className="p-8 bg-amber-50 rounded-2xl border border-amber-100 mb-10 text-center">
                <p className="text-amber-800 font-bold text-lg mb-2">Pay at Pickup</p>
                <p className="text-amber-700/70 text-sm italic">"I prefer to pay in cash when I receive the keys."</p>
                <div className="mt-4 text-[10px] text-amber-600 font-bold uppercase tracking-widest leading-relaxed">
                  Note: A valid ID and advance confirmation will be required at the counter.
                </div>
              </div>
            )}

            <div className="flex items-center gap-3 text-sm text-green-600 font-bold bg-green-50 p-4 rounded-xl mb-10">
              <FiShield /> <span>End-to-end encrypted • Zero data storage</span>
            </div>

            <button 
              onClick={handlePayment} 
              disabled={processing} 
              className="w-full bg-gradient-to-r from-blue-600 to-indigo-700 text-white font-black py-5 rounded-2xl hover:scale-[1.02] active:scale-95 disabled:opacity-50 shadow-xl shadow-blue-200 transition-all text-xl"
            >
              {processing ? 'Processing...' : `Pay ₹${(booking?.advanceAmount || (booking?.totalAmount / 3))?.toLocaleString()} (Confirm)`}
            </button>
          </div>

          {/* Order Summary */}
          <div className="bg-white rounded-2xl shadow-lg p-6 h-fit">
            <h3 className="text-xl font-bold mb-4">Order Summary</h3>
            {booking && <div className="space-y-3 text-sm">
              <div className="flex justify-between"><span>Booking #</span><span className="font-semibold">{booking.bookingNumber || `BK-${booking.id}`}</span></div>
              <div className="flex justify-between"><span>Vehicle</span><span className="font-semibold">{stateData?.vehicle ? `${stateData.vehicle.make} ${stateData.vehicle.model}` : (booking.vehicleName || '-')}</span></div>
              <div className="flex justify-between"><span>Pickup</span><span className="font-semibold">{booking.pickupDate}</span></div>
              <div className="flex justify-between"><span>Return</span><span className="font-semibold">{booking.returnDate}</span></div>
              {booking.deliveryFee > 0 && <div className="flex justify-between"><span>Delivery Fee</span><span>₹{booking.deliveryFee?.toLocaleString()}</span></div>}
              {booking.extraCharges > 0 && <div className="flex justify-between"><span>Extras</span><span>₹{booking.extraCharges?.toLocaleString()}</span></div>}
              {booking.discountAmount > 0 && <div className="flex justify-between text-green-600"><span>Discount ({booking.discountPercentage}%)</span><span>-₹{booking.discountAmount?.toLocaleString()}</span></div>}
              <div className="border-t pt-3">
                <div className="flex justify-between font-bold"><span>Total</span><span className="text-blue-600">₹{booking.totalAmount?.toLocaleString()}</span></div>
                <div className="flex justify-between text-green-700 mt-2"><span>Advance (1/3)</span><span className="font-bold">₹{(booking.advanceAmount || booking.totalAmount / 3)?.toLocaleString()}</span></div>
              </div>
            </div>}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentPage;
