import { Box, TextField, Typography, Paper } from "@mui/material";

function FeatureMetadataEditor({ featureName, metadata, onChange }) {
  const handleChange = (field, value) => {
    onChange({
      ...metadata,
      [field]: value,
    });
  };

  return (
    <Paper
      elevation={0}
      sx={{
        p: 2.5,
        mb: 2,
        backgroundColor: "#F9FAFB",
        border: "1px solid #E5E7EB",
        borderRadius: 2,
      }}
    >
      <Typography
        variant="subtitle2"
        sx={{ mb: 2, color: "#2C3E50", fontWeight: 600 }}
      >
        {featureName}
      </Typography>

      <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
        <TextField
          fullWidth
          label="Unit"
          value={metadata?.unit || ""}
          onChange={(e) => handleChange("unit", e.target.value)}
          placeholder="e.g., mg/dL, years, kg/m²"
          size="small"
          sx={{
            "& .MuiOutlinedInput-root": {
              backgroundColor: "white",
              "&.Mui-focused fieldset": { borderColor: "#10B981" },
            },
            "& .MuiInputLabel-root.Mui-focused": { color: "#10B981" },
          }}
        />

        <TextField
          fullWidth
          label="Description"
          value={metadata?.description || ""}
          onChange={(e) => handleChange("description", e.target.value)}
          placeholder="Describe what this feature represents"
          multiline
          rows={2}
          size="small"
          sx={{
            "& .MuiOutlinedInput-root": {
              backgroundColor: "white",
              "&.Mui-focused fieldset": { borderColor: "#10B981" },
            },
            "& .MuiInputLabel-root.Mui-focused": { color: "#10B981" },
          }}
        />

        <TextField
          fullWidth
          label="Normal Range (Optional)"
          value={metadata?.range || ""}
          onChange={(e) => handleChange("range", e.target.value)}
          placeholder="e.g., 0-120, 70-200"
          size="small"
          sx={{
            "& .MuiOutlinedInput-root": {
              backgroundColor: "white",
              "&.Mui-focused fieldset": { borderColor: "#10B981" },
            },
            "& .MuiInputLabel-root.Mui-focused": { color: "#10B981" },
          }}
        />
      </Box>
    </Paper>
  );
}

export default FeatureMetadataEditor;
