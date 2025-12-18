import {
  Box,
  Button,
  Chip,
  IconButton,
  InputAdornment,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";
import {
  Add,
  Cancel,
  CheckCircle,
  Delete,
  Edit,
  Search,
} from "@mui/icons-material";
import { useState } from "react";
import { CATEGORY_OPTIONS } from "../../../const/disease";

function DiseaseTable({ diseases, onEdit, onDelete, onToggleActive }) {
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const filteredDiseases = diseases.filter((disease) => {
    const matchesSearch = disease.name
      ?.toLowerCase()
      .includes(search.toLowerCase());
    const matchesCategory =
      categoryFilter === "all" || disease.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  return (
    <Box>
      {/* Search and Filters */}
      <Box sx={{ mb: 3 }}>
        <TextField
          fullWidth
          placeholder="Search diseases..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Search sx={{ color: "#6B7280", fontSize: 28 }} />
              </InputAdornment>
            ),
          }}
          sx={{
            mb: 3,
            "& .MuiOutlinedInput-root": {
              backgroundColor: "white",
              fontSize: "1.1rem",
              "& fieldset": { borderColor: "#E5E7EB" },
              "&:hover fieldset": { borderColor: "#10B981" },
              "&.Mui-focused fieldset": {
                borderColor: "#10B981",
                borderWidth: 2,
              },
            },
            "& .MuiInputBase-input": { py: 2 },
          }}
        />

        <Box
          sx={{
            display: "flex",
            gap: 1.5,
            flexWrap: "wrap",
            alignItems: "center",
          }}
        >
          <Chip
            label="All"
            onClick={() => setCategoryFilter("all")}
            sx={{
              px: 1,
              fontSize: "0.95rem",
              fontWeight: 500,
              backgroundColor: categoryFilter === "all" ? "#10B981" : "#F3F4F6",
              color: categoryFilter === "all" ? "white" : "#6B7280",
              border: "none",
              "&:hover": {
                backgroundColor:
                  categoryFilter === "all" ? "#059669" : "#E5E7EB",
              },
            }}
          />
          {CATEGORY_OPTIONS.map((cat) => (
            <Chip
              key={cat}
              label={cat}
              onClick={() => setCategoryFilter(cat)}
              sx={{
                px: 1,
                fontSize: "0.95rem",
                fontWeight: 500,
                backgroundColor:
                  categoryFilter === cat ? "#10B981" : "#F3F4F6",
                color: categoryFilter === cat ? "white" : "#6B7280",
                border: "none",
                "&:hover": {
                  backgroundColor:
                    categoryFilter === cat ? "#059669" : "#E5E7EB",
                },
              }}
            />
          ))}
          <Box sx={{ flexGrow: 1 }} />
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={() => onEdit(null)}
            sx={{
              backgroundColor: "#10B981",
              px: 3,
              "&:hover": { backgroundColor: "#059669" },
            }}
          >
            Add Disease
          </Button>
        </Box>
      </Box>

      {/* Table */}
      <Paper sx={{ borderRadius: 2 }}>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow sx={{ backgroundColor: "#ECFDF5" }}>
                <TableCell sx={{ fontWeight: 600 }}>Disease Name</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Category</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Modalities</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Status</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredDiseases.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} align="center" sx={{ py: 8 }}>
                    <Typography variant="body1" color="text.secondary">
                      No diseases found
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                filteredDiseases
                  .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                  .map((disease) => (
                    <TableRow
                      key={disease.id}
                      sx={{ "&:hover": { backgroundColor: "#F8F9FA" } }}
                    >
                      <TableCell>
                        <Typography variant="subtitle2">
                          {disease.name}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {disease.description}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={disease.category || "N/A"}
                          size="small"
                          sx={{
                            backgroundColor: "#ECFDF5",
                            color: "#10B981",
                          }}
                        />
                      </TableCell>
                      <TableCell>
                        <Box display="flex" gap={0.5} flexWrap="wrap">
                          {(disease.available_modalities || []).map((mod) => (
                            <Chip
                              key={mod}
                              label={mod}
                              size="small"
                              variant="outlined"
                            />
                          ))}
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Tooltip title="Click to toggle status">
                          {disease.is_active ? (
                            <Chip
                              icon={<CheckCircle />}
                              label="Active"
                              color="success"
                              size="small"
                              onClick={() => onToggleActive(disease.id)}
                              sx={{ cursor: "pointer" }}
                            />
                          ) : (
                            <Chip
                              icon={<Cancel />}
                              label="Inactive"
                              color="default"
                              size="small"
                              onClick={() => onToggleActive(disease.id)}
                              sx={{ cursor: "pointer" }}
                            />
                          )}
                        </Tooltip>
                      </TableCell>
                      <TableCell>
                        <Tooltip title="Edit">
                          <IconButton
                            size="small"
                            onClick={() => onEdit(disease)}
                            sx={{ color: "#10B981" }}
                          >
                            <Edit fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Delete">
                          <IconButton
                            size="small"
                            color="error"
                            onClick={() => onDelete(disease.id)}
                          >
                            <Delete fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                  ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
        <TablePagination
          rowsPerPageOptions={[5, 10, 25]}
          component="div"
          count={filteredDiseases.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={(e, newPage) => setPage(newPage)}
          onRowsPerPageChange={(e) => {
            setRowsPerPage(parseInt(e.target.value, 10));
            setPage(0);
          }}
          sx={{ borderTop: "1px solid #E8EAED" }}
        />
      </Paper>
    </Box>
  );
}

export default DiseaseTable;
