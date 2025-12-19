import React from "react";
import PropTypes from "prop-types";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";

// Green theme for website/landing pages
const websiteTheme = createTheme({
  palette: {
    primary: {
      main: "#10B981", // Green
      light: "#34D399",
      dark: "#059669",
      contrastText: "#FFFFFF",
    },
    secondary: {
      main: "#34D399",
      light: "#6EE7B7",
      dark: "#10B981",
      contrastText: "#FFFFFF",
    },
    background: {
      default: "#F8F9FA",
      paper: "#FFFFFF",
      hero: "#0F172A",
      sectionAlternate: "#FFFFFF",
      sectionDefault: "#F0F4F8",
    },
    text: {
      primary: "#2C3E50",
      secondary: "#5D6D7E",
      heroPrimary: "#2C3E50",
      heroSecondary: "#5D6D7E",
      disabled: "#94A3B8",
    },
    success: {
      main: "#10B981",
      light: "#34D399",
      dark: "#059669",
    },
    error: {
      main: "#EF4444",
      light: "#F87171",
      dark: "#DC2626",
    },
    warning: {
      main: "#F59E0B",
      light: "#FBBF24",
      dark: "#D97706",
    },
    info: {
      main: "#3B82F6",
      light: "#60A5FA",
      dark: "#2563EB",
    },
    grey: {
      50: "#F9FAFB",
      100: "#F3F4F6",
      200: "#E5E7EB",
      300: "#D1D5DB",
      400: "#9CA3AF",
      500: "#6B7280",
      600: "#4B5563",
      700: "#374151",
      800: "#1F2937",
      900: "#111827",
    },
    divider: "#E8EAED",
  },
  typography: {
    fontFamily:
      "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
    h1: {
      fontWeight: 600,
      fontSize: "2.5rem",
      lineHeight: 1.3,
      color: "#2C3E50",
      "@media (min-width:600px)": { fontSize: "3rem" },
      "@media (min-width:900px)": { fontSize: "3.5rem" },
      letterSpacing: "-0.02em",
    },
    h2: {
      fontWeight: 600,
      fontSize: "2rem",
      marginBottom: "1rem",
      color: "#2C3E50",
      "@media (min-width:600px)": { fontSize: "2.5rem" },
      letterSpacing: "-0.01em",
    },
    h3: {
      fontWeight: 500,
      fontSize: "1.5rem",
      marginBottom: "0.75rem",
      color: "#2C3E50",
    },
    h4: { fontWeight: 500, fontSize: "1.25rem", color: "#2C3E50" },

    h5: {
      fontWeight: 600,
      fontSize: "1.25rem",
      lineHeight: 1.5,
      "@media (min-width:600px)": {
        fontSize: "1.5rem",
      },
    },
    h6: {
      fontWeight: 600,
      fontSize: "1rem",
      lineHeight: 1.6,
      "@media (min-width:600px)": {
        fontSize: "1.125rem",
      },
    },
    body1: { fontSize: "1.0625rem", lineHeight: 1.6, color: "#5D6D7E" },
    body2: { fontSize: "0.9375rem", lineHeight: 1.5, color: "#7F8C8D" },
    subtitle1: {
      fontSize: "1.125rem",
      color: "#5D6D7E",
      marginBottom: "3rem",
      maxWidth: "70ch",
      marginLeft: "auto",
      marginRight: "auto",
      lineHeight: 1.6,
      "@media (min-width:600px)": { fontSize: "1.1875rem" },
    },
    subtitle2: {
      fontSize: "1rem",
      lineHeight: 1.6,
      fontWeight: 500,
    },
    button: {
      fontWeight: 600,
      textTransform: "none",
      fontSize: "1rem",
    },
    caption: {
      fontSize: "0.75rem",
      lineHeight: 1.5,
      color: "#64748B",
    },
    overline: {
      fontSize: "0.75rem",
      fontWeight: 600,
      lineHeight: 2,
      textTransform: "uppercase",
      letterSpacing: "0.08em",
    },
  },
  shape: {
    borderRadius: 8,
  },
  shadows: [
    "none",
    "0 1px 2px 0 rgba(0, 0, 0, 0.05)",
    "0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)",
    "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
    "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)",
    "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
    "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
    "0 2px 8px rgba(44, 62, 80, 0.08)",
    "0 4px 16px rgba(44, 62, 80, 0.12)",
    "0 8px 24px rgba(44, 62, 80, 0.15)",
    "0 12px 32px rgba(44, 62, 80, 0.18)",
    "0 16px 40px rgba(44, 62, 80, 0.20)",
    "0 20px 48px rgba(44, 62, 80, 0.22)",
    "0 24px 56px rgba(44, 62, 80, 0.24)",
    "0 28px 64px rgba(44, 62, 80, 0.26)",
    "0 32px 72px rgba(44, 62, 80, 0.28)",
    "0 36px 80px rgba(44, 62, 80, 0.30)",
    "0 40px 88px rgba(44, 62, 80, 0.32)",
    "0 44px 96px rgba(44, 62, 80, 0.34)",
    "0 48px 104px rgba(44, 62, 80, 0.36)",
    "0 52px 112px rgba(44, 62, 80, 0.38)",
    "0 56px 120px rgba(44, 62, 80, 0.40)",
    "0 60px 128px rgba(44, 62, 80, 0.42)",
    "0 64px 136px rgba(44, 62, 80, 0.44)",
    "0 68px 144px rgba(44, 62, 80, 0.46)",
  ],
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: "8px",
          textTransform: "none",
          padding: "10px 24px",
          fontWeight: 600,
          fontSize: "1rem",
          boxShadow: "none",
          transition: "all 0.2s ease",
          "&:hover": {
            boxShadow: "none",
          },
        },
        containedPrimary: {
          backgroundColor: "#10B981",
          color: "#FFFFFF",
          "&:hover": {
            backgroundColor: "#059669",
            transform: "translateY(-1px)",
          },
          "&:active": {
            transform: "translateY(0)",
          },
        },
        outlinedPrimary: {
          borderColor: "#10B981",
          color: "#10B981",
          borderWidth: "2px",
          "&:hover": {
            backgroundColor: "rgba(16, 185, 129, 0.04)",
            borderColor: "#059669",
            borderWidth: "2px",
          },
        },
        textPrimary: {
          color: "#10B981",
          "&:hover": {
            backgroundColor: "rgba(16, 185, 129, 0.04)",
          },
        },
        sizeLarge: {
          padding: "12px 32px",
          fontSize: "1.125rem",
        },
        sizeSmall: {
          padding: "6px 16px",
          fontSize: "0.875rem",
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: "8px",
          border: "1px solid #E8EAED",
          boxShadow: "none",
          transition: "all 0.2s ease",
          "&:hover": {
            transform: "translateY(-2px)",
            boxShadow: "0 2px 8px rgba(44, 62, 80, 0.08)",
            borderColor: "#D1D5DB",
          },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: "8px",
        },
        elevation1: {
          boxShadow:
            "0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)",
        },
        elevation2: {
          boxShadow:
            "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: "6px",
          fontWeight: 500,
        },
        colorPrimary: {
          backgroundColor: "#ECFDF5",
          color: "#10B981",
          border: "1px solid #D1FAE5",
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          "& .MuiOutlinedInput-root": {
            borderRadius: "8px",
            "&:hover .MuiOutlinedInput-notchedOutline": {
              borderColor: "#10B981",
            },
            "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
              borderColor: "#10B981",
              borderWidth: "2px",
            },
          },
        },
      },
    },
    MuiLink: {
      styleOverrides: {
        root: {
          color: "#10B981",
          textDecoration: "none",
          fontWeight: 500,
          transition: "color 0.2s ease",
          "&:hover": {
            color: "#059669",
            textDecoration: "underline",
          },
        },
      },
    },
  },
});

export default function WebsiteTheme({ children }) {
  return (
    <ThemeProvider theme={websiteTheme}>
      <CssBaseline />
      {children}
    </ThemeProvider>
  );
}

WebsiteTheme.propTypes = {
  children: PropTypes.node.isRequired,
};
