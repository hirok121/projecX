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
  IconButton,
  Snackbar,
} from "@mui/material";
import {
  Person,
  Email,
  CheckCircle,
  PhotoCamera,
  CalendarToday,
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
    "&:hover fieldset": { borderColor: "#2563EB" },
    "&.Mui-focused fieldset": { borderColor: "#2563EB" },
  },
};

const emptyForm = {
  first_name: "",
  last_name: "",
  birthday: "",
  phone_number: "",
  country: "",
  city: "",
  timezone: "",
};

export default function ProfilePage() {
  const { profile, loading, error, refetch } = useProfile();
  const {
    updateProfile,
    updateProfilePicture,
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
    const [first = "", last = ""] =
      normalizedProfile.full_name?.split(" ") ?? [];

    setFormData({
      first_name: first,
      last_name: last,
      birthday: normalizedProfile.birthday ?? "",
      phone_number: normalizedProfile.phone_number ?? "",
      country: normalizedProfile.location ?? "",
      city: normalizedProfile.city ?? "",
      timezone: normalizedProfile.timezone ?? "",
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
    await updateProfile({
      ...formData,
      birthday: formData.birthday || null,
    });
    setEditing(false);
    refetch();
  };

  const handleAvatarChange = async (e) => {
    const file = e.target.files?.[0];
    if (file) {
      await updateProfilePicture(file);
      refetch();
    }
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
              <Box position="relative">
                <Avatar
                  src={normalizedProfile?.avatar_url}
                  sx={{ width: 100, height: 100 }}
                >
                  {normalizedProfile?.username?.[0]?.toUpperCase()}
                </Avatar>
                <IconButton
                  component="label"
                  sx={{ position: "absolute", bottom: 0, right: 0 }}
                >
                  <PhotoCamera />
                  <input hidden type="file" onChange={handleAvatarChange} />
                </IconButton>
              </Box>
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
                <Button startIcon={<Edit />} onClick={() => setEditing(true)}>
                  Edit
                </Button>
              ) : (
                <>
                  <Button
                    startIcon={<Close />}
                    onClick={() => setEditing(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    startIcon={
                      updating ? <CircularProgress size={16} /> : <Save />
                    }
                    onClick={handleSave}
                    disabled={updating}
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
              ["birthday", "Birthday", "date"],
              ["phone_number", "Phone"],
              ["country", "Country"],
              ["city", "City"],
              ["timezone", "Timezone"],
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
                  InputLabelProps={type === "date" ? { shrink: true } : {}}
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
