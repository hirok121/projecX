import { useState, useEffect } from "react";
import {
  Container,
  Typography,
  Paper,
  Box,
  Button,
  CircularProgress,
  Alert,
} from "@mui/material";
import { useLocation, useNavigate } from "react-router-dom";
import { diagnosisAPI } from "../../services/diagnosisAPI";
import { classifierAPI } from "../../services/classifierAPI";
import NavBar from "../../components/layout/NavBar";
import ImageUploadForm from "../../components/diagnosis/ImageUploadForm";
import ClassifierInfoCard from "../../components/diagnosis/ClassifierInfoCard";
import PatientInfoSection from "../../components/diagnosis/PatientInfoSection";
import ClinicalDataSection from "../../components/diagnosis/ClinicalDataSection";
import DiagnosisResultDialog from "../../components/diagnosis/DiagnosisResultDialog";
import Footer from "../../components/landingPageComponents/Footer.jsx"
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
  const [featureMetadata, setFeatureMetadata] = useState({});
  const [classifierData, setClassifierData] = useState(null);
  const [fetchingFeatures, setFetchingFeatures] = useState(true);
  
  // Patient information
  const [patientName, setPatientName] = useState("");
  const [patientAge, setPatientAge] = useState("");
  const [patientSex, setPatientSex] = useState("");

  // Dialog state
  const [dialogOpen, setDialogOpen] = useState(false);
  const [diagnosisResponse, setDiagnosisResponse] = useState(null);

  // Fetch classifier data including features and metadata
  useEffect(() => {
    const fetchClassifierData = async () => {
      if (!selectedModel) {
        setFetchingFeatures(false);
        return;
      }

      try {
        setFetchingFeatures(true);

        // Fetch the full classifier data
        const classifier = await classifierAPI.getClassifier(selectedModel.id);
        setClassifierData(classifier);
        
        if (
          classifier.required_features &&
          Array.isArray(classifier.required_features)
        ) {
          setRequiredFeatures(classifier.required_features);
        } else {
          setRequiredFeatures([]);
        }

        if (classifier.feature_metadata) {
          setFeatureMetadata(classifier.feature_metadata);
        }
      } catch (err) {
        logger.error("Failed to fetch classifier data:", err);
        setError("Failed to load classifier information. Please try again.");
      } finally {
        setFetchingFeatures(false);
      }
    };

    fetchClassifierData();
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
          name: patientName || null,
          age: patientAge ? parseInt(patientAge) : null,
          sex: patientSex || null,
          input_data: inputData,
        };

        const response = await diagnosisAPI.predict(diagnosisData);

        // Show dialog with response
        if (response && response.id) {
          setDiagnosisResponse(response);
          setDialogOpen(true);
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

  const handleGoHome = () => {
    setDialogOpen(false);
    navigate("/");
  };

  const handleNewDiagnosis = () => {
    setDialogOpen(false);
    navigate("/diagnosis");
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

  const getFilledFieldsCount = () => {
    return requiredFeatures.filter((field) => inputData[field] && inputData[field] !== "").length;
  };

  const getFilledPercentage = () => {
    if (requiredFeatures.length === 0) return 0;
    return (getFilledFieldsCount() / requiredFeatures.length) * 100;
  };

  const isFormValid = () => {
    if (modality === "tabular") {
      // Require at least 50% of fields to be filled
      return getFilledPercentage() >= 50;
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

        {/* Classifier Info Card */}
        {classifierData && (
          <ClassifierInfoCard
            classifierData={classifierData}
            disease={disease}
            modality={modality}
          />
        )}

        {/* Header */}
        <Typography
          variant="h4"
          gutterBottom
          sx={{ fontWeight: 700, color: "#10B981" }}
        >
          Enter {getModalityLabel()} Data
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
          Provide the required data for prediction
        </Typography>

        {/* Error Alert */}
        {error && (
          <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
            {error}
          </Alert>
        )}

        {/* Main Form Area */}
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
                  <PatientInfoSection
                    patientName={patientName}
                    setPatientName={setPatientName}
                    patientAge={patientAge}
                    setPatientAge={setPatientAge}
                    patientSex={patientSex}
                    setPatientSex={setPatientSex}
                  />

                  <ClinicalDataSection
                    requiredFeatures={requiredFeatures}
                    featureMetadata={featureMetadata}
                    inputData={inputData}
                    handleFieldChange={handleFieldChange}
                    getFilledFieldsCount={getFilledFieldsCount}
                    getFilledPercentage={getFilledPercentage}
                  />
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
      </Container>

      {/* Result Dialog */}
      <DiagnosisResultDialog
        open={dialogOpen}
        response={diagnosisResponse}
        onGoHome={handleGoHome}
        onNewDiagnosis={handleNewDiagnosis}
      />
      <Footer/>
    </Box>
  );
}

export default PredictionForm;
