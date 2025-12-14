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
} from "@mui/material";
import {
  People,
  SupervisorAccount,
  Refresh,
  BugReport,
  Storage,
} from "@mui/icons-material";
import { useAuth } from "../../context/AuthContext";
import api from "../../services/api";
import AdminNavBar from "../../components/admin/AdminNavbar";

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
      console.error("Dashboard data fetch error:", error);
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
              Debug Console
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
        <Grid container spacing={3}>
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
      </Container>
    </Box>
  );
}

export default AdminDashboard;
