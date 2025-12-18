import { useState, useEffect } from "react";
import {
  Container,
  Typography,
  TextField,
  Box,
  Chip,
  InputAdornment,
  CircularProgress,
  Pagination,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import { useNavigate } from "react-router-dom";
import { diseaseAPI } from "../../services/diseaseAPI";
import DiseaseCard from "../../components/diagnosis/DiseaseCard";
import NavBar from "../../components/layout/NavBar";
import Footer from "../../components/landingPageComponents/Footer";
import { DIAGNOSIS_CATEGORIES } from "../../const/disease";
import logger from "../../utils/logger";

function DiagnosisMain() {
  const navigate = useNavigate();
  const [diseases, setDiseases] = useState([]);
  const [filteredDiseases, setFilteredDiseases] = useState([]);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const itemsPerPage = 8;

  const categories = DIAGNOSIS_CATEGORIES;


  const fetchDiseases = async () => {
    try {
      setLoading(true);
      const response = await diseaseAPI.getDiseases();
      setDiseases(response.data || response);
      setFilteredDiseases(response.data || response);
    } catch (error) {
      logger.error("Error fetching diseases:", error);
    } finally {
      setLoading(false);
    }
  };

  const filterDiseases = () => {
    let filtered = diseases;

    // Filter by category
    if (category !== "all" && category !== "All") {
      filtered = filtered.filter(
        (disease) => disease.category.toLowerCase() === category.toLowerCase()
      );
    }

    // Filter by search
    if (search.trim()) {
      const searchLower = search.toLowerCase();
      filtered = filtered.filter(
        (disease) =>
          disease.name.toLowerCase().includes(searchLower) ||
          disease.description?.toLowerCase().includes(searchLower)
      );
    }

    setFilteredDiseases(filtered);
  };

    useEffect(() => {
    fetchDiseases();
  }, []);

  useEffect(() => {
    filterDiseases();
    setPage(1); // Reset to first page when filters change
  }, [search, category, diseases, filterDiseases]);


  const handleCategoryChange = (selectedCategory) => {
    setCategory(selectedCategory);
  };

  const handlePageChange = (event, value) => {
    setPage(value);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDiseaseClick = (disease) => {
    navigate(`/diagnosis/${disease.id}/modality`);
  };

  // Paginate filtered diseases
  const totalPages = Math.ceil(filteredDiseases.length / itemsPerPage);
  const paginatedDiseases = filteredDiseases.slice(
    (page - 1) * itemsPerPage,
    page * itemsPerPage
  );

  return (
    <Box sx={{ backgroundColor: "#F8F9FA", minHeight: "100vh" }}>
      <NavBar />

      <Container maxWidth="xl" sx={{ py: 6 }}>
        {/* Header Section */}
        <Box sx={{ mb: 5 }}>
          <Typography
            variant="h3"
            gutterBottom
            sx={{ fontWeight: 600, color: "#2C3E50", mb: 1 }}
          >
            Disease Diagnosis Platform
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
            Select a disease to begin diagnosis with AI-powered models
          </Typography>

          {/* Search Bar */}
          <TextField
            fullWidth
            placeholder="Search diseases..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
            sx={{
              mb: 3,
              backgroundColor: "white",
              borderRadius: 1,
              "& .MuiOutlinedInput-root": {
                borderRadius: 1,
              },
            }}
          />

          {/* Category Filter Chips */}
          <Box sx={{ display: "flex", gap: 1.5, flexWrap: "wrap" }}>
            {categories.map((cat) => (
              <Chip
                key={cat}
                label={cat}
                color={
                  category === cat || (category === "all" && cat === "All")
                    ? "primary"
                    : "default"
                }
                onClick={() =>
                  handleCategoryChange(cat === "All" ? "all" : cat)
                }
                sx={{
                  cursor: "pointer",
                  fontSize: "0.875rem",
                  fontWeight: 500,
                  borderRadius: 1,
                  backgroundColor:
                    category === cat || (category === "all" && cat === "All")
                      ? "#10B981"
                      : "white",
                  color:
                    category === cat || (category === "all" && cat === "All")
                      ? "white"
                      : "#5D6D7E",
                  "&:hover": {
                    backgroundColor:
                      category === cat || (category === "all" && cat === "All")
                        ? "#059669"
                        : "#ECFDF5",
                  },
                }}
              />
            ))}
          </Box>
        </Box>

        {/* Loading State */}
        {loading && (
          <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
            <CircularProgress />
          </Box>
        )}

        {/* No Results */}
        {!loading && filteredDiseases.length === 0 && (
          <Box sx={{ textAlign: "center", py: 8 }}>
            <Typography variant="h6" color="text.secondary">
              No diseases found matching your criteria
            </Typography>
          </Box>
        )}

        {/* Disease Grid */}
        {!loading && filteredDiseases.length > 0 && (
          <Box sx={{ display: "flex", flexWrap: "wrap", gap: 3 }}>
            {paginatedDiseases.map((disease) => (
              <Box
                key={disease.id}
                sx={{
                  flex: {
                    xs: "0 0 100%",
                    sm: "0 0 calc(50% - 12px)",
                    md: "0 0 calc(33.333% - 16px)",
                    lg: "0 0 calc(25% - 18px)",
                  },
                  minWidth: 0,
                }}
              >
                <DiseaseCard 
                  disease={disease} 
                  onClick={handleDiseaseClick}
                />
              </Box>
            ))}
          </Box>
        )}

        {/* Pagination */}
        {!loading && filteredDiseases.length > 0 && totalPages > 1 && (
          <Box
            sx={{
              display: "flex",
              justifyContent: "center",
              mt: 6,
              mb: 4,
            }}
          >
            <Pagination
              count={totalPages}
              page={page}
              onChange={handlePageChange}
              color="primary"
              size="large"
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

        {/* About Section */}
        <Box
          sx={{
            mt: 8,
            mb: 6,
            py: 6,
            px: 4,
            backgroundColor: "white",
            borderRadius: 3,
            border: "1px solid #E8EAED",
            textAlign: "center",
          }}
        >
          <Typography
            variant="h4"
            sx={{
              fontWeight: 600,
              color: "#2C3E50",
              mb: 3,
            }}
          >
            Why Choose DeepMed?
          </Typography>
          <Typography
            variant="body1"
            sx={{
              color: "#5D6D7E",
              mb: 4,
              maxWidth: 800,
              mx: "auto",
              lineHeight: 1.8,
            }}
          >
            DeepMed is an advanced AI-powered diagnostic platform that combines
            cutting-edge machine learning models with medical expertise to
            provide accurate disease predictions. Our platform supports multiple
            diagnostic modalities including MRI, CT scans, X-rays, and
            laboratory data analysis.
          </Typography>
          <Box
            sx={{
              display: "flex",
              justifyContent: "center",
              gap: 6,
              flexWrap: "wrap",
              mt: 4,
            }}
          >
            <Box sx={{ textAlign: "center" }}>
              <Typography
                variant="h3"
                sx={{ fontWeight: 700, color: "#10B981", mb: 1 }}
              >
                15+
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Disease Categories
              </Typography>
            </Box>
            <Box sx={{ textAlign: "center" }}>
              <Typography
                variant="h3"
                sx={{ fontWeight: 700, color: "#10B981", mb: 1 }}
              >
                50+
              </Typography>
              <Typography variant="body2" color="text.secondary">
                AI Models
              </Typography>
            </Box>
            <Box sx={{ textAlign: "center" }}>
              <Typography
                variant="h3"
                sx={{ fontWeight: 700, color: "#10B981", mb: 1 }}
              >
                95%+
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Accuracy Rate
              </Typography>
            </Box>
          </Box>
        </Box>
      </Container>

      <Footer />
    </Box>
  );
}

export default DiagnosisMain;
