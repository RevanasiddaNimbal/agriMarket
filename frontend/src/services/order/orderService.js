import apiClient from '../api/apiClient';

export const orderService = {
  // Place an order (Direct Buy Flow)
  async placeOrder({ productId, quantity, addressId }) {
    const response = await apiClient.post('/api/v1/orders', {
      product_id: productId,
      quantity,
      address_id: addressId,
    });
    return response.data;
  },

  // Get all user orders
  async getMyOrders() {
    const response = await apiClient.get('/api/v1/orders');
    return response.data;
  },

  // Get specific order by ID
  async getOrder(orderId) {
    const response = await apiClient.get(`/api/v1/orders/${orderId}`);
    return response.data;
  },

  // Update order status (for seller)
  async updateOrderStatus(orderId, status) {
    const response = await apiClient.patch(`/api/v1/orders/${orderId}/status`, {
      status,
    });
    return response.data;
  },

  // Cancel order
  async cancelOrder(orderId) {
    const response = await apiClient.post(`/api/v1/orders/${orderId}/cancel`);
    return response.data;
  },

  // Track order with live timeline
  async trackOrder(orderId) {
    const response = await apiClient.get(`/api/v1/orders/${orderId}/track`);
    return response.data;
  },
};
