import api from './api';
import logger from '../utils/logger';

const userAPI = {
  // Get user profile
  getProfile: async () => {
    try {
      const response = await api.get('/users/profile');
      return response.data;
    } catch (error) {
      logger.error('Error fetching profile:', error);
      throw error;
    }
  },

  // Update user profile
  updateProfile: async (profileData) => {
    try {
      logger.log('userAPI sending data:', profileData);
      const response = await api.put('/users/profile', profileData);
      logger.log('userAPI received response:', response.data);
      return response.data;
    } catch (error) {
      logger.error('Error updating profile:', error);
      logger.error('Request data was:', profileData);
      logger.error('Response error:', error.response?.data);
      throw error;
    }
  },

  // Get user by ID (admin only)
  getUserById: async (userId) => {
    try {
      const response = await api.get(`/users/${userId}`);
      return response.data;
    } catch (error) {
      logger.error('Error fetching user by ID:', error);
      throw error;
    }
  },

  // Admin: Get all users
  getAllUsers: async (params = {}) => {
    try {
      const response = await api.get('/users/admin/all', { params });
      return response.data;
    } catch (error) {
      logger.error('Error fetching all users:', error);
      throw error;
    }
  },

  // Admin: Update user
  updateUser: async (userId, userData) => {
    try {
      const response = await api.put(`/users/admin/${userId}`, userData);
      return response.data;
    } catch (error) {
      logger.error('Error updating user:', error);
      throw error;
    }
  },

  // Admin: Delete user
  deleteUser: async (userId) => {
    try {
      const response = await api.delete(`/users/admin/${userId}`);
      return response.data;
    } catch (error) {
      logger.error('Error deleting user:', error);
      throw error;
    }
  },
};

export default userAPI;
