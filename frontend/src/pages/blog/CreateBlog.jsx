import { useState } from "react";
import {
  Box,
  Button,
  TextField,
  Typography,
  Container,
  Stack,
  Chip,
  Switch,
  FormControlLabel,
  IconButton,
  Tab,
  Tabs,
  Alert,
  CircularProgress,
  Dialog,
  DialogContent,
  DialogActions,
} from "@mui/material";
import {
  CloudUpload,
  Visibility,
  Save,
  Close as CloseIcon,
  ArrowBack,
  Add,
} from "@mui/icons-material";
import ReactMarkdown from "react-markdown";
import { blogAPI } from "../../services/blogAPI";
import { useNavigate } from "react-router-dom";
import NavBar from "../../components/layout/NavBar";
import BlogView from "./BlogView";
import logger from "../../utils/logger";

function CreateBlog() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [previewDialogOpen, setPreviewDialogOpen] = useState(false);

  const [formData, setFormData] = useState({
    title: "",
    slug: "",
    content: "",
    summary: "",
    tags: [],
    published: false,
    image: null,
  });

  const [tagInput, setTagInput] = useState("");
  const [imagePreview, setImagePreview] = useState(null);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handlePublishedToggle = (e) => {
    setFormData((prev) => ({ ...prev, published: e.target.checked }));
  };

  const handleAddTag = () => {
    if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
      setFormData((prev) => ({
        ...prev,
        tags: [...prev.tags, tagInput.trim()],
      }));
      setTagInput("");
    }
  };

  const handleRemoveTag = (tagToRemove) => {
    setFormData((prev) => ({
      ...prev,
      tags: prev.tags.filter((tag) => tag !== tagToRemove),
    }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setFormData((prev) => ({ ...prev, image: file }));
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveImage = () => {
    setFormData((prev) => ({ ...prev, image: null }));
    setImagePreview(null);
  };

  const generateSlug = async () => {
    if (!formData.title) return;
    try {
      const { slug } = await blogAPI.generateSlug(formData.title);
      setFormData((prev) => ({ ...prev, slug }));
    } catch (err) {
      logger.error("Failed to generate slug:", err);
    }
  };

  const handleSubmit = async () => {
    setError(null);
    setSuccess(false);

    // Validation
    if (!formData.title || !formData.content) {
      setError("Title and content are required");
      return;
    }

    // Auto-generate slug if not provided
    if (!formData.slug) {
      await generateSlug();
      if (!formData.slug) {
        setError("Failed to generate slug");
        return;
      }
    }

    setLoading(true);
    try {
      const result = await blogAPI.create(formData);
      setSuccess(true);
      setTimeout(() => {
        navigate(`/blogs/${result.slug}`);
      }, 1500);
    } catch (err) {
      setError(err.response?.data?.detail || "Failed to create blog post");
    } finally {
      setLoading(false);
    }
  };

  const handlePreview = () => {
    if (!formData.title || !formData.content) {
      setError("Please add at least a title and content to preview");
      return;
    }
    setPreviewDialogOpen(true);
  };

  const previewBlogData = {
    ...formData,
    image_url: imagePreview,
    author_name: "You",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  return (
    <>
      <NavBar />
      <Box sx={{ bgcolor: "#F9FAFB", minHeight: "100vh", py: 4 }}>
        <Container maxWidth="lg">
          {/* Header */}
          <Box sx={{ mb: 4 }}>
            <Button
              startIcon={<ArrowBack />}
              onClick={() => navigate("/blogs")}
              sx={{
                color: "#10B981",
                fontWeight: 600,
                mb: 2,
                "&:hover": { bgcolor: "#ECFDF5" },
              }}
            >
              Back to Blogs
            </Button>
            <Typography
              variant="h3"
              sx={{
                fontWeight: 800,
                color: "#000000",
                mb: 1,
              }}
            >
              Create New Blog Post
            </Typography>
            <Typography variant="body1" sx={{ color: "#666666" }}>
              Share your insights and knowledge with the community
            </Typography>
          </Box>

          {error && (
            <Alert
              severity="error"
              sx={{ mb: 3, borderRadius: 2 }}
              onClose={() => setError(null)}
            >
              {error}
            </Alert>
          )}

          {success && (
            <Alert severity="success" sx={{ mb: 3, borderRadius: 2 }}>
              Blog post created successfully! Redirecting...
            </Alert>
          )}

          {/* Form Section */}
          <Box
            sx={{
              bgcolor: "white",
              borderRadius: 3,
              p: 4,
              mb: 3,
              boxShadow: "0 1px 3px rgba(0, 0, 0, 0.1)",
            }}
          >
            <Stack spacing={3}>
              {/* Title */}
              <TextField
                label="Title"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                required
                fullWidth
                variant="outlined"
                sx={{
                  "& .MuiOutlinedInput-root": {
                    "&:hover fieldset": {
                      borderColor: "#10B981",
                    },
                    "&.Mui-focused fieldset": {
                      borderColor: "#10B981",
                    },
                  },
                  "& .MuiInputLabel-root.Mui-focused": {
                    color: "#10B981",
                  },
                }}
              />

              {/* Slug */}
              <Box sx={{ display: "flex", gap: 2 }}>
                <TextField
                  label="Slug (URL-friendly)"
                  name="slug"
                  value={formData.slug}
                  onChange={handleInputChange}
                  fullWidth
                  variant="outlined"
                  placeholder="auto-generated-from-title"
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      "&:hover fieldset": {
                        borderColor: "#10B981",
                      },
                      "&.Mui-focused fieldset": {
                        borderColor: "#10B981",
                      },
                    },
                    "& .MuiInputLabel-root.Mui-focused": {
                      color: "#10B981",
                    },
                  }}
                />
                <Button
                  onClick={generateSlug}
                  variant="outlined"
                  sx={{
                    color: "#10B981",
                    borderColor: "#10B981",
                    fontWeight: 600,
                    px: 3,
                    "&:hover": {
                      borderColor: "#059669",
                      bgcolor: "#ECFDF5",
                    },
                  }}
                >
                  Generate
                </Button>
              </Box>

              {/* Summary */}
              <TextField
                label="Summary (Optional)"
                name="summary"
                value={formData.summary}
                onChange={handleInputChange}
                fullWidth
                multiline
                rows={2}
                variant="outlined"
                placeholder="A brief description of your blog post..."
                sx={{
                  "& .MuiOutlinedInput-root": {
                    "&:hover fieldset": {
                      borderColor: "#10B981",
                    },
                    "&.Mui-focused fieldset": {
                      borderColor: "#10B981",
                    },
                  },
                  "& .MuiInputLabel-root.Mui-focused": {
                    color: "#10B981",
                  },
                }}
              />

              {/* Tags */}
              <Box>
                <Typography
                  variant="subtitle2"
                  gutterBottom
                  sx={{ fontWeight: 600, color: "#000000" }}
                >
                  Tags
                </Typography>
                <Box sx={{ display: "flex", gap: 1, mb: 2 }}>
                  <TextField
                    size="small"
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        handleAddTag();
                      }
                    }}
                    placeholder="Add a tag (e.g., Healthcare, AI, Research)"
                    fullWidth
                    sx={{
                      "& .MuiOutlinedInput-root": {
                        "&:hover fieldset": {
                          borderColor: "#10B981",
                        },
                        "&.Mui-focused fieldset": {
                          borderColor: "#10B981",
                        },
                      },
                    }}
                  />
                  <Button
                    onClick={handleAddTag}
                    variant="contained"
                    size="small"
                    startIcon={<Add />}
                    sx={{
                      bgcolor: "#10B981",
                      fontWeight: 600,
                      px: 3,
                      "&:hover": {
                        bgcolor: "#059669",
                      },
                    }}
                  >
                    Add
                  </Button>
                </Box>
                <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
                  {formData.tags.map((tag) => (
                    <Chip
                      key={tag}
                      label={tag}
                      onDelete={() => handleRemoveTag(tag)}
                      size="small"
                      sx={{
                        bgcolor: "#ECFDF5",
                        color: "#10B981",
                        fontWeight: 600,
                        border: "1px solid #D1FAE5",
                        "& .MuiChip-deleteIcon": {
                          color: "#10B981",
                          "&:hover": {
                            color: "#059669",
                          },
                        },
                      }}
                    />
                  ))}
                </Box>
              </Box>

              {/* Image Upload */}
              <Box>
                <Typography
                  variant="subtitle2"
                  gutterBottom
                  sx={{ fontWeight: 600, color: "#000000" }}
                >
                  Cover Image (Optional)
                </Typography>
                <Button
                  variant="outlined"
                  component="label"
                  startIcon={<CloudUpload />}
                  sx={{
                    color: "#10B981",
                    borderColor: "#10B981",
                    fontWeight: 600,
                    "&:hover": {
                      borderColor: "#059669",
                      bgcolor: "#ECFDF5",
                    },
                  }}
                >
                  Upload Image
                  <input
                    type="file"
                    hidden
                    accept="image/*"
                    onChange={handleImageChange}
                  />
                </Button>
                {imagePreview && (
                  <Box
                    sx={{
                      mt: 2,
                      position: "relative",
                      display: "inline-block",
                    }}
                  >
                    <img
                      src={imagePreview}
                      alt="Preview"
                      style={{
                        maxWidth: 400,
                        maxHeight: 250,
                        borderRadius: 12,
                        boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
                      }}
                    />
                    <IconButton
                      onClick={handleRemoveImage}
                      sx={{
                        position: "absolute",
                        top: -10,
                        right: -10,
                        bgcolor: "#EF4444",
                        color: "white",
                        "&:hover": {
                          bgcolor: "#DC2626",
                        },
                      }}
                      size="small"
                    >
                      <CloseIcon />
                    </IconButton>
                  </Box>
                )}
              </Box>

              {/* Published Toggle */}
              <FormControlLabel
                control={
                  <Switch
                    checked={formData.published}
                    onChange={handlePublishedToggle}
                    sx={{
                      "& .MuiSwitch-switchBase.Mui-checked": {
                        color: "#10B981",
                      },
                      "& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track":
                        {
                          bgcolor: "#10B981",
                        },
                    }}
                  />
                }
                label={
                  <Typography sx={{ fontWeight: 600, color: "#000000" }}>
                    Publish immediately
                  </Typography>
                }
              />
            </Stack>
          </Box>

          {/* Content Editor with Tabs */}
          <Box
            sx={{
              bgcolor: "white",
              borderRadius: 3,
              overflow: "hidden",
              mb: 3,
              boxShadow: "0 1px 3px rgba(0, 0, 0, 0.1)",
            }}
          >
            <Tabs
              value={activeTab}
              onChange={(e, v) => setActiveTab(v)}
              sx={{
                borderBottom: "1px solid #E5E7EB",
                "& .MuiTab-root": {
                  fontWeight: 600,
                  fontSize: "0.95rem",
                  textTransform: "none",
                  px: 4,
                  "&.Mui-selected": {
                    color: "#10B981",
                  },
                },
                "& .MuiTabs-indicator": {
                  bgcolor: "#10B981",
                  height: 3,
                },
              }}
            >
              <Tab label="Write" />
              <Tab label="Preview" />
            </Tabs>

            <Box sx={{ p: 4 }}>
              {activeTab === 0 ? (
                <TextField
                  label="Content (Markdown)"
                  name="content"
                  value={formData.content}
                  onChange={handleInputChange}
                  required
                  fullWidth
                  multiline
                  rows={18}
                  variant="outlined"
                  placeholder="Write your blog content in Markdown...

## Example Heading

- List item 1
- List item 2

**Bold text** and *italic text*

```code block```"
                  sx={{
                    fontFamily: "monospace",
                    "& .MuiOutlinedInput-root": {
                      "&:hover fieldset": {
                        borderColor: "#10B981",
                      },
                      "&.Mui-focused fieldset": {
                        borderColor: "#10B981",
                      },
                    },
                    "& .MuiInputLabel-root.Mui-focused": {
                      color: "#10B981",
                    },
                  }}
                />
              ) : (
                <Box
                  sx={{
                    minHeight: 500,
                    "& h1": {
                      fontSize: "2rem",
                      mb: 2,
                      fontWeight: 700,
                      color: "#000000",
                    },
                    "& h2": {
                      fontSize: "1.5rem",
                      mb: 1.5,
                      fontWeight: 700,
                      color: "#10B981",
                    },
                    "& h3": {
                      fontSize: "1.25rem",
                      mb: 1,
                      fontWeight: 600,
                      color: "#059669",
                    },
                    "& p": {
                      mb: 2,
                      lineHeight: 1.8,
                      color: "#374151",
                    },
                    "& ul, & ol": { mb: 2, pl: 4, color: "#374151" },
                    "& li": { mb: 1 },
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
                    },
                  }}
                >
                  {formData.content ? (
                    <ReactMarkdown>{formData.content}</ReactMarkdown>
                  ) : (
                    <Typography
                      sx={{
                        color: "#999999",
                        textAlign: "center",
                        py: 10,
                        fontStyle: "italic",
                      }}
                    >
                      Preview will appear here...
                    </Typography>
                  )}
                </Box>
              )}
            </Box>
          </Box>

          {/* Action Buttons */}
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <Button
              variant="outlined"
              onClick={() => navigate("/blogs")}
              disabled={loading}
              sx={{
                color: "#666666",
                borderColor: "#E5E7EB",
                fontWeight: 600,
                px: 3,
                "&:hover": {
                  borderColor: "#666666",
                  bgcolor: "#F3F4F6",
                },
              }}
            >
              Cancel
            </Button>
            <Stack direction="row" spacing={2}>
              <Button
                variant="outlined"
                onClick={handlePreview}
                startIcon={<Visibility />}
                disabled={loading}
                sx={{
                  color: "#10B981",
                  borderColor: "#10B981",
                  fontWeight: 600,
                  px: 3,
                  "&:hover": {
                    borderColor: "#059669",
                    bgcolor: "#ECFDF5",
                  },
                }}
              >
                Full Preview
              </Button>
              <Button
                variant="contained"
                onClick={handleSubmit}
                disabled={loading}
                startIcon={loading ? <CircularProgress size={20} /> : <Save />}
                sx={{
                  bgcolor: "#10B981",
                  color: "white",
                  fontWeight: 600,
                  px: 4,
                  boxShadow: "0 4px 6px -1px rgba(16, 185, 129, 0.3)",
                  "&:hover": {
                    bgcolor: "#059669",
                    boxShadow: "0 10px 15px -3px rgba(16, 185, 129, 0.4)",
                  },
                }}
              >
                {loading ? "Creating..." : "Create Blog Post"}
              </Button>
            </Stack>
          </Box>

          {/* Full Preview Dialog */}
          <Dialog
            open={previewDialogOpen}
            onClose={() => setPreviewDialogOpen(false)}
            maxWidth="lg"
            fullWidth
            PaperProps={{
              sx: {
                borderRadius: 3,
                maxHeight: "90vh",
              },
            }}
          >
            <DialogActions sx={{ p: 2, borderBottom: "1px solid #E5E7EB" }}>
              <Typography
                sx={{ flexGrow: 1, fontWeight: 700, color: "#000000", pl: 1 }}
              >
                Blog Preview
              </Typography>
              <IconButton
                onClick={() => setPreviewDialogOpen(false)}
                sx={{
                  color: "#666666",
                  "&:hover": {
                    bgcolor: "#F3F4F6",
                  },
                }}
              >
                <CloseIcon />
              </IconButton>
            </DialogActions>
            <DialogContent sx={{ p: 0 }}>
              <BlogView blogData={previewBlogData} isPreview={true} />
            </DialogContent>
          </Dialog>
        </Container>
      </Box>
    </>
  );
}

export default CreateBlog;
