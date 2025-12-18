import {
  Card,
  CardContent,
  CardMedia,
  Typography,
  Button,
  Chip,
  Box,
  Stack,
  IconButton,
} from "@mui/material";
import {
  CalendarToday,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as VisibilityIcon,
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import PropTypes from "prop-types";

const BlogCard = ({ 
  blog, 
  showAdminActions = false, 
  onEdit, 
  onDelete, 
  onView 
}) => {
  const navigate = useNavigate();

  const handleCardClick = () => {
    if (onView) {
      onView(blog.slug);
    } else {
      navigate(`/blogs/${blog.slug}`);
    }
  };

  const handleEditClick = (e) => {
    e.stopPropagation();
    if (onEdit) onEdit(blog.id);
  };

  const handleDeleteClick = (e) => {
    e.stopPropagation();
    if (onDelete) onDelete(blog);
  };

  const handleViewClick = (e) => {
    e.stopPropagation();
    if (onView) onView(blog.slug);
  };

  const truncateText = (text, maxLength) => {
    if (!text) return "";
    const plainText = text.replace(/<[^>]*>/g, "");
    return plainText.length > maxLength ? plainText.slice(0, maxLength) + "..." : plainText;
  };

  return (
    <Card
      sx={{
        height: "100%",
        display: "flex",
        flexDirection: "column",
        cursor: "pointer",
        borderRadius: "8px",
        border: "1px solid #E8EAED",
        boxShadow: "none",
        transition: "all 0.2s ease",
        backgroundColor: "#FFFFFF",
        "&:hover": {
          transform: "translateY(-2px)",
          boxShadow: "0 2px 8px rgba(44, 62, 80, 0.08)",
          borderColor: "#D1D5DB",
        },
      }}
      onClick={!showAdminActions ? handleCardClick : undefined}
    >
      {/* Image */}
      <Box
        sx={{
          position: "relative",
          height: "200px",
          overflow: "hidden",
        }}
      >
        {blog.image_url ? (
          <CardMedia
            component="img"
            image={blog.image_url}
            alt={blog.title}
            sx={{
              width: "100%",
              height: "200px",
              objectFit: "cover",
              objectPosition: "center",
              transition: "transform 0.3s ease",
              "&:hover": {
                transform: "scale(1.05)",
              },
            }}
          />
        ) : (
          <Box
            sx={{
              width: "100%",
              height: "200px",
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
      </Box>

      {/* Content */}
      <CardContent
        sx={{
          p: 2.5,
          flexGrow: 1,
          display: "flex",
          flexDirection: "column",
        }}
      >
        {/* Title */}
        <Typography
          variant="h6"
          gutterBottom
          sx={{
            mb: 1.5,
            lineHeight: 1.4,
            minHeight: "2.2em",
            display: "-webkit-box",
            WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
            fontSize: "1rem",
            fontWeight: 600,
            color: "#1E293B",
          }}
        >
          {blog.title}
        </Typography>

        {/* Summary/Content Preview */}
        <Typography
          variant="body2"
          sx={{
            mb: 2,
            color: "#64748B",
            lineHeight: 1.6,
            display: "-webkit-box",
            WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
          }}
        >
          {truncateText(blog.summary || blog.content, 120)}
        </Typography>

        {/* Author, Date and Tags in one line - Same for both views */}
        <Box sx={{ display: "flex", alignItems: "center", gap: 1, flexWrap: "wrap", mb: 2 }}>
          {/* Author */}
          {blog.author_name && (
            <>
              <Typography
                variant="caption"
                sx={{ 
                  color: "#64748B", 
                  fontWeight: 500,
                }}
              >
                {blog.author_name}
              </Typography>
              <Box sx={{ width: "4px", height: "4px", borderRadius: "50%", bgcolor: "#D1D5DB" }} />
            </>
          )}
          
          {/* Date */}
          <Typography
            variant="caption"
            sx={{ 
              color: "#64748B", 
              fontWeight: 500,
              display: "flex",
              alignItems: "center",
              gap: 0.5,
            }}
          >
            <CalendarToday sx={{ fontSize: "0.875rem" }} />
            {new Date(blog.created_at).toLocaleDateString("en-US", {
              year: "numeric",
              month: "short",
              day: "numeric",
            })}
          </Typography>
          
          {/* Separator */}
          {blog.tags?.length > 0 && (
            <Box sx={{ width: "4px", height: "4px", borderRadius: "50%", bgcolor: "#D1D5DB" }} />
          )}
          
          {/* Tags */}
          {blog.tags?.length > 0 && (
            <>
              {blog.tags.slice(0, 2).map((tag) => (
                <Chip
                  key={tag}
                  label={tag}
                  size="small"
                  sx={{
                    bgcolor: "#ECFDF5",
                    color: "#10B981",
                    fontSize: "0.7rem",
                    height: 20,
                    border: "1px solid #D1FAE5",
                    fontWeight: 600,
                  }}
                />
              ))}
              {blog.tags.length > 2 && (
                <Chip
                  label={`+${blog.tags.length - 2}`}
                  size="small"
                  sx={{
                    bgcolor: "#F3F4F6",
                    color: "#64748B",
                    fontSize: "0.7rem",
                    height: 20,
                  }}
                />
              )}
            </>
          )}
        </Box>

        {/* Spacer to push content to bottom */}
        <Box sx={{ flexGrow: 1 }} />

        {/* Action Buttons - Only difference between views */}
        {showAdminActions && (
          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mt: "auto" }}>
            <Button
              size="small"
              startIcon={<VisibilityIcon />}
              onClick={handleViewClick}
              sx={{
                color: "#10B981",
                fontWeight: 600,
                textTransform: "none",
                "&:hover": { bgcolor: "#ECFDF5" },
              }}
            >
              View
            </Button>
            <Stack direction="row" spacing={1}>
              <IconButton
                size="small"
                onClick={handleEditClick}
                sx={{
                  color: "#64748B",
                  "&:hover": { 
                    bgcolor: "#F1F5F9",
                    color: "#10B981" 
                  },
                }}
              >
                <EditIcon fontSize="small" />
              </IconButton>
              <IconButton
                size="small"
                onClick={handleDeleteClick}
                sx={{
                  color: "#64748B",
                  "&:hover": { 
                    bgcolor: "#FEE2E2",
                    color: "#EF4444" 
                  },
                }}
              >
                <DeleteIcon fontSize="small" />
              </IconButton>
            </Stack>
          </Box>
        )}
      </CardContent>
    </Card>
  );
};

BlogCard.propTypes = {
  blog: PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    slug: PropTypes.string.isRequired,
    title: PropTypes.string.isRequired,
    summary: PropTypes.string,
    content: PropTypes.string,
    image_url: PropTypes.string,
    created_at: PropTypes.string.isRequired,
    published: PropTypes.bool,
    tags: PropTypes.arrayOf(PropTypes.string),
    author_name: PropTypes.string,
    author: PropTypes.shape({
      email: PropTypes.string,
    }),
  }).isRequired,
  showAdminActions: PropTypes.bool,
  onEdit: PropTypes.func,
  onDelete: PropTypes.func,
  onView: PropTypes.func,
};

export default BlogCard;