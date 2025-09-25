// AuthCallback.jsx
import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Box, CircularProgress, Typography, Alert } from "@mui/material";
import { useAuth } from "../../context/AuthContext";
import authAPI from "../../services/authAPI";

const AuthCallback = () => {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { handleOAuthToken } = useAuth();

  useEffect(() => {
    const handleGoogleCallback = async () => {
      console.log("AuthCallback component mounted, current URL:", window.location.href);

      const code = params.get("code");
      const state = params.get("state");
      const errorParam = params.get("error");
      const errorDescription = params.get("error_description");

      console.log("AuthCallback - URL params:", {
        code: !!code,
        state,
        error: errorParam,
        errorDescription,
        fullUrl: window.location.href,
      });

      // Handle OAuth errors
      if (errorParam) {
        console.error("AuthCallback - OAuth error:", errorParam, errorDescription);
        setError(errorDescription || errorParam || "Authentication failed");
        setLoading(false);
        
        setTimeout(() => {
          navigate("/signin", {
            state: {
              message: `Authentication failed: ${errorDescription || errorParam}`,
            },
          });
        }, 3000);
        return;
      }

      // Handle missing authorization code
      if (!code) {
        console.error("AuthCallback - Missing authorization code");
        setError("Authorization code not received");
        setLoading(false);
        
        setTimeout(() => {
          navigate("/signin", {
            state: {
              message: "Authentication failed: No authorization code received",
            },
          });
        }, 3000);
        return;
      }

      // Exchange code for tokens
      try {
        console.log("AuthCallback - Exchanging code for tokens");
        
        const response = await authAPI.googleCallback(code);
        
        if (response.access_token) {
          console.log("AuthCallback - Token received, handling OAuth authentication...");
          
          // Use AuthContext to handle OAuth token and authenticate user
          const result = await handleOAuthToken(response.access_token);
          
          if (result.success) {
            console.log("AuthCallback - OAuth authentication successful");
            // Navigate to home page
            navigate("/", { 
              replace: true,
              state: {
                message: "Successfully signed in with Google!",
              },
            });
          } else {
            throw new Error(result.error || "Failed to authenticate with OAuth token");
          }
        } else {
          throw new Error("No access token received");
        }
      } catch (error) {
        console.error("AuthCallback - Error during token exchange:", error);
        
        let errorMessage = "Authentication failed";
        if (error.response?.data?.detail) {
          errorMessage = error.response.data.detail;
        } else if (error.message) {
          errorMessage = error.message;
        }
        
        setError(errorMessage);
        setLoading(false);
        
        setTimeout(() => {
          navigate("/signin", {
            state: {
              message: `Authentication failed: ${errorMessage}`,
            },
          });
        }, 3000);
      }
    };

    handleGoogleCallback();
  }, [params, navigate, handleOAuthToken]);

  return (
    <Box
      display="flex"
      flexDirection="column"
      justifyContent="center"
      alignItems="center"
      minHeight="100vh"
      bgcolor="#f9fafb"
      px={2}
    >
      {loading ? (
        <>
          <CircularProgress
            size={60}
            thickness={4.5}
            sx={{ color: "primary.main", mb: 4 }}
          />
          <Typography variant="h5" fontWeight={600} color="text.primary">
            Signing you in...
          </Typography>
          <Typography variant="body2" color="text.secondary" mt={1}>
            Please wait while we complete your Google authentication.
          </Typography>
        </>
      ) : error ? (
        <>
          <Alert severity="error" sx={{ mb: 4, maxWidth: 400 }}>
            {error}
          </Alert>
          <Typography variant="h6" color="error.main" sx={{ mb: 2 }}>
            Authentication Failed
          </Typography>
          <Typography variant="body2" color="text.secondary" textAlign="center">
            Redirecting you back to sign in page...
          </Typography>
        </>
      ) : (
        <>
          <CircularProgress
            size={60}
            thickness={4.5}
            sx={{ color: "success.main", mb: 4 }}
          />
          <Typography variant="h5" fontWeight={600} color="success.main">
            Success!
          </Typography>
          <Typography variant="body2" color="text.secondary" mt={1}>
            Redirecting you to the dashboard...
          </Typography>
        </>
      )}
    </Box>
  );
};

export default AuthCallback;
