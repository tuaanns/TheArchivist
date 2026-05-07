import apiClient from '../../lib/apiClient';

export const contactApi = {
  submit: (data) => apiClient.post('/contact', data),
};

