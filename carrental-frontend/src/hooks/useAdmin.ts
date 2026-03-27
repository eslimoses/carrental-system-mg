import { useQuery, useMutation, useQueryClient } from 'react-query';
import { adminAPI, vehicleAPI, cityAPI, categoryAPI, promoAPI, bookingAPI } from '../api/api';

export const useAdminStats = () => {
  return useQuery('admin-stats', () => adminAPI.getDashboard().then(res => res.data), {
    staleTime: 5 * 60 * 1000,
  });
};

export const useAdminVehicles = () => {
  return useQuery({
    queryKey: ['admin-vehicles'],
    queryFn: () => adminAPI.getVehicles().then(res => res.data),
  });
};

export const useAdminBookings = () => {
  return useQuery({
    queryKey: ['admin-bookings'],
    queryFn: () => adminAPI.getBookings().then(res => res.data),
  });
};

export const useAdminPayments = () => {
  return useQuery({
    queryKey: ['admin-payments'],
    queryFn: () => adminAPI.getPayments().then(res => res.data),
  });
};

export const useAdminUsers = () => {
  return useQuery({
    queryKey: ['admin-users'],
    queryFn: () => adminAPI.getUsers().then(res => res.data),
  });
};

export const useAdminOffers = () => {
  return useQuery({
    queryKey: ['admin-offers'],
    queryFn: () => promoAPI.getAll().then(res => res.data),
  });
};

export const useCustomerActivities = () => {
  return useQuery({
    queryKey: ['customer-activities'],
    queryFn: () => bookingAPI.getAll().then(res => res.data),
  });
};

export const useAdminActions = () => {
  const queryClient = useQueryClient();

  const deleteUser = useMutation({
    mutationFn: (id: number) => adminAPI.deleteUser(id),
    onSuccess: () => queryClient.invalidateQueries(['admin-users']),
  });

  const updateUserStatus = useMutation({
    mutationFn: ({ id, isActive }: { id: number; isActive: boolean }) => adminAPI.updateUserStatus(id, isActive),
    onSuccess: () => {
      queryClient.invalidateQueries(['admin-users']);
      queryClient.invalidateQueries(['admin-stats']);
    },
  });

  const updateBookingStatus = useMutation({
    mutationFn: ({ id, status }: { id: number; status: string }) => adminAPI.updateBookingStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries(['admin-bookings']);
      queryClient.invalidateQueries(['admin-vehicles']);
      queryClient.invalidateQueries(['admin-stats']);
      queryClient.invalidateQueries(['vehicles']);
      queryClient.invalidateQueries(['bookings']);
    },
  });

  return { deleteUser, updateUserStatus, updateBookingStatus };
};

export const useVehicleManagement = () => {
  const queryClient = useQueryClient();

  const createVehicle = useMutation({
    mutationFn: (data: any) => vehicleAPI.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries(['admin-vehicles']);
      queryClient.invalidateQueries(['vehicles']);
      queryClient.invalidateQueries(['favorites']);
    },
  });

  const updateVehicle = useMutation({
    mutationFn: ({ id, data }: { id: number; data: any }) => vehicleAPI.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['admin-vehicles']);
      queryClient.invalidateQueries(['vehicles']);
      queryClient.invalidateQueries(['favorites']);
    },
  });

  const deleteVehicle = useMutation({
    mutationFn: (id: number) => vehicleAPI.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries(['admin-vehicles']);
      queryClient.invalidateQueries(['admin-stats']);
      queryClient.invalidateQueries(['vehicles']);
      queryClient.invalidateQueries(['favorites']);
    },
  });

  return { createVehicle, updateVehicle, deleteVehicle };
};

export const useCityManagement = () => {
  const queryClient = useQueryClient();

  const createCity = useMutation({
    mutationFn: (data: any) => cityAPI.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries(['cities']);
      queryClient.invalidateQueries(['admin-stats']);
      alert('City created successfully!');
    },
    onError: (error: any) => {
      const msg = error?.response?.data?.error || error?.response?.data || 'Failed to create city';
      alert(msg);
    },
  });

  const updateCity = useMutation({
    mutationFn: ({ id, data }: { id: number; data: any }) => cityAPI.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['cities']);
      queryClient.invalidateQueries(['admin-stats']);
    },
  });

  const deleteCity = useMutation({
    mutationFn: (id: number) => cityAPI.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries(['cities']);
      queryClient.invalidateQueries(['admin-stats']);
      alert('City deleted successfully!');
    },
    onError: (error: any) => {
      const msg = error?.response?.data?.error || error?.response?.data || 'Failed to delete city. It may have vehicles or bookings linked to it.';
      alert(msg);
    },
  });

  return { createCity, updateCity, deleteCity };
};

export const useCategories = () => {
  return useQuery('categories', () => categoryAPI.getAll().then(res => res.data));
};

export const useCategoryManagement = () => {

  const queryClient = useQueryClient();

  const createCategory = useMutation({
    mutationFn: (data: any) => categoryAPI.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries(['categories']);
    },
  });

  const updateCategory = useMutation({
    mutationFn: ({ id, data }: { id: number; data: any }) => categoryAPI.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['categories']);
    },
  });

  const deleteCategory = useMutation({
    mutationFn: (id: number) => categoryAPI.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries(['categories']);
    },
  });

  return { createCategory, updateCategory, deleteCategory };
};

export const useOfferManagement = () => {
  const queryClient = useQueryClient();

  const createOffer = useMutation({
    mutationFn: (data: any) => promoAPI.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries(['admin-offers']);
      queryClient.invalidateQueries(['offers']);
      queryClient.invalidateQueries(['admin-stats']);
    },
  });

  const updateOffer = useMutation({
    mutationFn: ({ id, data }: { id: number; data: any }) => promoAPI.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['admin-offers']);
      queryClient.invalidateQueries(['offers']);
      queryClient.invalidateQueries(['admin-stats']);
    },
  });

  const deleteOffer = useMutation({
    mutationFn: (id: number) => promoAPI.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries(['admin-offers']);
      queryClient.invalidateQueries(['offers']);
      queryClient.invalidateQueries(['admin-stats']);
      alert('Offer deleted successfully!');
    },
    onError: (error: any) => {
      const msg = error?.response?.data?.error || error?.response?.data || 'Failed to delete offer';
      alert(msg);
    },
  });

  return { createOffer, updateOffer, deleteOffer };
};
