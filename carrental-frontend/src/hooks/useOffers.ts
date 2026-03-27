import { useQuery } from 'react-query';
import { promoAPI } from '../api/api';

export const useOffers = () => {
  return useQuery({
    queryKey: ['offers'],
    queryFn: () => promoAPI.getAll().then(res => res.data),
  });
};
