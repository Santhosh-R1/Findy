import React, { useState, useRef, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box, Typography, TextField, Button, Select, MenuItem,
  FormControl, InputLabel, CircularProgress, Alert, Paper, InputAdornment
} from '@mui/material';
import { 
  FaPaw, FaLaptop, FaMobileAlt, FaDog, FaCat, FaSave, FaTag, FaAlignLeft, 
  FaCalendarAlt, FaBuilding, FaBarcode, FaSyncAlt, FaSignature
} from 'react-icons/fa';
import axiosInstance from '../../api/baseUrl';
import '../../Styles/AddItems.css';

function EditItem() {
  const { itemId } = useParams();
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const [mainCategory, setMainCategory] = useState('');
  const [subCategory, setSubCategory] = useState('');
  const [formData, setFormData] = useState({});
  const [formErrors, setFormErrors] = useState({}); 
  const [itemImage, setItemImage] = useState(null);
  const [imagePreview, setImagePreview] = useState('');

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const getTodayDateString = () => new Date().toISOString().split("T")[0];

  useEffect(() => {
    const fetchItemData = async () => {
      try {
        setLoading(true);
        const response = await axiosInstance.get(`/api/items/${itemId}`);
        const itemData = response.data.data;
        
        setMainCategory(itemData.mainCategory);
        setSubCategory(itemData.subCategory);
        setFormData({
          itemName: itemData.itemName || '',
          description: itemData.description || '',
          purchaseDate: itemData.purchaseDate ? new Date(itemData.purchaseDate).toISOString().split('T')[0] : '',
          brand: itemData.brand || '',
          serialNumber: itemData.serialNumber || '',
          petName: itemData.petName || '',
          color: itemData.color || '',
        });
        setImagePreview(`http://localhost:5001/${itemData.itemImage.replace(/\\/g, '/')}`);

      } catch (err) {
        setError(err.response?.data?.message || "Failed to fetch item data.");
      } finally {
        setLoading(false);
      }
    };
    fetchItemData();
  }, [itemId]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === 'petName' || (mainCategory === 'pets' && name === 'itemName')) {
      if (!/^[A-Za-z\s]*$/.test(value)) {
        return;
      }
    }

    setFormData({ ...formData, [name]: value });

    if (formErrors[name]) {
      setFormErrors({ ...formErrors, [name]: '' });
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setItemImage(file);
      setImagePreview(URL.createObjectURL(file));
      setError(null);
    }
  };
  
  const triggerFileSelect = () => fileInputRef.current.click();

  const validateForm = () => {
    const errors = {};
    const nameRegex = /^[A-Za-z\s]+$/;

    if (formData.purchaseDate) {
        const selectedDate = new Date(formData.purchaseDate);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        if (selectedDate > today) {
            errors.purchaseDate = "This date cannot be in the future.";
        }
    }
    
    if (!formData.description?.trim()) errors.description = "Additional details are required.";

    if (mainCategory === 'pets') {
      if (!formData.petName?.trim()) errors.petName = "Pet's name is required.";
      else if (!nameRegex.test(formData.petName)) errors.petName = "Name can only contain letters and spaces.";

      if (!formData.itemName?.trim()) errors.itemName = "Breed is required.";
      else if (!nameRegex.test(formData.itemName)) errors.itemName = "Breed can only contain letters and spaces.";

      if (!formData.color?.trim()) errors.color = "Color/Markings are required.";
    } else if (mainCategory === 'electronics') {
      if (!formData.itemName?.trim()) errors.itemName = "Model name is required.";
      if (!formData.brand?.trim()) errors.brand = "Brand is required.";
      if (!formData.serialNumber?.trim()) errors.serialNumber = "Serial number is required.";
    }

    return errors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null); setSuccess(null);

    const validationErrors = validateForm();
    setFormErrors(validationErrors);

    if (Object.keys(validationErrors).length > 0) {
      return;
    }
    
    setLoading(true);
    const data = new FormData();
    const userInfo = JSON.parse(localStorage.getItem('userInfo'));
    
    if (!userInfo || !userInfo._id) {
        setError("Authentication error. Please log in again.");
        setLoading(false);
        return;
    }

    data.append('ownerId', userInfo._id);
    Object.keys(formData).forEach(key => data.append(key, formData[key]));
    if (itemImage) {
      data.append('itemImage', itemImage);
    }

    try {
      await axiosInstance.put(`/api/items/edit/${itemId}`, data, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setSuccess('Item updated successfully! Redirecting...');
      
      setTimeout(() => {
        navigate('/user/view-items');
      }, 2000);

    } catch (err) {
      setError(err.response?.data?.message || "Failed to update item.");
    } finally { 
      setLoading(false); 
    }
  };

  const renderDynamicFields = () => {
    if (!subCategory) return null;
    const isPet = mainCategory === 'pets';

    const fields = isPet ? (
      <>
        <TextField fullWidth required label="Pet's Name" name="petName" value={formData.petName || ''} onChange={handleChange} InputProps={{ startAdornment: <InputAdornment position="start"><FaSignature /></InputAdornment> }} error={!!formErrors.petName} helperText={formErrors.petName} />
        <TextField fullWidth required label="Breed" name="itemName" value={formData.itemName || ''} onChange={handleChange} InputProps={{ startAdornment: <InputAdornment position="start"><FaTag /></InputAdornment> }} error={!!formErrors.itemName} helperText={formErrors.itemName} />
        <TextField fullWidth required label="Color / Markings" name="color" value={formData.color || ''} onChange={handleChange} InputProps={{ startAdornment: <InputAdornment position="start"><FaPaw /></InputAdornment> }} error={!!formErrors.color} helperText={formErrors.color} />
      </>
    ) : (
      <>
        <TextField fullWidth required label="Model Name" name="itemName" value={formData.itemName || ''} onChange={handleChange} InputProps={{ startAdornment: <InputAdornment position="start"><FaTag /></InputAdornment> }} error={!!formErrors.itemName} helperText={formErrors.itemName} />
        <TextField fullWidth required label="Brand" name="brand" value={formData.brand || ''} onChange={handleChange} InputProps={{ startAdornment: <InputAdornment position="start"><FaBuilding /></InputAdornment> }} error={!!formErrors.brand} helperText={formErrors.brand} />
        <TextField fullWidth required label="Serial Number" name="serialNumber" value={formData.serialNumber || ''} onChange={handleChange} InputProps={{ startAdornment: <InputAdornment position="start"><FaBarcode /></InputAdornment> }} error={!!formErrors.serialNumber} helperText={formErrors.serialNumber} />
      </>
    );

    return (
      <Box className="dynamic-fields-wrapper">
        <Typography variant="overline" className="dynamic-fields-header">
          {`Details for your ${subCategory}`}
        </Typography>
        {fields}
        <TextField fullWidth label={isPet ? "Acquired On / Date of Birth" : "Date of Purchase"} name="purchaseDate" type="date" value={formData.purchaseDate || ''} onChange={handleChange} InputLabelProps={{ shrink: true }} inputProps={{ max: getTodayDateString() }} InputProps={{ startAdornment: <InputAdornment position="start"><FaCalendarAlt /></InputAdornment> }} error={!!formErrors.purchaseDate} helperText={formErrors.purchaseDate} />
        <TextField fullWidth required label="Additional Details" name="description" value={formData.description || ''} onChange={handleChange} multiline rows={4} InputProps={{ startAdornment: <InputAdornment position="start" sx={{alignItems: 'flex-start', mt: '1rem'}}><FaAlignLeft /></InputAdornment> }} error={!!formErrors.description} helperText={formErrors.description} />
      </Box>
    );
  };
  
  if (loading && !formData.itemName) {
    return (
      <Box className="add-item-container" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box className="add-item-container">
      <Paper elevation={0} variant="outlined" className="add-item-paper">
        <Box className="paper-header">
          <Typography variant="h4" component="h1" className="add-item-header">Edit Item Details</Typography>
          <Typography variant="body1" color="text.secondary">Update the information for your registered item.</Typography>
        </Box>
        <Box component="form" className="add-item-content" onSubmit={handleSubmit} noValidate>
          <Box className="image-uploader-section">
            <input type="file" ref={fileInputRef} onChange={handleImageChange} accept="image/png, image/jpeg, image/webp" style={{ display: 'none' }} />
            <Box className="image-preview-box" onClick={triggerFileSelect}>
              {imagePreview ? ( <> <img src={imagePreview} alt="Item Preview" className="item-image-preview" /> <Box className="image-overlay"> <FaSyncAlt className="overlay-icon" /> <Typography className="overlay-text">Change Image</Typography> </Box> </> ) : 
              ( <Box className="upload-placeholder"> <CircularProgress /> </Box> )}
            </Box>
          </Box>
          <Box className="item-form-section">
            <Box className="form-step-group">
              <Typography variant="overline" className="step-header">Category (Cannot be changed)</Typography>
              <FormControl fullWidth disabled>
                <InputLabel>Item Type</InputLabel>
                <Select value={mainCategory} label="Item Type">
                  <MenuItem value="electronics"><FaLaptop style={{marginRight: '12px'}}/>Electronics</MenuItem>
                  <MenuItem value="pets"><FaPaw style={{marginRight: '12px'}}/>Pet</MenuItem>
                </Select>
              </FormControl>
              <FormControl fullWidth disabled>
                <InputLabel>Specific Type</InputLabel>
                <Select value={subCategory} label="Specific Type">
                  <MenuItem value="phone" disabled={mainCategory !== 'electronics'}><FaMobileAlt style={{marginRight: '12px'}}/>Phone</MenuItem>
                  <MenuItem value="laptop" disabled={mainCategory !== 'electronics'}><FaLaptop style={{marginRight: '12px'}}/>Laptop</MenuItem>
                  <MenuItem value="dog" disabled={mainCategory !== 'pets'}><FaDog style={{marginRight: '12px'}}/>Dog</MenuItem>
                  <MenuItem value="cat" disabled={mainCategory !== 'pets'}><FaCat style={{marginRight: '12px'}}/>Cat</MenuItem>
                </Select>
              </FormControl>
            </Box>
            {renderDynamicFields()}
            <Box sx={{ mt: 2 }}>
              {error && <Alert severity="error" variant="filled">{error}</Alert>}
              {success && <Alert severity="success" variant="filled">{success}</Alert>}
            </Box>
            <Button type="submit" variant="contained" className="submit-item-button" disabled={loading} startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <FaSave />}>
              {loading ? 'Saving...' : 'Save Changes'}
            </Button>
          </Box>
        </Box>
      </Paper>
    </Box>
  );
}

export default EditItem;