import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  TextField,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Avatar,
  TablePagination,
  useTheme,
  alpha,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  MenuItem,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import SearchIcon from "@mui/icons-material/Search";
import swal from "sweetalert";
import { ImSpinner4 } from "react-icons/im";

function PayerParties() {
  const theme = useTheme();

  // --- States ---
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [openAddDialog, setOpenAddDialog] = useState(false);
  const [loading, setLoading] = useState(false);
  const [parties, setParties] = useState([]);

  // Fetch Data
  useEffect(() => {
    getData();
  }, []);

  const getData = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${import.meta.env.VITE_APP_SERVER}/api/sims/get-payer`, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      });

      const ress = await response?.json();

      if (response.ok) {
        // Map the API data to table format
        const mapped = ress.map((p, i) => ({
          id: i + 1,
          displayName: p.displayName || `${p.firstName} ${p.lastName}`,
          idType: p.idType || "-",
          idValue: p.idValue || "-",
          dateOfBirth: p.dateOfBirth || "-",
          accountType:
            p.extensionList && p.extensionList[0]?.value
              ? p.extensionList[0].value
              : "-",
        }));
        setParties(mapped);
      } else {
        console.error("Failed to fetch parties:", ress);
      }
    } catch (error) {
      console.error("Fetch error:", error);
    } finally {
      setLoading(false);
    }
  };

  // --- Filter logic ---
  const filteredParties = parties.filter(
    (p) =>
      p.displayName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.idValue.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.accountType.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // --- Pagination handlers ---
  const handleChangePage = (_, newPage) => setPage(newPage);
  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  // --- Dialog handlers ---
  const handleOpenDialog = () => setOpenAddDialog(true);
  const handleCloseDialog = () => setOpenAddDialog(false);

  // --- Add Party state ---
  const [newParty, setNewParty] = useState({
    displayName: "",
    firstName: "",
    middleName: "",
    lastName: "",
    dateOfBirth: "",
    idType: "",
    idValue: "",
  });

  const handleAddParty = async () => {
    if (
      !newParty.displayName ||
      !newParty.firstName ||
      !newParty.lastName ||
      !newParty.dateOfBirth ||
      !newParty.idType ||
      !newParty.idValue
    ) {
      swal("Warning!", "Please fill in all fields", "warning");
      return;
    }

    try {
      setLoading(true)
      const response = await fetch(`${import.meta.env.VITE_APP_SERVER}/api/sims/add-payer`, {
        method: "POST",
        headers: {
          "FSPIOP-Source": "payerfsp",
          "Authorization": `Bearer asdfjkl;@123456abcdedfghjklmnopqrst`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newParty),
      });

      if (response.ok) {
        swal("Success", "Party is successfully added.", "success");
        setNewParty({
          displayName: "",
          firstName: "",
          middleName: "",
          lastName: "",
          dateOfBirth: "",
          idType: "",
          idValue: "",
        });
        handleCloseDialog();
        getData();
      } else {
      const ress = await response?.json();
        swal("Failed!", ress?.message || "Failed to create Party!", "error");
      }
    } catch (error) {
      console.log(error);
      swal("Network Error!", "Something went wrong! Try again later.", "error");
    }finally{
      setLoading(false)
    }
  };

  return (
    <Box sx={{ p: { xs: 2, md: 3 } }}>
      {/* Header */}
      <Box
        sx={{
          display: "flex",
          flexDirection: { xs: "column", sm: "row" },
          alignItems: { xs: "stretch", sm: "center" },
          justifyContent: "space-between",
          gap: 2,
          mb: 3,
        }}
      >
        <Typography variant="h5" fontWeight={600}>
          List of <span className="text-blue-400">Payer / Karent Pay</span> Parties
        </Typography>

        <Box
          sx={{
            display: "flex",
            flexDirection: { xs: "column", sm: "row" },
            gap: 1.5,
            alignItems: { xs: "stretch", sm: "center" },
          }}
        >
          <TextField
            size="small"
            variant="outlined"
            placeholder="Search party..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            InputProps={{
              startAdornment: <SearchIcon color="action" sx={{ mr: 1 }} />,
            }}
            sx={{ width: { xs: "100%", sm: 250 } }}
          />

          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleOpenDialog}
            sx={{
              textTransform: "none",
              bgcolor: theme.palette.primary.main,
              "&:hover": { bgcolor: theme.palette.primary.dark },
              width: { xs: "100%", sm: "auto" },
            }}
          >
            Add Party
          </Button>
        </Box>
      </Box>

      {/* Table */}
      <TableContainer
        component={Paper}
        sx={{
          borderRadius: 3,
          overflowX: "auto",
          width: "100%",
        }}
      >
        <Table size="small">
          <TableHead sx={{ bgcolor: alpha(theme.palette.primary.main, 0.08) }}>
            <TableRow>
              <TableCell>#</TableCell>
              <TableCell>Display Name</TableCell>
              <TableCell>ID Type</TableCell>
              <TableCell>ID Value</TableCell>
              {/* <TableCell>Date of Birth</TableCell>
              <TableCell>Account Type</TableCell> */}
            </TableRow>
          </TableHead>

          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={6} align="center">
                  Loading...
                </TableCell>
              </TableRow>
            ) : filteredParties.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} align="center">
                  No data found.
                </TableCell>
              </TableRow>
            ) : (
              filteredParties
                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                .map((party, index) => (
                  <TableRow
                    key={party.id}
                    hover
                    sx={{
                      "&:hover": {
                        backgroundColor: alpha(theme.palette.primary.main, 0.04),
                      },
                      transition: "background 0.2s ease",
                    }}
                  >
                    <TableCell>{page * rowsPerPage + index + 1}</TableCell>
                    <TableCell>
                      <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                        <Avatar
                          sx={{
                            bgcolor: alpha(theme.palette.primary.main, 0.15),
                            color: theme.palette.primary.main,
                            fontSize: 14,
                          }}
                        >
                          {party.displayName?.charAt(0)}
                        </Avatar>
                        <Typography fontWeight={500}>{party.displayName?.substr(0,10)}</Typography>
                      </Box>
                    </TableCell>
                    <TableCell>{party.idType}</TableCell>
                    <TableCell>{party.idValue}</TableCell>
                    {/* <TableCell>{party.dateOfBirth}</TableCell>
                    <TableCell>{party.accountType}</TableCell> */}
                  </TableRow>
                ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Pagination */}
      <TablePagination
        component="div"
        count={filteredParties.length}
        page={page}
        onPageChange={handleChangePage}
        rowsPerPage={rowsPerPage}
        onRowsPerPageChange={handleChangeRowsPerPage}
        rowsPerPageOptions={[5, 10, 25]}
        sx={{ mt: 2 }}
      />

      {/* Add Party Dialog */}
      <Dialog open={openAddDialog} onClose={handleCloseDialog} maxWidth="xs" fullWidth>
        <DialogTitle fontWeight={600}>Add New Party</DialogTitle>
        <DialogContent>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 1 }}>
            <TextField
              label="Display Name"
              variant="outlined"
              value={newParty.displayName}
              onChange={(e) => setNewParty({ ...newParty, displayName: e.target.value })}
              fullWidth
            />
            <TextField
              label="First Name"
              variant="outlined"
              value={newParty.firstName}
              onChange={(e) => setNewParty({ ...newParty, firstName: e.target.value })}
              fullWidth
            />
            <TextField
              label="Middle Name"
              variant="outlined"
              value={newParty.middleName}
              onChange={(e) => setNewParty({ ...newParty, middleName: e.target.value })}
              fullWidth
            />
            <TextField
              label="Last Name"
              variant="outlined"
              value={newParty.lastName}
              onChange={(e) => setNewParty({ ...newParty, lastName: e.target.value })}
              fullWidth
            />
            <TextField
              label="Date of Birth"
              type="date"
              InputLabelProps={{ shrink: true }}
              variant="outlined"
              value={newParty.dateOfBirth}
              onChange={(e) => setNewParty({ ...newParty, dateOfBirth: e.target.value })}
              fullWidth
            />
            <TextField
              label="ID Type"
              select
              variant="outlined"
              value={newParty.idType}
              onChange={(e) => setNewParty({ ...newParty, idType: e.target.value })}
              fullWidth
            >
              <MenuItem value="MSISDN">MSISDN</MenuItem>
            </TextField>
            <TextField
              label="ID Value"
              variant="outlined"
              value={newParty.idValue}
              onChange={(e) => setNewParty({ ...newParty, idValue: e.target.value })}
              type="number"
              fullWidth
            />
          </Box>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button
            variant="contained"
            onClick={handleAddParty}
            sx={{
              textTransform: "none",
              bgcolor: theme.palette.primary.main,
              "&:hover": { bgcolor: theme.palette.primary.dark },
            }}
          >
           {loading ? (
            <div className="flex items-center gap-1.5">
              <ImSpinner4 className="animate-spin" />
            <span>Please waite...</span>
            </div>
           ) : ('Add Party')}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default PayerParties;
