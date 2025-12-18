import { useState } from "react";
import {
  Box,
  Button,
  Typography,
  Alert,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from "@mui/material";
import { CloudUpload, CheckCircle } from "@mui/icons-material";

function ImageFileUploadStep({ imageModelFile, onFileChange, onNext, onBack, onCancel, isEditMode }) {
  const [framework, setFramework] = useState("tensorflow");
  const [uploadError, setUploadError] = useState("");

  const frameworkOptions = [
    { value: "tensorflow", label: "TensorFlow/Keras", extensions: ".h5,.keras" },
    { value: "pytorch", label: "PyTorch", extensions: ".pt,.pth" },
    { value: "onnx", label: "ONNX", extensions: ".onnx" },
  ];

  const selectedFramework = frameworkOptions.find((f) => f.value === framework);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file extension
      const ext = file.name.toLowerCase().split(".").pop();
      const validExtensions = selectedFramework.extensions
        .split(",")
        .map((e) => e.replace(".", ""));

      if (!validExtensions.includes(ext)) {
        setUploadError(
          `Invalid file type. Please upload a ${selectedFramework.extensions} file.`
        );
        return;
      }

      setUploadError("");
      onFileChange(file);
    }
  };

  // In edit mode, can skip without selecting file. In create mode, must select file.
  const canProceed = isEditMode || imageModelFile !== null;

  return (
    <Box>
      <Typography variant="h6" sx={{ mb: 2, color: "#2C3E50" }}>
        Upload Model File
      </Typography>

      <Typography variant="body2" sx={{ mb: 3, color: "#6B7280" }}>
        Select your trained image classification model. Choose the framework and select
        the corresponding model file. The file will be uploaded when you complete the wizard.
      </Typography>

      {uploadError && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setUploadError("")}>
          {uploadError}
        </Alert>
      )}

      <Box sx={{ mb: 3 }}>
        <FormControl fullWidth sx={{ mb: 3 }}>
          <InputLabel>Model Framework</InputLabel>
          <Select
            value={framework}
            onChange={(e) => setFramework(e.target.value)}
            label="Model Framework"
            sx={{
              "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                borderColor: "#10B981",
              },
            }}
          >
            {frameworkOptions.map((option) => (
              <MenuItem key={option.value} value={option.value}>
                {option.label} ({option.extensions})
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <Box
          sx={{
            border: "2px dashed #10B981",
            borderRadius: 2,
            p: 4,
            backgroundColor: "#ECFDF5",
            textAlign: "center",
          }}
        >
          <input
            accept={selectedFramework.extensions}
            style={{ display: "none" }}
            id="model-file-upload"
            type="file"
            onChange={handleFileChange}
          />
          <label htmlFor="model-file-upload">
            <Button
              variant="outlined"
              component="span"
              startIcon={
                imageModelFile ? (
                  <CheckCircle sx={{ color: "#10B981" }} />
                ) : (
                  <CloudUpload />
                )
              }
              sx={{
                borderColor: imageModelFile ? "#10B981" : "#D1D5DB",
                color: imageModelFile ? "#10B981" : "#6B7280",
                backgroundColor: imageModelFile ? "#ECFDF5" : "white",
                "&:hover": {
                  borderColor: "#10B981",
                  backgroundColor: "#ECFDF5",
                },
                px: 4,
                py: 2,
                fontSize: "1rem",
              }}
            >
              {imageModelFile ? "Change Model File" : "Select Model File"}
            </Button>
          </label>

          {imageModelFile && (
            <Box sx={{ mt: 3 }}>
              <Typography variant="body2" sx={{ color: "#10B981", fontWeight: 500 }}>
                ✓ File Selected
              </Typography>
              <Typography variant="caption" sx={{ color: "#6B7280" }}>
                {imageModelFile.name} ({(imageModelFile.size / 1024 / 1024).toFixed(2)} MB)
              </Typography>
            </Box>
          )}

          {!imageModelFile && (
            <Typography variant="caption" sx={{ display: "block", mt: 2, color: "#6B7280" }}>
              Accepted formats: {selectedFramework.extensions}
            </Typography>
          )}
        </Box>
      </Box>

      <Alert severity="info" sx={{ mb: 3 }}>
        <Typography variant="body2">
          <strong>Note:</strong> Make sure your model file is compatible with the selected
          framework. The file will be uploaded when you complete the wizard.
        </Typography>
      </Alert>

      <Box sx={{ display: "flex", justifyContent: "space-between", mt: 4 }}>
        <Box sx={{ display: "flex", gap: 2 }}>
          <Button 
            onClick={onBack}
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
          {isEditMode && (
            <Button
              variant="outlined"
              onClick={onNext}
              sx={{
                color: "#10B981",
                borderColor: "#10B981",
                "&:hover": { 
                  borderColor: "#059669",
                  backgroundColor: "#ECFDF5"
                },
              }}
            >
              Skip
            </Button>
          )}
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
            Next
          </Button>
        </Box>
      </Box>
    </Box>
  );
}

export default ImageFileUploadStep;
