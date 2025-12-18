import PropTypes from "prop-types";
import { Typography, Grid, TextField, MenuItem, Box, Paper } from "@mui/material";
import PersonIcon from "@mui/icons-material/Person";

function PatientInfoSection({
  patientName,
  setPatientName,
  patientAge,
  setPatientAge,
  patientSex,
  setPatientSex,
}) {
  return (
    <Paper
      sx={{
        p: 3,
        mb: 3,
        borderRadius: 2,
        backgroundColor: "#F9FAFB",
        border: "1px solid #E5E7EB",
      }}
    >
      <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
        <PersonIcon sx={{ color: "#10B981" }} />
        <Typography variant="h6" sx={{ fontWeight: 600, color: "#374151" }}>
          Patient Information
        </Typography>
      </Box>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Optional - Provide patient details for record keeping
      </Typography>

      <Grid container spacing={2}>
        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            label="Patient Name"
            placeholder="Enter full name"
            value={patientName}
            onChange={(e) => setPatientName(e.target.value)}
            sx={{
              "& .MuiOutlinedInput-root": {
                backgroundColor: "#FFFFFF",
                "&.Mui-focused fieldset": {
                  borderColor: "#10B981",
                },
              },
              "& .MuiInputLabel-root.Mui-focused": {
                color: "#10B981",
              },
            }}
          />
        </Grid>
        <Grid item xs={6} md={3}>
          <TextField
            fullWidth
            label="Age"
            type="number"
            placeholder="Years"
            value={patientAge}
            onChange={(e) => setPatientAge(e.target.value)}
            slotProps={{
              htmlInput: { min: 0, max: 150 },
            }}
            sx={{
              "& .MuiOutlinedInput-root": {
                backgroundColor: "#FFFFFF",
                "&.Mui-focused fieldset": {
                  borderColor: "#10B981",
                },
              },
              "& .MuiInputLabel-root.Mui-focused": {
                color: "#10B981",
              },
            }}
          />
        </Grid>
        <Grid item xs={6} md={3}>
          <TextField
            fullWidth
            select
            label="Gender"
            value={patientSex}
            onChange={(e) => setPatientSex(e.target.value)}
            SelectProps={{
              displayEmpty: true,
            }}
            sx={{
              "& .MuiOutlinedInput-root": {
                backgroundColor: "#FFFFFF",
                "&.Mui-focused fieldset": {
                  borderColor: "#10B981",
                },
              },
              "& .MuiInputLabel-root.Mui-focused": {
                color: "#10B981",
              },
            }}
          >
            <MenuItem value="">
              <em>Select</em>
            </MenuItem>
            <MenuItem value="Male">Male</MenuItem>
            <MenuItem value="Female">Female</MenuItem>
            <MenuItem value="Other">Other</MenuItem>
          </TextField>
        </Grid>
      </Grid>
    </Paper>
  );
}

PatientInfoSection.propTypes = {
  patientName: PropTypes.string.isRequired,
  setPatientName: PropTypes.func.isRequired,
  patientAge: PropTypes.string.isRequired,
  setPatientAge: PropTypes.func.isRequired,
  patientSex: PropTypes.string.isRequired,
  setPatientSex: PropTypes.func.isRequired,
};

export default PatientInfoSection;
