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
  Divider,
} from "@mui/material";
import { useParams, useNavigate } from "react-router-dom";
import { diagnosisAPI } from "../../services/diagnosisAPI";
import { notificationAPI } from "../../services/notificationAPI";
import NavBar from "../../components/layout/NavBar";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CancelIcon from "@mui/icons-material/Cancel";
import HomeIcon from "@mui/icons-material/Home";
import RestartAltIcon from "@mui/icons-material/RestartAlt";
import PrintIcon from "@mui/icons-material/Print";
import ArticleIcon from "@mui/icons-material/Article";
import LinkIcon from "@mui/icons-material/Link";
import ScienceIcon from "@mui/icons-material/Science";
import LocalHospitalIcon from "@mui/icons-material/LocalHospital";
import logger from "../../utils/logger";

function ResultsPage() {
  const { predictionId } = useParams();
  const navigate = useNavigate();
  const [diagnosis, setDiagnosis] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchDiagnosis = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await diagnosisAPI.getDiagnosis(predictionId);
      setDiagnosis(response);
      
      // Mark related notifications as read
      await markRelatedNotificationsAsRead(predictionId);
    } catch (err) {
      logger.error("Error fetching diagnosis:", err);
      setError(err.response?.data?.detail || "Failed to load diagnosis results");
    } finally {
      setLoading(false);
    }
  };

  const markRelatedNotificationsAsRead = async (diagnosisId) => {
    try {
      // Fetch all unread notifications
      const notifications = await notificationAPI.getNotifications({ 
        is_read: false,
        limit: 100 
      });
      
      // Find notifications related to this diagnosis
      const relatedNotifications = notifications.filter(
        (n) => n.diagnosis_id === parseInt(diagnosisId)
      );
      
      // Mark each related notification as read
      for (const notification of relatedNotifications) {
        try {
          await notificationAPI.markAsRead(notification.id);
          logger.info(`Marked notification ${notification.id} as read`);
        } catch (error) {
          logger.error(`Failed to mark notification ${notification.id} as read:`, error);
        }
      }
    } catch (error) {
      // Don't fail the page load if notification marking fails
      logger.error("Failed to mark related notifications as read:", error);
    }
  };

  useEffect(() => {
    if (predictionId) {
      fetchDiagnosis();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [predictionId]);

  const getModalityLabel = (modality) => {
    const labels = {
      mri: "MRI",
      ct: "CT Scan",
      xray: "X-Ray",
      tabular: "Lab Data",
    };
    return labels[modality?.toLowerCase()] || modality?.toUpperCase();
  };

  const getStatusColor = (status) => {
    const colors = {
      completed: "success",
      pending: "warning",
      processing: "info",
      failed: "error",
    };
    return colors[status?.toLowerCase()] || "default";
  };

  const getResultColor = (prediction) => {
    if (!prediction) return "info";
    // This is a simple heuristic - adjust based on your needs
    if (
      prediction.toLowerCase().includes("positive") ||
      prediction.toLowerCase().includes("disease")
    ) {
      return "error";
    }
    if (
      prediction.toLowerCase().includes("negative") ||
      prediction.toLowerCase().includes("healthy")
    ) {
      return "success";
    }
    return "info";
  };

  const getResultIcon = (prediction) => {
    const color = getResultColor(prediction);
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

  const handlePrint = () => {
    window.print();
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
            Loading diagnosis results...
          </Typography>
        </Box>
      </Box>
    );
  }

  if (error || !diagnosis) {
    return (
      <Box sx={{ backgroundColor: "#F0F4F8", minHeight: "100vh" }}>
        <NavBar />
        <Container maxWidth="lg" sx={{ py: 4 }}>
          <Alert severity="error" sx={{ mb: 2 }}>
            {error || "Diagnosis not found"}
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
          Diagnosis Results
        </Typography>
        <Typography
          variant="body1"
          color="text.secondary"
          sx={{ mb: 2, textAlign: "center" }}
        >
          {getModalityLabel(diagnosis.modality)} Analysis
        </Typography>

        {/* Status Chip */}
        <Box sx={{ display: "flex", justifyContent: "center", mb: 4 }}>
          <Chip
            label={diagnosis.status.toUpperCase()}
            color={getStatusColor(diagnosis.status)}
            sx={{ fontWeight: 600, fontSize: "0.9rem", px: 2 }}
          />
        </Box>

        {/* Main Result Card */}
        <Card
          sx={{
            borderRadius: 3,
            border: diagnosis.prediction ? `3px solid` : "none",
            borderColor: diagnosis.prediction
              ? `${getResultColor(diagnosis.prediction)}.main`
              : "transparent",
            boxShadow: 4,
            mb: 3,
          }}
        >
          <CardContent sx={{ p: 4 }}>
            {/* Header with Icon */}
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                mb: 3,
              }}
            >
              <Typography variant="h5" sx={{ fontWeight: 700 }}>
                Diagnosis #{diagnosis.id}
              </Typography>
              {diagnosis.prediction && (
                <Box
                  sx={{
                    color: `${getResultColor(diagnosis.prediction)}.main`,
                  }}
                >
                  {getResultIcon(diagnosis.prediction)}
                </Box>
              )}
            </Box>

            {/* Patient Information */}
            {(diagnosis.name || diagnosis.age || diagnosis.sex) && (
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
                  {diagnosis.name && (
                    <Grid item xs={12} sm={4}>
                      <Typography variant="body2" color="text.secondary">
                        Name
                      </Typography>
                      <Typography variant="body1" sx={{ fontWeight: 500 }}>
                        {diagnosis.name}
                      </Typography>
                    </Grid>
                  )}
                  {diagnosis.age && (
                    <Grid item xs={6} sm={4}>
                      <Typography variant="body2" color="text.secondary">
                        Age
                      </Typography>
                      <Typography variant="body1" sx={{ fontWeight: 500 }}>
                        {diagnosis.age} years
                      </Typography>
                    </Grid>
                  )}
                  {diagnosis.sex && (
                    <Grid item xs={6} sm={4}>
                      <Typography variant="body2" color="text.secondary">
                        Sex
                      </Typography>
                      <Typography variant="body1" sx={{ fontWeight: 500 }}>
                        {diagnosis.sex}
                      </Typography>
                    </Grid>
                  )}
                </Grid>
              </Paper>
            )}

            {/* Prediction Result */}
            {diagnosis.prediction ? (
              <Paper
                sx={{
                  p: 3,
                  mb: 3,
                  backgroundColor: `${getResultColor(diagnosis.prediction)}.50`,
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
                    color: `${getResultColor(diagnosis.prediction)}.main`,
                  }}
                >
                  {diagnosis.prediction}
                </Typography>
              </Paper>
            ) : (
              <Alert severity="info" sx={{ mb: 3 }}>
                {diagnosis.status === "pending" &&
                  "Your diagnosis is pending. Results will appear here once processing is complete."}
                {diagnosis.status === "processing" &&
                  "Your diagnosis is being processed. Please check back shortly."}
                {diagnosis.status === "failed" &&
                  `Processing failed: ${diagnosis.error_message || "Unknown error"}`}
              </Alert>
            )}

            {/* Confidence Score */}
            {diagnosis.confidence && (
              <Box sx={{ mb: 3 }}>
                <Typography
                  variant="subtitle2"
                  color="text.secondary"
                  gutterBottom
                >
                  Confidence Score
                </Typography>
                <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
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
                          width: `${diagnosis.confidence * 100}%`,
                          height: "100%",
                          backgroundColor: `${getResultColor(
                            diagnosis.prediction
                          )}.main`,
                          transition: "width 1s ease-in-out",
                        }}
                      />
                    </Box>
                  </Box>
                  <Typography variant="h6" sx={{ fontWeight: 700 }}>
                    {(diagnosis.confidence * 100).toFixed(1)}%
                  </Typography>
                </Box>
              </Box>
            )}

            {/* Probabilities */}
            {diagnosis.probabilities && (
              <Box sx={{ mb: 3 }}>
                <Typography
                  variant="subtitle2"
                  color="text.secondary"
                  gutterBottom
                  sx={{ fontWeight: 600 }}
                >
                  Class Probabilities
                </Typography>
                <Paper sx={{ p: 2, backgroundColor: "grey.50" }}>
                  <Grid container spacing={2}>
                    {Object.entries(diagnosis.probabilities).map(
                      ([className, probability]) => (
                        <Grid item xs={12} sm={6} key={className}>
                          <Box
                            sx={{
                              display: "flex",
                              justifyContent: "space-between",
                              alignItems: "center",
                            }}
                          >
                            <Typography variant="body2">{className}</Typography>
                            <Typography
                              variant="body2"
                              sx={{ fontWeight: 600 }}
                            >
                              {(probability * 100).toFixed(1)}%
                            </Typography>
                          </Box>
                        </Grid>
                      )
                    )}
                  </Grid>
                </Paper>
              </Box>
            )}

            {/* Input Data - Tabular */}
            {diagnosis.input_data && diagnosis.modality?.toLowerCase() === "tabular" && (
              <Box sx={{ mb: 3 }}>
                <Typography
                  variant="subtitle2"
                  color="text.secondary"
                  gutterBottom
                  sx={{ fontWeight: 600 }}
                >
                  Clinical Input Data
                </Typography>
                <Paper
                  sx={{
                    p: 2,
                    backgroundColor: "grey.50",
                    maxHeight: 400,
                    overflow: "auto",
                  }}
                >
                  <Grid container spacing={2}>
                    {Object.entries(diagnosis.input_data).map(
                      ([feature, value]) => (
                        <Grid item xs={12} sm={6} md={4} key={feature}>
                          <Typography
                            variant="caption"
                            color="text.secondary"
                            sx={{ textTransform: "capitalize" }}
                          >
                            {feature.replace(/_/g, " ")}
                          </Typography>
                          <Typography variant="body2" sx={{ fontWeight: 500 }}>
                            {value !== null && value !== undefined
                              ? value.toString()
                              : "N/A"}
                          </Typography>
                        </Grid>
                      )
                    )}
                  </Grid>
                </Paper>
              </Box>
            )}

            {/* Input Data - Image */}
            {diagnosis.input_file && diagnosis.modality?.toLowerCase() !== "tabular" && (
              <Box sx={{ mb: 3 }}>
                <Typography
                  variant="subtitle2"
                  color="text.secondary"
                  gutterBottom
                  sx={{ fontWeight: 600 }}
                >
                  Input Image
                </Typography>
                <Paper sx={{ p: 2, backgroundColor: "grey.50" }}>
                  <Typography
                    variant="body2"
                    sx={{ fontFamily: "monospace", wordBreak: "break-all" }}
                  >
                    {diagnosis.input_file}
                  </Typography>
                </Paper>
              </Box>
            )}

            {/* Metadata */}
            <Box
              sx={{
                display: "flex",
                gap: 1,
                flexWrap: "wrap",
                mt: 3,
              }}
            >
              {diagnosis.created_at && (
                <Chip
                  label={`Created: ${new Date(
                    diagnosis.created_at
                  ).toLocaleString()}`}
                  size="small"
                  variant="outlined"
                />
              )}
              {diagnosis.completed_at && (
                <Chip
                  label={`Completed: ${new Date(
                    diagnosis.completed_at
                  ).toLocaleString()}`}
                  size="small"
                  variant="outlined"
                />
              )}
              {diagnosis.processing_time && (
                <Chip
                  label={`Processing Time: ${diagnosis.processing_time.toFixed(
                    2
                  )}s`}
                  size="small"
                  variant="outlined"
                />
              )}
            </Box>
          </CardContent>
        </Card>

        {/* Disease Information */}
        {(diagnosis.disease_name || diagnosis.disease_description || diagnosis.disease_blog_link) && (
          <Card
            sx={{
              mt: 3,
              borderRadius: 3,
              boxShadow: 4,
            }}
          >
            <CardContent sx={{ p: 4 }}>
              <Box display="flex" alignItems="center" gap={1} mb={3}>
                <LocalHospitalIcon sx={{ color: "success.main", fontSize: 28 }} />
                <Typography variant="h5" sx={{ fontWeight: 700 }}>
                  Disease Information
                </Typography>
              </Box>
              <Divider sx={{ mb: 3 }} />
              
              <Grid container spacing={3}>
                <Grid item xs={12}>
                  <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                    Disease Name
                  </Typography>
                  <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                    {diagnosis.disease_name || "Unknown"}
                  </Typography>
                </Grid>
                
                {diagnosis.disease_description && (
                  <Grid item xs={12}>
                    <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                      Description
                    </Typography>
                    <Typography variant="body1" sx={{ lineHeight: 1.8 }}>
                      {diagnosis.disease_description}
                    </Typography>
                  </Grid>
                )}
                
                {diagnosis.disease_blog_link && (
                  <Grid item xs={12}>
                    <Button
                      variant="contained"
                      color="success"
                      startIcon={<ArticleIcon />}
                      href={diagnosis.disease_blog_link}
                      target="_blank"
                      rel="noopener noreferrer"
                      sx={{ mt: 1 }}
                    >
                      Learn More About This Disease
                    </Button>
                  </Grid>
                )}
              </Grid>
            </CardContent>
          </Card>
        )}

        {/* Classifier Information */}
        {(diagnosis.classifier_name || diagnosis.classifier_description || 
          diagnosis.classifier_blog_link || diagnosis.classifier_paper_link) && (
          <Card
            sx={{
              mt: 3,
              borderRadius: 3,
              boxShadow: 4,
            }}
          >
            <CardContent sx={{ p: 4 }}>
              <Box display="flex" alignItems="center" gap={1} mb={3}>
                <ScienceIcon sx={{ color: "primary.main", fontSize: 28 }} />
                <Typography variant="h5" sx={{ fontWeight: 700 }}>
                  Classifier Information
                </Typography>
              </Box>
              <Divider sx={{ mb: 3 }} />
              
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                    Classifier Name
                  </Typography>
                  <Typography variant="h6" sx={{ fontWeight: 600 }}>
                    {diagnosis.classifier_name || "Unknown"}
                  </Typography>
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                    Modality
                  </Typography>
                  <Typography variant="h6" sx={{ fontWeight: 600 }}>
                    {getModalityLabel(diagnosis.modality)}
                  </Typography>
                </Grid>
                
                {diagnosis.classifier_description && (
                  <Grid item xs={12}>
                    <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                      Description
                    </Typography>
                    <Typography variant="body1" sx={{ lineHeight: 1.8 }}>
                      {diagnosis.classifier_description}
                    </Typography>
                  </Grid>
                )}
                
                <Grid item xs={12}>
                  <Box display="flex" gap={2} flexWrap="wrap">
                    {diagnosis.classifier_blog_link && (
                      <Button
                        variant="contained"
                        color="primary"
                        startIcon={<ArticleIcon />}
                        href={diagnosis.classifier_blog_link}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        Learn More About Classifier
                      </Button>
                    )}
                    {diagnosis.classifier_paper_link && (
                      <Button
                        variant="outlined"
                        color="primary"
                        startIcon={<LinkIcon />}
                        href={diagnosis.classifier_paper_link}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        View Research Paper
                      </Button>
                    )}
                  </Box>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        )}

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
            "@media print": {
              display: "none",
            },
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
          <Button
            variant="contained"
            size="large"
            color="success"
            startIcon={<PrintIcon />}
            onClick={handlePrint}
          >
            Print Results
          </Button>
        </Box>
      </Container>
    </Box>
  );
}

export default ResultsPage;
