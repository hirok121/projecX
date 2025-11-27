import { useState, useEffect } from "react";
import {
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  Box,
  CircularProgress,
  Button,
} from "@mui/material";
import { useParams, useNavigate } from "react-router-dom";
import { diagnosisAPI } from "../../services/diagnosisAPI";
import NavBar from "../../components/layout/NavBar";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";

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
      color: "#1976d2",
      bgGradient: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    },
    {
      id: "ct",
      name: "CT Scan",
      icon: "🔬",
      description: "Computed Tomography",
      color: "#2e7d32",
      bgGradient: "linear-gradient(135deg, #11998e 0%, #38ef7d 100%)",
    },
    {
      id: "xray",
      name: "X-Ray",
      icon: "📡",
      description: "X-Ray Imaging",
      color: "#ed6c02",
      bgGradient: "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)",
    },
    {
      id: "tabular",
      name: "Lab Data",
      icon: "📊",
      description: "Clinical & Laboratory Data",
      color: "#9c27b0",
      bgGradient: "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)",
    },
  ];

  useEffect(() => {
    fetchDisease();
  }, [diseaseId]);

  const fetchDisease = async () => {
    try {
      setLoading(true);
      const response = await diagnosisAPI.getDisease(diseaseId);
      setDisease(response.data);
    } catch (error) {
      console.error("Error fetching disease:", error);
    } finally {
      setLoading(false);
    }
  };

  const getAvailableModalities = () => {
    if (!disease || !disease.input_type) return [];
    return disease.input_type.split(",").map((m) => m.trim().toLowerCase());
  };

  const availableModalities = getAvailableModalities();

  const handleSelectModality = (modalityId) => {
    navigate(`/diagnosis/${diseaseId}/models/${modalityId}`);
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

        {/* Header */}
        <Typography
          variant="h4"
          gutterBottom
          sx={{ fontWeight: 700, color: "#1976d2" }}
        >
          {disease?.name}
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
          Select the type of data you want to analyze
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
