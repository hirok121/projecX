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
  Link,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import HomeIcon from "@mui/icons-material/Home";
import AddIcon from "@mui/icons-material/Add";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";

import PropTypes from "prop-types";

/**
 * Dialog component to show diagnosis submission response
 */
function DiagnosisResultDialog({ open, response, onGoHome, onNewDiagnosis }) {
  const navigate = useNavigate();

  if (!response) return null;

  const handleViewResults = () => {
    navigate(`/diagnosis/${response.id}`);
  };

  return (
    <Dialog
      open={open}
      maxWidth="sm"
      fullWidth
      slotProps={{
        paper: {
          sx: {
            borderRadius: 2,
            p: 1,
          },
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
                <Link
                  onClick={handleViewResults}
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 1,
                    color: "#10B981",
                    cursor: "pointer",
                    textDecoration: "none",
                    backgroundColor: "#F3F4F6",
                    p: 1.5,
                    borderRadius: 1,
                    "&:hover": {
                      backgroundColor: "#E5E7EB",
                      textDecoration: "underline",
                    },
                  }}
                >
                  <Typography
                    variant="body2"
                    sx={{
                      wordBreak: "break-all",
                      fontFamily: "monospace",
                      flex: 1,
                    }}
                  >
                    {response.result_link}
                  </Typography>
                  <OpenInNewIcon fontSize="small" />
                </Link>
              </Box>
            )}
          </Box>

          <Box sx={{ mt: 3, p: 2, backgroundColor: "#F0F9FF", borderRadius: 1 }}>
            <Typography variant="body2" color="text.secondary">
              <strong>What&apos;s next?</strong>
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

DiagnosisResultDialog.propTypes = {
  open: PropTypes.bool.isRequired,
  response: PropTypes.shape({
    id: PropTypes.number.isRequired,
    status: PropTypes.string.isRequired,
    message: PropTypes.string.isRequired,
    result_link: PropTypes.string,
  }),
  onGoHome: PropTypes.func.isRequired,
  onNewDiagnosis: PropTypes.func.isRequired,
};

export default DiagnosisResultDialog;
