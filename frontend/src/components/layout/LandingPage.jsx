import { useState, useEffect } from "react";
import { Box, Alert, Container, IconButton } from "@mui/material";
import { Close } from "@mui/icons-material";
import { useLocation } from "react-router-dom";
import WebsiteTheme from "../../theme/WebsiteTheme";
import NavBar from "./NavBar";
import Hero from "../landingPageComponents/Hero";
import PlatformOverview from "../landingPageComponents/PlatformOverview";
import DiseaseShowcase from "../landingPageComponents/DiseaseShowcase";
import AiMedicalAssistant from "../landingPageComponents/AiMedicalAssistant";
import Footer from "../landingPageComponents/Footer";
import BlogSection from "../landingPageComponents/BlogSection";

export default function LandingPage() {
  const location = useLocation();
  const [alertMessage, setAlertMessage] = useState(null);

  useEffect(() => {
    // Check if there's a message in the location state
    if (location.state?.message) {
      setAlertMessage({
        message: location.state.message,
        type: location.state.type || "info",
      });

      // Clear the location state to prevent message from showing again on refresh
      window.history.replaceState({}, document.title);

      // Auto-hide after 8 seconds
      const timer = setTimeout(() => {
        setAlertMessage(null);
      }, 8000);

      return () => clearTimeout(timer);
    }
  }, [location]);

  return (
    <WebsiteTheme>
      <Box>
        <NavBar />

        {/* Alert Message */}
        {alertMessage && (
          <Container maxWidth="lg" sx={{ pt: 2 }}>
            <Alert
              severity={alertMessage.type}
              sx={{
                borderRadius: 2,
                boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                "& .MuiAlert-message": {
                  width: "100%",
                },
              }}
              action={
                <IconButton
                  aria-label="close"
                  color="inherit"
                  size="small"
                  onClick={() => setAlertMessage(null)}
                >
                  <Close fontSize="inherit" />
                </IconButton>
              }
            >
              {alertMessage.message}
            </Alert>
          </Container>
        )}

        <Hero />
        <PlatformOverview id="platform-overview" />
        <DiseaseShowcase id="disease-showcase" />
        <AiMedicalAssistant id="ai-medical-assistant" />
        <BlogSection id="blog-section" />
        <Footer />
      </Box>
    </WebsiteTheme>
  );
}
