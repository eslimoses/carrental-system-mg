import client from './client';
import { User } from '@/types';

export const authAPI = {
  registerCustomer: (userData: Partial<User> & { password: string }) =>
    client.post('/auth/register/customer', userData),

  registerAdmin: (userData: Partial<User> & { password: string }) =>
    client.post('/auth/register/admin', userData),

  login: (email: string, password: string) =>
    client.post('/auth/login', { email, password }),

  sendOtp: (email: string, phoneNumber?: string) =>
    client.post('/auth/send-otp', { email, phoneNumber }),

  verifyOtp: (phoneNumber: string, otp: string) =>
    client.post('/auth/verify-otp', { phoneNumber, otp }),

  logout: () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
  },

  getCurrentUser: () => {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  },

  setAuthToken: (token: string) => {
    localStorage.setItem('authToken', token);
  },

  getAuthToken: () => localStorage.getItem('authToken'),

  updateProfile: (userId: number | undefined, profileData: any) =>
    client.put(`/auth/profile/${userId}`, profileData),

  getProfile: (userId: number | undefined) =>
    client.get(`/auth/profile/${userId}`),
};
