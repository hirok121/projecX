import PropTypes from "prop-types";
import {
  Card,
  CardContent,
  Typography,
  Box,
  Chip,
  Button,
} from "@mui/material";
import { Info as InfoIcon, LocalHospital } from "@mui/icons-material";

const DiseaseCard = ({ 
  disease, 
  onClick, 
  showActions = false, 
  compact = false 
}) => {
  // Handle missing disease data
  if (!disease) {
    return (
      <Card sx={{ height: "100%" }}>
        <CardContent>
          <Typography>No disease data available</Typography>
        </CardContent>
      </Card>
    );
  }

  // Extract disease data
  const name = disease?.name || "Unknown Disease";
  const description = disease?.description || "";
  const category = disease?.category || "";
  const availableModalities = disease?.available_modalities || [];
  const blogLink = disease?.blog_link || null;

  // Handle link click - open in new tab
  const handleLinkClick = (e) => {
    e.stopPropagation();
    if (blogLink) {
      window.open(blogLink, '_blank', 'noopener,noreferrer');
    }
  };

  // Handle card click
  const handleCardClick = () => {
    if (onClick) {
      onClick(disease);
    }
  };

  // Get modality chip color
  const getModalityColor = (modality) => {
    const colors = {
      "MRI": "primary",
      "CT": "secondary",
      "X-Ray": "info",
      "Tabular": "success",
    };
    return colors[modality] || "default";
  };

  return (
    <Card
      sx={{
        height: "100%",
        display: "flex",
        flexDirection: "column",
        position: "relative",
        cursor: onClick ? "pointer" : "default",
        borderRadius: "8px",
        border: "1px solid #E8EAED",
        boxShadow: "none",
        transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
        backgroundColor: "#FFFFFF",
        "&:hover": onClick ? {
          transform: "translateY(-4px)",
          boxShadow: "0 4px 16px rgba(44, 62, 80, 0.12)",
          borderColor: "#10B981",
        } : {},
      }}
      onClick={handleCardClick}
    >
      <CardContent
        sx={{
          p: compact ? 2 : 2.5,
          flexGrow: 1,
          display: "flex",
          flexDirection: "column",
        }}
      >
        {/* Disease Icon and Name */}
        <Box display="flex" alignItems="center" gap={1.5} mb={compact ? 1 : 2}>
          <LocalHospital 
            sx={{ 
              color: "primary.main", 
              fontSize: compact ? 28 : 32 
            }} 
          />
          <Box flexGrow={1}>
            <Typography
              variant={compact ? "h6" : "h5"}
              component="h3"
              sx={{
                fontWeight: 600,
                color: "#1E293B",
                lineHeight: 1.3,
              }}
            >
              {name}
            </Typography>
            {category && (
              <Typography
                variant="caption"
                sx={{
                  color: "#64748B",
                  fontWeight: 500,
                  textTransform: "uppercase",
                  letterSpacing: "0.5px",
                }}
              >
                {category}
              </Typography>
            )}
          </Box>
        </Box>

        {/* Description */}
        {description && !compact && (
          <Typography
            variant="body2"
            sx={{
              mb: 2,
              color: "#64748B",
              lineHeight: 1.6,
              display: "-webkit-box",
              WebkitLineClamp: 3,
              WebkitBoxOrient: "vertical",
              overflow: "hidden",
            }}
          >
            {description}
          </Typography>
        )}

        {/* Available Modalities */}
        {availableModalities.length > 0 && (
          <Box mb={compact ? 1 : 2}>
            <Typography
              variant="caption"
              sx={{
                color: "#64748B",
                fontWeight: 600,
                textTransform: "uppercase",
                letterSpacing: "0.5px",
                mb: 0.5,
                display: "block",
              }}
            >
              Available Modalities
            </Typography>
            <Box display="flex" gap={0.75} flexWrap="wrap">
              {availableModalities.map((modality, index) => (
                <Chip
                  key={index}
                  label={modality}
                  size="small"
                  color={getModalityColor(modality)}
                  sx={{
                    fontWeight: 600,
                    fontSize: "0.75rem",
                  }}
                />
              ))}
            </Box>
          </Box>
        )}

        {/* Spacer to push actions to bottom */}
        <Box sx={{ flexGrow: 1 }} />

        {/* Actions */}
        {(showActions || blogLink) && (
          <Box 
            display="flex" 
            justifyContent="flex-end" 
            gap={1}
            mt={compact ? 1 : 2}
          >
            {blogLink && (
              <Button
                variant="outlined"
                size="small"
                startIcon={<InfoIcon />}
                onClick={handleLinkClick}
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
        )}
      </CardContent>
    </Card>
  );
};

DiseaseCard.propTypes = {
  disease: PropTypes.shape({
    id: PropTypes.number,
    name: PropTypes.string,
    description: PropTypes.string,
    category: PropTypes.string,
    available_modalities: PropTypes.arrayOf(PropTypes.string),
    blog_link: PropTypes.string,
    storage_path: PropTypes.string,
    is_active: PropTypes.bool,
    created_at: PropTypes.string,
    updated_at: PropTypes.string,
  }).isRequired,
  onClick: PropTypes.func,
  showActions: PropTypes.bool,
  compact: PropTypes.bool,
};

export default DiseaseCard;
