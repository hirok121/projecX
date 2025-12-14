import { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Button,
  Grid,
  Card,
  CardContent,
  Chip,
  Container,
  Divider,
} from "@mui/material";
import {
  BugReport,
  CheckCircle,
  Error,
  Refresh,
  Person,
  Token,
  Api,
  Computer,
} from "@mui/icons-material";
import { useAuth } from "../../context/AuthContext";
import { API_CONFIG, AUTH_CONFIG } from "../../config/constants";
import AdminNavbar from "../../components/admin/AdminNavbar";

function AdminDebugConsole() {
  const { user, isAuthorized, isStaff, loading } = useAuth();
  const [systemInfo, setSystemInfo] = useState({});

  const checkSystemInfo = () => {
    const accessToken = localStorage.getItem(AUTH_CONFIG.ACCESS_TOKEN_KEY);
    const refreshToken = localStorage.getItem(AUTH_CONFIG.REFRESH_TOKEN_KEY);

    const info = {
      // User Info
      currentUser: user?.email || user?.username || "Not logged in",
      firstName: user?.first_name || "N/A",
      lastName: user?.last_name || "N/A",
      isStaff: isStaff,
      isSuperuser: user?.is_superuser || false,
      isAuthorized: isAuthorized,
      authLoading: loading,

      // Token Info
      accessToken: accessToken ? "✓ Present" : "✗ Missing",
      refreshToken: refreshToken ? "✓ Present" : "✗ Missing",

      // API Info
      apiBaseUrl: API_CONFIG.BASE_URL,
      currentUrl: window.location.href,

      // System Info
      browser: navigator.userAgent.split(" ").slice(-2).join(" "),
      timestamp: new Date().toLocaleString(),
    };
    setSystemInfo(info);
  };

  useEffect(() => {
    checkSystemInfo();
  }, [user, isAuthorized, isStaff, loading]);

  const InfoCard = ({ title, icon: Icon, data, color = "#10B981" }) => (
    <Card sx={{ height: "100%" }}>
      <CardContent>
        <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
          <Icon sx={{ fontSize: 28, color, mr: 1 }} />
          <Typography variant="h6" fontWeight={600}>
            {title}
          </Typography>
        </Box>
        <Divider sx={{ mb: 2 }} />
        {Object.entries(data).map(([key, value]) => (
          <Box
            key={key}
            sx={{
              display: "flex",
              justifyContent: "space-between",
              py: 1,
              borderBottom: "1px solid #F3F4F6",
            }}
          >
            <Typography variant="body2" color="text.secondary" fontWeight={500}>
              {key
                .replace(/([A-Z])/g, " $1")
                .replace(/^./, (str) => str.toUpperCase())}
              :
            </Typography>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              {typeof value === "boolean" ? (
                value ? (
                  <CheckCircle sx={{ fontSize: 18, color: "#10B981" }} />
                ) : (
                  <Error sx={{ fontSize: 18, color: "#EF4444" }} />
                )
              ) : null}
              <Typography
                variant="body2"
                fontWeight={600}
                sx={{
                  color:
                    typeof value === "string" && value.includes("✓")
                      ? "#10B981"
                      : typeof value === "string" && value.includes("✗")
                      ? "#EF4444"
                      : "#2C3E50",
                  maxWidth: 300,
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}
              >
                {String(value)}
              </Typography>
            </Box>
          </Box>
        ))}
      </CardContent>
    </Card>
  );

  return (
    <Box sx={{ minHeight: "100vh", backgroundColor: "#F8F9FA" }}>
      <AdminNavbar />
      <Container maxWidth="xl" sx={{ py: 6 }}>
        {/* Header */}
        <Box sx={{ mb: 5 }}>
          <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
            <BugReport sx={{ fontSize: 40, color: "#10B981", mr: 2 }} />
            <Box>
              <Typography variant="h3" fontWeight={700} color="#2C3E50">
                Debug Console
              </Typography>
              <Typography variant="body1" color="text.secondary">
                System and authentication information
              </Typography>
            </Box>
          </Box>
          <Button
            onClick={checkSystemInfo}
            variant="contained"
            startIcon={<Refresh />}
            sx={{
              backgroundColor: "#10B981",
              "&:hover": { backgroundColor: "#059669" },
              mt: 2,
            }}
          >
            Refresh All Data
          </Button>
        </Box>

        <Grid container spacing={3}>
          {/* User Information */}
          <Grid item xs={12} md={6}>
            <InfoCard
              title="User Information"
              icon={Person}
              color="#10B981"
              data={{
                currentUser: systemInfo.currentUser,
                firstName: systemInfo.firstName,
                lastName: systemInfo.lastName,
                isStaff: systemInfo.isStaff,
                isSuperuser: systemInfo.isSuperuser,
                isAuthorized: systemInfo.isAuthorized,
                authLoading: systemInfo.authLoading,
              }}
            />
          </Grid>

          {/* Token Information */}
          <Grid item xs={12} md={6}>
            <InfoCard
              title="Authentication Tokens"
              icon={Token}
              color="#10B981"
              data={{
                accessToken: systemInfo.accessToken,
                refreshToken: systemInfo.refreshToken,
              }}
            />
          </Grid>

          {/* API Information */}
          <Grid item xs={12} md={6}>
            <InfoCard
              title="API Configuration"
              icon={Api}
              color="#10B981"
              data={{
                apiBaseUrl: systemInfo.apiBaseUrl,
                currentUrl: systemInfo.currentUrl,
              }}
            />
          </Grid>

          {/* System Information */}
          <Grid item xs={12} md={6}>
            <InfoCard
              title="System Information"
              icon={Computer}
              color="#10B981"
              data={{
                browser: systemInfo.browser,
                timestamp: systemInfo.timestamp,
              }}
            />
          </Grid>

          {/* Status Summary */}
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Typography variant="h6" fontWeight={600} sx={{ mb: 3 }}>
                  Status Summary
                </Typography>
                <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
                  <Chip
                    icon={systemInfo.isAuthorized ? <CheckCircle /> : <Error />}
                    label={`Authentication: ${
                      systemInfo.isAuthorized ? "Active" : "Inactive"
                    }`}
                    color={systemInfo.isAuthorized ? "success" : "error"}
                    sx={{ px: 2, py: 2.5, fontSize: "0.95rem" }}
                  />
                  <Chip
                    icon={systemInfo.isStaff ? <CheckCircle /> : <Error />}
                    label={`Staff Access: ${
                      systemInfo.isStaff ? "Granted" : "Denied"
                    }`}
                    color={systemInfo.isStaff ? "success" : "default"}
                    sx={{ px: 2, py: 2.5, fontSize: "0.95rem" }}
                  />
                  <Chip
                    icon={
                      systemInfo.accessToken?.includes("✓") ? (
                        <CheckCircle />
                      ) : (
                        <Error />
                      )
                    }
                    label={`Access Token: ${
                      systemInfo.accessToken?.includes("✓")
                        ? "Valid"
                        : "Missing"
                    }`}
                    color={
                      systemInfo.accessToken?.includes("✓")
                        ? "success"
                        : "error"
                    }
                    sx={{ px: 2, py: 2.5, fontSize: "0.95rem" }}
                  />
                  <Chip
                    icon={
                      systemInfo.refreshToken?.includes("✓") ? (
                        <CheckCircle />
                      ) : (
                        <Error />
                      )
                    }
                    label={`Refresh Token: ${
                      systemInfo.refreshToken?.includes("✓")
                        ? "Valid"
                        : "Missing"
                    }`}
                    color={
                      systemInfo.refreshToken?.includes("✓")
                        ? "success"
                        : "error"
                    }
                    sx={{ px: 2, py: 2.5, fontSize: "0.95rem" }}
                  />
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
}

export default AdminDebugConsole;
