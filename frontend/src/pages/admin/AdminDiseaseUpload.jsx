import { useState, useEffect } from "react";
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Chip,
  Alert,
  CircularProgress,
  Tabs,
  Tab,
  Grid,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Tooltip,
  Switch,
  FormControlLabel,
} from "@mui/material";
import {
  Add,
  Edit,
  Delete,
  Upload,
  CloudUpload,
  Description,
  CheckCircle,
  Cancel,
  Info,
  Refresh,
} from "@mui/icons-material";
import AdminNavbar from "../../components/admin/AdminNavbar";
import { diagnosisAPI } from "../../services/diagnosisAPI";

function TabPanel({ children, value, index }) {
  return (
    <div hidden={value !== index}>
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

function AdminDiseaseUpload() {
  const [tabValue, setTabValue] = useState(0);
  const [diseases, setDiseases] = useState([]);
  const [classifiers, setClassifiers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Disease dialog state
  const [diseaseDialogOpen, setDiseaseDialogOpen] = useState(false);
  const [editingDisease, setEditingDisease] = useState(null);
  const [diseaseForm, setDiseaseForm] = useState({
    name: "",
    description: "",
    category: "",
    available_modalities: [],
    required_features: {},
  });

  // Classifier dialog state
  const [classifierDialogOpen, setClassifierDialogOpen] = useState(false);
  const [editingClassifier, setEditingClassifier] = useState(null);
  const [classifierForm, setClassifierForm] = useState({
    name: "",
    description: "",
    disease_id: "",
    modality: "",
    model_type: "",
    accuracy: "",
    precision: "",
    recall: "",
    f1_score: "",
    training_samples: "",
    version: "",
  });
  const [modelFile, setModelFile] = useState(null);

  const modalityOptions = ["MRI", "CT", "X-Ray", "Tabular"];

  // Load data
  useEffect(() => {
    loadDiseases();
    loadClassifiers();
  }, []);

  const loadDiseases = async () => {
    try {
      setLoading(true);
      const response = await diagnosisAPI.getDiseases();
      console.log("Diseases API response:", response);

      // Handle different possible response structures
      let diseasesData = [];
      if (response.data?.data) {
        diseasesData = response.data.data;
      } else if (response.data) {
        diseasesData = Array.isArray(response.data)
          ? response.data
          : [response.data];
      } else if (Array.isArray(response)) {
        diseasesData = response;
      }

      console.log("Parsed diseases:", diseasesData);
      setDiseases(diseasesData);
      setError(null);
    } catch (err) {
      setError("Failed to load diseases");
      console.error("Failed to load diseases:", err);
    } finally {
      setLoading(false);
    }
  };

  const loadClassifiers = async () => {
    try {
      const response = await diagnosisAPI.adminListClassifiers({
        include_inactive: true,
      });
      console.log("Classifiers API response:", response);
      setClassifiers(Array.isArray(response) ? response : []);
    } catch (err) {
      console.error("Failed to load classifiers:", err);
    }
  };

  // Disease handlers
  const handleDiseaseDialogOpen = (disease = null) => {
    if (disease) {
      setEditingDisease(disease);
      setDiseaseForm({
        name: disease.name || "",
        description: disease.description || "",
        category: disease.category || "",
        available_modalities: disease.available_modalities || [],
        required_features: disease.required_features || {},
      });
    } else {
      setEditingDisease(null);
      setDiseaseForm({
        name: "",
        description: "",
        category: "",
        available_modalities: [],
        required_features: {},
      });
    }
    setDiseaseDialogOpen(true);
  };

  const handleDiseaseSubmit = async () => {
    try {
      setLoading(true);
      if (editingDisease) {
        await diagnosisAPI.adminUpdateDisease(editingDisease.id, diseaseForm);
        alert("Disease updated successfully");
      } else {
        await diagnosisAPI.adminCreateDisease(diseaseForm);
        alert("Disease created successfully");
      }
      setDiseaseDialogOpen(false);
      await loadDiseases(); // Wait for reload to ensure data is fresh
    } catch (err) {
      alert(err.response?.data?.detail || "Failed to save disease");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteDisease = async (diseaseId, hardDelete = false) => {
    if (
      !window.confirm(
        `Are you sure you want to ${
          hardDelete ? "permanently delete" : "deactivate"
        } this disease?`
      )
    ) {
      return;
    }
    try {
      await diagnosisAPI.adminDeleteDisease(diseaseId, hardDelete);
      alert(hardDelete ? "Disease deleted permanently" : "Disease deactivated");
      loadDiseases();
    } catch (err) {
      alert("Failed to delete disease");
    }
  };

  // Classifier handlers
  const handleClassifierDialogOpen = (classifier = null) => {
    if (classifier) {
      setEditingClassifier(classifier);
      setClassifierForm({
        name: classifier.name || "",
        description: classifier.description || "",
        disease_id: classifier.disease_id || "",
        modality: classifier.modality || "",
        model_type: classifier.model_type || "",
        accuracy: classifier.accuracy || "",
        precision: classifier.precision || "",
        recall: classifier.recall || "",
        f1_score: classifier.f1_score || "",
        training_samples: classifier.training_samples || "",
        version: classifier.version || "",
      });
    } else {
      setEditingClassifier(null);
      setClassifierForm({
        name: "",
        description: "",
        disease_id: "",
        modality: "",
        model_type: "",
        accuracy: "",
        precision: "",
        recall: "",
        f1_score: "",
        training_samples: "",
        version: "",
      });
    }
    setModelFile(null);
    setClassifierDialogOpen(true);
  };

  const handleClassifierSubmit = async () => {
    try {
      setLoading(true);

      const formData = new FormData();
      Object.keys(classifierForm).forEach((key) => {
        if (classifierForm[key] !== "" && classifierForm[key] !== null) {
          formData.append(key, classifierForm[key]);
        }
      });

      if (modelFile) {
        formData.append("model_file", modelFile);
      } else if (!editingClassifier) {
        alert("Model file is required for new classifiers");
        setLoading(false);
        return;
      }

      if (editingClassifier) {
        await diagnosisAPI.adminUpdateClassifier(
          editingClassifier.id,
          formData
        );
        alert("Classifier updated successfully");
      } else {
        await diagnosisAPI.adminCreateClassifier(formData);
        alert("Classifier created successfully");
      }
      setClassifierDialogOpen(false);
      loadClassifiers();
    } catch (err) {
      alert(err.response?.data?.detail || "Failed to save classifier");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteClassifier = async (classifierId, hardDelete = false) => {
    if (
      !window.confirm(
        `Are you sure you want to ${
          hardDelete ? "permanently delete" : "deactivate"
        } this classifier?`
      )
    ) {
      return;
    }
    try {
      await diagnosisAPI.adminDeleteClassifier(classifierId, hardDelete);
      alert(
        hardDelete ? "Classifier deleted permanently" : "Classifier deactivated"
      );
      loadClassifiers();
    } catch (err) {
      alert("Failed to delete classifier");
    }
  };

  const handleModalityToggle = (modality) => {
    const current = diseaseForm.available_modalities || [];
    const updated = current.includes(modality)
      ? current.filter((m) => m !== modality)
      : [...current, modality];
    setDiseaseForm({ ...diseaseForm, available_modalities: updated });
  };

  return (
    <Box>
      <AdminNavbar />
      <Box sx={{ p: 3 }}>
        <Box mb={3}>
          <Box
            display="flex"
            justifyContent="space-between"
            alignItems="center"
          >
            <Box>
              <Typography variant="h4" gutterBottom>
                Disease & Classifier Management
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Upload and manage diseases and their ML classifiers
              </Typography>
            </Box>
            <Box display="flex" gap={1}>
              <Chip
                label={`${diseases.length} Diseases`}
                color="primary"
                size="small"
              />
              <Chip
                label={`${classifiers.length} Classifiers`}
                color="secondary"
                size="small"
              />
              <Tooltip title="Reload data">
                <IconButton
                  onClick={() => {
                    loadDiseases();
                    loadClassifiers();
                  }}
                  size="small"
                  color="primary"
                >
                  <Refresh />
                </IconButton>
              </Tooltip>
            </Box>
          </Box>
        </Box>

        <Card>
          <Tabs
            value={tabValue}
            onChange={(e, newValue) => setTabValue(newValue)}
            sx={{ borderBottom: 1, borderColor: "divider" }}
          >
            <Tab label="Diseases" icon={<Description />} iconPosition="start" />
            <Tab
              label="Classifiers"
              icon={<CloudUpload />}
              iconPosition="start"
            />
          </Tabs>

          <TabPanel value={tabValue} index={0}>
            <Box mb={2}>
              <Button
                variant="contained"
                startIcon={<Add />}
                onClick={() => handleDiseaseDialogOpen()}
              >
                Add New Disease
              </Button>
            </Box>

            {loading ? (
              <Box display="flex" justifyContent="center" p={3}>
                <CircularProgress />
              </Box>
            ) : error ? (
              <Alert severity="error">{error}</Alert>
            ) : (
              <TableContainer component={Paper}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Name</TableCell>
                      <TableCell>Category</TableCell>
                      <TableCell>Modalities</TableCell>
                      <TableCell>Status</TableCell>
                      <TableCell>Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {diseases.map((disease) => (
                      <TableRow key={disease.id}>
                        <TableCell>
                          <Typography variant="subtitle2">
                            {disease.name}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {disease.description}
                          </Typography>
                        </TableCell>
                        <TableCell>{disease.category || "N/A"}</TableCell>
                        <TableCell>
                          <Box display="flex" gap={0.5} flexWrap="wrap">
                            {(disease.available_modalities || []).map((mod) => (
                              <Chip key={mod} label={mod} size="small" />
                            ))}
                          </Box>
                        </TableCell>
                        <TableCell>
                          {disease.is_active ? (
                            <Chip
                              icon={<CheckCircle />}
                              label="Active"
                              color="success"
                              size="small"
                            />
                          ) : (
                            <Chip
                              icon={<Cancel />}
                              label="Inactive"
                              color="default"
                              size="small"
                            />
                          )}
                        </TableCell>
                        <TableCell>
                          <Tooltip title="Edit">
                            <IconButton
                              size="small"
                              onClick={() => handleDiseaseDialogOpen(disease)}
                            >
                              <Edit />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Deactivate">
                            <IconButton
                              size="small"
                              onClick={() =>
                                handleDeleteDisease(disease.id, false)
                              }
                            >
                              <Cancel />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Delete Permanently">
                            <IconButton
                              size="small"
                              color="error"
                              onClick={() =>
                                handleDeleteDisease(disease.id, true)
                              }
                            >
                              <Delete />
                            </IconButton>
                          </Tooltip>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </TabPanel>

          <TabPanel value={tabValue} index={1}>
            <Box mb={2}>
              <Button
                variant="contained"
                startIcon={<Upload />}
                onClick={() => handleClassifierDialogOpen()}
              >
                Upload New Classifier
              </Button>
            </Box>

            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Name</TableCell>
                    <TableCell>Disease</TableCell>
                    <TableCell>Modality</TableCell>
                    <TableCell>Performance</TableCell>
                    <TableCell>Version</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {classifiers.map((classifier) => (
                    <TableRow key={classifier.id}>
                      <TableCell>
                        <Typography variant="subtitle2">
                          {classifier.name}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {classifier.model_type}
                        </Typography>
                      </TableCell>
                      <TableCell>{classifier.disease_name || "N/A"}</TableCell>
                      <TableCell>
                        <Chip label={classifier.modality} size="small" />
                      </TableCell>
                      <TableCell>
                        <Typography variant="caption" display="block">
                          Acc: {(classifier.accuracy * 100).toFixed(1)}%
                        </Typography>
                        <Typography variant="caption" display="block">
                          F1: {(classifier.f1_score * 100).toFixed(1)}%
                        </Typography>
                      </TableCell>
                      <TableCell>{classifier.version || "N/A"}</TableCell>
                      <TableCell>
                        {classifier.is_active ? (
                          <Chip
                            icon={<CheckCircle />}
                            label="Active"
                            color="success"
                            size="small"
                          />
                        ) : (
                          <Chip
                            icon={<Cancel />}
                            label="Inactive"
                            color="default"
                            size="small"
                          />
                        )}
                      </TableCell>
                      <TableCell>
                        <Tooltip title="Edit">
                          <IconButton
                            size="small"
                            onClick={() =>
                              handleClassifierDialogOpen(classifier)
                            }
                          >
                            <Edit />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Deactivate">
                          <IconButton
                            size="small"
                            onClick={() =>
                              handleDeleteClassifier(classifier.id, false)
                            }
                          >
                            <Cancel />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Delete Permanently">
                          <IconButton
                            size="small"
                            color="error"
                            onClick={() =>
                              handleDeleteClassifier(classifier.id, true)
                            }
                          >
                            <Delete />
                          </IconButton>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </TabPanel>
        </Card>

        {/* Disease Dialog */}
        <Dialog
          open={diseaseDialogOpen}
          onClose={() => setDiseaseDialogOpen(false)}
          maxWidth="md"
          fullWidth
        >
          <DialogTitle>
            {editingDisease ? "Edit Disease" : "Add New Disease"}
          </DialogTitle>
          <DialogContent>
            <Box sx={{ mt: 2 }}>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Disease Name"
                    value={diseaseForm.name}
                    onChange={(e) =>
                      setDiseaseForm({ ...diseaseForm, name: e.target.value })
                    }
                    required
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Description"
                    value={diseaseForm.description}
                    onChange={(e) =>
                      setDiseaseForm({
                        ...diseaseForm,
                        description: e.target.value,
                      })
                    }
                    multiline
                    rows={3}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Category"
                    value={diseaseForm.category}
                    onChange={(e) =>
                      setDiseaseForm({
                        ...diseaseForm,
                        category: e.target.value,
                      })
                    }
                  />
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="subtitle2" gutterBottom>
                    Available Modalities
                  </Typography>
                  <Box display="flex" gap={1} flexWrap="wrap">
                    {modalityOptions.map((modality) => (
                      <Chip
                        key={modality}
                        label={modality}
                        onClick={() => handleModalityToggle(modality)}
                        color={
                          (diseaseForm.available_modalities || []).includes(
                            modality
                          )
                            ? "primary"
                            : "default"
                        }
                        variant={
                          (diseaseForm.available_modalities || []).includes(
                            modality
                          )
                            ? "filled"
                            : "outlined"
                        }
                      />
                    ))}
                  </Box>
                </Grid>
              </Grid>
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setDiseaseDialogOpen(false)}>Cancel</Button>
            <Button
              onClick={handleDiseaseSubmit}
              variant="contained"
              disabled={!diseaseForm.name || loading}
            >
              {loading ? <CircularProgress size={24} /> : "Save"}
            </Button>
          </DialogActions>
        </Dialog>

        {/* Classifier Dialog */}
        <Dialog
          open={classifierDialogOpen}
          onClose={() => setClassifierDialogOpen(false)}
          maxWidth="md"
          fullWidth
        >
          <DialogTitle>
            {editingClassifier ? "Edit Classifier" : "Upload New Classifier"}
          </DialogTitle>
          <DialogContent>
            <Box sx={{ mt: 2 }}>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Classifier Name"
                    value={classifierForm.name}
                    onChange={(e) =>
                      setClassifierForm({
                        ...classifierForm,
                        name: e.target.value,
                      })
                    }
                    required
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth required>
                    <InputLabel>Disease</InputLabel>
                    <Select
                      value={classifierForm.disease_id}
                      onChange={(e) =>
                        setClassifierForm({
                          ...classifierForm,
                          disease_id: e.target.value,
                        })
                      }
                      label="Disease"
                      disabled={diseases.length === 0}
                    >
                      {diseases.length === 0 ? (
                        <MenuItem disabled>
                          No diseases available. Please create a disease first.
                        </MenuItem>
                      ) : (
                        diseases.map((disease) => (
                          <MenuItem key={disease.id} value={disease.id}>
                            {disease.name}
                          </MenuItem>
                        ))
                      )}
                    </Select>
                  </FormControl>
                  {diseases.length === 0 && (
                    <Typography
                      variant="caption"
                      color="error"
                      sx={{ mt: 0.5, display: "block" }}
                    >
                      Please create at least one disease before adding
                      classifiers.
                    </Typography>
                  )}
                </Grid>
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth required>
                    <InputLabel>Modality</InputLabel>
                    <Select
                      value={classifierForm.modality}
                      onChange={(e) =>
                        setClassifierForm({
                          ...classifierForm,
                          modality: e.target.value,
                        })
                      }
                      label="Modality"
                    >
                      {modalityOptions.map((mod) => (
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
                    value={classifierForm.model_type}
                    onChange={(e) =>
                      setClassifierForm({
                        ...classifierForm,
                        model_type: e.target.value,
                      })
                    }
                    placeholder="e.g., RandomForest, CNN"
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Description"
                    value={classifierForm.description}
                    onChange={(e) =>
                      setClassifierForm({
                        ...classifierForm,
                        description: e.target.value,
                      })
                    }
                    multiline
                    rows={2}
                  />
                </Grid>
                <Grid item xs={12} sm={3}>
                  <TextField
                    fullWidth
                    label="Accuracy"
                    type="number"
                    inputProps={{ step: 0.01, min: 0, max: 1 }}
                    value={classifierForm.accuracy}
                    onChange={(e) =>
                      setClassifierForm({
                        ...classifierForm,
                        accuracy: e.target.value,
                      })
                    }
                  />
                </Grid>
                <Grid item xs={12} sm={3}>
                  <TextField
                    fullWidth
                    label="Precision"
                    type="number"
                    inputProps={{ step: 0.01, min: 0, max: 1 }}
                    value={classifierForm.precision}
                    onChange={(e) =>
                      setClassifierForm({
                        ...classifierForm,
                        precision: e.target.value,
                      })
                    }
                  />
                </Grid>
                <Grid item xs={12} sm={3}>
                  <TextField
                    fullWidth
                    label="Recall"
                    type="number"
                    inputProps={{ step: 0.01, min: 0, max: 1 }}
                    value={classifierForm.recall}
                    onChange={(e) =>
                      setClassifierForm({
                        ...classifierForm,
                        recall: e.target.value,
                      })
                    }
                  />
                </Grid>
                <Grid item xs={12} sm={3}>
                  <TextField
                    fullWidth
                    label="F1 Score"
                    type="number"
                    inputProps={{ step: 0.01, min: 0, max: 1 }}
                    value={classifierForm.f1_score}
                    onChange={(e) =>
                      setClassifierForm({
                        ...classifierForm,
                        f1_score: e.target.value,
                      })
                    }
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Training Samples"
                    type="number"
                    value={classifierForm.training_samples}
                    onChange={(e) =>
                      setClassifierForm({
                        ...classifierForm,
                        training_samples: e.target.value,
                      })
                    }
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Version"
                    value={classifierForm.version}
                    onChange={(e) =>
                      setClassifierForm({
                        ...classifierForm,
                        version: e.target.value,
                      })
                    }
                    placeholder="e.g., v1.0.0"
                  />
                </Grid>
                <Grid item xs={12}>
                  <Box
                    sx={{
                      border: "2px dashed",
                      borderColor: "divider",
                      borderRadius: 2,
                      p: 3,
                      textAlign: "center",
                      bgcolor: "background.default",
                    }}
                  >
                    <input
                      accept=".pkl"
                      style={{ display: "none" }}
                      id="model-file-upload"
                      type="file"
                      onChange={(e) => setModelFile(e.target.files[0])}
                    />
                    <label htmlFor="model-file-upload">
                      <Button
                        variant="outlined"
                        component="span"
                        startIcon={<CloudUpload />}
                      >
                        {editingClassifier
                          ? "Upload New Model File (Optional)"
                          : "Upload Model File (.pkl)"}
                      </Button>
                    </label>
                    {modelFile && (
                      <Typography variant="body2" sx={{ mt: 1 }}>
                        Selected: {modelFile.name}
                      </Typography>
                    )}
                    {editingClassifier && !modelFile && (
                      <Typography
                        variant="caption"
                        color="text.secondary"
                        sx={{ mt: 1 }}
                      >
                        Leave empty to keep existing model file
                      </Typography>
                    )}
                  </Box>
                </Grid>
              </Grid>
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setClassifierDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleClassifierSubmit}
              variant="contained"
              disabled={
                !classifierForm.name ||
                !classifierForm.disease_id ||
                !classifierForm.modality ||
                (!editingClassifier && !modelFile) ||
                loading
              }
            >
              {loading ? <CircularProgress size={24} /> : "Save"}
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </Box>
  );
}

export default AdminDiseaseUpload;
