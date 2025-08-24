import React, { useState, useEffect, useRef } from 'react';
import {
  Box, Typography, CircularProgress, Alert, Paper, Button, TextField, InputAdornment, Avatar,
  FormControl, FormLabel
} from '@mui/material';
import { 
  FaUser, FaEnvelope, FaPhone, FaHome, FaVenusMars, FaSave, FaTimes, FaCamera, FaEdit,
  FaMars, FaVenus, FaGenderless
} from 'react-icons/fa';
import axiosInstance from '../../api/baseUrl';
import '../../Styles/UserViewProfile.css';

function UserViewProfile() {
  const [user, setUser] = useState(null);
  const [formData, setFormData] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null); 
  const [formErrors, setFormErrors] = useState({}); 
  const [success, setSuccess] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  
  const [profileImageFile, setProfileImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (success || error) {
      const timer = setTimeout(() => {
        setSuccess('');
        setError(null);
      }, 2000);
      return () => clearTimeout(timer); 
    }
  }, [success, error]);

  const fetchUserProfile = async () => {
    try {
      setLoading(true);
      setError(null);
      const userInfo = JSON.parse(localStorage.getItem('userInfo'));
      if (!userInfo || !userInfo._id) {
        throw new Error("Authentication error. Please log in again.");
      }
      const response = await axiosInstance.get(`/api/users/${userInfo._id}`);
      const userData = response.data.data;
      
      setUser(userData);
      setFormData(userData);
      setImagePreview(`http://localhost:5001${userData.profileImage.replace(/\\/g, '/')}`);

    } catch (err) {
      setError(err.response?.data?.message || "Failed to fetch profile data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUserProfile();
  }, []);

  const handleEditToggle = () => setIsEditing(true);

  const handleCancel = () => {
    setFormData(user);
    setImagePreview(`http://localhost:5001${user.profileImage.replace(/\\/g, '/')}`);
    setProfileImageFile(null);
    setIsEditing(false);
    setError(null);
    setFormErrors({}); 
  };
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === 'firstName' || name === 'lastName') {
      if (!/^[A-Za-z\s]*$/.test(value)) return; 
    }
    if (name === 'phone') {
      if (!/^\d{0,10}$/.test(value)) return; 
    }
    setFormData({ ...formData, [name]: value });
    if (formErrors[name]) setFormErrors({ ...formErrors, [name]: '' });
  };

  const handleGenderChange = (selectedGender) => setFormData({ ...formData, gender: selectedGender });
  
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setProfileImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const validateForm = (data) => {
    const errors = {};
    if (!data.firstName) errors.firstName = "First name is required.";
    if (!data.lastName) errors.lastName = "Last name is required.";
    if (!data.email) errors.email = "Email is required.";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/i.test(data.email)) errors.email = "Please enter a valid email address.";
    if (!data.phone) errors.phone = "Phone number is required.";
    else if (data.phone.length !== 10) errors.phone = "Phone number must be exactly 10 digits.";
    return errors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess('');
    const validationErrors = validateForm(formData);
    setFormErrors(validationErrors);
    if (Object.keys(validationErrors).length > 0) return;

    setLoading(true);
    const data = new FormData();
    Object.keys(formData).forEach(key => data.append(key, formData[key]));
    if (profileImageFile) data.append('profileImage', profileImageFile);

    try {
      const response = await axiosInstance.put(`/api/users/profile/${user._id}`, data, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      const updatedUserData = response.data.data;
      const storedUserInfo = JSON.parse(localStorage.getItem('userInfo'));
      localStorage.setItem('userInfo', JSON.stringify({ ...storedUserInfo, ...updatedUserData }));
      window.dispatchEvent(new CustomEvent('profileUpdated'));
      await fetchUserProfile(); 
      setSuccess("Profile updated successfully!");
      setIsEditing(false);
      setProfileImageFile(null);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update profile.");
    } finally {
      setLoading(false);
    }
  };
  
  const renderTextField = (label, name, value, icon, type = 'text') => (
    isEditing ? (
      <TextField
        fullWidth
        required
        label={label}
        name={name}
        type={type}
        value={value || ''}
        onChange={handleChange}
        variant="outlined"
        InputProps={{ startAdornment: <InputAdornment position="start">{icon}</InputAdornment> }}
        error={!!formErrors[name]} 
        helperText={formErrors[name] || ''} 
      />
    ) : (
      <Box className="detail-item">
        <span className="detail-icon">{icon}</span>
        <Box className="detail-text-content">
          <Typography className="detail-label">{label}</Typography>
          <Typography className="detail-value" title={value}>{value}</Typography>
        </Box>
      </Box>
    )
  );

  if (loading && !user) return <Box className="view-profile-container loading-container"><CircularProgress sx={{ color: '#19a47a' }} /></Box>;
  if (error && !user) return <Box className="view-profile-container loading-container"><Alert severity="error">{error}</Alert></Box>;
  if (!user) return null;

  return (
    <Box className="view-profile-container" sx={{ position: 'relative' }}>
      <Box sx={{ position: 'absolute', top: 24, left: '50%', transform: 'translateX(-50%)', zIndex: 1500, minWidth: 300 }}>
        {error && <Alert severity="error" onClose={() => setError(null)}>{error}</Alert>}
        {success && <Alert severity="success" onClose={() => setSuccess('')}>{success}</Alert>}
      </Box>

      <Paper elevation={0} variant="outlined" className="profile-paper" component="form" onSubmit={handleSubmit} noValidate>
        <Box className="profile-header">
          <Box className="avatar-container" onClick={() => isEditing && fileInputRef.current.click()}>
            <Avatar src={imagePreview} sx={{ width: 120, height: 120 }} />
            {isEditing && ( <Box className="avatar-overlay"><FaCamera /><Typography variant="caption">Change</Typography></Box> )}
            <input type="file" ref={fileInputRef} onChange={handleImageChange} accept="image/png, image/jpeg, image/webp" style={{ display: 'none' }} />
          </Box>
          <Typography variant="h4" className="profile-name">{`${user.firstName} ${user.lastName}`}</Typography>
          <Typography color="text.secondary" className="profile-email">{user.email}</Typography>
          {!isEditing && ( <Button variant="contained" className="edit-profile-btn" startIcon={<FaEdit />} onClick={handleEditToggle}>Edit Profile</Button> )}
        </Box>

        <Box className="profile-details-grid">
          {renderTextField("First Name", "firstName", formData.firstName, <FaUser />)}
          {renderTextField("Last Name", "lastName", formData.lastName, <FaUser />)}
          {renderTextField("Email Address", "email", formData.email, <FaEnvelope />, "email")}
          {renderTextField("Phone Number", "phone", formData.phone, <FaPhone />, "tel")}
          
          {isEditing ? (
            <>
              <Box sx={{ gridColumn: '1 / -1' }}>{renderTextField("Address", "address", formData.address, <FaHome />)}</Box>
              <FormControl sx={{ gridColumn: '1 / -1' }}>
                <FormLabel className="gender-label">Gender</FormLabel>
                <Box className="gender-options">
                  <Button type="button" onClick={() => handleGenderChange('male')} className={formData.gender === 'male' ? 'active' : ''}><FaMars /> Male</Button>
                  <Button type="button" onClick={() => handleGenderChange('female')} className={formData.gender === 'female' ? 'active' : ''}><FaVenus /> Female</Button>
                  <Button type="button" onClick={() => handleGenderChange('other')} className={formData.gender === 'other' ? 'active' : ''}><FaGenderless /> Other</Button>
                </Box>
              </FormControl>
            </>
          ) : (
            <Box sx={{ gridColumn: '1 / -1' }} className="address-gender-container">
              <Box className="view-mode-column">{renderTextField("Address", "address", user.address, <FaHome />)}</Box>
              <Box className="view-mode-column">{renderTextField("Gender", "gender", user.gender, <FaVenusMars />)}</Box>
            </Box>
          )}
        </Box>

        {isEditing && (
          <Box className="edit-actions">
            <Button variant="text" color="error" onClick={handleCancel} startIcon={<FaTimes />}>Cancel</Button>
            <Button type="submit" variant="contained" className="save-changes-btn" disabled={loading} startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <FaSave />}>
              {loading ? 'Saving...' : 'Save Changes'}
            </Button>
          </Box>
        )}
      </Paper>
    </Box>
  );
}

export default UserViewProfile;