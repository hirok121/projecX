import PropTypes from "prop-types";
import {
  Card,
  CardContent,
  Typography,
  Box,
  Chip,
  Button,
} from "@mui/material";
import { 
  Info as InfoIcon, 
  Description as PaperIcon,
  Psychology as ModelIcon,
} from "@mui/icons-material";

const ClassifierCard = ({ 
  classifier, 
  selected = false, 
  onClick, 
  showLinks = true 
}) => {
  // Handle missing classifier data
  if (!classifier) {
    return (
      <Card sx={{ height: "100%" }}>
        <CardContent>
          <Typography>No classifier data available</Typography>
        </CardContent>
      </Card>
    );
  }

  // Extract classifier data
  const name = classifier?.name || "Unknown Classifier";
  const description = classifier?.description || "";
  const modality = classifier?.modality || "";
  const accuracy = classifier?.accuracy;
  const precision = classifier?.precision;
  const recall = classifier?.recall;
  const f1Score = classifier?.f1_score;
  const blogLink = classifier?.blog_link || null;
  const paperLink = classifier?.paper_link || null;

  // Handle link clicks - open in new tab
  const handleBlogLinkClick = (e) => {
    e.stopPropagation();
    if (blogLink) {
      window.open(blogLink, '_blank', 'noopener,noreferrer');
    }
  };

  const handlePaperLinkClick = (e) => {
    e.stopPropagation();
    if (paperLink) {
      window.open(paperLink, '_blank', 'noopener,noreferrer');
    }
  };

  // Handle card click
  const handleCardClick = () => {
    if (onClick) {
      onClick(classifier);
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

  // Format percentage for display
  const formatPercentage = (value) => {
    if (value === null || value === undefined) return null;
    return `${(value * 100).toFixed(1)}%`;
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
        border: selected ? "2px solid #3B82F6" : "1px solid #E8EAED",
        boxShadow: selected ? "0 4px 12px rgba(59, 130, 246, 0.15)" : "none",
        transition: "all 0.2s ease",
        backgroundColor: selected ? "#EFF6FF" : "#FFFFFF",
        "&:hover": onClick ? {
          transform: "translateY(-2px)",
          boxShadow: selected 
            ? "0 6px 16px rgba(59, 130, 246, 0.2)" 
            : "0 2px 8px rgba(44, 62, 80, 0.08)",
          borderColor: selected ? "#3B82F6" : "#D1D5DB",
        } : {},
      }}
      onClick={handleCardClick}
    >
      <CardContent
        sx={{
          p: 2.5,
          flexGrow: 1,
          display: "flex",
          flexDirection: "column",
        }}
      >
        {/* Classifier Icon and Name */}
        <Box display="flex" alignItems="center" gap={1.5} mb={2}>
          <ModelIcon 
            sx={{ 
              color: selected ? "primary.main" : "#64748B", 
              fontSize: 32 
            }} 
          />
          <Box flexGrow={1}>
            <Typography
              variant="h6"
              component="h3"
              sx={{
                fontWeight: 600,
                color: selected ? "#1E40AF" : "#1E293B",
                lineHeight: 1.3,
              }}
            >
              {name}
            </Typography>
            {modality && (
              <Chip
                label={modality}
                size="small"
                color={getModalityColor(modality)}
                sx={{
                  fontWeight: 600,
                  fontSize: "0.7rem",
                  height: "20px",
                  mt: 0.5,
                }}
              />
            )}
          </Box>
        </Box>

        {/* Description */}
        {description && (
          <Typography
            variant="body2"
            sx={{
              mb: 2,
              color: "#64748B",
              lineHeight: 1.6,
              display: "-webkit-box",
              WebkitLineClamp: 2,
              WebkitBoxOrient: "vertical",
              overflow: "hidden",
            }}
          >
            {description}
          </Typography>
        )}

        {/* Accuracy Metrics */}
        {(accuracy !== null && accuracy !== undefined) || 
         (precision !== null && precision !== undefined) || 
         (recall !== null && recall !== undefined) || 
         (f1Score !== null && f1Score !== undefined) ? (
          <Box mb={2}>
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
              Performance Metrics
            </Typography>
            <Box display="flex" gap={0.75} flexWrap="wrap">
              {accuracy !== null && accuracy !== undefined && (
                <Chip
                  label={`Accuracy: ${formatPercentage(accuracy)}`}
                  size="small"
                  sx={{
                    bgcolor: "#DBEAFE",
                    color: "#1E40AF",
                    fontWeight: 600,
                    fontSize: "0.75rem",
                  }}
                />
              )}
              {precision !== null && precision !== undefined && (
                <Chip
                  label={`Precision: ${formatPercentage(precision)}`}
                  size="small"
                  sx={{
                    bgcolor: "#D1FAE5",
                    color: "#065F46",
                    fontWeight: 600,
                    fontSize: "0.75rem",
                  }}
                />
              )}
              {recall !== null && recall !== undefined && (
                <Chip
                  label={`Recall: ${formatPercentage(recall)}`}
                  size="small"
                  sx={{
                    bgcolor: "#FEF3C7",
                    color: "#92400E",
                    fontWeight: 600,
                    fontSize: "0.75rem",
                  }}
                />
              )}
              {f1Score !== null && f1Score !== undefined && (
                <Chip
                  label={`F1: ${formatPercentage(f1Score)}`}
                  size="small"
                  sx={{
                    bgcolor: "#E0E7FF",
                    color: "#3730A3",
                    fontWeight: 600,
                    fontSize: "0.75rem",
                  }}
                />
              )}
            </Box>
          </Box>
        ) : null}

        {/* Spacer to push actions to bottom */}
        <Box sx={{ flexGrow: 1 }} />

        {/* Action Buttons */}
        {showLinks && (blogLink || paperLink) && (
          <Box 
            display="flex" 
            justifyContent="flex-end" 
            gap={1}
            mt={2}
            flexWrap="wrap"
          >
            {blogLink && (
              <Button
                variant="outlined"
                size="small"
                startIcon={<InfoIcon />}
                onClick={handleBlogLinkClick}
                sx={{
                  color: "#10B981",
                  borderColor: "#10B981",
                  fontWeight: 600,
                  textTransform: "none",
                  fontSize: "0.8rem",
                  "&:hover": {
                    bgcolor: "#ECFDF5",
                    borderColor: "#10B981",
                  },
                }}
              >
                More Info
              </Button>
            )}
            {paperLink && (
              <Button
                variant="outlined"
                size="small"
                startIcon={<PaperIcon />}
                onClick={handlePaperLinkClick}
                sx={{
                  color: "#3B82F6",
                  borderColor: "#3B82F6",
                  fontWeight: 600,
                  textTransform: "none",
                  fontSize: "0.8rem",
                  "&:hover": {
                    bgcolor: "#EFF6FF",
                    borderColor: "#3B82F6",
                  },
                }}
              >
                View Paper
              </Button>
            )}
          </Box>
        )}

        {/* Selection Indicator */}
        {selected && (
          <Box
            sx={{
              position: "absolute",
              top: 12,
              right: 12,
              bgcolor: "#3B82F6",
              color: "white",
              borderRadius: "50%",
              width: 24,
              height: 24,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "0.75rem",
              fontWeight: 700,
            }}
          >
            ✓
          </Box>
        )}
      </CardContent>
    </Card>
  );
};

ClassifierCard.propTypes = {
  classifier: PropTypes.shape({
    id: PropTypes.number,
    name: PropTypes.string,
    description: PropTypes.string,
    modality: PropTypes.string,
    disease_id: PropTypes.number,
    disease_name: PropTypes.string,
    model_path: PropTypes.string,
    blog_link: PropTypes.string,
    paper_link: PropTypes.string,
    accuracy: PropTypes.number,
    precision: PropTypes.number,
    recall: PropTypes.number,
    f1_score: PropTypes.number,
    model_type: PropTypes.string,
    version: PropTypes.string,
    is_active: PropTypes.bool,
    created_at: PropTypes.string,
    updated_at: PropTypes.string,
  }).isRequired,
  selected: PropTypes.bool,
  onClick: PropTypes.func,
  showLinks: PropTypes.bool,
};

export default ClassifierCard;
