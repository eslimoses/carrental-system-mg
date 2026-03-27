import { useQuery } from 'react-query';
import { vehicleAPI } from '@/api/vehicles';
import { Vehicle } from '@/types';

export const useVehicles = () => {
  const getVehicleById = (id: number) =>
    useQuery(['vehicle', id], () => vehicleAPI.getVehicleById(id).then(res => res.data));

  const getVehiclesByCity = (cityId: number) =>
    useQuery(['vehicles', 'city', cityId], () => vehicleAPI.getVehiclesByCity(cityId).then(res => res.data));

  const getAvailableVehiclesByCity = (cityId: number) =>
    useQuery(['vehicles', 'available', 'city', cityId], () => vehicleAPI.getAvailableVehiclesByCity(cityId).then(res => res.data));

  const getAvailableVehiclesByCityAndCategory = (cityId: number, categoryId: number) =>
    useQuery(
      ['vehicles', 'available', 'city', cityId, 'category', categoryId],
      () => vehicleAPI.getAvailableVehiclesByCityAndCategory(cityId, categoryId).then(res => res.data)
    );

  return {
    getVehicleById,
    getVehiclesByCity,
    getAvailableVehiclesByCity,
    getAvailableVehiclesByCityAndCategory,
  };
};
