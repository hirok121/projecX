import {
  Box,
  Container,
  Typography,
  Button,
  Paper,
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

// Animations
const fadeInAnimation = keyframes`
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
`;

// Styled components
const StyledSection = styled(Paper)(({ theme }) => ({
  paddingTop: theme.spacing(12),
  paddingBottom: theme.spacing(12),
  backgroundColor: theme.palette.grey[50],
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

const DiseaseCard = styled(Card)(({ theme }) => ({
  height: "420px",
  display: "flex",
  flexDirection: "column",
  borderRadius: theme.shape.borderRadius,
  border: `1px solid ${theme.palette.divider}`,
  boxShadow: "none",
  transition: "all 0.2s ease",
  cursor: "pointer",
  backgroundColor: theme.palette.background.paper,
  "&:hover": {
    transform: "translateY(-2px)",
    boxShadow: theme.shadows[4],
    borderColor: theme.palette.text.primary,
  },
}));

const IconWrapper = styled(Box)(({ theme }) => ({
  width: "56px",
  height: "56px",
  borderRadius: "50%",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  backgroundColor: theme.palette.success.light + "20",
  color: theme.palette.primary.main,
  marginBottom: theme.spacing(2),
}));

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
                <Box component="span" sx={{ color: "primary.main" }}>
                  Multiple Medical Conditions
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
                Each disease supported by multiple ML models with different
                modalities and approaches
              </Typography>
            </AnimatedBox>
          </Box>

          {/* Disease Cards Grid */}
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: {
                xs: "1fr",
                sm: "repeat(2, 1fr)",
                lg: "repeat(4, 1fr)",
              },
              gap: 4,
              mb: 6,
            }}
          >
            {diseases.map((disease, index) => (
              <AnimatedBox key={disease.id} animationDelay={`${0.1 + index * 0.1}s`}>
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
                                  backgroundColor: (theme) =>
                                    `${theme.palette.primary.main}14`,
                                  color: "primary.main",
                                  fontSize: "0.75rem",
                                }}
                              />
                            ))}
                          {disease.modalities.length > 2 && (
                            <Chip
                              label={`+${disease.modalities.length - 2}`}
                              size="small"
                              sx={{
                                backgroundColor: "grey.100",
                                color: "text.secondary",
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
    );
  };

export default DiseaseShowcase;
