import React, { useState, useEffect, useLayoutEffect, useRef } from 'react';
import { gsap } from 'gsap';
import {
  Box, Paper, Typography, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, Avatar, Button,
  CircularProgress, Alert, Snackbar, Chip, Modal, IconButton,
  Divider, List, ListItem, ListItemIcon, ListItemText, Fade, Backdrop
} from '@mui/material';
import {
  CheckCircleOutline, Block, Info, Close, Email, Phone,
  Home, PersonPin, Fingerprint, Wc
} from '@mui/icons-material';
import axiosInstance from '../../api/baseUrl';
import '../../Styles/ManageModerators.css';

function ManageModerators() {
  const main = useRef();
  const modalContentRef = useRef();
  const [moderators, setModerators] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedModerator, setSelectedModerator] = useState(null);

  // GSAP Animation for the main page content
  useLayoutEffect(() => {
    if (!loading) {
      const ctx = gsap.context(() => {
        gsap.timeline({ delay: 0.2 })
          .from(".manage-moderators-header", { opacity: 0, y: -50, duration: 0.8, ease: 'power3.out' })
          .from(".manage-moderators-table-container, .error-container", { opacity: 0, y: 50, duration: 1, ease: 'expo.out' }, "-=0.6")
          .from(".moderator-table-row", { opacity: 0, y: 30, stagger: 0.1, duration: 0.7, ease: 'power3.out' }, "-=0.7");
      }, main);
      return () => ctx.revert();
    }
  }, [loading]);

  // Data fetching logic
  useEffect(() => {
    const fetchModerators = async () => {
      try {
        setLoading(true);
        setError(null);
        const token = localStorage.getItem('adminToken');
        const response = await axiosInstance.get('/api/moderator', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setModerators(response.data.data);
      } catch (err) {
        setError('Failed to fetch moderators. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    fetchModerators();
  }, []);

  // --- Handler for Activate/Deactivate Functionality ---
  const handleStatusChange = async (moderatorId, newStatus) => {
    const action = newStatus ? 'activate' : 'deactivate';
    try {
      const token = localStorage.getItem('adminToken');
      const response = await axiosInstance.patch(`/api/moderator/${moderatorId}/${action}`, {}, {
        headers: { Authorization: `Bearer ${token}` },
      });
      // Update state locally for instant UI feedback
      setModerators(prevModerators =>
        prevModerators.map(mod =>
          mod._id === moderatorId ? { ...mod, isActive: newStatus } : mod
        )
      );
      setSnackbar({ open: true, message: response.data.message, severity: 'success' });
    } catch (err) {
      const errorMessage = err.response?.data?.message || `Failed to ${action} moderator.`;
      setSnackbar({ open: true, message: errorMessage, severity: 'error' });
      console.error("Update Status Error:", err);
    }
  };

  // GSAP-powered modal opening function
  const handleOpenModal = (moderator) => {
    setSelectedModerator(moderator);
    setModalOpen(true);
    setTimeout(() => {
      gsap.from(modalContentRef.current.querySelectorAll('.modal-header, .modal-list-item'), {
        opacity: 0,
        y: 25,
        stagger: 0.08,
        duration: 0.6,
        ease: 'power3.out'
      });
    }, 10);
  };

  const handleCloseModal = () => setModalOpen(false);
  const handleCloseSnackbar = () => setSnackbar(prev => ({ ...prev, open: false }));

  // Helper for structuring modal details
  const moderatorDetails = selectedModerator ? [
    { icon: <Email />, label: 'Email Address', value: selectedModerator.email },
    { icon: <Phone />, label: 'Phone Number', value: selectedModerator.phone },
    { icon: <Home />, label: 'Address', value: selectedModerator.address },
    { icon: <Fingerprint />, label: 'Aadhaar Number', value: selectedModerator.aadhaarNumber },
    { icon: <PersonPin />, label: 'Voter ID', value: selectedModerator.voterIdNumber },
    { icon: <Wc />, label: 'Gender', value: selectedModerator.gender, cap: true },
  ] : [];

  const renderContent = () => {
    if (loading) {
      return (
        <Box className="loading-container">
          <CircularProgress size={60} />
          <Typography variant="h6" color="text.secondary" sx={{ mt: 2 }}>Loading Moderators...</Typography>
        </Box>
      );
    }
    if (error) {
      return <Alert severity="error" className="error-container">{error}</Alert>;
    }
    if (moderators.length === 0) {
      return <Alert severity="info" className="error-container">No moderators found.</Alert>;
    }
    return (
      <TableContainer component={Paper} className="manage-moderators-table-container">
        <Table sx={{ minWidth: 750 }} aria-label="moderators table">
          <TableHead>
            <TableRow className="moderator-table-header">
              <TableCell>Moderator</TableCell>
              <TableCell>Contact</TableCell>
              <TableCell align="center">Status</TableCell>
              <TableCell align="center">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {moderators.map((moderator) => (
              <TableRow key={moderator._id} hover className="moderator-table-row">
                <TableCell>
                  <Box className="moderator-info-cell">
                    <Avatar src={`http://localhost:5001${moderator.profileImage}`} alt={`${moderator.firstName} ${moderator.lastName}`} className="moderator-avatar" />
                    <Box>
                      <Typography variant="body1" fontWeight="bold">{moderator.firstName} {moderator.lastName}</Typography>
                      <Typography variant="body2" color="text.secondary">ID: {moderator._id}</Typography>
                    </Box>
                  </Box>
                </TableCell>
                <TableCell>
                  <Typography variant="body2">{moderator.email}</Typography>
                  <Typography variant="body2" color="text.secondary">{moderator.phone}</Typography>
                </TableCell>
                <TableCell align="center">
                  <Chip label={moderator.isActive ? 'Active' : 'Deactivated'} color={moderator.isActive ? 'success' : 'error'} size="small" />
                </TableCell>
                <TableCell align="center">
                  <Box className="moderator-actions">
                    <Button variant="outlined" color="info" size="small" startIcon={<Info />} onClick={() => handleOpenModal(moderator)}>Details</Button>
                    {moderator.isActive ? (
                      <Button variant="contained" color="error" size="small" startIcon={<Block />} onClick={() => handleStatusChange(moderator._id, false)}>Deactivate</Button>
                    ) : (
                      <Button variant="contained" color="success" size="small" startIcon={<CheckCircleOutline />} onClick={() => handleStatusChange(moderator._id, true)}>Activate</Button>
                    )}
                  </Box>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    );
  };

  return (
    <Box className="manage-moderators-container" ref={main}>
      <Box className="manage-moderators-header">
        <Typography variant="h4" component="h1" gutterBottom>Manage Moderators</Typography>
      </Box>
      
      {renderContent()}

      <Modal open={modalOpen} onClose={handleCloseModal} closeAfterTransition slots={{ backdrop: Backdrop }} slotProps={{ backdrop: { timeout: 500, className: "modal-backdrop" }}}>
        <Fade in={modalOpen}>
          <Box className="moderator-details-modal" ref={modalContentRef}>
            <IconButton onClick={handleCloseModal} className="modal-close-button"><Close /></IconButton>
            {selectedModerator && (
              <>
                <Box className="modal-header">
                  <Avatar src={`http://localhost:5001${selectedModerator.profileImage}`} className="modal-avatar" />
                  <Box>
                    <Typography variant="h6" component="h2">{selectedModerator.firstName} {selectedModerator.lastName}</Typography>
                    <Chip label={selectedModerator.isActive ? 'Active' : 'Deactivated'} color={selectedModerator.isActive ? 'success' : 'error'} size="small" />
                  </Box>
                </Box>
                <Divider />
                <List className="modal-list">
                  {moderatorDetails.map((item, index) => (
                    <ListItem key={index} className="modal-list-item">
                      <ListItemIcon className="modal-list-icon">{item.icon}</ListItemIcon>
                      <ListItemText
                        primary={item.label}
                        secondary={item.value}
                        primaryTypographyProps={{ fontWeight: '600' }}
                        className={item.cap ? 'capitalize' : ''}
                      />
                    </ListItem>
                  ))}
                </List>
              </>
            )}
          </Box>
        </Fade>
      </Modal>

      <Snackbar open={snackbar.open} autoHideDuration={6000} onClose={handleCloseSnackbar} anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}>
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} sx={{ width: '100%' }}>{snackbar.message}</Alert>
      </Snackbar>
    </Box>
  );
}

export default ManageModerators;