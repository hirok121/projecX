import React from "react";
import {
  Box,
  Container,
  Typography,
  Button,
  Paper,
  ThemeProvider,
  createTheme,
} from "@mui/material";
import { styled, keyframes } from "@mui/material/styles";
import heroImage from "../../assets/hero.png";

// Theme configuration
const theme = createTheme({
  palette: {
    primary: { main: "#2C3E50" },
    secondary: { main: "#34495E" },
    background: {
      default: "#FAFAFA",
      paper: "#FFFFFF",
      hero: "#FFFFFF",
      sectionAlternate: "#F8F9FA",
      sectionDefault: "#FFFFFF",
    },
    text: {
      primary: "#2C3E50",
      secondary: "#5D6D7E",
      heroPrimary: "#2C3E50",
      heroSecondary: "#5D6D7E",
    },
  },
  typography: {
    fontFamily:
      "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
    h1: {
      fontWeight: 600,
      fontSize: "2.5rem",
      lineHeight: 1.3,
      color: "#2C3E50",
      "@media (min-width:600px)": { fontSize: "3rem" },
      "@media (min-width:900px)": { fontSize: "3.5rem" },
      letterSpacing: "-0.02em",
    },
    h2: {
      fontWeight: 600,
      fontSize: "2rem",
      marginBottom: "1rem",
      color: "#2C3E50",
      "@media (min-width:600px)": { fontSize: "2.5rem" },
      letterSpacing: "-0.01em",
    },
    h3: {
      fontWeight: 500,
      fontSize: "1.5rem",
      marginBottom: "0.75rem",
      color: "#2C3E50",
    },
    h4: { fontWeight: 500, fontSize: "1.25rem", color: "#2C3E50" },
    body1: { fontSize: "1.0625rem", lineHeight: 1.6, color: "#5D6D7E" },
    body2: { fontSize: "0.9375rem", lineHeight: 1.5, color: "#7F8C8D" },
    subtitle1: {
      fontSize: "1.125rem",
      color: "#5D6D7E",
      marginBottom: "3rem",
      maxWidth: "70ch",
      marginLeft: "auto",
      marginRight: "auto",
      lineHeight: 1.6,
      "@media (min-width:600px)": { fontSize: "1.1875rem" },
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: "4px",
          textTransform: "none",
          padding: "12px 32px",
          fontWeight: 500,
          boxShadow: "none",
          transition: "all 0.2s ease",
          fontSize: "1rem",
        },
        containedPrimary: {
          backgroundColor: "#2C3E50",
          color: "white",
          "&:hover": { backgroundColor: "#34495E", boxShadow: "none" },
        },
        containedSizeLarge: { padding: "14px 36px", fontSize: "1.0625rem" },
        outlinedPrimary: {
          borderColor: "#2C3E50",
          borderWidth: "1.5px",
          color: "#2C3E50",
          "&:hover": {
            backgroundColor: "rgba(44, 62, 80, 0.04)",
            borderColor: "#34495E",
            borderWidth: "1.5px",
          },
        },
      },
    },
    MuiCard: {
      defaultProps: { elevation: 0 },
      styleOverrides: {
        root: {
          borderRadius: "8px",
          border: "1px solid #E8EAED",
          transition: "all 0.2s ease",
          "&:hover": {
            borderColor: "#D1D5DB",
            boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
          },
        },
      },
    },
    MuiPaper: {
      styleOverrides: { root: { transition: "all 0.2s ease" } },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: "rgba(255, 255, 255, 0.95)",
          backdropFilter: "blur(10px)",
          boxShadow: "0 1px 0 rgba(0,0,0,0.05)",
        },
      },
    },
  },
});

// Animations
const fadeInAnimation = keyframes`
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
`;

const StyledSection = styled(Paper)(({ theme }) => ({
  paddingTop: theme.spacing(12),
  paddingBottom: theme.spacing(12),
  backgroundColor: "#F8F9FA",
  borderRadius: 0,
  boxShadow: "none",
  borderBottom: "1px solid #E8EAED",
  "@media (max-width: 600px)": {
    paddingTop: theme.spacing(8),
    paddingBottom: theme.spacing(8),
  },
}));

const AnimatedBox = styled(Box)(({ animationDelay = "0s" }) => ({
  animation: `${fadeInAnimation} 0.8s ease-out ${animationDelay} both`,
}));

const HeroImage = styled("img")(({ theme }) => ({
  width: "100%",
  height: "auto",
  borderRadius: "8px",
  border: "1px solid #E8EAED",
  objectFit: "cover",
  maxHeight: "450px",
  boxShadow: "0 4px 12px rgba(0,0,0,0.06)",
  "@media (max-width: 600px)": {
    maxHeight: "300px",
  },
}));

const Hero = () => (
  <ThemeProvider theme={theme}>
    <StyledSection
      elevation={0}
      sx={{
        mt: 0,
        pt: { xs: 10, md: 12 },
        pb: { xs: 8, md: 10 },
        minHeight: { xs: "80vh", md: "85vh" },
        display: "flex",
        alignItems: "center",
      }}
    >
      <Container maxWidth="lg">
        <Box
          sx={{
            display: "flex",
            flexDirection: { xs: "column", md: "row" },
            alignItems: "center",
            gap: { xs: 4, md: 8 },
          }}
        >
          {/* Text content - Left side */}
          <Box
            sx={{
              flex: { xs: "1 1 100%", md: "1 1 55%" },
              textAlign: { xs: "center", md: "left" },
            }}
          >
            <AnimatedBox animationDelay="0s">
              <Typography variant="h1" gutterBottom sx={{ mb: 3 }}>
                AI-Powered Medical Diagnosis{" "}
                <Box
                  component="span"
                  sx={{ color: theme.palette.primary.main }}
                >
                  Platform
                </Box>
              </Typography>
              <Typography
                variant="h5"
                color="text.secondary"
                paragraph
                sx={{
                  mb: 5,
                  maxWidth: { xs: "100%", md: "55ch" },
                  mx: { xs: "auto", md: 0 },
                  fontSize: { xs: "1.1rem", md: "1.25rem" },
                  lineHeight: 1.6,
                }}
              >
                Access research-grade machine learning models from scientists
                worldwide. Diagnose multiple diseases through X-rays, lab data,
                and clinical parameters—all in one platform.
              </Typography>
              <Box
                sx={{
                  display: "flex",
                  flexDirection: { xs: "column", sm: "row" },
                  gap: 2,
                  justifyContent: { xs: "center", md: "flex-start" },
                }}
              >
                <Button
                  variant="contained"
                  color="primary"
                  size="large"
                  onClick={() => {
                    window.location.href = "/diagnosis";
                  }}
                  sx={{
                    minWidth: "200px",
                    backgroundColor: "#10B981",
                    "&:hover": {
                      backgroundColor: "#059669",
                    },
                  }}
                >
                  Explore Diagnosis Tools
                </Button>
                <Button
                  variant="outlined"
                  color="primary"
                  size="large"
                  onClick={() => {
                    document
                      .getElementById("disease-showcase")
                      ?.scrollIntoView({
                        behavior: "smooth",
                      });
                  }}
                  sx={{
                    minWidth: "200px",
                    color: "#10B981",
                    borderColor: "#10B981",
                    "&:hover": {
                      borderColor: "#059669",
                      backgroundColor: "rgba(16, 185, 129, 0.04)",
                    },
                  }}
                >
                  View Available Diseases
                </Button>
              </Box>
            </AnimatedBox>
          </Box>

          {/* Image content - Right side */}
          <Box
            sx={{
              flex: { xs: "1 1 100%", md: "1 1 45%" },
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <AnimatedBox
              animationDelay="0.2s"
              sx={{
                width: "100%",
                maxWidth: {
                  xs: "400px",
                  md: "500px",
                },
              }}
            >
              <HeroImage
                src={heroImage}
                alt="AI-powered medical diagnosis platform"
              />
            </AnimatedBox>
          </Box>
        </Box>
      </Container>
    </StyledSection>
  </ThemeProvider>
);

export default Hero;
