import * as React from "react";
import {
  Box,
  Button,
  CircularProgress,
  CssBaseline,
  Typography,
  Stack,
  Link,
  Card as MuiCard,
  Snackbar,
  Alert,
} from "@mui/material";
import { styled } from "@mui/material/styles";
import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import AppTheme from "../../theme/AppTheme";
import { DeepMedIcon } from "../../components/ui/CustomIcons";
import { useAuth } from "../../context/AuthContext";

const Card = styled(MuiCard)(({ theme }) => ({
  display: "flex",
  flexDirection: "column",
  alignSelf: "center",
  width: "100%",
  padding: theme.spacing(4),
  gap: theme.spacing(2),
  margin: "auto",
  [theme.breakpoints.up("sm")]: {
    maxWidth: "450px",
  },
  boxShadow:
    "hsla(220, 30%, 5%, 0.05) 0px 5px 15px 0px, hsla(220, 25%, 10%, 0.05) 0px 15px 35px -5px",
  backgroundColor: theme.palette.background.paper,
  color: theme.palette.text.primary,
  ...theme.applyStyles("dark", {
    backgroundColor: "#181A20",
    color: "#fff",
    boxShadow:
      "hsla(220, 30%, 5%, 0.5) 0px 5px 15px 0px, hsla(220, 25%, 10%, 0.08) 0px 15px 35px -5px",
  }),
}));

const VerifyEmailContainer = styled(Stack)(({ theme }) => ({
  height: "100dvh",
  padding: theme.spacing(2),
  [theme.breakpoints.up("sm")]: {
    padding: theme.spacing(4),
  },
  "&::before": {
    content: '""',
    display: "block",
    position: "absolute",
    zIndex: -1,
    inset: 0,
    backgroundImage:
      "radial-gradient(ellipse at 50% 50%, hsl(210, 100%, 97%), hsl(0, 0%, 100%))",
    backgroundRepeat: "no-repeat",
    ...theme.applyStyles("dark", {
      backgroundImage:
        "radial-gradient(at 50% 50%, hsla(210, 100%, 16%, 0.5), hsl(220, 30%, 5%))",
    }),
  },
}));

export default function VerifyEmailPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { verifyEmail } = useAuth();
  
  const [loading, setLoading] = useState(true);
  const [verificationResult, setVerificationResult] = useState<{
    success: boolean;
    message: string;
  } | null>(null);

  const [snackbar, setSnackbar] = useState({
    open: false,
    severity: "success" as "error" | "success" | "warning" | "info",
    message: "",
  });

  const token = searchParams.get('token');

  useEffect(() => {
    const handleEmailVerification = async () => {
      if (!token) {
        setVerificationResult({
          success: false,
          message: "No verification token provided. Please check your email link.",
        });
        setLoading(false);
        return;
      }

      try {
        const result = await verifyEmail(token);
        setVerificationResult(result);
      } catch (error) {
        console.error("Email verification error:", error);
        setVerificationResult({
          success: false,
          message: "An error occurred during verification. Please try again.",
        });
      } finally {
        setLoading(false);
      }
    };

    handleEmailVerification();
  }, [token, verifyEmail]);

  const handleContinueToSignIn = () => {
    navigate("/signin", {
      state: {
        message: verificationResult?.success 
          ? "Email verified successfully! You can now sign in."
          : undefined,
      },
    });
  };

  return (
    <AppTheme>
      <CssBaseline enableColorScheme />
      <VerifyEmailContainer direction="column" justifyContent="center">
        <Card variant="outlined">
          <DeepMedIcon />
          <Typography component="h1" variant="h4" sx={{ textAlign: "center" }}>
            Email Verification
          </Typography>

          {loading ? (
            <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 2 }}>
              <CircularProgress size={40} />
              <Typography variant="body1" sx={{ textAlign: "center" }}>
                Verifying your email address...
              </Typography>
            </Box>
          ) : (
            <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 2 }}>
              {verificationResult?.success ? (
                <>
                  <Typography 
                    variant="h6" 
                    sx={{ textAlign: "center", color: "success.main" }}
                  >
                    ✅ Email Verified Successfully!
                  </Typography>
                  <Typography variant="body1" sx={{ textAlign: "center", mb: 2 }}>
                    {verificationResult.message || "Your email has been verified. You can now sign in to your account."}
                  </Typography>
                  <Button
                    variant="contained"
                    fullWidth
                    onClick={handleContinueToSignIn}
                  >
                    Continue to Sign In
                  </Button>
                </>
              ) : (
                <>
                  <Typography 
                    variant="h6" 
                    sx={{ textAlign: "center", color: "error.main" }}
                  >
                    ❌ Verification Failed
                  </Typography>
                  <Typography variant="body1" sx={{ textAlign: "center", mb: 2 }}>
                    {verificationResult?.message || "The verification link is invalid or has expired."}
                  </Typography>
                  <Button
                    variant="contained"
                    fullWidth
                    onClick={handleContinueToSignIn}
                  >
                    Go to Sign In
                  </Button>
                </>
              )}
            </Box>
          )}

          <Box sx={{ mt: 2, textAlign: "center" }}>
            <Typography variant="body2">
              Need help?{" "}
              <Link href="/signup" variant="body2">
                Create a new account
              </Link>
            </Typography>
          </Box>
        </Card>

        <Snackbar
          open={snackbar.open}
          autoHideDuration={6000}
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          anchorOrigin={{ vertical: "top", horizontal: "center" }}
        >
          <Alert
            onClose={() => setSnackbar({ ...snackbar, open: false })}
            severity={snackbar.severity}
            variant="filled"
            sx={{ width: "100%" }}
          >
            {snackbar.message}
          </Alert>
        </Snackbar>
      </VerifyEmailContainer>
    </AppTheme>
  );
}