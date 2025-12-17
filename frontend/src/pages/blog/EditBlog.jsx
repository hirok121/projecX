import { useState, useEffect } from "react";
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
import { useNavigate, useParams } from "react-router-dom";
import NavBar from "../../components/layout/NavBar";
import BlogView from "./BlogView";

function EditBlog() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [activeTab, setActiveTab] = useState(0);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
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
  const [existingImageUrl, setExistingImageUrl] = useState(null);

  useEffect(() => {
    fetchBlog();
  }, [id]);

  const fetchBlog = async () => {
    try {
      setLoading(true);
      const blog = await blogAPI.get(id);
      setFormData({
        title: blog.title || "",
        slug: blog.slug || "",
        content: blog.content || "",
        summary: blog.summary || "",
        tags: blog.tags || [],
        published: blog.published || false,
        image: null,
      });
      setExistingImageUrl(blog.image_url);
      setError(null);
    } catch (err) {
      setError(err.response?.data?.detail || "Failed to load blog post");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

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
    setExistingImageUrl(null);
  };

  const generateSlug = async () => {
    if (!formData.title) return;
    try {
      const { slug } = await blogAPI.generateSlug(formData.title);
      setFormData((prev) => ({ ...prev, slug }));
    } catch (err) {
      console.error("Failed to generate slug:", err);
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

    setSaving(true);
    try {
      // If no new image is selected, preserve the existing image URL
      const updateData = { ...formData };
      if (!updateData.image && existingImageUrl) {
        // Don't send image field at all to preserve existing image on backend
        delete updateData.image;
      }

      const result = await blogAPI.update(id, updateData);
      setSuccess(true);
      setTimeout(() => {
        navigate(`/blogs/${result.slug}`);
      }, 1500);
    } catch (err) {
      setError(err.response?.data?.detail || "Failed to update blog post");
    } finally {
      setSaving(false);
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
    image_url: imagePreview || existingImageUrl,
    author_name: "You",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  if (loading) {
    return (
      <>
        <NavBar />
        <Container maxWidth="lg" sx={{ py: 8 }}>
          <Box sx={{ display: "flex", justifyContent: "center" }}>
            <CircularProgress sx={{ color: "#10B981" }} size={60} />
          </Box>
        </Container>
      </>
    );
  }

  return (
    <>
      <NavBar />
      <Box sx={{ bgcolor: "#F9FAFB", minHeight: "100vh", py: 4 }}>
        <Container maxWidth="lg">
          {/* Header */}
          <Box sx={{ mb: 4 }}>
            <Button
              startIcon={<ArrowBack />}
              onClick={() => navigate(-1)}
              sx={{
                color: "#10B981",
                fontWeight: 600,
                mb: 2,
                "&:hover": { bgcolor: "#ECFDF5" },
              }}
            >
              Back
            </Button>
            <Typography
              variant="h3"
              sx={{
                fontWeight: 800,
                color: "#000000",
                mb: 1,
              }}
            >
              Edit Blog Post
            </Typography>
            <Typography variant="body1" sx={{ color: "#666666" }}>
              Update your blog post content and settings
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
              Blog post updated successfully! Redirecting...
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

              {/* Image Upload */}
              <Box>
                <Typography
                  variant="subtitle2"
                  sx={{ mb: 2, fontWeight: 600, color: "#000000" }}
                >
                  Cover Image
                </Typography>
                {imagePreview || existingImageUrl ? (
                  <Box sx={{ position: "relative", display: "inline-block" }}>
                    <Box
                      component="img"
                      src={imagePreview || existingImageUrl}
                      alt="Preview"
                      sx={{
                        maxWidth: "100%",
                        maxHeight: 300,
                        borderRadius: 2,
                        border: "2px solid #E5E7EB",
                      }}
                    />
                    <IconButton
                      onClick={handleRemoveImage}
                      sx={{
                        position: "absolute",
                        top: 8,
                        right: 8,
                        bgcolor: "white",
                        boxShadow: 2,
                        "&:hover": { bgcolor: "#FEE2E2", color: "#EF4444" },
                      }}
                    >
                      <CloseIcon />
                    </IconButton>
                  </Box>
                ) : (
                  <Button
                    component="label"
                    variant="outlined"
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
                )}
              </Box>

              {/* Tags */}
              <Box>
                <Typography
                  variant="subtitle2"
                  sx={{ mb: 2, fontWeight: 600, color: "#000000" }}
                >
                  Tags
                </Typography>
                <Box sx={{ display: "flex", gap: 1, mb: 2 }}>
                  <TextField
                    placeholder="Add a tag"
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyPress={(e) => e.key === "Enter" && handleAddTag()}
                    size="small"
                    sx={{
                      flex: 1,
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
                    startIcon={<Add />}
                    sx={{
                      bgcolor: "#10B981",
                      "&:hover": { bgcolor: "#059669" },
                    }}
                  >
                    Add
                  </Button>
                </Box>
                <Stack direction="row" spacing={1} flexWrap="wrap" gap={1}>
                  {formData.tags.map((tag) => (
                    <Chip
                      key={tag}
                      label={tag}
                      onDelete={() => handleRemoveTag(tag)}
                      sx={{
                        bgcolor: "#ECFDF5",
                        color: "#10B981",
                        fontWeight: 600,
                        border: "1px solid #D1FAE5",
                      }}
                    />
                  ))}
                </Stack>
              </Box>

              {/* Tabs for Content and Preview */}
              <Box>
                <Tabs
                  value={activeTab}
                  onChange={(e, v) => setActiveTab(v)}
                  sx={{
                    mb: 2,
                    borderBottom: 1,
                    borderColor: "divider",
                    "& .MuiTab-root": {
                      fontWeight: 600,
                      "&.Mui-selected": {
                        color: "#10B981",
                      },
                    },
                    "& .MuiTabs-indicator": {
                      backgroundColor: "#10B981",
                    },
                  }}
                >
                  <Tab label="Write" />
                  <Tab label="Preview" />
                </Tabs>

                {activeTab === 0 ? (
                  <TextField
                    name="content"
                    value={formData.content}
                    onChange={handleInputChange}
                    multiline
                    rows={20}
                    fullWidth
                    placeholder="Write your blog content in markdown..."
                    variant="outlined"
                    required
                    sx={{
                      "& .MuiOutlinedInput-root": {
                        fontFamily: "monospace",
                        fontSize: "0.95rem",
                        "&:hover fieldset": {
                          borderColor: "#10B981",
                        },
                        "&.Mui-focused fieldset": {
                          borderColor: "#10B981",
                        },
                      },
                    }}
                  />
                ) : (
                  <Box
                    sx={{
                      p: 3,
                      border: "1px solid #E5E7EB",
                      borderRadius: 2,
                      minHeight: 400,
                      bgcolor: "#FAFAFA",
                      "& h1": { fontSize: "2rem", mb: 2, mt: 3 },
                      "& h2": { fontSize: "1.5rem", mb: 1.5, mt: 2.5 },
                      "& h3": { fontSize: "1.25rem", mb: 1, mt: 2 },
                      "& p": { mb: 2, lineHeight: 1.8 },
                      "& ul, & ol": { mb: 2, pl: 4 },
                      "& li": { mb: 1 },
                      "& code": {
                        bgcolor: "#F3F4F6",
                        px: 1,
                        py: 0.5,
                        borderRadius: 1,
                        fontFamily: "monospace",
                      },
                      "& pre": {
                        bgcolor: "#1F2937",
                        color: "#F9FAFB",
                        p: 2,
                        borderRadius: 2,
                        overflow: "auto",
                      },
                      "& pre code": {
                        bgcolor: "transparent",
                        color: "#10B981",
                      },
                    }}
                  >
                    <ReactMarkdown>{formData.content}</ReactMarkdown>
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
                          backgroundColor: "#10B981",
                        },
                    }}
                  />
                }
                label={
                  <Typography sx={{ fontWeight: 600 }}>
                    {formData.published ? "Published" : "Draft"}
                  </Typography>
                }
              />
            </Stack>
          </Box>

          {/* Action Buttons */}
          <Stack direction="row" spacing={2} justifyContent="flex-end">
            <Button
              startIcon={<Visibility />}
              onClick={handlePreview}
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
              Full Preview
            </Button>
            <Button
              startIcon={<Save />}
              onClick={handleSubmit}
              disabled={saving}
              variant="contained"
              sx={{
                bgcolor: "#10B981",
                color: "white",
                fontWeight: 600,
                px: 4,
                py: 1.5,
                boxShadow: "0 4px 12px rgba(16, 185, 129, 0.3)",
                "&:hover": {
                  bgcolor: "#059669",
                  boxShadow: "0 6px 16px rgba(16, 185, 129, 0.4)",
                },
                "&:disabled": {
                  bgcolor: "#D1FAE5",
                },
              }}
            >
              {saving ? "Saving..." : "Save Changes"}
            </Button>
          </Stack>
        </Container>
      </Box>

      {/* Preview Dialog */}
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
        <DialogContent sx={{ p: 0 }}>
          <BlogView blogData={previewBlogData} isPreview={true} />
        </DialogContent>
        <DialogActions sx={{ p: 2, bgcolor: "#F9FAFB" }}>
          <Button
            onClick={() => setPreviewDialogOpen(false)}
            sx={{
              color: "#666666",
              fontWeight: 600,
              "&:hover": { bgcolor: "#E5E7EB" },
            }}
          >
            Close Preview
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}

export default EditBlog;
