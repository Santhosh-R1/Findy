import React, { useState, useEffect } from 'react';
import { Box, Typography, CircularProgress, Alert, Paper, Chip, Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle } from '@mui/material';
import { Link } from 'react-router-dom';
import { FaPaw, FaLaptop, FaMobileAlt, FaDog, FaCat, FaBarcode, FaPalette, FaEdit, FaExclamationTriangle, FaPlus, FaTrash } from 'react-icons/fa';
import axiosInstance from '../../api/baseUrl';
import '../../Styles/ViewItems.css';

const getIconForSubCategory = (subCategory) => {
  const icons = { phone: <FaMobileAlt />, laptop: <FaLaptop />, dog: <FaDog />, cat: <FaCat /> };
  return icons[subCategory] || <FaPaw />;
};

function ViewItems() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [updatingItemId, setUpdatingItemId] = useState(null);

  const [modalState, setModalState] = useState({
    open: false,
    actionType: null,
    itemId: null,
    itemName: '',
  });

  useEffect(() => {
    const fetchUserItems = async () => {
      try {
        setLoading(true);
        const userInfo = JSON.parse(localStorage.getItem('userInfo'));
        if (!userInfo || !userInfo._id) throw new Error("Authentication error. Please log in again.");

        const response = await axiosInstance.get(`/api/items/user/${userInfo._id}`);
        setItems(response.data.data);
        setError(null);
      } catch (err) {
        console.error("Fetch items error:", err);
        setError(err.response?.data?.message || "Failed to fetch your items.");
      } finally {
        setLoading(false);
      }
    };
    fetchUserItems();
  }, []);

  const handleOpenModal = (actionType, item) => {
    setModalState({
      open: true,
      actionType,
      itemId: item._id,
      itemName: item.mainCategory === 'pets' ? item.petName : item.itemName,
    });
  };

  const handleCloseModal = () => {
    setModalState({ open: false, actionType: null, itemId: null, itemName: '' });
  };

  const handleConfirmAction = () => {
    if (modalState.actionType === 'reportLost') {
      executeReportLost(modalState.itemId);
    } else if (modalState.actionType === 'delete') {
      handleDelete(modalState.itemId);
    }
    handleCloseModal();
  };

  const executeReportLost = async (itemId) => {
    setUpdatingItemId(itemId);
    try {
      await axiosInstance.patch(`/api/items/report-lost/${itemId}`);
      setItems(currentItems =>
        currentItems.map(item =>
          item._id === itemId ? { ...item, status: 'lost' } : item
        )
      );
    } catch (err) {
      console.error("Failed to report item as lost:", err);
      alert(err.response?.data?.message || "An error occurred while reporting the item.");
    } finally {
      setUpdatingItemId(null);
    }
  };

  const handleDelete = async (itemId) => {
    const originalItems = [...items];
    setItems(currentItems => currentItems.filter(item => item._id !== itemId));

    try {
      await axiosInstance.delete(`/api/items/delete/${itemId}`);
    } catch (err) {
      console.error("Failed to delete item:", err);
      setItems(originalItems);
      alert(err.response?.data?.message || "Failed to delete the item. Please try again.");
    }
  };

  const renderContent = () => {
    if (loading) {
      return (
        <Box className="status-container">
          <CircularProgress size={50} sx={{ color: '#19a47a' }} />
          <Typography variant="h6" color="text.secondary" sx={{ mt: 2 }}>Fetching Your Inventory...</Typography>
        </Box>
      );
    }

    if (error) {
      return <Box className="status-container"><Alert severity="error" variant="filled">{error}</Alert></Box>;
    }

    if (items.length === 0) {
      return (
        <Box className="status-container no-items">
          <FaPaw className="no-items-icon" />
          <Typography variant="h5" gutterBottom>Your inventory is empty.</Typography>
          <Typography color="text.secondary">Start securing your valuables by registering them here.</Typography>
          <Button component={Link} to="/user/add-item" variant="contained" className="add-first-item-btn" startIcon={<FaPlus />}>
            Register Your First Item
          </Button>
        </Box>
      );
    }

    return (
      <Box className="items-grid">
        {items.map((item) => (
          <Paper key={item._id} elevation={0} variant="outlined" className="item-card">
            <Box className="card-image-container">
              <img src={`http://localhost:5001/${item.itemImage.replace(/\\/g, '/')}`} alt={item.itemName} className="card-image" />
              <Chip icon={getIconForSubCategory(item.subCategory)} label={item.subCategory} size="small" className="category-chip" />
            </Box>
            <Box className="card-content">
              <Typography variant="h6" className="item-title">{item.mainCategory === 'pets' ? item.petName : item.itemName}</Typography>
              <Typography variant="body2" color="text.secondary" className="item-subtitle">{item.mainCategory === 'pets' ? `Breed: ${item.itemName}` : `Brand: ${item.brand}`}</Typography>
              <Box className="item-details">
                {item.mainCategory === 'electronics' && <Typography variant="caption" className="detail-item"><FaBarcode /> S/N: {item.serialNumber}</Typography>}
                {item.mainCategory === 'pets' && <Typography variant="caption" className="detail-item"><FaPalette /> Color: {item.color}</Typography>}
              </Box>
              <Chip label={item.status} size="small" color={item.status === 'lost' ? 'error' : 'success'} className="status-chip" />
            </Box>
            <Box className="card-actions">
              <Button component={Link} to={`/user/edit-item/${item._id}`} size="small" variant="text" startIcon={<FaEdit />} disabled={item.status === 'lost'}>Edit</Button>
              <Button size="small" variant="outlined" color="error" startIcon={<FaTrash />} onClick={() => handleOpenModal('delete', item)} disabled={item.status === 'lost'}>Delete</Button>
              <Button size="small" variant="contained" color="warning" startIcon={<FaExclamationTriangle />} onClick={() => handleOpenModal('reportLost', item)} disabled={updatingItemId === item._id || item.status === 'lost'}>
                {updatingItemId === item._id ? 'Reporting...' : 'Report Lost'}
              </Button>
            </Box>
          </Paper>
        ))}
      </Box>
    );
  };

  return (
    <Box className="view-items-container">
      <Box className="page-header-container">
        <Typography variant="h4" component="h1" className="view-items-header">My Registered Items</Typography>
        <Typography variant="subtitle1" className="page-subtitle">Here is a list of all the valuables you've secured in your inventory.</Typography>
      </Box>
      {renderContent()}

      <Dialog
        open={modalState.open}
        onClose={handleCloseModal}
        aria-labelledby="confirmation-dialog-title"
        aria-describedby="confirmation-dialog-description"
        PaperProps={{
          sx: {
            borderRadius: '16px',
            padding: { xs: '0.5rem', sm: '1rem' },
            boxShadow: 'var(--clean-shadow-md)',
          }
        }}
        BackdropProps={{
            sx: {
                backdropFilter: 'blur(3px)',
                backgroundColor: 'rgba(0,0,0,0.2)'
            }
        }}
      >
        <DialogTitle id="confirmation-dialog-title" sx={{ display: 'flex', alignItems: 'center', gap: 1.5, fontWeight: 700, fontSize: '1.25rem', color: 'var(--clean-text-primary)' }}>
          <FaExclamationTriangle style={{ color: '#d32f2f' }} size="24px" />
          {modalState.actionType === 'delete' ? 'Confirm Deletion' : 'Confirm Report'}
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="confirmation-dialog-description" sx={{ color: 'var(--clean-text-secondary)', lineHeight: 1.6 }}>
            Are you sure you want to {modalState.actionType === 'delete' ? 'permanently delete' : 'report as lost'} the item "{modalState.itemName}"?
            <Box component="span" sx={{ display: 'block', mt: 1.5, fontWeight: '600', color: '#d32f2f' }}>
              This action cannot be undone.
            </Box>
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ p: '0 24px 20px', gap: '8px' }}>
          <Button onClick={handleCloseModal} variant="outlined" sx={{ borderColor: 'var(--clean-border-color)', color: 'var(--clean-text-secondary)' }}>
            Cancel
          </Button>
          <Button onClick={handleConfirmAction} variant="contained" color="error" autoFocus>
            {modalState.actionType === 'delete' ? 'Yes, Delete' : 'Yes, Report Lost'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default ViewItems;