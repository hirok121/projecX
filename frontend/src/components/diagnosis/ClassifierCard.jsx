import PropTypes from "prop-types";
import {
  Card,
  CardContent,
  Typography,
  Box,
  Chip,
  IconButton,
  Divider,
  Tooltip,
} from "@mui/material";
import {
  Info as InfoIcon,
  Description as PaperIcon,
  Person as PersonIcon,
  CheckCircle as CheckIcon,
} from "@mui/icons-material";

const ClassifierCard = ({
  classifier,
  selected = false,
  onClick,
  showLinks = true,
}) => {
  // Handle missing classifier data
  if (!classifier) {
    return (
      <Card sx={{ height: 480 }}>
        <CardContent>
          <Typography>No classifier data available</Typography>
        </CardContent>
      </Card>
    );
  }

  // Extract classifier data
  const name = classifier?.name || "Unknown Classifier";
  const title = classifier?.title || classifier?.model_type || "AI Model";
  const description = classifier?.description || "No description available";
  const modality = classifier?.modality || "";
  const accuracy = classifier?.accuracy;
  const author = classifier?.authors || classifier?.created_by || "DeepMed Team";
  const requiredFeatures = classifier?.required_features || [];
  const blogLink = classifier?.blog_link || null;
  const paperLink = classifier?.paper_link || null;

  // Handle link clicks - open in new tab
  const handleBlogLinkClick = (e) => {
    e.stopPropagation();
    if (blogLink) {
      window.open(blogLink, "_blank", "noopener,noreferrer");
    }
  };

  const handlePaperLinkClick = (e) => {
    e.stopPropagation();
    if (paperLink) {
      window.open(paperLink, "_blank", "noopener,noreferrer");
    }
  };

  // Handle card click
  const handleCardClick = () => {
    if (onClick) {
      onClick(classifier);
    }
  };

  // Get modality icon and color
  const getModalityInfo = (modality) => {
    const info = {
      MRI: { icon: "🧲", color: "#8B5CF6", bg: "#F5F3FF" },
      CT: { icon: "🔬", color: "#3B82F6", bg: "#EFF6FF" },
      "X-RAY": { icon: "📡", color: "#06B6D4", bg: "#ECFEFF" },
      XRAY: { icon: "📡", color: "#06B6D4", bg: "#ECFEFF" },
      TABULAR: { icon: "📊", color: "#10B981", bg: "#ECFDF5" },
    };
    return (
      info[modality?.toUpperCase()] || {
        icon: "🤖",
        color: "#64748B",
        bg: "#F1F5F9",
      }
    );
  };

  const modalityInfo = getModalityInfo(modality);

  // Format percentage for display
  const formatPercentage = (value) => {
    if (value === null || value === undefined) return "N/A";
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
        borderRadius: 2,
        border: selected ? "3px solid #10B981" : "2px solid #E5E7EB",
        boxShadow: selected
          ? "0 8px 24px rgba(16, 185, 129, 0.2)"
          : "0 2px 8px rgba(0,0,0,0.05)",
        transition: "all 0.3s ease",
        backgroundColor: "#FFFFFF",
        overflow: "hidden",
        "&:hover": onClick
          ? {
              transform: "translateY(-4px)",
              boxShadow: selected
                ? "0 12px 32px rgba(16, 185, 129, 0.3)"
                : "0 8px 24px rgba(0, 0, 0, 0.1)",
              borderColor: selected ? "#10B981" : "#10B981",
            }
          : {},
      }}
      onClick={handleCardClick}
    >
      {/* Header with Modality Badge */}
      <Box
        sx={{
          background: `linear-gradient(135deg, ${modalityInfo.color} 0%, ${modalityInfo.color}dd 100%)`,
          p: 2,
          position: "relative",
        }}
      >
        <Box display="flex" alignItems="center" justifyContent="space-between">
          <Chip
            icon={<span style={{ fontSize: "1rem" }}>{modalityInfo.icon}</span>}
            label={modality}
            sx={{
              backgroundColor: "rgba(255,255,255,0.95)",
              color: modalityInfo.color,
              fontWeight: 700,
              fontSize: "0.75rem",
              height: "28px",
              "& .MuiChip-icon": {
                marginLeft: "8px",
              },
            }}
          />
          {selected && (
            <CheckIcon
              sx={{
                color: "#FFFFFF",
                fontSize: 28,
                filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.2))",
              }}
            />
          )}
        </Box>
      </Box>

      <CardContent
        sx={{
          p: 2.5,
          flexGrow: 1,
          display: "flex",
          flexDirection: "column",
        }}
      >
        {/* Model Name */}
        <Typography
          variant="h6"
          sx={{
            fontWeight: 700,
            color: "#1E293B",
            mb: 0.5,
            lineHeight: 1.3,
            fontSize: "1.1rem",
            display: "-webkit-box",
            WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
            minHeight: "2.6em",
          }}
        >
          {name}
        </Typography>

        {/* Title/Model Type */}
        <Typography
          variant="caption"
          sx={{
            color: "#64748B",
            fontWeight: 600,
            textTransform: "uppercase",
            letterSpacing: "0.5px",
            mb: 1.5,
            display: "block",
          }}
        >
          {title}
        </Typography>

        {/* Description */}
        <Typography
          variant="body2"
          sx={{
            color: "#475569",
            lineHeight: 1.6,
            mb: 2,
            fontSize: "0.875rem",
            display: "-webkit-box",
            WebkitLineClamp: 3,
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
            minHeight: "4em",
          }}
        >
          {description}
        </Typography>

        {/* Accuracy Display */}
        <Box
          sx={{
            mb: 2,
            p: 1.5,
            backgroundColor: "#F0FDF4",
            borderRadius: 1.5,
            border: "1px solid #D1FAE5",
          }}
        >
          <Typography
            variant="caption"
            sx={{
              color: "#065F46",
              fontWeight: 600,
              display: "block",
              mb: 0.5,
            }}
          >
            ACCURACY
          </Typography>
          <Typography
            variant="h5"
            sx={{
              color: "#10B981",
              fontWeight: 700,
              fontSize: "1.5rem",
            }}
          >
            {formatPercentage(accuracy)}
          </Typography>
        </Box>

        {/* Required Features for Tabular */}
        {modality?.toUpperCase() === "TABULAR" &&
          requiredFeatures &&
          requiredFeatures.length > 0 && (
            <Box sx={{ mb: 2 }}>
              <Typography
                variant="caption"
                sx={{
                  color: "#64748B",
                  fontWeight: 600,
                  textTransform: "uppercase",
                  letterSpacing: "0.5px",
                  mb: 0.75,
                  display: "block",
                }}
              >
                Required Features ({requiredFeatures.length})
              </Typography>
              <Box
                sx={{
                  maxHeight: "60px",
                  overflowY: "auto",
                  display: "flex",
                  gap: 0.5,
                  flexWrap: "wrap",
                }}
              >
                {requiredFeatures.slice(0, 4).map((feature, index) => (
                  <Chip
                    key={index}
                    label={feature}
                    size="small"
                    sx={{
                      fontSize: "0.7rem",
                      height: "22px",
                      backgroundColor: "#F1F5F9",
                      color: "#475569",
                    }}
                  />
                ))}
                {requiredFeatures.length > 4 && (
                  <Chip
                    label={`+${requiredFeatures.length - 4}`}
                    size="small"
                    sx={{
                      fontSize: "0.7rem",
                      height: "22px",
                      backgroundColor: "#E2E8F0",
                      color: "#475569",
                      fontWeight: 600,
                    }}
                  />
                )}
              </Box>
            </Box>
          )}

        {/* Spacer */}
        <Box sx={{ flexGrow: 1 }} />

        <Divider sx={{ my: 1.5 }} />

        {/* Footer - Author and Links */}
        <Box display="flex" alignItems="center" justifyContent="space-between">
          {/* Author */}
          <Box display="flex" alignItems="center" gap={0.75}>
            <PersonIcon sx={{ fontSize: 16, color: "#64748B" }} />
            <Typography
              variant="caption"
              sx={{
                color: "#64748B",
                fontSize: "0.75rem",
                fontWeight: 500,
              }}
            >
              {author}
            </Typography>
          </Box>

          {/* Links */}
          {showLinks && (blogLink || paperLink) && (
            <Box display="flex" gap={0.5}>
              {blogLink && (
                <Tooltip title="More Info" arrow>
                  <IconButton
                    size="small"
                    onClick={handleBlogLinkClick}
                    sx={{
                      color: "#10B981",
                      backgroundColor: "#ECFDF5",
                      width: 32,
                      height: 32,
                      "&:hover": {
                        backgroundColor: "#D1FAE5",
                      },
                    }}
                  >
                    <InfoIcon sx={{ fontSize: 18 }} />
                  </IconButton>
                </Tooltip>
              )}
              {paperLink && (
                <Tooltip title="View Paper" arrow>
                  <IconButton
                    size="small"
                    onClick={handlePaperLinkClick}
                    sx={{
                      color: "#3B82F6",
                      backgroundColor: "#EFF6FF",
                      width: 32,
                      height: 32,
                      "&:hover": {
                        backgroundColor: "#DBEAFE",
                      },
                    }}
                  >
                    <PaperIcon sx={{ fontSize: 18 }} />
                  </IconButton>
                </Tooltip>
              )}
            </Box>
          )}
        </Box>
      </CardContent>
    </Card>
  );
};

ClassifierCard.propTypes = {
  classifier: PropTypes.shape({
    id: PropTypes.number,
    name: PropTypes.string,
    title: PropTypes.string,
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
    authors: PropTypes.string,
    created_by: PropTypes.string,
    required_features: PropTypes.arrayOf(PropTypes.string),
  }).isRequired,
  selected: PropTypes.bool,
  onClick: PropTypes.func,
  showLinks: PropTypes.bool,
};

export default ClassifierCard;
