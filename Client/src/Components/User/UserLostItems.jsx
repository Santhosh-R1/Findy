import React, { useState, useEffect } from 'react';
import { Box, Typography, CircularProgress, Alert, Paper, Chip, Button, Dialog, DialogTitle, DialogContent, Grid, IconButton } from '@mui/material';
import { 
    FaPaw, FaLaptop, FaMobileAlt, FaDog, FaCat, 
    FaBarcode, FaPalette, FaEye, FaSearch, FaTimes, FaMapMarkerAlt, FaCalendarAlt
} from 'react-icons/fa';
import axiosInstance from '../../api/baseUrl';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css'; 
import '../../Styles/ViewItems.css'; 
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

const DetailRow = ({ label, value, icon }) => (
  <Box className="detail-row">
    <Typography variant="subtitle2" className="detail-label">
      {icon} {label}
    </Typography>
    <Typography variant="body2" className="detail-value">{value || 'N/A'}</Typography>
  </Box>
);
const MapDisplay = ({ coords }) => {
  if (!coords || !Array.isArray(coords) || coords.length !== 2) {
    return (
        <Box className="map-unavailable">
            <FaMapMarkerAlt />
            <Typography>Map data is unavailable for this item.</Typography>
        </Box>
    );
  }
  const position = [coords[1], coords[0]]; 

  return (
    <Box className="map-wrapper">
        <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, mb: 2 }}>Last Known Location on Map</Typography>
        <MapContainer center={position} zoom={14} scrollWheelZoom={false} className="leaflet-container">
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


function ViewAllLostItems() { 
  const [lostItems, setLostItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [modalOpen, setModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);

  useEffect(() => {
    const fetchAllLostItems = async () => {
      try {
        setLoading(true);
        const userInfo = JSON.parse(localStorage.getItem('userInfo'));
        const currentUserId = userInfo ? userInfo._id : null;

        const response = await axiosInstance.get('/api/items/allItems');
        
        const filteredLostItems = response.data.data.filter(item => 
          item.status === 'lost' && 
          item.owner._id !== currentUserId
        );
        console.log(filteredLostItems);
        
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
          <Typography color="text.secondary">No items are currently reported lost by other users.</Typography>
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
        <Typography variant="h4" component="h1" className="view-items-header">Community Lost Items</Typography>
        <Typography variant="subtitle1" className="page-subtitle">Found something? Check this board for items reported lost by others.</Typography>
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
            <DialogTitle sx={{ m: 0, p: 2, fontWeight: 700 }}>
              Lost Item Details
              <IconButton
                aria-label="close"
                onClick={handleCloseModal}
                sx={{ position: 'absolute', right: 8, top: 8, color: (theme) => theme.palette.grey[500] }}
              >
                <FaTimes />
              </IconButton>
            </DialogTitle>
            <DialogContent dividers>
              <Grid container spacing={3}>
                <Grid item xs={12} md={5}>
                  <Box className="modal-image-container">
                    <img src={`http://localhost:5001/${selectedItem.itemImage.replace(/\\/g, '/')}`} alt={selectedItem.itemName} className="modal-image" />
                  </Box>
                </Grid>

                <Grid item xs={12} md={7}>
                  <Typography variant="h5" gutterBottom sx={{ fontWeight: 600 }}>
                    {selectedItem.mainCategory === 'pets' ? selectedItem.petName : selectedItem.itemName}
                  </Typography>
                  <Box className="details-box">
                    {selectedItem.brand && <DetailRow label="Brand" value={selectedItem.brand} />}
                    {selectedItem.mainCategory === 'pets' && <DetailRow label="Breed" value={selectedItem.itemName} />}
                    {selectedItem.serialNumber && <DetailRow label="Serial Number" value={selectedItem.serialNumber} icon={<FaBarcode />} />}
                    <DetailRow label="Color/Markings" value={selectedItem.color} icon={<FaPalette />} />
                    <DetailRow label="Description" value={selectedItem.description} />
                  </Box>

                  <Box mt={3}>
                    <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>Last Seen Details</Typography>
                    <Box className="details-box">
                      <DetailRow 
                        label="Date Lost" 
                        value={new Date(selectedItem.lostDate).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}
                        icon={<FaCalendarAlt />} 
                      />
                      <DetailRow label="Location" value={selectedItem.lostLocationAddress} icon={<FaMapMarkerAlt />} />
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

export default ViewAllLostItems;