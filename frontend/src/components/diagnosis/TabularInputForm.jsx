import { Box, Typography, TextField, Grid, Chip } from "@mui/material";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";

function TabularInputForm({ requiredFeatures, inputData, onChange }) {
  const handleFieldChange = (field, value) => {
    onChange({ ...inputData, [field]: value });
  };

  const getFieldLabel = (field) => {
    // Convert field names to readable labels
    const labels = {
      age: "Age (years)",
      sex: "Sex (M/F/O)",
      alp: "ALP (Alkaline Phosphatase)",
      ast: "AST (Aspartate Aminotransferase)",
      che: "CHE (Cholinesterase)",
      crea: "CREA (Creatinine)",
      cgt: "CGT (Gamma-Glutamyl Transferase)",
      alb: "ALB (Albumin)",
      bil: "BIL (Bilirubin)",
      chol: "CHOL (Cholesterol)",
      prot: "PROT (Total Protein)",
      alt: "ALT (Alanine Aminotransferase)",
    };

    return labels[field.toLowerCase()] || field.toUpperCase();
  };

  const getFieldType = (field) => {
    // Determine input type based on field name
    if (field.toLowerCase() === "sex") {
      return "text";
    }
    return "number";
  };

  const getFieldHelp = (field) => {
    // Provide helpful descriptions for fields
    const help = {
      age: "Patient's age in years",
      sex: "M for Male, F for Female, O for Other",
      alp: "Normal range: 30-120 U/L",
      ast: "Normal range: 10-40 U/L",
      che: "Normal range: 5000-12000 U/L",
      crea: "Normal range: 0.7-1.3 mg/dL",
      cgt: "Normal range: 9-48 U/L",
      alb: "Normal range: 3.5-5.5 g/dL",
      bil: "Normal range: 0.1-1.2 mg/dL",
      chol: "Normal range: 125-200 mg/dL",
      prot: "Normal range: 6.0-8.3 g/dL",
      alt: "Normal range: 7-55 U/L",
    };

    return help[field.toLowerCase()] || "Enter the measured value";
  };

  if (!requiredFeatures || requiredFeatures.length === 0) {
    return (
      <Box sx={{ textAlign: "center", py: 4 }}>
        <Typography variant="body1" color="text.secondary">
          No input fields configured for this disease
        </Typography>
      </Box>
    );
  }

  return (
    <Box>
      <Box sx={{ display: "flex", alignItems: "center", mb: 3 }}>
        <Typography variant="h6" sx={{ fontWeight: 600, flexGrow: 1 }}>
          Enter Clinical Data
        </Typography>
        <Chip
          icon={<InfoOutlinedIcon />}
          label={`${requiredFeatures.length} fields required`}
          size="small"
          color="primary"
          variant="outlined"
        />
      </Box>

      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Please fill in all laboratory test results. All fields are required for
        accurate prediction.
      </Typography>

      <Grid container spacing={3}>
        {requiredFeatures.map((field) => {
          const fieldType = getFieldType(field);
          const isRequired = true;
          const value = inputData[field] || "";

          return (
            <Grid item xs={12} sm={6} key={field}>
              <TextField
                fullWidth
                label={getFieldLabel(field)}
                type={fieldType}
                value={value}
                onChange={(e) => handleFieldChange(field, e.target.value)}
                required={isRequired}
                helperText={getFieldHelp(field)}
                InputProps={{
                  inputProps:
                    fieldType === "number"
                      ? {
                          min: 0,
                          step: "any",
                        }
                      : {},
                }}
                sx={{
                  "& .MuiOutlinedInput-root": {
                    backgroundColor: "white",
                  },
                }}
              />
            </Grid>
          );
        })}
      </Grid>
    </Box>
  );
}

export default TabularInputForm;
