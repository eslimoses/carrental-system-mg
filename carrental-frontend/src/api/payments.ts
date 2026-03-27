import client from './client';
import { Payment } from '@/types';

export const paymentAPI = {
  processAdvancePayment: (bookingId: number, paymentData: Partial<Payment>) =>
    client.post<Payment>(`/payments/advance/${bookingId}`, paymentData),

  processRentalPayment: (bookingId: number, paymentData: Partial<Payment>) =>
    client.post<Payment>(`/payments/rental/${bookingId}`, paymentData),

  processExtraChargesPayment: (bookingId: number, extraCharges: number, paymentData: Partial<Payment>) =>
    client.post<Payment>(`/payments/extra-charges/${bookingId}`, paymentData, { params: { extraCharges } }),

  getBookingPayments: (bookingId: number) =>
    client.get<Payment[]>(`/payments/booking/${bookingId}`),
};
