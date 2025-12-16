/**
 * Diagnosis API Service
 * Handles diagnosis/prediction-related API calls
 * Note: For disease/classifier management, use diseaseAPI.js and classifierAPI.js directly
 */
import api from "./api";

const API_BASE = "/diagnosis";

export const diagnosisAPI = {
  // ============ Prediction ============

  // Create prediction/diagnosis
  predict: async (diagnosisData) => {
    try {
      const response = await api.post("/diagnosis/", diagnosisData);
      return response.data;
    } catch (error) {
      console.error("Error creating prediction:", error);
      throw error;
    }
  },

  // Get diagnosis by ID
  getDiagnosis: async (diagnosisId) => {
    try {
      const response = await api.get(`/diagnosis/${diagnosisId}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching diagnosis ${diagnosisId}:`, error);
      throw error;
    }
  },

  // ============ Search & Query ============

  // Search diagnoses
  searchDiagnoses: async (filters) => {
    try {
      const params = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== null && value !== undefined && value !== "") {
          params.append(key, value);
        }
      });
      const response = await api.get(`/diagnosis/search/?${params}`);
      return response.data;
    } catch (error) {
      console.error("Error searching diagnoses:", error);
      throw error;
    }
  },

  // Admin search diagnoses (all users)
  adminSearchDiagnoses: async (filters) => {
    try {
      const params = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== null && value !== undefined && value !== "") {
          params.append(key, value);
        }
      });
      const response = await api.get(`/diagnosis/admin/search/?${params}`);
      return response.data;
    } catch (error) {
      console.error("Error admin searching diagnoses:", error);
      throw error;
    }
  },

  // ============ Statistics & Analytics ============

  // Get quick stats
  getQuickStats: async () => {
    try {
      const response = await api.get("/diagnosis/stats/");
      return response.data;
    } catch (error) {
      console.error("Error fetching quick stats:", error);
      throw error;
    }
  },

  // Get user analytics
  getUserAnalytics: async () => {
    try {
      const response = await api.get("/diagnosis/analytics/user/");
      return response.data;
    } catch (error) {
      console.error("Error fetching user analytics:", error);
      throw error;
    }
  },

  // ============ Export Functions ============

  // Export to CSV
  exportCSV: async () => {
    try {
      const response = await api.get("/diagnosis/export/csv/", {
        responseType: "blob",
      });
      return response;
    } catch (error) {
      console.error("Error exporting CSV:", error);
      throw error;
    }
  },

  // Export to Excel
  exportExcel: async () => {
    try {
      const response = await api.get("/diagnosis/export/excel/", {
        responseType: "blob",
      });
      return response;
    } catch (error) {
      console.error("Error exporting Excel:", error);
      throw error;
    }
  },
};
