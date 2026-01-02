import React, { useState, useEffect } from "react";
import {
  Box,
  Paper,
  Typography,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Alert,
  CircularProgress,
  Chip,
  Stack,
  Tooltip,
  Container,
} from "@mui/material";
import {
  Download as DownloadIcon,
  Visibility as ViewIcon,
  Delete as DeleteIcon,
  Refresh as RefreshIcon,
  FolderZip as ZipIcon,
} from "@mui/icons-material";
import api from "../../services/api";
import AdminNavBar from "../../components/admin/AdminNavbar";

const LogsViewer = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [viewDialog, setViewDialog] = useState(false);
  const [viewContent, setViewContent] = useState(null);
  const [totalSize, setTotalSize] = useState(0);
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    fetchLogs();
  }, []);

  const fetchLogs = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.get("/admin/logs/list");
      setLogs(response.data.files || []);
      setTotalSize(response.data.total_size_mb || 0);
    } catch (err) {
      setError(err.response?.data?.detail || "Failed to fetch logs");
      console.error("Error fetching logs:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadAll = async () => {
    try {
      setDownloading(true);
      const response = await api.get("/admin/logs/download-all", {
        responseType: "blob",
      });

      // Create download link
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;

      // Get filename from Content-Disposition header or use default
      const contentDisposition = response.headers["content-disposition"];
      const filename = contentDisposition
        ? contentDisposition.split("filename=")[1]?.replace(/"/g, "")
        : `logs_${new Date().toISOString().slice(0, 10)}.zip`;

      link.setAttribute("download", filename);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      setError(err.response?.data?.detail || "Failed to download logs");
      console.error("Error downloading logs:", err);
    } finally {
      setDownloading(false);
    }
  };

  const handleDownloadFile = async (filename) => {
    try {
      const response = await api.get(`/admin/logs/download/${filename}`, {
        responseType: "blob",
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", filename);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      setError(err.response?.data?.detail || "Failed to download file");
      console.error("Error downloading file:", err);
    }
  };

  const handleViewFile = async (filename) => {
    try {
      const response = await api.get(`/admin/logs/view/${filename}?lines=200`);
      setViewContent({
        filename,
        lines: response.data.lines,
        total_lines: response.data.total_lines,
        showing: response.data.showing,
      });
      setViewDialog(true);
    } catch (err) {
      setError(err.response?.data?.detail || "Failed to view file");
      console.error("Error viewing file:", err);
    }
  };

  const handleClearFile = async (filename) => {
    if (
      !window.confirm(
        `Are you sure you want to clear ${filename}? This action cannot be undone.`
      )
    ) {
      return;
    }

    try {
      await api.delete(`/admin/logs/clear/${filename}`);
      setError(null);
      alert(`${filename} cleared successfully`);
      fetchLogs();
    } catch (err) {
      setError(err.response?.data?.detail || "Failed to clear file");
      console.error("Error clearing file:", err);
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(2)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString();
  };

  return (
    <Box sx={{ minHeight: "100vh", backgroundColor: "#F8F9FA" }}>
      <AdminNavBar />

      <Container maxWidth="xl" sx={{ py: 4 }}>
        <Paper sx={{ p: 3 }}>
          {/* Header */}
          <Box
            sx={{
              mb: 3,
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <Box>
              <Typography variant="h4" gutterBottom>
                System Logs
              </Typography>
              <Typography variant="body2" color="text.secondary">
                View, download, and manage application logs
              </Typography>
            </Box>
            <Stack direction="row" spacing={2}>
              <Button
                variant="outlined"
                startIcon={<RefreshIcon />}
                onClick={fetchLogs}
                disabled={loading}
              >
                Refresh
              </Button>
              <Button
                variant="contained"
                startIcon={
                  downloading ? <CircularProgress size={20} /> : <ZipIcon />
                }
                onClick={handleDownloadAll}
                disabled={loading || logs.length === 0 || downloading}
              >
                Download All as ZIP
              </Button>
            </Stack>
          </Box>

          {/* Summary */}
          {!loading && logs.length > 0 && (
            <Box sx={{ mb: 2 }}>
              <Stack direction="row" spacing={2}>
                <Chip label={`${logs.length} log files`} color="primary" />
                <Chip
                  label={`Total size: ${totalSize.toFixed(2)} MB`}
                  color="secondary"
                />
              </Stack>
            </Box>
          )}

          {/* Error Alert */}
          {error && (
            <Alert
              severity="error"
              sx={{ mb: 2 }}
              onClose={() => setError(null)}
            >
              {error}
            </Alert>
          )}

          {/* Loading */}
          {loading ? (
            <Box sx={{ display: "flex", justifyContent: "center", p: 4 }}>
              <CircularProgress />
            </Box>
          ) : logs.length === 0 ? (
            <Alert severity="info">No log files found</Alert>
          ) : (
            /* Log Files Table */
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>File Name</TableCell>
                    <TableCell>Size</TableCell>
                    <TableCell>Last Modified</TableCell>
                    <TableCell align="right">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {logs.map((log) => (
                    <TableRow key={log.name} hover>
                      <TableCell>
                        <Typography
                          variant="body2"
                          sx={{ fontFamily: "monospace" }}
                        >
                          {log.name}
                        </Typography>
                      </TableCell>
                      <TableCell>{formatFileSize(log.size)}</TableCell>
                      <TableCell>{formatDate(log.modified)}</TableCell>
                      <TableCell align="right">
                        <Tooltip title="View Log">
                          <IconButton
                            size="small"
                            color="primary"
                            onClick={() => handleViewFile(log.name)}
                          >
                            <ViewIcon />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Download">
                          <IconButton
                            size="small"
                            color="info"
                            onClick={() => handleDownloadFile(log.name)}
                          >
                            <DownloadIcon />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Clear (Superuser only)">
                          <IconButton
                            size="small"
                            color="error"
                            onClick={() => handleClearFile(log.name)}
                          >
                            <DeleteIcon />
                          </IconButton>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </Paper>
      </Container>

      {/* View Dialog */}
      <Dialog
        open={viewDialog}
        onClose={() => setViewDialog(false)}
        maxWidth="lg"
        fullWidth
      >
        <DialogTitle>
          {viewContent?.filename}
          <Typography variant="caption" display="block" color="text.secondary">
            Showing last {viewContent?.showing} of {viewContent?.total_lines}{" "}
            lines
          </Typography>
        </DialogTitle>
        <DialogContent dividers>
          <TextField
            multiline
            fullWidth
            value={viewContent?.lines?.join("") || ""}
            InputProps={{
              readOnly: true,
              style: {
                fontFamily: "monospace",
                fontSize: "12px",
              },
            }}
            minRows={20}
            maxRows={30}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setViewDialog(false)}>Close</Button>
          <Button
            variant="contained"
            onClick={() => handleDownloadFile(viewContent?.filename)}
          >
            Download Full File
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default LogsViewer;
