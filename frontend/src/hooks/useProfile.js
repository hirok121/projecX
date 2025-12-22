import { useState, useEffect } from 'react';
import userAPI from '../services/userAPI';
import logger from '../utils/logger';

export const useProfile = () => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      setError(null);
      logger.log('🔍 Fetching profile data...');
      const profileData = await userAPI.getProfile();
      logger.log('✅ Profile data received:', profileData);
      logger.log('🔍 Profile data structure:', JSON.stringify(profileData, null, 2));
      setProfile(profileData);
    } catch (err) {
      logger.error('❌ Profile fetch error:', err);
      setError(err.response?.data?.detail || 'Failed to fetch profile');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const refetch = () => {
    fetchProfile();
  };

  return { profile, loading, error, refetch };
};

export const useProfileUpdate = () => {
  const [updating, setUpdating] = useState(false);
  const [updateError, setUpdateError] = useState(null);
  const [updateSuccess, setUpdateSuccess] = useState(false);

  const updateProfile = async (profileData) => {
    try {
      setUpdating(true);
      setUpdateError(null);
      setUpdateSuccess(false);
      
      const updatedProfile = await userAPI.updateProfile(profileData);
      setUpdateSuccess(true);
      
      // Clear success message after 3 seconds
      setTimeout(() => setUpdateSuccess(false), 3000);
      
      return updatedProfile;    } catch (err) {
      let errorMessage = 'Failed to update profile';
      
      if (err.response?.data?.errors) {
        // Handle validation errors
        const errors = err.response.data.errors;
        const errorMessages = Object.entries(errors).map(([field, messages]) => {
          const fieldName = field.charAt(0).toUpperCase() + field.slice(1).replace('_', ' ');
          return `${fieldName}: ${Array.isArray(messages) ? messages.join(', ') : messages}`;
        });
        errorMessage = errorMessages.join('; ');
      } else if (err.response?.data?.detail) {
        errorMessage = err.response.data.detail;
      } else if (err.response?.data?.message) {
        errorMessage = err.response.data.message;
      }
      
      setUpdateError(errorMessage);
      throw err;
    } finally {
      setUpdating(false);
    }
  };

  const clearMessages = () => {
    setUpdateError(null);
    setUpdateSuccess(false);
  };

  return {
    updateProfile,
    updating,
    updateError,
    updateSuccess,
    clearMessages
  };
};
