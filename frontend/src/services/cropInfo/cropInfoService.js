import apiClient from '../api/apiClient';

export const cropInfoService = {
  // Get featured crop summaries
  async getFeaturedCrops() {
    const response = await apiClient.get('/api/v1/crops/info');
    return response.data;
  },

  // Search crop info
  async searchCrops(query) {
    const response = await apiClient.get('/api/v1/crops/info/search', {
      params: { query },
    });
    return response.data;
  },

  // Get detailed crop guide by ID
  async getCropDetails(cropId) {
    const response = await apiClient.get(`/api/v1/crops/info/${cropId}`);
    return response.data;
  },
};
