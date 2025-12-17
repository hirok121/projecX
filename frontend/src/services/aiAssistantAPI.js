import api from './api';

// AI Assistant API service
export const aiAssistantService = {
  // Chat management
  async getChats() {
    try {
      const response = await api.get('/aiassistant/chats');
      // Backend returns array directly, not wrapped in {chats: [...]}
      const chatsArray = Array.isArray(response.data) ? response.data : [];
      return {
        success: true,
        data: chatsArray,
        total: chatsArray.length
      };
    } catch (error) {
      console.error('Error fetching chats:', error);
      return {
        success: false,
        error: error.response?.data?.error || 'Failed to fetch chats',
        data: []
      };
    }
  },

  async createChat(title = null) {
    try {
      const response = await api.post('/aiassistant/chats/', {
        title: title || 'New Chat'
      });
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      console.error('Error creating chat:', error);
      return {
        success: false,
        error: error.response?.data?.error || 'Failed to create chat'
      };
    }
  },

  async getChatDetails(chatId) {
    try {
      const response = await api.get(`/aiassistant/chats/${chatId}/`);
      // Backend returns chat object directly
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      console.error('Error fetching chat details:', error);
      return {
        success: false,
        error: error.response?.data?.error || 'Failed to fetch chat details'
      };
    }
  },

  async updateChat(chatId, updates) {
    try {
      const response = await api.patch(`/aiassistant/chats/${chatId}/`, updates);
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      console.error('Error updating chat:', error);
      return {
        success: false,
        error: error.response?.data?.error || 'Failed to update chat'
      };
    }
  },

  async deleteChat(chatId) {
    try {
      await api.delete(`/aiassistant/chats/${chatId}/`);
      return {
        success: true
      };
    } catch (error) {
      console.error('Error deleting chat:', error);
      return {
        success: false,
        error: error.response?.data?.error || 'Failed to delete chat'
      };
    }
  },

  // Message management
  async sendMessage(chatId, content) {
    try {
      const response = await api.post(`/aiassistant/chats/${chatId}/messages/`, {
        content: content.trim(),
        message_type: "text"
      });
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      console.error('Error sending message:', error);
      return {
        success: false,
        error: error.response?.data?.error || 'Failed to send message'
      };
    }
  },

  // User profile
  async getUserProfile() {
    try {
      const response = await api.get('/aiassistant/profile/');
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      console.error('Error fetching user profile:', error);
      return {
        success: false,
        error: error.response?.data?.error || 'Failed to fetch profile',
        data: null
      };
    }
  },

  async updateUserProfile(updates) {
    try {
      const response = await api.patch('/aiassistant/profile/', updates);
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      console.error('Error updating profile:', error);
      return {
        success: false,
        error: error.response?.data?.error || 'Failed to update profile'
      };
    }
  },

  // Image/file upload
  async uploadImage(chatId, file, prompt = '') {
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('prompt', prompt);
      
      const response = await api.post(`/aiassistant/chats/${chatId}/files`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      console.error('Error uploading image:', error);
      return {
        success: false,
        error: error.response?.data?.detail || error.response?.data?.error || 'Failed to upload image'
      };
    }
  }
};

export default aiAssistantService;
