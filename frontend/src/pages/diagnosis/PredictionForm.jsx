import { useState, useEffect } from "react";
import {
  Container,
  Typography,
  Grid,
  Paper,
  Box,
  Button,
  CircularProgress,
  Alert,
  TextField,
} from "@mui/material";
import { useLocation, useNavigate } from "react-router-dom";
import { diagnosisAPI } from "../../services/diagnosisAPI";
import { classifierAPI } from "../../services/classifierAPI";
import NavBar from "../../components/layout/NavBar";
import ImageUploadForm from "../../components/diagnosis/ImageUploadForm";
import PredictionSummary from "../../components/diagnosis/PredictionSummary";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import logger from "../../utils/logger";

function PredictionForm() {
  const location = useLocation();
  const navigate = useNavigate();
  const { selectedModel, modality, disease } = location.state || {};

  const [inputData, setInputData] = useState({});
  const [imageFile, setImageFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [requiredFeatures, setRequiredFeatures] = useState([]);
  const [fetchingFeatures, setFetchingFeatures] = useState(true);

  // Fetch required features from selected classifier
  useEffect(() => {
    const fetchRequiredFeatures = async () => {
      if (!selectedModel) {
        setFetchingFeatures(false);
        return;
      }

      try {
        setFetchingFeatures(true);

        // Fetch the classifier and get its required_features
        const classifier = await classifierAPI.getClassifier(selectedModel.id);
        if (
          classifier.required_features &&
          Array.isArray(classifier.required_features)
        ) {
          setRequiredFeatures(classifier.required_features);
        } else {
          setRequiredFeatures([]);
        }
      } catch (err) {
        logger.error("Failed to fetch required features:", err);
        setError("Failed to load input fields. Please try again.");
      } finally {
        setFetchingFeatures(false);
      }
    };

    fetchRequiredFeatures();
  }, [selectedModel]);

  const handleSubmit = async () => {
    setLoading(true);
    setError(null);

    try {
      // Use the selected classifier
      const classifierId = selectedModel.id;

      if (modality === "tabular") {
        // For tabular data, send as JSON
        const diagnosisData = {
          classifier_id: classifierId,
          input_data: inputData,
        };

        const response = await diagnosisAPI.predict(diagnosisData);

        // Navigate to results page
        if (response && response.id) {
          navigate(`/diagnosis/${response.id}`, {
            state: { diagnosis: response, disease, modality },
          });
        }
      } else {
        // For image modalities - not yet implemented
        setError("Image-based diagnosis is not yet implemented");
        setLoading(false);
        return;
      }
    } catch (err) {
      logger.error("Prediction failed:", err);
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
      return requiredFeatures.every((field) => inputData[field]);
    } else {
      // Check if image is uploaded
      return imageFile !== null;
    }
  };

  const handleFieldChange = (field, value) => {
    setInputData({ ...inputData, [field]: value });
  };

  if (!disease || !selectedModel) {
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
          sx={{ fontWeight: 700, color: "#10B981" }}
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
              {fetchingFeatures ? (
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    minHeight: 200,
                  }}
                >
                  <CircularProgress />
                </Box>
              ) : modality === "tabular" ? (
                <Box>
                  <Typography variant="h6" sx={{ fontWeight: 600, mb: 3 }}>
                    Enter Clinical Data
                  </Typography>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ mb: 3 }}
                  >
                    Please fill in all laboratory test results. All fields are
                    required for accurate prediction.
                  </Typography>

                  <Grid container spacing={3}>
                    {requiredFeatures.map((feature) => (
                      <Grid item xs={12} sm={6} key={feature}>
                        <TextField
                          fullWidth
                          label={feature}
                          type="number"
                          value={inputData[feature] || ""}
                          onChange={(e) =>
                            handleFieldChange(feature, e.target.value)
                          }
                          required
                          sx={{
                            "& .MuiOutlinedInput-root": {
                              "&.Mui-focused fieldset": {
                                borderColor: "#10B981",
                              },
                            },
                            "& .MuiInputLabel-root.Mui-focused": {
                              color: "#10B981",
                            },
                          }}
                        />
                      </Grid>
                    ))}
                  </Grid>

                  {requiredFeatures.length === 0 && (
                    <Box sx={{ textAlign: "center", py: 4 }}>
                      <Typography variant="body1" color="text.secondary">
                        No input fields configured for this disease
                      </Typography>
                    </Box>
                  )}
                </Box>
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
                  disabled={loading || !isFormValid() || fetchingFeatures}
                  size="large"
                  fullWidth
                  sx={{
                    backgroundColor: "#10B981",
                    "&:hover": { backgroundColor: "#059669" },
                  }}
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

          {/* Sidebar - Selected Model Summary */}
          <Grid item xs={12} md={4}>
            <PredictionSummary
              disease={disease}
              modality={modality}
              selectedModelIds={[selectedModel.id]}
            />
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
}

export default PredictionForm;
