import PropTypes from "prop-types";
import {
  Typography,
  Grid,
  TextField,
  Box,
  Alert,
  Tooltip,
} from "@mui/material";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import ScienceIcon from "@mui/icons-material/Science";

function ClinicalDataSection({
  requiredFeatures,
  featureMetadata,
  inputData,
  handleFieldChange,
  getFilledFieldsCount,
  getFilledPercentage,
}) {
  return (
    <Box>
      <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
        <ScienceIcon sx={{ color: "#10B981" }} />
        <Typography variant="h6" sx={{ fontWeight: 600, color: "#374151" }}>
          Enter Clinical Data
        </Typography>
      </Box>

      <Alert severity="info" sx={{ mb: 2 }}>
        <Typography variant="body2" sx={{ fontWeight: 500 }}>
          Minimum 50% of fields required to run prediction
        </Typography>
        <Typography variant="caption" color="text.secondary">
          For best results, fill in 75% or more of the fields
        </Typography>
      </Alert>

      {requiredFeatures.length > 0 && (
        <Box sx={{ mb: 3 }}>
          <Box
            sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}
          >
            <Typography variant="body2" color="text.secondary">
              Fields completed: {getFilledFieldsCount()} /{" "}
              {requiredFeatures.length}
            </Typography>
            <Typography
              variant="body2"
              sx={{
                fontWeight: 600,
                color:
                  getFilledPercentage() >= 75
                    ? "#10B981"
                    : getFilledPercentage() >= 50
                    ? "#F59E0B"
                    : "#EF4444",
              }}
            >
              {getFilledPercentage().toFixed(0)}%
            </Typography>
          </Box>
          <Box
            sx={{
              width: "100%",
              height: 8,
              backgroundColor: "#E5E7EB",
              borderRadius: 1,
              overflow: "hidden",
            }}
          >
            <Box
              sx={{
                width: `${getFilledPercentage()}%`,
                height: "100%",
                backgroundColor:
                  getFilledPercentage() >= 75
                    ? "#10B981"
                    : getFilledPercentage() >= 50
                    ? "#F59E0B"
                    : "#EF4444",
                transition: "width 0.3s ease, background-color 0.3s ease",
              }}
            />
          </Box>
        </Box>
      )}

      <Grid container spacing={3}>
        {requiredFeatures.map((feature) => {
          const metadata = featureMetadata[feature] || {};

          return (
            <Grid item xs={12} sm={6} key={feature}>
              <Box sx={{ position: "relative" }}>
                <TextField
                  fullWidth
                  label={feature}
                  type="number"
                  value={inputData[feature] || ""}
                  onChange={(e) => handleFieldChange(feature, e.target.value)}
                  helperText={
                    metadata.unit || metadata.range
                      ? `${metadata.unit ? `Unit: ${metadata.unit}` : ""}${
                          metadata.unit && metadata.range ? " | " : ""
                        }${metadata.range ? `Range: ${metadata.range}` : ""}`
                      : ""
                  }
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      "&.Mui-focused fieldset": {
                        borderColor: "#10B981",
                      },
                    },
                    "& .MuiInputLabel-root.Mui-focused": {
                      color: "#10B981",
                    },
                  }}
                />
                {metadata.description && (
                  <Tooltip
                    title={metadata.description}
                    arrow
                    placement="top"
                  >
                    <InfoOutlinedIcon
                      sx={{
                        position: "absolute",
                        right: 8,
                        top: 16,
                        fontSize: 20,
                        color: "text.secondary",
                        cursor: "help",
                      }}
                    />
                  </Tooltip>
                )}
              </Box>
            </Grid>
          );
        })}
      </Grid>

      {requiredFeatures.length === 0 && (
        <Box sx={{ textAlign: "center", py: 4 }}>
          <Typography variant="body1" color="text.secondary">
            No input fields configured for this classifier
          </Typography>
        </Box>
      )}
    </Box>
  );
}

ClinicalDataSection.propTypes = {
  requiredFeatures: PropTypes.arrayOf(PropTypes.string).isRequired,
  featureMetadata: PropTypes.object.isRequired,
  inputData: PropTypes.object.isRequired,
  handleFieldChange: PropTypes.func.isRequired,
  getFilledFieldsCount: PropTypes.func.isRequired,
  getFilledPercentage: PropTypes.func.isRequired,
};

export default ClinicalDataSection;
