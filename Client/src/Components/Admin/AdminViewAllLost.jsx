import React, { useState, useEffect } from 'react';
import { Box, Typography, CircularProgress, Alert, Paper, Chip, Button, Dialog, DialogTitle, DialogContent, Grid, IconButton, Avatar } from '@mui/material';
import { 
    FaPaw, FaLaptop, FaMobileAlt, FaDog, FaCat, 
    FaBarcode, FaPalette, FaEye, FaSearch, FaTimes, FaMapMarkerAlt, 
    FaCalendarAlt, FaEnvelope, FaPhone
} from 'react-icons/fa';
import axiosInstance from '../../api/baseUrl';

import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import '../../Styles/ViewItems.css'; 
import '../../Styles/modelStyle.css'; 
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconAnchor: [12, 41]
});
L.Marker.prototype.options.icon = DefaultIcon;
const getIconForSubCategory = (subCategory) => {
  const icons = { phone: <FaMobileAlt />, laptop: <FaLaptop />, dog: <FaDog />, cat: <FaCat /> };
  return icons[subCategory] || <FaPaw />;
};

// UPDATED to use new admin-specific class names
const DetailRow = ({ label, value, icon }) => (
  <Box className="admin-modal-detail-row">
    <Typography variant="subtitle2" className="admin-modal-detail-label">
      {icon} {label}
    </Typography>
    <Typography variant="body2" className="admin-modal-detail-value">{value || 'N/A'}</Typography>
  </Box>
);

const MapDisplay = ({ coords }) => {
  if (!coords || !Array.isArray(coords) || coords.length !== 2) {
    return (
        <Box className="admin-modal-map-unavailable">
            <FaMapMarkerAlt />
            <Typography>Map data is unavailable for this item.</Typography>
        </Box>
    );
  }
  const position = [coords[1], coords[0]]; 

  return (
    <Box className="admin-modal-map-wrapper">
        <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, mb: 2 }}>Last Known Location on Map</Typography>
        <MapContainer center={position} zoom={14} scrollWheelZoom={false} className="admin-modal-leaflet-container">
        <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <Marker position={position}>
            <Popup>
            This is the approximate last known location.
            </Popup>
        </Marker>
        </MapContainer>
    </Box>
  );
};


function AdminViewAllLost() {
  const [lostItems, setLostItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);

  useEffect(() => {
    const fetchAllLostItems = async () => {
      try {
        setLoading(true);
        const response = await axiosInstance.get('/api/items/allItems');
        const filteredLostItems = response.data.data.filter(item => item.status === 'lost');
        setLostItems(filteredLostItems);
        setError(null);
      } catch (err) {
        console.error("Fetch all lost items error:", err);
        setError(err.response?.data?.message || "Failed to fetch lost items from the community.");
      } finally {
        setLoading(false);
      }
    };
    fetchAllLostItems();
  }, []);

  const handleOpenModal = (item) => {
    setSelectedItem(item);
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setSelectedItem(null);
  };

  const renderContent = () => {
    if (loading) {
      return (
        <Box className="status-container">
          <CircularProgress size={50} sx={{ color: '#19a47a' }} />
          <Typography variant="h6" color="text.secondary" sx={{ mt: 2 }}>Loading Lost Items...</Typography>
        </Box>
      );
    }

    if (error) {
      return <Box className="status-container"><Alert severity="error" variant="filled">{error}</Alert></Box>;
    }

    if (lostItems.length === 0) {
      return (
        <Box className="status-container no-items">
          <FaSearch className="no-items-icon" />
          <Typography variant="h5" gutterBottom>All Clear!</Typography>
          <Typography color="text.secondary">No items are currently reported as lost.</Typography>
        </Box>
      );
    }

    return (
      <Box className="items-grid">
        {lostItems.map((item) => (
          <Paper key={item._id} elevation={0} variant="outlined" className="item-card">
            <Box className="card-image-container">
              <img src={`http://localhost:5001/${item.itemImage.replace(/\\/g, '/')}`} alt={item.itemName} className="card-image" />
              <Chip icon={getIconForSubCategory(item.subCategory)} label={item.subCategory} size="small" className="category-chip" />
            </Box>
            <Box className="card-content">
              <Typography variant="h6" className="item-title">{item.mainCategory === 'pets' ? item.petName : item.itemName}</Typography>
              <Typography variant="body2" color="text.secondary" className="item-subtitle">{item.mainCategory === 'pets' ? `Breed: ${item.itemName}` : `Brand: ${item.brand}`}</Typography>
              <Box className="item-details">
                <Typography variant="caption" className="detail-item"><FaMapMarkerAlt /> {item.lostLocationAddress?.split(',')[0] || 'Unknown Location'}</Typography>
              </Box>
              <Chip label={item.status} size="small" color={'error'} className="status-chip" />
            </Box>
            <Box className="card-actions" sx={{ gridTemplateColumns: '1fr' }}>
              <Button 
                fullWidth
                size="small" 
                variant="contained" 
                startIcon={<FaEye />}
                onClick={() => handleOpenModal(item)}
              >
                View Details
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
        <Typography variant="h4" component="h1" className="view-items-header">View All Lost Items</Typography>
        <Typography variant="subtitle1" className="page-subtitle">A comprehensive list of all items reported as lost by users.</Typography>
      </Box>
      {renderContent()}

      <Dialog
        open={modalOpen}
        onClose={handleCloseModal}
        fullWidth
        maxWidth="md"
        PaperProps={{ sx: { borderRadius: '16px' } }}
      >
        {selectedItem && (
          <>
            <DialogTitle sx={{ m: 0, p: 2, fontWeight: 700, borderBottom: '1px solid #e0e0e0' }}>
              Lost Item Details
              <IconButton
                aria-label="close"
                onClick={handleCloseModal}
                sx={{ position: 'absolute', right: 8, top: 8, color: (theme) => theme.palette.grey[500] }}
              >
                <FaTimes />
              </IconButton>
            </DialogTitle>
            <DialogContent dividers sx={{ p: 3 }}>
              <Grid container spacing={4}>
                <Grid item xs={12} md={5}>
                  <Box className="admin-modal-image-container">
                    <img src={`http://localhost:5001/${selectedItem.itemImage.replace(/\\/g, '/')}`} alt={selectedItem.itemName} className="admin-modal-image" />
                  </Box>
                </Grid>

                <Grid item xs={12} md={7}>
                  <Typography variant="h5" gutterBottom sx={{ fontWeight: 600 }}>
                    {selectedItem.mainCategory === 'pets' ? selectedItem.petName : selectedItem.itemName}
                  </Typography>
                  
                  <Box className="admin-modal-details-box">
                    {selectedItem.brand && <DetailRow label="Brand" value={selectedItem.brand} />}
                    {selectedItem.mainCategory === 'pets' && <DetailRow label="Breed" value={selectedItem.itemName} />}
                    {selectedItem.serialNumber && <DetailRow label="Serial Number" value={selectedItem.serialNumber} icon={<FaBarcode />} />}
                    <DetailRow label="Color/Markings" value={selectedItem.color} icon={<FaPalette />} />
                    <DetailRow label="Description" value={selectedItem.description} />
                  </Box>

                  <Box mt={3}>
                    <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>Last Seen Details</Typography>
                    <Box className="admin-modal-details-box">
                      <DetailRow 
                        label="Date Lost" 
                        value={new Date(selectedItem.lostDate).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}
                        icon={<FaCalendarAlt />} 
                      />
                      <DetailRow label="Location" value={selectedItem.lostLocationAddress} icon={<FaMapMarkerAlt />} />
                    </Box>
                  </Box>

                  <Box mt={3}>
                    <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>Owner Information</Typography>
                    <Box className="admin-modal-owner-header">
                        <Avatar
                            src={`http://localhost:5001${selectedItem.owner?.profileImage}`}
                            alt={selectedItem.owner?.firstName}
                            sx={{ width: 56, height: 56, mr: 2 }}
                        />
                        <Box>
                            <Typography sx={{ fontWeight: 600 }}>
                                {`${selectedItem.owner?.firstName || 'N/A'} ${selectedItem.owner?.lastName || ''}`}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                Item Owner
                            </Typography>
                        </Box>
                    </Box>
                    <Box className="admin-modal-details-box" mt={1}>
                        <DetailRow label="Email" value={selectedItem.owner?.email} icon={<FaEnvelope />} />
                        <DetailRow label="Phone" value={selectedItem.owner?.phone} icon={<FaPhone />} />
                    </Box>
                  </Box>
                </Grid>
                
                <Grid item xs={12}>
                   <MapDisplay coords={selectedItem.lostLocation?.coordinates} />
                </Grid>

              </Grid>
            </DialogContent>
          </>
        )}
      </Dialog>
    </Box>
  );
}

export default AdminViewAllLost;