import { Box, TextField, Typography, Grid, Paper } from "@mui/material";

function AccuracyMetricsForm({ metrics, onChange, includeImageMetrics = false }) {
  const handleChange = (field, value) => {
    onChange({
      ...metrics,
      [field]: value,
    });
  };

  return (
    <Paper
      elevation={0}
      sx={{
        p: 3,
        backgroundColor: "#F9FAFB",
        border: "1px solid #E5E7EB",
        borderRadius: 2,
      }}
    >
      <Typography variant="h6" sx={{ mb: 3, color: "#2C3E50" }}>
        Performance Metrics
      </Typography>

      <Grid container spacing={2}>
        {/* Standard Metrics */}
        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            label="Accuracy"
            type="number"
            inputProps={{ step: 0.01, min: 0, max: 1 }}
            value={metrics?.accuracy || ""}
            onChange={(e) => handleChange("accuracy", e.target.value)}
            placeholder="0.95"
            helperText="Value between 0 and 1"
            sx={{
              "& .MuiOutlinedInput-root": {
                backgroundColor: "white",
                "&.Mui-focused fieldset": { borderColor: "#10B981" },
              },
              "& .MuiInputLabel-root.Mui-focused": { color: "#10B981" },
            }}
          />
        </Grid>

        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            label="Precision"
            type="number"
            inputProps={{ step: 0.01, min: 0, max: 1 }}
            value={metrics?.precision || ""}
            onChange={(e) => handleChange("precision", e.target.value)}
            placeholder="0.93"
            helperText="Value between 0 and 1"
            sx={{
              "& .MuiOutlinedInput-root": {
                backgroundColor: "white",
                "&.Mui-focused fieldset": { borderColor: "#10B981" },
              },
              "& .MuiInputLabel-root.Mui-focused": { color: "#10B981" },
            }}
          />
        </Grid>

        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            label="Recall"
            type="number"
            inputProps={{ step: 0.01, min: 0, max: 1 }}
            value={metrics?.recall || ""}
            onChange={(e) => handleChange("recall", e.target.value)}
            placeholder="0.94"
            helperText="Value between 0 and 1"
            sx={{
              "& .MuiOutlinedInput-root": {
                backgroundColor: "white",
                "&.Mui-focused fieldset": { borderColor: "#10B981" },
              },
              "& .MuiInputLabel-root.Mui-focused": { color: "#10B981" },
            }}
          />
        </Grid>

        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            label="F1 Score"
            type="number"
            inputProps={{ step: 0.01, min: 0, max: 1 }}
            value={metrics?.f1_score || ""}
            onChange={(e) => handleChange("f1_score", e.target.value)}
            placeholder="0.935"
            helperText="Value between 0 and 1"
            sx={{
              "& .MuiOutlinedInput-root": {
                backgroundColor: "white",
                "&.Mui-focused fieldset": { borderColor: "#10B981" },
              },
              "& .MuiInputLabel-root.Mui-focused": { color: "#10B981" },
            }}
          />
        </Grid>

        {/* Image-specific Metrics */}
        {includeImageMetrics && (
          <>
            <Grid item xs={12}>
              <Typography variant="subtitle2" sx={{ mt: 2, mb: 1, color: "#6B7280" }}>
                Additional Metrics (for Image Models)
              </Typography>
            </Grid>

            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                label="AUC-ROC"
                type="number"
                inputProps={{ step: 0.01, min: 0, max: 1 }}
                value={metrics?.auc_roc || ""}
                onChange={(e) => handleChange("auc_roc", e.target.value)}
                placeholder="0.98"
                helperText="Area Under ROC Curve"
                sx={{
                  "& .MuiOutlinedInput-root": {
                    backgroundColor: "white",
                    "&.Mui-focused fieldset": { borderColor: "#10B981" },
                  },
                  "& .MuiInputLabel-root.Mui-focused": { color: "#10B981" },
                }}
              />
            </Grid>

            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                label="Sensitivity"
                type="number"
                inputProps={{ step: 0.01, min: 0, max: 1 }}
                value={metrics?.sensitivity || ""}
                onChange={(e) => handleChange("sensitivity", e.target.value)}
                placeholder="0.95"
                helperText="True Positive Rate"
                sx={{
                  "& .MuiOutlinedInput-root": {
                    backgroundColor: "white",
                    "&.Mui-focused fieldset": { borderColor: "#10B981" },
                  },
                  "& .MuiInputLabel-root.Mui-focused": { color: "#10B981" },
                }}
              />
            </Grid>

            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                label="Specificity"
                type="number"
                inputProps={{ step: 0.01, min: 0, max: 1 }}
                value={metrics?.specificity || ""}
                onChange={(e) => handleChange("specificity", e.target.value)}
                placeholder="0.97"
                helperText="True Negative Rate"
                sx={{
                  "& .MuiOutlinedInput-root": {
                    backgroundColor: "white",
                    "&.Mui-focused fieldset": { borderColor: "#10B981" },
                  },
                  "& .MuiInputLabel-root.Mui-focused": { color: "#10B981" },
                }}
              />
            </Grid>
          </>
        )}

        {/* Training Metadata */}
        <Grid item xs={12}>
          <Typography variant="subtitle2" sx={{ mt: 2, mb: 1, color: "#6B7280" }}>
            Training Information
          </Typography>
        </Grid>

        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            label="Training Date"
            type="date"
            value={metrics?.training_date || ""}
            onChange={(e) => handleChange("training_date", e.target.value)}
            InputLabelProps={{ shrink: true }}
            sx={{
              "& .MuiOutlinedInput-root": {
                backgroundColor: "white",
                "&.Mui-focused fieldset": { borderColor: "#10B981" },
              },
              "& .MuiInputLabel-root.Mui-focused": { color: "#10B981" },
            }}
          />
        </Grid>

        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            label="Training Samples"
            type="number"
            inputProps={{ min: 0 }}
            value={metrics?.training_samples || ""}
            onChange={(e) => handleChange("training_samples", e.target.value)}
            placeholder="10000"
            helperText="Number of samples used for training"
            sx={{
              "& .MuiOutlinedInput-root": {
                backgroundColor: "white",
                "&.Mui-focused fieldset": { borderColor: "#10B981" },
              },
              "& .MuiInputLabel-root.Mui-focused": { color: "#10B981" },
            }}
          />
        </Grid>
      </Grid>
    </Paper>
  );
}

export default AccuracyMetricsForm;
