import { useState, useEffect } from "react";
import {
  IconButton,
  Badge,
  Menu,
  MenuItem,
  Typography,
  Box,
  Divider,
  Button,
  ListItemText,
  ListItemIcon,
  Chip,
  CircularProgress,
} from "@mui/material";
import NotificationsIcon from "@mui/icons-material/Notifications";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import ErrorIcon from "@mui/icons-material/Error";
import InfoIcon from "@mui/icons-material/Info";
import DeleteIcon from "@mui/icons-material/Delete";
import DoneAllIcon from "@mui/icons-material/DoneAll";
import { useNavigate } from "react-router-dom";
import { notificationAPI } from "../../services/notificationAPI";
import logger from "../../utils/logger";

function NotificationBell() {
  const navigate = useNavigate();
  const [anchorEl, setAnchorEl] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);

  const open = Boolean(anchorEl);

  // Fetch unread count on mount and periodically
  useEffect(() => {
    fetchUnreadCount();
    const interval = setInterval(fetchUnreadCount, 30000); // Every 30 seconds
    return () => clearInterval(interval);
  }, []);

  const fetchUnreadCount = async () => {
    try {
      const data = await notificationAPI.getUnreadCount();
      setUnreadCount(data.unread_count);
    } catch (error) {
      logger.error("Failed to fetch unread count:", error);
    }
  };

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      // Fetch all notifications (both read and unread)
      const data = await notificationAPI.getNotifications({ 
        limit: 50,
        skip: 0
      });
      console.log("Fetched notifications:", data);
      console.log("Notifications count:", data?.length);
      setNotifications(Array.isArray(data) ? data : []);
    } catch (error) {
      logger.error("Failed to fetch notifications:", error);
      console.error("Notification fetch error:", error);
      // Set empty array on error
      setNotifications([]);
    } finally {
      setLoading(false);
    }
  };

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
    fetchNotifications();
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleNotificationClick = async (notification) => {
    try {
      // Mark as read
      if (!notification.is_read) {
        await notificationAPI.markAsRead(notification.id);
        setUnreadCount((prev) => Math.max(0, prev - 1));
        setNotifications((prev) =>
          prev.map((n) =>
            n.id === notification.id ? { ...n, is_read: true } : n
          )
        );
      }

      // Navigate to link if available
      if (notification.link) {
        handleClose();
        // Extract path from full URL if present, or use as-is if it's already a path
        const path = notification.link.includes('http') 
          ? new URL(notification.link).pathname 
          : notification.link;
        navigate(path);
      }
    } catch (error) {
      logger.error("Failed to handle notification click:", error);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await notificationAPI.markAllAsRead();
      setUnreadCount(0);
      setNotifications((prev) =>
        prev.map((n) => ({ ...n, is_read: true }))
      );
    } catch (error) {
      logger.error("Failed to mark all as read:", error);
    }
  };

  const handleDelete = async (notificationId, event) => {
    event.stopPropagation();
    try {
      await notificationAPI.deleteNotification(notificationId);
      setNotifications((prev) => prev.filter((n) => n.id !== notificationId));
      fetchUnreadCount();
    } catch (error) {
      logger.error("Failed to delete notification:", error);
    }
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case "diagnosis_completed":
        return <CheckCircleIcon sx={{ color: "success.main" }} />;
      case "diagnosis_failed":
        return <ErrorIcon sx={{ color: "error.main" }} />;
      default:
        return <InfoIcon sx={{ color: "info.main" }} />;
    }
  };

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  return (
    <>
      <IconButton
        onClick={handleClick}
        aria-label="notifications"
        sx={{
          color: "#2C3E50",
          borderRadius: "8px",
          "&:hover": {
            backgroundColor: "#ECFDF5",
            transform: "scale(1.05)",
          },
          transition: "all 0.2s ease",
        }}
      >
        <Badge 
          badgeContent={unreadCount} 
          color="error"
          sx={{
            "& .MuiBadge-badge": {
              backgroundColor: "#EF4444",
              color: "white",
              fontWeight: 600,
              fontSize: "0.75rem",
            },
          }}
        >
          <NotificationsIcon sx={{ fontSize: "1.5rem" }} />
        </Badge>
      </IconButton>

      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        slotProps={{
          paper: {
            sx: {
              width: 420,
              maxHeight: 600,
              borderRadius: 2,
              boxShadow: "0 8px 32px rgba(0, 0, 0, 0.12)",
              mt: 1,
            },
          },
        }}
        transformOrigin={{ horizontal: "right", vertical: "top" }}
        anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
      >
        {/* Header */}
        <Box 
          sx={{ 
            px: 3, 
            py: 2, 
            display: "flex", 
            justifyContent: "space-between", 
            alignItems: "center",
            borderBottom: "1px solid #E5E7EB",
            backgroundColor: "#F9FAFB",
          }}
        >
          <Typography variant="h6" sx={{ fontWeight: 700, fontSize: "1.1rem", color: "#111827" }}>
            Notifications
          </Typography>
          {unreadCount > 0 && (
            <Button
              size="small"
              startIcon={<DoneAllIcon />}
              onClick={handleMarkAllRead}
              sx={{
                textTransform: "none",
                fontSize: "0.85rem",
                fontWeight: 600,
                color: "#10B981",
                "&:hover": {
                  backgroundColor: "#ECFDF5",
                },
              }}
            >
              Mark all read
            </Button>
          )}
        </Box>

        {loading ? (
          <Box 
            sx={{ 
              p: 6, 
              textAlign: "center", 
              display: "flex", 
              flexDirection: "column", 
              alignItems: "center", 
              gap: 2 
            }}
          >
            <CircularProgress size={32} sx={{ color: "#10B981" }} />
            <Typography variant="body2" sx={{ color: "#6B7280", fontWeight: 500 }}>
              Loading notifications...
            </Typography>
          </Box>
        ) : !Array.isArray(notifications) || notifications.length === 0 ? (
          <Box sx={{ p: 6, textAlign: "center" }}>
            <NotificationsIcon sx={{ fontSize: 48, color: "#D1D5DB", mb: 2 }} />
            <Typography variant="body1" sx={{ color: "#6B7280", fontWeight: 600, mb: 0.5 }}>
              No notifications yet
            </Typography>
            <Typography variant="body2" sx={{ color: "#9CA3AF", fontSize: "0.875rem" }}>
              We&apos;ll notify you when something important happens
            </Typography>
          </Box>
        ) : (
          <Box sx={{ maxHeight: 480, overflow: "auto" }}>
            {notifications.map((notification, index) => (
              <Box key={notification.id}>
                <MenuItem
                  onClick={() => handleNotificationClick(notification)}
                  sx={{
                    py: 2,
                    px: 3,
                    backgroundColor: notification.is_read
                      ? "transparent"
                      : "#F0F9FF",
                    borderLeft: notification.is_read
                      ? "none"
                      : "3px solid #10B981",
                    "&:hover": {
                      backgroundColor: notification.is_read
                        ? "#F9FAFB"
                        : "#E0F2FE",
                    },
                    transition: "all 0.2s ease",
                  }}
                >
                  {/* Icon */}
                  <ListItemIcon sx={{ minWidth: 48, alignSelf: "flex-start", mt: 0.5 }}>
                    <Box
                      sx={{
                        width: 40,
                        height: 40,
                        borderRadius: "50%",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        backgroundColor:
                          notification.type === "diagnosis_completed"
                            ? "#ECFDF5"
                            : notification.type === "diagnosis_failed"
                            ? "#FEF2F2"
                            : "#EFF6FF",
                      }}
                    >
                      {getNotificationIcon(notification.type)}
                    </Box>
                  </ListItemIcon>

                  {/* Content */}
                  <ListItemText
                    sx={{ my: 0 }}
                    primary={
                      <Box sx={{ display: "flex", alignItems: "flex-start", gap: 1, mb: 0.5 }}>
                        <Typography
                          variant="body2"
                          sx={{
                            fontWeight: notification.is_read ? 500 : 700,
                            flex: 1,
                            fontSize: "0.95rem",
                            color: "#111827",
                            lineHeight: 1.4,
                          }}
                        >
                          {notification.title}
                        </Typography>
                        {!notification.is_read && (
                          <Box
                            sx={{
                              width: 8,
                              height: 8,
                              borderRadius: "50%",
                              backgroundColor: "#10B981",
                              flexShrink: 0,
                              mt: 0.5,
                            }}
                          />
                        )}
                      </Box>
                    }
                    secondary={
                      <Box>
                        <Typography
                          variant="body2"
                          sx={{
                            color: "#6B7280",
                            fontSize: "0.875rem",
                            lineHeight: 1.5,
                            mb: 0.5,
                          }}
                        >
                          {notification.message}
                        </Typography>
                        <Typography
                          variant="caption"
                          sx={{
                            color: "#9CA3AF",
                            fontSize: "0.75rem",
                            fontWeight: 500,
                          }}
                        >
                          {formatTime(notification.created_at)}
                        </Typography>
                      </Box>
                    }
                  />

                  {/* Delete Button */}
                  <IconButton
                    size="small"
                    onClick={(e) => handleDelete(notification.id, e)}
                    sx={{
                      ml: 1,
                      alignSelf: "flex-start",
                      color: "#9CA3AF",
                      "&:hover": {
                        color: "#EF4444",
                        backgroundColor: "#FEF2F2",
                      },
                    }}
                  >
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                </MenuItem>
                {index < notifications.length - 1 && (
                  <Divider sx={{ mx: 3 }} />
                )}
              </Box>
            ))}
          </Box>
        )}
      </Menu>
    </>
  );
}

export default NotificationBell;
