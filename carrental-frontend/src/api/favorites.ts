import client from './client';

export const favoritesAPI = {
  addFavorite: (userId: number, vehicleId: number) =>
    client.post(`/favorites/${userId}/${vehicleId}`),

  removeFavorite: (userId: number, vehicleId: number) =>
    client.delete(`/favorites/${userId}/${vehicleId}`),

  getUserFavorites: (userId: number) =>
    client.get(`/favorites/user/${userId}`),

  getUserFavoriteVehicles: (userId: number) =>
    client.get(`/favorites/user/${userId}/vehicles`),

  isFavorite: (userId: number, vehicleId: number) =>
    client.get(`/favorites/check/${userId}/${vehicleId}`),
};
