import { useMutation, useQuery, useQueryClient } from 'react-query';
import { paymentAPI } from '@/api/payments';
import { Payment } from '@/types';

export const usePayment = () => {
  const queryClient = useQueryClient();

  const processAdvancePayment = useMutation(
    ({ bookingId, paymentData }: { bookingId: number; paymentData: Partial<Payment> }) =>
      paymentAPI.processAdvancePayment(bookingId, paymentData),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('payments');
      },
    }
  );

  const processRentalPayment = useMutation(
    ({ bookingId, paymentData }: { bookingId: number; paymentData: Partial<Payment> }) =>
      paymentAPI.processRentalPayment(bookingId, paymentData),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('payments');
      },
    }
  );

  const processExtraChargesPayment = useMutation(
    ({ bookingId, extraCharges, paymentData }: { bookingId: number; extraCharges: number; paymentData: Partial<Payment> }) =>
      paymentAPI.processExtraChargesPayment(bookingId, extraCharges, paymentData),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('payments');
      },
    }
  );

  const getBookingPayments = (bookingId: number) =>
    useQuery(['payments', 'booking', bookingId], () => paymentAPI.getBookingPayments(bookingId).then(res => res.data));

  return {
    processAdvancePayment,
    processRentalPayment,
    processExtraChargesPayment,
    getBookingPayments,
  };
};
