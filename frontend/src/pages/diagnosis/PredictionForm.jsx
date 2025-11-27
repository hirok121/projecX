import { useState } from "react";
import {
  Container,
  Typography,
  Grid,
  Paper,
  Box,
  Button,
  CircularProgress,
  Alert,
} from "@mui/material";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import { diagnosisAPI } from "../../services/diagnosisAPI";
import NavBar from "../../components/layout/NavBar";
import ImageUploadForm from "../../components/diagnosis/ImageUploadForm";
import TabularInputForm from "../../components/diagnosis/TabularInputForm";
import PredictionSummary from "../../components/diagnosis/PredictionSummary";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";

function PredictionForm() {
  const { diseaseId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { selectedModels, modality, disease } = location.state || {};

  const [inputData, setInputData] = useState({});
  const [imageFile, setImageFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async () => {
    setLoading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append("disease_id", diseaseId);
      formData.append("classifier_ids", JSON.stringify(selectedModels));

      if (modality === "tabular") {
        formData.append("input_data", JSON.stringify(inputData));
      } else {
        // For image modalities (mri, ct, xray)
        if (!imageFile) {
          setError("Please upload an image file");
          setLoading(false);
          return;
        }
        formData.append("image", imageFile);
        formData.append("modality", modality);
      }

      const response = await diagnosisAPI.predict(formData);

      // Navigate to results page
      if (response.data && response.data.length > 0) {
        navigate(`/diagnosis/results/${response.data[0].id}`, {
          state: { results: response.data, disease, modality },
        });
      }
    } catch (err) {
      console.error("Prediction failed:", err);
      setError(
        err.response?.data?.detail ||
          "Prediction failed. Please try again or contact support."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    navigate(-1);
  };

  const getModalityLabel = () => {
    const labels = {
      mri: "MRI",
      ct: "CT Scan",
      xray: "X-Ray",
      tabular: "Lab Data",
    };
    return labels[modality?.toLowerCase()] || modality?.toUpperCase();
  };

  const isFormValid = () => {
    if (modality === "tabular") {
      // Check if all required fields are filled
      const requiredFeatures = disease?.required_features || [];
      return requiredFeatures.every((field) => inputData[field]);
    } else {
      // Check if image is uploaded
      return imageFile !== null;
    }
  };

  if (!disease || !selectedModels) {
    return (
      <Box sx={{ backgroundColor: "#F0F4F8", minHeight: "100vh" }}>
        <NavBar />
        <Container maxWidth="lg" sx={{ py: 4 }}>
          <Alert severity="error">
            Invalid session. Please start from the disease selection page.
          </Alert>
          <Button
            variant="contained"
            onClick={() => navigate("/diagnosis")}
            sx={{ mt: 2 }}
          >
            Go to Disease Selection
          </Button>
        </Container>
      </Box>
    );
  }

  return (
    <Box sx={{ backgroundColor: "#F0F4F8", minHeight: "100vh" }}>
      <NavBar />

      <Container maxWidth="lg" sx={{ py: 4 }}>
        {/* Back Button */}
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={handleBack}
          sx={{ mb: 3 }}
        >
          Back to Model Selection
        </Button>

        {/* Header */}
        <Typography
          variant="h4"
          gutterBottom
          sx={{ fontWeight: 700, color: "#1976d2" }}
        >
          Enter {getModalityLabel()} Data
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
          {disease.name} - Provide the required data for prediction
        </Typography>

        {/* Error Alert */}
        {error && (
          <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
            {error}
          </Alert>
        )}

        <Grid container spacing={3}>
          {/* Main Form Area */}
          <Grid item xs={12} md={8}>
            <Paper sx={{ p: 3, borderRadius: 2 }}>
              {modality === "tabular" ? (
                <TabularInputForm
                  requiredFeatures={disease.required_features || []}
                  inputData={inputData}
                  onChange={setInputData}
                />
              ) : (
                <ImageUploadForm
                  modality={modality}
                  imageFile={imageFile}
                  onChange={setImageFile}
                />
              )}

              {/* Submit Button */}
              <Box sx={{ mt: 4, display: "flex", gap: 2 }}>
                <Button
                  variant="outlined"
                  onClick={handleBack}
                  disabled={loading}
                >
                  Back
                </Button>
                <Button
                  variant="contained"
                  onClick={handleSubmit}
                  disabled={loading || !isFormValid()}
                  size="large"
                  fullWidth
                >
                  {loading ? (
                    <>
                      <CircularProgress size={24} sx={{ mr: 1 }} />
                      Running Prediction...
                    </>
                  ) : (
                    "Run Prediction"
                  )}
                </Button>
              </Box>
            </Paper>
          </Grid>

          {/* Sidebar - Selected Models Summary */}
          <Grid item xs={12} md={4}>
            <PredictionSummary
              disease={disease}
              modality={modality}
              selectedModelIds={selectedModels}
            />
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
}

export default PredictionForm;
