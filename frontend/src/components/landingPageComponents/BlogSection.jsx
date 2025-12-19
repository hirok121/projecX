import { useState, useEffect } from "react";
import {
  Box,
  Container,
  Typography,
  Button,
  Paper,
  CircularProgress,
} from "@mui/material";
import { styled, keyframes } from "@mui/material/styles";
import { Article } from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import { blogAPI } from "../../services/blogAPI";
import BlogCard from "../common/BlogCard";

// Animations
const fadeInAnimation = keyframes`
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
`;

// Styled components
const StyledSection = styled(Paper)(({ theme }) => ({
  paddingTop: theme.spacing(12),
  paddingBottom: theme.spacing(12),
  backgroundColor: theme.palette.grey[50],
  borderRadius: 0,
  boxShadow: "none",
  borderBottom: `1px solid ${theme.palette.divider}`,
  "@media (max-width: 600px)": {
    paddingTop: theme.spacing(8),
    paddingBottom: theme.spacing(8),
  },
}));

const AnimatedBox = styled(Box, {
  shouldForwardProp: (prop) => prop !== "animationDelay",
})(({ animationDelay = "0s" }) => ({
  animation: `${fadeInAnimation} 0.8s ease-out ${animationDelay} both`,
}));

const BlogSection = ({ id }) => {
  const navigate = useNavigate();
  const [blogPosts, setBlogPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch latest 3 published blogs
  useEffect(() => {
    const fetchBlogs = async () => {
      try {
        const data = await blogAPI.list({
          published: true,
          limit: 3,
          offset: 0,
        });
        // Ensure data is an array
        setBlogPosts(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error("Error fetching blogs:", error);
        // Keep empty array on error
        setBlogPosts([]);
      } finally {
        setLoading(false);
      }
    };

    fetchBlogs();
  }, []);

  // Navigation handlers
  const handleViewAllArticles = () => {
    navigate("/blogs");
  };

  return (
    <StyledSection
      id={id}
      elevation={0}
      sx={{
        backgroundColor: "transparent",
        mt: 0,
        pt: { xs: 4, md: 6 },
        pb: { xs: 4, md: 6 },
      }}
    >
        <Container maxWidth="lg">
          {/* Header Section */}
          <AnimatedBox animationDelay="0s">
            <Box sx={{ textAlign: "center", mb: 6 }}>
              <Typography variant="h2" gutterBottom sx={{ mb: 2 }}>
                Latest Health{" "}
                <Box component="span" sx={{ color: "primary.main" }}>
                  Insights
                </Box>
              </Typography>
              <Typography
                variant="h5"
                sx={{
                  mb: 4,
                  maxWidth: "60ch",
                  mx: "auto",
                  color: "text.secondary",
                  fontWeight: 400,
                }}
              >
                Stay informed with cutting-edge research, AI developments, and
                clinical insights in medical diagnostics and healthcare innovation.
              </Typography>
            </Box>
          </AnimatedBox>

          {/* Blog Posts Grid */}
          {loading ? (
            <Box
              sx={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                minHeight: "400px",
              }}
            >
              <CircularProgress />
            </Box>
          ) : blogPosts.length === 0 ? (
            <Box
              sx={{
                textAlign: "center",
                py: 8,
                px: 2,
              }}
            >
              <Typography variant="h6" color="text.secondary" gutterBottom>
                No articles available yet
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Check back soon for the latest health insights and research
                updates.
              </Typography>
            </Box>
          ) : (
            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: {
                  xs: "1fr",
                  sm: "repeat(2, 1fr)",
                  md: "repeat(3, 1fr)",
                },
                gap: 4,
                mb: 6,
              }}
            >
              {blogPosts.map((post, index) => (
                <AnimatedBox
                  key={post.id}
                  animationDelay={`${0.2 + index * 0.1}s`}
                >
                  <BlogCard blog={post} />
                </AnimatedBox>
              ))}
            </Box>
          )}

          {/* CTA Section */}
          <AnimatedBox animationDelay="0.6s">
            <Box
              sx={{
                textAlign: "center",
                p: 4,
                backgroundColor: (theme) => `${theme.palette.primary.main}0D`,
                borderRadius: 3,
                border: (theme) => `1px solid ${theme.palette.primary.main}1A`,
              }}
            >
              <Typography
                variant="h6"
                sx={{ mb: 2, color: "text.primary", fontWeight: 600 }}
              >
                Stay Updated with Latest Research
              </Typography>
              <Typography variant="body1" sx={{ mb: 3, color: "text.secondary" }}>
                Get insights on AI-powered medical diagnostics and healthcare
                research developments.
              </Typography>
              {/* Update the View All Articles button */}
              <Button
                variant="contained"
                color="primary"
                size="large"
                endIcon={<Article />}
                onClick={handleViewAllArticles}
                sx={{
                  minWidth: "200px",
                  fontSize: "1rem",
                }}
              >
                View All Articles
              </Button>
            </Box>
          </AnimatedBox>
        </Container>
      </StyledSection>
    );
  };

export default BlogSection;
