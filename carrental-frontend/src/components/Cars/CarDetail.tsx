import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { FiCalendar, FiClock, FiMapPin, FiCheck, FiArrowLeft } from 'react-icons/fi';
import { BsFuelPump, BsSpeedometer, BsPeople } from 'react-icons/bs';

interface Car {
  id: number;
  name: string;
  brand: string;
  type: string;
  transmission: string;
  fuel: string;
  seats: number;
  price: number;
  color: string;
  image: string;
}



import { useCarDetail, useCities, useAuth } from '../../hooks';
import { CAR_IMAGES, SUBSCRIPTION_PLANS } from '../../constants';

const CarDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { state } = useLocation();
  const subscriptionPlanId = state?.subscriptionPlan;
  const subscriptionPlan = subscriptionPlanId ? SUBSCRIPTION_PLANS[subscriptionPlanId] : null;
  
  const { user } = useAuth();
  const { car, isLoading: loading } = useCarDetail(parseInt(id || '0'));
  const { cities } = useCities();
  
  const [pickupDate, setPickupDate] = useState(state?.pickupDate || new Date().toISOString().split('T')[0]);
  const [pickupTime, setPickupTime] = useState(state?.pickupTime || '10:00');
  const [dropoffDate, setDropoffDate] = useState(state?.dropoffDate || new Date(Date.now() + 86400000).toISOString().split('T')[0]);
  const [dropoffTime, setDropoffTime] = useState(state?.dropoffTime || '10:00');
  const [pickupLocation, setPickupLocation] = useState(state?.pickupLocation || '');
  
  // Set default city from car
  useEffect(() => {
    if (car) {
      if (!pickupLocation || pickupLocation === 'All') {
        const defaultLoc = car.cityName || car.city?.name;
        if (defaultLoc) {
          setPickupLocation(defaultLoc);
        } else if (cities.length > 0) {
          const carCity = cities.find((city: any) => city.id === car.cityId || city.id === car.city?.id);
          if (carCity) {
            setPickupLocation(carCity.name);
          }
        }
      }
    }
  }, [car, cities, pickupLocation]);

  const handleProceedToPayment = () => {
    if (!car) return;
    
    if (!user) {
      navigate('/login', { state: { from: `/cars/${id}` } });
      return;
    }
    
    // Navigate to booking form
    navigate(`/booking/${car.id}`, {
      state: {
        pickupDate,
        pickupTime,
        dropoffDate: subscriptionPlan 
          ? new Date(new Date(pickupDate || Date.now()).setMonth(new Date(pickupDate || Date.now()).getMonth() + subscriptionPlan.months)).toISOString().split('T')[0]
          : dropoffDate,
        dropoffTime,
        pickupLocation,
        subscriptionPlan: subscriptionPlanId
      }
    });
  };

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', backgroundColor: '#0f1629', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-blue-500"></div>
      </div>
    );
  }

  if (!car) {
    return (
      <div style={{ minHeight: '100vh', backgroundColor: '#0f1629', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '60px', marginBottom: '20px' }}>🚗</div>
          <h2 style={{ color: '#ffffff', marginBottom: '20px' }}>Car not found</h2>
          <button
            onClick={() => navigate('/cars')}
            style={{
              backgroundColor: '#d4a574',
              color: '#1a1f3a',
              border: 'none',
              padding: '12px 30px',
              borderRadius: '25px',
              fontWeight: 'bold',
              cursor: 'pointer'
            }}
          >
            Browse Cars
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#0f1629', padding: '30px 20px' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        {/* Back Button */}
        <button
          onClick={() => navigate('/cars')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            backgroundColor: 'transparent',
            border: 'none',
            color: '#d4a574',
            fontSize: '16px',
            cursor: 'pointer',
            marginBottom: '30px'
          }}
        >
          <FiArrowLeft /> Back to Cars
        </button>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 400px', gap: '40px' }}>
          {/* Left Column - Car Details */}
          <div>
            {/* Car Image */}
            <div style={{
              borderRadius: '20px',
              overflow: 'hidden',
              marginBottom: '30px',
              position: 'relative'
            }}>
              <img
                src={car.imageUrl || CAR_IMAGES[`${car.make} ${car.model}`] || CAR_IMAGES[car.model] || 'https://images.unsplash.com/photo-1494976388531-d1058494cdd8?w=800'}
                alt={`${car.make} ${car.model}`}
                style={{ width: '100%', height: '400px', objectFit: 'cover' }}
                onError={(e) => {
                  (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1494976388531-d1058494cdd8?w=800';
                }}
              />
              <div style={{
                position: 'absolute',
                top: '20px',
                left: '20px',
                backgroundColor: '#d4a574',
                color: '#1a1f3a',
                padding: '8px 20px',
                borderRadius: '25px',
                fontWeight: 'bold'
              }}>
                {car.type || 'Vehicle'}
              </div>
            </div>

            {/* Car Info */}
            <div style={{
              backgroundColor: 'rgba(255,255,255,0.05)',
              borderRadius: '16px',
              padding: '30px',
              border: '1px solid rgba(255,255,255,0.1)'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '25px' }}>
                <div>
                  <h1 style={{ color: '#ffffff', fontSize: '32px', fontWeight: 'bold', margin: '0 0 8px 0' }}>
                    {car.make} {car.model}
                  </h1>
                  <p style={{ color: '#b0b8c8', fontSize: '18px', margin: 0 }}>
                    {car.year}
                  </p>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <span style={{ color: '#d4a574', fontSize: '36px', fontWeight: 'bold' }}>
                    ₹{car.dailyRate || car.price}
                  </span>
                  <span style={{ color: '#b0b8c8', fontSize: '16px' }}>/day</span>
                </div>
              </div>

              {/* Color */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '25px' }}>
                <span style={{ color: '#b0b8c8', fontSize: '16px' }}>Color:</span>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div style={{
                    width: '30px',
                    height: '30px',
                    borderRadius: '50%',
                    backgroundColor: car.color.toLowerCase(),
                    border: '3px solid white',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.3)'
                  }} />
                  <span style={{ color: '#ffffff', fontWeight: '600' }}>{car.color}</span>
                </div>
              </div>

              {/* Specifications */}
              <h3 style={{ color: '#d4a574', fontSize: '20px', marginBottom: '20px' }}>Specifications</h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px' }}>
                <div style={{
                  backgroundColor: 'rgba(255,255,255,0.05)',
                  padding: '20px',
                  borderRadius: '12px',
                  textAlign: 'center'
                }}>
                  <BsSpeedometer style={{ color: '#d4a574', fontSize: '28px', marginBottom: '10px' }} />
                  <p style={{ color: '#b0b8c8', fontSize: '14px', margin: '0 0 5px 0' }}>Transmission</p>
                  <p style={{ color: '#ffffff', fontWeight: 'bold', margin: 0 }}>{car.transmission}</p>
                </div>
                <div style={{
                  backgroundColor: 'rgba(255,255,255,0.05)',
                  padding: '20px',
                  borderRadius: '12px',
                  textAlign: 'center'
                }}>
                  <BsFuelPump style={{ color: '#d4a574', fontSize: '28px', marginBottom: '10px' }} />
                  <p style={{ color: '#b0b8c8', fontSize: '14px', margin: '0 0 5px 0' }}>Fuel Type</p>
                  <p style={{ color: '#ffffff', fontWeight: 'bold', margin: 0 }}>{car.fuelType || car.fuel}</p>
                </div>
                <div style={{
                  backgroundColor: 'rgba(255,255,255,0.05)',
                  padding: '20px',
                  borderRadius: '12px',
                  textAlign: 'center'
                }}>
                  <BsPeople style={{ color: '#d4a574', fontSize: '28px', marginBottom: '10px' }} />
                  <p style={{ color: '#b0b8c8', fontSize: '14px', margin: '0 0 5px 0' }}>Seating</p>
                  <p style={{ color: '#ffffff', fontWeight: 'bold', margin: 0 }}>{car.seatingCapacity || car.seats} Seats</p>
                </div>
              </div>

              {/* Features */}
              <h3 style={{ color: '#d4a574', fontSize: '20px', margin: '30px 0 20px' }}>Features</h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px' }}>
                {['Air Conditioning', 'Power Steering', 'Power Windows', 'Central Locking', 'ABS', 'Airbags', 'Music System', 'GPS Navigation'].map((feature, index) => (
                  <div key={index} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <FiCheck style={{ color: '#4ade80', fontSize: '18px' }} />
                    <span style={{ color: '#b0b8c8' }}>{feature}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column - Booking Form */}
          <div>
            <div style={{
              backgroundColor: 'rgba(255,255,255,0.05)',
              borderRadius: '16px',
              padding: '30px',
              border: '1px solid rgba(255,255,255,0.1)',
              position: 'sticky',
              top: '100px'
            }}>
              <h2 style={{ color: '#d4a574', fontSize: '24px', marginBottom: '25px', textAlign: 'center' }}>
                Book This Car
              </h2>

              {/* Pickup Location */}
              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', color: '#ffffff', marginBottom: '8px', fontWeight: '600' }}>
                  <FiMapPin style={{ marginRight: '8px', verticalAlign: 'middle' }} />
                  Pickup Location
                </label>
                <div style={{
                  width: '100%',
                  padding: '14px',
                  borderRadius: '8px',
                  border: 'none',
                  backgroundColor: '#1a1f3a',
                  color: '#ffffff',
                  fontSize: '15px'
                }}>
                  {pickupLocation || 'Select Location'}
                </div>
              </div>

              {/* Pickup Date */}
              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', color: '#ffffff', marginBottom: '8px', fontWeight: '600' }}>
                  <FiCalendar style={{ marginRight: '8px', verticalAlign: 'middle' }} />
                  Pickup Date
                </label>
                <input
                  type="date"
                  value={pickupDate}
                  onChange={(e) => setPickupDate(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '14px',
                    borderRadius: '8px',
                    border: 'none',
                    backgroundColor: '#1a1f3a',
                    color: '#ffffff',
                    fontSize: '15px',
                    boxSizing: 'border-box'
                  }}
                />
              </div>

              {/* Pickup Time */}
              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', color: '#ffffff', marginBottom: '8px', fontWeight: '600' }}>
                  <FiClock style={{ marginRight: '8px', verticalAlign: 'middle' }} />
                  Pickup Time
                </label>
                <input
                  type="time"
                  value={pickupTime}
                  onChange={(e) => setPickupTime(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '14px',
                    borderRadius: '8px',
                    border: 'none',
                    backgroundColor: '#1a1f3a',
                    color: '#ffffff',
                    fontSize: '15px',
                    boxSizing: 'border-box'
                  }}
                />
              </div>

              {/* Dropoff Date */}
              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', color: '#ffffff', marginBottom: '8px', fontWeight: '600' }}>
                  <FiCalendar style={{ marginRight: '8px', verticalAlign: 'middle' }} />
                  Dropoff Date
                </label>
                <input
                  type="date"
                  value={dropoffDate}
                  onChange={(e) => setDropoffDate(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '14px',
                    borderRadius: '8px',
                    border: 'none',
                    backgroundColor: '#1a1f3a',
                    color: '#ffffff',
                    fontSize: '15px',
                    boxSizing: 'border-box'
                  }}
                />
              </div>

              {/* Dropoff Time */}
              <div style={{ marginBottom: '25px' }}>
                <label style={{ display: 'block', color: '#ffffff', marginBottom: '8px', fontWeight: '600' }}>
                  <FiClock style={{ marginRight: '8px', verticalAlign: 'middle' }} />
                  Dropoff Time
                </label>
                <input
                  type="time"
                  value={dropoffTime}
                  onChange={(e) => setDropoffTime(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '14px',
                    borderRadius: '8px',
                    border: 'none',
                    backgroundColor: '#1a1f3a',
                    color: '#ffffff',
                    fontSize: '15px',
                    boxSizing: 'border-box'
                  }}
                />
              </div>

              {/* Price Summary */}
              <div style={{
                backgroundColor: 'rgba(212, 165, 116, 0.1)',
                borderRadius: '12px',
                padding: '20px',
                marginBottom: '25px'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                  <span style={{ color: '#b0b8c8' }}>Daily Rate</span>
                  <span style={{ color: '#ffffff' }}>₹{car.dailyRate || car.price}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                  <span style={{ color: '#b0b8c8' }}>Insurance</span>
                  <span style={{ color: '#ffffff' }}>₹{Math.round((car.dailyRate || car.price) * 0.1)}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                  <span style={{ color: '#b0b8c8' }}>GST (18%)</span>
                  <span style={{ color: '#ffffff' }}>₹{Math.round((car.dailyRate || car.price) * 0.18)}</span>
                </div>
                <div style={{ borderTop: '1px solid rgba(255,255,255,0.2)', paddingTop: '10px', marginTop: '10px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: '#d4a574', fontWeight: 'bold', fontSize: '18px' }}>Total</span>
                    <span style={{ color: '#d4a574', fontWeight: 'bold', fontSize: '18px' }}>
                      ₹{Math.round((car.dailyRate || car.price) * 1.28)}/day
                    </span>
                  </div>
                </div>
              </div>

              {/* Proceed Button */}
              <button
                onClick={handleProceedToPayment}
                disabled={car.status === 'RENTED'}
                style={{
                  width: '100%',
                  backgroundColor: car.status === 'RENTED' ? '#3a3f5a' : '#d4a574',
                  color: car.status === 'RENTED' ? '#71788e' : '#1a1f3a',
                  border: 'none',
                  padding: '16px',
                  borderRadius: '30px',
                  fontSize: '18px',
                  fontWeight: 'bold',
                  cursor: car.status === 'RENTED' ? 'not-allowed' : 'pointer'
                }}
              >
                {car.status === 'RENTED' ? 'This Car is Not Available' : 'Proceed to Booking Details'}
              </button>

              <p style={{ color: '#b0b8c8', fontSize: '12px', textAlign: 'center', marginTop: '15px' }}>
                By proceeding, you agree to our Terms & Conditions
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CarDetail;
