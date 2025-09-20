// src/components/moderator/ModeratorsFound.js
// PASTE AND REPLACE YOUR ENTIRE COMPONENT WITH THIS CODE

import { useState, useEffect } from 'react';
import {
  Box, Typography, CircularProgress, Alert, Paper, Chip, Button,
  Dialog, DialogActions, DialogContent, DialogTitle, Avatar, Grid, LinearProgress, Divider
} from '@mui/material';
import { 
  FaMapMarkerAlt, FaCalendarAlt, FaUserCheck, FaEnvelope, FaListUl,
  FaTag, FaPalette, FaInfoCircle, FaPhone, FaSearch, FaBell, FaSearchMinus, FaCheckCircle, FaExclamationTriangle,
  FaPaw
} from 'react-icons/fa';
import axiosInstance from '../../api/baseUrl';
import LocationMap from './LocationMap'; 
import '../../Styles/ModeratorsFound.css'; 

const FoundItemCard = ({ item, onManageClick }) => {
    const imageUrl = item.itemImage ? `http://localhost:5001/${item.itemImage}` : 'https://via.placeholder.com/300x200?text=No+Image';
    const finderImageUrl = item.finder?.profileImage ? `http://localhost:5001${item.finder.profileImage}` : '';
    const finderName = item.finder ? `${item.finder.firstName} ${item.finder.lastName || ''}`.trim() : 'Anonymous';

    const formattedFoundDate = new Date(item.foundDate).toLocaleString('en-US', {
      year: 'numeric', month: 'long', day: 'numeric',
    });
  
    return (
      <Paper elevation={0} variant="outlined" className="mod-found-item-card">
        <Box className="mod-found-card-image-container">
          <img src={imageUrl} alt={item.itemName || item.petName} className="mod-found-card-image" />
          <Chip label={`${item.mainCategory} / ${item.subCategory}`} size="small" className="mod-found-category-chip" />
        </Box>
        <Box className="mod-found-card-content">
          <Box className="mod-found-finder-info-container">
            <Avatar src={finderImageUrl} sx={{ width: 40, height: 40 }}><FaUserCheck /></Avatar>
            <Box>
              <Typography className="mod-found-finder-name" title={finderName}>Reported by: {finderName}</Typography>
              <Typography variant="caption" className="mod-found-finder-email" title={item.finder?.email || 'N/A'}>
                {item.finder?.email || 'Details withheld'}
              </Typography>
            </Box>
          </Box>
          <Typography variant="h6" className="mod-found-item-title">{item.itemName || item.petName || 'Unnamed Item'}</Typography>
          <Typography variant="body2" color="text.secondary" className="mod-found-item-description">{item.description || 'No description provided.'}</Typography>
          <Box className="mod-found-item-details-grid">
              <Box className="mod-found-detail-item"><FaCalendarAlt /><span>{formattedFoundDate}</span></Box>
              <Box className="mod-found-detail-item"><FaMapMarkerAlt /><span>{item.foundLocationAddress}</span></Box>
          </Box>
        </Box>
        <Box className="mod-found-card-actions">
          <Button fullWidth variant="contained" className="mod-found-manage-item-btn" onClick={() => onManageClick(item)}>
              Manage Item
          </Button>
        </Box>
      </Paper>
    );
};

function ModeratorsFound() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [modalState, setModalState] = useState({ open: false, selectedItem: null });
  const [matchLoading, setMatchLoading] = useState(false);
  const [potentialMatches, setPotentialMatches] = useState([]);
  const [matchError, setMatchError] = useState(null);
  const [notifyingState, setNotifyingState] = useState({ loadingId: null, successId: null, error: null });

  useEffect(() => {
    const fetchFoundItems = async () => {
      try {
        setLoading(true);
        const response = await axiosInstance.get('/api/items/status/found');
        if (response.data?.success) {
          setItems(response.data.data);
        } else {
          throw new Error('Failed to fetch data');
        }
      } catch (err) {
        console.error("Error fetching found items:", err);
        setError('Could not retrieve found items.');
      } finally {
        setLoading(false);
      }
    };
    fetchFoundItems();
  }, []);

  const handleOpenModal = (item) => {
    setPotentialMatches([]);
    setMatchError(null);
    setNotifyingState({ loadingId: null, successId: null, error: null });
    setModalState({ open: true, selectedItem: item });
  };
  const handleCloseModal = () => setModalState({ open: false, selectedItem: null });
  
  const handleFindMatches = async () => {
    if (!modalState.selectedItem) return;
    setMatchLoading(true);
    setMatchError(null);
    setPotentialMatches([]);
    try {
      const response = await axiosInstance.get(`/api/items/match/${modalState.selectedItem._id}`);
      if(response.data?.success) {
        setPotentialMatches(response.data.data);
      } else {
        throw new Error(response.data?.message || 'Failed to find matches.');
      }
    } catch (err) {
      console.error("Error finding matches:", err);
      setMatchError(err.response?.data?.message || 'An error occurred while searching for matches.');
    } finally {
      setMatchLoading(false);
    }
  };

  // --- START OF CHANGE: Updated function to send moderator ID ---
  const handleNotifyOwner = async (lostItem, foundItem) => {
    // 1. Get moderator info from localStorage
    const moderatorInfo = JSON.parse(localStorage.getItem('moderatorInfo'));
    const moderatorId = moderatorInfo?._id;

    // 2. Validate moderator ID
    if (!moderatorId) {
        console.error("Moderator ID not found. Please log in again.");
        setNotifyingState({ 
            loadingId: null, 
            successId: null, 
            error: { id: lostItem._id, message: "Authentication error. Please re-login." } 
        });
        return;
    }

    setNotifyingState({ loadingId: lostItem._id, successId: null, error: null });
    try {
      // 3. Send moderatorId in the request payload
      await axiosInstance.post('/api/items/notify/owner', {
        lostItemId: lostItem._id,
        foundItemId: foundItem._id,
        moderatorId: moderatorId,
      });
      setNotifyingState({ loadingId: null, successId: lostItem._id, error: null });
    } catch (err) {
      console.error("Error notifying owner:", err);
      let errorMessage = "Failed to send notification.";
      if (err.response?.status === 409) {
          errorMessage = err.response?.data?.message || "Notification has already been sent.";
      }
      setNotifyingState({ 
          loadingId: null, 
          successId: null, 
          error: { id: lostItem._id, message: errorMessage } 
      });
    }
  };
  // --- END OF CHANGE ---

  const renderContent = () => {
    if (loading) return <Box className="mod-found-status-container"><CircularProgress color="warning" /></Box>;
    if (error) return <Box className="mod-found-status-container"><Alert severity="error">{error}</Alert></Box>;
    if (items.length === 0) return (
      <Box className="mod-found-status-container mod-found-no-items">
        <FaListUl className="mod-found-no-items-icon" />
        <Typography variant="h5">No Found Items</Typography>
        <Typography color="text.secondary">No items are currently reported as found.</Typography>
      </Box>
    );
    return (
      <Box className="mod-found-items-grid">
        {items.map((item) => <FoundItemCard key={item._id} item={item} onManageClick={handleOpenModal} />)}
      </Box>
    );
  };

  const selectedItem = modalState.selectedItem;
  const isPet = selectedItem?.mainCategory === 'pets';
  const hasCoordinates = selectedItem?.foundLocation?.coordinates?.length === 2;
  const mapPosition = hasCoordinates ? [selectedItem.foundLocation.coordinates[1], selectedItem.foundLocation.coordinates[0]] : null;

  return (
    <Box className="mod-found-page">
      <Box className="mod-found-page-header-container">
        <Typography variant="h4" component="h1" className="mod-found-page-header">Found Item Reports</Typography>
        <Typography variant="subtitle1" className="mod-found-page-subtitle">Review items reported as found by users and organizations.</Typography>
      </Box>
      
      {renderContent()}

      <Dialog 
        open={modalState.open} 
        onClose={handleCloseModal} 
        maxWidth="lg" 
        fullWidth 
        PaperProps={{ className: "mod-found-dialog-paper" }}
      >
        <DialogTitle className="mod-found-dialog-title">
          <FaUserCheck />
          Manage Found Item: "{selectedItem?.itemName || selectedItem?.petName || 'Unnamed Item'}"
        </DialogTitle>
        <DialogContent dividers className="mod-found-dialog-content">
          {selectedItem && (
            <Grid container spacing={0} sx={{ height: '100%' }}>
              <Grid item xs={12} md={5} className="mod-found-dialog-column-left">
                <img src={`http://localhost:5001/${selectedItem.itemImage}`} alt={selectedItem.itemName || selectedItem.petName} className="mod-found-dialog-image" />
                <Typography variant="h6" gutterBottom>Finder Information</Typography>
                <Paper variant="outlined" className="mod-found-info-paper">
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                      <Avatar src={selectedItem.finder?.profileImage ? `http://localhost:5001${selectedItem.finder.profileImage}` : ''} sx={{ width: 56, height: 56 }} />
                      <Box>
                          <Typography fontWeight="bold">{selectedItem.finder ? `${selectedItem.finder.firstName} ${selectedItem.finder.lastName || ''}` : 'Anonymous'}</Typography>
                          <Typography variant="body2" color="text.secondary">{selectedItem.finder?.gender || 'Details unavailable'}</Typography>
                      </Box>
                    </Box>
                    <Divider />
                    <Box sx={{ pt: 2, display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                        <Typography variant="body2" className="mod-found-info-line"><FaEnvelope /><strong>Email:</strong><span className="mod-found-info-value">{selectedItem.finder?.email || 'N/A'}</span></Typography>
                        <Typography variant="body2" className="mod-found-info-line"><FaPhone /><strong>Phone:</strong><span className="mod-found-info-value">{selectedItem.finder?.phone || 'N/A'}</span></Typography>
                    </Box>
                </Paper>
              </Grid>
              <Grid item xs={12} md={7} className="mod-found-dialog-column-right">
                <Box className="mod-found-dialog-scroll-section">
                    <Typography variant="h6" gutterBottom>Item Specifics</Typography>
                    {isPet ? (
                      <Paper variant="outlined" className="mod-found-info-paper">
                        <Typography variant="body2" className="mod-found-info-line"><strong><FaPaw /> Breed:</strong> <span className="mod-found-info-value">{selectedItem.subCategory || 'N/A'}</span></Typography>
                        <Typography variant="body2" className="mod-found-info-line"><strong><FaPalette /> Color:</strong> <span className="mod-found-info-value">{selectedItem.color || 'N/A'}</span></Typography>
                        <Typography variant="body2" className="mod-found-info-line"><strong><FaCalendarAlt /> Found Date:</strong> <span className="mod-found-info-value">{new Date(selectedItem.foundDate).toLocaleDateString()}</span></Typography>
                        <Divider sx={{ my: 1.5 }} />
                        <Typography variant="body2"><strong><FaInfoCircle /> Description:</strong> {selectedItem.description || 'No description'}</Typography>
                      </Paper>
                    ) : (
                      <Paper variant="outlined" className="mod-found-info-paper">
                        <Typography variant="body2" className="mod-found-info-line"><strong><FaTag /> Brand:</strong> <span className="mod-found-info-value">{selectedItem.brand || 'N/A'}</span></Typography>
                        <Typography variant="body2" className="mod-found-info-line"><strong><FaPalette /> Color:</strong> <span className="mod-found-info-value">{selectedItem.color || 'N/A'}</span></Typography>
                        <Typography variant="body2" className="mod-found-info-line"><strong><FaCalendarAlt /> Found Date:</strong> <span className="mod-found-info-value">{new Date(selectedItem.foundDate).toLocaleDateString()}</span></Typography>
                        <Divider sx={{ my: 1.5 }} />
                        <Typography variant="body2"><strong><FaInfoCircle /> Description:</strong> {selectedItem.description || 'No description'}</Typography>
                      </Paper>
                    )}
                    <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>Found Location</Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5 }}>{selectedItem.foundLocationAddress}</Typography>
                    {hasCoordinates ? <LocationMap position={mapPosition} /> : <Alert severity="warning" sx={{ mt: 2 }}>Map coordinates are not available.</Alert>}
                </Box>
                <Divider sx={{ my: 2 }}><Chip label="AI Matching Tool" color="primary"/></Divider>
                <Box className="mod-found-match-tool">
                  <Box className="mod-found-match-actions">
                    <Button onClick={handleFindMatches} variant="contained" disabled={matchLoading} className="mod-found-manage-item-btn" startIcon={<FaSearch />}>
                        {matchLoading ? 'Searching...' : 'Find Potential Matches'}
                    </Button>
                  </Box>
                  {matchLoading && <LinearProgress color="warning" sx={{ my: 2 }} />}
                  {matchError && <Alert severity="error" sx={{ mt: 2 }}>{matchError}</Alert>}
                  <Box className="mod-found-match-results-list">
                    {potentialMatches.length > 0 && potentialMatches.map(({ score, lostItemDetails: lostItem }) => {
                        const isLoading = notifyingState.loadingId === lostItem._id;
                        const isSuccess = notifyingState.successId === lostItem._id;
                        const isError = notifyingState.error?.id === lostItem._id;
                        const errorMessage = isError ? notifyingState.error.message : '';
                        return (
                          <Paper key={lostItem._id} variant="outlined" className="mod-found-match-item">
                             <Box className="mod-found-match-score">
                                <Typography variant="caption" >Match</Typography>
                                <Chip label={`${(score * 100).toFixed(0)}%`} color={score > 0.7 ? "primary" : "default"} size="small" />
                             </Box>
                             <img src={`http://localhost:5001/${lostItem.itemImage}`} alt={lostItem.itemName || lostItem.petName} className="mod-found-match-image"/>
                             <Box className="mod-found-match-details">
                                <Typography fontWeight="bold">{lostItem.itemName || lostItem.petName}</Typography>
                                <Typography variant="body2" color="text.secondary">Lost by: {lostItem.owner?.firstName || 'N/A'}</Typography>
                                <Typography variant="caption" color="text.secondary">{lostItem.owner?.email || 'No contact'}</Typography>
                             </Box>
                             <Box className="mod-found-match-notify-action">
                                <Button size="small" variant="outlined" className="mod-found-notify-btn" startIcon={isSuccess ? <FaCheckCircle /> : isError ? <FaExclamationTriangle /> : <FaBell/>} onClick={() => handleNotifyOwner(lostItem, selectedItem)} disabled={isLoading || isSuccess || isError} color={isSuccess ? "success" : isError ? "error" : "primary"}>
                                  {isLoading ? 'Notifying...' : isSuccess ? 'Notified' : isError ? 'Failed' : 'Notify Owner'}
                                </Button>
                                {isError && (
                                    <Typography variant="caption" color="error" className="mod-found-notify-error-msg">
                                        {errorMessage}
                                    </Typography>
                                )}
                             </Box>
                          </Paper>
                        );
                    })}
                    {!matchLoading && potentialMatches.length === 0 && modalState.selectedItem && (
                       <Box className="mod-found-match-placeholder">
                         <FaSearchMinus />
                         <Typography>Click "Find Potential Matches" to search for lost items.</Typography>
                       </Box>
                    )}
                  </Box>
                </Box>
              </Grid>
            </Grid>
          )}
        </DialogContent>
        <DialogActions className="mod-found-dialog-actions">
          <Button onClick={handleCloseModal} variant="outlined" color="secondary">Close</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default ModeratorsFound;