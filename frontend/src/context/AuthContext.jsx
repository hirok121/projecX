import { createContext, useState, useContext, useEffect, useCallback } from 'react';
import PropTypes from 'prop-types';
import authAPI from '../services/authAPI';
import userAPI from '../services/userAPI';
import { AUTH_CONFIG } from '../config/constants';
import logger from '../utils/logger';

// Create AuthContext with default values
const AuthContext = createContext({
  isAuthenticated: false,
  user: null,
  loading: false,
  isStaff: false,
  isSuperuser: false,
  login: async () => ({ success: false, error: 'Provider not available' }),
  register: async () => ({ success: false, error: 'Provider not available' }),
  logout: () => {},
  forgotPassword: async () => ({ success: false, error: 'Provider not available' }),
  resetPassword: async () => ({ success: false, error: 'Provider not available' }),
  changePassword: async () => ({ success: false, error: 'Provider not available' }),
  verifyEmail: async () => ({ success: false, error: 'Provider not available' }),
  updateUserProfile: async () => ({ success: false, error: 'Provider not available' }),
  refreshUserData: async () => {},
  handleOAuthToken: async () => ({ success: false, error: 'Provider not available' }),
});

// AuthProvider component
export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Helper function to store tokens
  const storeTokens = (accessToken) => {
    localStorage.setItem(AUTH_CONFIG.ACCESS_TOKEN_KEY, accessToken);
  };

  // Helper function to clear tokens
  const clearTokens = () => {
    localStorage.removeItem(AUTH_CONFIG.ACCESS_TOKEN_KEY);
  };

  // Fetch current user data
  const fetchUserData = useCallback(async () => {
    try {
      logger.loading('Fetching user data...');
      const userData = await authAPI.getCurrentUser();
      logger.success('User data received:', userData);
      logger.log('👤 User permissions:', { 
        is_staff: userData?.is_staff, 
        is_superuser: userData?.is_superuser,
        is_active: userData?.is_active 
      });
      setUser(userData);
      return userData;
    } catch (error) {
      logger.error('❌ Failed to fetch user data:', error);
      throw error;
    }
  }, []);

  // Login function
  const login = useCallback(async (credentials) => {
    setLoading(true);
    try {
      logger.auth('Attempting login for:', credentials.email);
      const response = await authAPI.login(credentials);
      logger.success('Login response received:', { hasToken: !!response.access_token });
      
      if (response.access_token) {
        storeTokens(response.access_token);
        logger.log('💾 Token stored, fetching user data...');
        
        // Fetch user data after successful login
        const userData = await fetchUserData();
        logger.log('👤 User data fetched:', { 
          email: userData?.email, 
          id: userData?.id,
          fullName: userData?.full_name 
        });
        
        setIsAuthenticated(true);
        setUser(userData);
        setLoading(false);
        
        return { success: true, user: userData };
      } else {
        logger.error('❌ No access token in response');
        setLoading(false);
        return { success: false, error: 'No access token received' };
      }
    } catch (error) {
      setLoading(false);
      logger.error('❌ Login error:', error);
      
      let errorMessage = 'Login failed. Please try again.';
      if (error.response?.data?.detail) {
        errorMessage = error.response.data.detail;
      } else if (error.response?.status === 401) {
        errorMessage = 'Invalid email or password';
      } else if (error.response?.status >= 500) {
        errorMessage = 'Server error. Please try again later.';
      }
      
      return { success: false, error: errorMessage };
    }
  }, [fetchUserData]);

  // Register function
  const register = useCallback(async (userData) => {
    setLoading(true);
    try {
      const response = await authAPI.register(userData);
      setLoading(false);
      
      return { 
        success: true, 
        message: response.message || 'Registration successful! Please check your email to verify your account.',
        email: response.email
      };
    } catch (error) {
      setLoading(false);
      logger.error('Registration error:', error);
      
      let errorMessage = 'Registration failed. Please try again.';
      if (error.response?.data?.detail) {
        errorMessage = error.response.data.detail;
      } else if (error.response?.status === 400) {
        errorMessage = 'Email already registered or invalid data provided';
      }
      
      return { success: false, error: errorMessage };
    }
  }, []);

  // Logout function
  const logout = useCallback(() => {
    clearTokens();
    setIsAuthenticated(false);
    setUser(null);
  }, []);

  // Forgot password function
  const forgotPassword = useCallback(async (email) => {
    try {
      const response = await authAPI.forgotPassword(email);
      return { 
        success: true, 
        message: response.message || 'If your email is registered, you will receive a password reset link.'
      };
    } catch (error) {
      logger.error('Forgot password error:', error);
      
      let errorMessage = 'Failed to send reset email. Please try again.';
      if (error.response?.data?.detail) {
        errorMessage = error.response.data.detail;
      }
      
      return { success: false, error: errorMessage };
    }
  }, []);

  // Reset password function
  const resetPassword = useCallback(async (token, newPassword) => {
    try {
      const response = await authAPI.resetPassword(token, newPassword);
      return { 
        success: true, 
        message: response.message || 'Password reset successfully! You can now login with your new password.'
      };
    } catch (error) {
      logger.error('Reset password error:', error);
      
      let errorMessage = 'Failed to reset password. Please try again.';
      if (error.response?.data?.detail) {
        errorMessage = error.response.data.detail;
      }
      
      return { success: false, error: errorMessage };
    }
  }, []);

  // Change password function (for authenticated users)
  const changePassword = useCallback(async (currentPassword, newPassword) => {
    try {
      const response = await authAPI.changePassword(currentPassword, newPassword);
      return { 
        success: true, 
        message: response.message || 'Password changed successfully!'
      };
    } catch (error) {
      logger.error('Change password error:', error);
      
      let errorMessage = 'Failed to change password. Please try again.';
      if (error.response?.data?.detail) {
        errorMessage = error.response.data.detail;
      } else if (error.response?.status === 400) {
        errorMessage = 'Current password is incorrect';
      }
      
      return { success: false, error: errorMessage };
    }
  }, []);

  // Verify email function
  const verifyEmail = useCallback(async (token) => {
    try {
      const response = await authAPI.verifyEmail(token);
      return { 
        success: true, 
        message: response.message || 'Email verified successfully!',
        email: response.email
      };
    } catch (error) {
      logger.error('Email verification error:', error);
      
      let errorMessage = 'Failed to verify email. Invalid or expired token.';
      if (error.response?.data?.detail) {
        errorMessage = error.response.data.detail;
      }
      
      return { success: false, error: errorMessage };
    }
  }, []);

  // Update user profile function
  const updateUserProfile = useCallback(async (profileData) => {
    try {
      const updatedUser = await userAPI.updateProfile(profileData);
      setUser(updatedUser);
      return { success: true, user: updatedUser };
    } catch (error) {
      logger.error('Update profile error:', error);
      
      let errorMessage = 'Failed to update profile. Please try again.';
      if (error.response?.data?.detail) {
        errorMessage = error.response.data.detail;
      }
      
      return { success: false, error: errorMessage };
    }
  }, []);

  // Refresh user data function
  const refreshUserData = useCallback(async () => {
    if (isAuthenticated) {
      try {
        await fetchUserData();
      } catch (error) {
        logger.error('Failed to refresh user data:', error);
        // If fetch fails, user might be logged out
        logout();
      }
    }
  }, [isAuthenticated, fetchUserData, logout]);

  // Handle OAuth token (for Google/social login)
  const handleOAuthToken = useCallback(async (accessToken) => {
    try {
      logger.auth('Handling OAuth token...');
      storeTokens(accessToken);
      
      // Fetch user data with new token
      const userData = await fetchUserData();
      logger.success('OAuth authentication successful:', { 
        email: userData?.email, 
        id: userData?.id 
      });
      
      setIsAuthenticated(true);
      setUser(userData);
      
      return { success: true, user: userData };
    } catch (error) {
      logger.error('❌ OAuth token handling failed:', error);
      clearTokens();
      return { success: false, error: error.message };
    }
  }, [fetchUserData]);

  // Check authentication status on mount
  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem(AUTH_CONFIG.ACCESS_TOKEN_KEY);
      logger.loading('Checking auth on mount, token exists:', !!token);
      
      if (token) {
        try {
          // Try to fetch user data to verify token is still valid
          const userData = await fetchUserData();
          logger.success('Auth check successful, user authenticated');
          setUser(userData);
          setIsAuthenticated(true);
        } catch (error) {
          logger.error('❌ Token validation failed:', error);
          // Clear invalid tokens
          clearTokens();
          setIsAuthenticated(false);
          setUser(null);
        }
      } else {
        logger.info('ℹ️ No token found, user not authenticated');
      }
      
      setLoading(false);
    };

    checkAuth();
  }, [fetchUserData]);

  // Computed properties based on user data
  const isStaff = user?.is_staff || false;
  const isSuperuser = user?.is_superuser || false;

  const value = {
    isAuthenticated,
    user,
    loading,
    isStaff,
    isSuperuser,
    login,
    register,
    logout,
    forgotPassword,
    resetPassword,
    changePassword,
    verifyEmail,
    updateUserProfile,
    refreshUserData,
    handleOAuthToken,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

AuthProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

// Custom hook to use AuthContext
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;