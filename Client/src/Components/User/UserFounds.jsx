import React, { useState, useEffect } from 'react';
import { Box, Typography, CircularProgress, Alert, Paper, Chip, Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle } from '@mui/material';
import { Link } from 'react-router-dom';
import {
  FaPaw, FaLaptop, FaMobileAlt, FaDog, FaCat, FaEdit, FaExclamationTriangle, FaPlus, FaTrash, FaHandshake,
  FaMapMarkerAlt, FaCalendarAlt,
  FaShoppingBag, FaWallet
} from 'react-icons/fa';
import axiosInstance from '../../api/baseUrl';
import '../../Styles/ViewItems.css';

const getIconForSubCategory = (subCategory) => {
  const icons = {
    phone: <FaMobileAlt />,
    laptop: <FaLaptop />,
    dog: <FaDog />,
    cat: <FaCat />,
    wallet: <FaWallet />,
    'hand bag': <FaShoppingBag />
  };
  return icons[subCategory] || <FaPaw />;
};

function UserFounds() {
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
    const fetchUserFoundItems = async () => {
      try {
        setLoading(true);
        const userInfo = JSON.parse(localStorage.getItem('userInfo'));
        if (!userInfo || !userInfo._id) throw new Error("Authentication error. Please log in again.");
        const response = await axiosInstance.get(`/api/items/found/user/${userInfo._id}`);
        setItems(response.data.data);
        setError(null);
      } catch (err) {
        console.error("Fetch found items error:", err);
        setError(err.response?.data?.message || "Failed to fetch your found item reports.");
      } finally {
        setLoading(false);
      }
    };
    fetchUserFoundItems();
  }, []);

  const handleOpenModal = (actionType, item) => {
    let dialogItemName = '';

    if (item.mainCategory === 'pets') {
      dialogItemName = item.petName || item.itemName;
    } else if (item.mainCategory === 'accessories') {
      dialogItemName = `${item.brand} ${item.itemName}`;
    } else { 
      dialogItemName = item.itemName;
    }

    setModalState({
      open: true,
      actionType,
      itemId: item._id,
      itemName: dialogItemName,
    });
  };

  const handleCloseModal = () => {
    setModalState({ open: false, actionType: null, itemId: null, itemName: '' });
  };

  const handleConfirmAction = () => {
    if (modalState.actionType === 'markReturned') {
      handleMarkReturned(modalState.itemId);
    } else if (modalState.actionType === 'delete') {
      handleDelete(modalState.itemId);
    }
    handleCloseModal();
  };

  const handleMarkReturned = async (itemId) => {
    setUpdatingItemId(itemId);
    try {
      await axiosInstance.patch(`/api/items/mark-returned/${itemId}`);
      setItems(currentItems =>
        currentItems.map(item =>
          item._id === itemId ? { ...item, status: 'claimed' } : item
        )
      );
    } catch (err) {
      console.error("Failed to mark item as returned:", err);
      alert(err.response?.data?.message || "An error occurred while updating the item.");
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
      console.error("Failed to delete item report:", err);
      setItems(originalItems);
      alert(err.response?.data?.message || "Failed to delete the report. Please try again.");
    }
  };

  const getStatusChipColor = (status) => {
    switch (status) {
      case 'found': return 'success';
      case 'returned':
      case 'claimed': return 'info';
      default: return 'default';
    }
  };

  const renderContent = () => {
    if (loading) {
      return (
        <Box className="status-container">
          <CircularProgress size={50} sx={{ color: '#19a47a' }} />
          <Typography variant="h6" color="text.secondary" sx={{ mt: 2 }}>Loading Your Reports...</Typography>
        </Box>
      );
    }

    if (error) {
      return <Box className="status-container"><Alert severity="error" variant="filled">{error}</Alert></Box>;
    }

    if (!items || items.length === 0) {
      return (
        <Box className="status-container no-items">
          <FaPaw className="no-items-icon" />
          <Typography variant="h5" gutterBottom>You haven't reported any found items yet.</Typography>
          <Typography color="text.secondary">Report an item you've found to help it get back to its owner.</Typography>
          <Button component={Link} to="/user/found-items" variant="contained" className="add-first-item-btn" startIcon={<FaPlus />}>
            Report a Found Item
          </Button>
        </Box>
      );
    }

    return (
      <Box className="items-grid">
        {items.map((item) => {
          const isArchived = item.status === 'returned' || item.status === 'claimed';
          let subtitleContent;
          if (item.mainCategory === 'pets') {
            subtitleContent = `Breed: ${item.itemName}`;
          } else if (item.mainCategory === 'accessories') {
            subtitleContent = <Typography component="span" variant="body2" sx={{ fontSize: "20px", fontWeight: '700', color: 'text.primary' }}>{item.brand}</Typography>;
          } else {
            subtitleContent = `Brand: ${item.brand}`;
          }

          return (
            <Paper key={item._id} elevation={0} variant="outlined" className="item-card">
              <Box className="card-image-container">
                <img src={`http://localhost:5001/${item.itemImage.replace(/\\/g, '/')}`} alt={item.itemName} className="card-image" />
                <Chip icon={getIconForSubCategory(item.subCategory)} label={item.subCategory} size="small" className="category-chip" />
              </Box>
              <Box className="card-content">
                <Typography variant="h6" className="item-title">{item.mainCategory === 'pets' ? (item.petName || item.itemName) : item.itemName}</Typography>
                <Typography variant="body2" color="text.secondary" className="item-subtitle">{subtitleContent}</Typography>
                <Box className="item-details">
                  {item.foundDate && <Typography variant="caption" className="detail-item"><FaCalendarAlt /> Found: {new Date(item.foundDate).toLocaleDateString()}</Typography>}
                  {item.foundLocationAddress && <Typography variant="caption" className="detail-item"><FaMapMarkerAlt /> Location: {item.foundLocationAddress.substring(0, 25)}...</Typography>}
                </Box>
                <Chip label={item.status} size="small" color={getStatusChipColor(item.status)} className="status-chip" />
              </Box>
              {/* <Box className="card-actions">
                <Button size="small" variant="outlined" color="error" startIcon={<FaTrash />} onClick={() => handleOpenModal('delete', item)} disabled={isArchived}>Delete</Button>
                <Button size="small" variant="contained" color="primary" startIcon={<FaHandshake />} onClick={() => handleOpenModal('markReturned', item)} disabled={updatingItemId === item._id || isArchived}>
                  {updatingItemId === item._id ? 'Updating...' : 'Returned'}
                </Button>
              </Box> */}
            </Paper>
          );
        })}
      </Box>
    );
  };

  return (
    <Box className="view-items-container">
      <Box className="page-header-container">
        <Typography variant="h4" component="h1" className="view-items-header">My Found Item Reports</Typography>
        <Typography variant="subtitle1" className="page-subtitle">This page shows all the items you have reported as found.</Typography>
      </Box>
      {renderContent()}
      <Dialog open={modalState.open} onClose={handleCloseModal} >
        <DialogTitle id="confirmation-dialog-title" sx={{ display: 'flex', alignItems: 'center', gap: 1.5, fontWeight: 700, fontSize: '1.25rem', color: 'var(--clean-text-primary)' }}>
          <FaExclamationTriangle style={{ color: modalState.actionType === 'delete' ? '#d32f2f' : '#1976d2' }} size="24px" />
          {modalState.actionType === 'delete' ? 'Confirm Deletion' : 'Confirm Return'}
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="confirmation-dialog-description" sx={{ color: 'var(--clean-text-secondary)', lineHeight: 1.6 }}>
            Are you sure you want to {modalState.actionType === 'delete' ? 'permanently delete this report' : 'mark as returned to owner'} for the item "{modalState.itemName}"?
            {modalState.actionType === 'delete' && (
              <Box component="span" sx={{ display: 'block', mt: 1.5, fontWeight: '600', color: '#d32f2f' }}>This action cannot be undone.</Box>
            )}
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ p: '0 24px 20px', gap: '8px' }}>
          <Button onClick={handleCloseModal} variant="outlined" sx={{ borderColor: 'var(--clean-border-color)', color: 'var(--clean-text-secondary)' }}>Cancel</Button>
          <Button onClick={handleConfirmAction} variant="contained" color={modalState.actionType === 'delete' ? 'error' : 'primary'} autoFocus>
            {modalState.actionType === 'delete' ? 'Yes, Delete' : 'Yes, It Was Returned'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default UserFounds;