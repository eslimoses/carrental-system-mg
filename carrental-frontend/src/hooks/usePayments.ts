import { useMutation, useQuery, useQueryClient } from 'react-query';
import { paymentAPI } from '@/api/api';

export const usePayments = (customerId?: number) => {
  const queryClient = useQueryClient();

  // Fetch customer payments (full history)
  const {
    data: payments = [],
    isLoading,
    refetch,
  } = useQuery(
    ['payments', 'customer', customerId],
    () => paymentAPI.getCustomerPayments(customerId!).then(res => res.data),
    { enabled: !!customerId }
  );

  // Process unified payment - invalidates everything related to booking and status
  const processFullPayment = useMutation(
    (paymentData: { bookingId: number; paymentMethod: string; payerDetails?: string }) =>
      paymentAPI.processPayment(paymentData).then(res => res.data),
    {
      onSuccess: (data) => {
        // Invalidate queries to trigger instant UI updates
        queryClient.invalidateQueries('bookings');
        queryClient.invalidateQueries(['payments', 'customer', customerId]);
        queryClient.invalidateQueries(['booking', data.bookingId]);
        queryClient.invalidateQueries('cars');
        queryClient.invalidateQueries('vehicles');
      },
    }
  );

  const processAdvancePayment = useMutation(
    (paymentData: { bookingId: number; paymentMethod: string; transactionId?: string; payerDetails?: string }) =>
      paymentAPI.processAdvance(paymentData.bookingId, paymentData).then((res: any) => res.data),
    {
      onSuccess: (data) => {
        queryClient.invalidateQueries('bookings');
        queryClient.invalidateQueries(['payments', 'customer', customerId]);
        queryClient.invalidateQueries(['booking', data.booking?.id || data.bookingId]);
        queryClient.invalidateQueries('cars');
        queryClient.invalidateQueries('vehicles');
      },
    }
  );

  // Get payments for a specific booking
  const getBookingPayments = (bookingId: number) =>
    useQuery(
      ['payments', 'booking', bookingId],
      () => paymentAPI.getBookingPayments(bookingId).then(res => res.data),
      { enabled: !!bookingId }
    );

  return {
    payments,
    isLoading,
    refetch,
    processFullPayment,
    processAdvancePayment,
    getBookingPayments,
  };
};
