import axios from 'axios';
import { useAuthStore } from '../store/authStore';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Request interceptor to add auth token
api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor to handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      useAuthStore.getState().logout();
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authApi = {
  login: (credentials: { email: string; password: string }) =>
    api.post('/auth/login', credentials),
  
  register: (userData: any) =>
    api.post('/auth/register', userData),
  
  logout: () =>
    api.post('/auth/logout'),
  
  refreshToken: (refreshToken: string) =>
    api.post('/auth/refresh-token', { refreshToken }),
  
  requestPasswordReset: (email: string) =>
    api.post('/auth/request-password-reset', { email }),
  
  resetPassword: (token: string, newPassword: string) =>
    api.post('/auth/reset-password', { token, newPassword })
};

// Events API
export const eventsApi = {
  searchEvents: (params: any) =>
    api.get('/events/search', { params }),
  
  getEvent: (id: string) =>
    api.get(`/events/${id}`),
  
  createEvent: (eventData: any) =>
    api.post('/events', eventData),
  
  updateEvent: (id: string, eventData: any) =>
    api.put(`/events/${id}`, eventData),
  
  deleteEvent: (id: string) =>
    api.delete(`/events/${id}`),
  
  publishEvent: (id: string) =>
    api.post(`/events/${id}/publish`),
  
  cancelEvent: (id: string, reason: string) =>
    api.post(`/events/${id}/cancel`, { reason }),
  
  getMyEvents: (params: any) =>
    api.get('/events/my/events', { params }),
  
  getEventCapacity: (id: string) =>
    api.get(`/events/${id}/capacity`),
  
  getEventAttendees: (id: string) =>
    api.get(`/events/${id}/attendees`),
  
  getEventAnalytics: (id: string) =>
    api.get(`/events/${id}/analytics`),

  // Registration methods
  registerForEvent: (registrationData: any) =>
    api.post('/registrations', registrationData),

  getUserRegistrations: () =>
    api.get('/registrations/my')
};

// Users API
export const usersApi = {
  getProfile: () =>
    api.get('/users/profile'),
  
  updateProfile: (profileData: any) =>
    api.put('/users/profile', profileData),
  
  uploadAvatar: (file: File) => {
    const formData = new FormData();
    formData.append('avatar', file);
    return api.post('/users/avatar', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  }
};

// Payments API
export const paymentsApi = {
  createSubscription: (subscriptionData: any) =>
    api.post('/payments/subscriptions', subscriptionData),
  
  getSubscription: () =>
    api.get('/payments/subscription'),
  
  cancelSubscription: () =>
    api.delete('/payments/subscription'),
  
  purchaseTickets: (purchaseData: any) =>
    api.post('/payments/tickets', purchaseData),
  
  getTickets: () =>
    api.get('/payments/tickets'),
  
  getTransactions: () =>
    api.get('/payments/transactions')
};

export default api;