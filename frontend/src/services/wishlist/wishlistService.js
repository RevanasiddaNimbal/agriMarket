/**
 * Wishlist Service Interface
 * Isolated interface prepared for future backend wishlist/saved products API endpoints.
 * No fake mock data or fake API endpoints are created.
 */
export const wishlistService = {
  async getWishlist() {
    return { supported: false, items: [] };
  },
  async addToWishlist() {
    throw new Error('Wishlist API is not yet enabled on the backend server.');
  },
  async removeFromWishlist() {
    throw new Error('Wishlist API is not yet enabled on the backend server.');
  },
};
