// src/components/moderator/ModeratorsFound.js

import { useState, useEffect } from 'react';
import { Box, Typography, CircularProgress, Alert, Paper, Chip, Button, Avatar } from '@mui/material';
import { FaMapMarkerAlt, FaCalendarAlt, FaUserCheck, FaListUl, FaBuilding } from 'react-icons/fa';
import axiosInstance from '../../api/baseUrl';
import FoundItemDetailsModal from './FoundItemDetailsModal';
import '../../Styles/ModeratorsFound.css'; 

const getFinderName = (finder) => {
    if (!finder) return 'Anonymous';
    if (finder.organisationName) return finder.organisationName;
    if (finder.firstName) return `${finder.firstName} ${finder.lastName || ''}`.trim();
    return 'Unknown';
};

const getFinderImage = (finder) => {
    if (!finder) return '';
    const API_URL = 'http://localhost:5001';
    if (finder.organisationLogo) return `${API_URL}${finder.organisationLogo}`;
    if (finder.profileImage) return `${API_URL}${finder.profileImage}`;
    return '';
};

const FoundItemCard = ({ item, onManageClick }) => {
    const imageUrl = item.itemImage ? `http://localhost:5001/${item.itemImage}` : 'https://via.placeholder.com/300x200?text=No+Image';
    const finderName = getFinderName(item.finder);
    const finderImage = getFinderImage(item.finder);
    const isOrg = !!item.finder?.organisationName;

    return (
      <Paper elevation={0} className="mod-found-card">
        <Box className="mod-found-card-header">
            <img src={imageUrl} alt={item.itemName} className="mod-found-card-img" />
            <Chip label={item.mainCategory} className="mod-found-card-chip" size="small" />
        </Box>
        <Box className="mod-found-card-body">
            <Box className="mod-found-card-meta">
                 <Avatar src={finderImage} sx={{ width: 24, height: 24 }} className="mod-found-card-avatar" />
                 <Typography variant="caption" className="mod-found-card-user">{finderName}</Typography>
                 <span className="mod-found-dot">•</span>
                 <Typography variant="caption">{new Date(item.foundDate).toLocaleDateString()}</Typography>
            </Box>
            <Typography className="mod-found-card-title" noWrap title={item.itemName || item.petName}>
                {item.itemName || item.petName || 'Unnamed'}
            </Typography>
            <Box className="mod-found-card-loc">
                <FaMapMarkerAlt />
                <Typography variant="caption" noWrap>{item.foundLocationAddress}</Typography>
            </Box>
        </Box>
        <Button fullWidth className="mod-found-card-btn" onClick={() => onManageClick(item)}>
            Review Details
        </Button>
      </Paper>
    );
};

function ModeratorsFound() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Modal & Logic State
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [matchLoading, setMatchLoading] = useState(false);
  const [potentialMatches, setPotentialMatches] = useState([]);
  const [matchError, setMatchError] = useState(null);
  const [notifyingState, setNotifyingState] = useState({ loadingId: null, successId: null, error: null });

  useEffect(() => {
    const fetchItems = async () => {
        try {
            setLoading(true);
            const res = await axiosInstance.get('/api/items/status/found');
            if (res.data?.success) setItems(res.data.data);
        } catch (err) { setError('Failed to load items.'); } 
        finally { setLoading(false); }
    };
    fetchItems();
  }, []);

  const handleOpenModal = (item) => {
    setSelectedItem(item);
    setPotentialMatches([]);
    setMatchError(null);
    setNotifyingState({ loadingId: null, successId: null, error: null });
    setModalOpen(true);
  };

  const handleFindMatches = async () => {
    if (!selectedItem) return;
    setMatchLoading(true);
    setMatchError(null);
    setPotentialMatches([]);
    try {
      const res = await axiosInstance.get(`/api/items/match/${selectedItem._id}`);
      if(res.data?.success) setPotentialMatches(res.data.data);
      else throw new Error('No matches found');
    } catch (err) { setMatchError('Search failed.'); } 
    finally { setMatchLoading(false); }
  };

  const handleNotifyOwner = async (lostItem) => {
    const modId = JSON.parse(localStorage.getItem('moderatorInfo'))?._id;
    if (!modId) return alert("Please log in again");

    setNotifyingState({ loadingId: lostItem._id, successId: null, error: null });
    try {
      await axiosInstance.post('/api/items/notify/owner', {
        lostItemId: lostItem._id, foundItemId: selectedItem._id, moderatorId: modId,
      });
      setNotifyingState({ loadingId: null, successId: lostItem._id, error: null });
    } catch (err) {
      setNotifyingState({ loadingId: null, successId: null, error: { id: lostItem._id } });
    }
  };

  return (
    <Box className="mod-found-page">
      <Box className="mod-found-page-header">
        <Typography variant="h4" fontWeight="700">Found Items</Typography>
        <Typography variant="body2" color="text.secondary">Moderation Queue</Typography>
      </Box>
      
      {loading && <Box className="mod-found-loader"><CircularProgress color="warning" /></Box>}
      {!loading && items.length === 0 && <Alert severity="info">No found items reported.</Alert>}
      
      <Box className="mod-found-grid">
        {items.map((item) => <FoundItemCard key={item._id} item={item} onManageClick={handleOpenModal} />)}
      </Box>

      <FoundItemDetailsModal 
          open={modalOpen} onClose={() => setModalOpen(false)} item={selectedItem}
          onFindMatches={handleFindMatches} matchLoading={matchLoading}
          potentialMatches={potentialMatches} matchError={matchError}
          notifyingState={notifyingState} onNotifyOwner={handleNotifyOwner}
      />
    </Box>
  );
}

export default ModeratorsFound;