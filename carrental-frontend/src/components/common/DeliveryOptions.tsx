import React, { useState, useEffect } from 'react';
import { FiMapPin, FiTruck, FiHome, FiClock } from 'react-icons/fi';
import { FaRupeeSign } from 'react-icons/fa';

// Icon aliases
const MapPin = FiMapPin;
const Truck = FiTruck;
const Home = FiHome;
const Clock = FiClock;
const IndianRupee = FaRupeeSign;

interface DeliveryOptionsProps {
  cityDeliveryRate: number; // Rate per km
  onDeliveryChange: (delivery: DeliveryInfo) => void;
}

export interface DeliveryInfo {
  type: 'pickup' | 'delivery';
  address?: string;
  distance?: number;
  fee: number;
  estimatedTime?: string;
}

const DeliveryOptions: React.FC<DeliveryOptionsProps> = ({
  cityDeliveryRate = 15,
  onDeliveryChange
}) => {
  const [deliveryType, setDeliveryType] = useState<'pickup' | 'delivery'>('pickup');
  const [address, setAddress] = useState('');
  const [distance, setDistance] = useState<number>(0);
  const [fee, setFee] = useState(0);

  // Predefined distance options for demo
  const distanceOptions = [
    { label: 'Within 5 km', value: 5, time: '15-20 mins' },
    { label: '5-10 km', value: 10, time: '25-35 mins' },
    { label: '10-15 km', value: 15, time: '35-45 mins' },
    { label: '15-20 km', value: 20, time: '45-60 mins' },
    { label: '20-30 km', value: 30, time: '60-90 mins' },
  ];

  useEffect(() => {
    const calculatedFee = deliveryType === 'delivery' ? distance * cityDeliveryRate : 0;
    setFee(calculatedFee);
    
    const selectedOption = distanceOptions.find(opt => opt.value === distance);
    
    onDeliveryChange({
      type: deliveryType,
      address: deliveryType === 'delivery' ? address : undefined,
      distance: deliveryType === 'delivery' ? distance : undefined,
      fee: calculatedFee,
      estimatedTime: selectedOption?.time
    });
  }, [deliveryType, address, distance, cityDeliveryRate]);

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6 space-y-6">
      <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
        <Truck className="w-5 h-5 text-yellow-500" />
        Delivery Options
      </h3>

      {/* Delivery Type Selection */}
      <div className="grid grid-cols-2 gap-4">
        <button
          type="button"
          onClick={() => setDeliveryType('pickup')}
          className={`p-4 rounded-xl border-2 transition-all duration-300 flex flex-col items-center gap-2 ${
            deliveryType === 'pickup'
              ? 'border-yellow-500 bg-yellow-50 shadow-md'
              : 'border-gray-200 hover:border-yellow-300'
          }`}
        >
          <div className={`p-3 rounded-full ${deliveryType === 'pickup' ? 'bg-yellow-500 text-white' : 'bg-gray-100 text-gray-500'}`}>
            <MapPin className="w-6 h-6" />
          </div>
          <span className={`font-medium ${deliveryType === 'pickup' ? 'text-yellow-700' : 'text-gray-600'}`}>
            Self Pickup
          </span>
          <span className="text-sm text-gray-400">Pick from our location</span>
          <span className="text-green-600 font-semibold">FREE</span>
        </button>

        <button
          type="button"
          onClick={() => setDeliveryType('delivery')}
          className={`p-4 rounded-xl border-2 transition-all duration-300 flex flex-col items-center gap-2 ${
            deliveryType === 'delivery'
              ? 'border-yellow-500 bg-yellow-50 shadow-md'
              : 'border-gray-200 hover:border-yellow-300'
          }`}
        >
          <div className={`p-3 rounded-full ${deliveryType === 'delivery' ? 'bg-yellow-500 text-white' : 'bg-gray-100 text-gray-500'}`}>
            <Home className="w-6 h-6" />
          </div>
          <span className={`font-medium ${deliveryType === 'delivery' ? 'text-yellow-700' : 'text-gray-600'}`}>
            Home Delivery
          </span>
          <span className="text-sm text-gray-400">Delivered to your door</span>
          <span className="text-yellow-600 font-semibold">₹{cityDeliveryRate}/km</span>
        </button>
      </div>

      {/* Delivery Details */}
      {deliveryType === 'delivery' && (
        <div className="space-y-4 animate-fadeIn">
          {/* Address Input */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Delivery Address
            </label>
            <textarea
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="Enter your complete delivery address..."
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-yellow-500 focus:border-transparent resize-none"
              rows={3}
            />
          </div>

          {/* Distance Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Approximate Distance from City Center
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {distanceOptions.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => setDistance(option.value)}
                  className={`p-3 rounded-lg border text-sm transition-all ${
                    distance === option.value
                      ? 'border-yellow-500 bg-yellow-50 text-yellow-700'
                      : 'border-gray-200 hover:border-yellow-300 text-gray-600'
                  }`}
                >
                  <div className="font-medium">{option.label}</div>
                  <div className="text-xs text-gray-400 flex items-center justify-center gap-1 mt-1">
                    <Clock className="w-3 h-3" />
                    {option.time}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Fee Display */}
          {distance > 0 && (
            <div className="bg-gradient-to-r from-yellow-50 to-orange-50 rounded-xl p-4 border border-yellow-200">
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-sm text-gray-600">Delivery Fee</p>
                  <p className="text-xs text-gray-400">{distance} km × ₹{cityDeliveryRate}/km</p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-yellow-600 flex items-center">
                    <IndianRupee className="w-5 h-5" />
                    {fee}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Self Pickup Info */}
      {deliveryType === 'pickup' && (
        <div className="bg-green-50 rounded-xl p-4 border border-green-200">
          <div className="flex items-start gap-3">
            <MapPin className="w-5 h-5 text-green-600 mt-0.5" />
            <div>
              <p className="font-medium text-green-800">Pickup Location</p>
              <p className="text-sm text-green-600 mt-1">
                MotoGlide Car Rental Hub, Main Road, City Center
              </p>
              <p className="text-xs text-green-500 mt-2">
                Open 24/7 • Free parking available
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DeliveryOptions;
