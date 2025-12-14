import { useRef, useEffect } from "react";
import { Box, Typography, Skeleton } from "@mui/material";
import PropTypes from "prop-types";
import MessageBubble from "./MessageBubble";

const ChatMessages = ({
  messages,
  isLoading = false,
  loadingMessage = false,
}) => {
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  // Loading skeleton component
  const MessageSkeleton = () => (
    <Box
      sx={{
        display: "flex",
        gap: 2,
        p: 2,
        maxWidth: "70%",
        animation: "pulse 1.5s ease-in-out infinite",
        "@keyframes pulse": {
          "0%": { opacity: 1 },
          "50%": { opacity: 0.7 },
          "100%": { opacity: 1 },
        },
      }}
    >
      <Skeleton
        variant="circular"
        width={32}
        height={32}
        sx={{ flexShrink: 0 }}
      />
      <Box sx={{ flex: 1 }}>
        <Skeleton variant="text" width="60%" height={20} sx={{ mb: 1 }} />
        <Skeleton variant="text" width="90%" height={16} />
        <Skeleton variant="text" width="75%" height={16} />
        <Skeleton variant="text" width="40%" height={16} />
      </Box>
    </Box>
  );
  return (
    <Box
      sx={{
        flex: 1,
        overflow: "auto",
        py: 2,
        px: 2,
        background: "#fafafa",
        minHeight: 0,
        "&::-webkit-scrollbar": {
          width: "4px",
        },
        "&::-webkit-scrollbar-track": {
          background: "transparent",
        },
        "&::-webkit-scrollbar-thumb": {
          background: "#cbd5e1",
          borderRadius: "2px",
          "&:hover": {
            background: "#94a3b8",
          },
        },
      }}
    >
      {messages.length === 0 && !isLoading ? (
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            height: "100%",
            px: 3,
            textAlign: "center",
          }}
        >
          {/* Medical Icon */}
          <Box
            sx={{
              width: 80,
              height: 80,
              borderRadius: "16px",
              background: "linear-gradient(135deg, #0ea5e9 0%, #0284c7 100%)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              mb: 3,
              boxShadow: "0 8px 24px rgba(14, 165, 233, 0.25)",
            }}
          >
            <Typography sx={{ fontSize: "2.5rem" }}>🩺</Typography>
          </Box>

          <Typography
            variant="h5"
            sx={{
              fontWeight: 700,
              color: "#0f172a",
              mb: 2,
            }}
          >
            Health AI Assistant
          </Typography>

          <Typography
            variant="body1"
            sx={{
              color: "#64748b",
              mb: 4,
              maxWidth: 500,
            }}
          >
            Ask me about various diseases, medical imaging analysis, lab results
            interpretation, or general health guidance across our 15+ disease
            categories.
          </Typography>

          {/* Quick question suggestions */}
          <Box sx={{ display: "grid", gap: 1.5, maxWidth: 600 }}>
            {[
              "🔬 What diseases can this platform diagnose?",
              "📊 How do I upload and analyze my medical images?",
              "💊 Can you explain different lab test parameters?",
              "🩺 What should I know about preventive health screening?",
            ].map((question, index) => (
              <Box
                key={index}
                sx={{
                  p: 2,
                  background: "#ffffff",
                  borderRadius: "8px",
                  border: "1px solid #e2e8f0",
                  textAlign: "left",
                  fontSize: "0.9rem",
                  color: "#475569",
                }}
              >
                {question}
              </Box>
            ))}
          </Box>
        </Box>
      ) : (
        <>
          {messages.map((message) => (
            <MessageBubble key={message.id} message={message} />
          ))}

          {/* Loading message for AI response */}
          {loadingMessage && (
            <MessageBubble message={loadingMessage} isLoading={true} />
          )}

          {/* Skeletons for loading state */}
          {isLoading && (
            <Box sx={{ px: 2 }}>
              <MessageSkeleton />
            </Box>
          )}

          <div ref={messagesEndRef} />
        </>
      )}
    </Box>
  );
};

ChatMessages.propTypes = {
  messages: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
      type: PropTypes.oneOf(["user", "ai"]).isRequired,
      content: PropTypes.string.isRequired,
      timestamp: PropTypes.string,
    })
  ).isRequired,
  isLoading: PropTypes.bool,
  loadingMessage: PropTypes.bool,
};

export default ChatMessages;
