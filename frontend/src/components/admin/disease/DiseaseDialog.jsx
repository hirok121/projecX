import {
  Box,
  Button,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  Grid,
  InputLabel,
  MenuItem,
  Select,
  TextField,
  Typography,
} from "@mui/material";
import { CheckCircle } from "@mui/icons-material";
import { CATEGORY_OPTIONS, MODALITY_OPTIONS } from "../../../const/disease";

function DiseaseDialog({
  open,
  onClose,
  disease,
  formData,
  onChange,
  onSubmit,
  loading,
}) {
  const handleModalityToggle = (modality) => {
    const current = formData.available_modalities || [];
    const updated = current.includes(modality)
      ? current.filter((m) => m !== modality)
      : [...current, modality];
    onChange({ ...formData, available_modalities: updated });
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle
        sx={{
          backgroundColor: "#ECFDF5",
          color: "#10B981",
          fontWeight: 600,
          pb: 1,
        }}
      >
        {disease ? "Edit Disease" : "Add New Disease"}
        <Typography
          variant="body2"
          sx={{ color: "#6B7280", mt: 0.5, fontWeight: 400 }}
        >
          {disease
            ? "Update disease information and settings"
            : "Create a new disease entry with classification modalities"}
        </Typography>
      </DialogTitle>

      <DialogContent sx={{ mt: 3 }}>
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Typography
              variant="subtitle1"
              sx={{ fontWeight: 600, color: "#2C3E50", mb: 2 }}
            >
              Basic Information
            </Typography>
          </Grid>

          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Disease Name"
              value={formData.name}
              onChange={(e) => onChange({ ...formData, name: e.target.value })}
              required
              placeholder="e.g., Diabetes, Heart Disease, Pneumonia"
              helperText="Enter the official medical name of the disease (max 200 characters)"
              inputProps={{ maxLength: 200 }}
              error={formData.name.length > 200}
              sx={{
                "& .MuiOutlinedInput-root": {
                  "&.Mui-focused fieldset": { borderColor: "#10B981" },
                },
                "& .MuiInputLabel-root.Mui-focused": { color: "#10B981" },
              }}
            />
          </Grid>

          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Description"
              value={formData.description}
              onChange={(e) =>
                onChange({ ...formData, description: e.target.value })
              }
              multiline
              rows={4}
              placeholder="Provide a detailed description of the disease, its symptoms, and characteristics..."
              helperText="A comprehensive description helps users understand the disease better"
              sx={{
                "& .MuiOutlinedInput-root": {
                  "&.Mui-focused fieldset": { borderColor: "#10B981" },
                },
                "& .MuiInputLabel-root.Mui-focused": { color: "#10B981" },
              }}
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <FormControl fullWidth required>
              <InputLabel>Category</InputLabel>
              <Select
                value={formData.category}
                onChange={(e) =>
                  onChange({ ...formData, category: e.target.value })
                }
                label="Category"
                sx={{
                  "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                    borderColor: "#10B981",
                  },
                }}
              >
                <MenuItem value="" disabled>
                  <em>Select a category</em>
                </MenuItem>
                {CATEGORY_OPTIONS.map((cat) => (
                  <MenuItem key={cat} value={cat}>
                    {cat}
                  </MenuItem>
                ))}
              </Select>
              <Typography
                variant="caption"
                sx={{ mt: 0.5, color: "#6B7280", ml: 1.5 }}
              >
                Medical category or system affected
              </Typography>
            </FormControl>
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Blog Link (Optional)"
              value={formData.blog_link}
              onChange={(e) =>
                onChange({ ...formData, blog_link: e.target.value })
              }
              placeholder="https://example.com/disease-info"
              helperText="Link to educational content or blog post"
              inputProps={{ maxLength: 500 }}
              error={formData.blog_link.length > 500}
              sx={{
                "& .MuiOutlinedInput-root": {
                  "&.Mui-focused fieldset": { borderColor: "#10B981" },
                },
                "& .MuiInputLabel-root.Mui-focused": { color: "#10B981" },
              }}
            />
          </Grid>

          <Grid item xs={12}>
            <Box
              sx={{
                mt: 2,
                p: 2.5,
                backgroundColor: "#F9FAFB",
                borderRadius: 2,
                border: "1px solid #E5E7EB",
              }}
            >
              <Typography
                variant="subtitle1"
                sx={{ fontWeight: 600, color: "#2C3E50", mb: 1 }}
              >
                Available Modalities *
              </Typography>
              <Typography variant="body2" sx={{ color: "#6B7280", mb: 2 }}>
                Select the diagnostic modalities that can be used to classify
                this disease. Click to toggle selection.
              </Typography>
              <Box display="flex" gap={1.5} flexWrap="wrap">
                {MODALITY_OPTIONS.map((modality) => {
                  const isSelected = (
                    formData.available_modalities || []
                  ).includes(modality);
                  return (
                    <Chip
                      key={modality}
                      label={modality}
                      onClick={() => handleModalityToggle(modality)}
                      icon={
                        isSelected ? (
                          <CheckCircle sx={{ fontSize: 18 }} />
                        ) : undefined
                      }
                      sx={{
                        px: 1.5,
                        py: 2.5,
                        fontSize: "0.95rem",
                        fontWeight: 500,
                        backgroundColor: isSelected ? "#10B981" : "white",
                        color: isSelected ? "white" : "#6B7280",
                        border: isSelected
                          ? "2px solid #10B981"
                          : "2px solid #E5E7EB",
                        "&:hover": {
                          backgroundColor: isSelected ? "#059669" : "#ECFDF5",
                          borderColor: "#10B981",
                          transform: "translateY(-2px)",
                          boxShadow: "0 4px 6px rgba(0,0,0,0.1)",
                        },
                        transition: "all 0.2s ease",
                        cursor: "pointer",
                      }}
                    />
                  );
                })}
              </Box>
              {formData.available_modalities?.length === 0 && (
                <Typography
                  variant="caption"
                  sx={{ color: "#EF4444", mt: 1, display: "block" }}
                >
                  Please select at least one modality
                </Typography>
              )}
            </Box>
          </Grid>

          {disease && (
            <Grid item xs={12}>
              <Box
                sx={{
                  p: 2,
                  backgroundColor: "#FEF3C7",
                  borderRadius: 2,
                  border: "1px solid #FCD34D",
                }}
              >
                <Typography variant="body2" sx={{ color: "#92400E" }}>
                  <strong>Note:</strong> Editing this disease will affect all
                  associated classifiers and predictions.
                </Typography>
              </Box>
            </Grid>
          )}
        </Grid>
      </DialogContent>

      <DialogActions sx={{ p: 3, backgroundColor: "#F9FAFB", gap: 1 }}>
        <Button
          onClick={onClose}
          sx={{
            color: "#6B7280",
            "&:hover": { backgroundColor: "#F3F4F6" },
          }}
        >
          Cancel
        </Button>
        <Button
          onClick={onSubmit}
          variant="contained"
          disabled={
            !formData.name ||
            !formData.category ||
            formData.available_modalities?.length === 0 ||
            loading
          }
          sx={{
            backgroundColor: "#10B981",
            px: 4,
            "&:hover": { backgroundColor: "#059669" },
            "&:disabled": { backgroundColor: "#D1D5DB" },
          }}
        >
          {loading ? (
            <CircularProgress size={24} sx={{ color: "white" }} />
          ) : (
            <>{disease ? "Update Disease" : "Create Disease"}</>
          )}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default DiseaseDialog;
