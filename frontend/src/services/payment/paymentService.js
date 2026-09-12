import apiClient from '../api/apiClient';

export const paymentService = {
  // Process payment for an order
  async processPayment(orderId, paymentMethod) {
    const response = await apiClient.post(`/api/v1/payments/orders/${orderId}`, {
      paymentMethod,
    });
    return response.data;
  },

  // Get payment record for an order
  async getPaymentByOrderId(orderId) {
    const response = await apiClient.get(`/api/v1/payments/orders/${orderId}`);
    return response.data;
  },

  // Request refund for a cancelled order
  async refundPayment(orderId) {
    const response = await apiClient.post(`/api/v1/payments/orders/${orderId}/refund`);
    return response.data;
  },

  // Get user's payment transactions history
  async getMyTransactions() {
    const response = await apiClient.get('/api/v1/payment-transactions');
    return response.data;
  },

  // Get transactions associated with a payment
  async getPaymentTransactions(paymentId) {
    const response = await apiClient.get(`/api/v1/payment-transactions/payment/${paymentId}`);
    return response.data;
  },
};
