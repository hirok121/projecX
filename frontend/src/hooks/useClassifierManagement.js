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
      const data = await classifierAPI.getClassifiers();
      const classifiersData = Array.isArray(data) ? data : [];
      setClassifiers(classifiersData);
      return { success: true };
    } catch (err) {
      console.error("Failed to load classifiers:", err);
      return { success: false, error: "Failed to load classifiers" };
    }
  };

  const openDialog = (classifier = null) => {
    if (classifier) {
      setEditingClassifier(classifier);
      setFormData({
        name: classifier.name || "",
        description: classifier.description || "",
        disease_id: classifier.disease_id || "",
        modality: classifier.modality || "",
        model_type: classifier.model_type || "",
        accuracy: classifier.accuracy || "",
        version: classifier.version || "",
        required_features: classifier.required_features || [],
      });
    } else {
      setEditingClassifier(null);
      setFormData({
        name: "",
        description: "",
        disease_id: "",
        modality: "",
        model_type: "",
        accuracy: "",
        version: "",
        required_features: [],
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

  const submitClassifier = async () => {
    try {
      setLoading(true);

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
        await classifierAPI.updateClassifier(
          editingClassifier.id,
          classifierData
        );

        const hasNewFiles = Object.values(modelFiles).some(
          (file) => file !== null
        );
        if (hasNewFiles) {
          const allFilesProvided = Object.values(modelFiles).every(
            (file) => file !== null
          );
          if (!allFilesProvided) {
            return {
              success: false,
              error: "All 5 model files must be provided together",
            };
          }
          await classifierAPI.uploadModelFiles(
            editingClassifier.id,
            modelFiles
          );
        }
      } else {
        const newClassifier = await classifierAPI.createClassifier(
          classifierData
        );

        const hasFiles = Object.values(modelFiles).some(
          (file) => file !== null
        );
        if (hasFiles) {
          const allFilesProvided = Object.values(modelFiles).every(
            (file) => file !== null
          );
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
      return { success: false, error: "Failed to delete classifier" };
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
  };
}
