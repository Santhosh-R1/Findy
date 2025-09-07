import React, { useState, useEffect, useRef } from 'react';
import {
  Box, Typography, CircularProgress, Alert, Paper, Button, TextField, InputAdornment, Avatar,
  // 1. Import new components for the dropdown
  Select, MenuItem, FormControl, InputLabel, FormHelperText
} from '@mui/material';
import {
  FaBuilding, FaEnvelope, FaPhone, FaHome, FaSave, FaTimes, FaCamera, FaEdit,
  FaGlobe, FaHashtag, FaUser, FaStore
} from 'react-icons/fa';
import axiosInstance from '../../api/baseUrl';
import '../../Styles/OrganisationEdit.css';

// 2. Define the organisation types, similar to your registration page
const organisationTypes = [
  { value: 'cafe', label: 'Café / Restaurant' },
  { value: 'retail', label: 'Retail Store' },
  { value: 'public', label: 'Public Venue (Library, Park)' },
  { value: 'transport', label: 'Public Transport' },
  { value: 'police', label: 'Police Department' },
  { value: 'corporate', label: 'Corporate Office' },
  { value: 'other', label: 'Other' },
];

function OrganaisationEdit() {
  const [organisation, setOrganisation] = useState(null);
  const [formData, setFormData] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [formErrors, setFormErrors] = useState({});
  const [success, setSuccess] = useState('');
  const [isEditing, setIsEditing] = useState(false);

  const [logoFile, setLogoFile] = useState(null);
  const [logoPreview, setLogoPreview] = useState('');
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (success || error) {
      const timer = setTimeout(() => {
        setSuccess('');
        setError(null);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [success, error]);

  const fetchOrganisationProfile = async () => {
    try {
      setLoading(true);
      setError(null);
      const orgInfo = JSON.parse(localStorage.getItem('organisationInfo'));
      if (!orgInfo || !orgInfo.data._id) {
        throw new Error("Authentication error. Please log in again.");
      }
      
      const response = await axiosInstance.get(`/api/organaisation/get-by-id/${orgInfo.data._id}`);
      const orgData = response.data.data;

      const formattedData = {
        _id: orgData._id,
        name: orgData.organisationName,
        type: orgData.organisationType,
        contact: orgData.contactPerson,
        registrationNumber: orgData.registrationId,
        email: orgData.email,
        phone: orgData.phone || '',
        address: orgData.address,
        website: orgData.website,
        logo: orgData.organisationLogo
      };

      setOrganisation(formattedData);
      setFormData(formattedData);

      if (formattedData.logo) {
        setLogoPreview(`http://localhost:5001${formattedData.logo.replace(/\\/g, '/')}`);
      }

    } catch (err) {
      console.error("ERROR FETCHING PROFILE:", err);
      setError(err.response?.data?.message || "Failed to fetch organisation profile.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrganisationProfile();
  }, []);

  const handleEditToggle = () => setIsEditing(true);

  const handleCancel = () => {
    setFormData(organisation);
    if(organisation.logo) {
      setLogoPreview(`http://localhost:5001${organisation.logo.replace(/\\/g, '/')}`);
    }
    setLogoFile(null);
    setIsEditing(false);
    setError(null);
    setFormErrors({});
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === 'phone') {
      if (!/^\d{0,10}$/.test(value)) return;
    }
    setFormData({ ...formData, [name]: value });
    if (formErrors[name]) setFormErrors({ ...formErrors, [name]: '' });
  };

  const handleLogoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setLogoFile(file);
      setLogoPreview(URL.createObjectURL(file));
    }
  };

  const validateForm = (data) => {
    const errors = {};
    if (!data.name) errors.name = "Organisation name is required.";
    if (!data.type) errors.type = "Organisation type is required.";
    if (!data.contact) errors.contact = "Contact person is required.";
    if (!data.registrationNumber) errors.registrationNumber = "Registration number is required.";
    if (!data.email) errors.email = "Email is required.";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/i.test(data.email)) errors.email = "Please enter a valid email address.";
    if (data.phone && data.phone.length > 0 && data.phone.length !== 10) errors.phone = "Phone number must be exactly 10 digits.";
    return errors;
  };

// In OrganaisationEdit.js

const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess('');
    const validationErrors = validateForm(formData);
    setFormErrors(validationErrors);
    if (Object.keys(validationErrors).length > 0) return;

    setLoading(true);
    const data = new FormData();
    
    // Map frontend state names back to backend field names
    data.append('organisationName', formData.name);
    data.append('organisationType', formData.type);
    data.append('contactPerson', formData.contact);
    data.append('registrationId', formData.registrationNumber);
    data.append('email', formData.email);
    data.append('phone', formData.phone);
    data.append('address', formData.address);
    data.append('website', formData.website);
    
    // --- THIS IS THE FIX ---
    // Change 'logo' to 'organisationLogo' to match the backend middleware
    if (logoFile) {
        data.append('organisationLogo', logoFile);
    }
    // ----------------------

    try {
        const response = await axiosInstance.put(`/api/organaisation/profile/${organisation._id}`, data, {
            headers: { 'Content-Type': 'multipart/form-data' },
        });
      
        const updatedOrgData = response.data.data;
        const storedOrgInfo = JSON.parse(localStorage.getItem('organisationInfo'));
        localStorage.setItem('organisationInfo', JSON.stringify({ ...storedOrgInfo, name: updatedOrgData.organisationName, logo: updatedOrgData.organisationLogo }));
      
        window.dispatchEvent(new CustomEvent('organisationProfileUpdated'));

        await fetchOrganisationProfile();
        setSuccess("Profile updated successfully!");
        setIsEditing(false);
        setLogoFile(null);
    } catch (err) {
        setError(err.response?.data?.message || "Failed to update profile.");
    } finally {
        setLoading(false);
    }
};

  const renderTextField = (label, name, value, icon, type = 'text', required = false) => (
    isEditing ? (
      <TextField
        fullWidth
        required={required}
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
      <Box className="organisation-profile-detail-item">
        <span className="organisation-profile-detail-icon">{icon}</span>
        <Box className="organisation-profile-detail-text-content">
          <Typography className="organisation-profile-detail-label">{label}</Typography>
          <Typography className="organisation-profile-detail-value" title={value}>{value || 'N/A'}</Typography>
        </Box>
      </Box>
    )
  );

  if (loading && !organisation) return <Box className="organisation-profile-container organisation-profile-loading-container"><CircularProgress sx={{ color: '#6f42c1' }} /></Box>;
  if (error && !organisation) return <Box className="organisation-profile-container organisation-profile-loading-container"><Alert severity="error">{error}</Alert></Box>;
  if (!organisation) return null;

  return (
    <Box className="organisation-profile-container" sx={{ position: 'relative' }}>
      <Box sx={{ position: 'absolute', top: 24, left: '50%', transform: 'translateX(-50%)', zIndex: 1500, minWidth: 300 }}>
        {error && <Alert severity="error" onClose={() => setError(null)}>{error}</Alert>}
        {success && <Alert severity="success" onClose={() => setSuccess('')}>{success}</Alert>}
      </Box>

      <Paper elevation={0} variant="outlined" className="organisation-profile-paper" component="form" onSubmit={handleSubmit} noValidate>
        <Box className="organisation-profile-header">
          <Box className="organisation-profile-avatar-container" onClick={() => isEditing && fileInputRef.current.click()}>
            <Avatar src={logoPreview} alt={organisation.name} sx={{ width: 120, height: 120, bgcolor: 'var(--org-primary-color)' }}>
              <FaBuilding />
            </Avatar>
            {isEditing && (<Box className="organisation-profile-avatar-overlay"><FaCamera /><Typography variant="caption">Change</Typography></Box>)}
            <input type="file" ref={fileInputRef} onChange={handleLogoChange} accept="image/png, image/jpeg, image/webp" style={{ display: 'none' }} />
          </Box>
          <Typography variant="h4" className="organisation-profile-name-edit">{organisation.name}</Typography>
          <Typography color="text.secondary" className="organisation-profile-email">{organisation.email}</Typography>
          {!isEditing && (<Button variant="contained" className="organisation-profile-edit-btn" startIcon={<FaEdit />} onClick={handleEditToggle}>Edit Profile</Button>)}
        </Box>

        <Box className="organisation-profile-details-grid">
          {renderTextField("Organisation Name", "name", formData.name, <FaBuilding />, 'text', true)}
          
          {/* 3. Replace the old renderTextField with this new conditional block */}
          {isEditing ? (
            <FormControl fullWidth variant="outlined" required error={!!formErrors.type}>
              <InputLabel id="organisation-type-select-label">Organisation Type</InputLabel>
              <Select
                labelId="organisation-type-select-label"
                name="type"
                value={formData.type || ''}
                onChange={handleChange}
                label="Organisation Type"
                startAdornment={<InputAdornment position="start"><FaStore /></InputAdornment>}
              >
                {organisationTypes.map((option) => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.label}
                  </MenuItem>
                ))}
              </Select>
              {formErrors.type && <FormHelperText>{formErrors.type}</FormHelperText>}
            </FormControl>
          ) : (
            // In view mode, we display the user-friendly label instead of the raw value
            <Box className="organisation-profile-detail-item">
              <span className="organisation-profile-detail-icon"><FaStore /></span>
              <Box className="organisation-profile-detail-text-content">
                <Typography className="organisation-profile-detail-label">Organisation Type</Typography>
                <Typography className="organisation-profile-detail-value">
                  {organisationTypes.find(t => t.value === formData.type)?.label || formData.type || 'N/A'}
                </Typography>
              </Box>
            </Box>
          )}

          {renderTextField("Contact Person", "contact", formData.contact, <FaUser />, 'text', true)}
          {renderTextField("Registration Number", "registrationNumber", formData.registrationNumber, <FaHashtag />, 'text', true)}
          {renderTextField("Email Address", "email", formData.email, <FaEnvelope />, "email", true)}
          {renderTextField("Phone Number", "phone", formData.phone, <FaPhone />, "tel", true)}
          {renderTextField("Address", "address", formData.address, <FaHome />)}
          {renderTextField("Website", "website", formData.website, <FaGlobe />)}
        </Box>

        {isEditing && (
          <Box className="organisation-profile-edit-actions">
            <Button variant="text" color="error" onClick={handleCancel} startIcon={<FaTimes />}>Cancel</Button>
            <Button type="submit" variant="contained" className="organisation-profile-save-btn" disabled={loading} startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <FaSave />}>
              {loading ? 'Saving...' : 'Save Changes'}
            </Button>
          </Box>
        )}
      </Paper>
    </Box>
  );
}

export default OrganaisationEdit;