import apiClient from '../api/apiClient';

export const deliveryService = {
  // Get delivery details for an order
  async getDeliveryByOrderId(orderId) {
    const response = await apiClient.get(`/api/v1/deliveries/orders/${orderId}`);
    return response.data;
  },

  // Generate delivery OTP (sent to user email)
  async generateDeliveryOtp(orderId) {
    const response = await apiClient.post('/api/v1/deliveries/otp', { orderId });
    return response.data;
  },

  // Verify delivery OTP upon delivery completion
  async verifyDeliveryOtp(orderId, otp) {
    const response = await apiClient.post('/api/v1/deliveries/otp/verify', {
      orderId,
      otp,
    });
    return response.data;
  },
};
