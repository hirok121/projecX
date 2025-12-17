import React, { useState, useEffect } from "react";
import {
  Box,
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  CardMedia,
  CardActions,
  Button,
  IconButton,
  Chip,
  TextField,
  InputAdornment,
  Stack,
  Pagination,
  CircularProgress,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material";
import {
  Add as AddIcon,
  Search as SearchIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  CalendarToday,
  Person,
  Visibility as VisibilityIcon,
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import { blogAPI } from "../../services/blogAPI";
import ReactMarkdown from "react-markdown";
import NavBar from "../../components/layout/NavBar";

const AdminBlogManagement = () => {
  const navigate = useNavigate();
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [blogToDelete, setBlogToDelete] = useState(null);
  const blogsPerPage = 9;

  useEffect(() => {
    fetchBlogs();
  }, [currentPage, searchQuery]);

  const fetchBlogs = async () => {
    try {
      setLoading(true);
      const params = {
        limit: blogsPerPage,
        offset: (currentPage - 1) * blogsPerPage,
      };
      if (searchQuery) params.q = searchQuery;

      const data = await blogAPI.list(params);
      setBlogs(data);
      // Calculate total pages from returned data length
      // If you get total_count from backend, use: Math.ceil(total_count / blogsPerPage)
      setTotalPages(Math.max(1, Math.ceil(data.length / blogsPerPage)));
      setError(null);
    } catch (err) {
      console.error("Error fetching blogs:", err);
      setError("Failed to load blogs. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleSearchChange = (event) => {
    setSearchQuery(event.target.value);
    setCurrentPage(1);
  };

  const handlePageChange = (event, value) => {
    setCurrentPage(value);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleCreateBlog = () => {
    navigate("/blogs/create");
  };

  const handleEditBlog = (blogId) => {
    navigate(`/blogs/${blogId}/edit`);
  };

  const handleViewBlog = (slug) => {
    navigate(`/blogs/${slug}`);
  };

  const handleDeleteClick = (blog) => {
    setBlogToDelete(blog);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!blogToDelete) return;

    try {
      await blogAPI.delete(blogToDelete.id);
      setBlogs(blogs.filter((blog) => blog.id !== blogToDelete.id));
      setDeleteDialogOpen(false);
      setBlogToDelete(null);
    } catch (err) {
      console.error("Error deleting blog:", err);
      setError("Failed to delete blog. Please try again.");
      setDeleteDialogOpen(false);
    }
  };

  const handleDeleteCancel = () => {
    setDeleteDialogOpen(false);
    setBlogToDelete(null);
  };

  return (
    <>
      <NavBar />
      <Container maxWidth="xl" sx={{ mt: 4, mb: 8 }}>
        {/* Header */}
        <Box
          sx={{
            mb: 4,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Typography
            variant="h4"
            sx={{
              fontWeight: 700,
              color: "#1F2937",
            }}
          >
            Blog Management
          </Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleCreateBlog}
            sx={{
              bgcolor: "#10B981",
              color: "white",
              fontWeight: 600,
              px: 3,
              py: 1,
              borderRadius: 2,
              boxShadow: "0 4px 12px rgba(16, 185, 129, 0.3)",
              "&:hover": {
                bgcolor: "#059669",
                boxShadow: "0 6px 16px rgba(16, 185, 129, 0.4)",
              },
            }}
          >
            Create New Blog
          </Button>
        </Box>

        {/* Search Bar */}
        <Box sx={{ mb: 4 }}>
          <TextField
            fullWidth
            placeholder="Search blogs by title, content, or tags..."
            value={searchQuery}
            onChange={handleSearchChange}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon sx={{ color: "#10B981" }} />
                </InputAdornment>
              ),
            }}
            sx={{
              "& .MuiOutlinedInput-root": {
                borderRadius: 3,
                bgcolor: "white",
                "&:hover fieldset": {
                  borderColor: "#10B981",
                },
                "&.Mui-focused fieldset": {
                  borderColor: "#10B981",
                  borderWidth: 2,
                },
              },
            }}
          />
        </Box>

        {/* Error Message */}
        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        {/* Loading State */}
        {loading ? (
          <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
            <CircularProgress sx={{ color: "#10B981" }} size={60} />
          </Box>
        ) : blogs.length === 0 ? (
          <Box
            sx={{
              textAlign: "center",
              py: 8,
              bgcolor: "#F9FAFB",
              borderRadius: 3,
            }}
          >
            <Typography variant="h6" color="text.secondary">
              {searchQuery
                ? "No blogs found matching your search"
                : "No blogs available"}
            </Typography>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={handleCreateBlog}
              sx={{
                mt: 3,
                bgcolor: "#10B981",
                "&:hover": { bgcolor: "#059669" },
              }}
            >
              Create First Blog
            </Button>
          </Box>
        ) : (
          <>
            {/* Blog Grid */}
            <Box
              sx={{
                display: "flex",
                flexWrap: "wrap",
                gap: 3, // same as Grid spacing={3}
              }}
            >
              {blogs.map((blog) => (
                <Box
                  key={blog.id}
                  sx={{
                    flex: {
                      xs: "1 1 100%", // xs={12}
                      sm: "1 1 calc(50% - 24px)", // sm={6}
                      md: "1 1 calc(33.333% - 24px)", // md={4}
                    },
                  }}
                >
                  <Card
                    sx={{
                      height: "100%",
                      display: "flex",
                      flexDirection: "column",
                      borderRadius: 3,
                      boxShadow: "0 2px 12px rgba(0,0,0,0.08)",
                      transition: "all 0.3s ease",
                      border: "1px solid #E5E7EB",
                      "&:hover": {
                        boxShadow: "0 8px 24px rgba(16, 185, 129, 0.15)",
                        transform: "translateY(-4px)",
                        borderColor: "#10B981",
                      },
                    }}
                  >
                    {/* Image */}
                    {blog.image_url ? (
                      <CardMedia
                        component="img"
                        height="100"
                        image={blog.image_url}
                        alt={blog.title}
                        sx={{ objectFit: "cover" }}
                      />
                    ) : (
                      <Box
                        sx={{
                          height: 200,
                          bgcolor: "#ECFDF5",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        <Typography sx={{ color: "#10B981", fontWeight: 600 }}>
                          No Image
                        </Typography>
                      </Box>
                    )}

                    {/* Content */}
                    <CardContent
                      sx={{
                        flexGrow: 1,
                        p: 3,
                        display: "flex",
                        flexDirection: "column",
                      }}
                    >
                      {/* Title */}
                      <Typography
                        variant="h6"
                        gutterBottom
                        sx={{
                          fontWeight: 700,
                          color: "#1F2937",
                          mb: 1.5,
                          display: "-webkit-box",
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: "vertical",
                          overflow: "hidden",
                          minHeight: "3.6em",
                        }}
                      >
                        {blog.title}
                      </Typography>

                      {/* Summary */}
                      <Box
                        sx={{
                          color: "#6B7280",
                          fontSize: "0.875rem",
                          mb: 2,
                          minHeight: "2.8em",
                          display: "-webkit-box",
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: "vertical",
                          overflow: "hidden",
                          "& p": { margin: 0, lineHeight: 1.4 },
                        }}
                      >
                        <ReactMarkdown>
                          {blog.summary || blog.content}
                        </ReactMarkdown>
                      </Box>

                      {/* Metadata */}
                      <Stack spacing={1} sx={{ mb: 2 }}>
                        <Box
                          sx={{ display: "flex", alignItems: "center", gap: 1 }}
                        >
                          <Person sx={{ fontSize: "1rem" }} />
                          <Typography variant="caption">
                            {blog.author?.email || "Unknown"}
                          </Typography>
                        </Box>
                        <Box
                          sx={{ display: "flex", alignItems: "center", gap: 1 }}
                        >
                          <CalendarToday sx={{ fontSize: "1rem" }} />
                          <Typography variant="caption">
                            {new Date(blog.created_at).toLocaleDateString()}
                          </Typography>
                        </Box>
                      </Stack>

                      {/* Tags */}
                      {blog.tags?.length > 0 && (
                        <Stack
                          direction="row"
                          spacing={0.5}
                          flexWrap="wrap"
                          gap={0.5}
                        >
                          {blog.tags.slice(0, 3).map((tag) => (
                            <Chip
                              key={tag}
                              label={tag}
                              size="small"
                              sx={{
                                bgcolor: "#ECFDF5",
                                color: "#059669",
                                fontSize: "0.75rem",
                                height: 24,
                              }}
                            />
                          ))}
                          {blog.tags.length > 3 && (
                            <Chip
                              label={`+${blog.tags.length - 3}`}
                              size="small"
                              sx={{
                                bgcolor: "#F3F4F6",
                                color: "#6B7280",
                                fontSize: "0.75rem",
                                height: 24,
                              }}
                            />
                          )}
                        </Stack>
                      )}

                      <Box sx={{ flexGrow: 1 }} />

                      {/* Status */}
                      <Box sx={{ mt: 2 }}>
                        <Chip
                          label={blog.published ? "Published" : "Draft"}
                          size="small"
                          sx={{
                            bgcolor: blog.published ? "#ECFDF5" : "#FEF3C7",
                            color: blog.published ? "#059669" : "#D97706",
                            fontWeight: 600,
                          }}
                        />
                      </Box>
                    </CardContent>

                    {/* Actions */}
                    <CardActions
                      sx={{ p: 2, pt: 0, justifyContent: "space-between" }}
                    >
                      <Button
                        size="small"
                        startIcon={<VisibilityIcon />}
                        onClick={() => handleViewBlog(blog.slug)}
                        sx={{
                          color: "#10B981",
                          fontWeight: 600,
                          "&:hover": { bgcolor: "#ECFDF5" },
                        }}
                      >
                        View
                      </Button>
                      <Stack direction="row" spacing={1}>
                        <IconButton
                          size="small"
                          onClick={() => handleEditBlog(blog.id)}
                        >
                          <EditIcon fontSize="small" />
                        </IconButton>
                        <IconButton
                          size="small"
                          onClick={() => handleDeleteClick(blog)}
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </Stack>
                    </CardActions>
                  </Card>
                </Box>
              ))}
            </Box>

            {/* Pagination */}
            {totalPages > 1 && (
              <Box sx={{ display: "flex", justifyContent: "center", mt: 6 }}>
                <Pagination
                  count={totalPages}
                  page={currentPage}
                  onChange={handlePageChange}
                  size="large"
                  sx={{
                    "& .MuiPaginationItem-root": {
                      fontWeight: 600,
                      "&.Mui-selected": {
                        bgcolor: "#10B981",
                        color: "white",
                        "&:hover": {
                          bgcolor: "#059669",
                        },
                      },
                      "&:hover": {
                        bgcolor: "#ECFDF5",
                      },
                    },
                  }}
                />
              </Box>
            )}
          </>
        )}

        {/* Delete Confirmation Dialog */}
        <Dialog
          open={deleteDialogOpen}
          onClose={handleDeleteCancel}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle
            sx={{
              fontWeight: 700,
              color: "#1F2937",
            }}
          >
            Delete Blog Post
          </DialogTitle>
          <DialogContent>
            <Typography>
              Are you sure you want to delete "{blogToDelete?.title}"? This
              action cannot be undone.
            </Typography>
          </DialogContent>
          <DialogActions sx={{ p: 2, gap: 1 }}>
            <Button
              onClick={handleDeleteCancel}
              sx={{
                color: "#6B7280",
                fontWeight: 600,
                "&:hover": {
                  bgcolor: "#F3F4F6",
                },
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={handleDeleteConfirm}
              variant="contained"
              sx={{
                bgcolor: "#EF4444",
                fontWeight: 600,
                "&:hover": {
                  bgcolor: "#DC2626",
                },
              }}
            >
              Delete
            </Button>
          </DialogActions>
        </Dialog>
      </Container>
    </>
  );
};

export default AdminBlogManagement;
