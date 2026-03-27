// OTP Service for handling SMS-based authentication
import axios from 'axios';

const API_BASE_URL = 'https://carrental-system-mg-production.up.railway.app/api'; // updated for production

interface SendOTPResponse {
  success: boolean;
  message: string;
  sessionId?: string;
}

interface VerifyOTPResponse {
  success: boolean;
  message: string;
  token?: string;
  user?: any;
}

export const otpService = {
  // Send OTP to phone number
  async sendOTP(phoneNumber: string): Promise<SendOTPResponse> {
    try {
      const response = await axios.post(`${API_BASE_URL}/auth/send-otp`, {
        phoneNumber: phoneNumber.replace(/\D/g, ''), // Remove non-digits
      });
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to send OTP');
    }
  },

  // Verify OTP code
  async verifyOTP(phoneNumber: string, otp: string, sessionId: string): Promise<VerifyOTPResponse> {
    try {
      const response = await axios.post(`${API_BASE_URL}/auth/verify-otp`, {
        phoneNumber: phoneNumber.replace(/\D/g, ''),
        otp,
        sessionId,
      });
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to verify OTP');
    }
  },

  // Resend OTP
  async resendOTP(phoneNumber: string, sessionId: string): Promise<SendOTPResponse> {
    try {
      const response = await axios.post(`${API_BASE_URL}/auth/resend-otp`, {
        phoneNumber: phoneNumber.replace(/\D/g, ''),
        sessionId,
      });
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to resend OTP');
    }
  },

  // Register with OTP
  async registerWithOTP(userData: any, otp: string, sessionId: string): Promise<VerifyOTPResponse> {
    try {
      const response = await axios.post(`${API_BASE_URL}/auth/register-otp`, {
        ...userData,
        phoneNumber: userData.phoneNumber.replace(/\D/g, ''),
        otp,
        sessionId,
      });
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to register');
    }
  },
};
