import apiClient from '../../lib/apiClient';

export const historyApi = {
  list: () => apiClient.get('/history'),
  detail: (id) => apiClient.get(`/history/${id}`),
};

