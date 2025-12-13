import React from 'react';
import {
  Box, Typography, Button, Dialog, DialogActions, 
  DialogContent, DialogTitle, Avatar, Grid, Divider, 
  IconButton, Chip
} from '@mui/material';
import { 
  FaMapMarkerAlt, FaCalendarAlt, FaUser, FaEnvelope, FaTag, 
  FaPalette, FaInfoCircle, FaPhone, FaTimes, FaHashtag, FaPaw, FaClock
} from 'react-icons/fa';
import LocationMap from './LocationMap'; 

const LostItemDetailsModal = ({ open, onClose, item }) => {
    if (!item) return null;

    const API_URL = 'http://localhost:5001';
    const isPet = item.mainCategory === 'pets';
    const hasCoordinates = item.lostLocation?.coordinates?.length === 2;
    const mapPosition = hasCoordinates ? [item.lostLocation.coordinates[1], item.lostLocation.coordinates[0]] : null;
    
    const ownerImage = item.owner?.profileImage 
        ? `${API_URL}${item.owner.profileImage}` 
        : '';

    return (
        <Dialog 
            open={open} 
            onClose={onClose} 
            maxWidth="md" 
            fullWidth 
            PaperProps={{ className: "mod-lost-modal-paper" }}
            scroll="paper"
        >
            {/* --- HEADER --- */}
            <DialogTitle className="mod-lost-modal-header">
                <Box className="mod-lost-header-content">
                    <Typography variant="h6" className="mod-lost-header-title">
                        Lost Item Report
                    </Typography>
                    <Chip 
                        icon={<FaHashtag style={{ fontSize: 10 }} />} 
                        label={item._id.slice(-6).toUpperCase()} 
                        size="small" 
                        className="mod-lost-id-chip" 
                    />
                </Box>
                <IconButton onClick={onClose} size="small" className="mod-lost-close-btn">
                    <FaTimes />
                </IconButton>
            </DialogTitle>

            <DialogContent className="mod-lost-modal-body">
                
                <Box className="mod-lost-hero-section">
                    <Box className="mod-lost-hero-image-wrapper">
                        <img 
                            src={item.itemImage ? `${API_URL}/${item.itemImage}` : 'https://via.placeholder.com/150'} 
                            alt={item.itemName} 
                            className="mod-lost-hero-image" 
                        />
                    </Box>
                    <Box className="mod-lost-hero-info">
                        <Typography variant="h5" className="mod-lost-item-name">
                            {item.itemName || item.petName || 'Unnamed Item'}
                        </Typography>
                        
                        <Box className="mod-lost-tags-row">
                            <Chip label={item.mainCategory} size="small" className="mod-lost-tag-primary" />
                            <Chip label={item.subCategory} size="small" variant="outlined" className="mod-lost-tag-secondary" />
                            <Chip label="Lost" size="small" color="error" className="mod-lost-tag-status" />
                        </Box>
                        
                        <Divider sx={{ my: 1.5 }} />
                        
                        {/* Owner Mini Profile */}
                        <Box className="mod-lost-owner-row">
                            <Avatar src={ownerImage} sx={{ width: 32, height: 32 }} className="mod-lost-owner-avatar">
                                <FaUser />
                            </Avatar>
                            <Box>
                                <Typography variant="caption" display="block" color="text.secondary">Owner</Typography>
                                <Typography variant="body2" fontWeight="600">{item.owner?.firstName || 'Unknown'}</Typography>
                            </Box>
                            <Box sx={{ ml: 'auto', textAlign: 'right' }}>
                                <Typography variant="caption" display="block" color="text.secondary">Date Lost</Typography>
                                <Typography variant="body2" fontWeight="600">
                                    {new Date(item.lostDate).toLocaleDateString()}
                                </Typography>
                            </Box>
                        </Box>
                    </Box>
                </Box>

                <Divider className="mod-lost-divider" />

                <Box className="mod-lost-section">
                    <Typography className="mod-lost-section-label">ITEM DETAILS</Typography>
                    <Grid container spacing={2}>
                        <Grid item xs={6} sm={4}>
                            <Box className="mod-lost-detail-cell">
                                <FaPalette className="mod-lost-icon-muted" />
                                <Box>
                                    <Typography variant="caption">Color</Typography>
                                    <Typography variant="body2" fontWeight="500">{item.color || 'N/A'}</Typography>
                                </Box>
                            </Box>
                        </Grid>
                        <Grid item xs={6} sm={4}>
                            <Box className="mod-lost-detail-cell">
                                {isPet ? <FaPaw className="mod-lost-icon-muted"/> : <FaTag className="mod-lost-icon-muted"/>}
                                <Box>
                                    <Typography variant="caption">{isPet ? 'Breed' : 'Brand'}</Typography>
                                    <Typography variant="body2" fontWeight="500">{item.subCategory || item.brand || 'N/A'}</Typography>
                                </Box>
                            </Box>
                        </Grid>
                        <Grid item xs={12} sm={4}>
                             <Box className="mod-lost-detail-cell">
                                <FaClock className="mod-lost-icon-muted" />
                                <Box>
                                    <Typography variant="caption">Time</Typography>
                                    <Typography variant="body2" fontWeight="500">
                                        {new Date(item.lostDate).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                                    </Typography>
                                </Box>
                            </Box>
                        </Grid>
                    </Grid>

                    <Box className="mod-lost-description-box">
                        <Typography variant="subtitle2" sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                            <FaInfoCircle /> Description
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                            {item.description || 'No additional description provided.'}
                        </Typography>
                    </Box>

                    {/* Location & Map */}
                    <Box className="mod-lost-location-box">
                        <Typography className="mod-lost-section-label" sx={{mb:1}}>LAST SEEN LOCATION</Typography>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                            <FaMapMarkerAlt className="mod-lost-icon-primary"/> 
                            <Typography variant="body2" fontWeight="500">{item.lostLocationAddress}</Typography>
                        </Box>
                        
                        {hasCoordinates ? (
                            <Box className="mod-lost-map-wrapper">
                                <LocationMap position={mapPosition} />
                            </Box>
                        ) : (
                            <Typography variant="caption" color="error">GPS Coordinates unavailable</Typography>
                        )}
                    </Box>

                    <Box className="mod-lost-contact-box">
                         <Typography className="mod-lost-section-label" sx={{mb:1}}>OWNER CONTACT</Typography>
                         <Grid container spacing={2}>
                            <Grid item xs={12} sm={6}>
                                <Typography variant="body2" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                    <FaEnvelope className="mod-lost-icon-primary"/> {item.owner?.email || 'N/A'}
                                </Typography>
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <Typography variant="body2" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                    <FaPhone className="mod-lost-icon-primary"/> {item.owner?.phone || 'N/A'}
                                </Typography>
                            </Grid>
                         </Grid>
                    </Box>
                </Box>

            </DialogContent>
            <DialogActions className="mod-lost-modal-footer">
                <Button onClick={onClose} className="mod-lost-footer-btn">Close Report</Button>
            </DialogActions>
        </Dialog>
    );
};

export default LostItemDetailsModal;