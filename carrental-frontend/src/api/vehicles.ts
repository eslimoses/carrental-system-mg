import client from './client';
import { Vehicle } from '@/types';

export const vehicleAPI = {
  getVehicleById: (id: number) =>
    client.get<Vehicle>(`/vehicles/${id}`),

  getVehiclesByCity: (cityId: number) =>
    client.get<Vehicle[]>(`/vehicles/city/${cityId}`),

  getAvailableVehiclesByCity: (cityId: number) =>
    client.get<Vehicle[]>(`/vehicles/city/${cityId}/available`),

  getAvailableVehiclesByCityAndCategory: (cityId: number, categoryId: number) =>
    client.get<Vehicle[]>(`/vehicles/city/${cityId}/category/${categoryId}/available`),

  createVehicle: (vehicleData: Partial<Vehicle>) =>
    client.post('/vehicles', vehicleData),
};
