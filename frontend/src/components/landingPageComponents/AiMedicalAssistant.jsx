import React from "react";
import {
  Box,
  Container,
  Typography,
  Button,
  Paper,
  ThemeProvider,
  createTheme,
  Grid,
  Card,
  CardContent,
} from "@mui/material";
import { styled, keyframes } from "@mui/material/styles";
import {
  Psychology,
  HealthAndSafety,
  Medication,
  Timeline,
  Chat,
  SmartToy,
  LocalHospital,
  MenuBook,
  Science,
  AutoAwesome,
  School,
  Support,
  Assessment,
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";

// Animations
const fadeInAnimation = keyframes`
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
`;

// Styled components
const StyledSection = styled(Paper)(({ theme }) => ({
  paddingTop: theme.spacing(12),
  paddingBottom: theme.spacing(12),
  backgroundColor: "#FFFFFF",
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

const FeatureCard = styled(Card)(({ theme }) => ({
  height: "100%",
  borderRadius: "8px",
  border: "1px solid #E8EAED",
  boxShadow: "none",
  transition: "all 0.2s ease",
  backgroundColor: "#F8F9FA",
  "&:hover": {
    transform: "translateY(-2px)",
    boxShadow: "0 2px 8px rgba(44, 62, 80, 0.08)",
    borderColor: "#D1D5DB",
  },
}));

const IconWrapper = styled(Box)(({ theme }) => ({
  width: "48px",
  height: "48px",
  borderRadius: "50%",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  backgroundColor: "#ECFDF5",
  color: "#10B981",
  marginBottom: theme.spacing(2),
}));

// Matching theme from DiagnosticToolSection
const theme = createTheme({
  palette: {
    primary: { main: "#10B981" },
    secondary: { main: "#34D399" },
    background: {
      default: "#F0F4F8",
      paper: "#FFFFFF",
      hero: "#0F172A",
      sectionAlternate: "#FFFFFF",
      sectionDefault: "#F0F4F8",
    },
    text: {
      primary: "#1E293B",
      secondary: "#475569",
      heroPrimary: "#FFFFFF",
      heroSecondary: "rgba(255, 255, 255, 0.85)",
    },
  },
  typography: {
    fontFamily: "Inter, sans-serif",
    h2: {
      fontWeight: 700,
      fontSize: "2.25rem",
      marginBottom: "1rem",
      color: "#1E293B",
      "@media (min-width:600px)": { fontSize: "2.75rem" },
    },
    h3: {
      fontWeight: 600,
      fontSize: "1.5rem",
      color: "#1E293B",
      marginBottom: "0.5rem",
    },
    h5: {
      fontSize: "1.125rem",
      color: "#475569",
      lineHeight: 1.7,
      "@media (min-width:600px)": { fontSize: "1.25rem" },
    },
    body1: {
      fontSize: "1rem",
      lineHeight: 1.7,
      color: "#475569",
    },
    body2: {
      fontSize: "0.875rem",
      lineHeight: 1.6,
      color: "#475569",
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: "8px",
          textTransform: "none",
          padding: "10px 24px",
          fontWeight: 600,
          boxShadow: "none",
          transition: "background-color 0.3s ease, transform 0.2s ease",
        },
        containedPrimary: {
          color: "white",
          "&:hover": { backgroundColor: "#059669", transform: "scale(1.03)" },
        },
        containedSizeLarge: { padding: "12px 28px", fontSize: "1rem" },
        outlinedPrimary: {
          borderColor: "#10B981",
          color: "#10B981",
          "&:hover": {
            backgroundColor: "rgba(37, 99, 235, 0.04)",
            borderColor: "#1D4ED8",
          },
        },
      },
    },
  },
});

const AiMedicalAssistant = ({ id }) => {
  const navigate = useNavigate();
  const features = [
    {
      icon: <Psychology />,
      title: "Disease Information",
      desc: "Learn about symptoms, stages, and progression of various medical conditions with comprehensive, easy-to-understand explanations.",
    },
    {
      icon: <Medication />,
      title: "Treatment Options",
      desc: "Explore therapies, medications, and treatment protocols across different diseases with detailed information on effectiveness and considerations.",
    },
    {
      icon: <Science />,
      title: "Research Insights",
      desc: "Access latest clinical studies, research findings, and evidence-based guidelines from leading medical institutions worldwide.",
    },
    {
      icon: <Assessment />,
      title: "Understanding Test Results",
      desc: "Interpret lab values, biomarkers, and diagnostic test results with clear explanations of what different measurements indicate.",
    },
    {
      icon: <School />,
      title: "Medical Education",
      desc: "Decode medical terminology and complex healthcare concepts with straightforward, accessible language you can understand.",
    },
    {
      icon: <Support />,
      title: "Care Support",
      desc: "Receive lifestyle guidance, dietary recommendations, and preventive measures tailored to various health conditions.",
    },
  ];

  return (
    <ThemeProvider theme={theme}>
      <StyledSection
        id={id}
        elevation={0}
        sx={{
          backgroundColor: "transparent",
          mt: 0,
          pt: { xs: 4, md: 6 },
          pb: { xs: 4, md: 6 },
        }}
      >
        <Container maxWidth="lg">
          {/* Header Section */}
          <AnimatedBox animationDelay="0.1s">
            <Box sx={{ textAlign: "center", mb: 6 }}>
              <Box
                sx={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 2,
                  mb: 3,
                }}
              >
                <AutoAwesome
                  sx={{ color: theme.palette.primary.main, fontSize: "2rem" }}
                />
                <Typography variant="h2">
                  Your Intelligent{" "}
                  <Box
                    component="span"
                    sx={{ color: theme.palette.primary.main }}
                  >
                    Medical Research Companion
                  </Box>
                </Typography>
              </Box>

              <Typography
                variant="h5"
                sx={{
                  maxWidth: "80ch",
                  mx: "auto",
                  color: "#475569",
                  fontWeight: 400,
                  mb: 4,
                }}
              >
                Get instant, evidence-based answers about any medical condition.
                Our AI assistant provides{" "}
                <Box
                  component="span"
                  sx={{
                    color: theme.palette.primary.main,
                    fontWeight: 600,
                    backgroundColor: "rgba(37, 99, 235, 0.1)",
                    px: 1,
                    py: 0.25,
                    borderRadius: "4px",
                  }}
                >
                  comprehensive guidance on diseases, symptoms, treatments
                </Box>{" "}
                and diagnostic processes, helping you understand medical
                information with reliable, up-to-date research from trusted
                sources.
              </Typography>

              {/* Educational Notice */}
              <Box
                sx={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 1,
                  p: 2,
                  backgroundColor: "rgba(37, 99, 235, 0.05)",
                  borderRadius: "12px",
                  border: "1px solid rgba(37, 99, 235, 0.1)",
                  mb: 4,
                }}
              >
                <LocalHospital sx={{ color: "#059669" }} />
                <Typography
                  variant="body2"
                  sx={{ color: "#059669", fontWeight: 600 }}
                >
                  Educational & Research Platform
                </Typography>
                <Typography variant="body2" sx={{ color: "#475569" }}>
                  • Always consult qualified healthcare professionals for
                  medical decisions
                </Typography>
              </Box>
            </Box>
          </AnimatedBox>

          {/* Features Grid */}
          <AnimatedBox animationDelay="0.3s">
            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                gap: 4,
                mb: 6,
              }}
            >
              {/* First Row - 3 items */}
              <Box
                sx={{
                  display: "flex",
                  gap: 4,
                  justifyContent: "center",
                  flexWrap: { xs: "wrap", lg: "nowrap" },
                }}
              >
                {features.slice(0, 3).map((feature, index) => (
                  <Box
                    key={index}
                    sx={{
                      flex: { xs: "1 1 100%", sm: "1 1 45%", lg: "1 1 30%" },
                      maxWidth: { xs: "100%", sm: "45%", lg: "30%" },
                      minWidth: "280px",
                    }}
                  >
                    <FeatureCard>
                      <CardContent sx={{ p: 4, textAlign: "center" }}>
                        <IconWrapper
                          sx={{ mx: "auto", animationDelay: `${index * 0.5}s` }}
                        >
                          {feature.icon}
                        </IconWrapper>
                        <Typography variant="h3" gutterBottom>
                          {feature.title}
                        </Typography>
                        <Typography variant="body1" sx={{ color: "#64748B" }}>
                          {feature.desc}
                        </Typography>
                      </CardContent>
                    </FeatureCard>
                  </Box>
                ))}
              </Box>

              {/* Second Row - 3 items */}
              <Box
                sx={{
                  display: "flex",
                  gap: 4,
                  justifyContent: "center",
                  flexWrap: { xs: "wrap", lg: "nowrap" },
                }}
              >
                {features.slice(3, 6).map((feature, index) => (
                  <Box
                    key={index + 3}
                    sx={{
                      flex: { xs: "1 1 100%", sm: "1 1 45%", lg: "1 1 30%" },
                      maxWidth: { xs: "100%", sm: "45%", lg: "30%" },
                      minWidth: "280px",
                    }}
                  >
                    <FeatureCard>
                      <CardContent sx={{ p: 4, textAlign: "center" }}>
                        <IconWrapper
                          sx={{
                            mx: "auto",
                            animationDelay: `${(index + 3) * 0.5}s`,
                          }}
                        >
                          {feature.icon}
                        </IconWrapper>
                        <Typography variant="h3" gutterBottom>
                          {feature.title}
                        </Typography>
                        <Typography variant="body1" sx={{ color: "#64748B" }}>
                          {feature.desc}
                        </Typography>
                      </CardContent>
                    </FeatureCard>
                  </Box>
                ))}
              </Box>
            </Box>
          </AnimatedBox>

          {/* CTA Section */}
          <AnimatedBox animationDelay="0.5s">
            <Box
              sx={{
                textAlign: "center",
                p: 4,
                backgroundColor: "rgba(37, 99, 235, 0.02)",
                borderRadius: "20px",
                border: "1px solid rgba(37, 99, 235, 0.08)",
              }}
            >
              <Typography variant="h3" gutterBottom sx={{ mb: 3 }}>
                Ready to Get Started?
              </Typography>
              <Typography
                variant="body1"
                sx={{ mb: 4, maxWidth: "60ch", mx: "auto" }}
              >
                Begin your journey with our AI-powered medical assistant and
                access comprehensive health information across multiple
                conditions.
              </Typography>

              <Box
                sx={{
                  display: "flex",
                  gap: 2,
                  justifyContent: "center",
                  flexWrap: "wrap",
                }}
              >
                <Button
                  variant="contained"
                  color="primary"
                  size="large"
                  endIcon={<Chat />}
                  onClick={() => navigate("/ai-assistant")}
                  sx={{
                    minWidth: "200px",
                    fontSize: "1rem",
                  }}
                >
                  Chat with AI Assistant
                </Button>
                <Button
                  variant="outlined"
                  color="primary"
                  size="large"
                  endIcon={<MenuBook />}
                  onClick={() => navigate("/research")}
                  sx={{
                    minWidth: "180px",
                    borderColor: theme.palette.primary.main,
                    color: theme.palette.primary.main,
                    "&:hover": {
                      backgroundColor: "rgba(37, 99, 235, 0.04)",
                      borderColor: "#1D4ED8",
                    },
                  }}
                >
                  Medical Library
                </Button>
              </Box>
            </Box>
          </AnimatedBox>
        </Container>
      </StyledSection>
    </ThemeProvider>
  );
};

export default AiMedicalAssistant;
