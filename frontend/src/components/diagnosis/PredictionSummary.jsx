import { useState, useEffect } from "react";
import {
  Paper,
  Typography,
  Box,
  Chip,
  Divider,
  List,
  ListItem,
  ListItemText,
} from "@mui/material";
import { diagnosisAPI } from "../../services/diagnosisAPI";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";

function PredictionSummary({ disease, modality, selectedModelIds }) {
  const [models, setModels] = useState([]);

  useEffect(() => {
    fetchModels();
  }, [selectedModelIds]);

  const fetchModels = async () => {
    try {
      const response = await diagnosisAPI.getDiseaseClassifiers(disease.id);
      const selectedModels = response.data.filter((model) =>
        selectedModelIds.includes(model.id)
      );
      setModels(selectedModels);
    } catch (error) {
      console.error("Error fetching models:", error);
    }
  };

  const getModalityLabel = () => {
    const labels = {
      mri: "MRI Scan",
      ct: "CT Scan",
      xray: "X-Ray",
      tabular: "Lab Data",
    };
    return labels[modality?.toLowerCase()] || modality?.toUpperCase();
  };

  return (
    <Paper
      sx={{
        p: 3,
        position: "sticky",
        top: 20,
        borderRadius: 2,
        border: "2px solid",
        borderColor: "primary.main",
      }}
    >
      <Typography variant="h6" gutterBottom sx={{ fontWeight: 700 }}>
        Prediction Summary
      </Typography>

      <Divider sx={{ my: 2 }} />

      {/* Disease Info */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="subtitle2" color="text.secondary" gutterBottom>
          Disease
        </Typography>
        <Typography variant="body1" sx={{ fontWeight: 600 }}>
          {disease.name}
        </Typography>
      </Box>

      {/* Modality */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="subtitle2" color="text.secondary" gutterBottom>
          Modality
        </Typography>
        <Chip label={getModalityLabel()} color="primary" size="small" />
      </Box>

      {/* Selected Models */}
      <Box>
        <Typography variant="subtitle2" color="text.secondary" gutterBottom>
          Selected Models ({models.length})
        </Typography>
        <List dense disablePadding>
          {models.map((model) => (
            <ListItem
              key={model.id}
              disablePadding
              sx={{
                mb: 1,
                p: 1.5,
                backgroundColor: "primary.50",
                borderRadius: 1,
              }}
            >
              <CheckCircleIcon
                sx={{ color: "primary.main", mr: 1, fontSize: 20 }}
              />
              <ListItemText
                primary={model.name}
                primaryTypographyProps={{
                  variant: "body2",
                  fontWeight: 600,
                }}
                secondary={
                  model.accuracy
                    ? `Accuracy: ${(model.accuracy * 100).toFixed(1)}%`
                    : null
                }
                secondaryTypographyProps={{
                  variant: "caption",
                }}
              />
            </ListItem>
          ))}
        </List>
      </Box>

      <Divider sx={{ my: 2 }} />

      {/* Info Note */}
      <Typography
        variant="caption"
        color="text.secondary"
        sx={{ display: "block" }}
      >
        Results from all selected models will be displayed for comparison after
        prediction completes.
      </Typography>
    </Paper>
  );
}

export default PredictionSummary;
