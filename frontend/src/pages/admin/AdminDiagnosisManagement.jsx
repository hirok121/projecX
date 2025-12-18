import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Alert,
  CircularProgress,
  Container,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Paper,
  Chip,
  TextField,
  InputAdornment,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Grid,
} from "@mui/material";
import {
  Assessment,
  FileDownload,
  Search,
  Refresh,
  LocalHospital,
  Person,
} from "@mui/icons-material";
import AdminNavbar from "../../components/admin/AdminNavbar";
import { diagnosisAPI } from "../../services/diagnosisAPI";

function AdminDiagnosisManagement() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [diagnoses, setDiagnoses] = useState([]);
  const [filteredDiagnoses, setFilteredDiagnoses] = useState([]);
  const [stats, setStats] = useState({
    total: 0,
    recent: 0,
  });
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterRisk, setFilterRisk] = useState("all");
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("info");

  useEffect(() => {
    fetchDiagnosisData();
  }, []);

  useEffect(() => {
    // Apply filters
    let filtered = [...diagnoses];

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(
        (d) =>
          d.user_email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          d.disease_name?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Risk filter
    if (filterRisk !== "all") {
      filtered = filtered.filter(
        (d) => d.risk_level?.toLowerCase() === filterRisk
      );
    }

    setFilteredDiagnoses(filtered);
    setPage(0);
  }, [searchQuery, filterRisk, diagnoses]);

  const fetchDiagnosisData = async () => {
    setLoading(true);
    try {
      // Fetch analytics for basic stats
      const analyticsResponse = await diagnosisAPI.getAdminAnalytics();
      const analytics = analyticsResponse.data?.data || {};

      setStats({
        total: analytics.total_diagnoses || 0,
        recent: analytics.recent_diagnoses || 0,
      });

      // Fetch diagnosis records with basic filters
      const diagnosesResponse = await diagnosisAPI.searchDiagnoses({
        page: 1,
        page_size: 1000, // Get all for client-side filtering
      });

      const diagnosisData = diagnosesResponse.data?.items || [];
      setDiagnoses(diagnosisData);
      setFilteredDiagnoses(diagnosisData);

      setMessage("");
    } catch (error) {
      logger.error("Diagnosis data fetch error:", error);
      setMessage("Error loading diagnosis data. Please try again.");
      setMessageType("error");
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async () => {
    try {
      const response = await diagnosisAPI.exportExcel();
      const filename = `diagnosis_records_${
        new Date().toISOString().split("T")[0]
      }.xlsx`;

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", filename);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      setMessage("Export completed successfully");
      setMessageType("success");
    } catch (error) {
      logger.error("Export error:", error);
      setMessage("Error exporting data");
      setMessageType("error");
    }
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const getRiskColor = (risk) => {
    switch (risk?.toLowerCase()) {
      case "high":
        return "error";
      case "medium":
        return "warning";
      case "low":
        return "success";
      default:
        return "default";
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  if (loading) {
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
            Manage diagnosis records and view system statistics
          </Typography>

          <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
            <Button
              variant="contained"
              startIcon={<FileDownload />}
              onClick={handleExport}
              sx={{
                backgroundColor: "#10B981",
                "&:hover": {
                  backgroundColor: "#059669",
                },
              }}
            >
              Export Data
            </Button>
            <Button
              variant="outlined"
              startIcon={<Refresh />}
              onClick={fetchDiagnosisData}
              disabled={loading}
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

        {/* Statistics Cards */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={6}>
            <Card
              sx={{
                height: "100%",
                borderRadius: 2,
                border: "1px solid #E8EAED",
                boxShadow: "none",
                "&:hover": {
                  boxShadow: "0 4px 12px rgba(44, 62, 80, 0.08)",
                },
              }}
            >
              <CardContent>
                <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                  <Box
                    sx={{
                      width: 48,
                      height: 48,
                      borderRadius: 2,
                      backgroundColor: "#ECFDF5",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      mr: 2,
                    }}
                  >
                    <Assessment sx={{ color: "#10B981", fontSize: 24 }} />
                  </Box>
                  <Typography variant="h6" color="text.secondary">
                    Total Diagnoses
                  </Typography>
                </Box>
                <Typography variant="h3" sx={{ fontWeight: 600 }}>
                  {stats.total}
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6}>
            <Card
              sx={{
                height: "100%",
                borderRadius: 2,
                border: "1px solid #E8EAED",
                boxShadow: "none",
                "&:hover": {
                  boxShadow: "0 4px 12px rgba(44, 62, 80, 0.08)",
                },
              }}
            >
              <CardContent>
                <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                  <Box
                    sx={{
                      width: 48,
                      height: 48,
                      borderRadius: 2,
                      backgroundColor: "#ECFDF5",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      mr: 2,
                    }}
                  >
                    <LocalHospital sx={{ color: "#10B981", fontSize: 24 }} />
                  </Box>
                  <Typography variant="h6" color="text.secondary">
                    Recent Activity
                  </Typography>
                </Box>
                <Typography variant="h3" sx={{ fontWeight: 600, mb: 0.5 }}>
                  {stats.recent}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Last 30 days
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Search and Filters */}
        <Paper sx={{ p: 3, mb: 3, borderRadius: 2 }}>
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                placeholder="Search by email or disease name..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Search sx={{ color: "#10B981" }} />
                    </InputAdornment>
                  ),
                }}
                sx={{
                  "& .MuiOutlinedInput-root": {
                    "&:hover fieldset": {
                      borderColor: "#10B981",
                    },
                    "&.Mui-focused fieldset": {
                      borderColor: "#10B981",
                    },
                  },
                }}
              />
            </Grid>
            <Grid item xs={12} md={3}>
              <FormControl fullWidth>
                <InputLabel>Risk Level</InputLabel>
                <Select
                  value={filterRisk}
                  onChange={(e) => setFilterRisk(e.target.value)}
                  label="Risk Level"
                  sx={{
                    "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                      borderColor: "#10B981",
                    },
                  }}
                >
                  <MenuItem value="all">All Levels</MenuItem>
                  <MenuItem value="high">High Risk</MenuItem>
                  <MenuItem value="medium">Medium Risk</MenuItem>
                  <MenuItem value="low">Low Risk</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={3}>
              <Box
                sx={{ display: "flex", alignItems: "center", height: "100%" }}
              >
                <Typography variant="body2" color="text.secondary">
                  Showing {filteredDiagnoses.length} of {diagnoses.length}{" "}
                  records
                </Typography>
              </Box>
            </Grid>
          </Grid>
        </Paper>

        {/* Diagnosis Table */}
        <Paper sx={{ borderRadius: 2 }}>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow sx={{ backgroundColor: "#ECFDF5" }}>
                  <TableCell sx={{ fontWeight: 600 }}>User Email</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Disease</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Risk Level</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>HCV Status</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Date</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredDiagnoses.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} align="center" sx={{ py: 8 }}>
                      <Typography variant="body1" color="text.secondary">
                        No diagnosis records found
                      </Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredDiagnoses
                    .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                    .map((diagnosis, index) => (
                      <TableRow
                        key={diagnosis.id || index}
                        sx={{
                          "&:hover": {
                            backgroundColor: "#F8F9FA",
                          },
                        }}
                      >
                        <TableCell>
                          <Box sx={{ display: "flex", alignItems: "center" }}>
                            <Person
                              sx={{ mr: 1, color: "#10B981", fontSize: 20 }}
                            />
                            {diagnosis.user_email || "N/A"}
                          </Box>
                        </TableCell>
                        <TableCell>{diagnosis.disease_name || "N/A"}</TableCell>
                        <TableCell>
                          <Chip
                            label={diagnosis.risk_level || "Unknown"}
                            color={getRiskColor(diagnosis.risk_level)}
                            size="small"
                          />
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={diagnosis.hcv_status || "N/A"}
                            color={
                              diagnosis.hcv_status?.toLowerCase() === "positive"
                                ? "error"
                                : "success"
                            }
                            size="small"
                            variant="outlined"
                          />
                        </TableCell>
                        <TableCell>
                          {formatDate(diagnosis.created_at)}
                        </TableCell>
                      </TableRow>
                    ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
          <TablePagination
            rowsPerPageOptions={[5, 10, 25, 50]}
            component="div"
            count={filteredDiagnoses.length}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
            sx={{
              borderTop: "1px solid #E8EAED",
            }}
          />
        </Paper>
      </Container>
    </Box>
  );
}

export default AdminDiagnosisManagement;
