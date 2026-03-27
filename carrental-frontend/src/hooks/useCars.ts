import { useQuery } from 'react-query';
import { vehicleAPI } from '@/api/api';

interface SearchParams {
  city?: string;
  category?: string;
  transmission?: string;
  minPrice?: number;
  maxPrice?: number;
}

export const useCars = (searchParams: SearchParams = {}, enabled: boolean = true) => {
  const queryKey = ['cars', searchParams];

  const {
    data: cars = [],
    isLoading,
    error,
    refetch,
  } = useQuery(
    queryKey,
    () => vehicleAPI.search(searchParams).then(res => res.data),
    {
      enabled,
      keepPreviousData: true,
    }
  );

  return {
    cars,
    isLoading,
    error,
    refetch,
  };
};

export const useCarDetail = (id: number) => {
  const {
    data: car,
    isLoading,
    error,
  } = useQuery(
    ['car', id],
    () => vehicleAPI.getById(id).then(res => res.data),
    { enabled: !!id }
  );

  return { car, isLoading, error };
};
