import apiClient from '../api/apiClient';

export const inventoryService = {
  // Get product availability (public)
  async getAvailability(productId) {
    const response = await apiClient.get(`/api/v1/products/${productId}/availability`);
    return response.data;
  },

  // Get current farmer's inventory
  async getMyInventory() {
    const response = await apiClient.get('/api/v1/products/me/inventory');
    return response.data;
  },

  // Get specific product inventory
  async getProductInventory(productId) {
    const response = await apiClient.get(`/api/v1/products/${productId}/inventory`);
    return response.data;
  },

  // Update physical quantity directly
  async updateInventory(productId, quantity) {
    const response = await apiClient.patch(`/api/v1/products/${productId}/inventory`, {
      quantity,
    });
    return response.data;
  },

  // Add stock quantity
  async addStock(productId, quantity) {
    const response = await apiClient.post(`/api/v1/products/${productId}/inventory/add`, {
      quantity,
    });
    return response.data;
  },

  // Remove stock quantity
  async removeStock(productId, quantity) {
    const response = await apiClient.post(`/api/v1/products/${productId}/inventory/remove`, {
      quantity,
    });
    return response.data;
  },
};
