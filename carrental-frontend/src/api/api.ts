import axios from 'axios';

const API_BASE_URL = 'https://carrental-system-mg-production.up.railway.app/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 20000, // 20s timeout to prevent infinite hangs
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token') || localStorage.getItem('authToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle 401 errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('authToken');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const authAPI = {
  login: (email: string, password: string) =>
    api.post('/auth/login', { email, password }),
  registerCustomer: (data: any) => api.post('/auth/register/customer', data),
  registerAdmin: (data: any) => api.post('/auth/register/admin', data),
  register: (data: any) => api.post('/auth/register/customer', data),
  getProfile: (userId: number) => api.get(`/auth/profile/${userId}`),
  updateProfile: (userId: number, data: any) => api.put(`/auth/profile/${userId}`, data),
};

export const vehicleAPI = {
  getAll: () => api.get('/vehicles'),
  getById: (id: number) => api.get(`/vehicles/${id}`),
  create: (data: any) => api.post('/vehicles', data),
  update: (id: number, data: any) => api.put(`/vehicles/${id}`, data),
  delete: (id: number) => api.delete(`/vehicles/${id}`),
  search: (params: any) => api.get('/vehicles/search', { params }),
  getByCity: (cityId: number) => api.get(`/vehicles/city/${cityId}`),
  getAvailableByCity: (cityId: number) => api.get(`/vehicles/city/${cityId}/available`),
  getAvailableByCityAndCategory: (cityId: number, categoryId: number) =>
    api.get(`/vehicles/city/${cityId}/category/${categoryId}/available`),
};

export const bookingAPI = {
  create: (data: any) => api.post('/bookings', data),
  getById: (id: number) => api.get(`/bookings/${id}`),
  getAll: () => api.get('/bookings'),
  getCustomerBookings: (customerId: number) => api.get(`/bookings/customer/${customerId}`),
  getUserBookings: () => api.get('/bookings/user'),
  update: (id: number, data: any) => api.put(`/bookings/${id}`, data),
  delete: (id: number) => api.delete(`/bookings/${id}`),
  updateStatus: (id: number, status: string) =>
    api.put(`/bookings/${id}/status`, { status }),
  confirm: (id: number) => api.post(`/bookings/${id}/confirm`),
  start: (id: number) => api.post(`/bookings/${id}/start`),
  complete: (id: number, returnMileage: number) =>
    api.post(`/bookings/${id}/complete`, {}, { params: { returnMileage } }),
  cancel: (id: number) => api.post(`/bookings/${id}/cancel`),
  getLoyaltyDiscount: (customerId: number) => api.get(`/bookings/loyalty-discount/${customerId}`),
};

export const paymentAPI = {
  processPayment: (data: { bookingId: number; paymentMethod: string }) =>
    api.post('/payments/process', data),
  processAdvance: (bookingId: number, data: any) => api.post(`/payments/advance/${bookingId}`, data),
  processRental: (bookingId: number, data: any) => api.post(`/payments/rental/${bookingId}`, data),
  processExtraCharges: (bookingId: number, extraCharges: number, data: any) =>
    api.post(`/payments/extra-charges/${bookingId}`, data, { params: { extraCharges } }),
  getBookingPayments: (bookingId: number) => api.get(`/payments/booking/${bookingId}`),
  getCustomerPayments: (customerId: number) => api.get(`/payments/customer/${customerId}`),
  create: (data: any) => api.post('/payments', data),
  getById: (id: number) => api.get(`/payments/${id}`),
  getAll: () => api.get('/payments'),
  verify: (id: number) => api.post(`/payments/${id}/verify`),
};

export const userAPI = {
  getProfile: () => api.get('/users/profile'),
  updateProfile: (data: any) => api.put('/users/profile', data),
  getAll: () => api.get('/users'),
  changePassword: (data: any) => api.put('/users/change-password', data),
};

export const cityAPI = {
  getAll: () => api.get('/cities'),
  getById: (id: number) => api.get(`/cities/${id}`),
  create: (data: any) => api.post('/cities', data),
  update: (id: number, data: any) => api.put(`/cities/${id}`, data),
  delete: (id: number) => api.delete(`/cities/${id}`),
};

export const categoryAPI = {
  getAll: () => api.get('/categories'),
  getById: (id: number) => api.get(`/categories/${id}`),
  create: (data: any) => api.post('/categories', data),
  update: (id: number, data: any) => api.put(`/categories/${id}`, data),
  delete: (id: number) => api.delete(`/categories/${id}`),
};

export const adminAPI = {
  getDashboard: () => api.get('/admin/dashboard'),
  getDashboardStats: () => api.get('/admin/dashboard'),
  getUsers: () => api.get('/admin/users'),
  getAllUsers: () => api.get('/admin/users'),
  updateUser: (id: number, data: any) => api.put(`/admin/users/${id}`, data),
  deleteUser: (id: number) => api.delete(`/admin/users/${id}`),
  updateUserRole: (id: number, role: string) => api.put(`/admin/users/${id}/role`, { role }),
  updateUserStatus: (id: number, isActive: boolean) => api.put(`/admin/users/${id}/status`, { isActive }),
  getBookings: () => api.get('/admin/bookings'),
  getAllBookings: () => api.get('/admin/bookings'),
  updateBookingStatus: (id: number, status: string) => api.put(`/admin/bookings/${id}/status`, { status }),
  getVehicles: () => api.get('/admin/vehicles'),
  updateVehicleStatus: (id: number, status: string) => api.put(`/admin/vehicles/${id}/status`, { status }),
  getReports: (params: any) => api.get('/admin/reports', { params }),
  getPayments: () => api.get('/admin/payments'),
};

export const favoriteAPI = {
  add: (userId: number, vehicleId: number) => api.post(`/favorites/${userId}/${vehicleId}`),
  remove: (userId: number, vehicleId: number) => api.delete(`/favorites/${userId}/${vehicleId}`),
  getUserFavorites: (userId: number) => api.get(`/favorites/user/${userId}`),
  getUserFavoriteVehicles: (userId: number) => api.get(`/favorites/user/${userId}/vehicles`),
  check: (userId: number, vehicleId: number) => api.get(`/favorites/check/${userId}/${vehicleId}`),
};

export const promoAPI = {
  validate: (code: string, userId?: number) => api.post('/promo-codes/validate', { code, userId }),
  getAll: () => api.get('/promo-codes'),
  create: (data: any) => api.post('/promo-codes', data),
  update: (id: number, data: any) => api.put(`/promo-codes/${id}`, data),
  delete: (id: number) => api.delete(`/promo-codes/${id}`),
};

export const photoAPI = {
  uploadVehiclePhoto: (vehicleId: number, file: File, isPrimary: boolean = false) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('isPrimary', String(isPrimary));
    return api.post(`/photos/vehicle/${vehicleId}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  },
  uploadRentalPhoto: (bookingId: number, file: File, photoType: string) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('photoType', photoType);
    return api.post(`/photos/rental/${bookingId}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  },
  getVehiclePhotos: (vehicleId: number) => api.get(`/photos/vehicle/${vehicleId}`),
  getRentalPhotos: (bookingId: number) => api.get(`/photos/rental/${bookingId}`),
};

export const billAPI = {
  generate: (bookingId: number) => api.post(`/bills/generate/${bookingId}`),
  getById: (id: number) => api.get(`/bills/${id}`),
  getByBooking: (bookingId: number) => api.get(`/bills/booking/${bookingId}`),
  getUserBills: () => api.get('/bills/user'),
  sendNotification: (billId: number) => api.post(`/bills/${billId}/send`),
  markPaid: (billId: number) => api.put(`/bills/${billId}/paid`),
};

export default api;
