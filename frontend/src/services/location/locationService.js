import apiClient from '../api/apiClient';

export const locationService = {
  // Get active states
  async getStates() {
    const response = await apiClient.get('/api/v1/locations/states');
    return response.data;
  },

  // Get active districts by state ID
  async getDistricts(stateId) {
    const response = await apiClient.get(`/api/v1/locations/states/${stateId}/districts`);
    return response.data;
  },

  // Get active taluks by district ID
  async getTaluks(districtId) {
    const response = await apiClient.get(`/api/v1/locations/districts/${districtId}/taluks`);
    return response.data;
  },

  // Search location by query
  async searchLocations(params) {
    const response = await apiClient.post('/api/v1/locations/search', null, { params });
    return response.data;
  },

  // External Geocode search
  async geocode(query) {
    const response = await apiClient.get('/api/v1/locations/geocode', {
      params: { query },
    });
    return response.data;
  },

  // Reverse geocode coordinates
  async reverseGeocode(latitude, longitude) {
    const response = await apiClient.get('/api/v1/locations/reverse-geocode', {
      params: { latitude, longitude },
    });
    return response.data;
  },
};
