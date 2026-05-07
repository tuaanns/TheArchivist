import apiClient from '../../lib/apiClient';

export const paymentApi = {
  packages: () => apiClient.get('/payment/packages'),
  create: (packageId) => apiClient.post('/payment/create', { package_id: packageId }),
  check: (paymentId) => apiClient.get(`/payment/check/${paymentId}`),
  history: () => apiClient.get('/payment/history'),
  testComplete: (paymentId) => apiClient.post(`/payment/test-complete/${paymentId}`),
};

