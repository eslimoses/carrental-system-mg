import { useMutation, useQuery, useQueryClient } from 'react-query';
import { billAPI } from '@/api/bills';

export const useBill = () => {
  const queryClient = useQueryClient();

  const generateBill = useMutation(
    (bookingId: number) => billAPI.generateBill(bookingId),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('bills');
      },
    }
  );

  const getBillById = (id: number) =>
    useQuery(['bill', id], () => billAPI.getBillById(id).then(res => res.data));

  const getBillByBookingId = (bookingId: number) =>
    useQuery(['bill', 'booking', bookingId], () => billAPI.getBillByBookingId(bookingId).then(res => res.data));

  const getCustomerBills = (customerId: number) =>
    useQuery(['bills', 'customer', customerId], () => billAPI.getCustomerBills(customerId).then(res => res.data));

  const markBillAsPaid = useMutation(
    (id: number) => billAPI.markBillAsPaid(id),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('bills');
      },
    }
  );

  const sendBillNotification = useMutation(
    (id: number) => billAPI.sendBillNotification(id),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('bills');
      },
    }
  );

  return {
    generateBill,
    getBillById,
    getBillByBookingId,
    getCustomerBills,
    markBillAsPaid,
    sendBillNotification,
  };
};
