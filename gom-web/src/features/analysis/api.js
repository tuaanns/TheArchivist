import apiClient from '../../lib/apiClient';

export const analysisApi = {
  predict: (formData) =>
    apiClient.post('/predict', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      timeout: 600000, // 10 minutes for slow cloud backend
    }),
  chat: (question) => apiClient.post('/ai/chat', { question }),
  getStats: () => apiClient.get('/stats'),
};

