import {
  Box,
  Container,
  Typography,
  Button,
  Paper,
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
  backgroundColor: theme.palette.background.paper,
  borderRadius: 0,
  boxShadow: "none",
  borderBottom: `1px solid ${theme.palette.divider}`,
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
  borderRadius: theme.shape.borderRadius,
  border: `1px solid ${theme.palette.divider}`,
  boxShadow: "none",
  transition: "all 0.2s ease",
  backgroundColor: theme.palette.background.paper,
  "&:hover": {
    borderColor: theme.palette.text.primary,
    boxShadow: theme.shadows[3],
  },
}));

const IconWrapper = styled(Box)(({ theme }) => ({
  width: "48px",
  height: "48px",
  borderRadius: "50%",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  backgroundColor: theme.palette.success.light + "20",
  color: theme.palette.primary.main,
  marginBottom: theme.spacing(2),
}));

const StatBox = styled(Box)(({ theme }) => ({
  textAlign: "center",
  padding: theme.spacing(4),
  borderRadius: theme.shape.borderRadius,
  backgroundColor: theme.palette.grey[50],
  border: "none",
}));

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
    icon: <MedicalServices sx={{ fontSize: 40, color: "primary.main" }} />,
    value: "15+",
    label: "Disease Categories",
    delay: "0.5s",
  },
  {
    icon: <Psychology sx={{ fontSize: 40, color: "primary.main" }} />,
    value: "50+",
    label: "ML Models Available",
    delay: "0.6s",
  },
  {
    icon: <School sx={{ fontSize: 40, color: "primary.main" }} />,
    value: "Published",
    label: "Research Models",
    delay: "0.7s",
  },
];

const PlatformOverview = ({ id }) => {
  const navigate = useNavigate();

  return (
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
                sx={{
                  maxWidth: "70ch",
                  mx: "auto",
                  color: "text.secondary",
                }}
              >
                Access cutting-edge machine learning models from research
                institutions worldwide to diagnose multiple medical conditions
                with confidence and transparency.
              </Typography>
            </AnimatedBox>
          </Box>

          {/* Features Grid */}
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: {
                xs: "1fr",
                sm: "repeat(2, 1fr)",
                lg: "repeat(4, 1fr)",
              },
              gap: 3,
              mb: 6,
            }}
          >
            {features.map((feature, index) => (
              <AnimatedBox key={index} animationDelay={feature.delay}>
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
                      sx={{ fontWeight: 700, color: "primary.main", mb: 0.5 }}
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
    );
  };

export default PlatformOverview;
