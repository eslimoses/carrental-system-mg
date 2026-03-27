import { useState, useCallback } from 'react';
import { useMutation, useQuery, useQueryClient } from 'react-query';
import { bookingAPI } from '@/api/bookings';
import { Booking } from '@/types';

export const useBooking = () => {
  const queryClient = useQueryClient();
  const [error, setError] = useState<string | null>(null);

  const createBooking = useMutation(
    (bookingData: Partial<Booking>) => bookingAPI.createBooking(bookingData),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('bookings');
      },
      onError: (err: any) => {
        setError(err.response?.data?.message || 'Failed to create booking');
      },
    }
  );

  const getBookingById = (id: number) =>
    useQuery(['booking', id], () => bookingAPI.getBookingById(id).then(res => res.data));

  const getCustomerBookings = (customerId: number) =>
    useQuery(['bookings', 'customer', customerId], () => bookingAPI.getCustomerBookings(customerId).then(res => res.data));

  const confirmBooking = useMutation(
    (id: number) => bookingAPI.confirmBooking(id),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('bookings');
      },
    }
  );

  const startRental = useMutation(
    (id: number) => bookingAPI.startRental(id),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('bookings');
      },
    }
  );

  const completeRental = useMutation(
    ({ id, returnMileage }: { id: number; returnMileage: number }) =>
      bookingAPI.completeRental(id, returnMileage),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('bookings');
      },
    }
  );

  const cancelBooking = useMutation(
    (id: number) => bookingAPI.cancelBooking(id),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('bookings');
      },
    }
  );

  return {
    createBooking,
    getBookingById,
    getCustomerBookings,
    confirmBooking,
    startRental,
    completeRental,
    cancelBooking,
    error,
    setError,
  };
};
