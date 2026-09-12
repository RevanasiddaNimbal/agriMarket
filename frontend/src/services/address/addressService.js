import apiClient from '../api/apiClient';

export const addressService = {
  // Get all user addresses
  async getUserAddresses() {
    const response = await apiClient.get('/api/v1/addresses');
    return response.data;
  },

  // Create new address
  async createAddress(addressData) {
    const response = await apiClient.post('/api/v1/addresses', addressData);
    return response.data;
  },

  // Get specific address by ID
  async getAddress(addressId) {
    const response = await apiClient.get(`/api/v1/addresses/${addressId}`);
    return response.data;
  },

  // Update address
  async updateAddress(addressId, addressData) {
    const response = await apiClient.patch(`/api/v1/addresses/${addressId}`, addressData);
    return response.data;
  },

  // Set default address
  async setDefaultAddress(addressId) {
    const response = await apiClient.patch(`/api/v1/addresses/${addressId}/default`);
    return response.data;
  },

  // Delete address
  async deleteAddress(addressId) {
    const response = await apiClient.delete(`/api/v1/addresses/${addressId}`);
    return response.data;
  },
};
