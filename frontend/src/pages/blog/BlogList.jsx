import { useState, useEffect, useCallback } from "react";
import {
  Box,
  Button,
  Typography,
  Chip,
  TextField,
  InputAdornment,
  CircularProgress,
  Alert,
  Stack,
  Pagination,
  Container,
} from "@mui/material";
import { Search, LocalOffer, Article } from "@mui/icons-material";
import { blogAPI } from "../../services/blogAPI";
import NavBar from "../../components/layout/NavBar";
import BlogCard from "../../components/common/BlogCard";

function BlogList() {
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTag, setSelectedTag] = useState(null);
  const [page, setPage] = useState(1);
  const [totalBlogs, setTotalBlogs] = useState(0);
  const blogsPerPage = 12;

  const fetchBlogs = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = {
        published: true,
        limit: blogsPerPage,
        offset: (page - 1) * blogsPerPage,
      };
      if (searchQuery) params.q = searchQuery;
      if (selectedTag) params.tag = selectedTag;

      const data = await blogAPI.list(params);
      setBlogs(data);
      setTotalBlogs(data.length); // Note: You may want to add total count from backend
    } catch (err) {
      setError("Failed to load blogs");
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [page, searchQuery, selectedTag]);

  useEffect(() => {
    fetchBlogs();
  }, [fetchBlogs]);

  const handleSearch = () => {
    setPage(1);
    fetchBlogs();
  };

  const handleTagClick = (tag) => {
    setSelectedTag(selectedTag === tag ? null : tag);
    setPage(1);
  };

  const getAllTags = () => {
    const tagSet = new Set();
    blogs.forEach((blog) => {
      blog.tags?.forEach((tag) => tagSet.add(tag));
    });
    return Array.from(tagSet);
  };



  return (
    <>
      <NavBar />
      <Box sx={{ bgcolor: "#F9FAFB", minHeight: "100vh", py: 4 }}>
        <Container maxWidth="xl">
          {/* Hero Header */}
          <Box
            sx={{
              mb: 5,
              textAlign: "center",
              py: 4,
            }}
          >
            <Typography
              variant="h3"
              sx={{
                fontWeight: 800,
                mb: 2,
                color: "#000000",
                fontSize: { xs: "2rem", md: "2.5rem" },
              }}
            >
              Blog & Articles
            </Typography>
            <Typography
              variant="body1"
              sx={{
                color: "#666666",
                maxWidth: 600,
                mx: "auto",
              }}
            >
              Explore our latest insights, updates, and research articles on
              hepatitis diagnosis and AI-powered healthcare.
            </Typography>
          </Box>

          {/* Search & Filters */}
          <Box sx={{ mb: 4 }}>
            <TextField
              fullWidth
              variant="outlined"
              placeholder="Search blogs by title, content, or tags..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && handleSearch()}
              sx={{
                bgcolor: "white",
                borderRadius: 2,
                "& .MuiOutlinedInput-root": {
                  "&:hover fieldset": {
                    borderColor: "#10B981",
                  },
                  "&.Mui-focused fieldset": {
                    borderColor: "#10B981",
                  },
                },
              }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Search sx={{ color: "#10B981" }} />
                  </InputAdornment>
                ),
                endAdornment: (
                  <Button
                    onClick={handleSearch}
                    variant="contained"
                    sx={{
                      ml: 1,
                      bgcolor: "#10B981",
                      "&:hover": { bgcolor: "#059669" },
                    }}
                  >
                    Search
                  </Button>
                ),
              }}
            />

            {/* Tag Filters */}
            {getAllTags().length > 0 && (
              <Box sx={{ mt: 2 }}>
                <Typography
                  variant="subtitle2"
                  sx={{ mb: 1, fontWeight: 600, color: "#000000" }}
                >
                  Filter by tag:
                </Typography>
                <Stack direction="row" spacing={1} flexWrap="wrap">
                  {getAllTags().map((tag) => (
                    <Chip
                      key={tag}
                      label={tag}
                      icon={<LocalOffer />}
                      onClick={() => handleTagClick(tag)}
                      sx={{
                        mb: 1,
                        bgcolor: selectedTag === tag ? "#10B981" : "white",
                        color: selectedTag === tag ? "white" : "#10B981",
                        border: "1px solid #10B981",
                        fontWeight: 600,
                        "&:hover": {
                          bgcolor: selectedTag === tag ? "#059669" : "#ECFDF5",
                        },
                      }}
                    />
                  ))}
                </Stack>
              </Box>
            )}
          </Box>

          {/* Error Alert */}
          {error && (
            <Alert
              severity="error"
              sx={{
                mb: 3,
                borderRadius: 2,
                border: "1px solid #FEE2E2",
              }}
            >
              {error}
            </Alert>
          )}

          {/* Loading State */}
          {loading ? (
            <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
              <CircularProgress sx={{ color: "#10B981" }} />
            </Box>
          ) : (
            <>
              {/* Blog Grid */}
              {blogs.length === 0 ? (
                <Box
                  sx={{
                    textAlign: "center",
                    py: 8,
                    bgcolor: "white",
                    borderRadius: 3,
                  }}
                >
                  <Article sx={{ fontSize: 80, color: "#D1FAE5", mb: 2 }} />
                  <Typography variant="h6" sx={{ color: "#666666", mb: 1 }}>
                    No blogs found
                  </Typography>
                  <Typography variant="body2" sx={{ color: "#999999" }}>
                    {searchQuery || selectedTag
                      ? "Try adjusting your search or filters"
                      : "No blog posts available yet"}
                  </Typography>
                </Box>
              ) : (
                <>
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
                      <BlogCard key={blog.id} blog={blog} />
                    ))}
                  </Box>

                  {/* Pagination */}
                  {totalBlogs > blogsPerPage && (
                    <Box
                      sx={{ display: "flex", justifyContent: "center", mt: 5 }}
                    >
                      <Pagination
                        count={Math.ceil(totalBlogs / blogsPerPage)}
                        page={page}
                        onChange={(e, value) => setPage(value)}
                        sx={{
                          "& .MuiPaginationItem-root": {
                            "&.Mui-selected": {
                              bgcolor: "#10B981",
                              color: "white",
                              "&:hover": {
                                bgcolor: "#059669",
                              },
                            },
                          },
                        }}
                      />
                    </Box>
                  )}
                </>
              )}
            </>
          )}
        </Container>
      </Box>
    </>
  );
}

export default BlogList;
