// src/components/Moderator/ModeratorLost.js

import React, { useState, useEffect } from 'react';
import {
  Box, Typography, CircularProgress, Alert, Paper, Chip, Button,
  Dialog, DialogActions, DialogContent, DialogTitle, Avatar, Grid, Divider
} from '@mui/material';
import { 
  FaMapMarkerAlt, FaCalendarAlt, FaUser, FaListUl, FaExclamationTriangle,
  FaTag, FaPalette, FaInfoCircle, FaPhone, FaEnvelope, FaPaw // <-- NEW: Added FaPaw icon
} from 'react-icons/fa';
import axiosInstance from '../../api/baseUrl';
import LocationMap from './LocationMap'; 
import '../../Styles/ModeratorLost.css';

const LostItemCard = ({ item, onManageClick }) => {
  const imageUrl = item.itemImage ? `http://localhost:5001/${item.itemImage}` : 'https://via.placeholder.com/300x200?text=No+Image';
  const ownerImageUrl = item.owner?.profileImage ? `http://localhost:5001${item.owner.profileImage}` : '';

  const formattedLostDate = new Date(item.lostDate).toLocaleDateString('en-US', {
    year: 'numeric', month: 'long', day: 'numeric',
  });

  return (
    <Paper elevation={0} variant="outlined" className="mod-lost-item-card">
      <Box className="mod-lost-card-image-container">
        <img src={imageUrl} alt={item.itemName || item.petName} className="mod-lost-card-image" />
        <Chip label={`${item.mainCategory} / ${item.subCategory}`} size="small" className="mod-lost-category-chip" />
      </Box>

      <Box className="mod-lost-card-content">
        <Box className="mod-lost-owner-info-container">
          <Avatar src={ownerImageUrl} sx={{ width: 40, height: 40 }}><FaUser /></Avatar>
          <Box>
            <Typography className="mod-lost-owner-name" title={item.owner?.firstName || 'N/A'}>
              {item.owner?.firstName || 'N/A'}
            </Typography>
            <Typography variant="caption" className="mod-lost-owner-email" title={item.owner?.email || 'N/A'}>
              {item.owner?.email || 'N/A'}
            </Typography>
          </Box>
        </Box>

        <Typography variant="h6" className="mod-lost-item-title">
          {item.itemName || item.petName || 'Unnamed Item'}
        </Typography>
        <Typography variant="body2" color="text.secondary" className="mod-lost-item-description">
          {item.description}
        </Typography>
        
        <Box className="mod-lost-item-details-grid">
            <Box className="mod-lost-detail-item"><FaCalendarAlt /><span>{formattedLostDate}</span></Box>
            <Box className="mod-lost-detail-item"><FaMapMarkerAlt /><span>{item.lostLocationAddress}</span></Box>
        </Box>
      </Box>
      
      <Box className="mod-lost-card-actions">
        <Button
            fullWidth
            variant="contained"
            className="mod-lost-manage-item-btn"
            onClick={() => onManageClick(item)}
        >
            Manage Item
        </Button>
      </Box>
    </Paper>
  );
};

function ModeratorLost() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [modalState, setModalState] = useState({ open: false, selectedItem: null });

  useEffect(() => {
    const fetchLostItems = async () => {
        try {
          setLoading(true);
          const response = await axiosInstance.get('/api/items/status/lost');
          if (response.data && response.data.success) {
            setItems(response.data.data);
          } else {
            throw new Error('Failed to fetch data');
          }
        } catch (err) {
          console.error("Error fetching lost items:", err);
          setError('Could not retrieve lost items.');
        } finally {
          setLoading(false);
        }
      };
      fetchLostItems();
  }, []);

  const handleOpenModal = (item) => setModalState({ open: true, selectedItem: item });
  const handleCloseModal = () => setModalState({ open: false, selectedItem: null });
  
  const renderContent = () => {
    if (loading) {
        return (
          <Box className="mod-lost-status-container">
            <CircularProgress color="warning" />
          </Box>
        );
      }
  
      if (error) {
        return (
          <Box className="mod-lost-status-container">
            <Alert severity="error">{error}</Alert>
          </Box>
        );
      }
  
      if (items.length === 0) {
        return (
          <Box className="mod-lost-status-container mod-lost-no-items">
            <FaListUl className="mod-lost-no-items-icon" />
            <Typography variant="h5">No Lost Items Reported</Typography>
            <Typography color="text.secondary">No items are currently marked as lost.</Typography>
          </Box>
        );
      }
  
      return (
        <Box className="mod-lost-items-grid">
          {items.map((item) => <LostItemCard key={item._id} item={item} onManageClick={handleOpenModal} />)}
        </Box>
      );
  };

  const selectedItem = modalState.selectedItem;
  const isPet = selectedItem?.mainCategory === 'pets'; // <-- NEW: Check if the item is a pet
  const hasCoordinates = selectedItem?.lostLocation?.coordinates?.length === 2;
  const mapPosition = hasCoordinates ? [selectedItem.lostLocation.coordinates[1], selectedItem.lostLocation.coordinates[0]] : null;

  return (
    <Box className="mod-lost-page">
      <Box className="mod-lost-page-header-container">
        <Typography variant="h4" component="h1" className="mod-lost-page-header">
          Lost Item Reports
        </Typography>
        <Typography variant="subtitle1" className="mod-lost-page-subtitle">
          Review and manage all items reported as lost by users.
        </Typography>
      </Box>
      
      {renderContent()}

      <Dialog
        open={modalState.open}
        onClose={handleCloseModal}
        maxWidth="lg" 
        fullWidth 
        PaperProps={{ className: "mod-lost-dialog-paper" }}
      >
        <DialogTitle className="mod-lost-dialog-title">
          <FaExclamationTriangle />
          Manage Lost Item: "{selectedItem?.itemName || selectedItem?.petName}"
        </DialogTitle>
        <DialogContent dividers className="mod-lost-dialog-content">
          {selectedItem && (
            <Grid container spacing={0} sx={{ height: '100%' }}>
              <Grid item xs={12} md={5} className="mod-lost-dialog-column-left">
                <img src={`http://localhost:5001/${selectedItem.itemImage}`} alt={selectedItem.itemName || selectedItem.petName} className="mod-lost-dialog-image" />
                <Typography variant="h6" gutterBottom>Owner Information</Typography>
                <Paper variant="outlined" className="mod-lost-info-paper">
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                      <Avatar src={selectedItem.owner?.profileImage ? `http://localhost:5001${selectedItem.owner.profileImage}` : ''} sx={{ width: 56, height: 56 }} />
                      <Box>
                          <Typography fontWeight="bold">{selectedItem.owner?.firstName || 'N/A'}</Typography>
                          <Typography variant="body2" color="text.secondary">{selectedItem.owner?.gender || 'Details unavailable'}</Typography>
                      </Box>
                    </Box>
                    <Divider />
                    <Box sx={{ pt: 2, display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                        <Typography variant="body2" className="mod-lost-info-line"><FaEnvelope /><strong>Email:</strong><span className="mod-lost-info-value">{selectedItem.owner?.email || 'N/A'}</span></Typography>
                        <Typography variant="body2" className="mod-lost-info-line"><FaPhone /><strong>Phone:</strong><span className="mod-lost-info-value">{selectedItem.owner?.phone || 'N/A'}</span></Typography>
                    </Box>
                </Paper>
              </Grid>

              <Grid item xs={12} md={7} className="mod-lost-dialog-column-right">
                <Box className="mod-lost-dialog-scroll-section">
                    <Typography variant="h6" gutterBottom>Item Specifics</Typography>
                                        {isPet ? (
                      <Paper variant="outlined" className="mod-lost-info-paper">
                          <Typography variant="body2" className="mod-lost-info-line"><strong><FaPaw /> Breed:</strong> <span className="mod-lost-info-value">{selectedItem.subCategory || 'N/A'}</span></Typography>
                          <Typography variant="body2" className="mod-lost-info-line"><strong><FaPalette /> Color:</strong> <span className="mod-lost-info-value">{selectedItem.color || 'N/A'}</span></Typography>
                          <Typography variant="body2" className="mod-lost-info-line"><strong><FaCalendarAlt /> Lost Date:</strong> <span className="mod-lost-info-value">{new Date(selectedItem.lostDate).toLocaleDateString()}</span></Typography>
                          <Typography variant="body2" className="mod-lost-info-line"><strong><FaCalendarAlt /> Acquired Date:</strong> <span className="mod-lost-info-value">{selectedItem.purchaseDate ? new Date(selectedItem.purchaseDate).toLocaleDateString() : 'N/A'}</span></Typography>
                          <Divider sx={{ my: 1.5 }} />
                          <Typography variant="body2"><strong><FaInfoCircle /> Description:</strong> {selectedItem.description || 'No description'}</Typography>
                      </Paper>
                    ) : (
                      <Paper variant="outlined" className="mod-lost-info-paper">
                          <Typography variant="body2" className="mod-lost-info-line"><strong><FaTag /> Brand:</strong> <span className="mod-lost-info-value">{selectedItem.brand || 'N/A'}</span></Typography>
                          <Typography variant="body2" className="mod-lost-info-line"><strong><FaPalette /> Color:</strong> <span className="mod-lost-info-value">{selectedItem.color || 'N/A'}</span></Typography>
                          <Typography variant="body2" className="mod-lost-info-line"><strong><FaCalendarAlt /> Lost Date:</strong> <span className="mod-lost-info-value">{new Date(selectedItem.lostDate).toLocaleDateString()}</span></Typography>
                          <Divider sx={{ my: 1.5 }} />
                          <Typography variant="body2"><strong><FaInfoCircle /> Description:</strong> {selectedItem.description || 'No description'}</Typography>
                      </Paper>
                    )}
                    {/* --- END OF CHANGE --- */}

                    <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>Last Seen Location</Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5 }}>{selectedItem.lostLocationAddress}</Typography>
                    {hasCoordinates ? <LocationMap position={mapPosition} /> : <Alert severity="warning" sx={{ mt: 2 }}>Map coordinates are not available.</Alert>}
                </Box>
              </Grid>
            </Grid>
          )}
        </DialogContent>
        <DialogActions className="mod-lost-dialog-actions">
          <Button onClick={handleCloseModal} variant="outlined" color="secondary">Close</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default ModeratorLost;