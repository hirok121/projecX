/**
 * Disease API Service
 * Handles all disease-related API calls
 */
import api from "./api";

export const diseaseAPI = {
  // ============ Public Disease Endpoints ============
  
  /**
   * Get list of diseases with optional filters
   * @param {Object} params - Query parameters
   * @param {string} params.category - Filter by category
   * @param {boolean} params.is_active - Filter by active status
   * @param {number} params.skip - Pagination offset
   * @param {number} params.limit - Pagination limit
   */
  getDiseases: async (params = {}) => {
    try {
      const response = await api.get("/diseases/", { params });
      return response.data;
    } catch (error) {
      console.error("Error fetching diseases:", error);
      throw error;
    }
  },

  /**
   * Get a specific disease by ID
   * @param {number} diseaseId - Disease ID
   */
  getDisease: async (diseaseId) => {
    try {
      const response = await api.get(`/diseases/${diseaseId}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching disease ${diseaseId}:`, error);
      throw error;
    }
  },

  // ============ Admin Disease Endpoints ============
  
  /**
   * Create a new disease (admin only)
   * @param {Object} diseaseData - Disease creation data
   * @param {string} diseaseData.name - Disease name
   * @param {string} diseaseData.description - Disease description
   * @param {string} diseaseData.category - Disease category
   * @param {Array<string>} diseaseData.available_modalities - Available modalities
   */
  createDisease: async (diseaseData) => {
    try {
      const response = await api.post("/diseases/", diseaseData);
      return response.data;
    } catch (error) {
      console.error("Error creating disease:", error);
      throw error;
    }
  },

  /**
   * Update an existing disease (admin only)
   * @param {number} diseaseId - Disease ID
   * @param {Object} diseaseData - Disease update data
   */
  updateDisease: async (diseaseId, diseaseData) => {
    try {
      const response = await api.put(`/diseases/${diseaseId}`, diseaseData);
      return response.data;
    } catch (error) {
      console.error(`Error updating disease ${diseaseId}:`, error);
      throw error;
    }
  },

  /**
   * Delete a disease (admin only)
   * @param {number} diseaseId - Disease ID
   */
  deleteDisease: async (diseaseId) => {
    try {
      const response = await api.delete(`/diseases/${diseaseId}`);
      return response.data;
    } catch (error) {
      console.error(`Error deleting disease ${diseaseId}:`, error);
      throw error;
    }
  },
};
