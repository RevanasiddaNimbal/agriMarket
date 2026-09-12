import apiClient from '../api/apiClient';

export const adminService = {
  // Get admin dashboard metrics
  async getDashboard() {
    const response = await apiClient.get('/api/v1/admin/dashboard');
    return response.data;
  },

  // User Management
  async searchUsers(params) {
    const response = await apiClient.get('/api/v1/admin/users', { params });
    return response.data;
  },

  async getUserById(userId) {
    const response = await apiClient.get(`/api/v1/admin/users/${userId}`);
    return response.data;
  },

  async activateUser(userId) {
    const response = await apiClient.patch(`/api/v1/admin/users/${userId}/activate`);
    return response.data;
  },

  async deactivateUser(userId) {
    const response = await apiClient.patch(`/api/v1/admin/users/${userId}/deactivate`);
    return response.data;
  },

  async lockUser(userId) {
    const response = await apiClient.patch(`/api/v1/admin/users/${userId}/lock`);
    return response.data;
  },

  async unlockUser(userId) {
    const response = await apiClient.patch(`/api/v1/admin/users/${userId}/unlock`);
    return response.data;
  },

  // Product Management
  async getProducts(params) {
    const response = await apiClient.get('/api/v1/admin/products', { params });
    return response.data;
  },

  async getProductById(productId) {
    const response = await apiClient.get(`/api/v1/admin/products/${productId}`);
    return response.data;
  },

  async updateProductStatus(productId, status) {
    const response = await apiClient.patch(`/api/v1/admin/products/${productId}/status`, {
      status,
    });
    return response.data;
  },

  async deleteProduct(productId) {
    const response = await apiClient.delete(`/api/v1/admin/products/${productId}`);
    return response.data;
  },

  // Product Image Management
  async uploadProductImage(productId, file) {
    const formData = new FormData();
    formData.append('image', file);

    const response = await apiClient.post(`/api/v1/admin/products/${productId}/images`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  async getProductImages(productId) {
    const response = await apiClient.get(`/api/v1/admin/products/${productId}/images`);
    return response.data;
  },

  async updateProductImage(productId, imageId, file) {
    const formData = new FormData();
    formData.append('image', file);

    const response = await apiClient.patch(`/api/v1/admin/products/${productId}/images/${imageId}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  async deleteProductImage(productId, imageId) {
    const response = await apiClient.delete(`/api/v1/admin/products/${productId}/images/${imageId}`);
    return response.data;
  },

  async setPrimaryProductImage(productId, imageId) {
    const response = await apiClient.patch(`/api/v1/admin/products/${productId}/images/${imageId}/primary`);
    return response.data;
  },

  // Inventory Management
  async getProductInventory(productId) {
    const response = await apiClient.get(`/api/v1/admin/products/${productId}/inventory`);
    return response.data;
  },

  async updateProductInventory(productId, quantity) {
    const response = await apiClient.patch(`/api/v1/admin/products/${productId}/inventory`, {
      quantity,
    });
    return response.data;
  },

  async addProductStock(productId, quantity) {
    const response = await apiClient.post(`/api/v1/admin/products/${productId}/inventory/add`, {
      quantity,
    });
    return response.data;
  },

  async removeProductStock(productId, quantity) {
    const response = await apiClient.post(`/api/v1/admin/products/${productId}/inventory/remove`, {
      quantity,
    });
    return response.data;
  },

  // Order Management
  async getAllOrders() {
    const response = await apiClient.get('/api/v1/admin/orders');
    return response.data;
  },

  async getOrder(orderId) {
    const response = await apiClient.get(`/api/v1/admin/orders/${orderId}`);
    return response.data;
  },

  async updateOrderStatus(orderId, status) {
    const response = await apiClient.patch(`/api/v1/admin/orders/${orderId}/status`, {
      status,
    });
    return response.data;
  },

  // Payment Management
  async getAllPayments() {
    const response = await apiClient.get('/api/v1/admin/payments');
    return response.data;
  },

  async getPayment(paymentId) {
    const response = await apiClient.get(`/api/v1/admin/payments/${paymentId}`);
    return response.data;
  },

  async getPaymentsByStatus(status) {
    const response = await apiClient.get(`/api/v1/admin/payments/status/${status}`);
    return response.data;
  },

  // Payment Transaction Management
  async getAllTransactions() {
    const response = await apiClient.get('/api/v1/admin/payment-transactions');
    return response.data;
  },

  async getTransactionsByType(transactionType) {
    const response = await apiClient.get(`/api/v1/admin/payment-transactions/type/${transactionType}`);
    return response.data;
  },

  async getTransactionsByStatus(status) {
    const response = await apiClient.get(`/api/v1/admin/payment-transactions/status/${status}`);
    return response.data;
  },

  async getPaymentTransactions(paymentId) {
    const response = await apiClient.get(`/api/v1/admin/payment-transactions/payment/${paymentId}`);
    return response.data;
  },

  async getTransactionById(transactionId) {
    const response = await apiClient.get('/api/v1/admin/payment-transactions');
    const transactions = response.data || [];
    const tx = transactions.find((t) => t.id === transactionId);
    if (!tx) {
      throw new Error(`Transaction with ID ${transactionId} not found`);
    }
    return tx;
  },

  // Delivery Management
  async getAllDeliveries() {
    const response = await apiClient.get('/api/v1/admin/deliveries');
    return response.data;
  },

  async getDelivery(deliveryId) {
    const response = await apiClient.get(`/api/v1/admin/deliveries/${deliveryId}`);
    return response.data;
  },

  async markAsShipped(deliveryId) {
    const response = await apiClient.put(`/api/v1/admin/deliveries/${deliveryId}/ship`);
    return response.data;
  },

  async markAsOutForDelivery(deliveryId) {
    const response = await apiClient.put(`/api/v1/admin/deliveries/${deliveryId}/out-for-delivery`);
    return response.data;
  },
};
