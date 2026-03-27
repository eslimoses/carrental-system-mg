import { useQuery } from 'react-query';
import { cityAPI } from '@/api/api';
import { City } from '@/types';

export const useCities = () => {
  const {
    data: cities = [],
    isLoading,
    error,
    refetch,
  } = useQuery<City[]>('cities', () => cityAPI.getAll().then(res => res.data));

  const getCityById = (id: number) => cities.find(city => city.id === id);

  return {
    cities,
    isLoading,
    error,
    refetch,
    getCityById,
  };
};
