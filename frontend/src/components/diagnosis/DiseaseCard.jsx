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

  // Parse modalities from input_type
  const getModalities = () => {
    if (!disease.input_type) return [];
    return disease.input_type.split(",").map((m) => m.trim());
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
        height: "100%",
        display: "flex",
        flexDirection: "column",
        transition: "all 0.3s",
        "&:hover": {
          transform: "translateY(-8px)",
          boxShadow: 6,
        },
        borderRadius: 3,
      }}
      onClick={handleClick}
    >
      <CardContent sx={{ flexGrow: 1 }}>
        {/* Disease Icon */}
        <Box sx={{ display: "flex", justifyContent: "center", mb: 2 }}>
          <Avatar
            sx={{
              width: 60,
              height: 60,
              bgcolor: "primary.main",
            }}
          >
            <LocalHospitalIcon fontSize="large" />
          </Avatar>
        </Box>

        {/* Disease Name */}
        <Typography
          variant="h6"
          align="center"
          gutterBottom
          sx={{ fontWeight: 600, minHeight: 48 }}
        >
          {disease.name}
        </Typography>

        {/* Category Badge */}
        <Box sx={{ display: "flex", justifyContent: "center", mb: 2 }}>
          <Chip
            label={disease.category}
            size="small"
            color="secondary"
            sx={{ fontWeight: 500 }}
          />
        </Box>

        {/* Description */}
        <Typography
          variant="body2"
          color="text.secondary"
          sx={{
            mb: 2,
            minHeight: 60,
            overflow: "hidden",
            textOverflow: "ellipsis",
            display: "-webkit-box",
            WebkitLineClamp: 3,
            WebkitBoxOrient: "vertical",
          }}
        >
          {disease.description || "AI-powered diagnosis available"}
        </Typography>

        {/* Available Modalities */}
        {modalities.length > 0 && (
          <Box>
            <Typography
              variant="caption"
              color="text.secondary"
              sx={{ display: "block", mb: 1 }}
            >
              Available Modalities:
            </Typography>
            <Box sx={{ display: "flex", gap: 0.5, flexWrap: "wrap" }}>
              {modalities.map((modality) => {
                const config = modalityConfig[modality.toLowerCase()];
                return config ? (
                  <Chip
                    key={modality}
                    label={config.label}
                    size="small"
                    variant="outlined"
                    sx={{
                      borderColor: config.color,
                      color: config.color,
                      fontSize: "0.75rem",
                    }}
                  />
                ) : null;
              })}
            </Box>
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
          }}
        >
          Select Disease →
        </Button>
      </CardActions>
    </Card>
  );
}

export default DiseaseCard;
