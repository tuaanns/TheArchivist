import apiClient from '../../lib/apiClient';

export const authApi = {
  login: (data) => apiClient.post('/login', data),
  register: (data) => apiClient.post('/register', data),
  socialLogin: (data) => apiClient.post('/login/social', data),
  forgotPassword: (data) => apiClient.post('/forgot-password', data),
  resetPassword: (data) => apiClient.post('/reset-password', data),
  logout: () => apiClient.post('/logout'),
  me: () => apiClient.get('/user'),
};

