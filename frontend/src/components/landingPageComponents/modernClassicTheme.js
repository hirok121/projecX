import { createTheme } from "@mui/material/styles";

// Modern minimal classic theme configuration
export const modernClassicTheme = createTheme({
  palette: {
    primary: { main: "#2C3E50" },
    secondary: { main: "#34495E" },
    background: {
      default: "#FAFAFA",
      paper: "#FFFFFF",
      hero: "#FFFFFF",
      sectionAlternate: "#F8F9FA",
      sectionDefault: "#FFFFFF",
    },
    text: {
      primary: "#2C3E50",
      secondary: "#5D6D7E",
      heroPrimary: "#2C3E50",
      heroSecondary: "#5D6D7E",
    },
  },
  typography: {
    fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
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
      fontSize: "1.125rem",
      color: "#5D6D7E",
      lineHeight: 1.6,
      fontWeight: 400,
      "@media (min-width:600px)": { fontSize: "1.1875rem" },
    },
    h6: {
      fontWeight: 500,
      fontSize: "1rem",
      color: "#2C3E50",
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
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: "4px",
          textTransform: "none",
          padding: "12px 32px",
          fontWeight: 500,
          boxShadow: "none",
          transition: "all 0.2s ease",
          fontSize: "1rem",
        },
        containedPrimary: {
          backgroundColor: "#2C3E50",
          color: "white",
          "&:hover": { backgroundColor: "#34495E", boxShadow: "none" },
        },
        containedSizeLarge: { padding: "14px 36px", fontSize: "1.0625rem" },
        outlinedPrimary: {
          borderColor: "#2C3E50",
          borderWidth: "1.5px",
          color: "#2C3E50",
          "&:hover": {
            backgroundColor: "rgba(44, 62, 80, 0.04)",
            borderColor: "#34495E",
            borderWidth: "1.5px",
          },
        },
      },
    },
    MuiCard: {
      defaultProps: { elevation: 0 },
      styleOverrides: {
        root: {
          borderRadius: "8px",
          border: "1px solid #E8EAED",
          transition: "all 0.2s ease",
          "&:hover": {
            borderColor: "#D1D5DB",
            boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
          },
        },
      },
    },
    MuiPaper: {
      styleOverrides: { root: { transition: "all 0.2s ease" } },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: "rgba(255, 255, 255, 0.95)",
          backdropFilter: "blur(10px)",
          boxShadow: "0 1px 0 rgba(0,0,0,0.05)",
        },
      },
    },
  },
});
