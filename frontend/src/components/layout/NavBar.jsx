import { useState, forwardRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import AppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import IconButton from "@mui/material/IconButton";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import Drawer from "@mui/material/Drawer";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import Box from "@mui/material/Box";
import Avatar from "@mui/material/Avatar";
import Tooltip from "@mui/material/Tooltip";
import Container from "@mui/material/Container";
import { useTheme } from "@mui/material/styles";
import useMediaQuery from "@mui/material/useMediaQuery";
import LinearProgress from "@mui/material/LinearProgress";
import Chip from "@mui/material/Chip";
import Badge from "@mui/material/Badge";
import { Link as RouterLink } from "react-router-dom";

// Icons - Updated with more appropriate medical/health icons
import MenuIcon from "@mui/icons-material/Menu";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import CloseIcon from "@mui/icons-material/Close";
import LogoutIcon from "@mui/icons-material/Logout";
import DashboardIcon from "@mui/icons-material/Dashboard";
import PersonIcon from "@mui/icons-material/Person";
import HomeIcon from "@mui/icons-material/Home";
import MedicalServicesIcon from "@mui/icons-material/MedicalServices";
import PsychologyIcon from "@mui/icons-material/Psychology";
import ArticleIcon from "@mui/icons-material/Article";
import LibraryBooksIcon from "@mui/icons-material/LibraryBooks";
import HelpIcon from "@mui/icons-material/Help";
import ForumIcon from "@mui/icons-material/Forum";
import InfoIcon from "@mui/icons-material/Info";
import ContactSupportIcon from "@mui/icons-material/ContactSupport";
import PersonAddIcon from "@mui/icons-material/PersonAdd";
import NotificationsIcon from "@mui/icons-material/Notifications";
import LoginIcon from "@mui/icons-material/Login";
import AdminPanelSettingsIcon from "@mui/icons-material/AdminPanelSettings";
import { useAuth } from "../../context/AuthContext";
import { DeepMedIcon } from "../ui/CustomIcons";
import NotificationBell from "../notifications/NotificationBell";

// Add LinkBehavior component before menuItems
const LinkBehavior = forwardRef((props, ref) => {
  const { href, ...other } = props;
  // Map href (MUI standard) -> to (react-router standard)
  return <RouterLink ref={ref} to={href} {...other} />;
});
LinkBehavior.displayName = "LinkBehavior";

function NavBar() {
  const navigate = useNavigate();
  const location = useLocation();
  // Destructure `loading` from useAuth
  const {
    isAuthenticated,
    isStaff,
    isSuperuser,
    logout: authLogout,
    user,
    loading,
  } = useAuth();

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  const [leftDrawerOpen, setLeftDrawerOpen] = useState(false);
  const [profileDrawerOpen, setProfileDrawerOpen] = useState(false);

  const handleLeftDrawerToggle = () => setLeftDrawerOpen(!leftDrawerOpen);
  const handleProfileDrawerToggle = () =>
    setProfileDrawerOpen(!profileDrawerOpen);

  const handleLogout = () => {
    authLogout();
    setProfileDrawerOpen(false);
    navigate("/");
  };

  // Filter menu items based on user status
  const getMenuItems = () => {
    const baseMenuItems = [
      { label: "Home", path: "/", icon: <HomeIcon /> },
      {
        label: "Diagnosis Tool",
        path: "/diagnosis",
        icon: <MedicalServicesIcon />,
      },
      {
        label: "AI Assistant",
        path: "/ai-assistant",
        icon: <PsychologyIcon />,
        featured: true,
      },
      {
        label: "Blogs",
        path: "/blogs",
        icon: <ArticleIcon />,
      },
      { label: "Research", path: "/research", icon: <LibraryBooksIcon /> },
      { label: "FAQ", path: "/faq", icon: <HelpIcon /> },
      { label: "Community Forum", path: "/community", icon: <ForumIcon /> },
      { label: "About Us", path: "/about", icon: <InfoIcon /> },
      { label: "Contact Us", path: "/contact", icon: <ContactSupportIcon /> },
    ];

    return baseMenuItems;
  };

  const menuItems = getMenuItems();

  // Enhanced listDrawerItems with smaller text and AI Assistant color
  const listDrawerItems = (items, onDrawerClose) => (
    <Box sx={{ width: 260 }} role="presentation">
      {/* Enhanced Header */}
      <Box
        sx={{
          p: 2,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          borderBottom: `1px solid ${theme.palette.divider}`,
          backgroundColor: theme.palette.background.paper,
        }}
      >
        <Typography
          variant="h6"
          sx={{
            fontWeight: 700,
            fontSize: "1rem", // Reduced from 1.25rem
            color: "#000000",
          }}
        >
          Menu
        </Typography>
        <IconButton
          onClick={onDrawerClose}
          size="small"
          sx={{
            color: "#2C3E50",
            "&:hover": {
              backgroundColor: "#ECFDF5",
            },
          }}
        >
          <CloseIcon />
        </IconButton>
      </Box>

      {/* Enhanced Navigation Items */}
      <List sx={{ py: 1 }}>
        {items.map((item) => (
          <ListItem
            key={item.label}
            disablePadding
            component={LinkBehavior}
            to={item.path}
            onClick={onDrawerClose}
          >
            <ListItemButton
              sx={{
                py: 1.2,
                px: 3,
                backgroundColor:
                  location.pathname === item.path ? "#ECFDF5" : "transparent",
                "&:hover": {
                  backgroundColor: "#ECFDF5",
                },
              }}
            >
              <ListItemIcon
                sx={{
                  color:
                    location.pathname === item.path ? "#10B981" : "#5D6D7E",
                  minWidth: "40px",
                  "& .MuiSvgIcon-root": {
                    fontSize: "1.2rem",
                  },
                }}
              >
                {item.icon}
              </ListItemIcon>
              <ListItemText
                primary={item.label}
                primaryTypographyProps={{
                  fontWeight: 600,
                  fontSize: "0.95rem",
                  color:
                    location.pathname === item.path ? "#10B981" : "#2C3E50",
                }}
              />
              {(item.label === "Diagnosis Tool" ||
                item.label === "AI Assistant") && (
                <Chip
                  label="New"
                  size="small"
                  sx={{
                    height: 18,
                    fontSize: "0.6rem",
                    backgroundColor: "#10B981",
                    color: "white",
                    fontWeight: 600,
                  }}
                />
              )}
            </ListItemButton>
          </ListItem>
        ))}

        {/* Enhanced Auth Buttons for Mobile */}
        {isMobile && !isAuthenticated && (
          <>
            <Box
              sx={{
                mx: 2,
                my: 2,
                borderTop: `1px solid ${theme.palette.divider}`,
                pt: 2,
              }}
            >
              <Button
                component={LinkBehavior}
                to="/signin"
                fullWidth
                onClick={onDrawerClose}
                startIcon={<LoginIcon />}
                sx={{
                  mb: 1,
                  backgroundColor: "transparent",
                  color: "#10B981",
                  border: "1px solid #10B981",
                  fontWeight: 600,
                  fontSize: "0.9rem",
                  py: 1.2,
                  textTransform: "none",
                  "&:hover": {
                    backgroundColor: "#ECFDF5",
                    borderColor: "#059669",
                  },
                }}
              >
                SignIn
              </Button>
              <Button
                component={LinkBehavior}
                to="/signup"
                fullWidth
                onClick={onDrawerClose}
                startIcon={<PersonAddIcon />}
                sx={{
                  backgroundColor: "#10B981",
                  color: "white",
                  fontWeight: 600,
                  fontSize: "0.9rem",
                  py: 1.2,
                  textTransform: "none",
                  boxShadow: "none",
                  "&:hover": {
                    backgroundColor: "#059669",
                  },
                }}
              >
                SignUp
              </Button>
            </Box>
          </>
        )}
      </List>
    </Box>
  );
  // Enhanced profileMenuItems with improved styling
  const profileMenuItems = [
    {
      label: "Profile",
      path: "/profile",
      icon: <PersonIcon />,
      action: () => navigate("/profile"),
    },
    {
      label: "My Health Dashboard",
      path: "/my-health-dashboard",
      icon: <DashboardIcon />,
      action: () => navigate("/my-health-dashboard"),
    },
    ...(isSuperuser || isStaff
      ? [
          {
            label: "Admin Console",
            path: "/admin",
            icon: <AdminPanelSettingsIcon />,
            action: () => navigate("/admin"),
          },
        ]
      : []),
    { label: "Logout", icon: <LogoutIcon />, action: handleLogout },
  ];

  return (
    <>
      {/* Enhanced AppBar */}
      <AppBar
        position="static"
        sx={{
          backgroundColor: "#FFFFFF",
          borderBottom: "1px solid #E8EAED",
          boxShadow: "none",
        }}
      >
        {" "}
        <Container maxWidth="xl">
          <Toolbar disableGutters sx={{ minHeight: { xs: 64, md: 72 } }}>
            {/* Left Menu Icon (All Devices) */}
            <IconButton
              size="large"
              edge="start"
              color="inherit"
              aria-label="open navigation drawer"
              sx={{
                mr: 1,
                color: "#2C3E50",
                borderRadius: "8px",
                "&:hover": {
                  backgroundColor: "#ECFDF5",
                  transform: "scale(1.05)",
                },
                transition: "all 0.2s ease",
              }}
              onClick={handleLeftDrawerToggle}
            >
              <MenuIcon sx={{ fontSize: "1.8rem" }} />
            </IconButton>
            {/* Enhanced Logo and Brand Name */}
            <Button
              component={LinkBehavior}
              to="/"
              sx={{
                color: "#000000",
                textDecoration: "none",
                display: "flex",
                alignItems: "center",
                padding: { xs: "8px 12px", sm: "8px 16px" },
                minWidth: "auto",
                borderRadius: "16px",
                "&:hover": {
                  backgroundColor: "rgba(37, 99, 235, 0.08)",
                  transform: "scale(1.02)",
                },
                transition: "all 0.3s ease",
              }}
            >
              <DeepMedIcon />
            </Button>{" "}
            {/* Enhanced Desktop Navigation Links */}
            <Box
              sx={{
                flexGrow: 1,
                display: { xs: "none", md: "flex" },
                justifyContent: "center",
                alignItems: "center",
                gap: 0.5,
              }}
            >
              {" "}
              {menuItems.slice(0, 5).map((item) => (
                <Box key={item.label} sx={{ position: "relative" }}>
                  <Button
                    component={LinkBehavior}
                    to={item.path}
                    sx={{
                      color:
                        location.pathname === item.path ? "#10B981" : "#5D6D7E",
                      mx: 0.5,
                      px: 2,
                      py: 1,
                      borderRadius: "8px",
                      fontWeight: 600,
                      fontSize: "0.9rem",
                      position: "relative",
                      backgroundColor:
                        location.pathname === item.path
                          ? "#ECFDF5"
                          : "transparent",
                      "&:hover": {
                        backgroundColor: "#ECFDF5",
                        color: "#10B981",
                        transform: "translateY(-2px)",
                        "& .nav-underline": {
                          width: "100%",
                        },
                      },
                      transition: "all 0.2s ease",
                    }}
                  >
                    {item.label}
                    {item.featured && (
                      <Chip
                        label="New"
                        size="small"
                        sx={{
                          position: "absolute",
                          top: -8,
                          right: -8,
                          height: 16,
                          fontSize: "0.55rem",
                          backgroundColor: "#10B981",
                          color: "white",
                          fontWeight: 600,
                        }}
                      />
                    )}{" "}
                    <Box
                      className="nav-underline"
                      sx={{
                        position: "absolute",
                        bottom: 0,
                        left: "50%",
                        transform: "translateX(-50%)",
                        width: location.pathname === item.path ? "100%" : 0,
                        height: 2,
                        backgroundColor: "#10B981",
                        borderRadius: 1,
                        transition: "width 0.2s ease",
                      }}
                    />
                  </Button>
                </Box>
              ))}
            </Box>
            <Box sx={{ flexGrow: { xs: 1, md: 0 } }} />{" "}
            {/* Enhanced Right Side: Auth Buttons or User Icons */}
            {isAuthenticated ? (
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                {/* Notifications */}
                <NotificationBell />

                {/* User Profile Section with Name/Email */}
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  {/* User Name/Email Display - Hidden on extra small screens */}
                  <Box sx={{ display: { xs: "none", sm: "block" } }}>
                    <Typography
                      variant="body2"
                      sx={{
                        color: "#000000",
                        fontWeight: 600,
                        fontSize: "0.875rem",
                        maxWidth: "150px",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {user?.full_name ||
                        user?.email ||
                        user?.username ||
                        "User"}
                    </Typography>
                    {user?.full_name && user?.email && (
                      <Typography
                        variant="caption"
                        sx={{
                          color: "#666666",
                          fontSize: "0.75rem",
                          maxWidth: "150px",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                          display: "block",
                        }}
                      >
                        {user.email}
                      </Typography>
                    )}
                  </Box>
                  {/* User Avatar */}{" "}
                  <Tooltip title="Open user settings">
                    <IconButton
                      onClick={handleProfileDrawerToggle}
                      sx={{
                        p: 0.5,
                        borderRadius: "14px",
                        "&:hover": {
                          transform: "scale(1.05)",
                        },
                        transition: "all 0.2s ease",
                      }}
                    >
                      <Avatar
                        sx={{
                          backgroundColor: "#10B981",
                          width: { xs: 40, sm: 46 },
                          height: { xs: 40, sm: 46 },
                          color: "white",
                          fontWeight: 600,
                          fontSize: "1.2rem",
                          boxShadow: "0 2px 8px rgba(16, 185, 129, 0.2)",
                        }}
                        alt={user?.full_name || user?.email || "User"}
                        src={user?.profile_picture || undefined}
                      >
                        {user?.full_name ? (
                          user.full_name.charAt(0).toUpperCase()
                        ) : user?.email ? (
                          user.email.charAt(0).toUpperCase()
                        ) : (
                          <AccountCircleIcon sx={{ fontSize: "1.5rem" }} />
                        )}
                      </Avatar>
                    </IconButton>
                  </Tooltip>
                </Box>
              </Box>
            ) : (
              <Box
                sx={{
                  display: { xs: "none", md: "flex" },
                  alignItems: "center",
                  gap: 1.5,
                }}
              >
                {/* Enhanced Login Button */}
                <Button
                  component={LinkBehavior}
                  to="/signin"
                  startIcon={<LoginIcon />}
                  sx={{
                    color: "#10B981",
                    backgroundColor: "transparent",
                    border: "1px solid #10B981",
                    borderRadius: "8px",
                    px: 3,
                    py: 1,
                    fontWeight: 600,
                    fontSize: "0.9rem",
                    textTransform: "none",
                    "&:hover": {
                      backgroundColor: "#ECFDF5",
                      borderColor: "#059669",
                      color: "#059669",
                    },
                    transition: "all 0.2s ease",
                  }}
                >
                  Sign In
                </Button>

                {/* Enhanced Register Button */}
                <Button
                  component={LinkBehavior}
                  to="/signup"
                  startIcon={<PersonAddIcon />}
                  sx={{
                    color: "white",
                    backgroundColor: "#10B981",
                    borderRadius: "8px",
                    px: 3,
                    py: 1,
                    fontWeight: 600,
                    fontSize: "0.9rem",
                    textTransform: "none",
                    boxShadow: "none",
                    "&:hover": {
                      backgroundColor: "#059669",
                      boxShadow: "0 2px 8px rgba(16, 185, 129, 0.2)",
                    },
                    transition: "all 0.2s ease",
                  }}
                >
                  Sign Up
                </Button>
              </Box>
            )}
          </Toolbar>
        </Container>
      </AppBar>
      {/* Enhanced Loading Bar */}
      {loading && (
        <LinearProgress
          sx={{
            height: "3px",
            position: "absolute",
            width: "100%",
            top: 0,
            zIndex: 1200,
            background: "#ECFDF5",
            "& .MuiLinearProgress-bar": {
              backgroundColor: "#10B981",
            },
          }}
        />
      )}
      {/* Left Drawer */}
      <Drawer
        anchor="left"
        open={leftDrawerOpen}
        onClose={handleLeftDrawerToggle}
        PaperProps={{
          sx: {
            backgroundColor: theme.palette.background.paper,
            boxShadow: "0 4px 20px rgba(0, 0, 0, 0.08)",
            border: "none",
          },
        }}
        ModalProps={{
          BackdropProps: {
            sx: {
              backgroundColor: "rgba(0, 0, 0, 0.2)",
            },
          },
        }}
      >
        {listDrawerItems(menuItems, handleLeftDrawerToggle)}
      </Drawer>{" "}
      {/* Enhanced Profile Drawer (opens from right for all devices) */}
      {isAuthenticated && (
        <Drawer
          anchor="right"
          open={profileDrawerOpen}
          onClose={handleProfileDrawerToggle}
          PaperProps={{
            sx: {
              width: 280,
              backgroundColor: theme.palette.background.paper,
              boxShadow: "0 4px 20px rgba(0, 0, 0, 0.08)",
              border: "none",
            },
          }}
          ModalProps={{
            BackdropProps: {
              sx: {
                backgroundColor: "rgba(0, 0, 0, 0.2)",
              },
            },
          }}
        >
          <Box role="presentation">
            {/* Enhanced Profile Header */}
            <Box
              sx={{
                p: 3,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                borderBottom: `1px solid ${theme.palette.divider}`,
                backgroundColor: theme.palette.background.paper,
              }}
            >
              <IconButton
                onClick={handleProfileDrawerToggle}
                sx={{
                  position: "absolute",
                  top: 16,
                  right: 16,
                  color: "#2C3E50",
                  "&:hover": {
                    backgroundColor: "#ECFDF5",
                  },
                }}
              >
                <CloseIcon />
              </IconButton>
              <Avatar
                sx={{
                  width: 72,
                  height: 72,
                  mb: 2,
                  backgroundColor: "#10B981",
                  color: "white",
                  fontWeight: 600,
                  fontSize: "1.8rem",
                }}
                alt={user?.full_name || user?.email || "User"}
                src={user?.profile_picture || undefined}
              >
                {user?.full_name ? (
                  user.full_name.charAt(0).toUpperCase()
                ) : user?.email ? (
                  user.email.charAt(0).toUpperCase()
                ) : (
                  <AccountCircleIcon sx={{ fontSize: "2rem" }} />
                )}
              </Avatar>
              <Typography
                variant="subtitle1"
                sx={{
                  fontWeight: 700,
                  mb: 0.5,
                  fontSize: "1rem",
                  color: "#000000",
                  textAlign: "center",
                }}
              >
                {user?.full_name || user?.email || "Welcome User"}
              </Typography>{" "}
              <Typography
                variant="body2"
                sx={{
                  color: "#666666",
                  fontWeight: 500,
                  fontSize: "0.85rem",
                  textAlign: "center",
                }}
              >
                {user?.email || "user@example.com"}
              </Typography>
              {/* Hierarchical role display: Super > Staff > User */}
              {isSuperuser ? (
                <Chip
                  label="Super Admin"
                  size="small"
                  sx={{
                    mt: 1,
                    backgroundColor: "#059669",
                    color: "white",
                    fontWeight: 600,
                    fontSize: "0.7rem",
                  }}
                />
              ) : isStaff ? (
                <Chip
                  label="Staff"
                  size="small"
                  sx={{
                    mt: 1,
                    backgroundColor: "#10B981",
                    color: "white",
                    fontWeight: 600,
                    fontSize: "0.7rem",
                  }}
                />
              ) : (
                <Chip
                  label="User"
                  size="small"
                  sx={{
                    mt: 1,
                    backgroundColor: "#34D399",
                    color: "white",
                    fontWeight: 600,
                    fontSize: "0.7rem",
                  }}
                />
              )}
            </Box>

            {/* Enhanced Profile Menu Items */}
            <List sx={{ py: 1 }}>
              {profileMenuItems.map((item) => (
                <ListItem
                  key={item.label}
                  disablePadding
                  onClick={() => {
                    item.action();
                    handleProfileDrawerToggle();
                  }}
                >
                  <ListItemButton
                    sx={{
                      py: 1.5,
                      px: 3,
                      "&:hover": {
                        backgroundColor:
                          item.label === "Logout"
                            ? "rgba(239, 68, 68, 0.08)"
                            : "#ECFDF5",
                      },
                    }}
                  >
                    <ListItemIcon
                      sx={{
                        color: item.label === "Logout" ? "#EF4444" : "#10B981",
                        minWidth: "44px",
                        "& .MuiSvgIcon-root": {
                          fontSize: "1.4rem",
                        },
                      }}
                    >
                      {item.icon}
                    </ListItemIcon>
                    <ListItemText
                      primary={item.label}
                      primaryTypographyProps={{
                        fontWeight: 600,
                        fontSize: "0.95rem",
                        color: item.label === "Logout" ? "#EF4444" : "#2C3E50",
                      }}
                    />{" "}
                    {item.label === "Admin Console" && (
                      <Chip
                        label={isSuperuser ? "Super" : "Admin"}
                        size="small"
                        sx={{
                          height: 18,
                          fontSize: "0.6rem",
                          backgroundColor: isSuperuser ? "#059669" : "#10B981",
                          color: "white",
                          fontWeight: 600,
                        }}
                      />
                    )}
                  </ListItemButton>
                </ListItem>
              ))}
            </List>
          </Box>
        </Drawer>
      )}{" "}
    </>
  );
}

export default NavBar;
