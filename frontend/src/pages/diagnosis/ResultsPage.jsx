import { useState, useEffect } from "react";
import {
  Container,
  Typography,
  Box,
  Paper,
  Grid,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Button,
  Alert,
} from "@mui/material";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import { diagnosisAPI } from "../../services/diagnosisAPI";
import NavBar from "../../components/layout/NavBar";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CancelIcon from "@mui/icons-material/Cancel";
import HomeIcon from "@mui/icons-material/Home";
import RestartAltIcon from "@mui/icons-material/RestartAlt";
import logger from "../../utils/logger";

function ResultsPage() {
  const { predictionId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const [results, setResults] = useState(location.state?.results || []);
  const [loading, setLoading] = useState(!location.state?.results);
  const [disease] = useState(location.state?.disease);
  const [modality] = useState(location.state?.modality);

  const fetchResults = async () => {
    try {
      setLoading(true);
      const response = await diagnosisAPI.getPredictionResult(predictionId);
      setResults([response.data]);
    } catch (error) {
      logger.error("Error fetching results:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!location.state?.results && predictionId) {
      fetchResults();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [predictionId]);

  const getModalityLabel = () => {
    const labels = {
      mri: "MRI",
      ct: "CT Scan",
      xray: "X-Ray",
      tabular: "Lab Data",
    };
    return labels[modality?.toLowerCase()] || modality?.toUpperCase();
  };

  const getResultColor = (result) => {
    // This is a simple heuristic - adjust based on your needs
    if (
      result.toLowerCase().includes("positive") ||
      result.toLowerCase().includes("disease")
    ) {
      return "error";
    }
    if (
      result.toLowerCase().includes("negative") ||
      result.toLowerCase().includes("healthy")
    ) {
      return "success";
    }
    return "info";
  };

  const getResultIcon = (result) => {
    const color = getResultColor(result);
    if (color === "success") {
      return <CheckCircleIcon fontSize="large" />;
    }
    return <CancelIcon fontSize="large" />;
  };

  const handleNewPrediction = () => {
    navigate("/diagnosis");
  };

  const handleBack = () => {
    navigate("/diagnosis");
  };

  if (loading) {
    return (
      <Box sx={{ backgroundColor: "#F0F4F8", minHeight: "100vh" }}>
        <NavBar />
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
            height: "80vh",
            gap: 2,
          }}
        >
          <CircularProgress size={60} />
          <Typography variant="h6" color="text.secondary">
            Loading prediction results...
          </Typography>
        </Box>
      </Box>
    );
  }

  if (!results || results.length === 0) {
    return (
      <Box sx={{ backgroundColor: "#F0F4F8", minHeight: "100vh" }}>
        <NavBar />
        <Container maxWidth="lg" sx={{ py: 4 }}>
          <Alert severity="warning">
            No results found. Please try running the prediction again.
          </Alert>
          <Button
            variant="contained"
            onClick={handleNewPrediction}
            sx={{ mt: 2 }}
          >
            New Prediction
          </Button>
        </Container>
      </Box>
    );
  }

  return (
    <Box sx={{ backgroundColor: "#F0F4F8", minHeight: "100vh" }}>
      <NavBar />

      <Container maxWidth="lg" sx={{ py: 4 }}>
        {/* Header */}
        <Typography
          variant="h3"
          gutterBottom
          sx={{ fontWeight: 700, color: "#1976d2", textAlign: "center" }}
        >
          Prediction Results
        </Typography>
        <Typography
          variant="body1"
          color="text.secondary"
          sx={{ mb: 4, textAlign: "center" }}
        >
          {disease?.name} - {getModalityLabel()} Analysis
        </Typography>

        {/* Results Grid */}
        <Grid container spacing={3}>
          {results.map((result, index) => (
            <Grid item xs={12} md={results.length === 1 ? 12 : 6} key={index}>
              <Card
                sx={{
                  borderRadius: 3,
                  border: `3px solid`,
                  borderColor: `${getResultColor(result.prediction)}.main`,
                  boxShadow: 4,
                }}
              >
                <CardContent sx={{ p: 4 }}>
                  {/* Model Name */}
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      mb: 3,
                    }}
                  >
                    <Typography variant="h5" sx={{ fontWeight: 700 }}>
                      {result.classifier_name || `Model ${index + 1}`}
                    </Typography>
                    <Box
                      sx={{
                        color: `${getResultColor(result.prediction)}.main`,
                      }}
                    >
                      {getResultIcon(result.prediction)}
                    </Box>
                  </Box>

                  {/* Patient Information */}
                  {(result.name || result.age || result.sex) && (
                    <Paper
                      sx={{
                        p: 2,
                        mb: 3,
                        backgroundColor: "grey.50",
                        borderRadius: 2,
                      }}
                    >
                      <Typography
                        variant="subtitle2"
                        color="text.secondary"
                        gutterBottom
                        sx={{ fontWeight: 600 }}
                      >
                        Patient Information
                      </Typography>
                      <Grid container spacing={2}>
                        {result.name && (
                          <Grid item xs={12} sm={4}>
                            <Typography variant="body2" color="text.secondary">
                              Name
                            </Typography>
                            <Typography variant="body1" sx={{ fontWeight: 500 }}>
                              {result.name}
                            </Typography>
                          </Grid>
                        )}
                        {result.age && (
                          <Grid item xs={6} sm={4}>
                            <Typography variant="body2" color="text.secondary">
                              Age
                            </Typography>
                            <Typography variant="body1" sx={{ fontWeight: 500 }}>
                              {result.age} years
                            </Typography>
                          </Grid>
                        )}
                        {result.sex && (
                          <Grid item xs={6} sm={4}>
                            <Typography variant="body2" color="text.secondary">
                              Sex
                            </Typography>
                            <Typography variant="body1" sx={{ fontWeight: 500 }}>
                              {result.sex}
                            </Typography>
                          </Grid>
                        )}
                      </Grid>
                    </Paper>
                  )}

                  {/* Prediction Result */}
                  <Paper
                    sx={{
                      p: 3,
                      mb: 3,
                      backgroundColor: `${getResultColor(
                        result.prediction
                      )}.50`,
                      textAlign: "center",
                      borderRadius: 2,
                    }}
                  >
                    <Typography
                      variant="subtitle2"
                      color="text.secondary"
                      gutterBottom
                    >
                      Prediction
                    </Typography>
                    <Typography
                      variant="h4"
                      sx={{
                        fontWeight: 700,
                        color: `${getResultColor(result.prediction)}.main`,
                      }}
                    >
                      {result.prediction}
                    </Typography>
                  </Paper>

                  {/* Confidence Score */}
                  {result.confidence_score && (
                    <Box sx={{ mb: 2 }}>
                      <Typography
                        variant="subtitle2"
                        color="text.secondary"
                        gutterBottom
                      >
                        Confidence Score
                      </Typography>
                      <Box
                        sx={{ display: "flex", alignItems: "center", gap: 2 }}
                      >
                        <Box sx={{ flexGrow: 1 }}>
                          <Box
                            sx={{
                              width: "100%",
                              height: 12,
                              backgroundColor: "grey.200",
                              borderRadius: 2,
                              overflow: "hidden",
                            }}
                          >
                            <Box
                              sx={{
                                width: `${result.confidence_score * 100}%`,
                                height: "100%",
                                backgroundColor: `${getResultColor(
                                  result.prediction
                                )}.main`,
                                transition: "width 1s ease-in-out",
                              }}
                            />
                          </Box>
                        </Box>
                        <Typography variant="h6" sx={{ fontWeight: 700 }}>
                          {(result.confidence_score * 100).toFixed(1)}%
                        </Typography>
                      </Box>
                    </Box>
                  )}

                  {/* Additional Details */}
                  <Box
                    sx={{
                      display: "flex",
                      gap: 1,
                      flexWrap: "wrap",
                      mt: 3,
                    }}
                  >
                    {result.created_at && (
                      <Chip
                        label={`Analyzed: ${new Date(
                          result.created_at
                        ).toLocaleString()}`}
                        size="small"
                        variant="outlined"
                      />
                    )}
                    {result.model_version && (
                      <Chip
                        label={`Version: ${result.model_version}`}
                        size="small"
                        variant="outlined"
                      />
                    )}
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>

        {/* Important Notice */}
        <Paper
          sx={{
            mt: 4,
            p: 3,
            backgroundColor: "warning.50",
            border: "2px solid",
            borderColor: "warning.main",
            borderRadius: 2,
          }}
        >
          <Typography variant="h6" gutterBottom sx={{ fontWeight: 700 }}>
            ⚠️ Important Medical Disclaimer
          </Typography>
          <Typography variant="body2" color="text.secondary">
            These predictions are generated by AI models for research and
            educational purposes only. They should NOT be used as the sole basis
            for medical diagnosis or treatment decisions. Always consult with
            qualified healthcare professionals for proper medical evaluation and
            advice.
          </Typography>
        </Paper>

        {/* Action Buttons */}
        <Box
          sx={{
            mt: 4,
            display: "flex",
            gap: 2,
            justifyContent: "center",
            flexWrap: "wrap",
          }}
        >
          <Button
            variant="outlined"
            size="large"
            startIcon={<HomeIcon />}
            onClick={handleBack}
          >
            Back to Diseases
          </Button>
          <Button
            variant="contained"
            size="large"
            startIcon={<RestartAltIcon />}
            onClick={handleNewPrediction}
          >
            New Prediction
          </Button>
        </Box>
      </Container>
    </Box>
  );
}

export default ResultsPage;
