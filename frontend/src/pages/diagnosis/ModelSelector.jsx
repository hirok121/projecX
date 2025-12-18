import { useState, useEffect } from "react";
import {
  Container,
  Typography,
  Grid,
  Box,
  Button,
  CircularProgress,
  Alert,
} from "@mui/material";
import { useParams, useNavigate } from "react-router-dom";
import { diseaseAPI } from "../../services/diseaseAPI";
import { classifierAPI } from "../../services/classifierAPI";
import NavBar from "../../components/layout/NavBar";
import ClassifierCard from "../../components/diagnosis/ClassifierCard";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import logger from "../../utils/logger";

function ModelSelector() {
  const { diseaseId, modality } = useParams();
  const navigate = useNavigate();
  const [disease, setDisease] = useState(null);
  const [models, setModels] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [diseaseId, modality]);

  const fetchData = async () => {
    try {
      setLoading(true);

      // Fetch disease details
      const diseaseData = await diseaseAPI.getDisease(diseaseId);
      setDisease(diseaseData);

      // Fetch classifiers for this disease and modality
      const classifiersData = await classifierAPI.getClassifiers({
        disease_id: diseaseId,
        modality: modality.toUpperCase(),
        is_active: true,
      });

      setModels(classifiersData);
    } catch (error) {
      logger.error("Error fetching models:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectModel = (model) => {
    // Immediately navigate to predict page with selected model
    navigate(`/diagnosis/${diseaseId}/predict`, {
      state: { selectedModel: model, modality, disease },
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
          sx={{ fontWeight: 700, color: "#10B981" }}
        >
          Select AI Models
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 1 }}>
          {disease?.name} - {getModalityLabel()}
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 4 }}>
          Click on a model to proceed with your diagnosis prediction.
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
            return (
              <Grid item xs={12} md={6} key={model.id}>
                <ClassifierCard
                  classifier={model}
                  selected={false}
                  onClick={handleSelectModel}
                  showLinks={true}
                />
              </Grid>
            );
          })}
        </Grid>
      </Container>
    </Box>
  );
}

export default ModelSelector;
