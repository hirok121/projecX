import { useState } from "react";
import PropTypes from "prop-types";
import {
  Box,
  TextField,
  IconButton,
  Paper,
  Typography,
  Chip,
  CircularProgress,
} from "@mui/material";
import {
  Send as SendIcon,
  Mic as MicIcon,
  AttachFile as AttachFileIcon,
} from "@mui/icons-material";

const ChatInput = ({
  onSendMessage,
  isLoading = false,
  placeholder = "Ask about your health...",
  showQuickQuestions = true,
}) => {
  const [input, setInput] = useState("");

  const quickQuestions = [
    "What is Hepatitis C?",
    "How to read my liver test results?",
    "Treatment options available",
    "Managing symptoms",
  ];

  const handleSend = () => {
    if (!input.trim() || isLoading) return;

    onSendMessage(input.trim());
    setInput("");
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
            {" "}
            {/* Attach File Button */}
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
              disabled={!input.trim() || isLoading}
              sx={{
                backgroundColor:
                  input.trim() && !isLoading ? "#0ea5e9" : "#e2e8f0",
                color: input.trim() && !isLoading ? "white" : "#94a3b8",
                width: 36,
                height: 36,
                "&:hover": {
                  backgroundColor:
                    input.trim() && !isLoading ? "#0284c7" : "#e2e8f0",
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
  isLoading: PropTypes.bool,
  placeholder: PropTypes.string,
  showQuickQuestions: PropTypes.bool,
};

export default ChatInput;
