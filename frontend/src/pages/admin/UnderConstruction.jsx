import { Box, Container, Typography, Button } from "@mui/material";
import { Construction, ArrowBack } from "@mui/icons-material";
import { useNavigate, useLocation } from "react-router-dom";
import AdminNavbar from "../../components/admin/AdminNavbar";

function UnderConstruction() {
  const navigate = useNavigate();
  const location = useLocation();

  // Get the page name from the state or pathname
  const pageName = location.state?.pageName || "This Page";

  const handleGoBack = () => {
    navigate(-1);
  };

  return (
    <Box sx={{ minHeight: "100vh", backgroundColor: "#F8F9FA" }}>
      <AdminNavbar />

      <Container maxWidth="md" sx={{ py: 8 }}>
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            minHeight: "60vh",
            textAlign: "center",
          }}
        >
          <Construction
            sx={{
              fontSize: 120,
              color: "#10B981",
              mb: 4,
              animation: "bounce 2s infinite",
              "@keyframes bounce": {
                "0%, 100%": {
                  transform: "translateY(0)",
                },
                "50%": {
                  transform: "translateY(-20px)",
                },
              },
            }}
          />

          <Typography
            variant="h2"
            sx={{
              fontWeight: 700,
              color: "#2C3E50",
              mb: 2,
              fontSize: { xs: "2rem", md: "3rem" },
            }}
          >
            {pageName}
          </Typography>

          <Typography
            variant="h5"
            sx={{
              fontWeight: 600,
              color: "#6B7280",
              mb: 4,
            }}
          >
            Under Construction
          </Typography>

          <Typography
            variant="body1"
            sx={{
              color: "#9CA3AF",
              mb: 6,
              maxWidth: 500,
            }}
          >
            We're working hard to bring you this feature. Please check back soon
            for updates and new functionality.
          </Typography>

          <Button
            variant="contained"
            size="large"
            startIcon={<ArrowBack />}
            onClick={handleGoBack}
            sx={{
              backgroundColor: "#10B981",
              px: 4,
              py: 1.5,
              fontSize: "1rem",
              fontWeight: 600,
              "&:hover": {
                backgroundColor: "#059669",
                transform: "translateY(-2px)",
                boxShadow: "0 8px 24px rgba(16, 185, 129, 0.3)",
              },
              transition: "all 0.3s ease",
            }}
          >
            Go Back
          </Button>
        </Box>
      </Container>
    </Box>
  );
}

export default UnderConstruction;
