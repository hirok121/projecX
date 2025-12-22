import { useState, useEffect } from "react";
import {
  Box,
  Card,
  Typography,
  Button,
  TextField,
  Avatar,
  Alert,
  Chip,
  Container,
  Grid,
  CircularProgress,
  Snackbar,
} from "@mui/material";
import {
  Email,
  CheckCircle,
  Edit,
  Save,
  Close,
} from "@mui/icons-material";
import NavBar from "../../components/layout/NavBar";
import LoadingIndicator from "../../components/ui/LoadingIndicator";
import { useProfile, useProfileUpdate } from "../../hooks/useProfile";

const fieldSx = {
  "& .MuiOutlinedInput-root": {
    borderRadius: 2,
    "&:hover fieldset": { borderColor: "#10B981" },
    "&.Mui-focused fieldset": { borderColor: "#10B981" },
  },
};

const emptyForm = {
  first_name: "",
  last_name: "",
  phone_number: "",
  country: "",
  city: "",
};

export default function ProfilePage() {
  const { profile, loading, error, refetch } = useProfile();
  const {
    updateProfile,
    updating,
    updateError,
    updateSuccess,
    clearMessages,
  } = useProfileUpdate();

  const normalizedProfile = profile?.data ?? profile;

  const [formData, setFormData] = useState(emptyForm);
  const [errors, setErrors] = useState({});
  const [editing, setEditing] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    if (!normalizedProfile) return;
    
    // Split full_name into first and last name
    const nameParts = normalizedProfile.full_name?.trim().split(/\s+/) || [];
    const firstName = nameParts[0] || "";
    const lastName = nameParts.slice(1).join(" ") || "";

    setFormData({
      first_name: firstName,
      last_name: lastName,
      phone_number: normalizedProfile.phone_number || "",
      country: normalizedProfile.country || "",
      city: normalizedProfile.city || "",
    });
  }, [normalizedProfile]);

  useEffect(() => {
    if (updateSuccess) setShowSuccess(true);
  }, [updateSuccess]);

  const handleChange = ({ target }) => {
    setFormData((p) => ({ ...p, [target.name]: target.value }));
    setErrors((p) => ({ ...p, [target.name]: "" }));
  };

  const validate = () => {
    const e = {};
    if (!formData.first_name.trim()) e.first_name = "Required";
    if (!formData.last_name.trim()) e.last_name = "Required";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSave = async () => {
    if (!validate()) return;
    
    // Combine first and last name into full_name
    const full_name = `${formData.first_name.trim()} ${formData.last_name.trim()}`.trim();
    
    await updateProfile({
      full_name,
      phone_number: formData.phone_number || null,
      country: formData.country || null,
      city: formData.city || null,
    });
    setEditing(false);
    refetch();
  };

  if (loading) {
    return (
      <Box minHeight="100vh">
        <NavBar />
        <LoadingIndicator />
      </Box>
    );
  }

  if (error) {
    return (
      <Box minHeight="100vh">
        <NavBar />
        <Alert severity="error">Failed to load profile</Alert>
      </Box>
    );
  }

  return (
    <Box minHeight="100vh" bgcolor="#f1f5f9">
      <NavBar />

      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Snackbar
          open={showSuccess}
          autoHideDuration={4000}
          onClose={() => setShowSuccess(false)}
        >
          <Alert severity="success">Profile updated</Alert>
        </Snackbar>

        {updateError && (
          <Alert severity="error" sx={{ mb: 2 }} onClose={clearMessages}>
            {updateError}
          </Alert>
        )}

        {/* HEADER */}
        <Card sx={{ p: 3, mb: 4 }}>
          <Grid container spacing={3} alignItems="center">
            <Grid item>
              <Avatar
                src={normalizedProfile?.avatar_url}
                sx={{ width: 100, height: 100 }}
              >
                {normalizedProfile?.username?.[0]?.toUpperCase()}
              </Avatar>
            </Grid>

            <Grid item xs>
              <Typography variant="h5">
                {normalizedProfile?.full_name || normalizedProfile?.username}
              </Typography>
              <Typography color="text.secondary">
                <Email fontSize="small" /> {normalizedProfile?.email}
              </Typography>
              {normalizedProfile?.is_email_verified && (
                <Chip
                  icon={<CheckCircle />}
                  label="Verified"
                  size="small"
                  color="success"
                  sx={{ mt: 1 }}
                />
              )}
            </Grid>

            <Grid item>
              {!editing ? (
                <Button 
                  startIcon={<Edit />} 
                  onClick={() => setEditing(true)}
                  sx={{
                    color: "#10B981",
                    borderColor: "#10B981",
                    "&:hover": {
                      backgroundColor: "#ECFDF5",
                      borderColor: "#059669",
                    },
                  }}
                  variant="outlined"
                >
                  Edit
                </Button>
              ) : (
                <>
                  <Button
                    startIcon={<Close />}
                    onClick={() => setEditing(false)}
                    sx={{
                      color: "#6B7280",
                      "&:hover": {
                        backgroundColor: "#F3F4F6",
                      },
                      mr: 1,
                    }}
                  >
                    Cancel
                  </Button>
                  <Button
                    startIcon={
                      updating ? <CircularProgress size={16} sx={{ color: "white" }} /> : <Save />
                    }
                    onClick={handleSave}
                    disabled={updating}
                    variant="contained"
                    sx={{
                      backgroundColor: "#10B981",
                      color: "white",
                      "&:hover": {
                        backgroundColor: "#059669",
                      },
                      "&:disabled": {
                        backgroundColor: "#D1FAE5",
                        color: "#6EE7B7",
                      },
                    }}
                  >
                    Save
                  </Button>
                </>
              )}
            </Grid>
          </Grid>
        </Card>

        {/* FORM */}
        <Card sx={{ p: 4 }}>
          <Grid container spacing={3}>
            {[
              ["first_name", "First Name"],
              ["last_name", "Last Name"],
              ["phone_number", "Phone"],
              ["country", "Country"],
              ["city", "City"],
            ].map(([name, label, type]) => (
              <Grid item xs={12} sm={6} key={name}>
                <TextField
                  fullWidth
                  type={type || "text"}
                  label={label}
                  name={name}
                  value={formData[name]}
                  onChange={handleChange}
                  disabled={!editing}
                  error={!!errors[name]}
                  helperText={errors[name]}
                  slotProps={{
                    inputLabel: type === "date" ? { shrink: true } : {},
                  }}
                  sx={fieldSx}
                />
              </Grid>
            ))}
          </Grid>
        </Card>
      </Container>
    </Box>
  );
}
