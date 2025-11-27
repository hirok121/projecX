import { useState } from "react";
import {
  Box,
  Typography,
  Paper,
  Button,
  IconButton,
  Chip,
} from "@mui/material";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import DeleteIcon from "@mui/icons-material/Delete";
import ZoomInIcon from "@mui/icons-material/ZoomIn";
import ZoomOutIcon from "@mui/icons-material/ZoomOut";

function ImageUploadForm({ modality, imageFile, onChange }) {
  const [preview, setPreview] = useState(null);
  const [zoom, setZoom] = useState(1);

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      processFile(file);
    }
  };

  const handleDrop = (event) => {
    event.preventDefault();
    const file = event.dataTransfer.files[0];
    if (file) {
      processFile(file);
    }
  };

  const processFile = (file) => {
    // Validate file type
    const validTypes = [
      "image/jpeg",
      "image/png",
      "image/jpg",
      "application/dicom",
    ];
    if (!validTypes.includes(file.type) && !file.name.endsWith(".dcm")) {
      alert("Please upload a valid image file (JPG, PNG, or DICOM)");
      return;
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      alert("File size must be less than 10MB");
      return;
    }

    onChange(file);

    // Generate preview
    const reader = new FileReader();
    reader.onload = (e) => setPreview(e.target.result);
    reader.readAsDataURL(file);
  };

  const handleRemove = () => {
    onChange(null);
    setPreview(null);
    setZoom(1);
  };

  const handleDragOver = (event) => {
    event.preventDefault();
  };

  const getModalityLabel = () => {
    const labels = {
      mri: "MRI",
      ct: "CT",
      xray: "X-Ray",
    };
    return labels[modality?.toLowerCase()] || "Image";
  };

  const getAcceptedFormats = () => {
    return "image/jpeg,image/png,image/jpg,.dcm";
  };

  return (
    <Box>
      <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
        Upload {getModalityLabel()} Image
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        Upload your medical imaging file for AI analysis
      </Typography>

      {/* Drag-and-drop zone or preview */}
      {!preview ? (
        <Paper
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          sx={{
            p: 6,
            textAlign: "center",
            border: "3px dashed",
            borderColor: "primary.main",
            cursor: "pointer",
            backgroundColor: "primary.50",
            borderRadius: 2,
            transition: "all 0.3s",
            "&:hover": {
              backgroundColor: "primary.100",
              borderColor: "primary.dark",
            },
          }}
        >
          <CloudUploadIcon
            sx={{ fontSize: 80, color: "primary.main", mb: 2 }}
          />
          <Typography variant="h6" gutterBottom>
            Drag & drop your {getModalityLabel()} image here
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            or click to browse files
          </Typography>

          <input
            type="file"
            accept={getAcceptedFormats()}
            onChange={handleFileChange}
            style={{ display: "none" }}
            id="file-upload-input"
          />
          <label htmlFor="file-upload-input">
            <Button variant="contained" component="span" size="large">
              Choose File
            </Button>
          </label>

          <Box sx={{ mt: 3 }}>
            <Chip label="JPG" size="small" sx={{ mx: 0.5 }} />
            <Chip label="PNG" size="small" sx={{ mx: 0.5 }} />
            <Chip label="DICOM (.dcm)" size="small" sx={{ mx: 0.5 }} />
          </Box>

          <Typography variant="caption" display="block" sx={{ mt: 2 }}>
            Maximum file size: 10MB
          </Typography>
        </Paper>
      ) : (
        <Paper sx={{ p: 2, borderRadius: 2 }}>
          {/* Preview Controls */}
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              mb: 2,
            }}
          >
            <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
              Image Preview
            </Typography>
            <Box sx={{ display: "flex", gap: 1 }}>
              <IconButton
                size="small"
                onClick={() => setZoom((z) => Math.max(0.5, z - 0.25))}
                disabled={zoom <= 0.5}
              >
                <ZoomOutIcon />
              </IconButton>
              <Typography variant="body2" sx={{ lineHeight: "32px", px: 1 }}>
                {Math.round(zoom * 100)}%
              </Typography>
              <IconButton
                size="small"
                onClick={() => setZoom((z) => Math.min(3, z + 0.25))}
                disabled={zoom >= 3}
              >
                <ZoomInIcon />
              </IconButton>
              <IconButton
                size="small"
                color="error"
                onClick={handleRemove}
                sx={{ ml: 1 }}
              >
                <DeleteIcon />
              </IconButton>
            </Box>
          </Box>

          {/* Image Preview */}
          <Box
            sx={{
              maxHeight: 500,
              overflow: "auto",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              backgroundColor: "#000",
              borderRadius: 1,
              p: 2,
            }}
          >
            <img
              src={preview}
              alt="Preview"
              style={{
                maxWidth: "100%",
                objectFit: "contain",
                transform: `scale(${zoom})`,
                transition: "transform 0.2s",
              }}
            />
          </Box>

          {/* File Info */}
          {imageFile && (
            <Box sx={{ mt: 2 }}>
              <Typography variant="body2" color="text.secondary">
                <strong>File:</strong> {imageFile.name}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                <strong>Size:</strong>{" "}
                {(imageFile.size / 1024 / 1024).toFixed(2)} MB
              </Typography>
            </Box>
          )}
        </Paper>
      )}
    </Box>
  );
}

export default ImageUploadForm;
