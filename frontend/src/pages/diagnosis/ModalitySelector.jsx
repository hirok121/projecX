import { useState, useEffect, useCallback } from "react";
import {
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  Box,
  CircularProgress,
  Button,
  Chip,
} from "@mui/material";
import { useParams, useNavigate } from "react-router-dom";
import { diseaseAPI } from "../../services/diseaseAPI";
import NavBar from "../../components/layout/NavBar";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import InfoIcon from "@mui/icons-material/Info";
import logger from "../../utils/logger";

function ModalitySelector() {
  const { diseaseId } = useParams();
  const navigate = useNavigate();
  const [disease, setDisease] = useState(null);
  const [loading, setLoading] = useState(true);

  const modalityOptions = [
    {
      id: "mri",
      name: "MRI Scan",
      icon: "🧲",
      description: "Magnetic Resonance Imaging",
      color: "#10B981",
      bgGradient: "linear-gradient(135deg, #10B981 0%, #059669 100%)",
    },
    {
      id: "ct",
      name: "CT Scan",
      icon: "🔬",
      description: "Computed Tomography",
      color: "#10B981",
      bgGradient: "linear-gradient(135deg, #10B981 0%, #059669 100%)",
    },
    {
      id: "xray",
      name: "X-Ray",
      icon: "📡",
      description: "X-Ray Imaging",
      color: "#10B981",
      bgGradient: "linear-gradient(135deg, #10B981 0%, #059669 100%)",
    },
    {
      id: "tabular",
      name: "Lab Data",
      icon: "📊",
      description: "Clinical & Laboratory Data",
      color: "#10B981",
      bgGradient: "linear-gradient(135deg, #10B981 0%, #059669 100%)",
    },
  ];

  const fetchDisease = useCallback(async () => {
    try {
      setLoading(true);
      const response = await diseaseAPI.getDisease(diseaseId);
      setDisease(response);
    } catch (error) {
      logger.error("Error fetching disease:", error);
    } finally {
      setLoading(false);
    }
  }, [diseaseId]);

  useEffect(() => {
    fetchDisease();
  }, [fetchDisease]);

  const getAvailableModalities = () => {
    if (!disease || !disease.available_modalities) return [];
    // available_modalities is already an array from the backend
    return disease.available_modalities.map((m) => m.toLowerCase());
  };

  const availableModalities = getAvailableModalities();

  const handleSelectModality = (modalityId) => {
    navigate(`/diagnosis/${diseaseId}/models/${modalityId}`);
  };

  const handleBack = () => {
    navigate("/diagnosis");
  };

  const handleShowMoreInfo = () => {
    if (disease?.blog_link) {
      window.open(disease.blog_link, "_blank", "noopener,noreferrer");
    }
  };

  if (loading) {
    return (
      <Box sx={{ backgroundColor: "#F0F4F8", minHeight: "100vh" }}>
        <NavBar />
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            height: "80vh",
          }}
        >
          <CircularProgress />
        </Box>
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
          Back to Diseases
        </Button>

        {/* Disease Information Section */}
        {disease && (
          <Box
            sx={{
              mb: 4,
              p: 3,
              backgroundColor: "#FFFFFF",
              borderRadius: 2,
              border: "1px solid #E8EAED",
              boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
            }}
          >
            <Box
              display="flex"
              justifyContent="space-between"
              alignItems="flex-start"
              flexWrap="wrap"
              gap={2}
            >
              <Box flex={1}>
                <Typography
                  variant="h4"
                  sx={{ fontWeight: 700, color: "#10B981", mb: 1 }}
                >
                  {disease.name}
                </Typography>
                {disease.category && (
                  <Typography
                    variant="caption"
                    sx={{
                      color: "#64748B",
                      fontWeight: 500,
                      textTransform: "uppercase",
                      letterSpacing: "0.5px",
                      display: "block",
                      mb: 2,
                    }}
                  >
                    {disease.category}
                  </Typography>
                )}
                {disease.description && (
                  <Typography
                    variant="body1"
                    sx={{ color: "#64748B", mb: 2, lineHeight: 1.6 }}
                  >
                    {disease.description}
                  </Typography>
                )}
                {disease.available_modalities &&
                  disease.available_modalities.length > 0 && (
                    <Box>
                      <Typography
                        variant="caption"
                        sx={{
                          color: "#64748B",
                          fontWeight: 600,
                          textTransform: "uppercase",
                          letterSpacing: "0.5px",
                          mb: 1,
                          display: "block",
                        }}
                      >
                        Available Modalities
                      </Typography>
                      <Box display="flex" gap={1} flexWrap="wrap">
                        {disease.available_modalities.map((modality, index) => (
                          <Chip
                            key={index}
                            label={modality}
                            size="small"
                            color="primary"
                            sx={{ fontWeight: 600 }}
                          />
                        ))}
                      </Box>
                    </Box>
                  )}
              </Box>
              {disease.blog_link && (
                <Button
                  variant="outlined"
                  startIcon={<InfoIcon />}
                  onClick={handleShowMoreInfo}
                  sx={{
                    color: "#10B981",
                    borderColor: "#10B981",
                    fontWeight: 600,
                    textTransform: "none",
                    "&:hover": {
                      bgcolor: "#ECFDF5",
                      borderColor: "#10B981",
                    },
                  }}
                >
                  Show More Info
                </Button>
              )}
            </Box>
          </Box>
        )}

        {/* Header */}
        <Typography
          variant="h5"
          gutterBottom
          sx={{ fontWeight: 700, color: "#1E293B", mb: 1 }}
        >
          Select Modality
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
          Choose the type of data you want to analyze
        </Typography>

        {/* Modality Cards Grid */}
        <Grid container spacing={3}>
          {modalityOptions
            .filter((option) => availableModalities.includes(option.id))
            .map((modality) => (
              <Grid item xs={12} sm={6} md={3} key={modality.id}>
                <Card
                  onClick={() => handleSelectModality(modality.id)}
                  sx={{
                    cursor: "pointer",
                    height: "100%",
                    border: `3px solid ${modality.color}`,
                    borderRadius: 3,
                    transition: "all 0.3s",
                    position: "relative",
                    overflow: "hidden",
                    "&:hover": {
                      transform: "scale(1.05)",
                      boxShadow: 6,
                    },
                    "&::before": {
                      content: '""',
                      position: "absolute",
                      top: 0,
                      left: 0,
                      right: 0,
                      height: "8px",
                      background: modality.bgGradient,
                    },
                  }}
                >
                  <CardContent
                    sx={{
                      textAlign: "center",
                      pt: 4,
                      pb: 3,
                    }}
                  >
                    {/* Icon */}
                    <Typography variant="h1" sx={{ mb: 2, fontSize: "4rem" }}>
                      {modality.icon}
                    </Typography>

                    {/* Name */}
                    <Typography
                      variant="h6"
                      gutterBottom
                      sx={{
                        fontWeight: 700,
                        color: modality.color,
                      }}
                    >
                      {modality.name}
                    </Typography>

                    {/* Description */}
                    <Typography variant="body2" color="text.secondary">
                      {modality.description}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
        </Grid>

        {/* No Modalities Available */}
        {availableModalities.length === 0 && (
          <Box sx={{ textAlign: "center", py: 8 }}>
            <Typography variant="h6" color="text.secondary">
              No modalities configured for this disease
            </Typography>
          </Box>
        )}
      </Container>
    </Box>
  );
}

export default ModalitySelector;
