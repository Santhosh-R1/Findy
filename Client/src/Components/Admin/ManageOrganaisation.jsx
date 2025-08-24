import React, { useState, useEffect, useLayoutEffect, useRef } from 'react';
import { gsap } from 'gsap';
import {
  Box, Paper, Typography, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Avatar, Button, CircularProgress, Alert, Snackbar,
  Chip, Modal, IconButton, Divider, List, ListItem, ListItemIcon, ListItemText,
  Fade, Backdrop
} from '@mui/material';
import {
  CheckCircleOutline, Block, Info, Close, Business, Person,
  Email, Language, LocationOn, ConfirmationNumber
} from '@mui/icons-material';
import axiosInstance from '../../api/baseUrl';
import '../../Styles/ManageOrganaisation.css';

function ManageOrganaisation() {
  const main = useRef();
  const modalContentRef = useRef(); 
  const [organisations, setOrganisations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedOrg, setSelectedOrg] = useState(null);

  useLayoutEffect(() => {
    if (!loading) {
      const ctx = gsap.context(() => {
        gsap.timeline({ delay: 0.2 })
          .from(".manage-org-header", { opacity: 0, y: -50, duration: 0.8, ease: 'power3.out' })
          .from(".manage-org-table-container, .error-container", { opacity: 0, y: 50, duration: 1, ease: 'expo.out' }, "-=0.6")
          .from(".org-table-row", { opacity: 0, y: 30, stagger: 0.1, duration: 0.7, ease: 'power3.out' }, "-=0.7");
      }, main);
      return () => ctx.revert();
    }
  }, [loading]);

  useEffect(() => {
    const fetchOrganisations = async () => {
      try {
        setLoading(true);
        setError(null);
        const token = localStorage.getItem('adminToken');
        const response = await axiosInstance.get('/api/organaisation', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setOrganisations(response.data.data);
      } catch (err) {
        setError('Failed to fetch organisations. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    fetchOrganisations();
  }, []);

  const handleStatusChange = async (orgId, newStatus) => {
    const action = newStatus ? 'activate' : 'deactivate';
    try {
      const token = localStorage.getItem('adminToken');
      const response = await axiosInstance.patch(`/api/organaisation/${orgId}/${action}`, {}, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setOrganisations(prev =>
        prev.map(org => (org._id === orgId ? { ...org, isActive: newStatus } : org))
      );
      setSnackbar({ open: true, message: response.data.message, severity: 'success' });
    } catch (err) {
      const errorMessage = err.response?.data?.message || `Failed to ${action} organisation.`;
      setSnackbar({ open: true, message: errorMessage, severity: 'error' });
    }
  };

  const handleOpenModal = (organisation) => {
    setSelectedOrg(organisation);
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

  const orgDetails = selectedOrg ? [
    { icon: <Business />, label: 'Type', value: selectedOrg.organisationType },
    { icon: <Person />, label: 'Contact Person', value: selectedOrg.contactPerson },
    { icon: <Email />, label: 'Email', value: selectedOrg.email },
    { icon: <Language />, label: 'Website', value: <a href={selectedOrg.website} target="_blank" rel="noopener noreferrer">{selectedOrg.website || 'N/A'}</a> },
    { icon: <LocationOn />, label: 'Address', value: selectedOrg.address },
    { icon: <ConfirmationNumber />, label: 'Business ID', value: selectedOrg.registrationId || 'N/A' },
  ] : [];

  const renderContent = () => {
    if (loading) {
      return (
        <Box className="loading-container">
          <CircularProgress size={60} />
          <Typography variant="h6" color="text.secondary" sx={{ mt: 2 }}>Loading Organisations...</Typography>
        </Box>
      );
    }
    if (error) {
      return <Alert severity="error" className="error-container">{error}</Alert>;
    }
    if (organisations.length === 0) {
      return <Alert severity="info" className="error-container">No organisations found.</Alert>;
    }
    return (
      <TableContainer component={Paper} className="manage-org-table-container">
        <Table sx={{ minWidth: 750 }} aria-label="organisations table">
          <TableHead>
            <TableRow className="org-table-header">
              <TableCell>Organisation</TableCell>
              <TableCell>Contact Person</TableCell>
              <TableCell align="center">Status</TableCell>
              <TableCell align="center">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {organisations.map((org) => (
              <TableRow key={org._id} hover className="org-table-row">
                <TableCell component="th" scope="row">
                  <Box className="org-info-cell">
                    <Avatar src={`http://localhost:5001${org.organisationLogo}`} alt={org.organisationName} className="org-avatar" variant="rounded" />
                    <Box>
                      <Typography variant="body1" fontWeight="bold">{org.organisationName}</Typography>
                      <Typography variant="body2" color="text.secondary">{org.organisationType}</Typography>
                    </Box>
                  </Box>
                </TableCell>
                <TableCell>
                  <Typography variant="body2">{org.contactPerson}</Typography>
                  <Typography variant="body2" color="text.secondary">{org.email}</Typography>
                </TableCell>
                <TableCell align="center">
                  <Chip label={org.isActive ? 'Active' : 'Deactivated'} color={org.isActive ? 'success' : 'error'} size="small" />
                </TableCell>
                <TableCell align="center">
                  <Box className="org-actions">
                    <Button variant="outlined" color="info" size="small" startIcon={<Info />} onClick={() => handleOpenModal(org)}> Details </Button>
                    {org.isActive ? (
                      <Button variant="contained" color="error" size="small" startIcon={<Block />} onClick={() => handleStatusChange(org._id, false)}> Deactivate </Button>
                    ) : (
                      <Button variant="contained" color="success" size="small" startIcon={<CheckCircleOutline />} onClick={() => handleStatusChange(org._id, true)}> Activate </Button>
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
    <Box className="manage-org-container" ref={main}>
      <Box className="manage-org-header">
        <Typography variant="h4" component="h1" gutterBottom>Manage Organisations</Typography>
      </Box>
      
      {renderContent()}

      <Modal
        open={modalOpen}
        onClose={handleCloseModal}
        closeAfterTransition
        slots={{ backdrop: Backdrop }}
        slotProps={{
          backdrop: { timeout: 500, className: "modal-backdrop" },
        }}
      >
        <Fade in={modalOpen}>
          <Box className="org-details-modal" ref={modalContentRef}>
            <IconButton onClick={handleCloseModal} className="modal-close-button"><Close /></IconButton>
            
            {selectedOrg && (
              <>
                <Box className="modal-header">
                  <Avatar src={`http://localhost:5001${selectedOrg.organisationLogo}`} className="modal-avatar" variant="rounded" />
                  <Box>
                    <Typography variant="h6" component="h2">{selectedOrg.organisationName}</Typography>
                    <Chip label={selectedOrg.isActive ? 'Active' : 'Deactivated'} color={selectedOrg.isActive ? 'success' : 'error'} size="small" />
                  </Box>
                </Box>
                <Divider />
                <List className="modal-list">
                  {orgDetails.map((item, index) => (
                    <ListItem key={index} className="modal-list-item">
                      <ListItemIcon className="modal-list-icon">{item.icon}</ListItemIcon>
                      <ListItemText 
                        primary={item.label} 
                        secondary={item.value} 
                        primaryTypographyProps={{ fontWeight: '600' }}
                      />
                    </ListItem>
                  ))}
                </List>
              </>
            )}
          </Box>
        </Fade>
      </Modal>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} sx={{ width: '100%' }}>{snackbar.message}</Alert>
      </Snackbar>
    </Box>
  );
}

export default ManageOrganaisation;