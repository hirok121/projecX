import api from "./api";

const API_BASE = "/diagnosis";

export const diagnosisAPI = {
  // Get all diseases
  getDiseases: () => api.get(`${API_BASE}/diseases`),

  // Get single disease by ID
  getDisease: (diseaseId) => api.get(`${API_BASE}/diseases/${diseaseId}`),

  // Get classifiers for a disease
  getDiseaseClassifiers: (diseaseId) =>
    api.get(`${API_BASE}/diseases/${diseaseId}/classifiers`),

  // Get classifiers filtered by modality
  getClassifiersByModality: (diseaseId, modality) =>
    api.get(`${API_BASE}/diseases/${diseaseId}/classifiers`, {
      params: { modality },
    }),

  // Submit prediction
  predict: (formData) =>
    api.post(`${API_BASE}/predict`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    }),

  // Get prediction result by ID
  getPredictionResult: (predictionId) =>
    api.get(`${API_BASE}/predictions/${predictionId}`),

  // Get user's prediction history
  getUserPredictions: (userId) =>
    api.get(`${API_BASE}/predictions/user/${userId}`),

  // Get all predictions (admin only)
  getAllPredictions: () => api.get(`${API_BASE}/predictions`),

  // Legacy HCV-specific endpoints (keep for backward compatibility)
  // Create new diagnosis
  createDiagnosis: async (patientData) => {
    try {
      const response = await api.post("/diagnosis/analyze-hcv/", patientData);
      return response.data;
    } catch (error) {
      console.error("Error creating diagnosis:", error);
      throw error;
    }
  },

  // Get user's diagnoses
  getUserDiagnoses: async () => {
    try {
      const response = await api.get("/diagnosis/analyze-hcv/");
      return response.data;
    } catch (error) {
      console.error("Error fetching user diagnoses:", error);
      throw error;
    }
  },

  // Get specific diagnosis
  getDiagnosis: async (id) => {
    try {
      const response = await api.get(`/diagnosis/analyze-hcv/${id}/`);
      return response.data;
    } catch (error) {
      console.error("Error fetching diagnosis:", error);
      throw error;
    }
  },

  // Update diagnosis metadata
  updateDiagnosis: async (id, data) => {
    try {
      const response = await api.put(`/diagnosis/analyze-hcv/${id}/`, data);
      return response.data;
    } catch (error) {
      console.error("Error updating diagnosis:", error);
      throw error;
    }
  },

  // Delete diagnosis
  deleteDiagnosis: async (id) => {
    try {
      const response = await api.delete(`/diagnosis/analyze-hcv/${id}/`);
      return response.data;
    } catch (error) {
      console.error("Error deleting diagnosis:", error);
      throw error;
    }
  },
  // Search diagnoses
  searchDiagnoses: async (filters) => {
    try {
      const params = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== null && value !== undefined && value !== '') {
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
        if (value !== null && value !== undefined && value !== '') {
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

  // Export functions
  exportCSV: async () => {
    try {
      const response = await api.get("/diagnosis/export/csv/", {
        responseType: 'blob',
      });
      return response;
    } catch (error) {
      console.error("Error exporting CSV:", error);
      throw error;
    }
  },

  exportExcel: async () => {
    try {
      const response = await api.get("/diagnosis/export/excel/", {
        responseType: 'blob',
      });
      return response;
    } catch (error) {
      console.error("Error exporting Excel:", error);
      throw error;
    }
  },
};
