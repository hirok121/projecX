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
  Container,
  Grid,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Tooltip,
  InputAdornment,
  TablePagination,
} from "@mui/material";
import {
  Add,
  Edit,
  Delete,
  Upload,
  CloudUpload,
  CheckCircle,
  Cancel,
  Refresh,
  Search,
  FilterList,
} from "@mui/icons-material";
import AdminNavbar from "../../components/admin/AdminNavbar";
import { diseaseAPI } from "../../services/diseaseAPI";
import { classifierAPI } from "../../services/classifierAPI";
import { MODALITY_OPTIONS, CATEGORY_OPTIONS } from "../../const/disease";

function AdminDiseaseUpload() {
  const [viewMode, setViewMode] = useState("diseases"); // 'diseases' or 'classifiers'
  const [diseases, setDiseases] = useState([]);
  const [classifiers, setClassifiers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("info");

  // Search and filter states
  const [diseaseSearch, setDiseaseSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [classifierSearch, setClassifierSearch] = useState("");
  const [diseaseFilter, setDiseaseFilter] = useState("all");
  const [modalityFilter, setModalityFilter] = useState("all");

  // Pagination
  const [diseasePage, setDiseasePage] = useState(0);
  const [diseaseRowsPerPage, setDiseaseRowsPerPage] = useState(10);
  const [classifierPage, setClassifierPage] = useState(0);
  const [classifierRowsPerPage, setClassifierRowsPerPage] = useState(10);

  // Disease dialog state
  const [diseaseDialogOpen, setDiseaseDialogOpen] = useState(false);
  const [editingDisease, setEditingDisease] = useState(null);
  const [diseaseForm, setDiseaseForm] = useState({
    name: "",
    description: "",
    category: "",
    available_modalities: [],
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
    version: "",
    required_features: [],
  });
  const [modelFiles, setModelFiles] = useState({
    features_file: null,
    scaler_file: null,
    imputer_file: null,
    model_file: null,
    class_file: null,
  });

  // Load data
  useEffect(() => {
    loadDiseases();
    loadClassifiers();
  }, []);

  const loadDiseases = async () => {
    try {
      setLoading(true);
      const data = await diseaseAPI.getDiseases();
      // diseaseAPI.getDiseases() already returns response.data
      const diseasesData = Array.isArray(data) ? data : [];
      setDiseases(diseasesData);
      setMessage("");
    } catch (err) {
      setMessage("Failed to load diseases");
      setMessageType("error");
      console.error("Failed to load diseases:", err);
    } finally {
      setLoading(false);
    }
  };

  const loadClassifiers = async () => {
    try {
      const data = await classifierAPI.getClassifiers();
      // classifierAPI.getClassifiers() already returns response.data with disease_name
      const classifiersData = Array.isArray(data) ? data : [];
      setClassifiers(classifiersData);
    } catch (err) {
      console.error("Failed to load classifiers:", err);
    }
  };

  // Filter diseases
  const filteredDiseases = diseases.filter((disease) => {
    const matchesSearch = disease.name
      ?.toLowerCase()
      .includes(diseaseSearch.toLowerCase());
    const matchesCategory =
      categoryFilter === "all" || disease.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  // Filter classifiers
  const filteredClassifiers = classifiers.filter((classifier) => {
    const matchesSearch = classifier.name
      ?.toLowerCase()
      .includes(classifierSearch.toLowerCase());
    const matchesDisease =
      diseaseFilter === "all" ||
      classifier.disease_id === parseInt(diseaseFilter);
    const matchesModality =
      modalityFilter === "all" || classifier.modality === modalityFilter;
    return matchesSearch && matchesDisease && matchesModality;
  });

  // Disease handlers
  const handleDiseaseDialogOpen = (disease = null) => {
    if (disease) {
      setEditingDisease(disease);
      setDiseaseForm({
        name: disease.name || "",
        description: disease.description || "",
        category: disease.category || "",
        available_modalities: disease.available_modalities || [],
      });
    } else {
      setEditingDisease(null);
      setDiseaseForm({
        name: "",
        description: "",
        category: "",
        available_modalities: [],
      });
    }
    setDiseaseDialogOpen(true);
  };

  const handleDiseaseSubmit = async () => {
    try {
      setLoading(true);
      if (editingDisease) {
        await diseaseAPI.updateDisease(editingDisease.id, diseaseForm);
        setMessage("Disease updated successfully");
      } else {
        await diseaseAPI.createDisease(diseaseForm);
        setMessage("Disease created successfully");
      }
      setMessageType("success");
      setDiseaseDialogOpen(false);
      await loadDiseases();
    } catch (err) {
      setMessage(err.response?.data?.detail || "Failed to save disease");
      setMessageType("error");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteDisease = async (diseaseId) => {
    if (
      !window.confirm(
        "Are you sure you want to delete this disease? This will also remove all associated classifiers and model files."
      )
    ) {
      return;
    }
    try {
      await diseaseAPI.deleteDisease(diseaseId);
      setMessage("Disease deleted successfully");
      setMessageType("success");
      loadDiseases();
    } catch (err) {
      setMessage("Failed to delete disease");
      setMessageType("error");
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
        version: classifier.version || "",
        required_features: classifier.required_features || [],
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
        version: "",
        required_features: [],
      });
    }
    setModelFiles({
      features_file: null,
      scaler_file: null,
      imputer_file: null,
      model_file: null,
      class_file: null,
    });
    setClassifierDialogOpen(true);
  };

  const handleClassifierSubmit = async () => {
    try {
      setLoading(true);

      // Prepare classifier data (non-file fields)
      const classifierData = {
        name: classifierForm.name,
        description: classifierForm.description,
        disease_id: parseInt(classifierForm.disease_id),
        modality: classifierForm.modality,
        model_type: classifierForm.model_type,
        accuracy: classifierForm.accuracy
          ? parseFloat(classifierForm.accuracy)
          : null,
        version: classifierForm.version,
        required_features: classifierForm.required_features,
      };

      if (editingClassifier) {
        // Update existing classifier
        await classifierAPI.updateClassifier(
          editingClassifier.id,
          classifierData
        );

        // Upload new files if provided
        const hasNewFiles = Object.values(modelFiles).some(
          (file) => file !== null
        );
        if (hasNewFiles) {
          const allFilesProvided = Object.values(modelFiles).every(
            (file) => file !== null
          );
          if (!allFilesProvided) {
            setMessage("All 5 model files must be provided together");
            setMessageType("error");
            setLoading(false);
            return;
          }
          await classifierAPI.uploadModelFiles(
            editingClassifier.id,
            modelFiles
          );
        }

        setMessage("Classifier updated successfully");
      } else {
        // Create new classifier
        const newClassifier = await classifierAPI.createClassifier(
          classifierData
        );

        // Upload model files if provided
        const hasFiles = Object.values(modelFiles).some(
          (file) => file !== null
        );
        if (hasFiles) {
          const allFilesProvided = Object.values(modelFiles).every(
            (file) => file !== null
          );
          if (!allFilesProvided) {
            setMessage("All 5 model files must be provided together");
            setMessageType("error");
            setLoading(false);
            return;
          }
          await classifierAPI.uploadModelFiles(newClassifier.id, modelFiles);
        }

        setMessage("Classifier created successfully");
      }

      setMessageType("success");
      setClassifierDialogOpen(false);
      loadClassifiers();
    } catch (err) {
      setMessage(err.response?.data?.detail || "Failed to save classifier");
      setMessageType("error");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteClassifier = async (classifierId) => {
    if (
      !window.confirm(
        "Are you sure you want to delete this classifier? This will also remove all associated model files."
      )
    ) {
      return;
    }
    try {
      await classifierAPI.deleteClassifier(classifierId);
      setMessage("Classifier deleted successfully");
      setMessageType("success");
      loadClassifiers();
    } catch (err) {
      setMessage("Failed to delete classifier");
      setMessageType("error");
    }
  };

  const handleModalityToggle = (modality) => {
    const current = diseaseForm.available_modalities || [];
    const updated = current.includes(modality)
      ? current.filter((m) => m !== modality)
      : [...current, modality];
    setDiseaseForm({ ...diseaseForm, available_modalities: updated });
  };

  if (loading && diseases.length === 0 && classifiers.length === 0) {
    return (
      <Box
        sx={{
          minHeight: "100vh",
          backgroundColor: "#F8F9FA",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <CircularProgress sx={{ color: "#10B981" }} />
      </Box>
    );
  }

  return (
    <Box sx={{ minHeight: "100vh", backgroundColor: "#F8F9FA" }}>
      <AdminNavbar />

      <Container maxWidth="xl" sx={{ py: 6 }}>
        {/* Header */}
        <Box sx={{ mb: 5 }}>
          <Typography
            variant="h3"
            sx={{ fontWeight: 600, color: "#2C3E50", mb: 1 }}
          >
            Disease & Classifier Management
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
            Manage diseases and their machine learning classifiers
          </Typography>

          <Box
            sx={{
              display: "flex",
              gap: 2,
              flexWrap: "wrap",
              alignItems: "center",
            }}
          >
            <Button
              variant={viewMode === "diseases" ? "contained" : "outlined"}
              onClick={() => setViewMode("diseases")}
              sx={{
                backgroundColor:
                  viewMode === "diseases" ? "#10B981" : "transparent",
                borderColor: "#10B981",
                color: viewMode === "diseases" ? "white" : "#10B981",
                "&:hover": {
                  backgroundColor:
                    viewMode === "diseases" ? "#059669" : "#ECFDF5",
                  borderColor: "#059669",
                },
              }}
            >
              Diseases ({diseases.length})
            </Button>
            <Button
              variant={viewMode === "classifiers" ? "contained" : "outlined"}
              onClick={() => setViewMode("classifiers")}
              sx={{
                backgroundColor:
                  viewMode === "classifiers" ? "#10B981" : "transparent",
                borderColor: "#10B981",
                color: viewMode === "classifiers" ? "white" : "#10B981",
                "&:hover": {
                  backgroundColor:
                    viewMode === "classifiers" ? "#059669" : "#ECFDF5",
                  borderColor: "#059669",
                },
              }}
            >
              Classifiers ({classifiers.length})
            </Button>
            <Box sx={{ flexGrow: 1 }} />
            <Button
              variant="outlined"
              startIcon={<Refresh />}
              onClick={() => {
                loadDiseases();
                loadClassifiers();
              }}
              sx={{
                borderColor: "#10B981",
                color: "#10B981",
                "&:hover": {
                  borderColor: "#059669",
                  backgroundColor: "#ECFDF5",
                },
              }}
            >
              Refresh
            </Button>
          </Box>
        </Box>

        {/* Messages */}
        {message && (
          <Alert
            severity={messageType}
            sx={{ mb: 4, borderRadius: 2 }}
            onClose={() => setMessage("")}
          >
            {message}
          </Alert>
        )}

        {/* Diseases View */}
        {viewMode === "diseases" && (
          <Box>
            {/* Search and Filters */}
            <Box sx={{ mb: 3 }}>
              {/* Search Bar */}
              <TextField
                fullWidth
                placeholder="Search diseases..."
                value={diseaseSearch}
                onChange={(e) => setDiseaseSearch(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Search sx={{ color: "#6B7280", fontSize: 28 }} />
                    </InputAdornment>
                  ),
                }}
                sx={{
                  mb: 3,
                  "& .MuiOutlinedInput-root": {
                    backgroundColor: "white",
                    fontSize: "1.1rem",
                    "& fieldset": {
                      borderColor: "#E5E7EB",
                    },
                    "&:hover fieldset": {
                      borderColor: "#10B981",
                    },
                    "&.Mui-focused fieldset": {
                      borderColor: "#10B981",
                      borderWidth: 2,
                    },
                  },
                  "& .MuiInputBase-input": {
                    py: 2,
                  },
                }}
              />

              {/* Category Chips */}
              <Box
                sx={{
                  display: "flex",
                  gap: 1.5,
                  flexWrap: "wrap",
                  alignItems: "center",
                }}
              >
                <Chip
                  label="All"
                  onClick={() => setCategoryFilter("all")}
                  sx={{
                    px: 1,
                    fontSize: "0.95rem",
                    fontWeight: 500,
                    backgroundColor:
                      categoryFilter === "all" ? "#10B981" : "#F3F4F6",
                    color: categoryFilter === "all" ? "white" : "#6B7280",
                    border: "none",
                    "&:hover": {
                      backgroundColor:
                        categoryFilter === "all" ? "#059669" : "#E5E7EB",
                    },
                  }}
                />
                {CATEGORY_OPTIONS.map((cat) => (
                  <Chip
                    key={cat}
                    label={cat}
                    onClick={() => setCategoryFilter(cat)}
                    sx={{
                      px: 1,
                      fontSize: "0.95rem",
                      fontWeight: 500,
                      backgroundColor:
                        categoryFilter === cat ? "#10B981" : "#F3F4F6",
                      color: categoryFilter === cat ? "white" : "#6B7280",
                      border: "none",
                      "&:hover": {
                        backgroundColor:
                          categoryFilter === cat ? "#059669" : "#E5E7EB",
                      },
                    }}
                  />
                ))}
                <Box sx={{ flexGrow: 1 }} />
                <Button
                  variant="contained"
                  startIcon={<Add />}
                  onClick={() => handleDiseaseDialogOpen()}
                  sx={{
                    backgroundColor: "#10B981",
                    px: 3,
                    "&:hover": { backgroundColor: "#059669" },
                  }}
                >
                  Add Disease
                </Button>
              </Box>
            </Box>

            {/* Diseases Table */}
            <Paper sx={{ borderRadius: 2 }}>
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow sx={{ backgroundColor: "#ECFDF5" }}>
                      <TableCell sx={{ fontWeight: 600 }}>
                        Disease Name
                      </TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>Category</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>Modalities</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>Status</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {filteredDiseases.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={5} align="center" sx={{ py: 8 }}>
                          <Typography variant="body1" color="text.secondary">
                            No diseases found
                          </Typography>
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredDiseases
                        .slice(
                          diseasePage * diseaseRowsPerPage,
                          diseasePage * diseaseRowsPerPage + diseaseRowsPerPage
                        )
                        .map((disease) => (
                          <TableRow
                            key={disease.id}
                            sx={{ "&:hover": { backgroundColor: "#F8F9FA" } }}
                          >
                            <TableCell>
                              <Typography variant="subtitle2">
                                {disease.name}
                              </Typography>
                              <Typography
                                variant="caption"
                                color="text.secondary"
                              >
                                {disease.description}
                              </Typography>
                            </TableCell>
                            <TableCell>
                              <Chip
                                label={disease.category || "N/A"}
                                size="small"
                                sx={{
                                  backgroundColor: "#ECFDF5",
                                  color: "#10B981",
                                }}
                              />
                            </TableCell>
                            <TableCell>
                              <Box display="flex" gap={0.5} flexWrap="wrap">
                                {(disease.available_modalities || []).map(
                                  (mod) => (
                                    <Chip
                                      key={mod}
                                      label={mod}
                                      size="small"
                                      variant="outlined"
                                    />
                                  )
                                )}
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
                                  onClick={() =>
                                    handleDiseaseDialogOpen(disease)
                                  }
                                  sx={{ color: "#10B981" }}
                                >
                                  <Edit fontSize="small" />
                                </IconButton>
                              </Tooltip>
                              <Tooltip title="Deactivate">
                                <IconButton
                                  size="small"
                                  onClick={() =>
                                    handleDeleteDisease(disease.id, false)
                                  }
                                >
                                  <Cancel fontSize="small" />
                                </IconButton>
                              </Tooltip>
                              <Tooltip title="Delete">
                                <IconButton
                                  size="small"
                                  color="error"
                                  onClick={() =>
                                    handleDeleteDisease(disease.id, true)
                                  }
                                >
                                  <Delete fontSize="small" />
                                </IconButton>
                              </Tooltip>
                            </TableCell>
                          </TableRow>
                        ))
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
              <TablePagination
                rowsPerPageOptions={[5, 10, 25]}
                component="div"
                count={filteredDiseases.length}
                rowsPerPage={diseaseRowsPerPage}
                page={diseasePage}
                onPageChange={(e, newPage) => setDiseasePage(newPage)}
                onRowsPerPageChange={(e) => {
                  setDiseaseRowsPerPage(parseInt(e.target.value, 10));
                  setDiseasePage(0);
                }}
                sx={{ borderTop: "1px solid #E8EAED" }}
              />
            </Paper>
          </Box>
        )}

        {/* Classifiers View */}
        {viewMode === "classifiers" && (
          <Box>
            {/* Search and Filters */}
            <Box sx={{ mb: 3 }}>
              {/* Search Bar */}
              <TextField
                fullWidth
                placeholder="Search classifiers..."
                value={classifierSearch}
                onChange={(e) => setClassifierSearch(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Search sx={{ color: "#6B7280", fontSize: 28 }} />
                    </InputAdornment>
                  ),
                }}
                sx={{
                  mb: 3,
                  "& .MuiOutlinedInput-root": {
                    backgroundColor: "white",
                    fontSize: "1.1rem",
                    "& fieldset": {
                      borderColor: "#E5E7EB",
                    },
                    "&:hover fieldset": {
                      borderColor: "#10B981",
                    },
                    "&.Mui-focused fieldset": {
                      borderColor: "#10B981",
                      borderWidth: 2,
                    },
                  },
                  "& .MuiInputBase-input": {
                    py: 2,
                  },
                }}
              />

              {/* Filter Chips Row */}
              <Box
                sx={{
                  display: "flex",
                  gap: 2,
                  flexWrap: "wrap",
                  alignItems: "center",
                }}
              >
                {/* Disease Filter - Chips for few, Dropdown for many */}
                {diseases.length <= 6 ? (
                  <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
                    <Chip
                      label="All Diseases"
                      onClick={() => setDiseaseFilter("all")}
                      sx={{
                        px: 1,
                        fontSize: "0.95rem",
                        fontWeight: 500,
                        backgroundColor:
                          diseaseFilter === "all" ? "#10B981" : "#F3F4F6",
                        color: diseaseFilter === "all" ? "white" : "#6B7280",
                        border: "none",
                        "&:hover": {
                          backgroundColor:
                            diseaseFilter === "all" ? "#059669" : "#E5E7EB",
                        },
                      }}
                    />
                    {diseases.map((disease) => (
                      <Chip
                        key={disease.id}
                        label={disease.name}
                        onClick={() => setDiseaseFilter(disease.id.toString())}
                        sx={{
                          px: 1,
                          fontSize: "0.95rem",
                          fontWeight: 500,
                          backgroundColor:
                            diseaseFilter === disease.id.toString()
                              ? "#10B981"
                              : "#F3F4F6",
                          color:
                            diseaseFilter === disease.id.toString()
                              ? "white"
                              : "#6B7280",
                          border: "none",
                          "&:hover": {
                            backgroundColor:
                              diseaseFilter === disease.id.toString()
                                ? "#059669"
                                : "#E5E7EB",
                          },
                        }}
                      />
                    ))}
                  </Box>
                ) : (
                  <FormControl sx={{ minWidth: 220 }}>
                    <Select
                      value={diseaseFilter}
                      onChange={(e) => setDiseaseFilter(e.target.value)}
                      displayEmpty
                      sx={{
                        backgroundColor: "white",
                        "& .MuiOutlinedInput-notchedOutline": {
                          borderColor: "#E5E7EB",
                        },
                        "&:hover .MuiOutlinedInput-notchedOutline": {
                          borderColor: "#10B981",
                        },
                        "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                          borderColor: "#10B981",
                        },
                      }}
                    >
                      <MenuItem value="all">All Diseases</MenuItem>
                      {diseases.map((disease) => (
                        <MenuItem
                          key={disease.id}
                          value={disease.id.toString()}
                        >
                          {disease.name}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                )}

                {/* Divider */}
                <Box
                  sx={{ width: 1, height: 24, backgroundColor: "#E5E7EB" }}
                />

                {/* Modality Filter Chips */}
                <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
                  <Chip
                    label="All Modalities"
                    onClick={() => setModalityFilter("all")}
                    sx={{
                      px: 1,
                      fontSize: "0.95rem",
                      fontWeight: 500,
                      backgroundColor:
                        modalityFilter === "all" ? "#10B981" : "#F3F4F6",
                      color: modalityFilter === "all" ? "white" : "#6B7280",
                      border: "none",
                      "&:hover": {
                        backgroundColor:
                          modalityFilter === "all" ? "#059669" : "#E5E7EB",
                      },
                    }}
                  />
                  {MODALITY_OPTIONS.map((mod) => (
                    <Chip
                      key={mod}
                      label={mod}
                      onClick={() => setModalityFilter(mod)}
                      sx={{
                        px: 1,
                        fontSize: "0.95rem",
                        fontWeight: 500,
                        backgroundColor:
                          modalityFilter === mod ? "#10B981" : "#F3F4F6",
                        color: modalityFilter === mod ? "white" : "#6B7280",
                        border: "none",
                        "&:hover": {
                          backgroundColor:
                            modalityFilter === mod ? "#059669" : "#E5E7EB",
                        },
                      }}
                    />
                  ))}
                </Box>

                <Box sx={{ flexGrow: 1 }} />
                <Button
                  variant="contained"
                  startIcon={<Upload />}
                  onClick={() => handleClassifierDialogOpen()}
                  sx={{
                    backgroundColor: "#10B981",
                    px: 3,
                    "&:hover": { backgroundColor: "#059669" },
                  }}
                >
                  Add Classifier
                </Button>
              </Box>
            </Box>

            {/* Classifiers Table */}
            <Paper sx={{ borderRadius: 2 }}>
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow sx={{ backgroundColor: "#ECFDF5" }}>
                      <TableCell sx={{ fontWeight: 600 }}>
                        Classifier Name
                      </TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>Disease</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>Modality</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>Model Type</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>Accuracy</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>Status</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {filteredClassifiers.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={7} align="center" sx={{ py: 8 }}>
                          <Typography variant="body1" color="text.secondary">
                            No classifiers found
                          </Typography>
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredClassifiers
                        .slice(
                          classifierPage * classifierRowsPerPage,
                          classifierPage * classifierRowsPerPage +
                            classifierRowsPerPage
                        )
                        .map((classifier) => (
                          <TableRow
                            key={classifier.id}
                            sx={{ "&:hover": { backgroundColor: "#F8F9FA" } }}
                          >
                            <TableCell>
                              <Typography variant="subtitle2">
                                {classifier.name}
                              </Typography>
                              <Typography
                                variant="caption"
                                color="text.secondary"
                              >
                                {classifier.version || "N/A"}
                              </Typography>
                            </TableCell>
                            <TableCell>
                              {classifier.disease_name || "N/A"}
                            </TableCell>
                            <TableCell>
                              <Chip
                                label={classifier.modality}
                                size="small"
                                sx={{
                                  backgroundColor: "#ECFDF5",
                                  color: "#10B981",
                                }}
                              />
                            </TableCell>
                            <TableCell>
                              {classifier.model_type || "N/A"}
                            </TableCell>
                            <TableCell>
                              <Chip
                                label={`${(classifier.accuracy * 100).toFixed(
                                  1
                                )}%`}
                                size="small"
                                color="success"
                              />
                            </TableCell>
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
                                  sx={{ color: "#10B981" }}
                                >
                                  <Edit fontSize="small" />
                                </IconButton>
                              </Tooltip>
                              <Tooltip title="Deactivate">
                                <IconButton
                                  size="small"
                                  onClick={() =>
                                    handleDeleteClassifier(classifier.id, false)
                                  }
                                >
                                  <Cancel fontSize="small" />
                                </IconButton>
                              </Tooltip>
                              <Tooltip title="Delete">
                                <IconButton
                                  size="small"
                                  color="error"
                                  onClick={() =>
                                    handleDeleteClassifier(classifier.id, true)
                                  }
                                >
                                  <Delete fontSize="small" />
                                </IconButton>
                              </Tooltip>
                            </TableCell>
                          </TableRow>
                        ))
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
              <TablePagination
                rowsPerPageOptions={[5, 10, 25]}
                component="div"
                count={filteredClassifiers.length}
                rowsPerPage={classifierRowsPerPage}
                page={classifierPage}
                onPageChange={(e, newPage) => setClassifierPage(newPage)}
                onRowsPerPageChange={(e) => {
                  setClassifierRowsPerPage(parseInt(e.target.value, 10));
                  setClassifierPage(0);
                }}
                sx={{ borderTop: "1px solid #E8EAED" }}
              />
            </Paper>
          </Box>
        )}

        {/* Disease Dialog */}
        <Dialog
          open={diseaseDialogOpen}
          onClose={() => setDiseaseDialogOpen(false)}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle
            sx={{
              backgroundColor: "#ECFDF5",
              color: "#10B981",
              fontWeight: 600,
            }}
          >
            {editingDisease ? "Edit Disease" : "Add New Disease"}
          </DialogTitle>
          <DialogContent sx={{ mt: 2 }}>
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
                  value={diseaseForm.description}
                  onChange={(e) =>
                    setDiseaseForm({
                      ...diseaseForm,
                      description: e.target.value,
                    })
                  }
                  multiline
                  rows={3}
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      "&.Mui-focused fieldset": { borderColor: "#10B981" },
                    },
                    "& .MuiInputLabel-root.Mui-focused": { color: "#10B981" },
                  }}
                />
              </Grid>
              <Grid item xs={12}>
                <FormControl fullWidth>
                  <InputLabel>Category</InputLabel>
                  <Select
                    value={diseaseForm.category}
                    onChange={(e) =>
                      setDiseaseForm({
                        ...diseaseForm,
                        category: e.target.value,
                      })
                    }
                    label="Category"
                    sx={{
                      "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                        borderColor: "#10B981",
                      },
                    }}
                  >
                    {CATEGORY_OPTIONS.map((cat) => (
                      <MenuItem key={cat} value={cat}>
                        {cat}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12}>
                <Typography
                  variant="subtitle2"
                  sx={{ mb: 1, color: "#2C3E50" }}
                >
                  Available Modalities
                </Typography>
                <Box display="flex" gap={1} flexWrap="wrap">
                  {MODALITY_OPTIONS.map((modality) => (
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
                      sx={{
                        backgroundColor: (
                          diseaseForm.available_modalities || []
                        ).includes(modality)
                          ? "#10B981"
                          : "transparent",
                        borderColor: "#10B981",
                        "&:hover": {
                          backgroundColor: (
                            diseaseForm.available_modalities || []
                          ).includes(modality)
                            ? "#059669"
                            : "#ECFDF5",
                        },
                      }}
                    />
                  ))}
                </Box>
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions sx={{ p: 2 }}>
            <Button onClick={() => setDiseaseDialogOpen(false)}>Cancel</Button>
            <Button
              onClick={handleDiseaseSubmit}
              variant="contained"
              disabled={!diseaseForm.name || loading}
              sx={{
                backgroundColor: "#10B981",
                "&:hover": { backgroundColor: "#059669" },
              }}
            >
              {loading ? <CircularProgress size={24} /> : "Save"}
            </Button>
          </DialogActions>
        </Dialog>

        {/* Classifier Dialog */}
        <Dialog
          open={classifierDialogOpen}
          onClose={() => setClassifierDialogOpen(false)}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle
            sx={{
              backgroundColor: "#ECFDF5",
              color: "#10B981",
              fontWeight: 600,
            }}
          >
            {editingClassifier ? "Edit Classifier" : "Upload New Classifier"}
          </DialogTitle>
          <DialogContent sx={{ mt: 2 }}>
            <Grid container spacing={2}>
              <Grid item xs={12}>
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
                    value={classifierForm.disease_id}
                    onChange={(e) =>
                      setClassifierForm({
                        ...classifierForm,
                        disease_id: e.target.value,
                      })
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
                    value={classifierForm.modality}
                    onChange={(e) =>
                      setClassifierForm({
                        ...classifierForm,
                        modality: e.target.value,
                      })
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
                  value={classifierForm.model_type}
                  onChange={(e) =>
                    setClassifierForm({
                      ...classifierForm,
                      model_type: e.target.value,
                    })
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
                  value={classifierForm.description}
                  onChange={(e) =>
                    setClassifierForm({
                      ...classifierForm,
                      description: e.target.value,
                    })
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
                  value={classifierForm.accuracy}
                  onChange={(e) =>
                    setClassifierForm({
                      ...classifierForm,
                      accuracy: e.target.value,
                    })
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
                  value={classifierForm.version}
                  onChange={(e) =>
                    setClassifierForm({
                      ...classifierForm,
                      version: e.target.value,
                    })
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
                    Array.isArray(classifierForm.required_features)
                      ? classifierForm.required_features.join(", ")
                      : ""
                  }
                  onChange={(e) => {
                    const featuresString = e.target.value;
                    const featuresArray = featuresString
                      .split(",")
                      .map((f) => f.trim())
                      .filter((f) => f.length > 0);
                    setClassifierForm({
                      ...classifierForm,
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

                  {/* Features File */}
                  <Box sx={{ mb: 2 }}>
                    <input
                      accept=".pkl"
                      style={{ display: "none" }}
                      id="features-file-upload"
                      type="file"
                      onChange={(e) =>
                        setModelFiles({
                          ...modelFiles,
                          features_file: e.target.files[0],
                        })
                      }
                    />
                    <label htmlFor="features-file-upload">
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
                        features.pkl
                        {modelFiles.features_file && " ✓"}
                      </Button>
                    </label>
                    {modelFiles.features_file && (
                      <Typography
                        variant="caption"
                        sx={{ ml: 1, color: "#6B7280" }}
                      >
                        {modelFiles.features_file.name}
                      </Typography>
                    )}
                  </Box>

                  {/* Scaler File */}
                  <Box sx={{ mb: 2 }}>
                    <input
                      accept=".pkl"
                      style={{ display: "none" }}
                      id="scaler-file-upload"
                      type="file"
                      onChange={(e) =>
                        setModelFiles({
                          ...modelFiles,
                          scaler_file: e.target.files[0],
                        })
                      }
                    />
                    <label htmlFor="scaler-file-upload">
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
                        scaler.pkl
                        {modelFiles.scaler_file && " ✓"}
                      </Button>
                    </label>
                    {modelFiles.scaler_file && (
                      <Typography
                        variant="caption"
                        sx={{ ml: 1, color: "#6B7280" }}
                      >
                        {modelFiles.scaler_file.name}
                      </Typography>
                    )}
                  </Box>

                  {/* Imputer File */}
                  <Box sx={{ mb: 2 }}>
                    <input
                      accept=".pkl"
                      style={{ display: "none" }}
                      id="imputer-file-upload"
                      type="file"
                      onChange={(e) =>
                        setModelFiles({
                          ...modelFiles,
                          imputer_file: e.target.files[0],
                        })
                      }
                    />
                    <label htmlFor="imputer-file-upload">
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
                        imputer.pkl
                        {modelFiles.imputer_file && " ✓"}
                      </Button>
                    </label>
                    {modelFiles.imputer_file && (
                      <Typography
                        variant="caption"
                        sx={{ ml: 1, color: "#6B7280" }}
                      >
                        {modelFiles.imputer_file.name}
                      </Typography>
                    )}
                  </Box>

                  {/* Model File */}
                  <Box sx={{ mb: 2 }}>
                    <input
                      accept=".pkl"
                      style={{ display: "none" }}
                      id="model-file-upload"
                      type="file"
                      onChange={(e) =>
                        setModelFiles({
                          ...modelFiles,
                          model_file: e.target.files[0],
                        })
                      }
                    />
                    <label htmlFor="model-file-upload">
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
                        model.pkl
                        {modelFiles.model_file && " ✓"}
                      </Button>
                    </label>
                    {modelFiles.model_file && (
                      <Typography
                        variant="caption"
                        sx={{ ml: 1, color: "#6B7280" }}
                      >
                        {modelFiles.model_file.name}
                      </Typography>
                    )}
                  </Box>

                  {/* Class File */}
                  <Box sx={{ mb: 1 }}>
                    <input
                      accept=".pkl"
                      style={{ display: "none" }}
                      id="class-file-upload"
                      type="file"
                      onChange={(e) =>
                        setModelFiles({
                          ...modelFiles,
                          class_file: e.target.files[0],
                        })
                      }
                    />
                    <label htmlFor="class-file-upload">
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
                        class.pkl
                        {modelFiles.class_file && " ✓"}
                      </Button>
                    </label>
                    {modelFiles.class_file && (
                      <Typography
                        variant="caption"
                        sx={{ ml: 1, color: "#6B7280" }}
                      >
                        {modelFiles.class_file.name}
                      </Typography>
                    )}
                  </Box>

                  {editingClassifier && (
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
      </Container>
    </Box>
  );
}

export default AdminDiseaseUpload;
