import { Box, Container, Typography, Button, Paper } from "@mui/material";
import { styled, keyframes } from "@mui/material/styles";
import heroImage from "../../assets/hero.png";

// Animations
const fadeInAnimation = keyframes`
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
`;

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

const HeroImage = styled("img")(({ theme }) => ({
  width: "100%",
  height: "auto",
  borderRadius: theme.shape.borderRadius,
  border: `1px solid ${theme.palette.divider}`,
  objectFit: "cover",
  maxHeight: "450px",
  boxShadow: theme.shadows[4],
  "@media (max-width: 600px)": {
    maxHeight: "300px",
  },
}));

const Hero = () => (
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
                <Box component="span" sx={{ color: "primary.main" }}>
                  Platform
                </Box>
              </Typography>
              <Typography
                variant="h5"
                color="text.secondary"
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
  );

export default Hero;
