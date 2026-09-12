/**
 * Community Service Interface
 * Isolated interface prepared for future backend community/forum API endpoints.
 * No fake mock data or fake API endpoints are created.
 */
export const communityService = {
  async getPosts() {
    return { supported: false, posts: [] };
  },
  async createPost() {
    throw new Error('Community posts API is not yet enabled on the backend server.');
  },
};
