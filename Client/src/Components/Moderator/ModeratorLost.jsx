import React, { useState, useEffect } from 'react';
import {
  Box, Typography, CircularProgress, Alert, Paper, Chip, Button, Avatar
} from '@mui/material';
import { 
  FaMapMarkerAlt, FaUser, FaListUl
} from 'react-icons/fa';
import axiosInstance from '../../api/baseUrl';
import LostItemDetailsModal from './LostItemDetailsModal'; 
import '../../Styles/ModeratorLost.css';

const LostItemCard = ({ item, onManageClick }) => {
  const imageUrl = item.itemImage ? `http://localhost:5001/${item.itemImage}` : 'https://via.placeholder.com/300x200?text=No+Image';
  const ownerImageUrl = item.owner?.profileImage ? `http://localhost:5001${item.owner.profileImage}` : '';

  return (
    <Paper elevation={0} className="mod-lost-card">
        {/* Header Image */}
        <Box className="mod-lost-card-header">
            <img src={imageUrl} alt={item.itemName} className="mod-lost-card-img" />
            <Chip label={item.mainCategory} className="mod-lost-card-chip" size="small" />
        </Box>

        <Box className="mod-lost-card-body">
            <Box className="mod-lost-card-meta">
                 <Avatar src={ownerImageUrl} sx={{ width: 24, height: 24 }} className="mod-lost-card-avatar">
                    <FaUser style={{fontSize: 12}}/>
                 </Avatar>
                 <Typography variant="caption" className="mod-lost-card-user">{item.owner?.firstName || 'Unknown'}</Typography>
                 <span className="mod-lost-dot">•</span>
                 <Typography variant="caption">{new Date(item.lostDate).toLocaleDateString()}</Typography>
            </Box>

            <Typography className="mod-lost-card-title" noWrap title={item.itemName || item.petName}>
                {item.itemName || item.petName || 'Unnamed Item'}
            </Typography>

            <Box className="mod-lost-card-loc">
                <FaMapMarkerAlt />
                <Typography variant="caption" noWrap>{item.lostLocationAddress}</Typography>
            </Box>
        </Box>

        <Button fullWidth className="mod-lost-card-btn" onClick={() => onManageClick(item)}>
            View Report
        </Button>
    </Paper>
  );
};

function ModeratorLost() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);

  useEffect(() => {
    const fetchLostItems = async () => {
        try {
          setLoading(true);
          const response = await axiosInstance.get('/api/items/status/lost');
          if (response.data?.success) {
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

  const handleOpenModal = (item) => {
      setSelectedItem(item);
      setModalOpen(true);
  };

  const handleCloseModal = () => {
      setModalOpen(false);
      setSelectedItem(null);
  };
  
  return (
    <Box className="mod-lost-page">
      <Box className="mod-lost-page-header-container">
        <Typography variant="h4" className="mod-lost-page-header">
          Lost Item Reports
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Review items reported as lost by users.
        </Typography>
      </Box>
      
      {loading && <Box className="mod-lost-loader"><CircularProgress color="warning" /></Box>}
      
      {error && <Alert severity="error" sx={{mb: 3}}>{error}</Alert>}
      
      {!loading && !error && items.length === 0 && (
        <Box className="mod-lost-empty-state">
            <FaListUl />
            <Typography variant="h6">No Lost Items</Typography>
            <Typography variant="body2">No items are currently reported as lost.</Typography>
        </Box>
      )}
  
      {!loading && items.length > 0 && (
        <Box className="mod-lost-items-grid">
          {items.map((item) => <LostItemCard key={item._id} item={item} onManageClick={handleOpenModal} />)}
        </Box>
      )}

      <LostItemDetailsModal 
        open={modalOpen} 
        onClose={handleCloseModal} 
        item={selectedItem} 
      />
    </Box>
  );
}

export default ModeratorLost;