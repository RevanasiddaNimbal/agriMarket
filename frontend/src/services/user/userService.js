import apiClient from '../api/apiClient';

export const userService = {
  // Get current authenticated user profile
  async getCurrentUserProfile() {
    const response = await apiClient.get('/api/v1/users/me/profile');
    return response.data;
  },

  // Update user full name
  async updateFullName(fullName) {
    const response = await apiClient.patch('/api/v1/users/me/profile/full-name', {
      fullName,
    });
    return response.data;
  },

  // Update profile picture
  async updateProfilePicture(file) {
    const formData = new FormData();
    formData.append('profilePicture', file);

    const response = await apiClient.patch('/api/v1/users/me/profile-picture', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  // Send phone OTP
  async sendPhoneOtp(phoneNumber) {
    const response = await apiClient.post('/api/v1/users/me/phone/send-otp', {
      phoneNumber,
    });
    return response.data;
  },

  // Verify phone OTP
  async verifyPhoneOtp(data) {
    const payload = typeof data === 'string' ? { otp: data } : data;
    const response = await apiClient.post('/api/v1/users/me/phone/verify-otp', payload);
    return response.data;
  },

  // Resend phone OTP
  async resendPhoneOtp(phoneNumber) {
    const response = await apiClient.post('/api/v1/users/me/phone/resend-otp', {
      phoneNumber,
    });
    return response.data;
  },

  // Change password
  async changePassword(data) {
    const response = await apiClient.patch('/api/v1/users/me/password', data);
    return response.data;
  },

  // Set initial password (for OAuth users)
  async setPassword(data) {
    const response = await apiClient.patch('/api/v1/users/me/set-password', data);
    return response.data;
  },

  // Delete current user account
  async deleteAccount() {
    const response = await apiClient.delete('/api/v1/users/me/profile');
    return response.data;
  },

  // Get user dashboard summary (buying & selling stats)
  async getUserDashboard() {
    const response = await apiClient.get('/api/v1/user/dashboard');
    return response.data;
  },
};
