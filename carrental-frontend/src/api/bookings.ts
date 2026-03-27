import client from './client';
import { Booking } from '@/types';

export const bookingAPI = {
  createBooking: (bookingData: Partial<Booking>) =>
    client.post<Booking>('/bookings', bookingData),

  getBookingById: (id: number) =>
    client.get<Booking>(`/bookings/${id}`),

  getCustomerBookings: (customerId: number) =>
    client.get<Booking[]>(`/bookings/customer/${customerId}`),

  confirmBooking: (id: number) =>
    client.post(`/bookings/${id}/confirm`, {}),

  startRental: (id: number) =>
    client.post(`/bookings/${id}/start`, {}),

  completeRental: (id: number, returnMileage: number) =>
    client.post(`/bookings/${id}/complete`, {}, { params: { returnMileage } }),

  cancelBooking: (id: number) =>
    client.post(`/bookings/${id}/cancel`, {}),
};
