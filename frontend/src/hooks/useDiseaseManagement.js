import { useState } from "react";
import { diseaseAPI } from "../services/diseaseAPI";

export function useDiseaseManagement() {
  const [diseases, setDiseases] = useState([]);
  const [loading, setLoading] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingDisease, setEditingDisease] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    category: "",
    available_modalities: [],
    blog_link: "",
  });

  const loadDiseases = async () => {
    try {
      setLoading(true);
      // Load ALL diseases (both active and inactive) for admin page
      // Backend now defaults to returning all when is_active is not specified
      const data = await diseaseAPI.getDiseases();
      const diseasesData = Array.isArray(data) ? data : [];
      setDiseases(diseasesData);
      return { success: true };
    } catch (err) {
      console.error("Failed to load diseases:", err);
      return { success: false, error: "Failed to load diseases" };
    } finally {
      setLoading(false);
    }
  };

  const openDialog = (disease = null) => {
    if (disease) {
      setEditingDisease(disease);
      setFormData({
        name: disease.name || "",
        description: disease.description || "",
        category: disease.category || "",
        available_modalities: disease.available_modalities || [],
        blog_link: disease.blog_link || "",
      });
    } else {
      setEditingDisease(null);
      setFormData({
        name: "",
        description: "",
        category: "",
        available_modalities: [],
        blog_link: "",
      });
    }
    setDialogOpen(true);
  };

  const closeDialog = () => {
    setDialogOpen(false);
    setEditingDisease(null);
  };

  const submitDisease = async () => {
    try {
      setLoading(true);
      if (editingDisease) {
        await diseaseAPI.updateDisease(editingDisease.id, formData);
      } else {
        await diseaseAPI.createDisease(formData);
      }
      closeDialog();
      await loadDiseases();
      return {
        success: true,
        message: editingDisease
          ? "Disease updated successfully"
          : "Disease created successfully",
      };
    } catch (err) {
      return {
        success: false,
        error: err.response?.data?.detail || "Failed to save disease",
      };
    } finally {
      setLoading(false);
    }
  };

  const deleteDisease = async (diseaseId) => {
    if (
      !window.confirm(
        "Are you sure you want to delete this disease? This will also remove all associated classifiers and model files."
      )
    ) {
      return { success: false, cancelled: true };
    }

    try {
      await diseaseAPI.deleteDisease(diseaseId);
      await loadDiseases();
      return { success: true, message: "Disease deleted successfully" };
    } catch (err) {
      return { success: false, error: "Failed to delete disease" };
    }
  };

  const toggleActive = async (diseaseId) => {
    try {
      const updatedDisease = await diseaseAPI.toggleDiseaseActive(diseaseId);
      await loadDiseases();
      const status = updatedDisease.is_active ? "activated" : "deactivated";
      return { 
        success: true, 
        message: `Disease ${status} successfully` 
      };
    } catch (err) {
      return { 
        success: false, 
        error: "Failed to toggle disease status" 
      };
    }
  };

  return {
    diseases,
    loading,
    dialogOpen,
    editingDisease,
    formData,
    setFormData,
    loadDiseases,
    openDialog,
    closeDialog,
    submitDisease,
    deleteDisease,
    toggleActive,
  };
}
