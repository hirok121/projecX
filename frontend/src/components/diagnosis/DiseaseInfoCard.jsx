import PropTypes from "prop-types";
import {
  Paper,
  Typography,
  Box,
  Chip,
  Button,
  Divider,
} from "@mui/material";
import ArticleIcon from "@mui/icons-material/Article";

function DiseaseInfoCard({ disease, modalityOptions }) {
  const handleShowMoreInfo = () => {
    if (disease?.blog_link) {
      window.open(disease.blog_link, "_blank", "noopener,noreferrer");
    }
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
      <Box
        sx={{
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "space-between",
          mb: 1.5,
          gap: 2,
        }}
      >
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
            {disease.name}
          </Typography>
        </Box>

        {/* Action Button */}
        {disease.blog_link && (
          <Box sx={{ display: "flex", gap: 1, flexShrink: 0 }}>
            <Button
              variant="outlined"
              size="small"
              startIcon={<ArticleIcon />}
              onClick={handleShowMoreInfo}
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
          </Box>
        )}
      </Box>

      {/* Category Chip */}
      {disease.category && (
        <Chip
          label={disease.category}
          size="small"
          sx={{
            mb: 1.5,
            backgroundColor: "#10B981",
            color: "#FFFFFF",
            fontWeight: 600,
            fontSize: "0.75rem",
            textTransform: "uppercase",
            letterSpacing: "0.5px",
            height: "24px",
          }}
        />
      )}

      {/* Description - 3 lines max */}
      {disease.description && (
        <Typography
          variant="body2"
          color="text.secondary"
          sx={{
            mb: 2,
            lineHeight: 1.6,
            overflow: "hidden",
            textOverflow: "ellipsis",
            display: "-webkit-box",
            WebkitLineClamp: 3,
            WebkitBoxOrient: "vertical",
          }}
        >
          {disease.description}
        </Typography>
      )}

      <Divider sx={{ mb: 2 }} />

      {/* Available Diagnostic Methods */}
      <Box>
        <Typography
          variant="subtitle2"
          sx={{ fontWeight: 600, color: "#374151", mb: 1.5 }}
        >
          Available Diagnostic Methods
        </Typography>
        <Box sx={{ display: "flex", gap: 1.5, flexWrap: "wrap" }}>
          {disease.available_modalities &&
          disease.available_modalities.length > 0 ? (
            disease.available_modalities.map((modality, index) => {
              const modalityInfo = modalityOptions.find(
                (m) => m.id === modality.toLowerCase()
              );
              return (
                <Chip
                  key={index}
                  icon={
                    <span style={{ fontSize: "1.2rem" }}>
                      {modalityInfo?.icon || "📋"}
                    </span>
                  }
                  label={modalityInfo?.name || modality}
                  sx={{
                    backgroundColor: "#DCFCE7",
                    border: "1px solid #BBF7D0",
                    color: "#166534",
                    fontWeight: 600,
                    fontSize: "0.875rem",
                    padding: "20px 8px",
                    height: "auto",
                    "& .MuiChip-icon": {
                      marginLeft: "8px",
                    },
                  }}
                />
              );
            })
          ) : (
            <Typography
              variant="body2"
              sx={{ color: "#64748B", fontStyle: "italic" }}
            >
              No modalities available
            </Typography>
          )}
        </Box>
      </Box>
    </Paper>
  );
}

DiseaseInfoCard.propTypes = {
  disease: PropTypes.shape({
    name: PropTypes.string.isRequired,
    category: PropTypes.string,
    description: PropTypes.string,
    blog_link: PropTypes.string,
    available_modalities: PropTypes.arrayOf(PropTypes.string),
  }).isRequired,
  modalityOptions: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      name: PropTypes.string.isRequired,
      icon: PropTypes.string.isRequired,
    })
  ).isRequired,
};

export default DiseaseInfoCard;
