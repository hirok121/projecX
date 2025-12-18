import { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Container,
  Chip,
  CircularProgress,
  Alert,
  Stack,
  Button,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Avatar,
  Divider,
} from "@mui/material";
import {
  Edit,
  Delete,
  ArrowBack,
  CalendarToday,
  Person,
  LocalOffer,
  AccessTime,
} from "@mui/icons-material";
import ReactMarkdown from "react-markdown";
import { blogAPI } from "../../services/blogAPI";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import NavBar from "../../components/layout/NavBar";
import logger from "../../utils/logger";

function BlogView({ blogData, isPreview = false }) {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { isStaff, isSuperuser } = useAuth();
  const [blog, setBlog] = useState(blogData || null);
  const [loading, setLoading] = useState(!blogData);
  const [error, setError] = useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const isAdmin = isStaff || isSuperuser;

  useEffect(() => {
    if (!blogData && slug) {
      fetchBlog();
    }
  }, [slug, blogData]);

  const fetchBlog = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await blogAPI.get(slug);
      setBlog(data);
    } catch (err) {
      setError(err.response?.data?.detail || "Failed to load blog post");
      logger.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await blogAPI.delete(blog.id);
      navigate("/blogs");
    } catch (err) {
      setError("Failed to delete blog post");
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <>
        {!isPreview && <NavBar />}
        <Container maxWidth="lg">
          <Box
            sx={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              minHeight: "60vh",
            }}
          >
            <CircularProgress sx={{ color: "#10B981" }} />
          </Box>
        </Container>
      </>
    );
  }

  if (error) {
    return (
      <>
        {!isPreview && <NavBar />}
        <Container maxWidth="lg" sx={{ py: 4 }}>
          <Alert
            severity="error"
            sx={{
              borderRadius: 2,
              border: "1px solid #FEE2E2",
            }}
          >
            {error}
          </Alert>
          <Button
            startIcon={<ArrowBack />}
            onClick={() => navigate("/blogs")}
            sx={{
              mt: 2,
              color: "#10B981",
              "&:hover": { bgcolor: "#ECFDF5" },
            }}
          >
            Back to Blogs
          </Button>
        </Container>
      </>
    );
  }

  if (!blog) {
    return null;
  }

  const BlogContent = () => (
    <Container maxWidth="lg" sx={{ py: isPreview ? 0 : 4 }}>
      {/* Header Actions */}
      {!isPreview && (
        <Box
          sx={{
            mb: 3,
            display: "flex",
            justifyContent: "flex-start",
            alignItems: "center",
          }}
        >
          <Button
            startIcon={<ArrowBack />}
            onClick={() => navigate("/blogs")}
            sx={{
              color: "#10B981",
              fontWeight: 600,
              borderRadius: 2,
              px: 2,
              "&:hover": {
                bgcolor: "#ECFDF5",
              },
            }}
          >
            Back to Blogs
          </Button>
        </Box>
      )}

      {/* Hero Section with Cover Image */}
      <Box
        sx={{
          bgcolor: "white",
          borderRadius: 3,
          overflow: "hidden",
          boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
          mb: 3,
        }}
      >
        {blog.image_url && (
          <Box
            component="img"
            src={blog.image_url}
            alt={blog.title}
            sx={{
              width: "100%",
              maxHeight: 450,
              objectFit: "cover",
            }}
          />
        )}

        <Box sx={{ p: { xs: 3, md: 5 } }}>
          {/* Title */}
          <Typography
            variant="h3"
            sx={{
              fontWeight: 800,
              mb: 3,
              fontSize: { xs: "2rem", md: "2.5rem" },
              color: "#000000",
              lineHeight: 1.2,
            }}
          >
            {blog.title}
          </Typography>

          {/* Meta Information */}
          <Stack
            direction="row"
            spacing={3}
            sx={{ mb: 3, flexWrap: "wrap", gap: 2 }}
          >
            {blog.author_name && (
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <Avatar
                  sx={{
                    width: 40,
                    height: 40,
                    bgcolor: "#10B981",
                    fontSize: "0.9rem",
                    fontWeight: 700,
                  }}
                >
                  {blog.author_name.charAt(0).toUpperCase()}
                </Avatar>
                <Box>
                  <Typography
                    variant="body2"
                    sx={{ fontWeight: 600, color: "#000000" }}
                  >
                    {blog.author_name}
                  </Typography>
                  <Typography variant="caption" sx={{ color: "#666666" }}>
                    Author
                  </Typography>
                </Box>
              </Box>
            )}
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 1,
                color: "#666666",
              }}
            >
              <CalendarToday sx={{ fontSize: "1.2rem" }} />
              <Typography variant="body2">
                {new Date(blog.created_at).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </Typography>
            </Box>
            {blog.updated_at !== blog.created_at && (
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 1,
                  color: "#666666",
                }}
              >
                <AccessTime sx={{ fontSize: "1.2rem" }} />
                <Typography variant="body2">
                  Updated: {new Date(blog.updated_at).toLocaleDateString()}
                </Typography>
              </Box>
            )}
          </Stack>

          {/* Tags */}
          {blog.tags && blog.tags.length > 0 && (
            <Stack
              direction="row"
              spacing={1}
              sx={{ mb: 3 }}
              flexWrap="wrap"
              gap={1}
            >
              {blog.tags.map((tag) => (
                <Chip
                  key={tag}
                  label={tag}
                  icon={<LocalOffer sx={{ fontSize: "1rem" }} />}
                  size="small"
                  sx={{
                    bgcolor: "#ECFDF5",
                    color: "#10B981",
                    fontWeight: 600,
                    border: "1px solid #D1FAE5",
                    "&:hover": {
                      bgcolor: "#D1FAE5",
                    },
                  }}
                />
              ))}
            </Stack>
          )}

          <Divider sx={{ my: 3 }} />

          {/* Summary */}
          {blog.summary && (
            <Box
              sx={{
                p: 3,
                mb: 4,
                bgcolor: "#ECFDF5",
                borderLeft: "4px solid #10B981",
                borderRadius: 2,
              }}
            >
              <Typography
                variant="body1"
                sx={{
                  fontStyle: "italic",
                  color: "#000000",
                  fontSize: "1.1rem",
                  lineHeight: 1.8,
                }}
              >
                {blog.summary}
              </Typography>
            </Box>
          )}

          {/* Content */}
          <Box
            sx={{
              "& h1": {
                fontSize: "2rem",
                mb: 2,
                mt: 4,
                fontWeight: 700,
                color: "#000000",
              },
              "& h2": {
                fontSize: "1.5rem",
                mb: 1.5,
                mt: 3,
                fontWeight: 700,
                color: "#10B981",
              },
              "& h3": {
                fontSize: "1.25rem",
                mb: 1,
                mt: 2.5,
                fontWeight: 600,
                color: "#059669",
              },
              "& p": {
                mb: 2,
                lineHeight: 1.8,
                color: "#374151",
                fontSize: "1.05rem",
              },
              "& ul, & ol": { mb: 2, pl: 4, color: "#374151" },
              "& li": { mb: 1, lineHeight: 1.7 },
              "& code": {
                bgcolor: "#F3F4F6",
                color: "#10B981",
                px: 1,
                py: 0.5,
                borderRadius: 1,
                fontFamily: "monospace",
                fontSize: "0.9em",
                border: "1px solid #E5E7EB",
              },
              "& pre": {
                bgcolor: "#1F2937",
                color: "#F9FAFB",
                p: 2.5,
                borderRadius: 2,
                overflow: "auto",
                mb: 3,
                border: "1px solid #374151",
              },
              "& pre code": {
                bgcolor: "transparent",
                color: "#10B981",
                p: 0,
                border: "none",
              },
              "& blockquote": {
                borderLeft: "4px solid #10B981",
                bgcolor: "#F9FAFB",
                pl: 3,
                py: 1.5,
                my: 3,
                color: "#374151",
                fontStyle: "italic",
                borderRadius: 1,
              },
              "& img": {
                maxWidth: "100%",
                height: "auto",
                borderRadius: 2,
                my: 3,
                boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
              },
              "& a": {
                color: "#10B981",
                textDecoration: "none",
                fontWeight: 600,
                "&:hover": {
                  textDecoration: "underline",
                  color: "#059669",
                },
              },
              "& table": {
                width: "100%",
                borderCollapse: "collapse",
                mb: 3,
                boxShadow: "0 1px 3px rgba(0, 0, 0, 0.1)",
              },
              "& th, & td": {
                border: "1px solid #E5E7EB",
                p: 1.5,
                textAlign: "left",
              },
              "& th": {
                bgcolor: "#ECFDF5",
                color: "#10B981",
                fontWeight: 700,
              },
              "& td": {
                color: "#374151",
              },
            }}
          >
            <ReactMarkdown>{blog.content}</ReactMarkdown>
          </Box>
        </Box>
      </Box>

      {/* Delete Confirmation Dialog */}
      {!isPreview && false && (
        <Dialog
          open={deleteDialogOpen}
          onClose={() => setDeleteDialogOpen(false)}
          PaperProps={{
            sx: {
              borderRadius: 3,
              p: 1,
            },
          }}
        >
          <DialogTitle sx={{ fontWeight: 700, color: "#000000" }}>
            Delete Blog Post?
          </DialogTitle>
          <DialogContent>
            <Typography sx={{ color: "#666666" }}>
              Are you sure you want to delete "{blog.title}"? This action cannot
              be undone.
            </Typography>
          </DialogContent>
          <DialogActions sx={{ p: 2 }}>
            <Button
              onClick={() => setDeleteDialogOpen(false)}
              disabled={deleting}
              sx={{
                color: "#666666",
                "&:hover": { bgcolor: "#F3F4F6" },
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={handleDelete}
              variant="contained"
              disabled={deleting}
              sx={{
                bgcolor: "#EF4444",
                color: "white",
                fontWeight: 600,
                "&:hover": {
                  bgcolor: "#DC2626",
                },
              }}
            >
              {deleting ? "Deleting..." : "Delete"}
            </Button>
          </DialogActions>
        </Dialog>
      )}
    </Container>
  );

  return (
    <>
      {!isPreview && <NavBar />}
      <BlogContent />
    </>
  );
}

export default BlogView;
