import apiClient from '../api/apiClient';

export const categoryService = {
  // Get all categories
  async getAllCategories() {
    const response = await apiClient.get('/api/v1/categories');
    return response.data;
  },

  // Get category by ID
  async getCategoryById(categoryId) {
    const response = await apiClient.get(`/api/v1/categories/${categoryId}`);
    return response.data;
  },
};
