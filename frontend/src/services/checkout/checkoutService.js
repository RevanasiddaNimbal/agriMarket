import apiClient from '../api/apiClient';

export const checkoutService = {
  // Validate checkout parameters and inventory before order placement
  async validateCheckout({ productId, quantity, addressId }) {
    const response = await apiClient.post('/api/v1/checkout', {
      product_id: productId,
      quantity,
      address_id: addressId,
    });
    return response.data;
  },
};
