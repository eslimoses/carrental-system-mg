import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Vehicle } from '@/types';

interface VehicleCardProps {
  vehicle: Vehicle;
}

const VehicleCard: React.FC<VehicleCardProps> = ({ vehicle }) => {
  const navigate = useNavigate();

  const handleBookNow = () => {
    navigate(`/booking/${vehicle.id}`);
  };

  return (
    <div className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition">
      <div className="bg-gray-300 h-48 flex items-center justify-center">
        <span className="text-4xl">🚗</span>
      </div>
      <div className="p-6">
        <h3 className="text-xl font-bold mb-2">{vehicle.make} {vehicle.model}</h3>
        <p className="text-gray-600 mb-4">{vehicle.year} • {vehicle.color}</p>
        <div className="grid grid-cols-2 gap-2 mb-4 text-sm">
          <div>
            <p className="text-gray-600">Fuel Type</p>
            <p className="font-bold">{vehicle.fuelType}</p>
          </div>
          <div>
            <p className="text-gray-600">Transmission</p>
            <p className="font-bold">{vehicle.transmission}</p>
          </div>
          <div>
            <p className="text-gray-600">Seats</p>
            <p className="font-bold">{vehicle.seatingCapacity}</p>
          </div>
          <div>
            <p className="text-gray-600">Mileage</p>
            <p className="font-bold">{vehicle.mileage} km</p>
          </div>
        </div>
        <div className="border-t pt-4 mb-4">
          <div className="grid grid-cols-3 gap-2 text-center">
            <div>
              <p className="text-gray-600 text-sm">Daily</p>
              <p className="font-bold text-lg">₹{vehicle.dailyRate}</p>
            </div>
            <div>
              <p className="text-gray-600 text-sm">Weekly</p>
              <p className="font-bold text-lg">₹{vehicle.weeklyRate}</p>
            </div>
            <div>
              <p className="text-gray-600 text-sm">Monthly</p>
              <p className="font-bold text-lg">₹{vehicle.monthlyRate}</p>
            </div>
          </div>
        </div>
        <button
          onClick={handleBookNow}
          className="w-full bg-blue-600 text-white font-bold py-2 rounded hover:bg-blue-700 transition"
        >
          Book Now
        </button>
      </div>
    </div>
  );
};

export default VehicleCard;
