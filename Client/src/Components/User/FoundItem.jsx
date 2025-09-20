import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box, Typography, TextField, Button, Select, MenuItem,
  FormControl, InputLabel, CircularProgress, Alert, Paper, InputAdornment, FormHelperText
} from '@mui/material';
import {
  FaPaw, FaLaptop, FaMobileAlt, FaDog, FaCat, FaUpload, FaTag, FaAlignLeft,
  FaShapes, FaCalendarAlt, FaBuilding, FaMapMarkerAlt, FaSyncAlt, FaSignature,
  FaListUl, FaSearch, FaPalette,
  // 1. Imported new icons
  FaShoppingBag, FaWallet
} from 'react-icons/fa';
import { GeoapifyGeocoderAutocomplete, GeoapifyContext } from '@geoapify/react-geocoder-autocomplete';
import axiosInstance from '../../api/baseUrl';
import '../../Styles/AddItems.css';

const initialFormData = {
  itemName: '', description: '', brand: '', petName: '', color: '', foundDate: '',
};

function FoundItem() {
  const fileInputRef = useRef(null);
  const [mainCategory, setMainCategory] = useState('');
  const [subCategory, setSubCategory] = useState('');
  const [formData, setFormData] = useState(initialFormData);
  const [formErrors, setFormErrors] = useState({});
  const [itemImage, setItemImage] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [location, setLocation] = useState(null);
  const [locationError, setLocationError] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const [geoKey, setGeoKey] = useState(Date.now());
  const navigate = useNavigate();

  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => setSuccess(null), 2000);
      return () => clearTimeout(timer);
    }
  }, [success]);

  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => setError(null), 2000);
      return () => clearTimeout(timer);
    }
  }, [error]);
  
  const handleNavigateToMyItems = () => navigate('/user/my-found-items');
  const handleNavigateToMyLostItems = () => navigate('/user/lost-items-others');
  const getTodayDateString = () => new Date().toISOString().split("T")[0];

  const handleMainCategoryChange = (e) => {
    setMainCategory(e.target.value);
    setSubCategory('');
    setFormData(initialFormData);
    setFormErrors({});
  };

  const handleSubCategoryChange = (e) => setSubCategory(e.target.value);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === 'petName' || (mainCategory === 'pets' && name === 'itemName')) {
      if (!/^[A-Za-z\s]*$/.test(value)) return;
    }
    setFormData({ ...formData, [name]: value });
    if (formErrors[name]) setFormErrors({ ...formErrors, [name]: '' });
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setItemImage(file);
      setImagePreview(URL.createObjectURL(file));
      setError(null);
      if (formErrors.image) setFormErrors({ ...formErrors, image: '' });
    }
  };

  const onPlaceSelect = (value) => {
    if (value) {
      setLocation({ address: value.properties.formatted, latitude: value.properties.lat, longitude: value.properties.lon });
      setLocationError('');
    }
  };

  const triggerFileSelect = () => fileInputRef.current.click();

  const validateForm = () => {
    const errors = {};
    const nameRegex = /^[A-Za-z\s]+$/;

    if (!formData.foundDate) errors.foundDate = "Please specify when the item was found.";
    else {
      const selectedDate = new Date(formData.foundDate);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (selectedDate > today) errors.foundDate = "This date cannot be in the future.";
    }
    if (!location) {
      errors.location = "Location where the item was found is required.";
      setLocationError("Location where the item was found is required.");
    }
    if (!formData.description.trim()) errors.description = "Please provide some details about the item.";
    if (!formData.color.trim()) errors.color = "Color is required to help identify the item.";

    // 4. Updated validation logic to handle all three categories correctly
    if (mainCategory === 'pets') {
      if (formData.petName && !nameRegex.test(formData.petName)) errors.petName = "Name can only contain letters.";
      if (formData.itemName && !nameRegex.test(formData.itemName)) errors.itemName = "Breed can only contain letters.";
    } else if (mainCategory === 'electronics') {
      if (!formData.itemName.trim()) errors.itemName = "Model name is required.";
      if (!formData.brand.trim()) errors.brand = "Brand is required.";
    } else if (mainCategory === 'accessories') {
      if (!formData.brand.trim()) errors.brand = "Brand is required.";
    }
    return errors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    const validationErrors = validateForm();
    if (!itemImage) validationErrors.image = "Please upload an image of the item.";
    setFormErrors(validationErrors);
    if (Object.keys(validationErrors).length > 0) {
      if (validationErrors.image) setError(validationErrors.image);
      return;
    }
    setLoading(true);
    const data = new FormData();
    const userInfo = JSON.parse(localStorage.getItem('userInfo'));
    if (!userInfo || !userInfo._id) {
      setError("Could not find user information. Please log in again.");
      setLoading(false);
      return;
    }
    data.append('finderId', userInfo._id);
    data.append('mainCategory', mainCategory);
    data.append('subCategory', subCategory);
    Object.keys(formData).forEach(key => data.append(key, formData[key]));
    if (location) {
      data.append('foundLocationAddress', location.address);
      data.append('foundLocationLat', location.latitude);
      data.append('foundLocationLon', location.longitude);
    }
    data.append('itemImage', itemImage);
    try {
      await axiosInstance.post('/api/items/found/add', data, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setSuccess('Found item report submitted successfully! Thank you for helping.');
      setFormData(initialFormData);
      setItemImage(null);
      setImagePreview('');
      setMainCategory('');
      setSubCategory('');
      setLocation(null);
      setFormErrors({});
      setGeoKey(Date.now());
    } catch (err) {
      setError(err.response?.data?.message || "Failed to submit report. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // 3. Refactored renderDynamicFields to handle all categories
  const renderDynamicFields = () => {
    if (!subCategory) return null;

    return (
      <Box className="dynamic-fields-wrapper">
        <Typography variant="overline" className="dynamic-fields-header">
          {`Details of the found ${subCategory}`}
        </Typography>

        {mainCategory === 'pets' && (
          <>
            <TextField fullWidth label="Pet's Name (if known)" name="petName" value={formData.petName} onChange={handleChange} placeholder="e.g., Tag says 'Buddy'" InputProps={{ startAdornment: <InputAdornment position="start"><FaSignature /></InputAdornment> }} error={!!formErrors.petName} helperText={formErrors.petName} />
            <TextField fullWidth label="Breed (if known)" name="itemName" value={formData.itemName} onChange={handleChange} placeholder="e.g., Looks like a Golden Retriever" InputProps={{ startAdornment: <InputAdornment position="start"><FaTag /></InputAdornment> }} error={!!formErrors.itemName} helperText={formErrors.itemName} />
          </>
        )}
        {mainCategory === 'electronics' && (
          <>
            <TextField fullWidth required label="Model Name" name="itemName" value={formData.itemName} onChange={handleChange} placeholder="e.g., iPhone 14 Pro" InputProps={{ startAdornment: <InputAdornment position="start"><FaTag /></InputAdornment> }} error={!!formErrors.itemName} helperText={formErrors.itemName} />
            <TextField fullWidth required label="Brand" name="brand" value={formData.brand} onChange={handleChange} placeholder="e.g., Apple, Samsung" InputProps={{ startAdornment: <InputAdornment position="start"><FaBuilding /></InputAdornment> }} error={!!formErrors.brand} helperText={formErrors.brand} />
          </>
        )}
        {mainCategory === 'accessories' && (
          <>
            <TextField fullWidth required label="Brand" name="brand" value={formData.brand} onChange={handleChange} placeholder="e.g., Gucci, Fossil" InputProps={{ startAdornment: <InputAdornment position="start"><FaBuilding /></InputAdornment> }} error={!!formErrors.brand} helperText={formErrors.brand} />
          </>
        )}

        <TextField fullWidth required label="Color / Markings" name="color" value={formData.color} onChange={handleChange} placeholder={mainCategory === 'pets' ? "e.g., Black with white paws" : "e.g., Space Gray, Tan Brown"} InputProps={{ startAdornment: <InputAdornment position="start"><FaPalette /></InputAdornment> }} error={!!formErrors.color} helperText={formErrors.color} />
        <FormControl fullWidth required error={!!locationError}>
          <InputLabel shrink htmlFor="location-input-label" sx={{ transform: 'translate(0, -10px) scale(0.75)' }}>Location Found</InputLabel>
          <GeoapifyContext apiKey={import.meta.env.VITE_GEOAPIFY_API_KEY}>
            <div className="geoapify-container"><GeoapifyGeocoderAutocomplete key={geoKey} placeholder="Start typing an address..." placeSelect={onPlaceSelect} /></div>
          </GeoapifyContext>
          {locationError && <FormHelperText>{locationError}</FormHelperText>}
        </FormControl>
        <TextField fullWidth required label="Date Found" name="foundDate" type="date" value={formData.foundDate} onChange={handleChange} InputLabelProps={{ shrink: true }} inputProps={{ max: getTodayDateString() }} InputProps={{ startAdornment: <InputAdornment position="start"><FaCalendarAlt /></InputAdornment> }} error={!!formErrors.foundDate} helperText={formErrors.foundDate} />
        <TextField fullWidth required label="Additional Details" name="description" value={formData.description} onChange={handleChange} multiline rows={4} placeholder={mainCategory === 'pets' ? "Collar details, temperament, where found..." : "Any damage, stickers, where found..."} InputProps={{ startAdornment: <InputAdornment position="start" sx={{ alignItems: 'flex-start', mt: '1rem' }}><FaAlignLeft /></InputAdornment> }} error={!!formErrors.description} helperText={formErrors.description} />
      </Box>
    );
  };

  return (
    <Box className="add-item-container">
      <Paper elevation={0} variant="outlined" className="add-item-paper">
        <Box sx={{ position: 'absolute', top: { xs: '1.5rem', md: '2.5rem' }, right: { xs: '1.5rem', md: '3rem' }, display: 'flex', flexDirection: { xs: 'column-reverse', sm: 'row' }, gap: 1 }}>
          <Button variant="outlined" startIcon={<FaSearch />} onClick={handleNavigateToMyLostItems} sx={{ color: 'var(--clean-primary-dark)', borderColor: 'var(--clean-primary-dark)', '&:hover': { backgroundColor: 'rgba(25, 164, 122, 0.04)', borderColor: 'var(--clean-primary-color)' }}}>Lost Items</Button>
          <Button variant="outlined" startIcon={<FaListUl />} onClick={handleNavigateToMyItems} sx={{ color: 'var(--clean-primary-dark)', borderColor: 'var(--clean-primary-dark)', '&:hover': { backgroundColor: 'rgba(25, 164, 122, 0.04)', borderColor: 'var(--clean-primary-color)' }}}>My Found Items</Button>
        </Box>
        <Box className="paper-header">
          <Typography variant="h4" component="h1" className="add-item-header">Report a Found Item</Typography>
          <Typography variant="body1" color="text.secondary">Help reunite a lost item with its owner by providing details below.</Typography>
        </Box>
        <Box component="form" className="add-item-content" onSubmit={handleSubmit} noValidate>
          <Box className="image-uploader-section">
            <input type="file" ref={fileInputRef} onChange={handleImageChange} accept="image/png, image/jpeg, image/webp" style={{ display: 'none' }} />
            <Box className="image-preview-box" onClick={triggerFileSelect}>
              {imagePreview ? (<> <img src={imagePreview} alt="Item Preview" className="item-image-preview" /> <Box className="image-overlay"> <FaSyncAlt className="overlay-icon" /> <Typography className="overlay-text">Change Image</Typography> </Box> </>) :
                (<Box className="upload-placeholder"> <FaShapes className="upload-icon" /> <Typography variant="h6">Upload Photo</Typography> <Typography variant="body2" color="text.secondary">A clear picture helps a lot!</Typography> </Box>)}
            </Box>
          </Box>
          <Box className="item-form-section">
            <Box className="form-step-group">
              <Typography variant="overline" className="step-header">Step 1: What did you find?</Typography>
              <FormControl fullWidth required>
                <InputLabel id="main-category-label">Item Type</InputLabel>
                <Select labelId="main-category-label" label="Item Type" name="mainCategory" value={mainCategory} onChange={handleMainCategoryChange}>
                  <MenuItem value="electronics"><FaLaptop style={{ marginRight: '12px' }} />Electronics</MenuItem>
                  <MenuItem value="pets"><FaPaw style={{ marginRight: '12px' }} />Pet</MenuItem>
                  {/* 2. Added new main category */}
                  <MenuItem value="accessories"><FaShoppingBag style={{ marginRight: '12px' }} />Accessories</MenuItem>
                </Select>
              </FormControl>
              {mainCategory === 'electronics' && (
                <FormControl fullWidth required>
                  <InputLabel id="electronics-type-label">Specific Type</InputLabel>
                  <Select labelId="electronics-type-label" label="Specific Type" name="subCategory" value={subCategory} onChange={handleSubCategoryChange}>
                    <MenuItem value="phone"><FaMobileAlt style={{ marginRight: '12px' }} />Phone</MenuItem>
                    <MenuItem value="laptop"><FaLaptop style={{ marginRight: '12px' }} />Laptop</MenuItem>
                  </Select>
                </FormControl>
              )}
              {mainCategory === 'pets' && (
                <FormControl fullWidth required>
                  <InputLabel id="pet-type-label">Specific Type</InputLabel>
                  <Select labelId="pet-type-label" label="Specific Type" name="subCategory" value={subCategory} onChange={handleSubCategoryChange}>
                    <MenuItem value="dog"><FaDog style={{ marginRight: '12px' }} />Dog</MenuItem>
                    <MenuItem value="cat"><FaCat style={{ marginRight: '12px' }} />Cat</MenuItem>
                  </Select>
                </FormControl>
              )}
              {mainCategory === 'accessories' && (
                <FormControl fullWidth required>
                  <InputLabel id="accessory-type-label">Specific Type</InputLabel>
                  <Select labelId="accessory-type-label" label="Specific Type" name="subCategory" value={subCategory} onChange={handleSubCategoryChange}>
                    <MenuItem value="wallet"><FaWallet style={{ marginRight: '12px' }} />Wallet</MenuItem>
                    <MenuItem value="hand bag"><FaShoppingBag style={{ marginRight: '12px' }} />Hand Bag</MenuItem>
                  </Select>
                </FormControl>
              )}
            </Box>
            {renderDynamicFields()}
            <Box sx={{ mt: 2, height: '60px' }}>
              {error && <Alert severity="error" variant="filled">{error}</Alert>}
              {success && <Alert severity="success" variant="filled">{success}</Alert>}
            </Box>
            <Button type="submit" variant="contained" className="submit-item-button" disabled={loading || !subCategory} startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <FaUpload />}>
              {loading ? 'Submitting...' : 'Submit Found Item Report'}
            </Button>
          </Box>
        </Box>
      </Paper>
    </Box>
  );
}

export default FoundItem;