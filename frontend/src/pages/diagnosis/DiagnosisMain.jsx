import { useState, useEffect } from "react";
import {
  Container,
  Typography,
  TextField,
  Box,
  Grid,
  Chip,
  InputAdornment,
  CircularProgress,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import { diagnosisAPI } from "../../services/diagnosisAPI";
import DiseaseCard from "../../components/diagnosis/DiseaseCard";
import NavBar from "../../components/layout/NavBar";

function DiagnosisMain() {
  const [diseases, setDiseases] = useState([]);
  const [filteredDiseases, setFilteredDiseases] = useState([]);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");
  const [loading, setLoading] = useState(true);

  const categories = [
    "All",
    "Cardiovascular",
    "Hepatic",
    "Neurological",
    "Respiratory",
    "Oncology",
    "Metabolic",
  ];

  useEffect(() => {
    fetchDiseases();
  }, []);

  useEffect(() => {
    filterDiseases();
  }, [search, category, diseases]);

  const fetchDiseases = async () => {
    try {
      setLoading(true);
      const response = await diagnosisAPI.getDiseases();
      setDiseases(response.data);
      setFilteredDiseases(response.data);
    } catch (error) {
      console.error("Error fetching diseases:", error);
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

  const handleCategoryChange = (selectedCategory) => {
    setCategory(selectedCategory);
  };

  return (
    <Box sx={{ backgroundColor: "#F0F4F8", minHeight: "100vh" }}>
      <NavBar />

      <Container maxWidth="xl" sx={{ py: 4 }}>
        {/* Header Section */}
        <Box sx={{ mb: 4 }}>
          <Typography
            variant="h3"
            gutterBottom
            sx={{ fontWeight: 700, color: "#1976d2" }}
          >
            Disease Diagnosis Platform
          </Typography>
          <Typography variant="h6" color="text.secondary" sx={{ mb: 3 }}>
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
              borderRadius: 2,
              "& .MuiOutlinedInput-root": {
                borderRadius: 2,
              },
            }}
          />

          {/* Category Filter Chips */}
          <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
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
                  fontSize: "0.9rem",
                  "&:hover": {
                    backgroundColor:
                      category === cat ? undefined : "action.hover",
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
          <Grid container spacing={3}>
            {filteredDiseases.map((disease) => (
              <Grid item xs={12} sm={6} md={4} lg={3} key={disease.id}>
                <DiseaseCard disease={disease} />
              </Grid>
            ))}
          </Grid>
        )}
      </Container>
    </Box>
  );
}

export default DiagnosisMain;
