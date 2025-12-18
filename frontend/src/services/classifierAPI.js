/**
 * Classifier API Service
 * Handles all classifier-related API calls
 */
import api from "./api";
import logger from '../utils/logger';

export const classifierAPI = {
  // ============ Public Classifier Endpoints ============
  
  /**
   * Get list of classifiers with optional filters
   * @param {Object} params - Query parameters
   * @param {number} params.disease_id - Filter by disease ID
   * @param {string} params.modality - Filter by modality
   * @param {boolean} params.is_active - Filter by active status
   * @param {number} params.skip - Pagination offset
   * @param {number} params.limit - Pagination limit
   */
  getClassifiers: async (params = {}) => {
    try {
      const response = await api.get("/classifiers/", { params });
      return response.data;
    } catch (error) {
      logger.error("Error fetching classifiers:", error);
      throw error;
    }
  },

  /**
   * Get a specific classifier by ID
   * @param {number} classifierId - Classifier ID
   */
  getClassifier: async (classifierId) => {
    try {
      const response = await api.get(`/classifiers/${classifierId}`);
      return response.data;
    } catch (error) {
      logger.error(`Error fetching classifier ${classifierId}:`, error);
      throw error;
    }
  },

  /**
   * Get all classifiers for a specific disease
   * @param {number} diseaseId - Disease ID
   * @param {boolean} isActive - Filter by active status (default: true)
   */
  getClassifiersByDisease: async (diseaseId, isActive = true) => {
    try {
      const response = await api.get(`/classifiers/by-disease/${diseaseId}`, {
        params: { is_active: isActive }
      });
      return response.data;
    } catch (error) {
      logger.error(`Error fetching classifiers for disease ${diseaseId}:`, error);
      throw error;
    }
  },

  // ============ Admin Classifier Endpoints ============
  
  /**
   * Create a new classifier (admin only)
   * @param {Object} classifierData - Classifier creation data
   * @param {string} classifierData.name - Classifier name
   * @param {string} classifierData.description - Classifier description
   * @param {number} classifierData.disease_id - Associated disease ID
   * @param {string} classifierData.modality - Modality type
   * @param {string} classifierData.model_type - Model type (e.g., 'LogisticRegression', 'XGBoost')
   * @param {number} classifierData.accuracy - Model accuracy (0-1)
   * @param {string} classifierData.version - Model version
   * @param {Array<string>} classifierData.required_features - Required feature names
   */
  createClassifier: async (classifierData) => {
    try {
      const response = await api.post("/classifiers/", classifierData);
      return response.data;
    } catch (error) {
      logger.error("Error creating classifier:", error);
      throw error;
    }
  },

  /**
   * Upload model files for a tabular classifier (admin only)
   * Automatically extracts and updates required_features from features.pkl
   * @param {number} classifierId - Classifier ID
   * @param {Object} files - Model files
   * @param {File} files.features_file - features.pkl file
   * @param {File} files.scaler_file - scaler.pkl file
   * @param {File} files.imputer_file - imputer.pkl file
   * @param {File} files.model_file - model.pkl file
   * @param {File} files.class_file - class.pkl file
   * @returns {Promise<{message: string, saved_files: Object, extracted_features: string[], feature_count: number}>}
   */
  uploadModelFiles: async (classifierId, files) => {
    try {
      const formData = new FormData();
      formData.append("features_file", files.features_file);
      formData.append("scaler_file", files.scaler_file);
      formData.append("imputer_file", files.imputer_file);
      formData.append("model_file", files.model_file);
      formData.append("class_file", files.class_file);

      const response = await api.post(
        `/classifiers/${classifierId}/upload-model-files`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );
      return response.data;
    } catch (error) {
      logger.error(`Error uploading model files for classifier ${classifierId}:`, error);
      throw error;
    }
  },

  /**
   * Upload single model file for image classifier (admin only)
   * @param {number} classifierId - Classifier ID
   * @param {File} modelFile - Model file (.h5, .pt, .onnx, etc.)
   * @returns {Promise<{message: string, saved_files: Object}>}
   */
  uploadImageModel: async (classifierId, modelFile) => {
    try {
      const formData = new FormData();
      formData.append("model_file", modelFile);

      const response = await api.post(
        `/classifiers/${classifierId}/upload-image-model`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );
      return response.data;
    } catch (error) {
      logger.error(`Error uploading image model for classifier ${classifierId}:`, error);
      throw error;
    }
  },

  /**
   * Update tabular classifier metadata (admin only)
   * @param {number} classifierId - Classifier ID
   * @param {Object} metadata - Metadata to update
   * @param {Object} metadata.feature_metadata - Feature metadata
   * @param {number} metadata.accuracy - Accuracy
   * @param {number} metadata.precision - Precision
   * @param {number} metadata.recall - Recall
   * @param {number} metadata.f1_score - F1 score
   * @param {string} metadata.training_date - Training date
   * @param {number} metadata.training_samples - Training samples
   */
  updateTabularMetadata: async (classifierId, metadata) => {
    try {
      const response = await api.put(
        `/classifiers/${classifierId}/tabular-metadata`,
        metadata
      );
      return response.data;
    } catch (error) {
      logger.error(`Error updating tabular metadata for classifier ${classifierId}:`, error);
      throw error;
    }
  },

  /**
   * Update image classifier metadata (admin only)
   * @param {number} classifierId - Classifier ID
   * @param {Object} metadata - Metadata to update
   * @param {Object} metadata.classifier_config - Classifier configuration
   * @param {number} metadata.accuracy - Accuracy
   * @param {number} metadata.auc_roc - AUC-ROC
   * @param {number} metadata.sensitivity - Sensitivity
   * @param {number} metadata.specificity - Specificity
   * @param {string} metadata.training_date - Training date
   * @param {number} metadata.training_samples - Training samples
   */
  updateImageMetadata: async (classifierId, metadata) => {
    try {
      const response = await api.put(
        `/classifiers/${classifierId}/image-metadata`,
        metadata
      );
      return response.data;
    } catch (error) {
      logger.error(`Error updating image metadata for classifier ${classifierId}:`, error);
      throw error;
    }
  },

  /**
   * Update an existing classifier (admin only)
   * @param {number} classifierId - Classifier ID
   * @param {Object} classifierData - Classifier update data
   */
  updateClassifier: async (classifierId, classifierData) => {
    try {
      const response = await api.put(`/classifiers/${classifierId}`, classifierData);
      return response.data;
    } catch (error) {
      logger.error(`Error updating classifier ${classifierId}:`, error);
      throw error;
    }
  },

  /**
   * Toggle classifier active status (admin only)
   * @param {number} classifierId - Classifier ID
   * @returns {Promise<Object>} Updated classifier
   */
  toggleClassifierActive: async (classifierId) => {
    try {
      const response = await api.patch(`/classifiers/${classifierId}/toggle-active`);
      return response.data;
    } catch (error) {
      logger.error(`Error toggling classifier ${classifierId} status:`, error);
      throw error;
    }
  },

  /**
   * Delete a classifier (admin only)
   * @param {number} classifierId - Classifier ID
   */
  deleteClassifier: async (classifierId) => {
    try {
      const response = await api.delete(`/classifiers/${classifierId}`);
      return response.data;
    } catch (error) {
      logger.error(`Error deleting classifier ${classifierId}:`, error);
      throw error;
    }
  },

  /**
   * Extract features from uploaded features.pkl file (admin only)
   * @param {number} classifierId - Classifier ID
   * @returns {Promise<{features: string[], count: number}>} Extracted features
   */
  extractFeatures: async (classifierId) => {
    try {
      const response = await api.post(`/classifiers/${classifierId}/extract-features`);
      return response.data;
    } catch (error) {
      logger.error(`Error extracting features for classifier ${classifierId}:`, error);
      throw error;
    }
  },

  /**
   * Extract features from a features.pkl file without requiring a classifier ID (admin only)
   * @param {FormData} formData - FormData containing features_file
   * @returns {Promise<{features: string[], count: number}>} Extracted features
   */
  extractFeaturesFromFile: async (formData) => {
    try {
      const response = await api.post(
        "/classifiers/extract-features-from-file",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );
      return response.data;
    } catch (error) {
      logger.error("Error extracting features from file:", error);
      throw error;
    }
  },
};
