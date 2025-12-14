import React, { useEffect, useState } from "react";
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
  Chip,
} from "@mui/material";
import { styled, keyframes } from "@mui/material/styles";
import {
  Favorite,
  Bloodtype,
  LocalHospital,
  MonitorHeart,
  ArrowForward,
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import { diagnosisAPI } from "../../services/diagnosisAPI";

// Animations
const fadeInAnimation = keyframes`
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
`;

// Styled components
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

const DiseaseCard = styled(Card)(({ theme }) => ({
  height: "420px",
  display: "flex",
  flexDirection: "column",
  borderRadius: "8px",
  border: "1px solid #E8EAED",
  boxShadow: "none",
  transition: "all 0.2s ease",
  cursor: "pointer",
  backgroundColor: "#FFFFFF",
  "&:hover": {
    transform: "translateY(-2px)",
    boxShadow: "0 4px 12px rgba(44, 62, 80, 0.12)",
    borderColor: "#2C3E50",
  },
}));

const IconWrapper = styled(Box)(({ theme }) => ({
  width: "56px",
  height: "56px",
  borderRadius: "50%",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  backgroundColor: "#ECFDF5",
  color: "#10B981",
  marginBottom: theme.spacing(2),
}));

const theme = createTheme({
  palette: {
    primary: { main: "#10B981" },
    secondary: { main: "#34D399" },
    success: { main: "#059669" },
    text: {
      primary: "#1E293B",
      secondary: "#475569",
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
    h5: {
      fontSize: "1.125rem",
      color: "#475569",
      lineHeight: 1.7,
      "@media (min-width:600px)": { fontSize: "1.25rem" },
    },
    h4: {
      fontWeight: 600,
      fontSize: "1.4rem",
      color: "#1E293B",
    },
    body1: {
      fontSize: "1rem",
      lineHeight: 1.7,
      color: "#475569",
    },
    body2: {
      fontSize: "0.875rem",
      lineHeight: 1.6,
      color: "#64748B",
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
          transition: "all 0.3s ease",
        },
        containedPrimary: {
          color: "white",
          "&:hover": { backgroundColor: "#059669", transform: "scale(1.03)" },
        },
        outlinedPrimary: {
          borderWidth: "2px",
          "&:hover": {
            borderWidth: "2px",
            backgroundColor: "rgba(37, 99, 235, 0.04)",
          },
        },
      },
    },
  },
});

// Default featured diseases (fallback if API fails)
const defaultDiseases = [
  {
    id: 1,
    name: "Hepatocellular Carcinoma (HCV)",
    icon: <Bloodtype sx={{ fontSize: 40 }} />,
    modalities: ["Lab Data", "Ultrasound", "MRI", "CT Scan"],
    modelCount: 7,
    accuracy: 92,
    category: "Hepatology",
  },
  {
    id: 2,
    name: "Alzheimer's Disease",
    icon: <LocalHospital sx={{ fontSize: 40 }} />,
    modalities: ["MRI", "PET Scan", "Cognitive Tests", "Blood Tests"],
    modelCount: 5,
    accuracy: 88,
    category: "Neurology",
  },
  {
    id: 3,
    name: "Brain Tumor Detection",
    icon: <MonitorHeart sx={{ fontSize: 40 }} />,
    modalities: ["MRI", "CT Scan", "PET Scan", "Biopsy"],
    modelCount: 12,
    accuracy: 94,
    category: "Oncology",
  },
  {
    id: 4,
    name: "Cardiac Arrhythmia",
    icon: <Favorite sx={{ fontSize: 40 }} />,
    modalities: ["ECG", "Holter Monitor", "Echocardiogram", "Stress Test"],
    modelCount: 9,
    accuracy: 91,
    category: "Cardiology",
  },
];

const DiseaseShowcase = ({ id }) => {
  const navigate = useNavigate();
  const diseases = defaultDiseases;

  const handleDiseaseClick = (diseaseId) => {
    navigate(`/diagnosis?disease_id=${diseaseId}`);
  };

  return (
    <ThemeProvider theme={theme}>
      <StyledSection
        id={id}
        elevation={0}
        sx={{
          backgroundColor: "transparent",
          mt: 0,
          pt: { xs: 6, md: 10 },
          pb: { xs: 6, md: 10 },
        }}
      >
        <Container maxWidth="lg">
          {/* Title section */}
          <Box
            sx={{
              textAlign: "center",
              mb: 6,
            }}
          >
            <AnimatedBox animationDelay="0s">
              <Typography variant="h2" gutterBottom sx={{ mb: 2 }}>
                Diagnose Across{" "}
                <Box
                  component="span"
                  sx={{ color: theme.palette.primary.main }}
                >
                  Multiple Medical Conditions
                </Box>
              </Typography>
              <Typography
                variant="h5"
                paragraph
                sx={{
                  maxWidth: "70ch",
                  mx: "auto",
                  color: "#475569",
                }}
              >
                Each disease supported by multiple ML models with different
                modalities and approaches
              </Typography>
            </AnimatedBox>
          </Box>

          {/* Disease Cards Grid */}
          <Box sx={{ mb: 6, display: "flex", flexWrap: "wrap", gap: 4 }}>
            {diseases.map((disease, index) => (
              <Box
                key={disease.id}
                sx={{
                  flex: {
                    xs: "0 0 100%",
                    sm: "0 0 calc(50% - 16px)",
                    lg: "0 0 calc(25% - 24px)",
                  },
                  minWidth: 0,
                }}
              >
                <AnimatedBox animationDelay={`${0.1 + index * 0.1}s`}>
                  <DiseaseCard onClick={() => handleDiseaseClick(disease.id)}>
                    <CardContent sx={{ p: 3 }}>
                      <IconWrapper>{disease.icon}</IconWrapper>
                      <Typography
                        variant="h4"
                        gutterBottom
                        sx={{ mb: 2, minHeight: "70px", fontSize: "1.2rem" }}
                      >
                        {disease.name}
                      </Typography>

                      <Box sx={{ mb: 2 }}>
                        <Typography
                          variant="body2"
                          sx={{ fontWeight: 600, mb: 1 }}
                        >
                          Modalities:
                        </Typography>
                        <Box
                          sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}
                        >
                          {disease.modalities
                            .slice(0, 2)
                            .map((modality, idx) => (
                              <Chip
                                key={idx}
                                label={modality}
                                size="small"
                                sx={{
                                  backgroundColor: "#EFF6FF",
                                  color: "#10B981",
                                  fontSize: "0.75rem",
                                }}
                              />
                            ))}
                          {disease.modalities.length > 2 && (
                            <Chip
                              label={`+${disease.modalities.length - 2}`}
                              size="small"
                              sx={{
                                backgroundColor: "#F0F4F8",
                                color: "#475569",
                                fontSize: "0.75rem",
                              }}
                            />
                          )}
                        </Box>
                      </Box>

                      <Box sx={{ mb: 2 }}>
                        <Typography variant="body2" color="text.secondary">
                          <strong>{disease.modelCount}</strong> classifiers
                          available
                        </Typography>
                      </Box>

                      {disease.accuracy > 0 && (
                        <Box sx={{ mb: 2 }}>
                          <Chip
                            label={`Up to ${disease.accuracy}% Accuracy`}
                            size="small"
                            color="success"
                            sx={{ fontWeight: 600 }}
                          />
                        </Box>
                      )}

                      <Button
                        variant="text"
                        color="primary"
                        endIcon={<ArrowForward />}
                        fullWidth
                        sx={{ mt: 1, justifyContent: "space-between" }}
                      >
                        Diagnose{" "}
                        {disease.category === "Hepatology"
                          ? "HCV"
                          : disease.category}
                      </Button>
                    </CardContent>
                  </DiseaseCard>
                </AnimatedBox>
              </Box>
            ))}
          </Box>

          {/* Bottom CTA */}
          <Box sx={{ textAlign: "center", mt: 6 }}>
            <AnimatedBox animationDelay="0.7s">
              <Button
                variant="outlined"
                color="primary"
                size="large"
                onClick={() => navigate("/diagnosis")}
                endIcon={<ArrowForward />}
                sx={{ minWidth: "250px", py: 1.5 }}
              >
                View All Diseases & Models
              </Button>
            </AnimatedBox>
          </Box>
        </Container>
      </StyledSection>
    </ThemeProvider>
  );
};

export default DiseaseShowcase;
