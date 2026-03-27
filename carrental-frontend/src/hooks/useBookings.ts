import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from 'react-query';
import { bookingAPI } from '@/api/api';

export const useBookings = (customerId?: number) => {
  const queryClient = useQueryClient();
  const [error, setError] = useState<string | null>(null);

  // Fetch customer bookings
  const {
    data: bookings = [],
    isLoading,
    refetch,
  } = useQuery(
    ['bookings', 'customer', customerId],
    () => bookingAPI.getCustomerBookings(customerId!).then(res => res.data),
    { enabled: !!customerId }
  );

  // Create booking — invalidates bookings AND vehicles (availability changed)
  const createBooking = useMutation(
    (bookingData: any) => bookingAPI.create(bookingData),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('bookings');
        queryClient.invalidateQueries('cars');
        queryClient.invalidateQueries('vehicles');
      },
      onError: (err: any) => {
        setError(err.response?.data?.message || err.response?.data || 'Failed to create booking');
      },
    }
  );

  // Cancel booking — invalidates bookings, vehicles, AND payments
  const cancelBooking = useMutation(
    (id: number) => bookingAPI.cancel(id),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('bookings');
        queryClient.invalidateQueries('cars');
        queryClient.invalidateQueries('vehicles');
        queryClient.invalidateQueries('payments');
      },
    }
  );

  // Edit booking
  const updateBooking = useMutation(
    ({ id, data }: { id: number; data: any }) => bookingAPI.update(id, data),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('bookings');
      },
    }
  );

  // Delete booking
  const deleteBooking = useMutation(
    (id: number) => bookingAPI.delete(id),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('bookings');
        queryClient.invalidateQueries('cars');
        queryClient.invalidateQueries('vehicles');
      },
    }
  );

  // Get single booking
  const getBookingById = (id: number) =>
    useQuery(['booking', id], () => bookingAPI.getById(id).then(res => res.data), {
      enabled: !!id,
    });

  // Loyalty discount
  const getLoyaltyDiscount = (custId: number) =>
    useQuery(
      ['loyalty-discount', custId],
      () => bookingAPI.getLoyaltyDiscount(custId).then(res => res.data),
      { enabled: !!custId }
    );

  return {
    bookings,
    isLoading,
    error,
    setError,
    refetch,
    createBooking,
    cancelBooking,
    updateBooking,
    deleteBooking,
    getBookingById,
    getLoyaltyDiscount,
  };
};
