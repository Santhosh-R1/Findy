import React, { useState, useEffect } from 'react';
import { Box, Typography, CircularProgress, Alert, Paper, Chip, Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle } from '@mui/material';
import { Link } from 'react-router-dom';
import {
  FaPaw, FaLaptop, FaMobileAlt, FaDog, FaCat, FaExclamationTriangle, FaPlus, FaHandshake,
  FaMapMarkerAlt, FaCalendarAlt,
  FaShoppingBag, FaWallet
} from 'react-icons/fa';
import axiosInstance from '../../api/baseUrl';
import '../../Styles/ViewItems.css'; // Using the same styles as UserFounds

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

function OrganaisationFinds() {
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
    const fetchOrgFoundItems = async () => {
      try {
        setLoading(true);
        const orgInfo = JSON.parse(localStorage.getItem('organisationInfo'));
        if (!orgInfo || !orgInfo.data || !orgInfo.data._id) {
          throw new Error("Organization details not found. Please log in again.");
        }
        const response = await axiosInstance.get(`/api/items/found/user/${orgInfo.data._id}`);
        setItems(response.data.data);
        setError(null);
      } catch (err) {
        console.error("Fetch found items error:", err);
        setError(err.response?.data?.message || "Failed to fetch your organization's found item reports.");
      } finally {
        setLoading(false);
      }
    };
    fetchOrgFoundItems();
  }, []);

  // --- THIS IS THE CHANGE ---
  // Updated function to create a more descriptive name for the dialog
  const handleOpenModal = (item) => {
    let dialogItemName = '';

    if (item.mainCategory === 'pets') {
      dialogItemName = item.petName || item.itemName;
    } else if (item.mainCategory === 'accessories') {
      // Combine brand and item name for accessories
      dialogItemName = `${item.brand} ${item.itemName}`;
    } else { // Default for electronics and others
      dialogItemName = item.itemName;
    }

    setModalState({
      open: true,
      itemId: item._id,
      itemName: dialogItemName,
    });
  };
  // -------------------------

  const handleCloseModal = () => {
    setModalState({ open: false, itemId: null, itemName: '' });
  };

  const handleConfirmAction = () => {
    handleMarkReturned(modalState.itemId);
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
          <Typography variant="h6" color="text.secondary" sx={{ mt: 2 }}>Loading Organization Reports...</Typography>
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
          <Typography variant="h5" gutterBottom>Your organization hasn't reported any found items yet.</Typography>
          <Typography color="text.secondary">Report an item brought to your organization to help it get back to its owner.</Typography>
          <Button component={Link} to="/organisation/founts" variant="contained" className="add-first-item-btn" startIcon={<FaPlus />}>
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
            subtitleContent = <Typography component="span" variant="body2" sx={{ fontWeight: '700',fontSize:"20px", color: 'text.primary' }}>{item.brand}</Typography>;
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
              <Box className="card-actions">
                <Button size="small" variant="contained" color="primary" startIcon={<FaHandshake />} onClick={() => handleOpenModal(item)} disabled={updatingItemId === item._id || isArchived} sx={{ flexGrow: 1 }}>
                  {updatingItemId === item._id ? 'Updating...' : 'Mark as Returned'}
                </Button>
              </Box>
            </Paper>
          );
        })}
      </Box>
    );
  };

  return (
    <Box className="view-items-container">
      <Box className="page-header-container">
        <Typography variant="h4" component="h1" className="view-items-header">Organization Found Item Reports</Typography>
        <Typography variant="subtitle1" className="page-subtitle">This page shows all items your organization has reported as found.</Typography>
      </Box>
      {renderContent()}

      <Dialog open={modalState.open} onClose={handleCloseModal} >
        <DialogTitle id="confirmation-dialog-title" sx={{ display: 'flex', alignItems: 'center', gap: 1.5, fontWeight: 700, fontSize: '1.25rem', color: 'var(--clean-text-primary)' }}>
          <FaExclamationTriangle style={{ color: '#1976d2' }} size="24px" />
          Confirm Return
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="confirmation-dialog-description" sx={{ color: 'var(--clean-text-secondary)', lineHeight: 1.6 }}>
            Are you sure you want to mark the item "{modalState.itemName}" as returned to its owner?
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ p: '0 24px 20px', gap: '8px' }}>
          <Button onClick={handleCloseModal} variant="outlined" sx={{ borderColor: 'var(--clean-border-color)', color: 'var(--clean-text-secondary)' }}>
            Cancel
          </Button>
          <Button onClick={handleConfirmAction} variant="contained" color="primary" autoFocus>
            Yes, It Was Returned
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default OrganaisationFinds;