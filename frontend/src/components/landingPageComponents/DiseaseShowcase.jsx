import { useState, useEffect } from "react";
import {
  Box,
  Container,
  Typography,
  Button,
  Paper,
  CircularProgress,
} from "@mui/material";
import { styled, keyframes } from "@mui/material/styles";
import { ArrowForward } from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import { diseaseAPI } from "../../services/diseaseAPI";
import DiseaseCard from "../diagnosis/DiseaseCard";

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

const DiseaseShowcase = ({ id }) => {
  const navigate = useNavigate();
  const [diseases, setDiseases] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch diseases from API
  useEffect(() => {
    const fetchDiseases = async () => {
      try {
        const data = await diseaseAPI.getDiseases({
          is_active: true,
          limit: 4,
          skip: 0,
        });
        setDiseases(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error("Error fetching diseases:", error);
        setDiseases([]);
      } finally {
        setLoading(false);
      }
    };

    fetchDiseases();
  }, []);

  const handleDiseaseClick = (disease) => {
    navigate(`/diagnosis/${disease.id}/modality`);
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
          {loading ? (
            <Box
              sx={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                minHeight: "400px",
              }}
            >
              <CircularProgress />
            </Box>
          ) : diseases.length === 0 ? (
            <Box
              sx={{
                textAlign: "center",
                py: 8,
                px: 2,
              }}
            >
              <Typography variant="h6" color="text.secondary" gutterBottom>
                No diseases available yet
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Check back soon for available diagnostic tools.
              </Typography>
            </Box>
          ) : (
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
                <AnimatedBox
                  key={disease.id}
                  animationDelay={`${0.1 + index * 0.1}s`}
                >
                  <DiseaseCard
                    disease={disease}
                    onClick={handleDiseaseClick}
                    compact={false}
                  />
                </AnimatedBox>
              ))}
            </Box>
          )}

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
