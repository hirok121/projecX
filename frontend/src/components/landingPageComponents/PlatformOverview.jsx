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
  Biotech,
  LocalHospital,
  Assessment,
  Verified,
  MedicalServices,
  Psychology,
  School,
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
  height: "280px",
  width: "100%",
  display: "flex",
  flexDirection: "column",
  borderRadius: "8px",
  border: "1px solid #E8EAED",
  boxShadow: "none",
  transition: "all 0.2s ease",
  backgroundColor: "#FFFFFF",
  "&:hover": {
    borderColor: "#2C3E50",
    boxShadow: "0 2px 8px rgba(44, 62, 80, 0.08)",
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

const StatBox = styled(Box)(({ theme }) => ({
  textAlign: "center",
  padding: theme.spacing(4),
  borderRadius: "8px",
  backgroundColor: "#F8F9FA",
  border: "none",
}));

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
      fontSize: "1.25rem",
      color: "#1E293B",
    },
    h6: {
      fontWeight: 600,
      fontSize: "1rem",
      color: "#1E293B",
    },
    body1: {
      fontSize: "1rem",
      lineHeight: 1.7,
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
      },
    },
  },
});

const features = [
  {
    icon: <Biotech sx={{ fontSize: 32 }} />,
    title: "Research-Grade Models",
    description:
      "Access ML models published by researchers worldwide from peer-reviewed journals and institutions",
    delay: "0.1s",
  },
  {
    icon: <LocalHospital sx={{ fontSize: 32 }} />,
    title: "Multiple Diseases",
    description:
      "Diagnose HCV, Diabetes, Pneumonia, Heart Disease, Cancer, and more—all from one platform",
    delay: "0.2s",
  },
  {
    icon: <Assessment sx={{ fontSize: 32 }} />,
    title: "Flexible Input Methods",
    description:
      "Upload X-rays, CT scans, MRI images, or enter lab results and clinical parameters",
    delay: "0.3s",
  },
  {
    icon: <Verified sx={{ fontSize: 32 }} />,
    title: "Transparent Results",
    description:
      "Get predictions with confidence scores, explainable AI reasoning, and model attribution",
    delay: "0.4s",
  },
];

const statistics = [
  {
    icon: <MedicalServices sx={{ fontSize: 40, color: "#10B981" }} />,
    value: "15+",
    label: "Disease Categories",
    delay: "0.5s",
  },
  {
    icon: <Psychology sx={{ fontSize: 40, color: "#10B981" }} />,
    value: "50+",
    label: "ML Models Available",
    delay: "0.6s",
  },
  {
    icon: <School sx={{ fontSize: 40, color: "#10B981" }} />,
    value: "Published",
    label: "Research Models",
    delay: "0.7s",
  },
];

const PlatformOverview = ({ id }) => {
  const navigate = useNavigate();

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
                Your Gateway to{" "}
                <Box component="span" sx={{ color: "#FF6B35" }}>
                  AI-Powered Medical Diagnostics
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
                Access cutting-edge machine learning models from research
                institutions worldwide to diagnose multiple medical conditions
                with confidence and transparency.
              </Typography>
            </AnimatedBox>
          </Box>

          {/* Features Grid */}
          <Box sx={{ mb: 6, display: "flex", flexWrap: "wrap", gap: 3 }}>
            {features.map((feature, index) => (
              <Box
                key={index}
                sx={{
                  flex: {
                    xs: "0 0 100%",
                    sm: "0 0 calc(50% - 12px)",
                    lg: "0 0 calc(25% - 18px)",
                  },
                  minWidth: 0,
                }}
              >
                <AnimatedBox animationDelay={feature.delay}>
                  <FeatureCard>
                    <CardContent sx={{ p: 3 }}>
                      <IconWrapper>{feature.icon}</IconWrapper>
                      <Typography
                        variant="h6"
                        gutterBottom
                        sx={{ fontWeight: 600 }}
                      >
                        {feature.title}
                      </Typography>
                      <Typography variant="body1" color="text.secondary">
                        {feature.description}
                      </Typography>
                    </CardContent>
                  </FeatureCard>
                </AnimatedBox>
              </Box>
            ))}
          </Box>

          {/* Statistics Bar */}
          <Grid container spacing={3} sx={{ mb: 4, justifyContent: "center" }}>
            {statistics.map((stat, index) => (
              <Grid item xs={12} sm={4} key={index}>
                <AnimatedBox animationDelay={stat.delay}>
                  <StatBox>
                    <Box sx={{ mb: 1 }}>{stat.icon}</Box>
                    <Typography
                      variant="h4"
                      sx={{ fontWeight: 700, color: "#10B981", mb: 0.5 }}
                    >
                      {stat.value}
                    </Typography>
                    <Typography variant="body1" color="text.secondary">
                      {stat.label}
                    </Typography>
                  </StatBox>
                </AnimatedBox>
              </Grid>
            ))}
          </Grid>

          {/* CTA */}
          <Box sx={{ textAlign: "center", mt: 6 }}>
            <AnimatedBox animationDelay="0.8s">
              <Button
                variant="contained"
                color="primary"
                size="large"
                onClick={() => navigate("/about")}
                sx={{ minWidth: "200px" }}
              >
                Learn How It Works
              </Button>
            </AnimatedBox>
          </Box>
        </Container>
      </StyledSection>
    </ThemeProvider>
  );
};

export default PlatformOverview;
