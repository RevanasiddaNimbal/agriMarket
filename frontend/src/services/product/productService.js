import apiClient from '../api/apiClient';

export const productService = {
  // Get all active marketplace products
  async getAllProducts() {
    const response = await apiClient.get('/api/v1/products');
    return response.data;
  },

  // Get product by ID
  async getProductById(productId) {
    const response = await apiClient.get(`/api/v1/products/${productId}`);
    return response.data;
  },

  // Search and filter marketplace products (with pagination)
  async searchProducts(params) {
    const response = await apiClient.get('/api/v1/products/search', { params });
    return response.data;
  },

  // Get products owned by authenticated user
  async getMyProducts() {
    const response = await apiClient.get('/api/v1/products/me');
    return response.data;
  },

  // Search products owned by authenticated user
  async searchMyProducts(params) {
    const response = await apiClient.get('/api/v1/products/me/search', { params });
    return response.data;
  },

  // Create a new product
  async createProduct(productData) {
    const payload = {
      ...productData,
      category_id: productData.category_id || productData.categoryId,
    };
    const response = await apiClient.post('/api/v1/products', payload);
    return response.data;
  },

  // Update existing product
  async updateProduct(productId, productData) {
    const payload = {
      ...productData,
      category_id: productData.category_id || productData.categoryId,
    };
    const response = await apiClient.patch(`/api/v1/products/${productId}`, payload);
    return response.data;
  },

  // Delete product
  async deleteProduct(productId) {
    const response = await apiClient.delete(`/api/v1/products/${productId}`);
    return response.data;
  },

  // Get images for a product
  async getProductImages(productId) {
    const response = await apiClient.get(`/api/v1/products/${productId}/images`);
    return response.data;
  },

  // Upload product image
  async uploadProductImage(productId, file) {
    const formData = new FormData();
    formData.append('image', file);

    const response = await apiClient.post(`/api/v1/products/${productId}/images`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  // Update product image
  async updateProductImage(productId, imageId, file) {
    const formData = new FormData();
    formData.append('image', file);

    const response = await apiClient.patch(`/api/v1/products/${productId}/images/${imageId}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  // Delete product image
  async deleteProductImage(productId, imageId) {
    const response = await apiClient.delete(`/api/v1/products/${productId}/images/${imageId}`);
    return response.data;
  },

  // Set primary product image
  async setPrimaryImage(productId, imageId) {
    const response = await apiClient.patch(`/api/v1/products/${productId}/images/${imageId}/primary`);
    return response.data;
  },
};
