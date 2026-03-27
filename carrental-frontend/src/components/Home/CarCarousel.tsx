import React, { useState, useEffect } from 'react';
import { FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import api from '../../api/api';

interface Vehicle {
  id: number;
  make: string;
  model: string;
  dailyRate: number;
  imageUrl: string;
  category?: {
    name: string;
  };
}

const CarCarousel: React.FC = () => {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchVehicles = async () => {
      try {
        const response = await api.get('/vehicles');
        const vehicleList = response.data.slice(0, 6); // Get first 6 vehicles
        setVehicles(vehicleList);
      } catch (error) {
        // Use mock data if API fails
        setVehicles([
          {
            id: 1,
            make: 'Maruti',
            model: 'Swift',
            dailyRate: 2500,
            imageUrl: 'https://imgd.aeplcdn.com/1920x1080/n/cw/ec/159099/swift-exterior-right-front-three-quarter-31.png?isig=0&q=80&q=80',
            category: { name: 'Hatchback' }
          },
          {
            id: 2,
            make: 'Hyundai',
            model: 'i20',
            dailyRate: 3000,
            imageUrl: 'https://imgd.aeplcdn.com/1920x1080/n/cw/ec/159099/swift-exterior-right-front-three-quarter-31.png?isig=0&q=80&q=80',
            category: { name: 'Hatchback' }
          },
          {
            id: 3,
            make: 'Tata',
            model: 'Nexon',
            dailyRate: 4000,
            imageUrl: 'https://imgd.aeplcdn.com/1920x1080/n/cw/ec/159099/swift-exterior-right-front-three-quarter-31.png?isig=0&q=80&q=80',
            category: { name: 'SUV' }
          },
          {
            id: 4,
            make: 'Honda',
            model: 'City',
            dailyRate: 3500,
            imageUrl: 'https://imgd.aeplcdn.com/1920x1080/n/cw/ec/159099/swift-exterior-right-front-three-quarter-31.png?isig=0&q=80&q=80',
            category: { name: 'Sedan' }
          },
          {
            id: 5,
            make: 'Mahindra',
            model: 'XUV500',
            dailyRate: 5000,
            imageUrl: 'https://imgd.aeplcdn.com/1920x1080/n/cw/ec/159099/swift-exterior-right-front-three-quarter-31.png?isig=0&q=80&q=80',
            category: { name: 'SUV' }
          },
          {
            id: 6,
            make: 'Skoda',
            model: 'Slavia',
            dailyRate: 4500,
            imageUrl: 'https://imgd.aeplcdn.com/1920x1080/n/cw/ec/159099/swift-exterior-right-front-three-quarter-31.png?isig=0&q=80&q=80',
            category: { name: 'Sedan' }
          }
        ]);
      } finally {
        setLoading(false);
      }
    };

    fetchVehicles();
  }, []);

  const goToPrevious = () => {
    setCurrentIndex((prevIndex) =>
      prevIndex === 0 ? vehicles.length - 1 : prevIndex - 1
    );
  };

  const goToNext = () => {
    setCurrentIndex((prevIndex) =>
      prevIndex === vehicles.length - 1 ? 0 : prevIndex + 1
    );
  };

  if (loading || vehicles.length === 0) {
    return <div className="carousel-loading">Loading vehicles...</div>;
  }

  const currentVehicle = vehicles[currentIndex];

  return (
    <div className="car-carousel">
      <div className="carousel-container">
        {/* Left Arrow */}
        <button
          onClick={goToPrevious}
          className="carousel-arrow carousel-arrow-left"
          aria-label="Previous car"
        >
          <FiChevronLeft size={32} />
        </button>

        {/* Car Display */}
        <div className="carousel-content">
          <div className="carousel-image-wrapper">
            <img
              src={currentVehicle.imageUrl}
              alt={`${currentVehicle.make} ${currentVehicle.model}`}
              className="carousel-image"
            />
          </div>

          {/* Car Info */}
          <div className="carousel-info">
            <h3 className="carousel-car-name">
              {currentVehicle.make} {currentVehicle.model}
            </h3>
            <p className="carousel-car-price">
              ₹{currentVehicle.dailyRate.toLocaleString()}/day
            </p>
            {currentVehicle.category && (
              <p className="carousel-car-category">{currentVehicle.category.name}</p>
            )}
          </div>

          {/* Carousel Indicators */}
          <div className="carousel-indicators">
            {vehicles.map((_, index) => (
              <button
                key={index}
                className={`indicator ${index === currentIndex ? 'active' : ''}`}
                onClick={() => setCurrentIndex(index)}
                aria-label={`Go to car ${index + 1}`}
              />
            ))}
          </div>
        </div>

        {/* Right Arrow */}
        <button
          onClick={goToNext}
          className="carousel-arrow carousel-arrow-right"
          aria-label="Next car"
        >
          <FiChevronRight size={32} />
        </button>
      </div>
    </div>
  );
};

export default CarCarousel;
