import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Container,
  Typography,
  Card,
  Alert,
  CircularProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Chip,
  IconButton,
  Tooltip,
  TextField,
  InputAdornment,
  Paper,
} from "@mui/material";
import {
  Visibility,
  Search,
  CheckCircle,
  Pending,
  Error as ErrorIcon,
  HourglassEmpty,
} from "@mui/icons-material";
import NavBar from "../../components/layout/NavBar";
import Footer from "../../components/landingPageComponents/Footer";
import { useUserDiagnoses } from "../../hooks/useDiagnosis";
import { useAuth } from "../../context/AuthContext";

const ProfileDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  // Fetch user diagnoses
  const { data: diagnoses, isLoading, error } = useUserDiagnoses();
  
  // Pagination state - fixed at 10 per page
  const [page, setPage] = useState(0);
  const rowsPerPage = 10;
  
  // Search state
  const [searchTerm, setSearchTerm] = useState("");

  // Filter diagnoses based on search term
  const filteredDiagnoses = diagnoses.filter((diagnosis) => {
    if (!searchTerm) return true;
    const search = searchTerm.toLowerCase();
    return (
      (diagnosis.name && diagnosis.name.toLowerCase().includes(search)) ||
      (diagnosis.disease_name && diagnosis.disease_name.toLowerCase().includes(search)) ||
      (diagnosis.classifier_name && diagnosis.classifier_name.toLowerCase().includes(search)) ||
      (diagnosis.prediction && diagnosis.prediction.toLowerCase().includes(search))
    );
  });

  // Paginate filtered results
  const paginatedDiagnoses = filteredDiagnoses.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleViewDiagnosis = (diagnosisId) => {
    navigate(`/diagnosis/${diagnosisId}`);
  };

  const getStatusIcon = (status) => {
    const icons = {
      completed: <CheckCircle fontSize="small" />,
      pending: <Pending fontSize="small" />,
      processing: <HourglassEmpty fontSize="small" />,
      failed: <ErrorIcon fontSize="small" />,
    };
    return icons[status] || <Pending fontSize="small" />;
  };

  const getStatusColor = (status) => {
    const colors = {
      completed: "success",
      pending: "warning",
      processing: "info",
      failed: "error",
    };
    return colors[status] || "default";
  };

  if (isLoading) {
    return (
      <Box sx={{ minHeight: "100vh", bgcolor: "grey.50" }}>
        <NavBar />
        <Container maxWidth="xl" sx={{ py: 4 }}>
          <Box
            display="flex"
            justifyContent="center"
            alignItems="center"
            minHeight="400px"
          >
            <CircularProgress size={60} />
          </Box>
        </Container>
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ minHeight: "100vh", bgcolor: "grey.50" }}>
        <NavBar />
        <Container maxWidth="xl" sx={{ py: 4 }}>
          <Alert severity="error">
            Failed to load diagnosis data. Please try again later.
          </Alert>
        </Container>
      </Box>
    );
  }

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "grey.50" }}>
      <NavBar />

      <Container maxWidth="xl" sx={{ py: 4 }}>
        {/* Page Header */}
        <Box mb={4}>
          <Typography
            variant="h4"
            component="h1"
            gutterBottom
            sx={{
              background: "linear-gradient(135deg, #2e7d32 0%, #66bb6a 100%)",
              backgroundClip: "text",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              fontWeight: "bold",
            }}
          >
            My Diagnosis History
          </Typography>
          <Typography
            variant="body1"
            color="text.secondary"
            sx={{ fontSize: "1.1rem", mb: 2 }}
          >
            View and manage your diagnosis records for {user?.username || "User"}
          </Typography>
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{ 
              maxWidth: "800px",
              lineHeight: 1.6,
            }}
          >
            Track your medical diagnosis journey with our comprehensive dashboard. 
            Access detailed information about each diagnosis, including disease insights, 
            classifier details, prediction results, and confidence scores. Click on any 
            diagnosis to view complete details including research papers and educational resources.
          </Typography>
        </Box>

        {/* Statistics Summary */}
        <Box
          display="flex"
          gap={2}
          mb={4}
          sx={{
            flexWrap: "wrap",
          }}
        >
          <Card 
            sx={{ 
              flex: "1 1 200px", 
              p: 2,
              transition: "all 0.3s ease-in-out",
              "&:hover": {
                transform: "translateY(-8px)",
                boxShadow: 6,
              },
            }}
          >
            <Typography variant="h4" color="primary" fontWeight="bold">
              {diagnoses.length}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Total Diagnoses
            </Typography>
          </Card>
          <Card 
            sx={{ 
              flex: "1 1 200px", 
              p: 2,
              transition: "all 0.3s ease-in-out",
              "&:hover": {
                transform: "translateY(-8px)",
                boxShadow: 6,
              },
            }}
          >
            <Typography variant="h4" color="success.main" fontWeight="bold">
              {diagnoses.filter((d) => d.status === "completed").length}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Completed
            </Typography>
          </Card>
          <Card 
            sx={{ 
              flex: "1 1 200px", 
              p: 2,
              transition: "all 0.3s ease-in-out",
              "&:hover": {
                transform: "translateY(-8px)",
                boxShadow: 6,
              },
            }}
          >
            <Typography variant="h4" color="warning.main" fontWeight="bold">
              {diagnoses.filter((d) => d.status === "pending").length}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Pending
            </Typography>
          </Card>
          <Card 
            sx={{ 
              flex: "1 1 200px", 
              p: 2,
              transition: "all 0.3s ease-in-out",
              "&:hover": {
                transform: "translateY(-8px)",
                boxShadow: 6,
              },
            }}
          >
            <Typography variant="h4" color="error.main" fontWeight="bold">
              {diagnoses.filter((d) => d.status === "failed").length}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Failed
            </Typography>
          </Card>
        </Box>

        {/* Search Bar */}
        <Box mb={3}>
          <TextField
            fullWidth
            placeholder="Search by patient name, disease, classifier, or prediction..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setPage(0); // Reset to first page on search
            }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Search />
                </InputAdornment>
              ),
            }}
            sx={{
              bgcolor: "white",
              borderRadius: 1,
            }}
          />
        </Box>

        {/* No Data State */}
        {diagnoses.length === 0 && (
          <Card sx={{ p: 4, textAlign: "center" }}>
            <Alert severity="info">
              No diagnosis records found. Create your first diagnosis to see your history.
            </Alert>
          </Card>
        )}

        {/* Table */}
        {diagnoses.length > 0 && (
          <Card>
            <TableContainer component={Paper}>
              <Table sx={{ minWidth: 650 }}>
                <TableHead>
                  <TableRow sx={{ bgcolor: "success.50" }}>
                    <TableCell>
                      <Typography variant="subtitle2" fontWeight="bold" color="success.dark">
                        ID
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="subtitle2" fontWeight="bold" color="success.dark">
                        Patient Name
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="subtitle2" fontWeight="bold" color="success.dark">
                        Disease
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="subtitle2" fontWeight="bold" color="success.dark">
                        Classifier
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="subtitle2" fontWeight="bold" color="success.dark">
                        Prediction
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="subtitle2" fontWeight="bold" color="success.dark">
                        Confidence
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="subtitle2" fontWeight="bold" color="success.dark">
                        Status
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="subtitle2" fontWeight="bold" color="success.dark">
                        Date
                      </Typography>
                    </TableCell>
                    <TableCell align="center">
                      <Typography variant="subtitle2" fontWeight="bold" color="success.dark">
                        Actions
                      </Typography>
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {paginatedDiagnoses.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={9} align="center">
                        <Typography variant="body2" color="text.secondary" py={4}>
                          No diagnoses found matching your search.
                        </Typography>
                      </TableCell>
                    </TableRow>
                  ) : (
                    paginatedDiagnoses.map((diagnosis) => (
                      <TableRow
                        key={diagnosis.id}
                        hover
                        sx={{
                          cursor: "pointer",
                          "&:hover": { bgcolor: "action.hover" },
                        }}
                        onClick={() => handleViewDiagnosis(diagnosis.id)}
                      >
                        <TableCell>
                          <Typography variant="body2" fontWeight="medium">
                            #{diagnosis.id}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2">
                            {diagnosis.name || "N/A"}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {diagnosis.age ? `${diagnosis.age}y` : ""} {diagnosis.sex || ""}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" fontWeight="medium">
                            {diagnosis.disease_name || "Unknown"}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2">
                            {diagnosis.classifier_name || "Unknown"}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" fontWeight="medium">
                            {diagnosis.prediction || "-"}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          {diagnosis.confidence ? (
                            <Typography variant="body2">
                              {(diagnosis.confidence * 100).toFixed(1)}%
                            </Typography>
                          ) : (
                            <Typography variant="body2" color="text.secondary">
                              -
                            </Typography>
                          )}
                        </TableCell>
                        <TableCell>
                          <Chip
                            icon={getStatusIcon(diagnosis.status)}
                            label={diagnosis.status.charAt(0).toUpperCase() + diagnosis.status.slice(1)}
                            color={getStatusColor(diagnosis.status)}
                            size="small"
                          />
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2">
                            {new Date(diagnosis.created_at).toLocaleDateString()}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {new Date(diagnosis.created_at).toLocaleTimeString([], {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </Typography>
                        </TableCell>
                        <TableCell align="center">
                          <Tooltip title="View Details">
                            <IconButton
                              size="small"
                              sx={{ color: "success.main" }}
                              onClick={(e) => {
                                e.stopPropagation();
                                handleViewDiagnosis(diagnosis.id);
                              }}
                            >
                              <Visibility />
                            </IconButton>
                          </Tooltip>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </TableContainer>

            {/* Pagination */}
            <TablePagination
              component="div"
              count={filteredDiagnoses.length}
              page={page}
              onPageChange={handleChangePage}
              rowsPerPage={rowsPerPage}
              rowsPerPageOptions={[10]}
              labelDisplayedRows={({ from, to, count }) =>
                `${from}-${to} of ${count}`
              }
            />
          </Card>
        )}

        {/* Medical Disclaimer */}
        <Box mt={4} mb={4}>
          <Card sx={{ p: 3, bgcolor: "warning.50", borderLeft: 4, borderColor: "warning.main" }}>
            <Typography variant="h6" gutterBottom fontWeight="bold" color="warning.dark">
              ⚠️ Important Medical Disclaimer
            </Typography>
            <Typography variant="body2" color="text.secondary">
              The predictions and diagnoses provided by this platform are generated by AI models 
              for research and educational purposes only. They should NOT be used as the sole basis 
              for medical diagnosis or treatment decisions. Always consult with qualified healthcare 
              professionals for proper medical evaluation, diagnosis, and treatment advice. This 
              platform is designed to assist healthcare providers and researchers, not to replace 
              professional medical judgment.
            </Typography>
          </Card>
        </Box>
      </Container>
      
      {/* Footer */}
      <Footer />
    </Box>
  );
};

export default ProfileDashboard;
