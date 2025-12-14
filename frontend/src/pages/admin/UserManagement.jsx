import { useState, useEffect } from "react";
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Alert,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  CircularProgress,
  TextField,
  InputAdornment,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Container,
  Pagination,
} from "@mui/material";
import {
  Search,
  Refresh,
  ArrowUpward,
  ArrowDownward,
  CheckCircle,
  Block,
} from "@mui/icons-material";
import api from "../../services/api";
import AdminNavbar from "../../components/admin/AdminNavbar";

function UserManagement() {
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("info");
  const [page, setPage] = useState(1);
  const [confirmDialog, setConfirmDialog] = useState({
    open: false,
    title: "",
    message: "",
    action: null,
  });

  const rowsPerPage = 10;

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    filterUsers();
  }, [searchTerm, users]);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const response = await api.get("/users");

      if (Array.isArray(response.data)) {
        setUsers(response.data);
        setMessage("");
      }
    } catch (error) {
      console.error("Error fetching users:", error);
      setMessage("Error fetching user data. Please try again.");
      setMessageType("error");
    } finally {
      setLoading(false);
    }
  };

  const filterUsers = () => {
    let filtered = users.filter((user) => {
      const matchesSearch =
        user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.username?.toLowerCase().includes(searchTerm.toLowerCase());
      return matchesSearch;
    });

    setFilteredUsers(filtered);
    setPage(1);
  };

  const handlePromoteDemote = (user, action) => {
    let title = "";
    let message = "";
    let endpoint = "";

    switch (action) {
      case "promote_to_staff":
        title = "Promote to Staff";
        message = `Promote ${user.email} to staff member?`;
        endpoint = `/users/${user.id}/promote-to-staff`;
        break;
      case "demote_from_staff":
        title = "Demote from Staff";
        message = `Remove staff privileges from ${user.email}?`;
        endpoint = `/users/${user.id}/demote-from-staff`;
        break;
      case "activate":
        title = "Activate User";
        message = `Activate account for ${user.email}?`;
        endpoint = `/users/${user.id}/activate`;
        break;
      case "deactivate":
        title = "Deactivate User";
        message = `Deactivate account for ${user.email}? User will not be able to log in.`;
        endpoint = `/users/${user.id}/deactivate`;
        break;
      default:
        return;
    }

    setConfirmDialog({
      open: true,
      title,
      message,
      action: () => confirmPromoteDemote(endpoint),
    });
  };

  const confirmPromoteDemote = async (endpoint) => {
    try {
      const response = await api.post(endpoint);

      if (response.data.message) {
        setMessage(response.data.message);
        setMessageType("success");
        fetchUsers();
      }
    } catch (error) {
      console.error("Error updating user:", error);
      setMessage(
        error.response?.data?.detail || "Error updating user permissions"
      );
      setMessageType("error");
    } finally {
      setConfirmDialog({ open: false, title: "", message: "", action: null });
    }
  };

  const handlePageChange = (event, value) => {
    setPage(value);
  };

  const paginatedUsers = filteredUsers.slice(
    (page - 1) * rowsPerPage,
    page * rowsPerPage
  );

  const totalPages = Math.ceil(filteredUsers.length / rowsPerPage);

  if (loading) {
    return (
      <Box
        sx={{
          minHeight: "100vh",
          backgroundColor: "#F8F9FA",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <CircularProgress sx={{ color: "#10B981" }} />
      </Box>
    );
  }

  return (
    <Box sx={{ minHeight: "100vh", backgroundColor: "#F8F9FA" }}>
      <AdminNavbar />

      <Container maxWidth="xl" sx={{ py: 6 }}>
        {/* Header */}
        <Box sx={{ mb: 5 }}>
          <Typography
            variant="h3"
            sx={{ fontWeight: 600, color: "#2C3E50", mb: 1 }}
          >
            User Management
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
            Manage user accounts and permissions
          </Typography>

          <Box sx={{ display: "flex", gap: 2, alignItems: "center" }}>
            <TextField
              placeholder="Search users..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              size="small"
              sx={{ flexGrow: 1, maxWidth: 400 }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Search />
                  </InputAdornment>
                ),
              }}
            />
            <Button
              variant="contained"
              startIcon={<Refresh />}
              onClick={fetchUsers}
              disabled={loading}
              sx={{
                backgroundColor: "#10B981",
                "&:hover": {
                  backgroundColor: "#059669",
                },
              }}
            >
              Refresh
            </Button>
          </Box>
        </Box>

        {/* Messages */}
        {message && (
          <Alert
            severity={messageType}
            sx={{ mb: 4, borderRadius: 2 }}
            onClose={() => setMessage("")}
          >
            {message}
          </Alert>
        )}

        {/* Users Table */}
        <Card
          sx={{
            borderRadius: 2,
            border: "1px solid #E8EAED",
            boxShadow: "none",
          }}
        >
          <CardContent sx={{ p: 0 }}>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow sx={{ backgroundColor: "#F8F9FA" }}>
                    <TableCell sx={{ fontWeight: 600 }}>Email</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Full Name</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Status</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Role</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {paginatedUsers.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} align="center" sx={{ py: 4 }}>
                        <Typography color="text.secondary">
                          No users found
                        </Typography>
                      </TableCell>
                    </TableRow>
                  ) : (
                    paginatedUsers.map((user) => (
                      <TableRow key={user.id} hover>
                        <TableCell>{user.email}</TableCell>
                        <TableCell>{user.full_name || "-"}</TableCell>
                        <TableCell>
                          <Chip
                            label={user.is_active ? "Active" : "Inactive"}
                            size="small"
                            sx={{
                              backgroundColor: user.is_active
                                ? "#ECFDF5"
                                : "#F3F4F6",
                              color: user.is_active ? "#10B981" : "#6B7280",
                              fontWeight: 500,
                            }}
                          />
                        </TableCell>
                        <TableCell>
                          <Box sx={{ display: "flex", gap: 0.5 }}>
                            {user.is_superuser && (
                              <Chip
                                label="Superuser"
                                size="small"
                                sx={{
                                  backgroundColor: "#FEF3C7",
                                  color: "#92400E",
                                  fontWeight: 500,
                                }}
                              />
                            )}
                            {user.is_staff && !user.is_superuser && (
                              <Chip
                                label="Staff"
                                size="small"
                                sx={{
                                  backgroundColor: "#DBEAFE",
                                  color: "#1E40AF",
                                  fontWeight: 500,
                                }}
                              />
                            )}
                            {!user.is_staff && !user.is_superuser && (
                              <Chip
                                label="User"
                                size="small"
                                sx={{
                                  backgroundColor: "#F3F4F6",
                                  color: "#6B7280",
                                  fontWeight: 500,
                                }}
                              />
                            )}
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Box
                            sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}
                          >
                            {/* Activate/Deactivate Controls */}
                            {!user.is_active ? (
                              <Button
                                size="small"
                                startIcon={<CheckCircle />}
                                onClick={() =>
                                  handlePromoteDemote(user, "activate")
                                }
                                sx={{
                                  color: "#10B981",
                                  "&:hover": {
                                    backgroundColor: "#ECFDF5",
                                  },
                                }}
                              >
                                Activate
                              </Button>
                            ) : (
                              !user.is_superuser && (
                                <Button
                                  size="small"
                                  startIcon={<Block />}
                                  onClick={() =>
                                    handlePromoteDemote(user, "deactivate")
                                  }
                                  sx={{
                                    color: "#EF4444",
                                    "&:hover": {
                                      backgroundColor: "#FEE2E2",
                                    },
                                  }}
                                >
                                  Deactivate
                                </Button>
                              )
                            )}

                            {/* Staff Promotion/Demotion Controls - Only for active users */}
                            {!user.is_staff &&
                              !user.is_superuser &&
                              user.is_active && (
                                <Button
                                  size="small"
                                  startIcon={<ArrowUpward />}
                                  onClick={() =>
                                    handlePromoteDemote(
                                      user,
                                      "promote_to_staff"
                                    )
                                  }
                                  sx={{
                                    color: "#10B981",
                                    "&:hover": {
                                      backgroundColor: "#ECFDF5",
                                    },
                                  }}
                                >
                                  Promote to Staff
                                </Button>
                              )}
                            {user.is_staff && !user.is_superuser && (
                              <Button
                                size="small"
                                startIcon={<ArrowDownward />}
                                onClick={() =>
                                  handlePromoteDemote(user, "demote_from_staff")
                                }
                                sx={{
                                  color: "#EF4444",
                                  "&:hover": {
                                    backgroundColor: "#FEE2E2",
                                  },
                                }}
                              >
                                Demote from Staff
                              </Button>
                            )}
                            {user.is_superuser && (
                              <Typography
                                variant="body2"
                                color="text.secondary"
                                sx={{ fontStyle: "italic" }}
                              >
                                Superuser account
                              </Typography>
                            )}
                          </Box>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </CardContent>
        </Card>

        {/* Pagination */}
        {totalPages > 1 && (
          <Box sx={{ display: "flex", justifyContent: "center", mt: 4 }}>
            <Pagination
              count={totalPages}
              page={page}
              onChange={handlePageChange}
              color="primary"
              sx={{
                "& .MuiPaginationItem-root": {
                  color: "#5D6D7E",
                  "&.Mui-selected": {
                    backgroundColor: "#10B981",
                    color: "white",
                    "&:hover": {
                      backgroundColor: "#059669",
                    },
                  },
                  "&:hover": {
                    backgroundColor: "#ECFDF5",
                  },
                },
              }}
            />
          </Box>
        )}
      </Container>

      {/* Confirmation Dialog */}
      <Dialog
        open={confirmDialog.open}
        onClose={() =>
          setConfirmDialog({
            open: false,
            title: "",
            message: "",
            action: null,
          })
        }
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle sx={{ fontWeight: 600 }}>
          {confirmDialog.title}
        </DialogTitle>
        <DialogContent>
          <Typography>{confirmDialog.message}</Typography>
        </DialogContent>
        <DialogActions sx={{ p: 2, gap: 1 }}>
          <Button
            onClick={() =>
              setConfirmDialog({
                open: false,
                title: "",
                message: "",
                action: null,
              })
            }
            sx={{ color: "#6B7280" }}
          >
            Cancel
          </Button>
          <Button
            onClick={confirmDialog.action}
            variant="contained"
            sx={{
              backgroundColor: "#10B981",
              "&:hover": {
                backgroundColor: "#059669",
              },
            }}
          >
            Confirm
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default UserManagement;
