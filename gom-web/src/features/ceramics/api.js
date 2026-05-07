import apiClient from '../../lib/apiClient';

export const ceramicsApi = {
  list: (params = {}) => apiClient.get('/ceramic-lines', { params }),
  detail: (id) => apiClient.get(`/ceramic-lines/${id}`),
};

