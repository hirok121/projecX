import { useState, useEffect } from "react";
import {
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  Box,
  Checkbox,
  Chip,
  Button,
  CircularProgress,
  Alert,
} from "@mui/material";
import { useParams, useNavigate } from "react-router-dom";
import { diagnosisAPI } from "../../services/diagnosisAPI";
import NavBar from "../../components/layout/NavBar";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";

function ModelSelector() {
  const { diseaseId, modality } = useParams();
  const navigate = useNavigate();
  const [disease, setDisease] = useState(null);
  const [models, setModels] = useState([]);
  const [selectedModels, setSelectedModels] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, [diseaseId, modality]);

  const fetchData = async () => {
    try {
      setLoading(true);

      // Fetch disease details
      const diseaseResponse = await diagnosisAPI.getDisease(diseaseId);
      setDisease(diseaseResponse.data);

      // Fetch classifiers for this disease
      const modelsResponse = await diagnosisAPI.getDiseaseClassifiers(
        diseaseId
      );

      // Filter by modality if needed
      const filteredModels = modelsResponse.data.filter(
        (model) =>
          !model.modality ||
          model.modality.toLowerCase() === modality.toLowerCase()
      );

      setModels(filteredModels);
    } catch (error) {
      console.error("Error fetching models:", error);
    } finally {
      setLoading(false);
    }
  };

  const toggleModel = (modelId) => {
    setSelectedModels((prev) =>
      prev.includes(modelId)
        ? prev.filter((id) => id !== modelId)
        : [...prev, modelId]
    );
  };

  const handleContinue = () => {
    navigate(`/diagnosis/${diseaseId}/predict`, {
      state: { selectedModels, modality, disease },
    });
  };

  const handleBack = () => {
    navigate(`/diagnosis/${diseaseId}/modality`);
  };

  const getModalityLabel = () => {
    const labels = {
      mri: "MRI",
      ct: "CT Scan",
      xray: "X-Ray",
      tabular: "Lab Data",
    };
    return labels[modality.toLowerCase()] || modality.toUpperCase();
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
          Back to Modality Selection
        </Button>

        {/* Header */}
        <Typography
          variant="h4"
          gutterBottom
          sx={{ fontWeight: 700, color: "#1976d2" }}
        >
          Select AI Models
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 1 }}>
          {disease?.name} - {getModalityLabel()}
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 4 }}>
          Choose one or more models to run predictions. Selecting multiple
          models allows you to compare results.
        </Typography>

        {/* No Models Available */}
        {models.length === 0 && (
          <Alert severity="warning" sx={{ mb: 3 }}>
            No models available for this modality. Please try a different
            modality or contact support.
          </Alert>
        )}

        {/* Models Grid */}
        <Grid container spacing={3}>
          {models.map((model) => {
            const isSelected = selectedModels.includes(model.id);

            return (
              <Grid item xs={12} md={6} key={model.id}>
                <Card
                  onClick={() => toggleModel(model.id)}
                  sx={{
                    border: isSelected ? 3 : 1,
                    borderColor: isSelected ? "primary.main" : "divider",
                    cursor: "pointer",
                    position: "relative",
                    transition: "all 0.3s",
                    "&:hover": {
                      boxShadow: 4,
                      transform: "translateY(-4px)",
                    },
                    backgroundColor: isSelected ? "primary.50" : "white",
                  }}
                >
                  {isSelected && (
                    <Box
                      sx={{
                        position: "absolute",
                        top: 12,
                        right: 12,
                        color: "primary.main",
                      }}
                    >
                      <CheckCircleIcon fontSize="large" />
                    </Box>
                  )}

                  <CardContent>
                    <Box
                      sx={{ display: "flex", alignItems: "flex-start", gap: 2 }}
                    >
                      <Checkbox
                        checked={isSelected}
                        onChange={() => toggleModel(model.id)}
                        onClick={(e) => e.stopPropagation()}
                        sx={{ mt: -1 }}
                      />

                      <Box sx={{ flexGrow: 1 }}>
                        {/* Model Name */}
                        <Typography variant="h6" gutterBottom>
                          {model.name}
                        </Typography>

                        {/* Model Description */}
                        <Typography
                          variant="body2"
                          color="text.secondary"
                          sx={{ mb: 2 }}
                        >
                          {model.description ||
                            "AI-powered classification model"}
                        </Typography>

                        {/* Model Stats */}
                        <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
                          {model.accuracy && (
                            <Chip
                              label={`Accuracy: ${(
                                model.accuracy * 100
                              ).toFixed(1)}%`}
                              size="small"
                              color="success"
                              variant={isSelected ? "filled" : "outlined"}
                            />
                          )}
                          {model.model_type && (
                            <Chip
                              label={model.model_type}
                              size="small"
                              variant="outlined"
                              color="primary"
                            />
                          )}
                        </Box>
                      </Box>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            );
          })}
        </Grid>

        {/* Action Buttons */}
        {models.length > 0 && (
          <Box
            sx={{
              mt: 4,
              display: "flex",
              gap: 2,
              justifyContent: "flex-end",
              position: "sticky",
              bottom: 20,
              backgroundColor: "white",
              p: 2,
              borderRadius: 2,
              boxShadow: 3,
            }}
          >
            <Button variant="outlined" onClick={handleBack}>
              Back
            </Button>
            <Button
              variant="contained"
              onClick={handleContinue}
              disabled={selectedModels.length === 0}
              size="large"
            >
              Continue ({selectedModels.length} selected)
            </Button>
          </Box>
        )}
      </Container>
    </Box>
  );
}

export default ModelSelector;
