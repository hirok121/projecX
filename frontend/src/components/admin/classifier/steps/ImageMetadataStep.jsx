import {
  Box,
  Button,
  Typography,
  CircularProgress,
  Alert,
  TextField,
  Paper,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material";
import { Add, Close } from "@mui/icons-material";
import { useState } from "react";
import AccuracyMetricsForm from "../components/AccuracyMetricsForm";

function ImageMetadataStep({
  formData,
  onChange,
  onSubmit,
  onBack,
  onCancel,
  loading,
  isEditMode,
}) {
  const [newLabel, setNewLabel] = useState("");
  const [submitError, setSubmitError] = useState("");
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);

  const classLabels = formData.classifier_config?.class_labels || [];

  const handleAddLabel = () => {
    if (newLabel.trim()) {
      onChange({
        classifier_config: {
          ...formData.classifier_config,
          class_labels: [...classLabels, newLabel.trim()],
        },
      });
      setNewLabel("");
    }
  };

  const handleRemoveLabel = (index) => {
    const updated = classLabels.filter((_, i) => i !== index);
    onChange({
      classifier_config: {
        ...formData.classifier_config,
        class_labels: updated,
      },
    });
  };

  const handleInputShapeChange = (value) => {
    onChange({
      classifier_config: {
        ...formData.classifier_config,
        input_shape: value,
      },
    });
  };

  const handleMetricsChange = (metrics) => {
    onChange(metrics);
  };

  const handleSubmitClick = () => {
    setConfirmDialogOpen(true);
  };

  const handleConfirmSubmit = async () => {
    setConfirmDialogOpen(false);
    
    try {
      setSubmitError("");
      
      // Prepare metadata
      const metadata = {
        classifier_config: formData.classifier_config || {},
        accuracy: formData.accuracy ? parseFloat(formData.accuracy) : null,
        auc_roc: formData.auc_roc ? parseFloat(formData.auc_roc) : null,
        sensitivity: formData.sensitivity
          ? parseFloat(formData.sensitivity)
          : null,
        specificity: formData.specificity
          ? parseFloat(formData.specificity)
          : null,
        training_date: formData.training_date || null,
        training_samples: formData.training_samples
          ? parseInt(formData.training_samples)
          : null,
      };
      
      // Call parent submit with metadata
      await onSubmit(metadata, false); // false = not tabular (image)
    } catch (error) {
      setSubmitError(
        error.response?.data?.detail ||
          error.message ||
          "Failed to save metadata. Please try again."
      );
    }
  };

  return (
    <Box>
      <Typography variant="h6" sx={{ mb: 2, color: "#2C3E50" }}>
        Model Configuration & Performance Metrics
      </Typography>

      <Typography variant="body2" sx={{ mb: 3, color: "#6B7280" }}>
        Configure your image model settings and provide performance metrics.
      </Typography>

      {submitError && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setSubmitError("")}>
          {submitError}
        </Alert>
      )}

      {/* Model Configuration Section */}
      <Paper
        elevation={0}
        sx={{
          p: 3,
          mb: 4,
          backgroundColor: "#F9FAFB",
          border: "1px solid #E5E7EB",
          borderRadius: 2,
        }}
      >
        <Typography variant="h6" sx={{ mb: 3, color: "#2C3E50" }}>
          Model Configuration
        </Typography>

        {/* Class Labels */}
        <Box sx={{ mb: 3 }}>
          <Typography variant="subtitle2" sx={{ mb: 2, color: "#2C3E50" }}>
            Class Labels
          </Typography>
          <Typography variant="caption" sx={{ mb: 2, display: "block", color: "#6B7280" }}>
            Add the class labels that your model predicts
          </Typography>

          <Box sx={{ display: "flex", gap: 1, mb: 2, flexWrap: "wrap" }}>
            {classLabels.map((label, index) => (
              <Chip
                key={index}
                label={label}
                onDelete={() => handleRemoveLabel(index)}
                deleteIcon={<Close />}
                sx={{
                  backgroundColor: "#10B981",
                  color: "white",
                  "& .MuiChip-deleteIcon": {
                    color: "white",
                    "&:hover": { color: "#F3F4F6" },
                  },
                }}
              />
            ))}
          </Box>

          <Box sx={{ display: "flex", gap: 1 }}>
            <TextField
              fullWidth
              size="small"
              placeholder="e.g., Normal, Pneumonia, COVID-19"
              value={newLabel}
              onChange={(e) => setNewLabel(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  handleAddLabel();
                }
              }}
              sx={{
                "& .MuiOutlinedInput-root": {
                  backgroundColor: "white",
                  "&.Mui-focused fieldset": { borderColor: "#10B981" },
                },
              }}
            />
            <Button
              variant="contained"
              onClick={handleAddLabel}
              disabled={!newLabel.trim()}
              sx={{
                backgroundColor: "#10B981",
                "&:hover": { backgroundColor: "#059669" },
                minWidth: "100px",
              }}
            >
              <Add sx={{ mr: 0.5 }} /> Add
            </Button>
          </Box>
        </Box>

        {/* Input Shape */}
        <Box>
          <Typography variant="subtitle2" sx={{ mb: 2, color: "#2C3E50" }}>
            Input Shape (Optional)
          </Typography>
          <TextField
            fullWidth
            placeholder="e.g., 224,224,3 or [224, 224, 3]"
            value={formData.classifier_config?.input_shape || ""}
            onChange={(e) => handleInputShapeChange(e.target.value)}
            helperText="Enter the expected input dimensions for your model"
            sx={{
              "& .MuiOutlinedInput-root": {
                backgroundColor: "white",
                "&.Mui-focused fieldset": { borderColor: "#10B981" },
              },
              "& .MuiInputLabel-root.Mui-focused": { color: "#10B981" },
            }}
          />
        </Box>
      </Paper>

      {/* Metrics Section */}
      <Box sx={{ mb: 4 }}>
        <AccuracyMetricsForm
          metrics={{
            accuracy: formData.accuracy,
            precision: formData.precision,
            recall: formData.recall,
            f1_score: formData.f1_score,
            auc_roc: formData.auc_roc,
            sensitivity: formData.sensitivity,
            specificity: formData.specificity,
            training_date: formData.training_date,
            training_samples: formData.training_samples,
          }}
          onChange={handleMetricsChange}
          includeImageMetrics={true}
        />
      </Box>

      {/* Summary */}
      <Alert severity="info" sx={{ mb: 3 }}>
        <Typography variant="body2">
          <strong>Note:</strong> Model configuration and metrics are optional but
          recommended for better documentation and reproducibility.
        </Typography>
      </Alert>

      <Box sx={{ display: "flex", justifyContent: "space-between", mt: 4 }}>
        <Box sx={{ display: "flex", gap: 2 }}>
          <Button 
            onClick={onBack}
            disabled={loading}
            variant="outlined"
            sx={{ 
              color: "#6B7280",
              borderColor: "#D1D5DB",
              "&:hover": {
                borderColor: "#9CA3AF",
                backgroundColor: "#F9FAFB"
              }
            }}
          >
            Back
          </Button>
          <Button 
            onClick={onCancel} 
            disabled={loading}
            variant="outlined"
            sx={{ 
              color: "#6B7280",
              borderColor: "#D1D5DB",
              "&:hover": {
                borderColor: "#9CA3AF",
                backgroundColor: "#F9FAFB"
              }
            }}
          >
            Cancel
          </Button>
        </Box>
        <Box sx={{ display: "flex", gap: 2 }}>
          <Button
            variant="contained"
            onClick={handleSubmitClick}
            disabled={loading}
            sx={{
              backgroundColor: "#10B981",
              "&:hover": { backgroundColor: "#059669" },
              "&:disabled": { backgroundColor: "#D1D5DB" },
              px: 4,
            }}
          >
            {loading ? (
              <>
                <CircularProgress size={20} sx={{ mr: 1, color: "white" }} />
                {isEditMode ? "Updating..." : "Creating..."}
              </>
            ) : (
              <>{isEditMode ? "Update Classifier" : "Create Classifier"}</>
            )}
          </Button>
        </Box>
      </Box>

      {/* Confirmation Dialog */}
      <Dialog
        open={confirmDialogOpen}
        onClose={() => setConfirmDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle sx={{ color: "#2C3E50", fontWeight: 600 }}>
          {isEditMode ? "Update Classifier?" : "Create Classifier?"}
        </DialogTitle>
        <DialogContent>
          <Typography variant="body1" sx={{ color: "#6B7280" }}>
            {isEditMode
              ? "Are you sure you want to update this classifier? This will save all changes you've made."
              : "Are you sure you want to create this classifier? This will save all the information and files you've uploaded."}
          </Typography>
        </DialogContent>
        <DialogActions sx={{ p: 2, gap: 1 }}>
          <Button
            onClick={() => setConfirmDialogOpen(false)}
            variant="outlined"
            sx={{
              color: "#6B7280",
              borderColor: "#D1D5DB",
              "&:hover": {
                borderColor: "#9CA3AF",
                backgroundColor: "#F9FAFB",
              },
            }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleConfirmSubmit}
            variant="contained"
            sx={{
              backgroundColor: "#10B981",
              "&:hover": { backgroundColor: "#059669" },
              px: 3,
            }}
          >
            {isEditMode ? "Yes, Update" : "Yes, Create"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default ImageMetadataStep;
