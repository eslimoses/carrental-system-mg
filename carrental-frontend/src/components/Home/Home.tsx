import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiMapPin, FiCalendar, FiClock, FiSearch, FiX, FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import { BsCarFront } from 'react-icons/bs';
import { categoryAPI } from '../../api/api';

interface Vehicle {
  id: number;
  make: string;
  model: string;
  dailyRate: number;
  category?: { name: string };
  photos?: Array<{ photoUrl: string }>;
}

interface Category {
  id: number;
  name: string;
}

import { useCities, useCars } from '../../hooks';
import { CAR_IMAGES } from '../../constants';

const Home: React.FC = () => {
  const navigate = useNavigate();
  const { cities } = useCities();
  const { cars: sliderCars, isLoading: carsLoading } = useCars({ limit: 12 } as any);
  
  const [city, setCity] = useState('');
  const [category, setCategory] = useState('');
  const [pickupDate, setPickupDate] = useState('');
  const [pickupTime, setPickupTime] = useState('');
  const [dropoffDate, setDropoffDate] = useState('');
  const [dropoffTime, setDropoffTime] = useState('');
  const [showOfferPopup, setShowOfferPopup] = useState(false);
  const [offerDiscount, setOfferDiscount] = useState(0);
  const [currentCarIndex, setCurrentCarIndex] = useState(0);
  const [categories, setCategories] = useState<Category[]>([]);

  const LOGO_URL = 'https://st3.depositphotos.com/22052918/32067/v/450/depositphotos_320674452-stock-illustration-letter-mg-slice-colorful-logo.jpg';

  // Fetch categories from backend (could be moved to useCategories hook later)
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await categoryAPI.getAll();
        setCategories(response.data);
      } catch (error) {
        console.error('Error fetching categories:', error);
        setCategories([
          { id: 1, name: 'Sedan' },
          { id: 2, name: 'SUV' },
          { id: 3, name: 'Hatchback' },
          { id: 4, name: 'Luxury' },
          { id: 5, name: 'Electric' },
          { id: 6, name: 'Mini' }
        ]);
      }
    };
    fetchCategories();
  }, []);

  // Auto-slide cars
  useEffect(() => {
    if (sliderCars.length === 0) return;
    const interval = setInterval(() => {
      setCurrentCarIndex((prev) => (prev + 1) % sliderCars.length);
    }, 3000);
    return () => clearInterval(interval);
  }, [sliderCars.length]);

  // Check for advance booking discount
  useEffect(() => {
    if (pickupDate) {
      const today = new Date();
      const pickup = new Date(pickupDate);
      const diffTime = pickup.getTime() - today.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      if (diffDays >= 15) {
        setOfferDiscount(30);
        setShowOfferPopup(true);
      } else if (diffDays >= 10) {
        setOfferDiscount(20);
        setShowOfferPopup(true);
      } else if (diffDays >= 7) {
        setOfferDiscount(15);
        setShowOfferPopup(true);
      } else {
        setShowOfferPopup(false);
        setOfferDiscount(0);
      }
    }
  }, [pickupDate]);

  const handleSearch = () => {
    navigate('/cars', { state: { city, category, pickupDate, pickupTime, dropoffDate, dropoffTime, discount: offerDiscount } });
  };

  const nextCar = () => {
    setCurrentCarIndex((prev) => (prev + 1) % sliderCars.length);
  };

  const prevCar = () => {
    setCurrentCarIndex((prev) => (prev - 1 + sliderCars.length) % sliderCars.length);
  };

  const getCarImage = (vehicle: Vehicle): string => {
    const fullName = `${vehicle.make} ${vehicle.model}`;
    if (CAR_IMAGES[fullName]) {
      return CAR_IMAGES[fullName];
    }
    if (CAR_IMAGES[vehicle.model]) {
      return CAR_IMAGES[vehicle.model];
    }
    
    if (vehicle.photos && vehicle.photos.length > 0) {
      return vehicle.photos[0].photoUrl;
    }
    return 'https://images.unsplash.com/photo-1494976388531-d1058494cdd8?w=800';
  };

  const getCarName = (vehicle: Vehicle): string => {
    return `${vehicle.make} ${vehicle.model}`;
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#0f1629' }}>
      {/* Offer Popup */}
      {showOfferPopup && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.7)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div style={{
            backgroundColor: '#1a1f3a',
            borderRadius: '20px',
            padding: '40px',
            textAlign: 'center',
            maxWidth: '450px',
            border: '3px solid #d4a574',
            boxShadow: '0 20px 60px rgba(212, 165, 116, 0.3)'
          }}>
            <div style={{ fontSize: '60px', marginBottom: '20px' }}>🎉</div>
            <h2 style={{ color: '#d4a574', fontSize: '28px', marginBottom: '15px' }}>
              Early Bird Offer!
            </h2>
            <div style={{
              fontSize: '72px',
              fontWeight: 'bold',
              color: '#4ade80',
              marginBottom: '15px'
            }}>
              {offerDiscount}% OFF
            </div>
            <p style={{ color: '#b0b8c8', fontSize: '16px', marginBottom: '25px' }}>
              Book {offerDiscount === 30 ? '15+' : offerDiscount === 20 ? '10+' : '7+'} days in advance and save big!
            </p>
            <button
              onClick={() => setShowOfferPopup(false)}
              style={{
                backgroundColor: '#d4a574',
                color: '#1a1f3a',
                border: 'none',
                padding: '15px 40px',
                borderRadius: '30px',
                fontSize: '16px',
                fontWeight: 'bold',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto',
                gap: '8px'
              }}
            >
              <FiX /> Got it!
            </button>
          </div>
        </div>
      )}

      {/* Hero Section */}
      <div style={{ 
        background: 'linear-gradient(135deg, #1a1f3a 0%, #2d3561 50%, #1a1f3a 100%)',
        padding: '60px 20px',
        textAlign: 'center'
      }}>
        {/* MotoGlide Logo and Title */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '20px', marginBottom: '20px' }}>
          <img 
            src={LOGO_URL} 
            alt="MotoGlide Logo" 
            style={{ 
              width: '80px', 
              height: '80px', 
              borderRadius: '15px',
              boxShadow: '0 8px 25px rgba(212, 165, 116, 0.3)'
            }} 
          />
          <h1 style={{ 
            fontSize: '52px', 
            fontWeight: 'bold', 
            color: '#d4a574', 
            margin: 0,
            textShadow: '2px 2px 4px rgba(0,0,0,0.3)'
          }}>
            MotoGlide
          </h1>
        </div>
        <h2 style={{ 
          fontSize: '28px', 
          fontWeight: '600', 
          color: '#ffffff', 
          marginBottom: '16px' 
        }}>
          Rent A Car From Best Car Rental - MotoGlide
        </h2>
        <p style={{ 
          fontSize: '17px', 
          color: '#b0b8c8', 
          maxWidth: '800px', 
          margin: '0 auto 40px',
          lineHeight: '1.6'
        }}>
          MotoGlide is one of the most trusted car rental services in India. The rent-a-car service provider 
          offers an outstanding model and a wide variety of vehicle options at the most competitive rates.
        </p>

        {/* Booking Form */}
        <div style={{ 
          maxWidth: '1200px', 
          margin: '0 auto', 
          backgroundColor: 'rgba(255,255,255,0.1)', 
          borderRadius: '16px', 
          padding: '30px',
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(255,255,255,0.2)'
        }}>
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', 
            gap: '20px',
            marginBottom: '20px'
          }}>
            {/* City Select */}
            <div style={{ textAlign: 'left' }}>
              <label style={{ display: 'block', color: '#d4a574', marginBottom: '8px', fontWeight: '600', fontSize: '14px' }}>
                <FiMapPin style={{ marginRight: '8px', verticalAlign: 'middle' }} />
                Select City
              </label>
              <select
                value={city}
                onChange={(e) => setCity(e.target.value)}
                style={{ 
                  width: '100%', 
                  padding: '14px', 
                  borderRadius: '8px', 
                  border: 'none',
                  backgroundColor: '#ffffff',
                  color: '#333',
                  fontSize: '15px',
                  cursor: 'pointer'
                }}
              >
                <option value="">Choose City</option>
                {cities.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
              </select>
            </div>

            {/* Category Select */}
            <div style={{ textAlign: 'left' }}>
              <label style={{ display: 'block', color: '#d4a574', marginBottom: '8px', fontWeight: '600', fontSize: '14px' }}>
                <BsCarFront style={{ marginRight: '8px', verticalAlign: 'middle' }} />
                Select Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                style={{ 
                  width: '100%', 
                  padding: '14px', 
                  borderRadius: '8px', 
                  border: 'none',
                  backgroundColor: '#ffffff',
                  color: '#333',
                  fontSize: '15px',
                  cursor: 'pointer'
                }}
              >
                <option value="">Choose Category</option>
                {categories.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
              </select>
            </div>

            {/* Pickup Date */}
            <div style={{ textAlign: 'left' }}>
              <label style={{ display: 'block', color: '#d4a574', marginBottom: '8px', fontWeight: '600', fontSize: '14px' }}>
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
                  backgroundColor: '#ffffff',
                  color: '#333',
                  fontSize: '15px',
                  boxSizing: 'border-box'
                }}
              />
            </div>

            {/* Pickup Time */}
            <div style={{ textAlign: 'left' }}>
              <label style={{ display: 'block', color: '#d4a574', marginBottom: '8px', fontWeight: '600', fontSize: '14px' }}>
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
                  backgroundColor: '#ffffff',
                  color: '#333',
                  fontSize: '15px',
                  boxSizing: 'border-box'
                }}
              />
            </div>

            {/* Dropoff Date */}
            <div style={{ textAlign: 'left' }}>
              <label style={{ display: 'block', color: '#d4a574', marginBottom: '8px', fontWeight: '600', fontSize: '14px' }}>
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
                  backgroundColor: '#ffffff',
                  color: '#333',
                  fontSize: '15px',
                  boxSizing: 'border-box'
                }}
              />
            </div>

            {/* Dropoff Time */}
            <div style={{ textAlign: 'left' }}>
              <label style={{ display: 'block', color: '#d4a574', marginBottom: '8px', fontWeight: '600', fontSize: '14px' }}>
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
                  backgroundColor: '#ffffff',
                  color: '#333',
                  fontSize: '15px',
                  boxSizing: 'border-box'
                }}
              />
            </div>
          </div>

          {/* Early Booking Discount Info */}
          {offerDiscount > 0 && (
            <div style={{
              backgroundColor: 'rgba(74, 222, 128, 0.2)',
              border: '1px solid #4ade80',
              borderRadius: '10px',
              padding: '12px 20px',
              marginBottom: '20px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '10px'
            }}>
              <span style={{ fontSize: '24px' }}>🎁</span>
              <span style={{ color: '#4ade80', fontWeight: 'bold', fontSize: '16px' }}>
                {offerDiscount}% Early Booking Discount Applied!
              </span>
            </div>
          )}

          <button
            onClick={handleSearch}
            style={{ 
              backgroundColor: '#d4a574', 
              color: '#1a1f3a', 
              border: 'none', 
              padding: '16px 50px', 
              borderRadius: '30px', 
              fontSize: '18px', 
              fontWeight: 'bold', 
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto',
              gap: '10px',
              boxShadow: '0 4px 15px rgba(212, 165, 116, 0.4)'
            }}
          >
            <FiSearch /> Search Cars
          </button>
        </div>
      </div>

      {/* Car Slider Section */}
      <div style={{ 
        padding: '60px 20px', 
        backgroundColor: '#0f1629',
        textAlign: 'center'
      }}>
        <h2 style={{ 
          color: '#d4a574', 
          fontSize: '36px', 
          marginBottom: '10px',
          fontWeight: 'bold'
        }}>
          Our Fleet
        </h2>
        <p style={{ color: '#b0b8c8', marginBottom: '40px', fontSize: '16px' }}>
          Explore our wide range of premium vehicles
        </p>

        {/* Slider Container */}
        <div style={{ 
          maxWidth: '900px', 
          margin: '0 auto',
          position: 'relative'
        }}>
          {carsLoading ? (
            <div style={{ color: '#d4a574', fontSize: '18px', padding: '40px' }}>
              Loading vehicles...
            </div>
          ) : sliderCars.length > 0 ? (
            <>
              {/* Navigation Arrows */}
              <button
                onClick={prevCar}
                style={{
                  position: 'absolute',
                  left: '10px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  backgroundColor: '#d4a574',
                  border: 'none',
                  borderRadius: '50%',
                  width: '50px',
                  height: '50px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  zIndex: 10,
                  boxShadow: '0 4px 15px rgba(212, 165, 116, 0.4)'
                }}
              >
                <FiChevronLeft size={28} color="#1a1f3a" />
              </button>

              <button
                onClick={nextCar}
                style={{
                  position: 'absolute',
                  right: '10px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  backgroundColor: '#d4a574',
                  border: 'none',
                  borderRadius: '50%',
                  width: '50px',
                  height: '50px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  zIndex: 10,
                  boxShadow: '0 4px 15px rgba(212, 165, 116, 0.4)'
                }}
              >
                <FiChevronRight size={28} color="#1a1f3a" />
              </button>

              {/* Car Card */}
              <div style={{
                backgroundColor: 'rgba(255,255,255,0.05)',
                borderRadius: '20px',
                overflow: 'hidden',
                border: '1px solid rgba(255,255,255,0.1)'
              }}>
                <div style={{ 
                  height: '350px', 
                  overflow: 'hidden',
                  position: 'relative'
                }}>
                  <img
                    src={getCarImage(sliderCars[currentCarIndex])}
                    alt={getCarName(sliderCars[currentCarIndex])}
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover'
                    }}
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1494976388531-d1058494cdd8?w=800';
                    }}
                  />
                  <div style={{
                    position: 'absolute',
                    top: '20px',
                    right: '20px',
                    backgroundColor: '#d4a574',
                    color: '#1a1f3a',
                    padding: '8px 16px',
                    borderRadius: '20px',
                    fontWeight: 'bold',
                    fontSize: '14px'
                  }}>
                    {sliderCars[currentCarIndex].category?.name || 'Vehicle'}
                  </div>
                </div>
                <div style={{ padding: '25px' }}>
                  <h3 style={{ 
                    color: '#ffffff', 
                    fontSize: '26px', 
                    marginBottom: '10px',
                    fontWeight: 'bold'
                  }}>
                    {getCarName(sliderCars[currentCarIndex])}
                  </h3>
                  <div style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center',
                    gap: '10px'
                  }}>
                    <span style={{ color: '#d4a574', fontSize: '28px', fontWeight: 'bold' }}>
                      ₹{sliderCars[currentCarIndex].dailyRate}
                    </span>
                    <span style={{ color: '#b0b8c8', fontSize: '16px' }}>/day</span>
                  </div>
                  <button
                    onClick={() => navigate(`/cars/${sliderCars[currentCarIndex].id}`)}
                    style={{
                      marginTop: '20px',
                      backgroundColor: 'transparent',
                      border: '2px solid #d4a574',
                      color: '#d4a574',
                      padding: '12px 35px',
                      borderRadius: '25px',
                      fontSize: '16px',
                      fontWeight: '600',
                      cursor: 'pointer'
                    }}
                  >
                    Book Now
                  </button>
                </div>
              </div>

              {/* Slider Dots */}
              <div style={{ 
                display: 'flex', 
                justifyContent: 'center', 
                gap: '10px', 
                marginTop: '25px' 
              }}>
                {sliderCars.map((_: Vehicle, index: number) => (
                  <button
                    key={index}
                    onClick={() => setCurrentCarIndex(index)}
                    style={{
                      width: currentCarIndex === index ? '30px' : '10px',
                      height: '10px',
                      borderRadius: '5px',
                      backgroundColor: currentCarIndex === index ? '#d4a574' : 'rgba(255,255,255,0.3)',
                      border: 'none',
                      cursor: 'pointer'
                    }}
                  />
                ))}
              </div>
            </>
          ) : (
            <div style={{ color: '#d4a574', fontSize: '18px', padding: '40px' }}>
              No vehicles available
            </div>
          )}
        </div>
      </div>

      {/* Features Section */}
      <div style={{ 
        padding: '60px 20px', 
        backgroundColor: '#1a1f3a'
      }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <h2 style={{ 
            color: '#d4a574', 
            fontSize: '36px', 
            textAlign: 'center',
            marginBottom: '50px',
            fontWeight: 'bold'
          }}>
            Why Choose MotoGlide?
          </h2>
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', 
            gap: '30px' 
          }}>
            {[
              { icon: '🚗', title: 'Wide Selection', desc: 'Choose from 500+ cars across all categories' },
              { icon: '💰', title: 'Best Prices', desc: 'Competitive rates with no hidden charges' },
              { icon: '🛡️', title: 'Fully Insured', desc: 'All vehicles come with comprehensive insurance' },
              { icon: '📱', title: '24/7 Support', desc: 'Round the clock customer assistance' },
              { icon: '🎁', title: 'Early Booking Offers', desc: 'Up to 30% off on advance bookings' },
              { icon: '✨', title: 'Premium Quality', desc: 'Well-maintained and sanitized vehicles' }
            ].map((feature, index) => (
              <div
                key={index}
                style={{
                  backgroundColor: 'rgba(255,255,255,0.05)',
                  borderRadius: '16px',
                  padding: '30px',
                  textAlign: 'center',
                  border: '1px solid rgba(255,255,255,0.1)'
                }}
              >
                <div style={{ fontSize: '48px', marginBottom: '15px' }}>{feature.icon}</div>
                <h3 style={{ color: '#ffffff', fontSize: '20px', marginBottom: '10px', fontWeight: '600' }}>
                  {feature.title}
                </h3>
                <p style={{ color: '#b0b8c8', fontSize: '15px', lineHeight: '1.5' }}>
                  {feature.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

    </div>
  );
};

export default Home;
