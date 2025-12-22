import { useState } from "react";
import { classifierAPI } from "../services/classifierAPI";

export function useClassifierManagement() {
  const [classifiers, setClassifiers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingClassifier, setEditingClassifier] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    disease_id: "",
    modality: "",
    model_type: "",
    accuracy: "",
    version: "",
    required_features: [],
  });
  const [modelFiles, setModelFiles] = useState({
    features_file: null,
    scaler_file: null,
    imputer_file: null,
    model_file: null,
    class_file: null,
  });

  const loadClassifiers = async () => {
    try {
      // Load ALL classifiers (both active and inactive) for admin page
      // Backend now defaults to returning all when is_active is not specified
      const data = await classifierAPI.getClassifiers();
      const classifiersData = Array.isArray(data) ? data : [];
      setClassifiers(classifiersData);
      return { success: true };
    } catch (err) {
      console.error("Failed to load classifiers:", err);
      return { 
        success: false, 
        error: err.response?.data?.detail || "Failed to load classifiers" 
      };
    }
  };

  const openDialog = async (classifier = null) => {
    if (classifier) {
      try {
        // Fetch full classifier details including all metadata
        const fullClassifier = await classifierAPI.getClassifier(classifier.id);
        setEditingClassifier(fullClassifier);
        setFormData({
          name: fullClassifier.name || "",
          title: fullClassifier.title || "",
          description: fullClassifier.description || "",
          disease_id: fullClassifier.disease_id || "",
          modality: fullClassifier.modality || "",
          model_type: fullClassifier.model_type || "",
          accuracy: fullClassifier.accuracy || "",
          precision: fullClassifier.precision || "",
          recall: fullClassifier.recall || "",
          f1_score: fullClassifier.f1_score || "",
          auc_roc: fullClassifier.auc_roc || "",
          sensitivity: fullClassifier.sensitivity || "",
          specificity: fullClassifier.specificity || "",
          version: fullClassifier.version || "",
          authors: fullClassifier.authors || "",
          blog_link: fullClassifier.blog_link || "",
          paper_link: fullClassifier.paper_link || "",
          required_features: fullClassifier.required_features || [],
          feature_metadata: fullClassifier.feature_metadata || {},
          classifier_config: fullClassifier.classifier_config || {},
          training_date: fullClassifier.training_date || "",
          training_samples: fullClassifier.training_samples || "",
        });
      } catch (error) {
        console.error("Failed to fetch classifier details:", error);
        // Fallback to summary data if fetch fails
        setEditingClassifier(classifier);
        setFormData({
          name: classifier.name || "",
          title: classifier.title || "",
          description: classifier.description || "",
          disease_id: classifier.disease_id || "",
          modality: classifier.modality || "",
          model_type: classifier.model_type || "",
          accuracy: classifier.accuracy || "",
          version: classifier.version || "",
          authors: classifier.authors || "",
          required_features: classifier.required_features || [],
        });
      }
    } else {
      setEditingClassifier(null);
      setFormData({
        name: "",
        title: "",
        description: "",
        disease_id: "",
        modality: "",
        model_type: "",
        accuracy: "",
        precision: "",
        recall: "",
        f1_score: "",
        auc_roc: "",
        sensitivity: "",
        specificity: "",
        version: "",
        authors: "",
        blog_link: "",
        paper_link: "",
        required_features: [],
        feature_metadata: {},
        classifier_config: {},
        training_date: "",
        training_samples: "",
      });
    }
    setModelFiles({
      features_file: null,
      scaler_file: null,
      imputer_file: null,
      model_file: null,
      class_file: null,
    });
    setDialogOpen(true);
  };

  const closeDialog = () => {
    setDialogOpen(false);
    setEditingClassifier(null);
  };

  const updateModelFile = (fileKey, file) => {
    setModelFiles((prev) => ({ ...prev, [fileKey]: file }));
  };

  const submitClassifier = async (wizardData = null) => {
    try {
      setLoading(true);

      // Wizard flow (new multi-step approach)
      if (wizardData) {
        const { formData: wizardFormData, modelFiles: wizardModelFiles } = wizardData;
        
        const classifierData = {
          name: wizardFormData.name,
          description: wizardFormData.description,
          disease_id: parseInt(wizardFormData.disease_id),
          modality: wizardFormData.modality,
          model_type: wizardFormData.model_type,
          version: wizardFormData.version,
          authors: wizardFormData.authors,
          blog_link: wizardFormData.blog_link,
          paper_link: wizardFormData.paper_link,
          required_features: wizardFormData.required_features,
          feature_metadata: wizardFormData.feature_metadata,
          classifier_config: wizardFormData.classifier_config,
          accuracy: wizardFormData.accuracy ? parseFloat(wizardFormData.accuracy) : null,
          precision: wizardFormData.precision ? parseFloat(wizardFormData.precision) : null,
          recall: wizardFormData.recall ? parseFloat(wizardFormData.recall) : null,
          f1_score: wizardFormData.f1_score ? parseFloat(wizardFormData.f1_score) : null,
          auc_roc: wizardFormData.auc_roc ? parseFloat(wizardFormData.auc_roc) : null,
          sensitivity: wizardFormData.sensitivity ? parseFloat(wizardFormData.sensitivity) : null,
          specificity: wizardFormData.specificity ? parseFloat(wizardFormData.specificity) : null,
          training_date: wizardFormData.training_date || null,
          training_samples: wizardFormData.training_samples ? parseInt(wizardFormData.training_samples) : null,
        };

        if (editingClassifier) {
          await classifierAPI.updateClassifier(editingClassifier.id, classifierData);
          
          if (wizardModelFiles) {
            const hasNewFiles = Object.values(wizardModelFiles).some((file) => file !== null);
            if (hasNewFiles) {
              const allFilesProvided = Object.values(wizardModelFiles).every((file) => file !== null);
              if (!allFilesProvided) {
                return {
                  success: false,
                  error: "All 5 model files must be provided together",
                };
              }
              await classifierAPI.uploadModelFiles(editingClassifier.id, wizardModelFiles);
            }
          }
        } else {
          const newClassifier = await classifierAPI.createClassifier(classifierData);
          
          if (wizardModelFiles) {
            const hasFiles = Object.values(wizardModelFiles).some((file) => file !== null);
            if (hasFiles) {
              const allFilesProvided = Object.values(wizardModelFiles).every((file) => file !== null);
              if (!allFilesProvided) {
                return {
                  success: false,
                  error: "All 5 model files must be provided together",
                };
              }
              await classifierAPI.uploadModelFiles(newClassifier.id, wizardModelFiles);
            }
          }
        }

        closeDialog();
        await loadClassifiers();
        return {
          success: true,
          message: editingClassifier
            ? "Classifier updated successfully"
            : "Classifier created successfully",
        };
      }

      // Legacy flow (backward compatibility)
      const classifierData = {
        name: formData.name,
        description: formData.description,
        disease_id: parseInt(formData.disease_id),
        modality: formData.modality,
        model_type: formData.model_type,
        accuracy: formData.accuracy ? parseFloat(formData.accuracy) : null,
        version: formData.version,
        required_features: formData.required_features,
      };

      if (editingClassifier) {
        await classifierAPI.updateClassifier(editingClassifier.id, classifierData);
        const hasNewFiles = Object.values(modelFiles).some((file) => file !== null);
        if (hasNewFiles) {
          const allFilesProvided = Object.values(modelFiles).every((file) => file !== null);
          if (!allFilesProvided) {
            return {
              success: false,
              error: "All 5 model files must be provided together",
            };
          }
          await classifierAPI.uploadModelFiles(editingClassifier.id, modelFiles);
        }
      } else {
        const newClassifier = await classifierAPI.createClassifier(classifierData);
        const hasFiles = Object.values(modelFiles).some((file) => file !== null);
        if (hasFiles) {
          const allFilesProvided = Object.values(modelFiles).every((file) => file !== null);
          if (!allFilesProvided) {
            return {
              success: false,
              error: "All 5 model files must be provided together",
            };
          }
          await classifierAPI.uploadModelFiles(newClassifier.id, modelFiles);
        }
      }

      closeDialog();
      await loadClassifiers();
      return {
        success: true,
        message: editingClassifier
          ? "Classifier updated successfully"
          : "Classifier created successfully",
      };
    } catch (err) {
      return {
        success: false,
        error: err.response?.data?.detail || "Failed to save classifier",
      };
    } finally {
      setLoading(false);
    }
  };

  const deleteClassifier = async (classifierId) => {
    if (
      !window.confirm(
        "Are you sure you want to delete this classifier? This will also remove all associated model files."
      )
    ) {
      return { success: false, cancelled: true };
    }

    try {
      await classifierAPI.deleteClassifier(classifierId);
      await loadClassifiers();
      return { success: true, message: "Classifier deleted successfully" };
    } catch (err) {
      return { 
        success: false, 
        error: err.response?.data?.detail || "Failed to delete classifier" 
      };
    }
  };

  const toggleActive = async (classifierId) => {
    try {
      const updatedClassifier = await classifierAPI.toggleClassifierActive(classifierId);
      await loadClassifiers();
      const status = updatedClassifier.is_active ? "activated" : "deactivated";
      return { 
        success: true, 
        message: `Classifier ${status} successfully` 
      };
    } catch (err) {
      return { 
        success: false, 
        error: err.response?.data?.detail || "Failed to toggle classifier status" 
      };
    }
  };

  return {
    classifiers,
    loading,
    dialogOpen,
    editingClassifier,
    formData,
    setFormData,
    modelFiles,
    updateModelFile,
    loadClassifiers,
    openDialog,
    closeDialog,
    submitClassifier,
    deleteClassifier,
    toggleActive,
  };
}
