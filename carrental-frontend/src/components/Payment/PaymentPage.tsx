import React, { useState } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { FiCreditCard, FiCheckCircle, FiArrowLeft, FiShield, FiFileText } from 'react-icons/fi';
import { usePayments, useBookings, useAuth } from '../../hooks';
import axios from 'axios';

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
  const [cardNumber, setCardNumber] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [cvv, setCvv] = useState('');
  const [upiId, setUpiId] = useState('');
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
    
    // Check if we should use Razorpay (only for Credit/Debit Card)
    const isCard = paymentMethod === 'CREDIT_CARD' || paymentMethod === 'DEBIT_CARD';

    if (isCard) {
      // 1. Load Razorpay script
      const res = await loadRazorpayScript();
      if (!res) {
        setError('Razorpay SDK failed to load. Are you online?');
        return;
      }

      try {
        // 2. Create Order in Backend & Fetch Key
        const amount = booking.advanceAmount || booking.totalAmount / 3;
        const [orderResponse, keyResponse] = await Promise.all([
          axios.post('https://carrental-system-mg-production.up.railway.app/api/payments/create-order', {
            amount: amount,
            bookingNumber: booking.bookingNumber || `BK-${booking.id}`
          }),
          axios.get('https://carrental-system-mg-production.up.railway.app/api/payments/razorpay-key')
        ]);

        const { orderId } = orderResponse.data;
        const razorpayKey = keyResponse.data.keyId;

        // 3. Open Razorpay Checkout
        const options = {
          key: razorpayKey,
          amount: amount * 100,
          currency: 'INR',
          name: 'MotoGlide Car Rental',
          description: `Advance Payment for Booking #${booking.bookingNumber}`,
          order_id: orderId,
          handler: async (response: any) => {
            // 4. Verify Payment in Backend
            try {
              const verifyRes = await axios.post('https://carrental-system-mg-production.up.railway.app/api/payments/verify-signature', {
                orderId: response.razorpay_order_id,
                paymentId: response.razorpay_payment_id,
                signature: response.razorpay_signature
              });

              if (verifyRes.data.status === 'SUCCESS') {
                finalizeBooking('RAZORPAY', response.razorpay_payment_id);
              } else {
                setError('Payment signature verification failed. Please contact support.');
              }
            } catch (err) {
              setError('Payment verification failed. Please contact support with payment ID: ' + response.razorpay_payment_id);
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
      // Direct Payment for UPI or Cash
      finalizeBooking(paymentMethod);
    }
  };

  const finalizeBooking = (method: string, txnId?: string) => {
    processAdvancePayment.mutate(
      { 
        bookingId: booking.id, 
        paymentMethod: method,
        transactionId: txnId
      },
      {
        onSuccess: (data: any) => {
          setTransactionId(data.transactionId || txnId || 'DIRECT-PAY');
          setSuccess(true);
          // The dashboards will automatically reflect this because processAdvancePayment 
          // triggers the Backend to update booking status to 'CONFIRMED'.
        },
        onError: (err: any) => {
          setError('Booking update failed. Please contact support.');
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
            <div className="flex justify-between"><span className="text-gray-500">Transaction ID</span><span className="font-semibold text-sm">{transactionId}</span></div>
            <div className="flex justify-between"><span className="text-gray-500">Booking Number</span><span className="font-semibold">{booking?.bookingNumber || `BK-${booking?.id}`}</span></div>
            <div className="flex justify-between"><span className="text-gray-500">Amount Paid</span><span className="font-bold text-green-600">₹{(booking?.advanceAmount || booking?.totalAmount / 3)?.toLocaleString()}</span></div>
            <div className="flex justify-between"><span className="text-gray-500">Total Amount</span><span className="font-bold">₹{booking?.totalAmount?.toLocaleString()}</span></div>
            <div className="flex justify-between"><span className="text-gray-500">Payment Method</span><span className="font-semibold">{paymentMethod.replace('_', ' ')}</span></div>
          </div>
          
          <div className="flex flex-col gap-3">
            <button onClick={() => setShowInvoice(true)} className="flex-1 bg-white border-2 border-blue-600 text-blue-600 font-bold py-3 rounded-xl hover:bg-blue-50 flex items-center justify-center gap-2">
              <FiFileText /> View Invoice
            </button>
            <div className="flex gap-3">
              <button onClick={() => navigate('/dashboard')} className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold py-3 rounded-xl hover:from-blue-700 hover:to-indigo-700">Go to My Bookings</button>
              <button onClick={() => navigate('/')} className="flex-1 bg-gray-200 text-gray-800 font-bold py-3 rounded-xl hover:bg-gray-300">Back to Home</button>
            </div>
          </div>
        </div>

        {/* Invoice Modal */}
        {showInvoice && booking && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
              <div className="p-8">
                <div className="flex justify-between items-start mb-8">
                  <div>
                    <h2 className="text-3xl font-black text-blue-600 italic">CARRENTAL</h2>
                    <p className="text-gray-500 text-sm">Premium Car Rental Service</p>
                  </div>
                  <div className="text-right">
                    <h3 className="text-xl font-bold text-gray-800">INVOICE</h3>
                    <p className="text-gray-500">#{booking.bookingNumber || `BK-${booking.id}`}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-8 mb-8 pb-8 border-b border-gray-100">
                  <div>
                    <p className="text-xs font-bold text-gray-400 uppercase mb-2">Billed To</p>
                    <p className="font-bold text-gray-800">{user?.firstName} {user?.lastName}</p>
                    <p className="text-gray-500 text-sm">{user?.email}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs font-bold text-gray-400 uppercase mb-2">Details</p>
                    <p className="text-gray-500 text-sm">Date: {new Date().toLocaleDateString()}</p>
                    <p className="text-gray-500 text-sm">Status: Paid (Advance)</p>
                  </div>
                </div>

                <div className="mb-8">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b-2 border-gray-100 text-gray-400 uppercase text-xs">
                        <th className="text-left pb-4">Description</th>
                        <th className="text-center pb-4">Quantity</th>
                        <th className="text-right pb-4">Amount</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      <tr>
                        <td className="py-4">
                          <p className="font-bold text-gray-800">{stateData?.vehicle ? `${stateData.vehicle.make} ${stateData.vehicle.model}` : 'Vehicle Rental'}</p>
                          <p className="text-gray-400 text-xs">{booking.pickupDate} to {booking.returnDate}</p>
                        </td>
                        <td className="text-center py-4">{booking.days || 1} Days</td>
                        <td className="text-right py-4 font-semibold">₹{(booking.rentalCost || 0).toLocaleString()}</td>
                      </tr>
                      {booking.deliveryFee > 0 && (
                        <tr>
                          <td className="py-4 text-gray-600">Delivery Charges</td>
                          <td className="text-center py-4">1</td>
                          <td className="text-right py-4 font-semibold">₹{booking.deliveryFee.toLocaleString()}</td>
                        </tr>
                      )}
                      {booking.extraCharges > 0 && (
                        <tr>
                          <td className="py-4 text-gray-600">Extras & Insurance</td>
                          <td className="text-center py-4">1</td>
                          <td className="text-right py-4 font-semibold">₹{booking.extraCharges.toLocaleString()}</td>
                        </tr>
                      )}
                      {booking.discountAmount > 0 && (
                        <tr>
                          <td className="py-4 text-green-600 font-semibold">Discount ({booking.discountPercentage}%)</td>
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
                      <span>Subtotal</span>
                      <span className="font-bold">₹{booking.totalAmount.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-green-600 font-bold bg-green-50 p-2 rounded-lg">
                      <span>Amount Paid</span>
                      <span>₹{(booking.advanceAmount || booking.totalAmount / 3).toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-gray-800 font-black text-xl border-t-2 border-gray-100 pt-3">
                      <span>Total Due</span>
                      <span>₹{(booking.totalAmount - (booking.advanceAmount || booking.totalAmount / 3)).toLocaleString()}</span>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-50 p-6 rounded-2xl flex items-center justify-between">
                  <p className="text-xs text-gray-400 max-w-[70%]">
                    This is a computer generated invoice and does not require a physical signature.
                    For any queries, please contact support@carrental.com
                  </p>
                  <button 
                    onClick={() => setShowInvoice(false)}
                    className="bg-gray-800 text-white px-6 py-2 rounded-xl font-bold text-sm"
                  >
                    Close
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <button onClick={() => navigate(-1)} className="mb-6 text-gray-600 hover:text-gray-900 flex items-center gap-2"><FiArrowLeft /> Back</button>
        {error && <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg">{error}</div>}
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 bg-white rounded-2xl shadow-lg p-8">
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-2"><FiCreditCard className="text-blue-600" /> Payment Details</h2>
            
            {/* Payment Method */}
            <div className="mb-6">
              <h3 className="font-semibold mb-4">Select Payment Method</h3>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                {[{value: 'CREDIT_CARD', label: '💳 Credit Card'}, {value: 'DEBIT_CARD', label: '💳 Debit Card'}, {value: 'UPI', label: '📱 UPI'}, {value: 'CASH', label: '💵 Cash'}].map(m => (
                  <label key={m.value} className={`p-3 border-2 rounded-xl cursor-pointer text-center ${paymentMethod === m.value ? 'border-blue-500 bg-blue-50' : 'border-gray-200'}`}>
                    <input type="radio" value={m.value} checked={paymentMethod === m.value} onChange={() => setPaymentMethod(m.value)} className="sr-only" />
                    <span className="text-sm font-semibold">{m.label}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Card Details */}
            {(paymentMethod === 'CREDIT_CARD' || paymentMethod === 'DEBIT_CARD') && (
              <div className="space-y-4 mb-6">
                <div><label className="block font-semibold mb-2">Card Number</label><input type="text" value={cardNumber} onChange={e => setCardNumber(e.target.value.replace(/\D/g, '').slice(0, 16))} placeholder="1234 5678 9012 3456" className="w-full px-4 py-3 border rounded-xl" /></div>
                <div className="grid grid-cols-2 gap-4">
                  <div><label className="block font-semibold mb-2">Expiry Date</label><input type="text" value={expiryDate} onChange={e => setExpiryDate(e.target.value)} placeholder="MM/YY" className="w-full px-4 py-3 border rounded-xl" /></div>
                  <div><label className="block font-semibold mb-2">CVV</label><input type="password" value={cvv} onChange={e => setCvv(e.target.value.slice(0, 3))} placeholder="***" className="w-full px-4 py-3 border rounded-xl" /></div>
                </div>
              </div>
            )}

            {paymentMethod === 'UPI' && (
              <div className="mb-6"><label className="block font-semibold mb-2">UPI ID</label><input type="text" value={upiId} onChange={e => setUpiId(e.target.value)} placeholder="yourname@paytm" className="w-full px-4 py-3 border rounded-xl" /></div>
            )}

            {paymentMethod === 'CASH' && <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-xl text-yellow-800 mb-6">💡 You'll pay cash at the pickup point. A hold amount may be pre-authorized on your card for security.</div>}

            <div className="flex items-center gap-2 text-sm text-gray-500 mb-6"><FiShield className="text-green-600" /> <span>100% Secure Payment. Your data is encrypted.</span></div>

            <button onClick={handlePayment} disabled={processing} className="w-full bg-gradient-to-r from-green-600 to-emerald-600 text-white font-bold py-4 rounded-xl hover:from-green-700 hover:to-emerald-700 disabled:opacity-50 shadow-lg transition">
              {processing ? 'Processing Payment...' : `Pay ₹${(booking?.advanceAmount || booking?.totalAmount / 3)?.toLocaleString()} (Advance)`}
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
