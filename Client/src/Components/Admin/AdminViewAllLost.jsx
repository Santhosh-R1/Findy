import React, { useState, useEffect } from 'react';
import { 
    Box, Typography, CircularProgress, Alert, Paper, Chip, Button, 
    Dialog, DialogTitle, DialogContent, DialogActions, Grid, IconButton, 
    Avatar, Divider 
} from '@mui/material';
import { 
    FaPaw, FaLaptop, FaMobileAlt, FaDog, FaCat, 
    FaBarcode, FaPalette, FaEye, FaSearch, FaTimes, FaMapMarkerAlt, 
    FaCalendarAlt, FaEnvelope, FaPhone, FaInfoCircle, FaTag, FaHashtag, FaUserShield, FaClock
} from 'react-icons/fa';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import axiosInstance from '../../api/baseUrl';
import '../../Styles/AdminViewAllLost.css'; 

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

const DetailRow = ({ icon: Icon, label, value }) => (
    <Box className="admin-lost-view-detail-row">
        <Box className="admin-lost-view-detail-icon-wrapper">
            <Icon />
        </Box>
        <Box>
            <Typography variant="caption" className="admin-lost-view-detail-label">{label}</Typography>
            <Typography variant="body2" className="admin-lost-view-detail-value">{value || 'N/A'}</Typography>
        </Box>
    </Box>
);

const MapDisplay = ({ coords }) => {
  if (!coords || !Array.isArray(coords) || coords.length !== 2) {
    return (
        <Box className="admin-lost-view-map-unavailable">
            <FaMapMarkerAlt size={24} style={{ marginBottom: 8, opacity: 0.5 }} />
            <Typography variant="body2">Location data missing</Typography>
        </Box>
    );
  }
  const position = [coords[1], coords[0]]; 

  return (
    <Box className="admin-lost-view-map-container">
        <MapContainer center={position} zoom={14} scrollWheelZoom={false} style={{ height: '100%', width: '100%' }}>
            <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <Marker position={position}>
                <Popup>Last known location</Popup>
            </Marker>
        </MapContainer>
    </Box>
  );
};

const LostItemDetailModal = ({ open, onClose, item }) => {
    if (!item) return null;
    const API_URL = 'http://localhost:5001';
    const isPet = item.mainCategory === 'pets';

    return (
        <Dialog 
            open={open} 
            onClose={onClose} 
            maxWidth="md" 
            fullWidth 
            PaperProps={{ className: "admin-lost-view-modal-paper" }}
            scroll="paper"
        >
            <DialogTitle className="admin-lost-view-modal-header">
                <Box className="admin-lost-view-header-left">
                    <FaUserShield className="admin-lost-view-header-icon"/>
                    <Typography variant="h6">Case File: {item.itemName || item.petName}</Typography>
                    <Chip 
                        label={item.status} 
                        size="small" 
                        className={`admin-lost-view-status-chip ${item.status}`}
                    />
                </Box>
                <IconButton onClick={onClose} size="small" className="admin-lost-view-close-btn">
                    <FaTimes />
                </IconButton>
            </DialogTitle>

            <DialogContent className="admin-lost-view-modal-content">
                <Grid container spacing={0} sx={{ height: '100%' }}>
                    
                    {/* LEFT COLUMN: Visuals & Owner */}
                    <Grid item xs={12} md={5} className="admin-lost-view-col-left">
                        <Box className="admin-lost-view-image-wrapper">
                            <img 
                                src={`${API_URL}/${item.itemImage.replace(/\\/g, '/')}`} 
                                alt={item.itemName} 
                                className="admin-lost-view-main-image" 
                            />
                            <div className="admin-lost-view-image-overlay">
                                <Chip icon={<FaHashtag color="white" size={10}/>} label={item._id.slice(-6).toUpperCase()} size="small" className="admin-lost-view-id-badge" />
                            </div>
                        </Box>

                        <Paper variant="outlined" className="admin-lost-view-owner-card">
                            <Typography className="admin-lost-view-section-title">Reported By</Typography>
                            <Box className="admin-lost-view-owner-profile">
                                <Avatar 
                                    src={`${API_URL}${item.owner?.profileImage}`} 
                                    className="admin-lost-view-owner-avatar"
                                />
                                <Box>
                                    <Typography fontWeight="bold" variant="body1">
                                        {item.owner?.firstName} {item.owner?.lastName}
                                    </Typography>
                                    <Typography variant="caption" color="text.secondary">Verified Owner</Typography>
                                </Box>
                            </Box>
                            <Divider sx={{ my: 1.5 }} />
                            <Box className="admin-lost-view-contact-list">
                                <Box className="admin-lost-view-contact-item">
                                    <FaEnvelope /> <span>{item.owner?.email || 'N/A'}</span>
                                </Box>
                                <Box className="admin-lost-view-contact-item">
                                    <FaPhone /> <span>{item.owner?.phone || 'N/A'}</span>
                                </Box>
                            </Box>
                        </Paper>
                    </Grid>

                    <Grid item xs={12} md={7} className="admin-lost-view-col-right">
                        <Box className="admin-lost-view-scrollable">
                            
                            <Box className="admin-lost-view-tags-row">
                                <Chip label={item.mainCategory} className="admin-lost-view-cat-chip" />
                                <Chip icon={getIconForSubCategory(item.subCategory)} label={item.subCategory} variant="outlined" className="admin-lost-view-sub-chip" />
                            </Box>

                            <Typography className="admin-lost-view-section-label">SPECIFICATIONS</Typography>
                            <Box className="admin-lost-view-specs-grid">
                                <DetailRow icon={FaPalette} label="Color" value={item.color} />
                                <DetailRow icon={isPet ? FaPaw : FaTag} label={isPet ? "Breed" : "Brand"} value={isPet ? item.itemName : item.brand} />
                                <DetailRow icon={FaBarcode} label="Serial / ID" value={item.serialNumber} />
                                <DetailRow icon={FaCalendarAlt} label="Date Lost" value={new Date(item.lostDate).toLocaleDateString()} />
                                <DetailRow icon={FaClock} label="Time Lost" value={new Date(item.lostDate).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})} />
                            </Box>

                            <Box className="admin-lost-view-description-box">
                                <Typography className="admin-lost-view-section-label" sx={{ mb: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
                                    <FaInfoCircle /> DESCRIPTION
                                </Typography>
                                <Typography variant="body2" className="admin-lost-view-desc-text">
                                    {item.description || "No additional description provided by the owner."}
                                </Typography>
                            </Box>

                            <Typography className="admin-lost-view-section-label" sx={{ mt: 3 }}>LAST KNOWN LOCATION</Typography>
                            <Box className="admin-lost-view-location-block">
                                <Typography variant="body2" className="admin-lost-view-address">
                                    <FaMapMarkerAlt /> {item.lostLocationAddress}
                                </Typography>
                                <MapDisplay coords={item.lostLocation?.coordinates} />
                            </Box>

                        </Box>
                    </Grid>
                </Grid>
            </DialogContent>
            
            <DialogActions className="admin-lost-view-modal-footer">
                <Button onClick={onClose} variant="outlined" color="inherit">Close File</Button>
            </DialogActions>
        </Dialog>
    );
};

function AdminViewAllLost() {
  const [lostItems, setLostItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedItem, setSelectedItem] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);

  useEffect(() => {
    const fetchAllLostItems = async () => {
      try {
        setLoading(true);
        const response = await axiosInstance.get('/api/items/allItems');
        const filteredLostItems = response.data.data.filter(item => item.status === 'lost');
        setLostItems(filteredLostItems);
      } catch (err) {
        setError("Failed to fetch lost items.");
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

  return (
    <Box className="admin-lost-view-container">
      <Box className="admin-lost-view-header-box">
        <Typography variant="h4" className="admin-lost-view-header">View All Lost Items</Typography>
        <Typography variant="subtitle1" color="text.secondary">Administrative overview of community lost reports.</Typography>
      </Box>

      {loading && <Box className="admin-lost-view-loader"><CircularProgress /></Box>}
      {error && <Alert severity="error">{error}</Alert>}
      
      {!loading && !error && (
        lostItems.length === 0 ? (
          <Box className="admin-lost-view-empty">
             <FaSearch size={40} color="#ccc"/>
             <Typography color="text.secondary">No lost items found.</Typography>
          </Box>
        ) : (
          <Box className="admin-lost-view-grid">
            {lostItems.map((item) => (
              <Paper key={item._id} className="admin-lost-view-card">
                <Box className="admin-lost-view-card-img-box">
                  <img src={`http://localhost:5001/${item.itemImage.replace(/\\/g, '/')}`} alt={item.itemName} className="admin-lost-view-card-img" />
                  <Chip label={item.mainCategory} size="small" className="admin-lost-view-card-chip" />
                </Box>
                <Box className="admin-lost-view-card-content">
                  <Typography variant="h6" className="admin-lost-view-card-title">{item.itemName || item.petName}</Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, color: 'text.secondary', fontSize: '0.85rem', mb: 2 }}>
                      <FaMapMarkerAlt size={12}/>
                      <Typography variant="caption" noWrap>{item.lostLocationAddress?.split(',')[0] || 'Unknown'}</Typography>
                  </Box>
                  <Button fullWidth variant="contained" className="admin-lost-view-btn" onClick={() => handleOpenModal(item)}>
                    View Case Details
                  </Button>
                </Box>
              </Paper>
            ))}
          </Box>
        )
      )}

      <LostItemDetailModal open={modalOpen} onClose={handleCloseModal} item={selectedItem} />
    </Box>
  );
}

export default AdminViewAllLost;