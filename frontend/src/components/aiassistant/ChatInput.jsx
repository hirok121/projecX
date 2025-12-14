import { useState, useRef } from "react";
import PropTypes from "prop-types";
import {
  Box,
  TextField,
  IconButton,
  Paper,
  Typography,
  Chip,
  CircularProgress,
  Alert,
  Stack,
} from "@mui/material";
import {
  Send as SendIcon,
  Mic as MicIcon,
  AttachFile as AttachFileIcon,
  Close as CloseIcon,
  Image as ImageIcon,
  PictureAsPdf as PdfIcon,
} from "@mui/icons-material";

const ChatInput = ({
  onSendMessage,
  onFileUpload,
  isLoading = false,
  placeholder = "Ask about diseases, upload medical images or lab results, or get health guidance...",
  showQuickQuestions = true,
}) => {
  const [input, setInput] = useState("");
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [uploadError, setUploadError] = useState("");
  const fileInputRef = useRef(null);

  const quickQuestions = [
    "🔬 How do I interpret my lab results?",
    "💔 What diseases can your platform diagnose?",
    "📊 Can you explain my X-ray or scan results?",
    "💊 What should I know about my diagnosis?",
  ];

  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    const allowedTypes = [
      "image/jpeg",
      "image/png",
      "image/jpg",
      "application/pdf",
    ];
    const maxSize = 10 * 1024 * 1024;
    const validFiles = [];
    const errors = [];

    for (const file of files) {
      // Validate file type
      if (!allowedTypes.includes(file.type)) {
        errors.push(`${file.name}: Invalid file type`);
        continue;
      }

      // Validate file size
      if (file.size > maxSize) {
        errors.push(`${file.name}: File too large (max 10MB)`);
        continue;
      }

      // Create file data object
      const fileData = { file, preview: null };

      // Create preview for images
      if (file.type.startsWith("image/")) {
        const reader = new FileReader();
        reader.onloadend = () => {
          setSelectedFiles((prev) =>
            prev.map((f) =>
              f.file === file ? { ...f, preview: reader.result } : f
            )
          );
        };
        reader.readAsDataURL(file);
      }

      validFiles.push(fileData);
    }

    if (errors.length > 0) {
      setUploadError(errors.join("; "));
    } else {
      setUploadError("");
    }

    setSelectedFiles((prev) => [...prev, ...validFiles]);
  };

  const handleRemoveFile = (indexToRemove) => {
    setSelectedFiles((prev) =>
      prev.filter((_, index) => index !== indexToRemove)
    );
    if (selectedFiles.length === 1) {
      setUploadError("");
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleClearAllFiles = () => {
    setSelectedFiles([]);
    setUploadError("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleSend = async () => {
    if (isLoading) return;

    // If there are files, upload them
    if (selectedFiles.length > 0) {
      if (onFileUpload) {
        await onFileUpload(
          selectedFiles.map((f) => f.file),
          input.trim()
        );
        setInput("");
        handleClearAllFiles();
      }
      return;
    }

    // Otherwise send text message
    if (!input.trim()) return;
    onSendMessage(input.trim());
    setInput("");
  };

  const handleAttachClick = () => {
    fileInputRef.current?.click();
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleQuickQuestion = (question) => {
    if (isLoading) return;
    setInput(question);
  };
  return (
    <Box
      sx={{
        background: "#ffffff",
        borderTop: "1px solid #e2e8f0",
      }}
    >
      {/* Quick Questions */}
      {showQuickQuestions && (
        <Box
          sx={{
            px: { xs: 2, md: 3 },
            py: 2,
            borderBottom: "1px solid #e2e8f0",
            background: "#fafafa",
          }}
        >
          <Typography
            variant="caption"
            sx={{
              mb: 1.5,
              color: "#64748b",
              fontWeight: 600,
              fontSize: "0.75rem",
              display: "block",
            }}
          >
            Suggested questions:
          </Typography>
          <Box
            sx={{
              display: "flex",
              flexWrap: "wrap",
              gap: 1,
            }}
          >
            {quickQuestions.map((question, index) => (
              <Chip
                key={index}
                label={question}
                onClick={() => handleQuickQuestion(question)}
                size="small"
                disabled={isLoading}
                sx={{
                  cursor: "pointer",
                  fontSize: "0.75rem",
                  fontWeight: 500,
                  background: "#ffffff",
                  border: "1px solid #e2e8f0",
                  color: "#475569",
                  "&:hover": {
                    background: "#f1f5f9",
                    borderColor: "#0ea5e9",
                  },
                  "&:disabled": {
                    opacity: 0.5,
                  },
                }}
              />
            ))}
          </Box>
        </Box>
      )}
      {/* Input Area */}
      <Box sx={{ px: { xs: 2, md: 3 }, py: 2 }}>
        {/* Upload Error */}
        {uploadError && (
          <Alert
            severity="error"
            onClose={() => setUploadError("")}
            sx={{ mb: 2 }}
          >
            {uploadError}
          </Alert>
        )}

        {/* File Previews */}
        {selectedFiles.length > 0 && (
          <Paper
            elevation={0}
            sx={{
              mb: 2,
              p: 2,
              border: "1px solid #e2e8f0",
              borderRadius: "8px",
              backgroundColor: "#f8fafc",
            }}
          >
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                mb: 1.5,
              }}
            >
              <Typography
                variant="body2"
                sx={{ fontWeight: 600, color: "#334155" }}
              >
                {selectedFiles.length} file{selectedFiles.length > 1 ? "s" : ""}{" "}
                selected
              </Typography>
              <IconButton
                size="small"
                onClick={handleClearAllFiles}
                sx={{
                  color: "#64748b",
                  "&:hover": {
                    backgroundColor: "rgba(239, 68, 68, 0.1)",
                    color: "#ef4444",
                  },
                }}
              >
                <CloseIcon fontSize="small" />
              </IconButton>
            </Box>
            <Stack spacing={1}>
              {selectedFiles.map((fileData, index) => (
                <Stack
                  key={index}
                  direction="row"
                  spacing={2}
                  alignItems="center"
                  sx={{
                    p: 1,
                    borderRadius: "4px",
                    backgroundColor: "#ffffff",
                    border: "1px solid #e2e8f0",
                  }}
                >
                  {fileData.preview ? (
                    <Box
                      component="img"
                      src={fileData.preview}
                      alt="Preview"
                      sx={{
                        width: 40,
                        height: 40,
                        objectFit: "cover",
                        borderRadius: "4px",
                        border: "1px solid #e2e8f0",
                      }}
                    />
                  ) : (
                    <Box
                      sx={{
                        width: 40,
                        height: 40,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        backgroundColor: "#e2e8f0",
                        borderRadius: "4px",
                      }}
                    >
                      <PdfIcon sx={{ fontSize: 24, color: "#64748b" }} />
                    </Box>
                  )}
                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Typography
                      variant="body2"
                      sx={{
                        fontWeight: 500,
                        color: "#334155",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {fileData.file.name}
                    </Typography>
                    <Typography variant="caption" sx={{ color: "#64748b" }}>
                      {(fileData.file.size / 1024).toFixed(2)} KB
                    </Typography>
                  </Box>
                  <IconButton
                    size="small"
                    onClick={() => handleRemoveFile(index)}
                    sx={{
                      color: "#64748b",
                      "&:hover": {
                        backgroundColor: "rgba(239, 68, 68, 0.1)",
                        color: "#ef4444",
                      },
                    }}
                  >
                    <CloseIcon fontSize="small" />
                  </IconButton>
                </Stack>
              ))}
            </Stack>
          </Paper>
        )}

        <Paper
          elevation={0}
          sx={{
            display: "flex",
            alignItems: "flex-end",
            gap: 1,
            p: 1,
            border: "2px solid #e2e8f0",
            borderRadius: "8px",
            backgroundColor: "#ffffff",
            "&:focus-within": {
              borderColor: "#0ea5e9",
            },
            transition: "border-color 0.2s ease",
          }}
        >
          {/* Text Input */}
          <TextField
            fullWidth
            multiline
            maxRows={4}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder={placeholder}
            disabled={isLoading}
            variant="standard"
            InputProps={{
              disableUnderline: true,
              sx: {
                fontSize: "0.95rem",
                lineHeight: 1.5,
                "& input": {
                  padding: "8px 12px",
                },
                "& textarea": {
                  padding: "8px 12px",
                },
              },
            }}
          />

          {/* Action Buttons */}
          <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
            {/* Hidden File Input */}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*,.pdf"
              multiple
              onChange={handleFileSelect}
              style={{ display: "none" }}
            />

            {/* Attach File Button */}
            <IconButton
              size="small"
              onClick={handleAttachClick}
              disabled={isLoading}
              sx={{
                color: selectedFiles.length > 0 ? "#0ea5e9" : "#475569",
                "&:hover": {
                  backgroundColor: "rgba(14, 165, 233, 0.1)",
                },
                "&:disabled": {
                  opacity: 0.5,
                },
              }}
            >
              <AttachFileIcon fontSize="small" />
            </IconButton>
            {/* Voice Input Button */}
            <IconButton
              size="small"
              disabled={isLoading}
              sx={{
                color: "#475569",
                "&:hover": {
                  backgroundColor: "rgba(71, 85, 105, 0.08)",
                },
                "&:disabled": {
                  opacity: 0.5,
                },
              }}
            >
              <MicIcon fontSize="small" />
            </IconButton>
            {/* Send Button */}
            <IconButton
              onClick={handleSend}
              disabled={
                (!input.trim() && selectedFiles.length === 0) || isLoading
              }
              sx={{
                backgroundColor:
                  (input.trim() || selectedFiles.length > 0) && !isLoading
                    ? "#0ea5e9"
                    : "#e2e8f0",
                color:
                  (input.trim() || selectedFiles.length > 0) && !isLoading
                    ? "white"
                    : "#94a3b8",
                width: 36,
                height: 36,
                "&:hover": {
                  backgroundColor:
                    (input.trim() || selectedFiles.length > 0) && !isLoading
                      ? "#0284c7"
                      : "#e2e8f0",
                },
                "&:disabled": {
                  backgroundColor: "#e2e8f0",
                  color: "#94a3b8",
                },
              }}
            >
              {isLoading ? (
                <CircularProgress size={16} sx={{ color: "#94a3b8" }} />
              ) : (
                <SendIcon fontSize="small" />
              )}
            </IconButton>
          </Box>
        </Paper>

        {/* Input hint */}
        <Typography
          variant="caption"
          sx={{
            display: "block",
            mt: 1,
            px: 1,
            color: "text.secondary",
            fontSize: "0.7rem",
          }}
        >
          Press Enter to send, Shift+Enter for new line
        </Typography>
      </Box>
    </Box>
  );
};

ChatInput.propTypes = {
  onSendMessage: PropTypes.func.isRequired,
  onFileUpload: PropTypes.func,
  isLoading: PropTypes.bool,
  placeholder: PropTypes.string,
  showQuickQuestions: PropTypes.bool,
};

export default ChatInput;
