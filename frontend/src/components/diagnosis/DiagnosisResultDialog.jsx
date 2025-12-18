import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  Alert,
  Chip,
} from "@mui/material";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import HomeIcon from "@mui/icons-material/Home";
import AddIcon from "@mui/icons-material/Add";

/**
 * Dialog component to show diagnosis submission response
 * @param {Object} props
 * @param {boolean} props.open - Dialog open state
 * @param {Object} props.response - API response (DiagnosisAcknowledgement)
 * @param {Function} props.onGoHome - Handler for "Go Home" button
 * @param {Function} props.onNewDiagnosis - Handler for "New Diagnosis" button
 */
function DiagnosisResultDialog({ open, response, onGoHome, onNewDiagnosis }) {
  if (!response) return null;

  return (
    <Dialog
      open={open}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 2,
          p: 1,
        },
      }}
    >
      <DialogTitle>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <CheckCircleIcon sx={{ color: "#10B981", fontSize: 32 }} />
          <Typography variant="h5" sx={{ fontWeight: 600 }}>
            Diagnosis Submitted Successfully
          </Typography>
        </Box>
      </DialogTitle>

      <DialogContent>
        <Box sx={{ mb: 2 }}>
          <Alert severity="success" sx={{ mb: 2 }}>
            {response.message}
          </Alert>

          <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
            <Box>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Diagnosis ID
              </Typography>
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                #{response.id}
              </Typography>
            </Box>

            <Box>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Status
              </Typography>
              <Chip
                label={response.status.toUpperCase()}
                color="warning"
                size="small"
                sx={{ fontWeight: 600 }}
              />
            </Box>

            {response.result_link && (
              <Box>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Result Link
                </Typography>
                <Typography
                  variant="body2"
                  sx={{
                    color: "#10B981",
                    wordBreak: "break-all",
                    fontFamily: "monospace",
                    backgroundColor: "#F3F4F6",
                    p: 1,
                    borderRadius: 1,
                  }}
                >
                  {response.result_link}
                </Typography>
              </Box>
            )}
          </Box>

          <Box sx={{ mt: 3, p: 2, backgroundColor: "#F0F9FF", borderRadius: 1 }}>
            <Typography variant="body2" color="text.secondary">
              <strong>What's next?</strong>
              <br />
              Your diagnosis is being processed in the background. You will
              receive an email notification when the results are ready. You can
              also check your diagnosis history to view the status.
            </Typography>
          </Box>
        </Box>
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button
          variant="outlined"
          startIcon={<HomeIcon />}
          onClick={onGoHome}
          sx={{ flex: 1 }}
        >
          Go Home
        </Button>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={onNewDiagnosis}
          sx={{
            flex: 1,
            backgroundColor: "#10B981",
            "&:hover": { backgroundColor: "#059669" },
          }}
        >
          New Diagnosis
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default DiagnosisResultDialog;
