import PropTypes from "prop-types";
import {
  Paper,
  Typography,
  Box,
  Grid,
  Chip,
  Button,
  Divider,
} from "@mui/material";
import ArticleIcon from "@mui/icons-material/Article";
import DescriptionIcon from "@mui/icons-material/Description";

function ClassifierInfoCard({ classifierData, disease, modality }) {
  const getModalityLabel = () => {
    const labels = {
      mri: "MRI",
      ct: "CT Scan",
      xray: "X-Ray",
      tabular: "Lab Data",
    };
    return labels[modality?.toLowerCase()] || modality?.toUpperCase();
  };

  return (
    <Paper
      elevation={2}
      sx={{
        p: 3,
        mb: 3,
        borderRadius: 3,
        border: "2px solid #10B981",
        backgroundColor: "#ffffff",
        overflow: "hidden",
      }}
    >
      {/* Header Row */}
      <Box sx={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", mb: 1.5, gap: 2 }}>
        <Box sx={{ minWidth: 0, flex: 1 }}>
          <Typography
            variant="h4"
            sx={{ 
              fontWeight: 700, 
              color: "#10B981",
              fontSize: "1.75rem",
              lineHeight: 1.3,
              overflow: "hidden",
              textOverflow: "ellipsis",
              display: "-webkit-box",
              WebkitLineClamp: 1,
              WebkitBoxOrient: "vertical",
            }}
          >
            {classifierData.name}
          </Typography>
        </Box>
        
        {/* Action Buttons */}
        {(classifierData.blog_link || classifierData.paper_link) && (
          <Box sx={{ display: "flex", gap: 1, flexShrink: 0 }}>
            {classifierData.blog_link && (
              <Button
                variant="outlined"
                size="small"
                startIcon={<ArticleIcon />}
                href={classifierData.blog_link}
                target="_blank"
                rel="noopener noreferrer"
                sx={{
                  borderColor: "#10B981",
                  color: "#10B981",
                  whiteSpace: "nowrap",
                  "&:hover": {
                    borderColor: "#059669",
                    backgroundColor: "#F0FDF4",
                  },
                }}
              >
                Learn More
              </Button>
            )}
            {classifierData.paper_link && (
              <Button
                variant="outlined"
                size="small"
                startIcon={<DescriptionIcon />}
                href={classifierData.paper_link}
                target="_blank"
                rel="noopener noreferrer"
                sx={{
                  borderColor: "#10B981",
                  color: "#10B981",
                  whiteSpace: "nowrap",
                  "&:hover": {
                    borderColor: "#059669",
                    backgroundColor: "#F0FDF4",
                  },
                }}
              >
                Paper
              </Button>
            )}
          </Box>
        )}
      </Box>

      {/* Title - Bold and Big, 2 lines max */}
      {classifierData.title && (
        <Typography
          variant="h5"
          sx={{ 
            color: "#374151", 
            fontWeight: 700,
            fontSize: "1.25rem",
            lineHeight: 1.4,
            mb: 1,
            overflow: "hidden",
            textOverflow: "ellipsis",
            display: "-webkit-box",
            WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical",
          }}
        >
          {classifierData.title}
        </Typography>
      )}

      {/* Description - 2 lines max */}
      {classifierData.description && (
        <Typography 
          variant="body2" 
          color="text.secondary" 
          sx={{ 
            mb: 1,
            lineHeight: 1.5,
            overflow: "hidden",
            textOverflow: "ellipsis",
            display: "-webkit-box",
            WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical",
          }}
        >
          {classifierData.description}
        </Typography>
      )}

      {/* Authors - Highlighted */}
      {classifierData.authors && (
        <Box 
          sx={{ 
            display: "inline-block",
            backgroundColor: "#FEF3C7",
            border: "1px solid #FCD34D",
            borderRadius: 1,
            px: 1.5,
            py: 0.5,
            mb: 2,
          }}
        >
          <Typography 
            variant="body2" 
            sx={{ 
              color: "#92400E", 
              fontWeight: 600,
              fontStyle: "italic",
            }}
          >
            Authors: {classifierData.authors}
          </Typography>
        </Box>
      )}

      <Divider sx={{ mb: 2 }} />

      {/* Model Details and Performance Metrics */}
      <Box sx={{ display: "flex", flexDirection: { xs: "column", md: "row" }, gap: 2 }}>
        {/* Model Details */}
        <Box sx={{ flex: "0 0 auto", width: { xs: "100%", md: "35%" } }}>
          <Typography
            variant="subtitle2"
            sx={{ fontWeight: 600, color: "#374151", mb: 1 }}
          >
            Model Details
          </Typography>
          <Box>
            {/* First Row */}
            <Box sx={{ display: "flex", gap: 1, mb: 1 }}>
              <Chip
                label={`Disease: ${disease?.name || "N/A"}`}
                size="small"
                sx={{
                  backgroundColor: "#DCFCE7",
                  color: "#166534",
                  fontWeight: 500,
                  flex: 1,
                  justifyContent: "center",
                  "& .MuiChip-label": {
                    paddingLeft: 0,
                    paddingRight: 0,
                  },
                }}
              />
              <Chip
                label={`Modality: ${getModalityLabel() || "N/A"}`}
                size="small"
                sx={{
                  backgroundColor: "#DCFCE7",
                  color: "#166534",
                  fontWeight: 500,
                  flex: 1,
                  justifyContent: "center",
                  "& .MuiChip-label": {
                    paddingLeft: 0,
                    paddingRight: 0,
                  },
                }}
              />
            </Box>
            {/* Second Row */}
            <Box sx={{ display: "flex", gap: 1 }}>
              <Chip
                label={`Model: ${classifierData.model_type || "N/A"}`}
                size="small"
                sx={{
                  backgroundColor: "#DCFCE7",
                  color: "#166534",
                  fontWeight: 500,
                  flex: 1,
                  justifyContent: "center",
                  "& .MuiChip-label": {
                    paddingLeft: 0,
                    paddingRight: 0,
                  },
                }}
              />
              <Chip
                label={`Version: ${classifierData.version || "N/A"}`}
                size="small"
                sx={{
                  backgroundColor: "#DCFCE7",
                  color: "#166534",
                  fontWeight: 500,
                  flex: 1,
                  justifyContent: "center",
                  "& .MuiChip-label": {
                    paddingLeft: 0,
                    paddingRight: 0,
                  },
                }}
              />
            </Box>
          </Box>
        </Box>

        {/* Performance Metrics */}
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Typography
            variant="subtitle2"
            sx={{ fontWeight: 600, color: "#374151", mb: 2 }}
          >
            Performance Metrics
          </Typography>
          <Paper
            sx={{
              p: 2.5,
              backgroundColor: "#F0FDF4",
              borderRadius: 2,
              border: "1px solid #BBF7D0",
            }}
          >
            <Grid container spacing={2}>
              <Grid item xs={6}>
                <Box>
                  <Typography
                    variant="h4"
                    sx={{ fontWeight: 700, color: "#10B981" }}
                  >
                    {classifierData.accuracy
                      ? `${(classifierData.accuracy * 100).toFixed(1)}%`
                      : "N/A"}
                  </Typography>
                  <Typography variant="caption" sx={{ color: "#6B7280" }}>
                    Accuracy
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={6}>
                <Box>
                  <Typography
                    variant="h4"
                    sx={{ fontWeight: 700, color: "#10B981" }}
                  >
                    {classifierData.f1_score
                      ? classifierData.f1_score.toFixed(3)
                      : "N/A"}
                  </Typography>
                  <Typography variant="caption" sx={{ color: "#6B7280" }}>
                    F1 Score
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={6}>
                <Box>
                  <Typography
                    variant="h5"
                    sx={{ fontWeight: 600, color: "#059669" }}
                  >
                    {classifierData.precision
                      ? `${(classifierData.precision * 100).toFixed(1)}%`
                      : "N/A"}
                  </Typography>
                  <Typography variant="caption" sx={{ color: "#6B7280" }}>
                    Precision
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={6}>
                <Box>
                  <Typography
                    variant="h5"
                    sx={{ fontWeight: 600, color: "#059669" }}
                  >
                    {classifierData.recall
                      ? `${(classifierData.recall * 100).toFixed(1)}%`
                      : "N/A"}
                  </Typography>
                  <Typography variant="caption" sx={{ color: "#6B7280" }}>
                    Recall
                  </Typography>
                </Box>
              </Grid>
              {(classifierData.sensitivity || classifierData.specificity) && (
                <>
                  <Grid item xs={6}>
                    <Box>
                      <Typography
                        variant="body1"
                        sx={{ fontWeight: 600, color: "#059669" }}
                      >
                        {classifierData.sensitivity
                          ? `${(classifierData.sensitivity * 100).toFixed(1)}%`
                          : "N/A"}
                      </Typography>
                      <Typography variant="caption" sx={{ color: "#6B7280" }}>
                        Sensitivity
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={6}>
                    <Box>
                      <Typography
                        variant="body1"
                        sx={{ fontWeight: 600, color: "#059669" }}
                      >
                        {classifierData.specificity
                          ? `${(classifierData.specificity * 100).toFixed(1)}%`
                          : "N/A"}
                      </Typography>
                      <Typography variant="caption" sx={{ color: "#6B7280" }}>
                        Specificity
                      </Typography>
                    </Box>
                  </Grid>
                </>
              )}
              <Grid item xs={12}>
                <Divider sx={{ my: 1 }} />
                <Typography variant="body2" sx={{ color: "#6B7280", mt: 1 }}>
                  Trained on{" "}
                  <strong style={{ color: "#10B981" }}>
                    {classifierData.training_samples
                      ? classifierData.training_samples.toLocaleString()
                      : "Unknown"}
                  </strong>{" "}
                  samples
                </Typography>
              </Grid>
            </Grid>
          </Paper>
        </Box>
      </Box>
    </Paper>
  );
}

ClassifierInfoCard.propTypes = {
  classifierData: PropTypes.shape({
    name: PropTypes.string,
    title: PropTypes.string,
    description: PropTypes.string,
    authors: PropTypes.string,
    blog_link: PropTypes.string,
    paper_link: PropTypes.string,
    model_type: PropTypes.string,
    version: PropTypes.string,
    accuracy: PropTypes.number,
    f1_score: PropTypes.number,
    precision: PropTypes.number,
    recall: PropTypes.number,
    sensitivity: PropTypes.number,
    specificity: PropTypes.number,
    training_samples: PropTypes.number,
  }).isRequired,
  disease: PropTypes.shape({
    name: PropTypes.string,
  }).isRequired,
  modality: PropTypes.string.isRequired,
};

export default ClassifierInfoCard;
