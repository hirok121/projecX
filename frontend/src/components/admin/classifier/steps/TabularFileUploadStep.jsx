import { useState } from "react";
import {
  Box,
  Button,
  Typography,
  Alert,
  CircularProgress,
  Chip,
} from "@mui/material";
import { CloudUpload, CheckCircle } from "@mui/icons-material";
import { classifierAPI } from "../../../../services/classifierAPI";

function TabularFileUploadStep({
  modelFiles,
  onFileChange,
  extractedFeatures,
  onFeaturesExtracted,
  classifierId,
  onNext,
  onCancel,
  isEditMode,
}) {
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const [uploadSuccess, setUploadSuccess] = useState(false);

  const fileTypes = [
    { key: "features_file", label: "features.pkl", description: "Feature names" },
    { key: "scaler_file", label: "scaler.pkl", description: "Data scaler" },
    { key: "imputer_file", label: "imputer.pkl", description: "Missing data imputer" },
    { key: "model_file", label: "model.pkl", description: "Trained ML model" },
    { key: "class_file", label: "class.pkl", description: "Class name mapping" },
  ];

  const allFilesSelected = fileTypes.every((type) => modelFiles[type.key] !== null);

  const handleUploadFiles = async () => {
    if (!classifierId) {
      setUploadError("Classifier ID is required to upload files");
      return;
    }

    if (!allFilesSelected) {
      setUploadError("Please select all 5 files before uploading");
      return;
    }

    try {
      setUploading(true);
      setUploadError("");
      
      // Upload files - features are automatically extracted
      const result = await classifierAPI.uploadModelFiles(classifierId, modelFiles);
      
      // Update extracted features from response
      onFeaturesExtracted(result.extracted_features || []);
      setUploadSuccess(true);
    } catch (error) {
      setUploadError(
        error.response?.data?.detail || "Failed to upload files. Please try again."
      );
    } finally {
      setUploading(false);
    }
  };

  // In edit mode, can skip without uploading. In create mode, must upload.
  const canProceed = isEditMode || (uploadSuccess && extractedFeatures.length > 0);

  return (
    <Box>
      <Typography variant="h6" sx={{ mb: 2, color: "#2C3E50" }}>
        Upload Model Files
      </Typography>

      <Typography variant="body2" sx={{ mb: 3, color: "#6B7280" }}>
        Select all 5 pickle files required for the tabular classifier. Features will be
        automatically extracted from features.pkl when you upload.
      </Typography>

      {uploadError && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setUploadError("")}>
          {uploadError}
        </Alert>
      )}

      {uploadSuccess && extractedFeatures.length > 0 && (
        <Alert severity="success" sx={{ mb: 3 }}>
          Successfully uploaded files and extracted {extractedFeatures.length} features!
        </Alert>
      )}

      <Box
        sx={{
          border: "2px dashed #10B981",
          borderRadius: 2,
          p: 3,
          backgroundColor: "#ECFDF5",
          mb: 3,
        }}
      >
        {fileTypes.map((fileType) => (
          <Box key={fileType.key} sx={{ mb: 2 }}>
            <input
              accept=".pkl"
              style={{ display: "none" }}
              id={`${fileType.key}-upload`}
              type="file"
              onChange={(e) => onFileChange(fileType.key, e.target.files[0])}
            />
            <label htmlFor={`${fileType.key}-upload`}>
              <Button
                variant="outlined"
                component="span"
                startIcon={
                  modelFiles[fileType.key] ? (
                    <CheckCircle sx={{ color: "#10B981" }} />
                  ) : (
                    <CloudUpload />
                  )
                }
                sx={{
                  borderColor: modelFiles[fileType.key] ? "#10B981" : "#D1D5DB",
                  color: modelFiles[fileType.key] ? "#10B981" : "#6B7280",
                  backgroundColor: modelFiles[fileType.key] ? "#ECFDF5" : "white",
                  "&:hover": {
                    borderColor: "#10B981",
                    backgroundColor: "#ECFDF5",
                  },
                  width: "100%",
                  justifyContent: "flex-start",
                  textTransform: "none",
                }}
              >
                <Box sx={{ flex: 1, textAlign: "left" }}>
                  <Typography variant="body2" sx={{ fontWeight: 500 }}>
                    {fileType.label}
                  </Typography>
                  <Typography variant="caption" sx={{ color: "#6B7280" }}>
                    {fileType.description}
                  </Typography>
                </Box>
                {modelFiles[fileType.key] && (
                  <Typography variant="caption" sx={{ ml: 2, color: "#10B981" }}>
                    ✓ {modelFiles[fileType.key].name}
                  </Typography>
                )}
              </Button>
            </label>
          </Box>
        ))}

        {allFilesSelected && !uploadSuccess && (
          <Box sx={{ mt: 3, textAlign: "center" }}>
            <Button
              variant="contained"
              onClick={handleUploadFiles}
              disabled={uploading || !classifierId}
              sx={{
                backgroundColor: "#10B981",
                "&:hover": { backgroundColor: "#059669" },
              }}
            >
              {uploading ? (
                <>
                  <CircularProgress size={20} sx={{ mr: 1, color: "white" }} />
                  Uploading Files & Extracting Features...
                </>
              ) : (
                "Upload Files & Extract Features"
              )}
            </Button>
            {!classifierId && (
              <Typography variant="caption" sx={{ display: "block", mt: 1, color: "#EF4444" }}>
                Please save basic info first before uploading files
              </Typography>
            )}
          </Box>
        )}
      </Box>

      {extractedFeatures.length > 0 && (
        <Box
          sx={{
            p: 3,
            backgroundColor: "#F0FDF4",
            borderRadius: 2,
            border: "1px solid #10B981",
            mb: 3,
          }}
        >
          <Typography variant="subtitle2" sx={{ mb: 2, color: "#10B981", fontWeight: 600 }}>
            Extracted Features ({extractedFeatures.length})
          </Typography>
          <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
            {extractedFeatures.map((feature, index) => (
              <Chip
                key={index}
                label={feature}
                size="small"
                sx={{
                  backgroundColor: "#10B981",
                  color: "white",
                  fontWeight: 500,
                }}
              />
            ))}
          </Box>
        </Box>
      )}

      <Box sx={{ display: "flex", justifyContent: "space-between", mt: 4 }}>
        <Button 
          onClick={onCancel}
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
        <Button
          variant="contained"
          onClick={onNext}
          disabled={!canProceed}
          sx={{
            backgroundColor: "#10B981",
            "&:hover": { backgroundColor: "#059669" },
            "&:disabled": { backgroundColor: "#D1D5DB" },
          }}
        >
          {isEditMode ? "Skip / Next" : "Submit & Next"}
        </Button>
      </Box>
    </Box>
  );
}

export default TabularFileUploadStep;
