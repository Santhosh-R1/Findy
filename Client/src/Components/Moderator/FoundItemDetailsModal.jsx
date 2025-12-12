import React from 'react';
import {
  Box, Typography, Paper, Chip, Button, Dialog, DialogActions, 
  DialogContent, DialogTitle, Avatar, Grid, LinearProgress, Divider, 
  Alert, IconButton, Tooltip
} from '@mui/material';
import { 
  FaMapMarkerAlt, FaCalendarAlt, FaUserCheck, FaEnvelope, FaTag, 
  FaPalette, FaInfoCircle, FaPhone, FaSearch, FaBell, FaSearchMinus, 
  FaCheckCircle, FaExclamationTriangle, FaPaw, FaBuilding, FaTimes, FaHashtag
} from 'react-icons/fa';
import LocationMap from './LocationMap'; 

const getFinderName = (finder) => {
    if (!finder) return 'Anonymous';
    if (finder.organisationName) return finder.organisationName;
    if (finder.firstName) return `${finder.firstName} ${finder.lastName || ''}`.trim();
    return 'Unknown Reporter';
};

const getFinderImage = (finder) => {
    if (!finder) return '';
    const API_URL = 'http://localhost:5001';
    if (finder.organisationLogo) return `${API_URL}${finder.organisationLogo}`;
    if (finder.profileImage) return `${API_URL}${finder.profileImage}`;
    return '';
};

const FoundItemDetailsModal = ({ 
    open, onClose, item, onFindMatches, matchLoading, 
    potentialMatches, matchError, notifyingState, onNotifyOwner 
}) => {
    if (!item) return null;

    const finderName = getFinderName(item.finder);
    const finderImage = getFinderImage(item.finder);
    const isOrg = !!item.finder?.organisationName;
    const isPet = item.mainCategory === 'pets';
    const hasCoordinates = item.foundLocation?.coordinates?.length === 2;
    const mapPosition = hasCoordinates ? [item.foundLocation.coordinates[1], item.foundLocation.coordinates[0]] : null;
    const API_URL = 'http://localhost:5001';

    return (
        <Dialog 
            open={open} 
            onClose={onClose} 
            maxWidth="md" 
            fullWidth 
            PaperProps={{ className: "mod-found-modal-paper" }}
            scroll="paper"
        >
            <DialogTitle className="mod-found-modal-header">
                <Box className="mod-found-header-content">
                    <Typography variant="h6" className="mod-found-header-title">
                        Case Review
                    </Typography>
                    <Chip 
                        icon={<FaHashtag style={{ fontSize: 10 }} />} 
                        label={item._id.slice(-6).toUpperCase()} 
                        size="small" 
                        className="mod-found-id-chip" 
                    />
                </Box>
                <IconButton onClick={onClose} size="small" className="mod-found-close-btn">
                    <FaTimes />
                </IconButton>
            </DialogTitle>

            <DialogContent className="mod-found-modal-body">
                
                <Box className="mod-found-hero-section">
                    <Box className="mod-found-hero-image-wrapper">
                        <img 
                            src={item.itemImage ? `${API_URL}/${item.itemImage}` : 'https://via.placeholder.com/150'} 
                            alt={item.itemName} 
                            className="mod-found-hero-image" 
                        />
                    </Box>
                    <Box className="mod-found-hero-info">
                        <Typography variant="h5" className="mod-found-item-name">
                            {item.itemName || item.petName || 'Unnamed Item'}
                        </Typography>
                        <Box className="mod-found-tags-row">
                            <Chip label={item.mainCategory} size="small" className="mod-found-tag-primary" />
                            <Chip label={item.subCategory} size="small" variant="outlined" className="mod-found-tag-secondary" />
                            <Chip label={item.status || 'Found'} size="small" color="success" className="mod-found-tag-status" />
                        </Box>
                        
                        <Divider sx={{ my: 1.5 }} />
                        
                        <Box className="mod-found-finder-row">
                            <Avatar src={finderImage} sx={{ width: 32, height: 32 }} className="mod-found-finder-avatar">
                                {isOrg ? <FaBuilding /> : <FaUserCheck />}
                            </Avatar>
                            <Box>
                                <Typography variant="caption" display="block" color="text.secondary">Reported By</Typography>
                                <Typography variant="body2" fontWeight="600">{finderName}</Typography>
                            </Box>
                            <Box sx={{ ml: 'auto', textAlign: 'right' }}>
                                <Typography variant="caption" display="block" color="text.secondary">Date Found</Typography>
                                <Typography variant="body2" fontWeight="600">
                                    {new Date(item.foundDate).toLocaleDateString()}
                                </Typography>
                            </Box>
                        </Box>
                    </Box>
                </Box>

                <Divider className="mod-found-divider" />

                <Box className="mod-found-section">
                    <Typography className="mod-found-section-label">ITEM DETAILS</Typography>
                    <Grid container spacing={2}>
                        <Grid item xs={6} sm={4}>
                            <Box className="mod-found-detail-cell">
                                <FaPalette className="mod-found-icon-muted" />
                                <Box>
                                    <Typography variant="caption">Color</Typography>
                                    <Typography variant="body2" fontWeight="500">{item.color || 'N/A'}</Typography>
                                </Box>
                            </Box>
                        </Grid>
                        <Grid item xs={6} sm={4}>
                            <Box className="mod-found-detail-cell">
                                {isPet ? <FaPaw className="mod-found-icon-muted"/> : <FaTag className="mod-found-icon-muted"/>}
                                <Box>
                                    <Typography variant="caption">{isPet ? 'Breed' : 'Brand'}</Typography>
                                    <Typography variant="body2" fontWeight="500">{item.subCategory || item.brand || 'N/A'}</Typography>
                                </Box>
                            </Box>
                        </Grid>
                        <Grid item xs={12} sm={4}>
                             <Box className="mod-found-detail-cell">
                                <FaMapMarkerAlt className="mod-found-icon-muted" />
                                <Box>
                                    <Typography variant="caption">Location</Typography>
                                    <Typography variant="body2" fontWeight="500" noWrap title={item.foundLocationAddress}>
                                        {item.foundLocationAddress}
                                    </Typography>
                                </Box>
                            </Box>
                        </Grid>
                    </Grid>

                    <Box className="mod-found-description-box">
                        <Typography variant="subtitle2" sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                            <FaInfoCircle /> Description
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                            {item.description || 'No additional description provided.'}
                        </Typography>
                    </Box>

                    <Box className="mod-found-contact-box">
                         <Typography className="mod-found-section-label" sx={{mb:1}}>CONTACT INFO</Typography>
                         <Box sx={{ display: 'flex', gap: 3 }}>
                            <Typography variant="body2" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <FaEnvelope className="mod-found-icon-primary"/> {item.finder?.email}
                            </Typography>
                            <Typography variant="body2" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <FaPhone className="mod-found-icon-primary"/> {item.finder?.phone || 'N/A'}
                            </Typography>
                         </Box>
                    </Box>
                </Box>

                {hasCoordinates && (
                    <Box className="mod-found-map-wrapper">
                        <LocationMap position={mapPosition} />
                    </Box>
                )}

                <Box className="mod-found-ai-container">
                    <Box className="mod-found-ai-header">
                        <Typography variant="subtitle1" fontWeight="bold">AI Match Assistant</Typography>
                        <Button 
                            size="small" 
                            variant="contained" 
                            onClick={onFindMatches} 
                            disabled={matchLoading}
                            className="mod-found-ai-btn"
                            startIcon={<FaSearch />}
                        >
                            {matchLoading ? 'Scanning...' : 'Run Search'}
                        </Button>
                    </Box>
                    
                    {matchLoading && <LinearProgress className="mod-found-ai-progress" />}
                    {matchError && <Alert severity="error" className="mod-found-ai-alert">{matchError}</Alert>}

                    <Box className="mod-found-ai-results">
                        {potentialMatches.length > 0 ? (
                            potentialMatches.map(({ score, lostItemDetails: lost }) => (
                                <Box key={lost._id} className="mod-found-match-card">
                                    <img src={`${API_URL}/${lost.itemImage}`} alt="" className="mod-found-match-thumb"/>
                                    <Box className="mod-found-match-info">
                                        <Box sx={{display:'flex', justifyContent:'space-between'}}>
                                            <Typography variant="body2" fontWeight="bold">{lost.itemName || lost.petName}</Typography>
                                            <Chip label={`${(score * 100).toFixed(0)}%`} size="small" color={score > 0.8 ? "success" : "warning"} className="mod-found-score-chip" />
                                        </Box>
                                        <Typography variant="caption" color="text.secondary">Owner: {lost.owner?.firstName} ({lost.owner?.email})</Typography>
                                    </Box>
                                    <Tooltip title={notifyingState.successId === lost._id ? "Sent" : "Notify Owner"}>
                                        <IconButton 
                                            size="small" 
                                            className={`mod-found-notify-icon-btn ${notifyingState.successId === lost._id ? 'success' : ''}`}
                                            onClick={() => onNotifyOwner(lost)}
                                            disabled={notifyingState.loadingId === lost._id || notifyingState.successId === lost._id}
                                        >
                                           {notifyingState.successId === lost._id ? <FaCheckCircle/> : <FaBell />}
                                        </IconButton>
                                    </Tooltip>
                                </Box>
                            ))
                        ) : (
                            !matchLoading && (
                                <Typography variant="caption" className="mod-found-empty-text">
                                    Click "Run Search" to compare against Lost items.
                                </Typography>
                            )
                        )}
                    </Box>
                </Box>

            </DialogContent>
            <DialogActions className="mod-found-modal-footer">
                <Button onClick={onClose} className="mod-found-footer-btn">Close Case</Button>
            </DialogActions>
        </Dialog>
    );
};

export default FoundItemDetailsModal;