import { useState, useEffect } from "react";
import {
  Container,
  Typography,
  Box,
  Grid,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Button,
  Alert,
} from "@mui/material";
import { useParams, useNavigate } from "react-router-dom";
import { diagnosisAPI } from "../../services/diagnosisAPI";
import { notificationAPI } from "../../services/notificationAPI";
import NavBar from "../../components/layout/NavBar";
import HomeIcon from "@mui/icons-material/Home";
import RestartAltIcon from "@mui/icons-material/RestartAlt";
import PrintIcon from "@mui/icons-material/Print";
import ArticleIcon from "@mui/icons-material/Article";
import LinkIcon from "@mui/icons-material/Link";
import ScienceIcon from "@mui/icons-material/Science";
import LocalHospitalIcon from "@mui/icons-material/LocalHospital";
import logger from "../../utils/logger";
import Footer from "../../components/landingPageComponents/Footer.jsx"

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

  const handleNewPrediction = () => {
    navigate("/diagnosis");
  };

  const handleHome = () => {
    navigate("/");
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

  const getProbabilityColor = (probability) => {
    if (probability >= 0.7) return "error";
    if (probability >= 0.5) return "warning";
    return "success";
  };

  const sortedProbabilities = diagnosis?.probabilities 
    ? Object.entries(diagnosis.probabilities).sort(([, a], [, b]) => b - a)
    : [];

  return (
    <Box sx={{ backgroundColor: "#F0F4F8", minHeight: "100vh" }}>
      <NavBar />

      <Container maxWidth="xl" sx={{ py: 3, px: { xs: 2, sm: 4, md: 8, lg: 12 } }}>
        {/* Compact Header */}
        <Box sx={{ textAlign: "center", mb: 3 }}>
          <Typography variant="h4" sx={{ fontWeight: 700, color: "#1976d2", mb: 0.5 }}>
            Diagnosis Results
          </Typography>
          <Box sx={{ display: "flex", justifyContent: "center", gap: 1, alignItems: "center", flexWrap: "wrap" }}>
            <Chip 
              label={getModalityLabel(diagnosis.modality)} 
              size="small" 
              variant="outlined"
            />
            <Chip
              label={diagnosis.status.toUpperCase()}
              color={getStatusColor(diagnosis.status)}
              size="small"
            />
            {diagnosis.id && (
              <Chip 
                label={`#${diagnosis.id}`} 
                size="small" 
                variant="outlined"
              />
            )}
          </Box>
        </Box>

        {/* Main Result Card */}
        <Card sx={{ borderRadius: 2, boxShadow: 3, mb: 2 }}>
          <CardContent sx={{ p: 3 }}>
            {/* Prediction Result - Compact */}
            {diagnosis.prediction ? (
              <>
                {/* Patient Info Inline with Prediction */}
                {(diagnosis.name || diagnosis.age || diagnosis.sex) && (
                  <Box 
                    sx={{ 
                      mb: 3, 
                      p: 2, 
                      backgroundColor: "primary.50", 
                      borderRadius: 1,
                      border: "1px solid",
                      borderColor: "primary.100"
                    }}
                  >
                    <Typography variant="caption" color="text.secondary" sx={{ display: "block", mb: 1, fontWeight: 600 }}>
                      Patient Information
                    </Typography>
                    <Box sx={{ display: "flex", gap: 1.5, flexWrap: "wrap", alignItems: "center" }}>
                      {diagnosis.name && (
                        <Chip 
                          label={`Name: ${diagnosis.name}`} 
                          size="medium" 
                          sx={{ fontWeight: 600, fontSize: "0.875rem" }}
                        />
                      )}
                      {diagnosis.age && (
                        <Chip 
                          label={`Age: ${diagnosis.age} years`} 
                          size="medium" 
                          variant="outlined"
                          sx={{ fontWeight: 500 }}
                        />
                      )}
                      {diagnosis.sex && (
                        <Chip 
                          label={`Sex: ${diagnosis.sex}`} 
                          size="medium" 
                          variant="outlined"
                          sx={{ fontWeight: 500 }}
                        />
                      )}
                    </Box>
                  </Box>
                )}

                <Box sx={{ mb: 2, textAlign: "center", py: 3, backgroundColor: "grey.50", borderRadius: 1 }}>
                  <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 1 }}>
                    Predicted Class
                  </Typography>
                  <Typography variant="h4" sx={{ fontWeight: 700, color: "primary.main", mb: 1.5 }}>
                    {diagnosis.prediction}
                  </Typography>
                  {diagnosis.confidence && (
                    <Chip 
                      label={`Confidence: ${(diagnosis.confidence * 100).toFixed(1)}%`}
                      color={getProbabilityColor(diagnosis.confidence)}
                      size="large"
                      sx={{ fontWeight: 700, fontSize: "1rem", px: 2, py: 2.5 }}
                    />
                  )}
                </Box>

                {/* Class Probabilities as Chips */}
                {sortedProbabilities.length > 0 && (
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 1, fontWeight: 600 }}>
                      All Classes
                    </Typography>
                    <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap", justifyContent: "center" }}>
                      {sortedProbabilities.map(([className, probability]) => (
                        <Chip
                          key={className}
                          label={`${className}: ${(probability * 100).toFixed(1)}%`}
                          color={getProbabilityColor(probability)}
                          variant={className === diagnosis.prediction ? "filled" : "outlined"}
                          size="medium"
                          sx={{ 
                            fontWeight: className === diagnosis.prediction ? 700 : 500,
                            fontSize: "0.9rem",
                            px: 1.5,
                            py: 2
                          }}
                        />
                      ))}
                    </Box>
                  </Box>
                )}
              </>
            ) : (
              <>
                {/* Patient Info for non-completed predictions */}
                {(diagnosis.name || diagnosis.age || diagnosis.sex) && (
                  <Box 
                    sx={{ 
                      mb: 2, 
                      p: 2, 
                      backgroundColor: "primary.50", 
                      borderRadius: 1,
                      border: "1px solid",
                      borderColor: "primary.100"
                    }}
                  >
                    <Typography variant="caption" color="text.secondary" sx={{ display: "block", mb: 1, fontWeight: 600 }}>
                      Patient Information
                    </Typography>
                    <Box sx={{ display: "flex", gap: 1.5, flexWrap: "wrap", alignItems: "center" }}>
                      {diagnosis.name && (
                        <Chip 
                          label={diagnosis.name} 
                          size="medium" 
                          icon={<LocalHospitalIcon />}
                          sx={{ fontWeight: 600, fontSize: "0.875rem" }}
                        />
                      )}
                      {diagnosis.age && (
                        <Chip 
                          label={`Age: ${diagnosis.age} years`} 
                          size="medium" 
                          variant="outlined"
                          sx={{ fontWeight: 500 }}
                        />
                      )}
                      {diagnosis.sex && (
                        <Chip 
                          label={`Sex: ${diagnosis.sex}`} 
                          size="medium" 
                          variant="outlined"
                          sx={{ fontWeight: 500 }}
                        />
                      )}
                    </Box>
                  </Box>
                )}
                <Alert severity="info" sx={{ mb: 2 }}>
                  {diagnosis.status === "pending" && "Pending processing..."}
                  {diagnosis.status === "processing" && "Processing..."}
                  {diagnosis.status === "failed" && `Failed: ${diagnosis.error_message || "Unknown error"}`}
                </Alert>
              </>
            )}

            {/* Input Data - Compact Tabular */}
            {diagnosis.input_data && diagnosis.modality?.toLowerCase() === "tabular" && (
              <Box sx={{ mb: 2 }}>
                <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 1 }}>
                  Clinical Data
                </Typography>
                <Box sx={{ display: "flex", gap: 0.5, flexWrap: "wrap" }}>
                  {Object.entries(diagnosis.input_data).slice(0, 10).map(([feature, value]) => (
                    <Chip
                      key={feature}
                      label={`${feature.replace(/_/g, " ")}: ${value !== null && value !== undefined ? value : "N/A"}`}
                      size="small"
                      variant="outlined"
                    />
                  ))}
                  {Object.keys(diagnosis.input_data).length > 10 && (
                    <Chip
                      label={`+${Object.keys(diagnosis.input_data).length - 10} more`}
                      size="small"
                      variant="outlined"
                    />
                  )}
                </Box>
              </Box>
            )}

            {/* Input File - Compact */}
            {diagnosis.input_file && diagnosis.modality?.toLowerCase() !== "tabular" && (
              <Box sx={{ mb: 2 }}>
                <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 0.5 }}>
                  Input File
                </Typography>
                <Typography variant="body2" sx={{ fontFamily: "monospace", fontSize: "0.75rem", wordBreak: "break-all" }}>
                  {diagnosis.input_file}
                </Typography>
              </Box>
            )}

            {/* Metadata - Compact */}
            <Box sx={{ display: "flex", gap: 0.5, flexWrap: "wrap", pt: 1, borderTop: "1px solid", borderColor: "divider" }}>
              {diagnosis.created_at && (
                <Chip
                  label={new Date(diagnosis.created_at).toLocaleString()}
                  size="small"
                  variant="outlined"
                  sx={{ fontSize: "0.7rem" }}
                />
              )}
              {diagnosis.processing_time && (
                <Chip
                  label={`${diagnosis.processing_time.toFixed(2)}s`}
                  size="small"
                  variant="outlined"
                  sx={{ fontSize: "0.7rem" }}
                />
              )}
            </Box>
          </CardContent>
        </Card>

        {/* Disease & Classifier Info - Compact */}
        {(diagnosis.disease_name || diagnosis.classifier_name) && (
          <Card sx={{ borderRadius: 2, boxShadow: 3, mb: 2 }}>
            <CardContent sx={{ p: 2 }}>
              <Grid container spacing={2}>
                {diagnosis.disease_name && (
                  <Grid item xs={12} sm={6}>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
                      <LocalHospitalIcon sx={{ color: "success.main", fontSize: 20 }} />
                      <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                        Disease
                      </Typography>
                    </Box>
                    <Typography variant="body2" sx={{ mb: 1 }}>
                      {diagnosis.disease_name}
                    </Typography>
                    {diagnosis.disease_description && (
                      <Typography variant="caption" color="text.secondary" sx={{ display: "block", mb: 1 }}>
                        {diagnosis.disease_description.slice(0, 200)}...
                      </Typography>
                    )}
                    {diagnosis.disease_blog_link && (
                      <Button
                        size="small"
                        startIcon={<ArticleIcon />}
                        href={diagnosis.disease_blog_link}
                        target="_blank"
                      >
                        Learn More
                      </Button>
                    )}
                  </Grid>
                )}
                
                {diagnosis.classifier_name && (
                  <Grid item xs={12} sm={6}>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
                      <ScienceIcon sx={{ color: "primary.main", fontSize: 20 }} />
                      <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                        Classifier
                      </Typography>
                    </Box>
                    <Typography variant="body2" sx={{ mb: 1 }}>
                      {diagnosis.classifier_name}
                    </Typography>
                    {diagnosis.classifier_description && (
                      <Typography variant="caption" color="text.secondary" sx={{ display: "block", mb: 1 }}>
                        {diagnosis.classifier_description.slice(0, 200)}...
                      </Typography>
                    )}
                    <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
                      {diagnosis.classifier_blog_link && (
                        <Button
                          size="small"
                          startIcon={<ArticleIcon />}
                          href={diagnosis.classifier_blog_link}
                          target="_blank"
                        >
                          Learn More
                        </Button>
                      )}
                      {diagnosis.classifier_paper_link && (
                        <Button
                          size="small"
                          startIcon={<LinkIcon />}
                          href={diagnosis.classifier_paper_link}
                          target="_blank"
                        >
                          Research Paper
                        </Button>
                      )}
                    </Box>
                  </Grid>
                )}
              </Grid>
            </CardContent>
          </Card>
        )}

        {/* Disclaimer - Compact */}
        <Alert severity="warning" sx={{ mb: 2 }}>
          <Typography variant="caption" sx={{ fontWeight: 600 }}>
            ⚠️ Medical Disclaimer
          </Typography>
          <Typography variant="caption" display="block">
            AI predictions for research/educational use only. Consult healthcare professionals for medical decisions.
          </Typography>
        </Alert>

        {/* Action Buttons - Compact */}
        <Box
          sx={{
            display: "flex",
            gap: 1,
            justifyContent: "center",
            flexWrap: "wrap",
            "@media print": { display: "none" },
          }}
        >
          <Button
            variant="outlined"
            size="small"
            startIcon={<HomeIcon />}
            onClick={handleHome}
          >
            Home
          </Button>
          <Button
            variant="contained"
            size="small"
            startIcon={<RestartAltIcon />}
            onClick={handleNewPrediction}
          >
            New
          </Button>
          <Button
            variant="outlined"
            size="small"
            startIcon={<PrintIcon />}
            onClick={handlePrint}
          >
            Print
          </Button>
        </Box>
      </Container>
      <Footer/>
    </Box>
  );
}

export default ResultsPage;
