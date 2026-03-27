import { useMutation, useQuery, useQueryClient } from 'react-query';
import { favoriteAPI } from '@/api/api';

export const useFavorites = (userId: number | null) => {
  const queryClient = useQueryClient();

  const {
    data: favoritesData,
    isLoading,
    error,
    refetch,
  } = useQuery(
    ['favorites', userId],
    () => favoriteAPI.getUserFavoriteVehicles(userId!).then(res => res.data),
    { enabled: !!userId }
  );

  const favorites = favoritesData?.vehicles || favoritesData || [];

  const addFavorite = useMutation(
    (vehicleId: number) => favoriteAPI.add(userId!, vehicleId),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['favorites', userId]);
      },
    }
  );

  const removeFavorite = useMutation(
    (vehicleId: number) => favoriteAPI.remove(userId!, vehicleId),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['favorites', userId]);
      },
    }
  );

  const checkFavorite = (vehicleId: number) =>
    useQuery(
      ['favorite-check', userId, vehicleId],
      () => favoriteAPI.check(userId!, vehicleId).then(res => res.data?.isFavorite),
      { enabled: !!userId && !!vehicleId }
    );

  return {
    favorites,
    isLoading,
    error,
    refetch,
    addFavorite,
    removeFavorite,
    checkFavorite,
  };
};
