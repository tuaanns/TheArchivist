import apiClient from './apiClient';

// Azure Blob Storage API
export const storageApi = {
  // Upload single file to Azure Blob Storage
  uploadSingle: async (file, folderName = 'uploads') => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('folderName', folderName);

    const response = await apiClient.post('/v1/storage/azure-blob/upload/single', formData);
    return response.data?.data || response.data;
  },

  // Upload multiple files to Azure Blob Storage
  uploadMultiple: async (files, folderName = 'uploads') => {
    const formData = new FormData();
    files.forEach((file) => {
      formData.append('files[]', file);
    });
    formData.append('folderName', folderName);

    const response = await apiClient.post('/v1/storage/azure-blob/upload/multiple', formData);
    return response.data?.data || response.data;
  },

  // Delete single file from Azure Blob Storage
  deleteSingle: async (filePath) => {
    const response = await apiClient.delete('/v1/storage/azure-blob/delete/single', {
      data: { filePath },
    });
    return response.data;
  },

  // Delete multiple files from Azure Blob Storage
  deleteMultiple: async (filePaths) => {
    const response = await apiClient.delete('/v1/storage/azure-blob/delete/multiple', {
      data: { filePaths },
    });
    return response.data;
  },
};

export default storageApi;
