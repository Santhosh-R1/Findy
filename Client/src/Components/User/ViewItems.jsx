import React, { useState, useEffect } from 'react';
import {
  Box, Typography, CircularProgress, Alert, Paper, Chip, Button, Dialog, DialogActions, DialogContent,
  DialogContentText, DialogTitle, TextField, FormControl, InputLabel, FormHelperText, InputAdornment
} from '@mui/material';
import { Link } from 'react-router-dom';
import {
  FaPaw, FaLaptop, FaMobileAlt, FaDog, FaCat, FaBarcode, FaPalette, FaEdit, FaExclamationTriangle,
  FaPlus, FaTrash, FaCalendarAlt, FaWallet // 1. Import FaWallet icon
} from 'react-icons/fa';
import { GeoapifyGeocoderAutocomplete, GeoapifyContext } from '@geoapify/react-geocoder-autocomplete';
import axiosInstance from '../../api/baseUrl';
import '../../Styles/ViewItems.css';
import '@geoapify/geocoder-autocomplete/styles/minimal.css';

const getIconForSubCategory = (subCategory) => {
  // 2. Add 'wallet' to the icons mapping
  const icons = { 
    phone: <FaMobileAlt />, 
    laptop: <FaLaptop />, 
    dog: <FaDog />, 
    cat: <FaCat />,
    wallet: <FaWallet /> 
  };
  return icons[subCategory] || <FaPaw />;
};

const getTodayDateString = () => new Date().toISOString().split("T")[0];

function ViewItems() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [updatingItemId, setUpdatingItemId] = useState(null);

  const [modalState, setModalState] = useState({
    open: false,
    actionType: null,
    itemId: null,
    itemName: '',
  });

  const [lostForm, setLostForm] = useState({
    lostDate: '',
    location: null,
  });
  const [lostFormErrors, setLostFormErrors] = useState({});
  const [geoKey, setGeoKey] = useState(Date.now());

  useEffect(() => {
    const fetchUserItems = async () => {
      try {
        setLoading(true);
        const userInfo = JSON.parse(localStorage.getItem('userInfo'));
        if (!userInfo || !userInfo._id) throw new Error("Authentication error. Please log in again.");

        const response = await axiosInstance.get(`/api/items/user/${userInfo._id}`);
        setItems(response.data.data);
        setError(null);
      } catch (err) {
        console.error("Fetch items error:", err);
        setError(err.response?.data?.message || "Failed to fetch your items.");
      } finally {
        setLoading(false);
      }
    };
    fetchUserItems();
  }, []);

  const handleOpenModal = (actionType, item) => {
    if (actionType === 'reportLost') {
      setLostForm({ lostDate: '', location: null });
      setLostFormErrors({});
      setGeoKey(Date.now());
    }

    setModalState({
      open: true,
      actionType,
      itemId: item._id,
      itemName: item.mainCategory === 'pets' ? item.petName : item.itemName,
    });
  };

  const handleCloseModal = () => {
    setModalState({ open: false, actionType: null, itemId: null, itemName: '' });
  };

  const handleLostFormChange = (e) => {
    setLostForm({ ...lostForm, [e.target.name]: e.target.value });
    if (lostFormErrors[e.target.name]) {
      setLostFormErrors({ ...lostFormErrors, [e.target.name]: '' });
    }
  };

  const onPlaceSelect = (value) => {
    if (value) {
      setLostForm(prev => ({
        ...prev,
        location: {
          address: value.properties.formatted,
          latitude: value.properties.lat,
          longitude: value.properties.lon,
        }
      }));
      if (lostFormErrors.location) {
        setLostFormErrors({ ...lostFormErrors, location: '' });
      }
    }
  };

  const validateLostForm = () => {
    const errors = {};
    if (!lostForm.lostDate) {
      errors.lostDate = "Please specify when the item was lost.";
    } else {
      const selectedDate = new Date(lostForm.lostDate);
      const today = new Date();
      today.setHours(23, 59, 59, 999);
      if (selectedDate > today) {
        errors.lostDate = "This date cannot be in the future.";
      }
    }
    if (!lostForm.location) {
      errors.location = "The location where the item was lost is required.";
    }
    setLostFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleConfirmDelete = async () => {
    const { itemId } = modalState;
    const originalItems = [...items];
    setItems(currentItems => currentItems.filter(item => item._id !== itemId));
    handleCloseModal();

    try {
      await axiosInstance.delete(`/api/items/delete/${itemId}`);
    } catch (err) {
      console.error("Failed to delete item:", err);
      setItems(originalItems);
      alert(err.response?.data?.message || "Failed to delete the item. Please try again.");
    }
  };

  const handleConfirmReportLost = async () => {
    if (!validateLostForm()) {
      return;
    }
    await executeReportLost(modalState.itemId, lostForm);
  };

  const executeReportLost = async (itemId, formData) => {
    setUpdatingItemId(itemId);
    setLostFormErrors({});
    try {
      const payload = {
        lostDate: formData.lostDate,
        lostLocationAddress: formData.location.address,
        lostLocationLat: formData.location.latitude,
        lostLocationLon: formData.location.longitude,
      };

      await axiosInstance.patch(`/api/items/report-lost/${itemId}`, payload);

      setItems(currentItems =>
        currentItems.map(item =>
          item._id === itemId ? { ...item, status: 'lost', ...payload } : item
        )
      );
      handleCloseModal();
    } catch (err) {
      console.error("Failed to report item as lost:", err);
      setLostFormErrors({ api: err.response?.data?.message || "An error occurred." });
    } finally {
      setUpdatingItemId(null);
    }
  };
  const renderContent = () => {
    if (loading) {
      return (
        <Box className="status-container">
          <CircularProgress size={50} sx={{ color: '#19a47a' }} />
          <Typography variant="h6" color="text.secondary" sx={{ mt: 2 }}>Fetching Your Inventory...</Typography>
        </Box>
      );
    }

    if (error) {
      return <Box className="status-container"><Alert severity="error" variant="filled">{error}</Alert></Box>;
    }

    if (items.length === 0) {
      return (
        <Box className="status-container no-items">
          <FaPaw className="no-items-icon" />
          <Typography variant="h5" gutterBottom>Your inventory is empty.</Typography>
          <Typography color="text.secondary">Start securing your valuables by registering them here.</Typography>
          <Button component={Link} to="/user/add-item" variant="contained" className="add-first-item-btn" startIcon={<FaPlus />}>
            Register Your First Item
          </Button>
        </Box>
      );
    }

    return (
      <Box className="items-grid">
        {items.map((item) => (
          <Paper key={item._id} elevation={0} variant="outlined" className="item-card">
            <Box className="card-image-container">
              <img src={`http://localhost:5001/${item.itemImage.replace(/\\/g, '/')}`} alt={item.itemName} className="card-image" />
              <Chip icon={getIconForSubCategory(item.subCategory)} label={item.subCategory} size="small" className="category-chip" />
            </Box>
            <Box className="card-content">
              <Typography variant="h6" className="item-title">{item.mainCategory === 'pets' ? item.petName : item.itemName}</Typography>
              <Typography variant="body2" color="text.secondary" className="item-subtitle">{item.mainCategory === 'pets' ? `Breed: ${item.itemName}` : `Brand: ${item.brand}`}</Typography>
              <Box className="item-details">
                {item.mainCategory === 'electronics' && <Typography variant="caption" className="detail-item"><FaBarcode /> S/N: {item.serialNumber}</Typography>}
                {item.mainCategory === 'pets' && <Typography variant="caption" className="detail-item"><FaPalette /> Color: {item.color}</Typography>}
              </Box>
              <Chip label={item.status} size="small" color={item.status === 'lost' ? 'error' : 'success'} className="status-chip" />
            </Box>
            <Box className="card-actions">
              <Button component={Link} to={`/user/edit-item/${item._id}`} size="small" variant="text" startIcon={<FaEdit />} disabled={item.status === 'lost'}>Edit</Button>
              <Button size="small" variant="outlined" color="error" startIcon={<FaTrash />} onClick={() => handleOpenModal('delete', item)} disabled={item.status === 'lost'}>Delete</Button>
              <Button size="small" variant="contained" color="warning" startIcon={updatingItemId === item._id ? <CircularProgress size={16} color="inherit" /> : <FaExclamationTriangle />} onClick={() => handleOpenModal('reportLost', item)} disabled={updatingItemId === item._id || item.status === 'lost'}>
                {updatingItemId === item._id ? 'Reporting...' : 'Report Lost'}
              </Button>
            </Box>
          </Paper>
        ))}
      </Box>
    );
  };

  const renderModalContent = () => {
    if (modalState.actionType === 'delete') {
      return (
        <>
          <DialogContent>
            <DialogContentText id="confirmation-dialog-description">
              Are you sure you want to permanently delete the item "{modalState.itemName}"?
              <Box component="span" sx={{ display: 'block', mt: 1.5, fontWeight: '600', color: '#d32f2f' }}>
                This action cannot be undone.
              </Box>
            </DialogContentText>
          </DialogContent>
          <DialogActions sx={{ p: '0 24px 20px', gap: '8px' }}>
            <Button onClick={handleCloseModal} variant="outlined">Cancel</Button>
            <Button onClick={handleConfirmDelete} variant="contained" color="error" autoFocus>Yes, Delete</Button>
          </DialogActions>
        </>
      );
    }

    if (modalState.actionType === 'reportLost') {
      return (
        <>
          <DialogContent sx={{ pt: 1 }}>
            <DialogContentText sx={{ mb: 3 }}>
              Please provide the last known location and date for "{modalState.itemName}".
            </DialogContentText>
            <Box component="form" noValidate sx={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              <FormControl fullWidth required error={!!lostFormErrors.location}>
                <InputLabel shrink htmlFor="location-input-label" sx={{ transform: 'translate(0, -10px) scale(0.75)' }}>
                  Last Known Location
                </InputLabel>
                <GeoapifyContext apiKey={import.meta.env.VITE_GEOAPIFY_API_KEY}>
                  <div className="geoapify-container">
                    <GeoapifyGeocoderAutocomplete
                      key={geoKey}
                      placeholder="Start typing an address..."
                      placeSelect={onPlaceSelect}
                    />
                  </div>
                </GeoapifyContext>
                {lostFormErrors.location && <FormHelperText>{lostFormErrors.location}</FormHelperText>}
              </FormControl>
              <TextField
                fullWidth
                required
                label="Date Lost"
                name="lostDate"
                type="date"
                value={lostForm.lostDate}
                onChange={handleLostFormChange}
                InputLabelProps={{ shrink: true }}
                inputProps={{ max: getTodayDateString() }}
                InputProps={{ startAdornment: <InputAdornment position="start"><FaCalendarAlt /></InputAdornment> }}
                error={!!lostFormErrors.lostDate}
                helperText={lostFormErrors.lostDate}
              />
              {lostFormErrors.api && <Alert severity="error" sx={{ mt: 1 }}>{lostFormErrors.api}</Alert>}
            </Box>
          </DialogContent>
          <DialogActions sx={{ p: '0 24px 20px', gap: '8px', mt: 2 }}>
            <Button onClick={handleCloseModal} variant="outlined">Cancel</Button>
            <Button
              onClick={handleConfirmReportLost}
              variant="contained"
              color="warning"
              disabled={updatingItemId === modalState.itemId}
              startIcon={updatingItemId === modalState.itemId ? <CircularProgress size={16} color="inherit" /> : <FaExclamationTriangle />}
            >
              Confirm Report
            </Button>
          </DialogActions>
        </>
      );
    }
    return null;
  };

  return (
    <Box className="view-items-container">
      <Box className="page-header-container">
        <Typography variant="h4" component="h1" className="view-items-header">My Registered Items</Typography>
        <Typography variant="subtitle1" className="page-subtitle">Here is a list of all the valuables you've secured in your inventory.</Typography>
      </Box>
      {renderContent()}

      <Dialog open={modalState.open} onClose={handleCloseModal} PaperProps={{ sx: { borderRadius: '16px' } }}>
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1.5, fontWeight: 700 }}>
          <FaExclamationTriangle style={{ color: modalState.actionType === 'delete' ? '#d32f2f' : '#ed6c02' }} />
          {modalState.actionType === 'delete' ? 'Confirm Deletion' : 'Report Item as Lost'}
        </DialogTitle>
        {renderModalContent()}
      </Dialog>
    </Box>
  );
}

export default ViewItems;