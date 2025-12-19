
import {
  Box,
  Container,
  Typography,
  Button,
  Paper,
  Card,
  CardContent,
} from "@mui/material";
import { styled, keyframes } from "@mui/material/styles";
import {
  Psychology,
  Medication,
  Chat,
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
  height: "100%",
  borderRadius: theme.shape.borderRadius,
  border: `1px solid ${theme.palette.divider}`,
  boxShadow: "none",
  transition: "all 0.2s ease",
  backgroundColor: theme.palette.grey[50],
  "&:hover": {
    transform: "translateY(-2px)",
    boxShadow: theme.shadows[3],
    borderColor: theme.palette.grey[300],
  },
}));

const IconWrapper = styled(Box)(({ theme }) => ({
  width: "48px",
  height: "48px",
  borderRadius: "50%",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  backgroundColor: theme.palette.success.light + "20", // Light green with transparency
  color: theme.palette.primary.main,
  marginBottom: theme.spacing(2),
}));

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
                  sx={{
                    color: "primary.main",
                    fontSize: "2rem",
                  }}
                />
                <Typography variant="h2">
                  Your Intelligent{" "}
                  <Box component="span" sx={{ color: "primary.main" }}>
                    Medical Research Companion
                  </Box>
                </Typography>
              </Box>

              <Typography
                variant="h5"
                sx={{
                  maxWidth: "80ch",
                  mx: "auto",
                  color: "text.secondary",
                  fontWeight: 400,
                  mb: 4,
                }}
              >
                Get instant, evidence-based answers about any medical condition.
                Our AI assistant provides{" "}
                <Box
                  component="span"
                  sx={{
                    color: "primary.main",
                    fontWeight: 600,
                    backgroundColor: (theme) =>
                      `${theme.palette.primary.main}1A`,
                    px: 1,
                    py: 0.25,
                    borderRadius: 1,
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
                  backgroundColor: (theme) =>
                    `${theme.palette.primary.main}0D`,
                  borderRadius: 3,
                  border: (theme) => `1px solid ${theme.palette.primary.main}1A`,
                  mb: 4,
                }}
              >
                <LocalHospital sx={{ color: "primary.dark" }} />
                <Typography
                  variant="body2"
                  sx={{ color: "primary.dark", fontWeight: 600 }}
                >
                  Educational & Research Platform
                </Typography>
                <Typography variant="body2" sx={{ color: "text.secondary" }}>
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
                        <Typography variant="body1" sx={{ color: "text.secondary" }}>
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
                        <Typography variant="body1" sx={{ color: "text.secondary" }}>
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
                backgroundColor: (theme) => `${theme.palette.primary.main}05`,
                borderRadius: 5,
                border: (theme) => `1px solid ${theme.palette.primary.main}14`,
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
                  }}
                >
                  Medical Library
                </Button>
              </Box>
            </Box>
          </AnimatedBox>
        </Container>
      </StyledSection>
    );
  };

export default AiMedicalAssistant;
