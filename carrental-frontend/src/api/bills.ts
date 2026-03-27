import client from './client';
import { Bill } from '@/types';

export const billAPI = {
  generateBill: (bookingId: number) =>
    client.post<Bill>(`/bills/generate/${bookingId}`, {}),

  getBillById: (id: number) =>
    client.get<Bill>(`/bills/${id}`),

  getBillByBookingId: (bookingId: number) =>
    client.get<Bill>(`/bills/booking/${bookingId}`),

  getCustomerBills: (customerId: number) =>
    client.get<Bill[]>(`/bills/customer/${customerId}`),

  markBillAsPaid: (id: number) =>
    client.post(`/bills/${id}/mark-paid`, {}),

  sendBillNotification: (id: number) =>
    client.post(`/bills/${id}/send-notification`, {}),
};
