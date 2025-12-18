import {
  Box,
  Button,
  Chip,
  FormControl,
  IconButton,
  InputAdornment,
  MenuItem,
  Paper,
  Select,
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
  Cancel,
  CheckCircle,
  Delete,
  Edit,
  Search,
  Upload,
} from "@mui/icons-material";
import { useState } from "react";
import { MODALITY_OPTIONS } from "../../../const/disease";

function ClassifierTable({ classifiers, diseases, onEdit, onDelete }) {
  const [search, setSearch] = useState("");
  const [diseaseFilter, setDiseaseFilter] = useState("all");
  const [modalityFilter, setModalityFilter] = useState("all");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const filteredClassifiers = classifiers.filter((classifier) => {
    const matchesSearch = classifier.name
      ?.toLowerCase()
      .includes(search.toLowerCase());
    const matchesDisease =
      diseaseFilter === "all" ||
      classifier.disease_id === parseInt(diseaseFilter);
    const matchesModality =
      modalityFilter === "all" || classifier.modality === modalityFilter;
    return matchesSearch && matchesDisease && matchesModality;
  });

  return (
    <Box>
      {/* Search and Filters */}
      <Box sx={{ mb: 3 }}>
        <TextField
          fullWidth
          placeholder="Search classifiers..."
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
            gap: 2,
            flexWrap: "wrap",
            alignItems: "center",
          }}
        >
          {/* Disease Filter */}
          {diseases.length <= 6 ? (
            <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
              <Chip
                label="All Diseases"
                onClick={() => setDiseaseFilter("all")}
                sx={{
                  px: 1,
                  fontSize: "0.95rem",
                  fontWeight: 500,
                  backgroundColor:
                    diseaseFilter === "all" ? "#10B981" : "#F3F4F6",
                  color: diseaseFilter === "all" ? "white" : "#6B7280",
                  border: "none",
                  "&:hover": {
                    backgroundColor:
                      diseaseFilter === "all" ? "#059669" : "#E5E7EB",
                  },
                }}
              />
              {diseases.map((disease) => (
                <Chip
                  key={disease.id}
                  label={disease.name}
                  onClick={() => setDiseaseFilter(disease.id.toString())}
                  sx={{
                    px: 1,
                    fontSize: "0.95rem",
                    fontWeight: 500,
                    backgroundColor:
                      diseaseFilter === disease.id.toString()
                        ? "#10B981"
                        : "#F3F4F6",
                    color:
                      diseaseFilter === disease.id.toString()
                        ? "white"
                        : "#6B7280",
                    border: "none",
                    "&:hover": {
                      backgroundColor:
                        diseaseFilter === disease.id.toString()
                          ? "#059669"
                          : "#E5E7EB",
                    },
                  }}
                />
              ))}
            </Box>
          ) : (
            <FormControl sx={{ minWidth: 220 }}>
              <Select
                value={diseaseFilter}
                onChange={(e) => setDiseaseFilter(e.target.value)}
                displayEmpty
                sx={{
                  backgroundColor: "white",
                  "& .MuiOutlinedInput-notchedOutline": {
                    borderColor: "#E5E7EB",
                  },
                  "&:hover .MuiOutlinedInput-notchedOutline": {
                    borderColor: "#10B981",
                  },
                  "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                    borderColor: "#10B981",
                  },
                }}
              >
                <MenuItem value="all">All Diseases</MenuItem>
                {diseases.map((disease) => (
                  <MenuItem key={disease.id} value={disease.id.toString()}>
                    {disease.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          )}

          <Box sx={{ width: 1, height: 24, backgroundColor: "#E5E7EB" }} />

          {/* Modality Filter */}
          <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
            <Chip
              label="All Modalities"
              onClick={() => setModalityFilter("all")}
              sx={{
                px: 1,
                fontSize: "0.95rem",
                fontWeight: 500,
                backgroundColor:
                  modalityFilter === "all" ? "#10B981" : "#F3F4F6",
                color: modalityFilter === "all" ? "white" : "#6B7280",
                border: "none",
                "&:hover": {
                  backgroundColor:
                    modalityFilter === "all" ? "#059669" : "#E5E7EB",
                },
              }}
            />
            {MODALITY_OPTIONS.map((mod) => (
              <Chip
                key={mod}
                label={mod}
                onClick={() => setModalityFilter(mod)}
                sx={{
                  px: 1,
                  fontSize: "0.95rem",
                  fontWeight: 500,
                  backgroundColor:
                    modalityFilter === mod ? "#10B981" : "#F3F4F6",
                  color: modalityFilter === mod ? "white" : "#6B7280",
                  border: "none",
                  "&:hover": {
                    backgroundColor:
                      modalityFilter === mod ? "#059669" : "#E5E7EB",
                  },
                }}
              />
            ))}
          </Box>

          <Box sx={{ flexGrow: 1 }} />
          <Button
            variant="contained"
            startIcon={<Upload />}
            onClick={() => onEdit(null)}
            sx={{
              backgroundColor: "#10B981",
              px: 3,
              "&:hover": { backgroundColor: "#059669" },
            }}
          >
            Add Classifier
          </Button>
        </Box>
      </Box>

      {/* Table */}
      <Paper sx={{ borderRadius: 2 }}>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow sx={{ backgroundColor: "#ECFDF5" }}>
                <TableCell sx={{ fontWeight: 600 }}>Classifier Name</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Disease</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Modality</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Model Type</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Accuracy</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Status</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredClassifiers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} align="center" sx={{ py: 8 }}>
                    <Typography variant="body1" color="text.secondary">
                      No classifiers found
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                filteredClassifiers
                  .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                  .map((classifier) => (
                    <TableRow
                      key={classifier.id}
                      sx={{ "&:hover": { backgroundColor: "#F8F9FA" } }}
                    >
                      <TableCell>
                        <Typography variant="subtitle2">
                          {classifier.name}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {classifier.version || "N/A"}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        {classifier.disease_name || "N/A"}
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={classifier.modality}
                          size="small"
                          sx={{
                            backgroundColor: "#ECFDF5",
                            color: "#10B981",
                          }}
                        />
                      </TableCell>
                      <TableCell>{classifier.model_type || "N/A"}</TableCell>
                      <TableCell>
                        <Chip
                          label={`${(classifier.accuracy * 100).toFixed(1)}%`}
                          size="small"
                          color="success"
                        />
                      </TableCell>
                      <TableCell>
                        {classifier.is_active ? (
                          <Chip
                            icon={<CheckCircle />}
                            label="Active"
                            color="success"
                            size="small"
                          />
                        ) : (
                          <Chip
                            icon={<Cancel />}
                            label="Inactive"
                            color="default"
                            size="small"
                          />
                        )}
                      </TableCell>
                      <TableCell>
                        <Tooltip title="Edit">
                          <IconButton
                            size="small"
                            onClick={() => onEdit(classifier)}
                            sx={{ color: "#10B981" }}
                          >
                            <Edit fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Delete">
                          <IconButton
                            size="small"
                            color="error"
                            onClick={() => onDelete(classifier.id)}
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
          count={filteredClassifiers.length}
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

export default ClassifierTable;
