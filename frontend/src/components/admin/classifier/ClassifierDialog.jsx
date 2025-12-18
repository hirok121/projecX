import {
  Box,
  Button,
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
import { CloudUpload } from "@mui/icons-material";
import { MODALITY_OPTIONS } from "../../../const/disease";

function ClassifierDialog({
  open,
  onClose,
  classifier,
  formData,
  onChange,
  modelFiles,
  onFileChange,
  onSubmit,
  loading,
  diseases,
}) {
  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle
        sx={{
          backgroundColor: "#ECFDF5",
          color: "#10B981",
          fontWeight: 600,
        }}
      >
        {classifier ? "Edit Classifier" : "Upload New Classifier"}
      </DialogTitle>

      <DialogContent sx={{ mt: 2 }}>
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Classifier Name"
              value={formData.name}
              onChange={(e) => onChange({ ...formData, name: e.target.value })}
              required
              sx={{
                "& .MuiOutlinedInput-root": {
                  "&.Mui-focused fieldset": { borderColor: "#10B981" },
                },
                "& .MuiInputLabel-root.Mui-focused": { color: "#10B981" },
              }}
            />
          </Grid>

          <Grid item xs={12}>
            <FormControl fullWidth required>
              <InputLabel>Disease</InputLabel>
              <Select
                value={formData.disease_id}
                onChange={(e) =>
                  onChange({ ...formData, disease_id: e.target.value })
                }
                label="Disease"
                disabled={diseases.length === 0}
                sx={{
                  "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                    borderColor: "#10B981",
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
          </Grid>

          <Grid item xs={12} sm={6}>
            <FormControl fullWidth required>
              <InputLabel>Modality</InputLabel>
              <Select
                value={formData.modality}
                onChange={(e) =>
                  onChange({ ...formData, modality: e.target.value })
                }
                label="Modality"
                sx={{
                  "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                    borderColor: "#10B981",
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
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Model Type"
              value={formData.model_type}
              onChange={(e) =>
                onChange({ ...formData, model_type: e.target.value })
              }
              placeholder="e.g., RandomForest"
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
              rows={2}
              sx={{
                "& .MuiOutlinedInput-root": {
                  "&.Mui-focused fieldset": { borderColor: "#10B981" },
                },
                "& .MuiInputLabel-root.Mui-focused": { color: "#10B981" },
              }}
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Accuracy (0-1)"
              type="number"
              inputProps={{ step: 0.01, min: 0, max: 1 }}
              value={formData.accuracy}
              onChange={(e) =>
                onChange({ ...formData, accuracy: e.target.value })
              }
              sx={{
                "& .MuiOutlinedInput-root": {
                  "&.Mui-focused fieldset": { borderColor: "#10B981" },
                },
                "& .MuiInputLabel-root.Mui-focused": { color: "#10B981" },
              }}
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Version"
              value={formData.version}
              onChange={(e) =>
                onChange({ ...formData, version: e.target.value })
              }
              placeholder="e.g., v1.0.0"
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
              label="Required Features"
              value={
                Array.isArray(formData.required_features)
                  ? formData.required_features.join(", ")
                  : ""
              }
              onChange={(e) => {
                const featuresString = e.target.value;
                const featuresArray = featuresString
                  .split(",")
                  .map((f) => f.trim())
                  .filter((f) => f.length > 0);
                onChange({
                  ...formData,
                  required_features: featuresArray,
                });
              }}
              placeholder="Enter feature names separated by commas (e.g., age, gender, bmi)"
              multiline
              rows={2}
              helperText="List of features that the model requires for prediction"
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
                border: "2px dashed #10B981",
                borderRadius: 2,
                p: 3,
                backgroundColor: "#ECFDF5",
              }}
            >
              <Typography
                variant="subtitle2"
                sx={{ mb: 2, fontWeight: 600, color: "#10B981" }}
              >
                Model Files Upload (All 5 files required)
              </Typography>

              {["features", "scaler", "imputer", "model", "class"].map(
                (fileType) => (
                  <Box key={fileType} sx={{ mb: 2 }}>
                    <input
                      accept=".pkl"
                      style={{ display: "none" }}
                      id={`${fileType}-file-upload`}
                      type="file"
                      onChange={(e) =>
                        onFileChange(
                          `${fileType}_file`,
                          e.target.files[0]
                        )
                      }
                    />
                    <label htmlFor={`${fileType}-file-upload`}>
                      <Button
                        variant="outlined"
                        component="span"
                        size="small"
                        startIcon={<CloudUpload />}
                        sx={{
                          borderColor: "#10B981",
                          color: "#10B981",
                          "&:hover": {
                            borderColor: "#059669",
                            backgroundColor: "white",
                          },
                          width: "100%",
                          justifyContent: "flex-start",
                        }}
                      >
                        {fileType}.pkl
                        {modelFiles[`${fileType}_file`] && " ✓"}
                      </Button>
                    </label>
                    {modelFiles[`${fileType}_file`] && (
                      <Typography
                        variant="caption"
                        sx={{ ml: 1, color: "#6B7280" }}
                      >
                        {modelFiles[`${fileType}_file`].name}
                      </Typography>
                    )}
                  </Box>
                )
              )}

              {classifier && (
                <Typography
                  variant="caption"
                  color="text.secondary"
                  sx={{ mt: 2, display: "block", textAlign: "center" }}
                >
                  Leave empty to keep existing model files
                </Typography>
              )}
            </Box>
          </Grid>
        </Grid>
      </DialogContent>

      <DialogActions sx={{ p: 2 }}>
        <Button onClick={onClose}>Cancel</Button>
        <Button
          onClick={onSubmit}
          variant="contained"
          disabled={
            !formData.name ||
            !formData.disease_id ||
            !formData.modality ||
            loading
          }
          sx={{
            backgroundColor: "#10B981",
            "&:hover": { backgroundColor: "#059669" },
          }}
        >
          {loading ? <CircularProgress size={24} /> : "Save"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default ClassifierDialog;
