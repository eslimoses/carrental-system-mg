import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { FiCreditCard, FiSmartphone, FiDollarSign, FiCheck, FiArrowLeft } from 'react-icons/fi';
import { FaRupeeSign } from 'react-icons/fa';

const LOGO_URL = 'https://st3.depositphotos.com/22052918/32067/v/450/depositphotos_320674452-stock-illustration-letter-mg-slice-colorful-logo.jpg';

interface BookingDetails {
  carName: string;
  carImage: string;
  carBrand: string;
  pickupDate: string;
  dropoffDate: string;
  totalDays: number;
  pricePerDay: number;
  totalAmount: number;
}

const Payment: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [paymentMethod, setPaymentMethod] = useState('');
  const [cardType, setCardType] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [bookingDetails, setBookingDetails] = useState<BookingDetails | null>(null);

  // Form states
  const [cardNumber, setCardNumber] = useState('');
  const [cardName, setCardName] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvv, setCvv] = useState('');
  const [upiId, setUpiId] = useState('');

  useEffect(() => {
    // Get booking details from location state or localStorage
    const details = location.state?.bookingDetails || JSON.parse(localStorage.getItem('pendingPayment') || 'null');
    if (details) {
      setBookingDetails(details);
    } else {
      // Demo booking details
      const selectedCar = JSON.parse(localStorage.getItem('selectedCar') || '{}');
      setBookingDetails({
        carName: selectedCar.name || 'Toyota Camry',
        carImage: selectedCar.image || 'https://imgd.aeplcdn.com/664x374/n/cw/ec/110233/camry-exterior-right-front-three-quarter-2.jpeg',
        carBrand: selectedCar.brand || 'Toyota',
        pickupDate: localStorage.getItem('pickupDate') || new Date().toISOString().split('T')[0],
        dropoffDate: localStorage.getItem('dropoffDate') || new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        totalDays: 3,
        pricePerDay: selectedCar.price || 2500,
        totalAmount: (selectedCar.price || 2500) * 3
      });
    }
  }, [location.state]);

  const handlePayment = async () => {
    if (!paymentMethod) {
      alert('Please select a payment method');
      return;
    }

    if (paymentMethod === 'card' && !cardType) {
      alert('Please select card type (Debit/Credit)');
      return;
    }

    if (paymentMethod === 'card' && (!cardNumber || !cardName || !expiry || !cvv)) {
      alert('Please fill in all card details');
      return;
    }

    if (paymentMethod === 'upi' && !upiId) {
      alert('Please enter UPI ID');
      return;
    }

    setLoading(true);

    try {
      // Get current user from localStorage
      const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
      const token = localStorage.getItem('authToken');
      
      if (!currentUser.id || !token) {
        alert('Please login to continue');
        return;
      }

      // Step 1: Create booking in backend
      const bookingPayload = {
        vehicleId: JSON.parse(localStorage.getItem('selectedCar') || '{}').id || 1,
        customerId: currentUser.id,
        pickupDate: bookingDetails?.pickupDate,
        dropoffDate: bookingDetails?.dropoffDate,
        totalAmount: bookingDetails?.totalAmount,
        status: 'PENDING'
      };

      const bookingResponse = await fetch(`${import.meta.env.VITE_API_URL}/bookings`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(bookingPayload)
      });

      if (!bookingResponse.ok) {
        throw new Error('Failed to create booking');
      }

      const createdBooking = await bookingResponse.json();
      const bookingId = createdBooking.id;

      // Simulate payment gateway processing
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Step 2: Process payment through backend API
      const paymentPayload = {
        paymentMethod: paymentMethod === 'card' ? `${cardType.toUpperCase()}_CARD` : paymentMethod.toUpperCase(),
        amount: bookingDetails?.totalAmount || 0,
        transactionId: `TXN_${Date.now()}`,
        status: 'SUCCESS'
      };

      const paymentResponse = await fetch(`${import.meta.env.VITE_API_URL}/payments/advance/${bookingId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(paymentPayload)
      });

      if (!paymentResponse.ok) {
        throw new Error('Payment processing failed');
      }

      const payment = await paymentResponse.json();

      // Step 3: Confirm the booking
      const confirmResponse = await fetch(`${import.meta.env.VITE_API_URL}/bookings/${bookingId}/confirm`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      if (!confirmResponse.ok) {
        throw new Error('Failed to confirm booking');
      }

      // Clear pending payment from localStorage
      localStorage.removeItem('pendingPayment');
      localStorage.removeItem('pendingBooking');

      setLoading(false);
      setSuccess(true);

      // Redirect to dashboard after 3 seconds
      setTimeout(() => {
        navigate('/dashboard');
      }, 3000);
    } catch (error: any) {
      console.error('Payment failed:', error);
      alert('Payment failed: ' + (error.message || 'Please try again'));
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div style={{ minHeight: '100vh', backgroundColor: '#0f1629', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center', padding: '60px', backgroundColor: '#1a1f3a', borderRadius: '20px', maxWidth: '500px' }}>
          <div style={{ 
            width: '100px', 
            height: '100px', 
            borderRadius: '50%', 
            backgroundColor: '#22c55e', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            margin: '0 auto 30px'
          }}>
            <FiCheck size={50} color="white" />
          </div>
          <h1 style={{ color: '#22c55e', fontSize: '32px', marginBottom: '15px' }}>Payment Successful!</h1>
          <p style={{ color: '#b0b8c8', fontSize: '18px', marginBottom: '10px' }}>
            Your booking has been confirmed.
          </p>
          <p style={{ color: '#d4a574', fontSize: '24px', fontWeight: 'bold' }}>
            ₹{bookingDetails?.totalAmount?.toLocaleString()}
          </p>
          <p style={{ color: '#666', marginTop: '20px' }}>Redirecting to dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#0f1629', padding: '30px 20px' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: '30px' }}>
          <button 
            onClick={() => navigate(-1)}
            style={{ 
              background: 'none', 
              border: 'none', 
              color: '#d4a574', 
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              fontSize: '16px'
            }}
          >
            <FiArrowLeft /> Back
          </button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 400px', gap: '30px' }}>
          {/* Payment Methods */}
          <div>
            <h1 style={{ color: '#d4a574', fontSize: '32px', marginBottom: '30px' }}>Payment</h1>

            {/* Payment Method Selection */}
            <div style={{ backgroundColor: '#1a1f3a', borderRadius: '16px', padding: '30px', marginBottom: '20px' }}>
              <h2 style={{ color: '#fff', fontSize: '20px', marginBottom: '20px' }}>Select Payment Method</h2>
              
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '15px' }}>
                {/* Card Option */}
                <div 
                  onClick={() => setPaymentMethod('card')}
                  style={{ 
                    padding: '25px 20px',
                    backgroundColor: paymentMethod === 'card' ? 'rgba(212, 165, 116, 0.2)' : '#0f1629',
                    border: paymentMethod === 'card' ? '2px solid #d4a574' : '2px solid #333',
                    borderRadius: '12px',
                    cursor: 'pointer',
                    textAlign: 'center',
                    transition: 'all 0.3s'
                  }}
                >
                  <FiCreditCard size={40} color={paymentMethod === 'card' ? '#d4a574' : '#666'} />
                  <p style={{ color: paymentMethod === 'card' ? '#d4a574' : '#b0b8c8', marginTop: '10px', fontWeight: '600' }}>Card</p>
                </div>

                {/* UPI Option */}
                <div 
                  onClick={() => setPaymentMethod('upi')}
                  style={{ 
                    padding: '25px 20px',
                    backgroundColor: paymentMethod === 'upi' ? 'rgba(212, 165, 116, 0.2)' : '#0f1629',
                    border: paymentMethod === 'upi' ? '2px solid #d4a574' : '2px solid #333',
                    borderRadius: '12px',
                    cursor: 'pointer',
                    textAlign: 'center',
                    transition: 'all 0.3s'
                  }}
                >
                  <FiSmartphone size={40} color={paymentMethod === 'upi' ? '#d4a574' : '#666'} />
                  <p style={{ color: paymentMethod === 'upi' ? '#d4a574' : '#b0b8c8', marginTop: '10px', fontWeight: '600' }}>UPI</p>
                </div>

                {/* Cash Option */}
                <div 
                  onClick={() => setPaymentMethod('cash')}
                  style={{ 
                    padding: '25px 20px',
                    backgroundColor: paymentMethod === 'cash' ? 'rgba(212, 165, 116, 0.2)' : '#0f1629',
                    border: paymentMethod === 'cash' ? '2px solid #d4a574' : '2px solid #333',
                    borderRadius: '12px',
                    cursor: 'pointer',
                    textAlign: 'center',
                    transition: 'all 0.3s'
                  }}
                >
                  <FaRupeeSign size={40} color={paymentMethod === 'cash' ? '#d4a574' : '#666'} />
                  <p style={{ color: paymentMethod === 'cash' ? '#d4a574' : '#b0b8c8', marginTop: '10px', fontWeight: '600' }}>Cash</p>
                </div>
              </div>
            </div>

            {/* Card Details */}
            {paymentMethod === 'card' && (
              <div style={{ backgroundColor: '#1a1f3a', borderRadius: '16px', padding: '30px', marginBottom: '20px' }}>
                <h2 style={{ color: '#fff', fontSize: '20px', marginBottom: '20px' }}>Card Details</h2>
                
                {/* Card Type */}
                <div style={{ marginBottom: '20px' }}>
                  <label style={{ color: '#b0b8c8', display: 'block', marginBottom: '10px' }}>Card Type</label>
                  <div style={{ display: 'flex', gap: '15px' }}>
                    <button
                      onClick={() => setCardType('debit')}
                      style={{
                        flex: 1,
                        padding: '15px',
                        backgroundColor: cardType === 'debit' ? '#d4a574' : '#0f1629',
                        color: cardType === 'debit' ? '#1a1f3a' : '#b0b8c8',
                        border: '2px solid #d4a574',
                        borderRadius: '10px',
                        cursor: 'pointer',
                        fontWeight: '600',
                        fontSize: '16px'
                      }}
                    >
                      Debit Card
                    </button>
                    <button
                      onClick={() => setCardType('credit')}
                      style={{
                        flex: 1,
                        padding: '15px',
                        backgroundColor: cardType === 'credit' ? '#d4a574' : '#0f1629',
                        color: cardType === 'credit' ? '#1a1f3a' : '#b0b8c8',
                        border: '2px solid #d4a574',
                        borderRadius: '10px',
                        cursor: 'pointer',
                        fontWeight: '600',
                        fontSize: '16px'
                      }}
                    >
                      Credit Card
                    </button>
                  </div>
                </div>

                {/* Card Number */}
                <div style={{ marginBottom: '20px' }}>
                  <label style={{ color: '#b0b8c8', display: 'block', marginBottom: '10px' }}>Card Number</label>
                  <input
                    type="text"
                    placeholder="1234 5678 9012 3456"
                    value={cardNumber}
                    onChange={(e) => setCardNumber(e.target.value.replace(/\D/g, '').slice(0, 16))}
                    style={{
                      width: '100%',
                      padding: '15px',
                      backgroundColor: '#0f1629',
                      border: '2px solid #333',
                      borderRadius: '10px',
                      color: '#fff',
                      fontSize: '16px',
                      boxSizing: 'border-box'
                    }}
                  />
                </div>

                {/* Card Name */}
                <div style={{ marginBottom: '20px' }}>
                  <label style={{ color: '#b0b8c8', display: 'block', marginBottom: '10px' }}>Name on Card</label>
                  <input
                    type="text"
                    placeholder="John Doe"
                    value={cardName}
                    onChange={(e) => setCardName(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '15px',
                      backgroundColor: '#0f1629',
                      border: '2px solid #333',
                      borderRadius: '10px',
                      color: '#fff',
                      fontSize: '16px',
                      boxSizing: 'border-box'
                    }}
                  />
                </div>

                {/* Expiry and CVV */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                  <div>
                    <label style={{ color: '#b0b8c8', display: 'block', marginBottom: '10px' }}>Expiry Date</label>
                    <input
                      type="text"
                      placeholder="MM/YY"
                      value={expiry}
                      onChange={(e) => setExpiry(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '15px',
                        backgroundColor: '#0f1629',
                        border: '2px solid #333',
                        borderRadius: '10px',
                        color: '#fff',
                        fontSize: '16px',
                        boxSizing: 'border-box'
                      }}
                    />
                  </div>
                  <div>
                    <label style={{ color: '#b0b8c8', display: 'block', marginBottom: '10px' }}>CVV</label>
                    <input
                      type="password"
                      placeholder="***"
                      value={cvv}
                      onChange={(e) => setCvv(e.target.value.replace(/\D/g, '').slice(0, 3))}
                      style={{
                        width: '100%',
                        padding: '15px',
                        backgroundColor: '#0f1629',
                        border: '2px solid #333',
                        borderRadius: '10px',
                        color: '#fff',
                        fontSize: '16px',
                        boxSizing: 'border-box'
                      }}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* UPI Details */}
            {paymentMethod === 'upi' && (
              <div style={{ backgroundColor: '#1a1f3a', borderRadius: '16px', padding: '30px', marginBottom: '20px' }}>
                <h2 style={{ color: '#fff', fontSize: '20px', marginBottom: '20px' }}>UPI Payment</h2>
                <div>
                  <label style={{ color: '#b0b8c8', display: 'block', marginBottom: '10px' }}>UPI ID</label>
                  <input
                    type="text"
                    placeholder="yourname@upi"
                    value={upiId}
                    onChange={(e) => setUpiId(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '15px',
                      backgroundColor: '#0f1629',
                      border: '2px solid #333',
                      borderRadius: '10px',
                      color: '#fff',
                      fontSize: '16px',
                      boxSizing: 'border-box'
                    }}
                  />
                </div>
                <div style={{ marginTop: '20px', display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                  {['Google Pay', 'PhonePe', 'Paytm', 'BHIM'].map(app => (
                    <span key={app} style={{
                      padding: '8px 16px',
                      backgroundColor: '#0f1629',
                      borderRadius: '20px',
                      color: '#b0b8c8',
                      fontSize: '14px'
                    }}>
                      {app}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Cash Details */}
            {paymentMethod === 'cash' && (
              <div style={{ backgroundColor: '#1a1f3a', borderRadius: '16px', padding: '30px', marginBottom: '20px' }}>
                <h2 style={{ color: '#fff', fontSize: '20px', marginBottom: '20px' }}>Cash Payment</h2>
                <div style={{ backgroundColor: 'rgba(212, 165, 116, 0.1)', padding: '20px', borderRadius: '10px', border: '1px solid rgba(212, 165, 116, 0.3)' }}>
                  <p style={{ color: '#d4a574', marginBottom: '10px' }}>📍 Pay at Pickup Location</p>
                  <p style={{ color: '#b0b8c8', fontSize: '14px' }}>
                    Please carry exact cash amount. Our executive will collect the payment when you pick up the vehicle.
                  </p>
                </div>
              </div>
            )}

            {/* Pay Button */}
            <button
              onClick={handlePayment}
              disabled={loading || !paymentMethod}
              style={{
                width: '100%',
                padding: '18px',
                backgroundColor: loading || !paymentMethod ? '#666' : '#22c55e',
                color: '#fff',
                border: 'none',
                borderRadius: '12px',
                fontSize: '18px',
                fontWeight: 'bold',
                cursor: loading || !paymentMethod ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '10px'
              }}
            >
              {loading ? (
                <>Processing...</>
              ) : (
                <>
                  <FiCheck /> Pay ₹{bookingDetails?.totalAmount?.toLocaleString() || '0'}
                </>
              )}
            </button>
          </div>

          {/* Order Summary */}
          <div>
            <div style={{ backgroundColor: '#1a1f3a', borderRadius: '16px', padding: '25px', position: 'sticky', top: '20px' }}>
              <h2 style={{ color: '#fff', fontSize: '20px', marginBottom: '20px' }}>Booking Summary</h2>
              
              {/* Car Image */}
              <div style={{ marginBottom: '20px' }}>
                <img 
                  src={bookingDetails?.carImage} 
                  alt={bookingDetails?.carName}
                  style={{ width: '100%', height: '180px', objectFit: 'cover', borderRadius: '12px' }}
                />
              </div>

              {/* Car Details */}
              <h3 style={{ color: '#d4a574', fontSize: '22px', marginBottom: '5px' }}>{bookingDetails?.carName}</h3>
              <p style={{ color: '#b0b8c8', marginBottom: '20px' }}>{bookingDetails?.carBrand}</p>

              {/* Dates */}
              <div style={{ borderTop: '1px solid #333', paddingTop: '20px', marginBottom: '20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                  <span style={{ color: '#b0b8c8' }}>Pickup Date</span>
                  <span style={{ color: '#fff' }}>{bookingDetails?.pickupDate}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                  <span style={{ color: '#b0b8c8' }}>Dropoff Date</span>
                  <span style={{ color: '#fff' }}>{bookingDetails?.dropoffDate}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#b0b8c8' }}>Duration</span>
                  <span style={{ color: '#fff' }}>{bookingDetails?.totalDays} Days</span>
                </div>
              </div>

              {/* Price Breakdown */}
              <div style={{ borderTop: '1px solid #333', paddingTop: '20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                  <span style={{ color: '#b0b8c8' }}>Price per day</span>
                  <span style={{ color: '#fff' }}>₹{bookingDetails?.pricePerDay?.toLocaleString()}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                  <span style={{ color: '#b0b8c8' }}>Subtotal ({bookingDetails?.totalDays} days)</span>
                  <span style={{ color: '#fff' }}>₹{bookingDetails?.totalAmount?.toLocaleString()}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                  <span style={{ color: '#b0b8c8' }}>GST (18%)</span>
                  <span style={{ color: '#fff' }}>₹{Math.round((bookingDetails?.totalAmount || 0) * 0.18).toLocaleString()}</span>
                </div>
                <div style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  paddingTop: '15px',
                  borderTop: '1px solid #333',
                  marginTop: '15px'
                }}>
                  <span style={{ color: '#d4a574', fontWeight: 'bold', fontSize: '18px' }}>Total</span>
                  <span style={{ color: '#d4a574', fontWeight: 'bold', fontSize: '18px' }}>
                    ₹{Math.round((bookingDetails?.totalAmount || 0) * 1.18).toLocaleString()}
                  </span>
                </div>
              </div>

              {/* Secure Payment Badge */}
              <div style={{ 
                marginTop: '20px', 
                padding: '15px', 
                backgroundColor: 'rgba(34, 197, 94, 0.1)', 
                borderRadius: '10px',
                textAlign: 'center'
              }}>
                <p style={{ color: '#22c55e', fontSize: '14px' }}>🔒 Secure Payment</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Payment;
