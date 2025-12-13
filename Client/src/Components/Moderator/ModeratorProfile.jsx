import React, { useState, useEffect, useRef } from 'react';
import {
  Box, Typography, CircularProgress, Alert, Paper, Button, TextField, InputAdornment, Avatar,
  FormControl, FormLabel
} from '@mui/material';
import { 
  FaUser, FaEnvelope, FaPhone, FaHome, FaVenusMars, FaSave, FaTimes, FaCamera, FaEdit,
  FaMars, FaVenus, FaGenderless, FaIdCard
} from 'react-icons/fa';
import axiosInstance from '../../api/baseUrl';
import '../../Styles/UserViewProfile.css'; 

function ModeratorProfile() {
  const [moderator, setModerator] = useState(null);
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

  const fetchModeratorProfile = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const moderatorInfo = JSON.parse(localStorage.getItem('moderatorInfo'));
      
      if (!moderatorInfo || !moderatorInfo._id) {
        throw new Error("Authentication error. Please log in again.");
      }

      const response = await axiosInstance.get(`/api/moderator/get-by-id/${moderatorInfo._id}`);
      const moderatorData = response.data.data;
      
      setModerator(moderatorData);
      setFormData(moderatorData);
      
      if(moderatorData.profileImage) {
        setImagePreview(`http://localhost:5001${moderatorData.profileImage.replace(/\\/g, '/')}`);
      }

    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || "Failed to fetch profile data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchModeratorProfile();
  }, []);

  const handleEditToggle = () => setIsEditing(true);

  const handleCancel = () => {
    setFormData(moderator);
    setImagePreview(moderator.profileImage ? `http://localhost:5001${moderator.profileImage.replace(/\\/g, '/')}` : '');
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
    if (name === 'phone' || name === 'aadhaarNumber') {
      if (!/^\d*$/.test(value)) return; 
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

    if (data.aadhaarNumber && data.aadhaarNumber.length !== 12) {
        errors.aadhaarNumber = "Aadhaar number must be 12 digits.";
    }

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
    // Append fields
    data.append('firstName', formData.firstName);
    data.append('lastName', formData.lastName);
    data.append('email', formData.email);
    data.append('phone', formData.phone);
    data.append('address', formData.address);
    data.append('gender', formData.gender);
    data.append('aadhaarNumber', formData.aadhaarNumber);
    data.append('voterIdNumber', formData.voterIdNumber);

    if (profileImageFile) data.append('profileImage', profileImageFile);

    try {
      const response = await axiosInstance.put(`/api/moderator/update/${moderator._id}`, data, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      
      const updatedData = response.data.data;
      
      const storedInfo = JSON.parse(localStorage.getItem('moderatorInfo'));
      localStorage.setItem('moderatorInfo', JSON.stringify({ ...storedInfo, ...updatedData }));
window.dispatchEvent(new Event('moderatorProfileUpdated')); 
      await fetchModeratorProfile(); 
      setSuccess("Profile updated successfully!");
      setIsEditing(false);
      setProfileImageFile(null);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update profile.");
    } finally {
      setLoading(false);
    }
  };
  
  const renderTextField = (label, name, value, icon, type = 'text', disabled = false) => (
    isEditing ? (
      <TextField
        fullWidth
        required={!disabled}
        disabled={disabled} 
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
      <Box className="user-profile-detail-item">
        <span className="user-profile-detail-icon">{icon}</span>
        <Box className="user-profile-detail-text-content">
          <Typography className="user-profile-detail-label">{label}</Typography>
          <Typography className="user-profile-detail-value" title={value}>{value || 'N/A'}</Typography>
        </Box>
      </Box>
    )
  );

  if (loading && !moderator) return <Box className="user-profile-container user-profile-loading-container"><CircularProgress sx={{ color: '#19a47a' }} /></Box>;
  if (error && !moderator) return <Box className="user-profile-container user-profile-loading-container"><Alert severity="error">{error}</Alert></Box>;
  if (!moderator) return null;

  return (
    <Box className="user-profile-container" sx={{ position: 'relative' }}>
      <Box sx={{ position: 'absolute', top: 24, left: '50%', transform: 'translateX(-50%)', zIndex: 1500, minWidth: 300 }}>
        {error && <Alert severity="error" onClose={() => setError(null)}>{error}</Alert>}
        {success && <Alert severity="success" onClose={() => setSuccess('')}>{success}</Alert>}
      </Box>

      <Paper elevation={0} variant="outlined" className="user-profile-paper" component="form" onSubmit={handleSubmit} noValidate>
        <Box className="user-profile-header">
          <Box className="user-profile-avatar-container" onClick={() => isEditing && fileInputRef.current.click()}>
            <Avatar src={imagePreview} sx={{ width: 120, height: 120 }} />
            {isEditing && ( <Box className="user-profile-avatar-overlay"><FaCamera /><Typography variant="caption">Change</Typography></Box> )}
            <input type="file" ref={fileInputRef} onChange={handleImageChange} accept="image/png, image/jpeg, image/webp" style={{ display: 'none' }} />
          </Box>
          <Typography variant="h4" className="user-profile-name-edit">{`${moderator.firstName} ${moderator.lastName}`}</Typography>
          <Typography color="text.secondary" className="user-profile-email">{moderator.email}</Typography>
          {!isEditing && ( <Button variant="contained" className="user-profile-edit-btn" startIcon={<FaEdit />} onClick={handleEditToggle}>Edit Profile</Button> )}
        </Box>

        <Box className="user-profile-details-grid">
          {renderTextField("First Name", "firstName", formData.firstName, <FaUser />)}
          {renderTextField("Last Name", "lastName", formData.lastName, <FaUser />)}
          {renderTextField("Email Address", "email", formData.email, <FaEnvelope />, "email")}
          {renderTextField("Phone Number", "phone", formData.phone, <FaPhone />, "tel")}
          
          {renderTextField("Aadhaar Number", "aadhaarNumber", formData.aadhaarNumber, <FaIdCard />)}
          {renderTextField("Voter ID", "voterIdNumber", formData.voterIdNumber, <FaIdCard />)}

          {isEditing ? (
            <>
              <Box sx={{ gridColumn: '1 / -1' }}>{renderTextField("Address", "address", formData.address, <FaHome />)}</Box>
              <FormControl sx={{ gridColumn: '1 / -1' }}>
                <FormLabel className="user-profile-gender-label">Gender</FormLabel>
                <Box className="user-profile-gender-options">
                  <Button type="button" onClick={() => handleGenderChange('male')} className={`user-profile-gender-btn ${formData.gender === 'male' ? 'user-profile-gender-btn--active' : ''}`}><FaMars /> Male</Button>
                  <Button type="button" onClick={() => handleGenderChange('female')} className={`user-profile-gender-btn ${formData.gender === 'female' ? 'user-profile-gender-btn--active' : ''}`}><FaVenus /> Female</Button>
                  <Button type="button" onClick={() => handleGenderChange('other')} className={`user-profile-gender-btn ${formData.gender === 'other' ? 'user-profile-gender-btn--active' : ''}`}><FaGenderless /> Other</Button>
                </Box>
              </FormControl>
            </>
          ) : (
            <Box sx={{ gridColumn: '1 / -1' }} className="user-profile-address-gender-container">
              <Box className="user-profile-view-mode-column">{renderTextField("Address", "address", moderator.address, <FaHome />)}</Box>
              <Box className="user-profile-view-mode-column">{renderTextField("Gender", "gender", moderator.gender, <FaVenusMars />)}</Box>
            </Box>
          )}
        </Box>

        {isEditing && (
          <Box className="user-profile-edit-actions">
            <Button variant="text" color="error" onClick={handleCancel} startIcon={<FaTimes />}>Cancel</Button>
            <Button type="submit" variant="contained" className="user-profile-save-btn" disabled={loading} startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <FaSave />}>
              {loading ? 'Saving...' : 'Save Changes'}
            </Button>
          </Box>
        )}
      </Paper>
    </Box>
  );
}

export default ModeratorProfile;