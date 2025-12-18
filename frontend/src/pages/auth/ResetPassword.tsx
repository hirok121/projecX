import * as React from "react";
import { CircularProgress } from "@mui/material";
import {
  Box,
  Button,
  CssBaseline,
  FormControl,
  FormLabel,
  TextField,
  Typography,
  Stack,
  Link,
  Divider,
  Card as MuiCard,
  Snackbar,
  Alert,
} from "@mui/material";
import { styled } from "@mui/material/styles";
import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import AppTheme from "../../theme/AppTheme";
import { DeepMedIcon } from "../../components/ui/CustomIcons";
import { useAuth } from "../../context/AuthContext";
import logger from "../../utils/logger";

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

const ForgotPasswordContainer = styled(Stack)(({ theme }) => ({
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

export default function ResetPasswordPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { forgotPassword, resetPassword } = useAuth();
  
  // Check if we have a token parameter (reset password) or not (forgot password)
  const token = searchParams.get('token');
  const isResetMode = !!token;
  
  // Form states
  const [email, setEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  
  // Error states
  const [errors, setErrors] = useState<{ 
    email?: string;
    newPassword?: string;
    confirmPassword?: string;
  }>({});
  
  const [snackbar, setSnackbar] = useState({
    open: false,
    severity: "error" as "error" | "success" | "warning" | "info",
    message: "",
  });

  const handleForgotPasswordSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    // Basic validation for forgot password
    const newErrors: typeof errors = {};
    if (!email) newErrors.email = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(email)) newErrors.email = "Invalid email format";

    if (Object.keys(newErrors).length) {
      setErrors(newErrors);
      return;
    }

    setLoading(true);
    try {
      const result = await forgotPassword(email);
      
      if (result.success) {
        setSnackbar({
          open: true,
          severity: "success",
          message: result.message || "Check your email for the password reset link.",
        });
        
        // Navigate to sign in after delay
        setTimeout(() => {
          navigate("/signin", {
            state: { message: result.message || "Check your email for the password reset link." },
          });
        }, 3000);
      } else {
        setSnackbar({
          open: true,
          severity: "error",
          message: result.error || "Password reset failed. Please try again.",
        });
      }
    } catch (error) {
      logger.error("Forgot password error:", error);
      setSnackbar({
        open: true,
        severity: "error",
        message: "An error occurred. Please try again.",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleResetPasswordSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    // Validation for reset password
    const newErrors: typeof errors = {};
    if (!newPassword) newErrors.newPassword = "New password is required";
    else if (newPassword.length < 8) newErrors.newPassword = "Password must be at least 8 characters long";
    
    if (!confirmPassword) newErrors.confirmPassword = "Please confirm your password";
    else if (newPassword !== confirmPassword) newErrors.confirmPassword = "Passwords do not match";

    if (Object.keys(newErrors).length) {
      setErrors(newErrors);
      return;
    }

    setLoading(true);
    try {
      const result = await resetPassword(token!, newPassword);
      
      if (result.success) {
        setSnackbar({
          open: true,
          severity: "success",
          message: result.message || "Password reset successfully! You can now login with your new password.",
        });
        
        // Navigate to sign in after delay
        setTimeout(() => {
          navigate("/signin", {
            state: { message: result.message || "Password reset successfully! You can now login." },
          });
        }, 3000);
      } else {
        setSnackbar({
          open: true,
          severity: "error",
          message: result.error || "Password reset failed. Please try again.",
        });
      }
    } catch (error) {
      logger.error("Reset password error:", error);
      setSnackbar({
        open: true,
        severity: "error",
        message: "An error occurred. Please try again.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <AppTheme>
      <CssBaseline enableColorScheme />
      <ForgotPasswordContainer direction="column" justifyContent="center">
        <Card variant="outlined">
          <DeepMedIcon />
          <Typography component="h1" variant="h4">
            {isResetMode ? "Set New Password" : "Reset Password"}
          </Typography>
          
          {isResetMode ? (
            // Reset password form (when token is present)
            <Box
              component="form"
              onSubmit={handleResetPasswordSubmit}
              noValidate
              sx={{
                display: "flex",
                flexDirection: "column",
                width: "100%",
                gap: 2,
              }}
            >
              <FormControl>
                <FormLabel htmlFor="newPassword">New Password</FormLabel>
                <TextField
                  id="newPassword"
                  type="password"
                  name="newPassword"
                  required
                  fullWidth
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  error={!!errors.newPassword}
                  helperText={errors.newPassword}
                />
              </FormControl>
              
              <FormControl>
                <FormLabel htmlFor="confirmPassword">Confirm Password</FormLabel>
                <TextField
                  id="confirmPassword"
                  type="password"
                  name="confirmPassword"
                  required
                  fullWidth
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  error={!!errors.confirmPassword}
                  helperText={errors.confirmPassword}
                />
              </FormControl>
              
              <Button
                type="submit"
                fullWidth
                variant="contained"
                disabled={loading}
              >
                {loading ? (
                  <CircularProgress
                    size={24}
                    sx={{ color: "rgba(255, 255, 255, 0.7)" }}
                  />
                ) : (
                  "Set New Password"
                )}
              </Button>
            </Box>
          ) : (
            // Forgot password form (when no token)
            <Box
              component="form"
              onSubmit={handleForgotPasswordSubmit}
              noValidate
              sx={{
                display: "flex",
                flexDirection: "column",
                width: "100%",
                gap: 2,
              }}
            >
              <FormControl>
                <FormLabel htmlFor="email">Email</FormLabel>
                <TextField
                  id="email"
                  type="email"
                  name="email"
                  required
                  fullWidth
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  error={!!errors.email}
                  helperText={errors.email}
                />
              </FormControl>
              
              <Button
                type="submit"
                fullWidth
                variant="contained"
                disabled={loading}
              >
                {loading ? (
                  <CircularProgress
                    size={24}
                    sx={{ color: "rgba(255, 255, 255, 0.7)" }}
                  />
                ) : (
                  "Send Reset Link"
                )}
              </Button>
            </Box>
          )}
          
          <Divider />
          <Typography sx={{ textAlign: "center" }}>
            Remember your password?{" "}
            <Link href="/signin" variant="body2" sx={{ alignSelf: "center" }}>
              Sign in
            </Link>
          </Typography>
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
      </ForgotPasswordContainer>
    </AppTheme>
  );
}