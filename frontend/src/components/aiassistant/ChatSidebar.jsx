import React from "react";
import PropTypes from "prop-types";
import {
  Box,
  List,
  ListItem,
  ListItemButton,
  Typography,
  Button,
  Chip,
  IconButton,
  Menu,
  MenuItem,
  ListItemIcon,
  Skeleton,
  CircularProgress,
} from "@mui/material";
import {
  Add as AddIcon,
  Chat as ChatIcon,
  MoreVert as MoreVertIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
} from "@mui/icons-material";

const ChatSidebar = ({
  chats,
  currentChatId,
  onChatSelect,
  onNewChat,
  onDeleteChat,
  onEditChat,
  isLoading = false,
}) => {
  const [anchorEl, setAnchorEl] = React.useState(null);
  const [selectedChatId, setSelectedChatId] = React.useState(null);

  const handleMenuOpen = (event, chatId) => {
    event.stopPropagation();
    setAnchorEl(event.currentTarget);
    setSelectedChatId(chatId);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedChatId(null);
  };

  const handleEditTitle = () => {
    if (onEditChat && selectedChatId) {
      onEditChat(selectedChatId);
    }
    handleMenuClose();
  };

  const handleDelete = () => {
    if (onDeleteChat && selectedChatId) {
      onDeleteChat(selectedChatId);
    }
    handleMenuClose();
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = (now - date) / (1000 * 60 * 60);

    if (diffInHours < 24) {
      return date.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      });
    } else if (diffInHours < 24 * 7) {
      return date.toLocaleDateString([], { weekday: "short" });
    } else {
      return date.toLocaleDateString([], { month: "short", day: "numeric" });
    }
  };

  const truncateTitle = (title, maxLength = 25) => {
    if (!title) return "New Chat";
    return title.length > maxLength
      ? title.substring(0, maxLength) + "..."
      : title;
  };
  return (
    <Box
      sx={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        background: "#f8fafc",
      }}
    >
      {" "}
      {/* Header */}
      <Box
        sx={{
          p: 2,
          borderBottom: "1px solid #e2e8f0",
        }}
      >
        <Button
          fullWidth
          variant="contained"
          startIcon={
            isLoading ? (
              <CircularProgress size={18} color="inherit" />
            ) : (
              <AddIcon />
            )
          }
          onClick={onNewChat}
          disabled={isLoading}
          sx={{
            background: "#0ea5e9",
            color: "white",
            textTransform: "none",
            fontWeight: 600,
            py: 1.5,
            borderRadius: "8px",
            "&:hover": {
              background: "#0284c7",
            },
            "&:disabled": {
              background: "#e2e8f0",
              color: "#94a3b8",
            },
          }}
        >
          {isLoading ? "Creating..." : "New Chat"}
        </Button>
      </Box>
      {/* Chat List */}
      <Box
        sx={{
          flex: 1,
          overflow: "auto",
          py: 1,
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
        {isLoading ? (
          // Loading skeleton for chat list
          <List sx={{ px: 1 }}>
            {" "}
            {Array.from({ length: 5 }).map((_, index) => (
              <ListItem
                key={index}
                disablePadding
                sx={{
                  mb: 0.5,
                  borderRadius: "12px",
                  overflow: "hidden",
                }}
              >
                <Box sx={{ p: 2, width: "100%" }}>
                  <Skeleton variant="text" width="80%" height={20} />
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      mt: 0.5,
                    }}
                  >
                    <Skeleton variant="text" width="40%" height={16} />
                    <Skeleton variant="rounded" width={30} height={16} />
                  </Box>
                </Box>
              </ListItem>
            ))}
          </List>
        ) : chats.length === 0 ? (
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              height: "300px",
              color: "#64748b",
              px: 3,
            }}
          >
            <ChatIcon sx={{ fontSize: 48, mb: 2, opacity: 0.5 }} />
            <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
              No chats yet
            </Typography>
            <Typography variant="caption" textAlign="center">
              Start a new conversation
            </Typography>
          </Box>
        ) : (
          <List sx={{ px: 1 }}>
            {chats
              .filter((chat) => chat && chat.id) // Filter out invalid chat objects
              .map((chat) => (
                <ListItem
                  key={chat.id}
                  disablePadding
                  sx={{
                    mb: 0.5,
                    borderRadius: "12px",
                    overflow: "hidden",
                  }}
                >
                  {" "}
                  <ListItemButton
                    selected={currentChatId === chat.id}
                    onClick={() => onChatSelect(chat.id)}
                    sx={{
                      borderRadius: "8px",
                      mx: 1,
                      my: 0.5,
                      background:
                        currentChatId === chat.id ? "#0ea5e9" : "transparent",
                      color: currentChatId === chat.id ? "#ffffff" : "#0f172a",
                      "&.Mui-selected": {
                        "&:hover": {
                          background: "#0284c7",
                        },
                      },
                      "&:hover": {
                        backgroundColor:
                          currentChatId === chat.id ? undefined : "#f1f5f9",
                      },
                      px: 2,
                      py: 1.5,
                      transition: "all 0.2s ease",
                    }}
                  >
                    {" "}
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                      <Typography
                        variant="body2"
                        fontWeight={500}
                        component="div"
                        noWrap
                        sx={{
                          color:
                            currentChatId === chat.id ? "white" : "#0f172a",
                        }}
                      >
                        {truncateTitle(chat.title)}
                      </Typography>
                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                          mt: 0.5,
                        }}
                      >
                        <Typography
                          variant="caption"
                          component="div"
                          sx={{
                            color:
                              currentChatId === chat.id
                                ? "rgba(255, 255, 255, 0.8)"
                                : "#64748b",
                          }}
                        >
                          {formatDate(chat.updated_at)}
                        </Typography>
                        {chat.message_count > 0 && (
                          <Chip
                            size="small"
                            label={chat.message_count}
                            sx={{
                              height: 18,
                              fontSize: "0.7rem",
                              backgroundColor:
                                currentChatId === chat.id
                                  ? "rgba(255, 255, 255, 0.2)"
                                  : "#e2e8f0",
                              color:
                                currentChatId === chat.id ? "white" : "#64748b",
                            }}
                          />
                        )}
                      </Box>
                    </Box>
                    <IconButton
                      size="small"
                      onClick={(e) => handleMenuOpen(e, chat.id)}
                      sx={{
                        color: currentChatId === chat.id ? "white" : "#64748b",
                        "&:hover": {
                          backgroundColor:
                            currentChatId === chat.id
                              ? "rgba(255, 255, 255, 0.1)"
                              : "#f1f5f9",
                        },
                      }}
                    >
                      <MoreVertIcon fontSize="small" />
                    </IconButton>
                  </ListItemButton>
                </ListItem>
              ))}{" "}
          </List>
        )}{" "}
        {/* Action Menu */}
        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={handleMenuClose}
          onClick={handleMenuClose}
          PaperProps={{
            elevation: 0,
            sx: {
              overflow: "visible",
              filter: "drop-shadow(0px 2px 8px rgba(0,0,0,0.12))",
              background: "#ffffff",
              borderRadius: "8px",
              mt: 1.5,
              "& .MuiMenuItem-root": {
                borderRadius: "4px",
                mx: 0.5,
                my: 0.25,
              },
            },
          }}
          transformOrigin={{ horizontal: "right", vertical: "top" }}
          anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
        >
          <MenuItem onClick={handleEditTitle}>
            <ListItemIcon>
              <EditIcon fontSize="small" />
            </ListItemIcon>
            Rename
          </MenuItem>
          <MenuItem onClick={handleDelete} sx={{ color: "error.main" }}>
            <ListItemIcon>
              <DeleteIcon fontSize="small" sx={{ color: "error.main" }} />
            </ListItemIcon>
            Delete
          </MenuItem>
        </Menu>
      </Box>{" "}
      {/* Footer */}
      <Box
        sx={{
          p: 2,
          borderTop: "1px solid #e2e8f0",
          background: "#f8fafc",
        }}
      >
        <Typography
          variant="caption"
          sx={{
            color: "#64748b",
            fontWeight: 500,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 1,
          }}
        >
          💬 {chats.length} {chats.length !== 1 ? "chats" : "chat"}
        </Typography>
      </Box>
    </Box>
  );
};

ChatSidebar.propTypes = {
  chats: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
      title: PropTypes.string,
      updated_at: PropTypes.string.isRequired,
      message_count: PropTypes.number.isRequired,
    })
  ).isRequired,
  currentChatId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  onChatSelect: PropTypes.func.isRequired,
  onNewChat: PropTypes.func.isRequired,
  onDeleteChat: PropTypes.func,
  onEditChat: PropTypes.func,
  isLoading: PropTypes.bool,
};

ChatSidebar.defaultProps = {
  currentChatId: null,
  onDeleteChat: () => {},
  onEditChat: () => {},
  isLoading: false,
};

export default ChatSidebar;
