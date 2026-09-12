import apiClient from '../api/apiClient';

export const authService = {
  // Register new user (fullName, email, password, confirmPassword)
  async register(data) {
    const response = await apiClient.post('/api/v1/auth/register', data);
    return response.data;
  },

  // Login user (email, password)
  async login(data) {
    const response = await apiClient.post('/api/v1/auth/login', data);
    return response.data;
  },

  // Refresh token
  async refreshToken() {
    const response = await apiClient.post('/api/v1/auth/refresh-token');
    return response.data;
  },

  // Logout current session
  async logout() {
    const response = await apiClient.post('/api/v1/auth/logout');
    return response.data;
  },

  // Logout all sessions
  async logoutAll() {
    const response = await apiClient.post('/api/v1/auth/logout-all');
    return response.data;
  },

  // Verify email address with token
  async verifyEmail(token) {
    const response = await apiClient.get('/api/v1/auth/verify-email', {
      params: { token },
    });
    return response.data;
  },

  // Resend verification email
  async resendVerificationEmail(email) {
    const response = await apiClient.post('/api/v1/auth/resend-verification-email', {
      email,
    });
    return response.data;
  },

  // Forgot password request
  async forgotPassword(email) {
    const response = await apiClient.post('/api/v1/auth/forgot-password', {
      email,
    });
    return response.data;
  },

  // Reset password
  async resetPassword(data) {
    const response = await apiClient.post('/api/v1/auth/reset-password', data);
    return response.data;
  },

  // OAuth2 Token Exchange
  async exchangeOAuthCode(code) {
    const response = await apiClient.post('/api/v1/auth/oauth2/exchange', {
      code,
    });
    return response.data;
  },
};
