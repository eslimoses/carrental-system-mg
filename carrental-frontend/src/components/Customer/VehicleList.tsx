import React from 'react';
import { useVehicles } from '@/hooks';
import VehicleCard from './VehicleCard';

interface VehicleListProps {
  cityId: number;
  categoryId: number;
}

const VehicleList: React.FC<VehicleListProps> = ({ cityId, categoryId }) => {
  const { getAvailableVehiclesByCityAndCategory } = useVehicles();
  const { data: vehicles, isLoading, error } = getAvailableVehiclesByCityAndCategory(cityId, categoryId);

  if (isLoading) return <div className="text-center py-8">Loading vehicles...</div>;
  if (error) return <div className="text-red-600 py-8">Error loading vehicles</div>;
  if (!vehicles || vehicles.length === 0) return <div className="text-gray-600 py-8">No vehicles available</div>;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {vehicles.map(vehicle => (
        <VehicleCard key={vehicle.id} vehicle={vehicle} />
      ))}
    </div>
  );
};

export default VehicleList;
