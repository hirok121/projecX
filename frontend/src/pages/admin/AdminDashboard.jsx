import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Button,
  Alert,
  CircularProgress,
  Container,
  Chip,
} from "@mui/material";
import {
  People,
  SupervisorAccount,
  Refresh,
  BugReport,
  Storage,
  LibraryBooks,
  Upload,
  Analytics,
  Settings,
  MedicalServices,
  ArrowForward,
} from "@mui/icons-material";
import { useAuth } from "../../context/AuthContext";
import api from "../../services/api";
import AdminNavBar from "../../components/admin/AdminNavbar";
import logger from "../../utils/logger";

function AdminDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalUsers: 0,
    activeUsers: 0,
    staffUsers: 0,
    superUsers: 0,
  });
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("info");

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const usersResponse = await api.get("/users");

      if (Array.isArray(usersResponse.data)) {
        const users = usersResponse.data;

        // Calculate statistics from users array
        const totalUsers = users.length;
        const activeUsers = users.filter((u) => u.is_active).length;
        const staffUsers = users.filter((u) => u.is_staff).length;
        const superUsers = users.filter((u) => u.is_superuser).length;

        setStats({
          totalUsers,
          activeUsers,
          staffUsers,
          superUsers,
        });

        setMessage("");
        setMessageType("info");
      }
    } catch (error) {
      logger.error("Dashboard data fetch error:", error);
      setMessage("Error loading dashboard data. Please try again.");
      setMessageType("error");
      setStats({
        totalUsers: 0,
        activeUsers: 0,
        staffUsers: 0,
        superUsers: 0,
      });
    } finally {
      setLoading(false);
    }
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
      <AdminNavBar />

      <Container maxWidth="xl" sx={{ py: 6 }}>
        {/* Header */}
        <Box sx={{ mb: 5 }}>
          <Typography
            variant="h3"
            sx={{ fontWeight: 600, color: "#2C3E50", mb: 1 }}
          >
            Admin Dashboard
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
            Welcome back, {user?.full_name || user?.first_name || user?.email}
          </Typography>

          <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
            <Button
              variant="outlined"
              startIcon={<BugReport />}
              onClick={() => navigate("/admin/debug")}
              sx={{
                borderColor: "#10B981",
                color: "#10B981",
                "&:hover": {
                  borderColor: "#059669",
                  backgroundColor: "#ECFDF5",
                },
              }}
            >
              Debug logger
            </Button>
            <Button
              variant="outlined"
              startIcon={<Storage />}
              onClick={() => navigate("/admin/diagnosis-management")}
              sx={{
                borderColor: "#10B981",
                color: "#10B981",
                "&:hover": {
                  borderColor: "#059669",
                  backgroundColor: "#ECFDF5",
                },
              }}
            >
              Diagnosis Management
            </Button>
            <Button
              variant="contained"
              startIcon={<Refresh />}
              onClick={fetchDashboardData}
              disabled={loading}
              sx={{
                backgroundColor: "#10B981",
                "&:hover": {
                  backgroundColor: "#059669",
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
        <Grid container spacing={3} sx={{ mb: 6 }}>
          <Grid item xs={12} sm={6} md={3}>
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
                    <People sx={{ color: "#10B981", fontSize: 24 }} />
                  </Box>
                  <Typography variant="h6" color="text.secondary">
                    Total Users
                  </Typography>
                </Box>
                <Typography variant="h3" sx={{ fontWeight: 600, mb: 0.5 }}>
                  {stats.totalUsers}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {stats.activeUsers} active
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
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
                    <People sx={{ color: "#10B981", fontSize: 24 }} />
                  </Box>
                  <Typography variant="h6" color="text.secondary">
                    Active Users
                  </Typography>
                </Box>
                <Typography variant="h3" sx={{ fontWeight: 600, mb: 0.5 }}>
                  {stats.activeUsers}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Currently online
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
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
                    <SupervisorAccount
                      sx={{ color: "#10B981", fontSize: 24 }}
                    />
                  </Box>
                  <Typography variant="h6" color="text.secondary">
                    Staff Members
                  </Typography>
                </Box>
                <Typography variant="h3" sx={{ fontWeight: 600, mb: 0.5 }}>
                  {stats.staffUsers}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Team members
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
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
                    <SupervisorAccount
                      sx={{ color: "#10B981", fontSize: 24 }}
                    />
                  </Box>
                  <Typography variant="h6" color="text.secondary">
                    Super Users
                  </Typography>
                </Box>
                <Typography variant="h3" sx={{ fontWeight: 600, mb: 0.5 }}>
                  {stats.superUsers}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Administrators
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Admin Features Section */}
        <Box sx={{ mb: 4 }}>
          <Typography
            variant="h5"
            sx={{ fontWeight: 600, color: "#2C3E50", mb: 3 }}
          >
            Admin Features
          </Typography>
          <Grid container spacing={3}>
            {/* User Management */}
            <Grid item xs={12} sm={6} md={4}>
              <Card
                sx={{
                  height: "100%",
                  borderRadius: 2,
                  border: "1px solid #E8EAED",
                  boxShadow: "none",
                  cursor: "pointer",
                  transition: "all 0.2s ease",
                  "&:hover": {
                    boxShadow: "0 4px 12px rgba(16, 185, 129, 0.15)",
                    transform: "translateY(-2px)",
                    borderColor: "#10B981",
                  },
                }}
                onClick={() => navigate("/admin/users")}
              >
                <CardContent sx={{ p: 3 }}>
                  <Box
                    sx={{
                      width: 56,
                      height: 56,
                      borderRadius: 2,
                      backgroundColor: "#ECFDF5",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      mb: 2,
                    }}
                  >
                    <People sx={{ color: "#10B981", fontSize: 32 }} />
                  </Box>
                  <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
                    User Management
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    Manage users, roles, and permissions
                  </Typography>
                  <Button
                    endIcon={<ArrowForward />}
                    sx={{
                      color: "#10B981",
                      textTransform: "none",
                      fontWeight: 600,
                      p: 0,
                      "&:hover": { bgcolor: "transparent" },
                    }}
                  >
                    Open
                  </Button>
                </CardContent>
              </Card>
            </Grid>

            {/* Diagnosis Management */}
            <Grid item xs={12} sm={6} md={4}>
              <Card
                sx={{
                  height: "100%",
                  borderRadius: 2,
                  border: "1px solid #E8EAED",
                  boxShadow: "none",
                  cursor: "pointer",
                  transition: "all 0.2s ease",
                  "&:hover": {
                    boxShadow: "0 4px 12px rgba(16, 185, 129, 0.15)",
                    transform: "translateY(-2px)",
                    borderColor: "#10B981",
                  },
                }}
                onClick={() => navigate("/admin/diagnosis-management")}
              >
                <CardContent sx={{ p: 3 }}>
                  <Box
                    sx={{
                      width: 56,
                      height: 56,
                      borderRadius: 2,
                      backgroundColor: "#ECFDF5",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      mb: 2,
                    }}
                  >
                    <MedicalServices sx={{ color: "#10B981", fontSize: 32 }} />
                  </Box>
                  <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
                    Diagnosis Management
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    View and manage patient diagnoses
                  </Typography>
                  <Button
                    endIcon={<ArrowForward />}
                    sx={{
                      color: "#10B981",
                      textTransform: "none",
                      fontWeight: 600,
                      p: 0,
                      "&:hover": { bgcolor: "transparent" },
                    }}
                  >
                    Open
                  </Button>
                </CardContent>
              </Card>
            </Grid>

            {/* Disease & Models */}
            <Grid item xs={12} sm={6} md={4}>
              <Card
                sx={{
                  height: "100%",
                  borderRadius: 2,
                  border: "1px solid #E8EAED",
                  boxShadow: "none",
                  cursor: "pointer",
                  transition: "all 0.2s ease",
                  "&:hover": {
                    boxShadow: "0 4px 12px rgba(16, 185, 129, 0.15)",
                    transform: "translateY(-2px)",
                    borderColor: "#10B981",
                  },
                }}
                onClick={() => navigate("/admin/disease-upload")}
              >
                <CardContent sx={{ p: 3 }}>
                  <Box
                    sx={{
                      width: 56,
                      height: 56,
                      borderRadius: 2,
                      backgroundColor: "#ECFDF5",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      mb: 2,
                    }}
                  >
                    <Upload sx={{ color: "#10B981", fontSize: 32 }} />
                  </Box>
                  <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
                    Disease & Models
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    Upload and manage ML models
                  </Typography>
                  <Button
                    endIcon={<ArrowForward />}
                    sx={{
                      color: "#10B981",
                      textTransform: "none",
                      fontWeight: 600,
                      p: 0,
                      "&:hover": { bgcolor: "transparent" },
                    }}
                  >
                    Open
                  </Button>
                </CardContent>
              </Card>
            </Grid>

            {/* Blog Management */}
            <Grid item xs={12} sm={6} md={4}>
              <Card
                sx={{
                  height: "100%",
                  borderRadius: 2,
                  border: "1px solid #E8EAED",
                  boxShadow: "none",
                  cursor: "pointer",
                  transition: "all 0.2s ease",
                  "&:hover": {
                    boxShadow: "0 4px 12px rgba(16, 185, 129, 0.15)",
                    transform: "translateY(-2px)",
                    borderColor: "#10B981",
                  },
                }}
                onClick={() => navigate("/admin/blogs")}
              >
                <CardContent sx={{ p: 3 }}>
                  <Box
                    sx={{
                      width: 56,
                      height: 56,
                      borderRadius: 2,
                      backgroundColor: "#ECFDF5",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      mb: 2,
                    }}
                  >
                    <LibraryBooks sx={{ color: "#10B981", fontSize: 32 }} />
                  </Box>
                  <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
                    Blog Management
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    Create and manage blog posts
                  </Typography>
                  <Button
                    endIcon={<ArrowForward />}
                    sx={{
                      color: "#10B981",
                      textTransform: "none",
                      fontWeight: 600,
                      p: 0,
                      "&:hover": { bgcolor: "transparent" },
                    }}
                  >
                    Open
                  </Button>
                </CardContent>
              </Card>
            </Grid>

            {/* Debug logger */}
            <Grid item xs={12} sm={6} md={4}>
              <Card
                sx={{
                  height: "100%",
                  borderRadius: 2,
                  border: "1px solid #E8EAED",
                  boxShadow: "none",
                  cursor: "pointer",
                  transition: "all 0.2s ease",
                  "&:hover": {
                    boxShadow: "0 4px 12px rgba(16, 185, 129, 0.15)",
                    transform: "translateY(-2px)",
                    borderColor: "#10B981",
                  },
                }}
                onClick={() => navigate("/admin/debug")}
              >
                <CardContent sx={{ p: 3 }}>
                  <Box
                    sx={{
                      width: 56,
                      height: 56,
                      borderRadius: 2,
                      backgroundColor: "#ECFDF5",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      mb: 2,
                    }}
                  >
                    <BugReport sx={{ color: "#10B981", fontSize: 32 }} />
                  </Box>
                  <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
                    Debug logger
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    System diagnostics and debugging
                  </Typography>
                  <Button
                    endIcon={<ArrowForward />}
                    sx={{
                      color: "#10B981",
                      textTransform: "none",
                      fontWeight: 600,
                      p: 0,
                      "&:hover": { bgcolor: "transparent" },
                    }}
                  >
                    Open
                  </Button>
                </CardContent>
              </Card>
            </Grid>

            {/* Analytics */}
            <Grid item xs={12} sm={6} md={4}>
              <Card
                sx={{
                  height: "100%",
                  borderRadius: 2,
                  border: "1px solid #E8EAED",
                  boxShadow: "none",
                  cursor: "pointer",
                  transition: "all 0.2s ease",
                  "&:hover": {
                    boxShadow: "0 4px 12px rgba(16, 185, 129, 0.15)",
                    transform: "translateY(-2px)",
                    borderColor: "#10B981",
                  },
                }}
                onClick={() => navigate("/admin/under-construction", { state: { pageName: "Analytics" } })}
              >
                <CardContent sx={{ p: 3 }}>
                  <Box
                    sx={{
                      width: 56,
                      height: 56,
                      borderRadius: 2,
                      backgroundColor: "#F3F4F6",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      mb: 2,
                    }}
                  >
                    <Analytics sx={{ color: "#6B7280", fontSize: 32 }} />
                  </Box>
                  <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
                    Analytics
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    View system analytics and reports
                  </Typography>
                  <Chip label="Coming Soon" size="small" sx={{ bgcolor: "#FEF3C7", color: "#D97706", fontWeight: 600 }} />
                </CardContent>
              </Card>
            </Grid>

            {/* System Settings */}
            <Grid item xs={12} sm={6} md={4}>
              <Card
                sx={{
                  height: "100%",
                  borderRadius: 2,
                  border: "1px solid #E8EAED",
                  boxShadow: "none",
                  cursor: "pointer",
                  transition: "all 0.2s ease",
                  "&:hover": {
                    boxShadow: "0 4px 12px rgba(16, 185, 129, 0.15)",
                    transform: "translateY(-2px)",
                    borderColor: "#10B981",
                  },
                }}
                onClick={() => navigate("/admin/under-construction", { state: { pageName: "System Settings" } })}
              >
                <CardContent sx={{ p: 3 }}>
                  <Box
                    sx={{
                      width: 56,
                      height: 56,
                      borderRadius: 2,
                      backgroundColor: "#F3F4F6",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      mb: 2,
                    }}
                  >
                    <Settings sx={{ color: "#6B7280", fontSize: 32 }} />
                  </Box>
                  <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
                    System Settings
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    Configure system preferences
                  </Typography>
                  <Chip label="Coming Soon" size="small" sx={{ bgcolor: "#FEF3C7", color: "#D97706", fontWeight: 600 }} />
                </CardContent>
              </Card>
            </Grid>

            {/* Database */}
            <Grid item xs={12} sm={6} md={4}>
              <Card
                sx={{
                  height: "100%",
                  borderRadius: 2,
                  border: "1px solid #E8EAED",
                  boxShadow: "none",
                  cursor: "pointer",
                  transition: "all 0.2s ease",
                  "&:hover": {
                    boxShadow: "0 4px 12px rgba(16, 185, 129, 0.15)",
                    transform: "translateY(-2px)",
                    borderColor: "#10B981",
                  },
                }}
                onClick={() => navigate("/admin/under-construction", { state: { pageName: "Database Management" } })}
              >
                <CardContent sx={{ p: 3 }}>
                  <Box
                    sx={{
                      width: 56,
                      height: 56,
                      borderRadius: 2,
                      backgroundColor: "#F3F4F6",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      mb: 2,
                    }}
                  >
                    <Storage sx={{ color: "#6B7280", fontSize: 32 }} />
                  </Box>
                  <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
                    Database
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    Database management and backups
                  </Typography>
                  <Chip label="Coming Soon" size="small" sx={{ bgcolor: "#FEF3C7", color: "#D97706", fontWeight: 600 }} />
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Box>
      </Container>
    </Box>
  );
}

export default AdminDashboard;
