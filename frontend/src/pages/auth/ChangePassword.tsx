import * as React from "react";
import {
  Box,
  Button,
  CircularProgress,
  CssBaseline,
  FormControl,
  FormLabel,
  TextField,
  Typography,
  Stack,
  Link,
  Card as MuiCard,
  Snackbar,
  Alert,
  Divider,
} from "@mui/material";
import { styled } from "@mui/material/styles";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import AppTheme from "../../theme/AppTheme";
import { HepatoCAIIcon } from "../../components/ui/CustomIcons";
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

const ChangePasswordContainer = styled(Stack)(({ theme }) => ({
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

export default function ChangePasswordPage() {
  const navigate = useNavigate();
  const { changePassword, user, isAuthenticated } = useAuth();
  
  // Form states
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  
  // Error states
  const [errors, setErrors] = useState<{ 
    currentPassword?: string;
    newPassword?: string;
    confirmPassword?: string;
  }>({});
  
  const [snackbar, setSnackbar] = useState({
    open: false,
    severity: "success" as "error" | "success" | "warning" | "info",
    message: "",
  });

  // Redirect if not authenticated
  React.useEffect(() => {
    if (!isAuthenticated) {
      navigate("/signin", {
        state: { message: "Please sign in to change your password." },
      });
    }
  }, [isAuthenticated, navigate]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    // Validation
    const newErrors: typeof errors = {};
    
    if (!currentPassword) {
      newErrors.currentPassword = "Current password is required";
    }
    
    if (!newPassword) {
      newErrors.newPassword = "New password is required";
    } else if (newPassword.length < 8) {
      newErrors.newPassword = "Password must be at least 8 characters long";
    } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(newPassword)) {
      newErrors.newPassword = "Password must contain at least one uppercase letter, one lowercase letter, and one number";
    }
    
    if (!confirmPassword) {
      newErrors.confirmPassword = "Please confirm your new password";
    } else if (newPassword !== confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    if (currentPassword === newPassword) {
      newErrors.newPassword = "New password must be different from current password";
    }

    if (Object.keys(newErrors).length) {
      setErrors(newErrors);
      return;
    }

    setLoading(true);
    try {
      const result = await changePassword(currentPassword, newPassword);
      
      if (result.success) {
        setSnackbar({
          open: true,
          severity: "success",
          message: result.message || "Password changed successfully!",
        });
        
        // Clear form
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
        setErrors({});
        
        // Navigate to profile after delay
        setTimeout(() => {
          navigate("/profile", {
            state: { message: "Password changed successfully!" },
          });
        }, 2000);
      } else {
        setSnackbar({
          open: true,
          severity: "error",
          message: result.error || "Failed to change password. Please try again.",
        });
      }
    } catch (error) {
      console.error("Change password error:", error);
      setSnackbar({
        open: true,
        severity: "error",
        message: "An error occurred. Please try again.",
      });
    } finally {
      setLoading(false);
    }
  };

  if (!isAuthenticated) {
    return null; // Will redirect in useEffect
  }

  return (
    <AppTheme>
      <CssBaseline enableColorScheme />
      <ChangePasswordContainer direction="column" justifyContent="center">
        <Card variant="outlined">
          <HepatoCAIIcon />
          <Typography component="h1" variant="h4">
            Change Password
          </Typography>
          
          {user && (
            <Typography variant="body2" color="text.secondary">
              Changing password for: {user.email}
            </Typography>
          )}

          <Box
            component="form"
            onSubmit={handleSubmit}
            noValidate
            sx={{
              display: "flex",
              flexDirection: "column",
              width: "100%",
              gap: 2,
            }}
          >
            <FormControl>
              <FormLabel htmlFor="currentPassword">Current Password</FormLabel>
              <TextField
                id="currentPassword"
                type="password"
                name="currentPassword"
                required
                fullWidth
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                error={!!errors.currentPassword}
                helperText={errors.currentPassword}
                disabled={loading}
              />
            </FormControl>

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
                disabled={loading}
              />
            </FormControl>
            
            <FormControl>
              <FormLabel htmlFor="confirmPassword">Confirm New Password</FormLabel>
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
                disabled={loading}
              />
            </FormControl>
            
            <Button
              type="submit"
              fullWidth
              variant="contained"
              disabled={loading}
              sx={{ mt: 1 }}
            >
              {loading ? (
                <CircularProgress
                  size={24}
                  sx={{ color: "rgba(255, 255, 255, 0.7)" }}
                />
              ) : (
                "Change Password"
              )}
            </Button>
          </Box>
          
          <Divider />
          <Box sx={{ display: "flex", justifyContent: "center", gap: 2 }}>
            <Link href="/profile" variant="body2">
              Back to Profile
            </Link>
            <span>•</span>
            <Link href="/reset-password" variant="body2">
              Forgot Password?
            </Link>
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
      </ChangePasswordContainer>
    </AppTheme>
  );
}