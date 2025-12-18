import { useState, useEffect } from "react";
import {
  Box,
  Button,
  Container,
  Typography,
  Alert,
  CircularProgress,
} from "@mui/material";
import { Refresh } from "@mui/icons-material";
import AdminNavbar from "../../components/admin/AdminNavbar";
import DiseaseTable from "../../components/admin/disease/DiseaseTable";
import DiseaseDialog from "../../components/admin/disease/DiseaseDialog";
import ClassifierTable from "../../components/admin/classifier/ClassifierTable";
import ClassifierWizard from "../../components/admin/classifier/ClassifierWizard";
import { useDiseaseManagement } from "../../hooks/useDiseaseManagement";
import { useClassifierManagement } from "../../hooks/useClassifierManagement";

function AdminDiseaseUpload() {
  const [viewMode, setViewMode] = useState("diseases");
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("info");

  const diseaseManager = useDiseaseManagement();
  const classifierManager = useClassifierManagement();

  useEffect(() => {
    diseaseManager.loadDiseases();
    classifierManager.loadClassifiers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Only run once on mount

  const handleDiseaseSubmit = async () => {
    const result = await diseaseManager.submitDisease();
    if (result.success) {
      setMessage(result.message);
      setMessageType("success");
    } else {
      setMessage(result.error);
      setMessageType("error");
    }
  };

  const handleDiseaseDelete = async (diseaseId) => {
    const result = await diseaseManager.deleteDisease(diseaseId);
    if (result.success) {
      setMessage(result.message);
      setMessageType("success");
    } else if (!result.cancelled) {
      setMessage(result.error);
      setMessageType("error");
    }
  };

  const handleDiseaseToggleActive = async (diseaseId) => {
    const result = await diseaseManager.toggleActive(diseaseId);
    if (result.success) {
      setMessage(result.message);
      setMessageType("success");
    } else {
      setMessage(result.error);
      setMessageType("error");
    }
  };

  const handleClassifierSubmit = async () => {
    // Reload classifiers after wizard completes
    await classifierManager.loadClassifiers();
    const isEditMode = !!classifierManager.editingClassifier;
    setMessage(isEditMode ? "Classifier updated successfully" : "Classifier created successfully");
    setMessageType("success");
  };

  const handleClassifierDelete = async (classifierId) => {
    const result = await classifierManager.deleteClassifier(classifierId);
    if (result.success) {
      setMessage(result.message);
      setMessageType("success");
    } else if (!result.cancelled) {
      setMessage(result.error);
      setMessageType("error");
    }
  };

  const handleClassifierToggleActive = async (classifierId) => {
    const result = await classifierManager.toggleActive(classifierId);
    if (result.success) {
      setMessage(result.message);
      setMessageType("success");
    } else {
      setMessage(result.error);
      setMessageType("error");
    }
  };

  const handleRefresh = () => {
    diseaseManager.loadDiseases();
    classifierManager.loadClassifiers();
  };

  if (
    diseaseManager.loading &&
    diseaseManager.diseases.length === 0 &&
    classifierManager.classifiers.length === 0
  ) {
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
              Diseases ({diseaseManager.diseases.length})
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
              Classifiers ({classifierManager.classifiers.length})
            </Button>
            <Box sx={{ flexGrow: 1 }} />
            <Button
              variant="outlined"
              startIcon={<Refresh />}
              onClick={handleRefresh}
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
          <DiseaseTable
            diseases={diseaseManager.diseases}
            onEdit={diseaseManager.openDialog}
            onDelete={handleDiseaseDelete}
            onToggleActive={handleDiseaseToggleActive}
          />
        )}

        {/* Classifiers View */}
        {viewMode === "classifiers" && (
          <ClassifierTable
            classifiers={classifierManager.classifiers}
            diseases={diseaseManager.diseases}
            onEdit={classifierManager.openDialog}
            onDelete={handleClassifierDelete}
            onToggleActive={handleClassifierToggleActive}
          />
        )}

        {/* Disease Dialog */}
        <DiseaseDialog
          open={diseaseManager.dialogOpen}
          onClose={diseaseManager.closeDialog}
          disease={diseaseManager.editingDisease}
          formData={diseaseManager.formData}
          onChange={diseaseManager.setFormData}
          onSubmit={handleDiseaseSubmit}
          loading={diseaseManager.loading}
        />

        {/* Classifier Wizard */}
        <ClassifierWizard
          open={classifierManager.dialogOpen}
          onClose={classifierManager.closeDialog}
          classifier={classifierManager.editingClassifier}
          diseases={diseaseManager.diseases}
          onSubmit={handleClassifierSubmit}
          loading={classifierManager.loading}
        />
      </Container>
    </Box>
  );
}

export default AdminDiseaseUpload;
