import api from './api';

const userAPI = {
  // Get user profile
  getProfile: async () => {
    try {
      const response = await api.get('/users/profile');
      return response.data;
    } catch (error) {
      console.error('Error fetching profile:', error);
      throw error;
    }
  },

  // Update user profile
  updateProfile: async (profileData) => {
    try {
      console.log('userAPI sending data:', profileData);
      const response = await api.put('/users/profile', profileData);
      console.log('userAPI received response:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error updating profile:', error);
      console.error('Request data was:', profileData);
      console.error('Response error:', error.response?.data);
      throw error;
    }
  },

  // Get user by ID (admin only)
  getUserById: async (userId) => {
    try {
      const response = await api.get(`/users/${userId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching user by ID:', error);
      throw error;
    }
  },

  // Admin: Get all users
  getAllUsers: async (params = {}) => {
    try {
      const response = await api.get('/users/admin/all', { params });
      return response.data;
    } catch (error) {
      console.error('Error fetching all users:', error);
      throw error;
    }
  },

  // Admin: Update user
  updateUser: async (userId, userData) => {
    try {
      const response = await api.put(`/users/admin/${userId}`, userData);
      return response.data;
    } catch (error) {
      console.error('Error updating user:', error);
      throw error;
    }
  },

  // Admin: Delete user
  deleteUser: async (userId) => {
    try {
      const response = await api.delete(`/users/admin/${userId}`);
      return response.data;
    } catch (error) {
      console.error('Error deleting user:', error);
      throw error;
    }
  },
};

export default userAPI;
