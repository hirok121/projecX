import { Box, Typography, Avatar } from "@mui/material";
import PropTypes from "prop-types";
import ReactMarkdown from "react-markdown";

const MessageBubble = ({ message, isLoading = false }) => {
  // Backend sends 'role' field: 'user' or 'assistant'
  const isUser = message.role === "user" || message.is_from_user === true;

  // Enhanced User and AI avatars
  const UserAvatar = () => (
    <Avatar
      sx={{
        width: 32,
        height: 32,
        background: "linear-gradient(135deg, #0ea5e9 0%, #0284c7 100%)",
        fontSize: "1rem",
        boxShadow: "0 2px 8px rgba(14, 165, 233, 0.25)",
      }}
    >
      👤
    </Avatar>
  );

  const AIAvatar = () => (
    <Box
      sx={{
        width: 32,
        height: 32,
        borderRadius: "50%",
        background: "linear-gradient(135deg, #0ea5e9 0%, #0284c7 100%)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: "16px",
        flexShrink: 0,
        boxShadow: "0 2px 8px rgba(14, 165, 233, 0.3)",
      }}
    >
      🩺
    </Box>
  );

  // Bouncing dots component for loading
  const BouncingDots = () => (
    <Box
      sx={{
        display: "flex",
        gap: 0.5,
        alignItems: "center",
        "& > div": {
          width: 8,
          height: 8,
          borderRadius: "50%",
          backgroundColor: "#64748B",
          animation: "bounce 1.4s ease-in-out infinite",
        },
        "& > div:nth-of-type(1)": { animationDelay: "0s" },
        "& > div:nth-of-type(2)": { animationDelay: "0.2s" },
        "& > div:nth-of-type(3)": { animationDelay: "0.4s" },
        "@keyframes bounce": {
          "0%, 60%, 100%": {
            transform: "translateY(0)",
            opacity: 0.4,
          },
          "30%": {
            transform: "translateY(-10px)",
            opacity: 1,
          },
        },
      }}
    >
      <div />
      <div />
      <div />
    </Box>
  );

  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: isUser ? "flex-end" : "flex-start",
        mb: 2,
        px: 2,
      }}
    >
      <Box
        sx={{
          display: "flex",
          flexDirection: isUser ? "row-reverse" : "row",
          gap: 1.5,
          maxWidth: "75%",
          alignItems: "flex-start",
        }}
      >
        {isUser ? <UserAvatar /> : <AIAvatar />}

        <Box sx={{ minWidth: "100px" }}>
          <Box
            sx={{
              p: 2,
              borderRadius: isUser
                ? "12px 12px 2px 12px"
                : "12px 12px 12px 2px",
              background: isUser
                ? "linear-gradient(135deg, #0ea5e9 0%, #0284c7 100%)"
                : "#ffffff",
              color: isUser ? "#ffffff" : "#1e293b",
              boxShadow: isUser
                ? "0 2px 8px rgba(14, 165, 233, 0.2)"
                : "0 2px 8px rgba(0, 0, 0, 0.08)",
              border: isUser ? "none" : "1px solid #e2e8f0",
            }}
          >
            {isLoading ? (
              <BouncingDots />
            ) : isUser ? (
              <Typography
                variant="body2"
                sx={{
                  lineHeight: 1.6,
                  fontSize: "0.9rem",
                  wordBreak: "break-word",
                  whiteSpace: "pre-wrap",
                }}
              >
                {message.content}
              </Typography>
            ) : (
              <ReactMarkdown
                components={{
                  p: ({ children }) => (
                    <Typography
                      variant="body2"
                      sx={{
                        lineHeight: 1.6,
                        fontSize: "0.9rem",
                        mb: 1,
                        "&:last-child": { mb: 0 },
                      }}
                    >
                      {children}
                    </Typography>
                  ),
                  ul: ({ children }) => (
                    <Box component="ul" sx={{ pl: 2, mb: 1 }}>
                      {children}
                    </Box>
                  ),
                  li: ({ children }) => (
                    <Typography
                      component="li"
                      variant="body2"
                      sx={{ fontSize: "0.9rem", mb: 0.5 }}
                    >
                      {children}
                    </Typography>
                  ),
                }}
              >
                {message.content}
              </ReactMarkdown>
            )}
            {message.created_at && !isLoading && (
              <Typography
                variant="caption"
                sx={{
                  display: "block",
                  mt: 1,
                  opacity: 0.7,
                  fontSize: "0.7rem",
                  textAlign: isUser ? "right" : "left",
                }}
              >
                {new Date(message.created_at).toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </Typography>
            )}
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

MessageBubble.propTypes = {
  message: PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    is_from_user: PropTypes.bool.isRequired,
    content: PropTypes.string.isRequired,
    created_at: PropTypes.string.isRequired,
  }).isRequired,
  isLoading: PropTypes.bool,
};

export default MessageBubble;
