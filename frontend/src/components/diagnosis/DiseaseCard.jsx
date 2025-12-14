import {
  Card,
  CardContent,
  CardActions,
  Typography,
  Button,
  Chip,
  Box,
  Avatar,
} from "@mui/material";
import LocalHospitalIcon from "@mui/icons-material/LocalHospital";
import { useNavigate } from "react-router-dom";

function DiseaseCard({ disease }) {
  const navigate = useNavigate();

  // Parse modalities from available_modalities
  const getModalities = () => {
    if (!disease.available_modalities) return [];
    // available_modalities is an array from the backend
    if (Array.isArray(disease.available_modalities)) {
      return disease.available_modalities;
    }
    // Fallback if it's a string
    return disease.available_modalities.split(",").map((m) => m.trim());
  };

  const modalities = getModalities();

  const modalityConfig = {
    mri: { label: "MRI", color: "#1976d2" },
    ct: { label: "CT", color: "#2e7d32" },
    xray: { label: "X-Ray", color: "#ed6c02" },
    tabular: { label: "Lab Data", color: "#9c27b0" },
  };

  const handleClick = () => {
    navigate(`/diagnosis/${disease.id}/modality`);
  };

  return (
    <Card
      sx={{
        cursor: "pointer",
        height: "280px",
        display: "flex",
        flexDirection: "column",
        transition: "all 0.2s",
        backgroundColor: "white",
        border: "1px solid #E8EAED",
        borderRadius: 2,
        boxShadow: "none",
        "&:hover": {
          transform: "translateY(-2px)",
          boxShadow: "0 4px 12px rgba(44, 62, 80, 0.08)",
          borderColor: "#10B981",
        },
      }}
      onClick={handleClick}
    >
      <CardContent sx={{ flexGrow: 1, p: 2 }}>
        {/* Disease Icon */}
        <Box sx={{ display: "flex", justifyContent: "center", mb: 1.5 }}>
          <Avatar
            sx={{
              width: 48,
              height: 48,
              bgcolor: "#ECFDF5",
              color: "#10B981",
            }}
          >
            <LocalHospitalIcon fontSize="medium" />
          </Avatar>
        </Box>

        {/* Disease Name */}
        <Typography
          variant="h6"
          align="center"
          gutterBottom
          sx={{
            fontWeight: 600,
            minHeight: 40,
            fontSize: "1rem",
            color: "#2C3E50",
            mb: 1,
          }}
        >
          {disease.name}
        </Typography>

        {/* Category Badge */}
        <Box sx={{ display: "flex", justifyContent: "center", mb: 1 }}>
          <Chip
            label={disease.category}
            size="small"
            sx={{
              fontWeight: 500,
              backgroundColor: "#F0F4F8",
              color: "#5D6D7E",
              fontSize: "0.7rem",
              height: 20,
            }}
          />
        </Box>

        {/* Description */}
        <Typography
          variant="body2"
          color="text.secondary"
          align="center"
          sx={{
            mb: 1,
            minHeight: 32,
            overflow: "hidden",
            textOverflow: "ellipsis",
            display: "-webkit-box",
            WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical",
            fontSize: "0.8rem",
          }}
        >
          {disease.description || "AI-powered diagnosis available"}
        </Typography>

        {/* Modalities */}
        {modalities.length > 0 && (
          <Box
            sx={{
              display: "flex",
              gap: 0.5,
              justifyContent: "center",
              flexWrap: "wrap",
            }}
          >
            {modalities.map((modality) => {
              const config =
                modalityConfig[modality.toLowerCase()] ||
                modalityConfig.tabular;
              return (
                <Chip
                  key={modality}
                  label={config.label}
                  size="small"
                  sx={{
                    fontSize: "0.7rem",
                    height: 22,
                    backgroundColor: "#ECFDF5",
                    color: "#10B981",
                    fontWeight: 500,
                    border: "1px solid #10B981",
                  }}
                />
              );
            })}
          </Box>
        )}
      </CardContent>

      <CardActions sx={{ p: 2, pt: 0 }}>
        <Button
          size="small"
          fullWidth
          variant="contained"
          sx={{
            textTransform: "none",
            fontWeight: 600,
            backgroundColor: "#10B981",
            borderRadius: 1,
            boxShadow: "none",
            fontSize: "0.85rem",
            py: 0.75,
            "&:hover": {
              backgroundColor: "#059669",
              boxShadow: "none",
            },
          }}
        >
          Select Disease
        </Button>
      </CardActions>
    </Card>
  );
}

export default DiseaseCard;
