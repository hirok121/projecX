import {
  Box,
  Container,
  Typography,
  Button,
  Paper,
  Grid,
  Divider,
  IconButton,
} from "@mui/material";
import { styled } from "@mui/material/styles";
import {
  Email,
  Phone,
  LocationOn,
  Facebook,
  Twitter,
  LinkedIn,
  Instagram,
  ArrowUpward,
  LocalHospital,
  Science,
  Security,
  Support,
} from "@mui/icons-material";

const StyledFooter = styled(Paper)(({ theme }) => ({
  paddingTop: theme.spacing(8),
  paddingBottom: theme.spacing(4),
  backgroundColor: "#2C3E50",
  borderRadius: 0,
  boxShadow: "none",
  marginTop: 0,
  color: "rgba(255, 255, 255, 0.85)",
}));

const FooterSection = styled(Box)(({ theme }) => ({
  marginBottom: theme.spacing(3),
}));

const SocialIconButton = styled(IconButton)(({ theme }) => ({
  color: "rgba(255, 255, 255, 0.7)",
  border: "1px solid rgba(255, 255, 255, 0.2)",
  marginRight: theme.spacing(1),
  transition: "all 0.3s ease",
  "&:hover": {
    color: "white",
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderColor: "rgba(255, 255, 255, 0.4)",
    transform: "translateY(-2px)",
  },
}));

const FooterLink = styled(Typography)(({ theme }) => ({
  color: "rgba(255, 255, 255, 0.7)",
  cursor: "pointer",
  transition: "color 0.3s ease",
  marginBottom: theme.spacing(1),
  "&:hover": {
    color: "white",
  },
}));

const BackToTopButton = styled(Button)(({ theme }) => ({
  position: "fixed",
  bottom: theme.spacing(3),
  right: theme.spacing(3),
  borderRadius: "50%",
  minWidth: "56px",
  height: "56px",
  backgroundColor: theme.palette.primary.main,
  color: "white",
  boxShadow: `0 4px 12px ${theme.palette.primary.main}4D`,
  "&:hover": {
    backgroundColor: theme.palette.primary.dark,
    transform: "translateY(-2px)",
    boxShadow: `0 6px 16px ${theme.palette.primary.main}66`,
  },
  zIndex: 1000,
}));

const Footer = () => {
  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  const currentYear = new Date().getFullYear();

  return (
    <StyledFooter elevation={0}>
        <Container maxWidth="lg">
          {/* Main Footer Content */}
          <Grid container spacing={4} sx={{ mb: 4 }}>
            {/* Company Info */}
            <Grid item xs={12} md={4}>
              <FooterSection>
                <Typography
                  variant="h4"
                  gutterBottom
                  sx={{ mb: 2, color: "white" }}
                >
                  DeepMed
                </Typography>
                <Typography
                  variant="body1"
                  sx={{
                    mb: 3,
                    maxWidth: "300px",
                    color: "rgba(255, 255, 255, 0.85)",
                  }}
                >
                  AI-powered medical diagnosis platform providing access to
                  research-grade machine learning models for multiple diseases.
                  Empowering healthcare through innovation.
                </Typography>

                {/* Features */}
                <Box sx={{ mb: 3 }}>
                  {[
                    { icon: <Science />, text: "AI-Powered Diagnostics" },
                    { icon: <LocalHospital />, text: "Medical Grade Accuracy" },
                    { icon: <Security />, text: "HIPAA Compliant" },
                    { icon: <Support />, text: "24/7 Support" },
                  ].map((feature, index) => (
                    <Box
                      key={index}
                      sx={{ display: "flex", alignItems: "center", mb: 1 }}
                    >
                      <Box sx={{ color: "primary.main", mr: 1 }}>
                        {feature.icon}
                      </Box>
                      <Typography
                        variant="body2"
                        sx={{ color: "rgba(255, 255, 255, 0.7)" }}
                      >
                        {feature.text}
                      </Typography>
                    </Box>
                  ))}
                </Box>

                {/* Social Media */}
                <Box>
                  <Typography variant="h5" gutterBottom sx={{ color: "white" }}>
                    Follow Us
                  </Typography>
                  <Box>
                    <SocialIconButton>
                      <Facebook />
                    </SocialIconButton>
                    <SocialIconButton>
                      <Twitter />
                    </SocialIconButton>
                    <SocialIconButton>
                      <LinkedIn />
                    </SocialIconButton>
                    <SocialIconButton>
                      <Instagram />
                    </SocialIconButton>
                  </Box>
                </Box>
              </FooterSection>
            </Grid>

            {/* Quick Links */}
            <Grid item xs={12} sm={6} md={2}>
              <FooterSection>
                <Typography variant="h5" gutterBottom sx={{ color: "white" }}>
                  Platform
                </Typography>
                <Box>
                  <FooterLink variant="body2">AI Diagnostics</FooterLink>
                  <FooterLink variant="body2">Medical Assistant</FooterLink>
                  <FooterLink variant="body2">HCV Stages</FooterLink>
                  <FooterLink variant="body2">Research Insights</FooterLink>
                  <FooterLink variant="body2">Clinical Tools</FooterLink>
                </Box>
              </FooterSection>
            </Grid>

            {/* Resources */}
            <Grid item xs={12} sm={6} md={2}>
              <FooterSection>
                <Typography variant="h5" gutterBottom sx={{ color: "white" }}>
                  Resources
                </Typography>
                <Box>
                  <FooterLink variant="body2">Documentation</FooterLink>
                  <FooterLink variant="body2">API Reference</FooterLink>
                  <FooterLink variant="body2">Medical Library</FooterLink>
                  <FooterLink variant="body2">Case Studies</FooterLink>
                  <FooterLink variant="body2">Tutorials</FooterLink>
                </Box>
              </FooterSection>
            </Grid>

            {/* Support */}
            <Grid item xs={12} sm={6} md={2}>
              <FooterSection>
                <Typography variant="h5" gutterBottom sx={{ color: "white" }}>
                  Support
                </Typography>
                <Box>
                  <FooterLink variant="body2">Help Center</FooterLink>
                  <FooterLink variant="body2">Contact Us</FooterLink>
                  <FooterLink variant="body2">Training</FooterLink>
                  <FooterLink variant="body2">System Status</FooterLink>
                  <FooterLink variant="body2">Community</FooterLink>
                </Box>
              </FooterSection>
            </Grid>

            {/* Contact Info */}
            <Grid item xs={12} sm={6} md={2}>
              <FooterSection>
                <Typography variant="h5" gutterBottom sx={{ color: "white" }}>
                  Contact
                </Typography>
                <Box>
                  <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                    <Email sx={{ mr: 1, color: "primary.main" }} />
                    <Typography
                      variant="body2"
                      sx={{ color: "rgba(255, 255, 255, 0.85)" }}
                    >
                      support@deepmed.com
                    </Typography>
                  </Box>
                  <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                    <Phone sx={{ mr: 1, color: "primary.main" }} />
                    <Typography
                      variant="body2"
                      sx={{ color: "rgba(255, 255, 255, 0.85)" }}
                    >
                      +1 (555) 123-4567
                    </Typography>
                  </Box>
                  <Box
                    sx={{ display: "flex", alignItems: "flex-start", mb: 2 }}
                  >
                    <LocationOn
                      sx={{ mr: 1, mt: 0.5, color: "primary.main" }}
                    />
                    <Typography
                      variant="body2"
                      sx={{ color: "rgba(255, 255, 255, 0.85)" }}
                    >
                      123 Medical Center Dr
                      <br />
                      Health Innovation District
                      <br />
                      San Francisco, CA 94105
                    </Typography>
                  </Box>
                </Box>
              </FooterSection>
            </Grid>
          </Grid>

          <Divider
            sx={{ backgroundColor: "rgba(255, 255, 255, 0.1)", mb: 3 }}
          />

          {/* Bottom Footer */}
          <Box
            sx={{
              display: "flex",
              flexDirection: { xs: "column", sm: "row" },
              justifyContent: "space-between",
              alignItems: { xs: "center", sm: "center" },
              textAlign: { xs: "center", sm: "left" },
              gap: 2,
            }}
          >
            <Typography
              variant="body2"
              sx={{ color: "rgba(255, 255, 255, 0.6)" }}
            >
              © {currentYear} DeepMed. All rights reserved. | Built with ❤️ for
              healthcare innovation
            </Typography>

            <Box
              sx={{
                display: "flex",
                gap: 3,
                flexWrap: "wrap",
                justifyContent: "center",
              }}
            >
              <FooterLink variant="body2">Privacy Policy</FooterLink>
              <FooterLink variant="body2">Terms of Service</FooterLink>
              <FooterLink variant="body2">Cookie Policy</FooterLink>
              <FooterLink variant="body2">Accessibility</FooterLink>
            </Box>
          </Box>

          {/* Medical Disclaimer */}
          <Box
            sx={{
              mt: 4,
              p: 3,
              backgroundColor: "rgba(255, 255, 255, 0.05)",
              borderRadius: "12px",
              border: "1px solid rgba(255, 255, 255, 0.1)",
            }}
          >
            <Typography
              variant="body2"
              sx={{ color: "rgba(255, 255, 255, 0.7)", textAlign: "center" }}
            >
              <strong>Medical Disclaimer:</strong> MediScan AI is an educational
              and research platform providing access to published machine
              learning models. All results should be interpreted by qualified
              healthcare professionals. This platform does not replace
              professional medical advice, diagnosis, or treatment.
            </Typography>
          </Box>
        </Container>

        {/* Back to Top Button */}
        <BackToTopButton onClick={scrollToTop}>
          <ArrowUpward />
        </BackToTopButton>
      </StyledFooter>
    );
  };

export default Footer;
