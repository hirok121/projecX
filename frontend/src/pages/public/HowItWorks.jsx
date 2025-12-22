import {
  Box,
  Container,
  Typography,
  Paper,
  Grid,
  Card,
  CardContent,
  Stepper,
  Step,
  StepLabel,
  StepContent,
  Button,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import {
  AccountCircle,
  Search,
  CloudUpload,
  Psychology,
  Assessment,
  LocalHospital,
  Security,
  Speed,
  Verified,
  Science,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import NavBar from '../../components/layout/NavBar';
import Footer from '../../components/landingPageComponents/Footer';
import WebsiteTheme from '../../theme/WebsiteTheme';

const StyledSection = styled(Box)(({ theme }) => ({
  paddingTop: theme.spacing(2),
  paddingBottom: theme.spacing(3),
}));

const FeatureCard = styled(Card)(({ theme }) => ({
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  borderRadius: theme.spacing(2),
  transition: 'all 0.3s ease',
  border: `1px solid ${theme.palette.divider}`,
  '&:hover': {
    transform: 'translateY(-8px)',
    boxShadow: theme.shadows[8],
    borderColor: '#10B981',
  },
}));

const IconWrapper = styled(Box)(({ theme }) => ({
  width: 64,
  height: 64,
  borderRadius: '50%',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  backgroundColor: '#10B981', // Green theme
  color: 'white',
  marginBottom: theme.spacing(2),
}));

const steps = [
  {
    label: 'Create Your Account',
    description:
      'Sign up for free and create your secure account. Your health data is encrypted and protected with enterprise-grade security measures.',
    icon: <AccountCircle sx={{ fontSize: 40 }} />,
  },
  {
    label: 'Select Disease Category',
    description:
      'Browse through multiple disease categories including Hepatitis, Diabetes, Heart Disease, Cancer, Pneumonia, and more. Each category contains specialized diagnostic tools.',
    icon: <Search sx={{ fontSize: 40 }} />,
  },
  {
    label: 'Choose Input Method',
    description:
      'Select your preferred input method: upload medical images (X-rays, CT scans, MRI), enter lab results, or provide clinical parameters based on the disease type.',
    icon: <CloudUpload sx={{ fontSize: 40 }} />,
  },
  {
    label: 'Select AI Model',
    description:
      'Choose from 50+ research-grade machine learning models published by scientists and institutions worldwide. Each model displays its source, accuracy metrics, and validation data.',
    icon: <Psychology sx={{ fontSize: 40 }} />,
  },
  {
    label: 'Get Instant Results',
    description:
      'Receive AI-powered diagnostic predictions with confidence scores, explainable AI reasoning, and detailed analysis in seconds. Results include model attribution and transparency metrics.',
    icon: <Assessment sx={{ fontSize: 40 }} />,
  },
  {
    label: 'Consult Healthcare Provider',
    description:
      'Share your results with healthcare professionals for expert medical advice. Our platform assists diagnosis but never replaces professional medical consultation.',
    icon: <LocalHospital sx={{ fontSize: 40 }} />,
  },
];

const features = [
  {
    icon: <Security sx={{ fontSize: 40 }} />,
    title: 'Privacy & Security',
    description:
      'Your health data is encrypted end-to-end with enterprise-grade security. We never share your information without explicit consent.',
  },
  {
    icon: <Speed sx={{ fontSize: 40 }} />,
    title: 'Lightning Fast',
    description:
      'Get diagnostic predictions in seconds using optimized AI models running on powerful cloud infrastructure.',
  },
  {
    icon: <Verified sx={{ fontSize: 40 }} />,
    title: 'Research-Backed',
    description:
      'All models are sourced from peer-reviewed research papers and validated by medical institutions worldwide.',
  },
  {
    icon: <Science sx={{ fontSize: 40 }} />,
    title: 'Multiple Modalities',
    description:
      'Support for various input types: medical imaging, lab results, clinical parameters, and patient history data.',
  },
];

function HowItWorks() {
  const navigate = useNavigate();

  return (
    <WebsiteTheme>
      <Box sx={{ backgroundColor: '#f4f6fb', minHeight: '100vh' }}>
        <NavBar />

      <Container maxWidth="lg" sx={{ py: { xs: 3, md: 4 } }}>
        {/* Hero Section */}
        <StyledSection>
          <Box sx={{ textAlign: 'center', mb: 4 }}>
            <Typography
              variant="h2"
              sx={{ fontWeight: 700, mb: 2, letterSpacing: 0.5 }}
            >
              How Our{' '}
              <Box component="span" sx={{ color: '#10B981' }}>
                AI Diagnosis Platform
              </Box>{' '}
              Works
            </Typography>
            <Typography
              variant="h5"
              color="text.secondary"
              sx={{ maxWidth: '800px', mx: 'auto', lineHeight: 1.7 }}
            >
              Access research-grade machine learning models from scientists
              worldwide to diagnose multiple medical conditions with confidence
              and transparency
            </Typography>
          </Box>
        </StyledSection>

        {/* Step-by-Step Process */}
        <StyledSection sx={{ mt: 2 }}>
          <Paper
            sx={{
              p: { xs: 3, md: 5 },
              borderRadius: 3,
              boxShadow: 3,
            }}
          >
            <Typography
              variant="h4"
              sx={{ fontWeight: 700, mb: 4, textAlign: 'center' }}
            >
              Your Diagnostic Journey
            </Typography>

            <Stepper orientation="vertical">
              {steps.map((step, index) => (
                <Step key={index} active={true}>
                  <StepLabel
                    StepIconComponent={() => (
                      <IconWrapper
                        sx={{
                          width: 48,
                          height: 48,
                          backgroundColor: '#10B981',
                        }}
                      >
                        {step.icon}
                      </IconWrapper>
                    )}
                  >
                    <Typography variant="h6" sx={{ fontWeight: 600 }}>
                      {step.label}
                    </Typography>
                  </StepLabel>
                  <StepContent>
                    <Typography
                      variant="body1"
                      color="text.secondary"
                      sx={{ mb: 2, lineHeight: 1.8 }}
                    >
                      {step.description}
                    </Typography>
                  </StepContent>
                </Step>
              ))}
            </Stepper>

            <Box sx={{ textAlign: 'center', mt: 4 }}>
              <Button
                variant="contained"
                size="large"
                onClick={() => navigate('/diagnosis')}
                sx={{ minWidth: 200 }}
              >
                Start Diagnosis
              </Button>
            </Box>
          </Paper>
        </StyledSection>

        {/* Key Features */}
        <StyledSection sx={{ mt: 4 }}>
          <Typography
            variant="h4"
            sx={{ fontWeight: 700, textAlign: 'center', mb: 4 }}
          >
            Why Choose Our Platform?
          </Typography>

          <Box
            sx={{
              display: 'flex',
              gap: 3,
              flexWrap: { xs: 'wrap', md: 'nowrap' },
              justifyContent: 'center',
            }}
          >
            {features.map((feature, index) => (
              <Box
                key={index}
                sx={{
                  flex: { xs: '1 1 100%', sm: '1 1 45%', md: '1 1 25%' },
                  minWidth: { md: '220px' },
                  maxWidth: { md: '280px' },
                }}
              >
                <FeatureCard>
                  <CardContent
                    sx={{
                      p: 2.5,
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      textAlign: 'center',
                      height: '100%',
                    }}
                  >
                    <Box
                      sx={{
                        width: 64,
                        height: 64,
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        backgroundColor: '#ECFDF5',
                        color: '#10B981',
                        mb: 2,
                      }}
                    >
                      {feature.icon}
                    </Box>
                    <Typography
                      variant="h6"
                      sx={{ fontWeight: 600, mb: 1, fontSize: '1rem' }}
                    >
                      {feature.title}
                    </Typography>
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{ fontSize: '0.875rem' }}
                    >
                      {feature.description}
                    </Typography>
                  </CardContent>
                </FeatureCard>
              </Box>
            ))}
          </Box>
        </StyledSection>

        {/* Platform Stats */}
        <StyledSection sx={{ mt: 4 }}>
          <Paper
            sx={{
              p: { xs: 3, md: 5 },
              borderRadius: 3,
              backgroundColor: 'white',
              boxShadow: 2,
            }}
          >
            <Typography
              variant="h4"
              sx={{ fontWeight: 700, textAlign: 'center', mb: 4 }}
            >
              Platform at a Glance
            </Typography>
            <Grid container spacing={4} sx={{ textAlign: 'center' }}>
              <Grid item xs={12} sm={6} md={3}>
                <Typography
                  variant="h3"
                  sx={{ fontWeight: 700, color: '#10B981', mb: 1 }}
                >
                  15+
                </Typography>
                <Typography variant="body1" color="text.secondary">
                  Disease Categories
                </Typography>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Typography
                  variant="h3"
                  sx={{ fontWeight: 700, color: '#10B981', mb: 1 }}
                >
                  50+
                </Typography>
                <Typography variant="body1" color="text.secondary">
                  ML Models Available
                </Typography>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Typography
                  variant="h3"
                  sx={{ fontWeight: 700, color: '#10B981', mb: 1 }}
                >
                  24/7
                </Typography>
                <Typography variant="body1" color="text.secondary">
                  AI Assistant Support
                </Typography>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Typography
                  variant="h3"
                  sx={{ fontWeight: 700, color: '#10B981', mb: 1 }}
                >
                  100%
                </Typography>
                <Typography variant="body1" color="text.secondary">
                  Research-Grade Models
                </Typography>
              </Grid>
            </Grid>
          </Paper>
        </StyledSection>

        {/* CTA Section */}
        <StyledSection sx={{ mt: 4 }}>
          <Paper
            sx={{
              p: { xs: 4, md: 6 },
              borderRadius: 3,
              textAlign: 'center',
              background: 'linear-gradient(135deg, #059669 0%, #047857 100%)',
              color: 'white',
            }}
          >
            <Typography variant="h4" sx={{ fontWeight: 700, mb: 2 }}>
              Ready to Get Started?
            </Typography>
            <Typography variant="h6" sx={{ mb: 4, opacity: 0.9 }}>
              Join users worldwide leveraging AI for better health insights
            </Typography>
            <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
              <Button
                variant="contained"
                size="large"
                onClick={() => navigate('/signup')}
                sx={{
                  backgroundColor: 'white',
                  color: '#10B981',
                  minWidth: 180,
                  '&:hover': {
                    backgroundColor: 'grey.100',
                  },
                }}
              >
                Sign Up Free
              </Button>
              <Button
                variant="outlined"
                size="large"
                onClick={() => navigate('/ai-assistant')}
                sx={{
                  borderColor: 'white',
                  color: 'white',
                  minWidth: 180,
                  '&:hover': {
                    borderColor: 'white',
                    backgroundColor: 'rgba(255, 255, 255, 0.1)',
                  },
                }}
              >
                Try AI Assistant
              </Button>
            </Box>
          </Paper>
        </StyledSection>
      </Container>

      <Footer />
      </Box>
    </WebsiteTheme>
  );
}

export default HowItWorks;
