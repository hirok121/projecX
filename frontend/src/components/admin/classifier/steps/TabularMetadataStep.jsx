import { useState } from "react";
import {
  Box,
  Button,
  Typography,
  CircularProgress,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material";
import FeatureMetadataEditor from "../components/FeatureMetadataEditor";
import AccuracyMetricsForm from "../components/AccuracyMetricsForm";

function TabularMetadataStep({
  formData,
  onChange,
  extractedFeatures,
  onSubmit,
  onBack,
  onCancel,
  loading,
  isEditMode,
}) {
  const [submitError, setSubmitError] = useState("");
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  
  const handleFeatureMetadataChange = (featureName, metadata) => {
    onChange({
      feature_metadata: {
        ...formData.feature_metadata,
        [featureName]: metadata,
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
        feature_metadata: formData.feature_metadata || {},
        accuracy: formData.accuracy ? parseFloat(formData.accuracy) : null,
        precision: formData.precision ? parseFloat(formData.precision) : null,
        recall: formData.recall ? parseFloat(formData.recall) : null,
        f1_score: formData.f1_score ? parseFloat(formData.f1_score) : null,
        training_date: formData.training_date || null,
        training_samples: formData.training_samples
          ? parseInt(formData.training_samples)
          : null,
      };
      
      // Call parent submit with metadata
      await onSubmit(metadata, true); // true = isTabular
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
        Feature Metadata & Performance Metrics
      </Typography>

      <Typography variant="body2" sx={{ mb: 3, color: "#6B7280" }}>
        Add metadata for each feature to help users understand what each feature
        represents. Also provide performance metrics for your model.
      </Typography>

      {submitError && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setSubmitError("")}>
          {submitError}
        </Alert>
      )}

      {extractedFeatures.length === 0 && (
        <Alert severity="warning" sx={{ mb: 3 }}>
          No features found. Please go back and extract features from your model files.
        </Alert>
      )}

      {/* Feature Metadata Section */}
      {extractedFeatures.length > 0 && (
        <Box sx={{ mb: 4 }}>
          <Typography variant="h6" sx={{ mb: 2, color: "#2C3E50" }}>
            Feature Metadata
          </Typography>
          <Typography variant="body2" sx={{ mb: 3, color: "#6B7280" }}>
            Provide details for each feature ({extractedFeatures.length} features)
          </Typography>

          <Box sx={{ maxHeight: "400px", overflowY: "auto", pr: 1 }}>
            {extractedFeatures.map((feature) => (
              <FeatureMetadataEditor
                key={feature}
                featureName={feature}
                metadata={formData.feature_metadata?.[feature] || {}}
                onChange={(metadata) =>
                  handleFeatureMetadataChange(feature, metadata)
                }
              />
            ))}
          </Box>
        </Box>
      )}

      {/* Metrics Section */}
      <Box sx={{ mb: 4 }}>
        <AccuracyMetricsForm
          metrics={{
            accuracy: formData.accuracy,
            precision: formData.precision,
            recall: formData.recall,
            f1_score: formData.f1_score,
            training_date: formData.training_date,
            training_samples: formData.training_samples,
          }}
          onChange={handleMetricsChange}
          includeImageMetrics={false}
        />
      </Box>

      {/* Summary */}
      <Alert severity="info" sx={{ mb: 3 }}>
        <Typography variant="body2">
          <strong>Note:</strong> Feature metadata and metrics are optional but highly
          recommended for better model documentation and user understanding.
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
            disabled={loading || extractedFeatures.length === 0}
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

export default TabularMetadataStep;
