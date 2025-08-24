import React, { useState, useRef } from 'react';
import {
  Box, Typography, TextField, Button, Select, MenuItem,
  FormControl, InputLabel, CircularProgress, Alert, Paper, InputAdornment
} from '@mui/material';
import {
  FaPaw, FaLaptop, FaMobileAlt, FaDog, FaCat, FaUpload, FaTag, FaAlignLeft,
  FaShapes, FaCalendarAlt, FaBuilding, FaBarcode, FaSyncAlt, FaSignature
} from 'react-icons/fa';
import axiosInstance from '../../api/baseUrl';
import '../../Styles/AddItems.css';

const initialFormData = {
  itemName: '', description: '', purchaseDate: '', brand: '', serialNumber: '', petName: '', color: '',
};

function AddItems() {
  const fileInputRef = useRef(null);
  const [mainCategory, setMainCategory] = useState('');
  const [subCategory, setSubCategory] = useState('');
  const [formData, setFormData] = useState(initialFormData);
  const [formErrors, setFormErrors] = useState({});
  const [itemImage, setItemImage] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

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
      if (formErrors.image) {
        setFormErrors({ ...formErrors, image: '' });
      }
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

    if (!formData.description.trim()) errors.description = "Additional details are required.";
    if (mainCategory === 'pets') {
      if (!formData.petName.trim()) errors.petName = "Pet's name is required.";
      else if (!nameRegex.test(formData.petName)) errors.petName = "Name can only contain letters and spaces.";

      if (!formData.itemName.trim()) errors.itemName = "Breed is required.";
      else if (!nameRegex.test(formData.itemName)) errors.itemName = "Breed can only contain letters and spaces.";

      if (!formData.color.trim()) errors.color = "Color/Markings are required.";
    } else if (mainCategory === 'electronics') {
      if (!formData.itemName.trim()) errors.itemName = "Model name is required.";
      if (!formData.brand.trim()) errors.brand = "Brand is required.";
      if (!formData.serialNumber.trim()) errors.serialNumber = "Serial number is required.";
    }

    return errors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null); setSuccess(null);

    const validationErrors = validateForm();
    if (!itemImage) {
      validationErrors.image = "Please upload an image for the item.";
    }

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

    data.append('ownerId', userInfo._id);
    data.append('mainCategory', mainCategory);
    data.append('subCategory', subCategory);
    Object.keys(formData).forEach(key => data.append(key, formData[key]));
    data.append('itemImage', itemImage);

    try {
      await axiosInstance.post('/api/items/add', data, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setSuccess('Item successfully registered to your inventory!');
      setFormData(initialFormData);
      setItemImage(null);
      setImagePreview('');
      setMainCategory('');
      setSubCategory('');
      setFormErrors({});
    } catch (err) {
      setError(err.response?.data?.message || "Failed to register item. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const renderDynamicFields = () => {
    if (!subCategory) return null;
    const isPet = mainCategory === 'pets';

    const fields = isPet ? (
      <>
        <TextField fullWidth required label="Pet's Name" name="petName" value={formData.petName} onChange={handleChange} placeholder="e.g., Buddy, Lucy" InputProps={{ startAdornment: <InputAdornment position="start"><FaSignature /></InputAdornment> }} error={!!formErrors.petName} helperText={formErrors.petName} />
        <TextField fullWidth required label="Breed" name="itemName" value={formData.itemName} onChange={handleChange} placeholder="e.g., Golden Retriever, Siamese" InputProps={{ startAdornment: <InputAdornment position="start"><FaTag /></InputAdornment> }} error={!!formErrors.itemName} helperText={formErrors.itemName} />
        <TextField fullWidth required label="Color / Markings" name="color" value={formData.color} onChange={handleChange} placeholder="e.g., Black with white spot" InputProps={{ startAdornment: <InputAdornment position="start"><FaPaw /></InputAdornment> }} error={!!formErrors.color} helperText={formErrors.color} />
      </>
    ) : (
      <>
        <TextField fullWidth required label="Model Name" name="itemName" value={formData.itemName} onChange={handleChange} placeholder="e.g., iPhone 14 Pro, Dell XPS 15" InputProps={{ startAdornment: <InputAdornment position="start"><FaTag /></InputAdornment> }} error={!!formErrors.itemName} helperText={formErrors.itemName} />
        <TextField fullWidth required label="Brand" name="brand" value={formData.brand} onChange={handleChange} placeholder="e.g., Apple, Samsung" InputProps={{ startAdornment: <InputAdornment position="start"><FaBuilding /></InputAdornment> }} error={!!formErrors.brand} helperText={formErrors.brand} />
        <TextField fullWidth required label="Serial Number" name="serialNumber" value={formData.serialNumber} onChange={handleChange} InputProps={{ startAdornment: <InputAdornment position="start"><FaBarcode /></InputAdornment> }} error={!!formErrors.serialNumber} helperText={formErrors.serialNumber} />
      </>
    );

    return (
      <Box className="dynamic-fields-wrapper">
        <Typography variant="overline" className="dynamic-fields-header">
          {isPet ? `Tell us about your ${subCategory}` : `Details for your ${subCategory}`}
        </Typography>
        {fields}
        <TextField fullWidth label={isPet ? "Acquired On / Date of Birth" : "Date of Purchase"} name="purchaseDate" type="date" value={formData.purchaseDate} onChange={handleChange} InputLabelProps={{ shrink: true }} inputProps={{ max: getTodayDateString() }} InputProps={{ startAdornment: <InputAdornment position="start"><FaCalendarAlt /></InputAdornment> }} error={!!formErrors.purchaseDate} helperText={formErrors.purchaseDate} />
        <TextField fullWidth required label="Additional Details" name="description" value={formData.description} onChange={handleChange} multiline rows={4} placeholder={isPet ? "Collar details, temperament, microchip number..." : "Color, any damage, custom stickers..."} InputProps={{ startAdornment: <InputAdornment position="start" sx={{ alignItems: 'flex-start', mt: '1rem' }}><FaAlignLeft /></InputAdornment> }} error={!!formErrors.description} helperText={formErrors.description} />
      </Box>
    );
  };

  return (
    <Box className="add-item-container">
      <Paper elevation={0} variant="outlined" className="add-item-paper">
        <Box className="paper-header">
          <Typography variant="h4" component="h1" className="add-item-header">Register a New Item</Typography>
          <Typography variant="body1" color="text.secondary">Secure your valuables by adding them to your digital inventory.</Typography>
        </Box>

        <Box component="form" className="add-item-content" onSubmit={handleSubmit} noValidate>
          <Box className="image-uploader-section">
            <input type="file" ref={fileInputRef} onChange={handleImageChange} accept="image/png, image/jpeg, image/webp" style={{ display: 'none' }} />
            <Box className="image-preview-box" onClick={triggerFileSelect}>
              {imagePreview ? (<> <img src={imagePreview} alt="Item Preview" className="item-image-preview" /> <Box className="image-overlay"> <FaSyncAlt className="overlay-icon" /> <Typography className="overlay-text">Change Image</Typography> </Box> </>) :
                (<Box className="upload-placeholder"> <FaShapes className="upload-icon" /> <Typography variant="h6">Upload Photo</Typography> <Typography variant="body2" color="text.secondary">Click to select an image</Typography> </Box>)}
            </Box>
          </Box>

          <Box className="item-form-section">
            <Box className="form-step-group">
              <Typography variant="overline" className="step-header">Step 1: Choose a Category</Typography>
              <FormControl fullWidth required>
                <InputLabel id="main-category-label">Item Type</InputLabel>
                <Select labelId="main-category-label" label="Item Type" name="mainCategory" value={mainCategory} onChange={handleMainCategoryChange}>
                  <MenuItem value="electronics"><FaLaptop style={{ marginRight: '12px', fontSize: '1.2em' }} />Electronics</MenuItem>
                  <MenuItem value="pets"><FaPaw style={{ marginRight: '12px', fontSize: '1.2em' }} />Pet</MenuItem>
                </Select>
              </FormControl>

              {mainCategory === 'electronics' && (
                <FormControl fullWidth required>
                  <InputLabel id="electronics-type-label">Specific Type</InputLabel>
                  <Select labelId="electronics-type-label" label="Specific Type" name="subCategory" value={subCategory} onChange={handleSubCategoryChange}>
                    <MenuItem value="phone"><FaMobileAlt style={{ marginRight: '12px', fontSize: '1.2em' }} />Phone</MenuItem>
                    <MenuItem value="laptop"><FaLaptop style={{ marginRight: '12px', fontSize: '1.2em' }} />Laptop</MenuItem>
                  </Select>
                </FormControl>
              )}

              {mainCategory === 'pets' && (
                <FormControl fullWidth required>
                  <InputLabel id="pet-type-label">Specific Type</InputLabel>
                  <Select labelId="pet-type-label" label="Specific Type" name="subCategory" value={subCategory} onChange={handleSubCategoryChange}>
                    <MenuItem value="dog"><FaDog style={{ marginRight: '12px', fontSize: '1.2em' }} />Dog</MenuItem>
                    <MenuItem value="cat"><FaCat style={{ marginRight: '12px', fontSize: '1.2em' }} />Cat</MenuItem>
                  </Select>
                </FormControl>
              )}
            </Box>

            {renderDynamicFields()}

            <Box sx={{ mt: 2 }}>
              {error && <Alert severity="error" variant="filled">{error}</Alert>}
              {success && <Alert severity="success" variant="filled">{success}</Alert>}
            </Box>

            <Button type="submit" variant="contained" className="submit-item-button" disabled={loading || !subCategory} startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <FaUpload />}>
              {loading ? 'Registering...' : 'Add to My Inventory'}
            </Button>
          </Box>
        </Box>
      </Paper>
    </Box>
  );
}

export default AddItems;