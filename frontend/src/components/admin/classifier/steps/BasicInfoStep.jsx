import {
  Box,
  Button,
  FormControl,
  Grid,
  InputLabel,
  MenuItem,
  Select,
  TextField,
  Typography,
  Alert,
  Paper,
  Divider,
  Chip,
} from "@mui/material";
import { Info, Science, Link as LinkIcon } from "@mui/icons-material";
import { MODALITY_OPTIONS } from "../../../../const/disease";

function BasicInfoStep({
  formData,
  onChange,
  diseases,
  onNext,
  onCancel,
  isEditMode,
}) {
  const canProceed =
    formData.name && formData.disease_id && formData.modality;

  return (
    <Box>
      {isEditMode && (
        <Alert 
          severity="warning" 
          icon={<Info />}
          sx={{ 
            mb: 3,
            borderRadius: 2,
            backgroundColor: "#FEF3C7",
            color: "#92400E",
            "& .MuiAlert-icon": { color: "#F59E0B" }
          }}
        >
          <strong>Note:</strong> Disease and Modality cannot be changed after creation
        </Alert>
      )}

      {/* Essential Information Section */}
      <Paper 
        elevation={0} 
        sx={{ 
          p: 3, 
          mb: 3, 
          backgroundColor: "#F9FAFB",
          border: "1px solid #E5E7EB",
          borderRadius: 2
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
          <Info sx={{ color: "#10B981", mr: 1 }} />
          <Typography variant="h6" sx={{ color: "#2C3E50", fontWeight: 600 }}>
            Essential Information
          </Typography>
          <Chip 
            label="Required" 
            size="small" 
            sx={{ 
              ml: 2, 
              backgroundColor: "#FEE2E2", 
              color: "#991B1B",
              fontWeight: 600,
              fontSize: "0.7rem"
            }} 
          />
        </Box>

        <Grid container spacing={2.5}>
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Classifier Name"
              value={formData.name}
              onChange={(e) => onChange({ name: e.target.value })}
              required
              placeholder="e.g., Diabetes Random Forest Classifier"
              helperText="A unique, descriptive name for your classifier"
              sx={{
                "& .MuiOutlinedInput-root": {
                  backgroundColor: "white",
                  "&.Mui-focused fieldset": { borderColor: "#10B981", borderWidth: 2 },
                },
                "& .MuiInputLabel-root.Mui-focused": { color: "#10B981", fontWeight: 600 },
              }}
            />
          </Grid>

          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Title"
              value={formData.title || ""}
              onChange={(e) => onChange({ title: e.target.value })}
              placeholder="e.g., Advanced ML Model for Diabetes Prediction"
              helperText="A display title for the classifier (optional but recommended)"
              sx={{
                "& .MuiOutlinedInput-root": {
                  backgroundColor: "white",
                  "&.Mui-focused fieldset": { borderColor: "#10B981", borderWidth: 2 },
                },
                "& .MuiInputLabel-root.Mui-focused": { color: "#10B981", fontWeight: 600 },
              }}
            />
          </Grid>

          <Grid item xs={12}>
            <Box sx={{ display: "flex", gap: 2.5, flexWrap: "wrap" }}>
              <Box sx={{ flex: "1 1 calc(33.333% - 20px)", minWidth: "200px" }}>
                <FormControl fullWidth required>
                  <InputLabel>Disease</InputLabel>
                  <Select
                    value={formData.disease_id}
                    onChange={(e) => onChange({ disease_id: e.target.value })}
                    label="Disease"
                    disabled={isEditMode || diseases.length === 0}
                    sx={{
                      backgroundColor: "white",
                      "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                        borderColor: "#10B981",
                        borderWidth: 2,
                      },
                    }}
                  >
                    {diseases.length === 0 ? (
                      <MenuItem disabled>No diseases available</MenuItem>
                    ) : (
                      diseases.map((disease) => (
                        <MenuItem key={disease.id} value={disease.id}>
                          {disease.name}
                        </MenuItem>
                      ))
                    )}
                  </Select>
                </FormControl>
              </Box>

              <Box sx={{ flex: "1 1 calc(33.333% - 20px)", minWidth: "200px" }}>
                <FormControl fullWidth required>
                  <InputLabel>Modality</InputLabel>
                  <Select
                    value={formData.modality}
                    onChange={(e) => onChange({ modality: e.target.value })}
                    label="Modality"
                    disabled={isEditMode}
                    sx={{
                      backgroundColor: "white",
                      "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                        borderColor: "#10B981",
                        borderWidth: 2,
                      },
                    }}
                  >
                    {MODALITY_OPTIONS.map((mod) => (
                      <MenuItem key={mod} value={mod}>
                        {mod}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Box>

              <Box sx={{ flex: "1 1 calc(33.333% - 20px)", minWidth: "200px" }}>
                <TextField
                  fullWidth
                  label="Authors"
                  value={formData.authors}
                  onChange={(e) => onChange({ authors: e.target.value })}
                  placeholder="e.g., Dr. John Doe, Jane Smith"
                  helperText="Model creators or research team"
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      backgroundColor: "white",
                      "&.Mui-focused fieldset": { borderColor: "#10B981", borderWidth: 2 },
                    },
                    "& .MuiInputLabel-root.Mui-focused": { color: "#10B981", fontWeight: 600 },
                  }}
                />
              </Box>
            </Box>
          </Grid>

          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Description"
              value={formData.description}
              onChange={(e) => onChange({ description: e.target.value })}
              multiline
              rows={3}
              placeholder="Describe the classifier, its purpose, key characteristics, and use cases..."
              helperText="Provide a clear description to help users understand this classifier"
              sx={{
                "& .MuiOutlinedInput-root": {
                  backgroundColor: "white",
                  "&.Mui-focused fieldset": { borderColor: "#10B981", borderWidth: 2 },
                },
                "& .MuiInputLabel-root.Mui-focused": { color: "#10B981", fontWeight: 600 },
              }}
            />
          </Grid>
        </Grid>
      </Paper>

      {/* Model Details Section */}
      <Paper 
        elevation={0} 
        sx={{ 
          p: 3, 
          mb: 3, 
          backgroundColor: "#F9FAFB",
          border: "1px solid #E5E7EB",
          borderRadius: 2
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
          <Science sx={{ color: "#10B981", mr: 1 }} />
          <Typography variant="h6" sx={{ color: "#2C3E50", fontWeight: 600 }}>
            Model Details
          </Typography>
          <Chip 
            label="Optional" 
            size="small" 
            sx={{ 
              ml: 2, 
              backgroundColor: "#DBEAFE", 
              color: "#1E40AF",
              fontWeight: 600,
              fontSize: "0.7rem"
            }} 
          />
        </Box>

        <Grid container spacing={2.5}>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Model Type"
              value={formData.model_type}
              onChange={(e) => onChange({ model_type: e.target.value })}
              placeholder="e.g., RandomForest, CNN, ResNet50"
              helperText="The algorithm or architecture used"
              sx={{
                "& .MuiOutlinedInput-root": {
                  backgroundColor: "white",
                  "&.Mui-focused fieldset": { borderColor: "#10B981", borderWidth: 2 },
                },
                "& .MuiInputLabel-root.Mui-focused": { color: "#10B981", fontWeight: 600 },
              }}
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Version"
              value={formData.version}
              onChange={(e) => onChange({ version: e.target.value })}
              placeholder="e.g., v1.0.0, 2024.1"
              helperText="Model version for tracking"
              sx={{
                "& .MuiOutlinedInput-root": {
                  backgroundColor: "white",
                  "&.Mui-focused fieldset": { borderColor: "#10B981", borderWidth: 2 },
                },
                "& .MuiInputLabel-root.Mui-focused": { color: "#10B981", fontWeight: 600 },
              }}
            />
          </Grid>
        </Grid>
      </Paper>

      {/* References Section */}
      <Paper 
        elevation={0} 
        sx={{ 
          p: 3, 
          mb: 3, 
          backgroundColor: "#F9FAFB",
          border: "1px solid #E5E7EB",
          borderRadius: 2
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
          <LinkIcon sx={{ color: "#10B981", mr: 1 }} />
          <Typography variant="h6" sx={{ color: "#2C3E50", fontWeight: 600 }}>
            References & Documentation
          </Typography>
          <Chip 
            label="Optional" 
            size="small" 
            sx={{ 
              ml: 2, 
              backgroundColor: "#DBEAFE", 
              color: "#1E40AF",
              fontWeight: 600,
              fontSize: "0.7rem"
            }} 
          />
        </Box>

        <Grid container spacing={2.5}>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Blog Link"
              value={formData.blog_link}
              onChange={(e) => onChange({ blog_link: e.target.value })}
              placeholder="https://example.com/blog/classifier-details"
              helperText="Link to blog post or documentation"
              sx={{
                "& .MuiOutlinedInput-root": {
                  backgroundColor: "white",
                  "&.Mui-focused fieldset": { borderColor: "#10B981", borderWidth: 2 },
                },
                "& .MuiInputLabel-root.Mui-focused": { color: "#10B981", fontWeight: 600 },
              }}
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Paper Link"
              value={formData.paper_link}
              onChange={(e) => onChange({ paper_link: e.target.value })}
              placeholder="https://arxiv.org/abs/..."
              helperText="Link to research paper or publication"
              sx={{
                "& .MuiOutlinedInput-root": {
                  backgroundColor: "white",
                  "&.Mui-focused fieldset": { borderColor: "#10B981", borderWidth: 2 },
                },
                "& .MuiInputLabel-root.Mui-focused": { color: "#10B981", fontWeight: 600 },
              }}
            />
          </Grid>
        </Grid>
      </Paper>

      <Divider sx={{ my: 3 }} />

      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <Typography variant="caption" sx={{ color: "#6B7280" }}>
          * Required fields must be filled to proceed
        </Typography>
        <Box sx={{ display: "flex", gap: 2 }}>
          <Button 
            onClick={onCancel} 
            variant="outlined"
            sx={{ 
              color: "#6B7280",
              borderColor: "#D1D5DB",
              "&:hover": {
                borderColor: "#9CA3AF",
                backgroundColor: "#F9FAFB"
              }
            }}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={onNext}
            disabled={!canProceed}
            sx={{
              backgroundColor: "#10B981",
              "&:hover": { backgroundColor: "#059669" },
              "&:disabled": { 
                backgroundColor: "#D1D5DB",
                color: "#9CA3AF"
              },
              px: 4,
              fontWeight: 600
            }}
          >
            Submit & Next
          </Button>
        </Box>
      </Box>
    </Box>
  );
}

export default BasicInfoStep;
