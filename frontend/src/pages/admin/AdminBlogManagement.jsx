import { useState, useEffect, useCallback } from "react";
import {
  Box,
  Container,
  Typography,
  Button,
  TextField,
  InputAdornment,
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
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import { blogAPI } from "../../services/blogAPI";
import AdminNavBar from "../../components/admin/AdminNavbar";
import BlogCard from "../../components/common/BlogCard";
import logger from "../../utils/logger";

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


  const fetchBlogs = useCallback(async () => {
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
      logger.error("Error fetching blogs:", err);
      setError("Failed to load blogs. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [currentPage, searchQuery]);

    useEffect(() => {
    fetchBlogs();
  }, [fetchBlogs]);


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
      logger.error("Error deleting blog:", err);
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
      <AdminNavBar />
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
                display: "grid",
                gridTemplateColumns: {
                  xs: "1fr",
                  sm: "repeat(2, 1fr)",
                  md: "repeat(3, 1fr)",
                },
                gap: 4,
              }}
            >
              {blogs.map((blog) => (
                <BlogCard
                  key={blog.id}
                  blog={blog}
                  showAdminActions={true}
                  onEdit={handleEditBlog}
                  onDelete={handleDeleteClick}
                  onView={handleViewBlog}
                />
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
              Are you sure you want to delete &ldquo;{blogToDelete?.title}&rdquo;? This
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
