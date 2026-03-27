import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { authAPI } from '@/api/auth';
import { User } from '@/types';

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(authAPI.getCurrentUser());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const login = useCallback(async (email: string, password: string) => {
    setLoading(true);
    setError(null);
    try {
      const response = await authAPI.login(email, password);
      // Backend returns user data directly with token as a field
      const userData = response.data;
      const token = userData.token;
      authAPI.setAuthToken(token);
      localStorage.setItem('user', JSON.stringify(userData));
      setUser(userData);
      
      // Check for pending actions
      const pendingSubscription = localStorage.getItem('pendingSubscription');
      if (pendingSubscription) {
        localStorage.removeItem('pendingSubscription');
        navigate('/cars', { state: { subscriptionPlan: pendingSubscription } });
        return;
      }
      const role = userData.role?.toUpperCase();
      const from = (window.history.state as any)?.usr?.from || (role === 'ADMIN' || role === 'SUPER_ADMIN' ? '/admin' : '/dashboard');
      
      // Use client-side navigate to avoid 404 on Vercel without vercel.json
      navigate(from);
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Login failed');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  const logout = useCallback(() => {
    authAPI.logout();
    setUser(null);
    navigate('/login');
  }, [navigate]);

  const registerCustomer = useCallback(async (userData: Partial<User> & { password: string }) => {
    setLoading(true);
    setError(null);
    try {
      await authAPI.registerCustomer(userData);
      navigate('/login');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Registration failed');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  const registerAdmin = useCallback(async (userData: Partial<User> & { password: string }) => {
    setLoading(true);
    setError(null);
    try {
      await authAPI.registerAdmin(userData);
      navigate('/login');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Registration failed');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  const updateUserProfile = useCallback((updatedUserData: Partial<User>) => {
    const updatedUser = { ...user, ...updatedUserData } as User;
    setUser(updatedUser);
    localStorage.setItem('user', JSON.stringify(updatedUser));
  }, [user]);

  return {
    user,
    loading,
    error,
    login,
    logout,
    registerCustomer,
    registerAdmin,
    updateUserProfile,
    isAuthenticated: !!user,
  };
};
