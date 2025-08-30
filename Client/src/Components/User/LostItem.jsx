import React, { useState, useEffect } from 'react';
import { Box, Typography, CircularProgress, Alert, Paper, Chip, Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle } from '@mui/material';
import { Link } from 'react-router-dom';
import { FaPaw, FaLaptop, FaMobileAlt, FaDog, FaCat, FaBarcode, FaPalette, FaExclamationTriangle, FaCheck, FaCheckCircle, FaListUl } from 'react-icons/fa';
import axiosInstance from '../../api/baseUrl';
import '../../Styles/ViewItems.css'; 

const getIconForSubCategory = (subCategory) => {
  const icons = { phone: <FaMobileAlt />, laptop: <FaLaptop />, dog: <FaDog />, cat: <FaCat /> };
  return icons[subCategory] || <FaPaw />;
};

function LostItem() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [updatingItemId, setUpdatingItemId] = useState(null);

  const [modalState, setModalState] = useState({
    open: false,
    itemId: null,
    itemName: '',
  });

  useEffect(() => {
    const fetchLostItems = async () => {
      try {
        setLoading(true);
        const userInfo = JSON.parse(localStorage.getItem('userInfo'));
        if (!userInfo || !userInfo._id) throw new Error("Authentication error. Please log in again.");

        const response = await axiosInstance.get(`/api/items/user/${userInfo._id}`);
        const lostItems = response.data.data.filter(item => item.status === 'lost');
        setItems(lostItems);
        setError(null);
      } catch (err) {
        console.error("Fetch lost items error:", err);
        setError(err.response?.data?.message || "Failed to fetch your lost items.");
      } finally {
        setLoading(false);
      }
    };
    fetchLostItems();
  }, []);

  const handleOpenModal = (item) => {
    setModalState({
      open: true,
      itemId: item._id,
      itemName: item.mainCategory === 'pets' ? item.petName : item.itemName,
    });
  };

  const handleCloseModal = () => {
    setModalState({ open: false, itemId: null, itemName: '' });
  };

  const handleConfirmClaimed = () => {
    executeMarkAsClaimed(modalState.itemId);
    handleCloseModal();
  };

  const executeMarkAsClaimed = async (itemId) => {
    setUpdatingItemId(itemId);
    try {
      await axiosInstance.patch(`/api/items/mark-claimed/${itemId}`);
            setItems(currentItems => currentItems.filter(item => item._id !== itemId));

    } catch (err) {
      console.error("Failed to mark item as claimed:", err);
      alert(err.response?.data?.message || "An error occurred while updating the item.");
    } finally {
      setUpdatingItemId(null);
    }
  };

  const renderContent = () => {
    if (loading) {
      return (
        <Box className="status-container">
          <CircularProgress size={50} sx={{ color: '#19a47a' }} />
          <Typography variant="h6" color="text.secondary" sx={{ mt: 2 }}>Searching for Lost Items...</Typography>
        </Box>
      );
    }

    if (error) {
      return <Box className="status-container"><Alert severity="error" variant="filled">{error}</Alert></Box>;
    }

    if (items.length === 0) {
      return (
        <Box className="status-container no-items">
          <FaCheckCircle className="no-items-icon" style={{ color: 'var(--clean-primary-color)' }}/>
          <Typography variant="h5" gutterBottom>No Lost Items</Typography>
          <Typography color="text.secondary">Great news! None of your items are currently reported as lost.</Typography>
          <Button component={Link} to="/user/view-items" variant="contained" className="add-first-item-btn" startIcon={<FaListUl />}>
            View All My Items
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
              <Chip label={item.status} size="small" color='error' className="status-chip" />
            </Box>
            <Box className="card-actions" style={{ gridTemplateColumns: '1fr' }}>
              <Button
                fullWidth
                size="small"
                variant="contained"
                color="success"
                startIcon={<FaCheck />}
                onClick={() => handleOpenModal(item)}
                disabled={updatingItemId === item._id}
              >
                {updatingItemId === item._id ? 'Updating...' : 'Mark as Claimed'}
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
        <Typography variant="h4" component="h1" className="view-items-header">My Reported Lost Items</Typography>
        <Typography variant="subtitle1" className="page-subtitle">A list of your items that have been reported as lost.</Typography>
      </Box>
      {renderContent()}

      <Dialog
        open={modalState.open}
        onClose={handleCloseModal}
        PaperProps={{ sx: { borderRadius: '16px', padding: { xs: '0.5rem', sm: '1rem' } } }}
        BackdropProps={{ sx: { backdropFilter: 'blur(3px)', backgroundColor: 'rgba(0,0,0,0.2)' } }}
      >
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1.5, fontWeight: 700, fontSize: '1.25rem' }}>
          <FaExclamationTriangle style={{ color: '#2e7d32' }} size="24px" />
          Confirm Item Claimed
        </DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to mark "{modalState.itemName}" as claimed? This will move it back to your 'safe' inventory.
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ p: '0 24px 20px', gap: '8px' }}>
          <Button onClick={handleCloseModal} variant="outlined">Cancel</Button>
          <Button onClick={handleConfirmClaimed} variant="contained" color="success" autoFocus>
            Yes, Mark as Claimed
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default LostItem;