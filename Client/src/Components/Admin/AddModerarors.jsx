import React, { useState, useLayoutEffect, useRef } from 'react';
import { gsap } from 'gsap';
import {
  FaUser, FaEnvelope, FaPhone, FaLock, FaHome,
  FaMars, FaVenus, FaGenderless, FaCamera, FaPencilAlt,
  FaIdCard, FaAddressCard, FaEye, FaEyeSlash // Added Eye Icons
} from 'react-icons/fa';
import axiosInstance from '../../api/baseUrl';
import '../../Styles/AddModerators.css';

function AddModerators() {
  const main = useRef();
  const fileInputRef = useRef(null);

  const [loading, setLoading] = useState(false);
  const [serverError, setServerError] = useState('');
  const [success, setSuccess] = useState('');
  const [errors, setErrors] = useState({});

  // --- Password Visibility State ---
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    aadhaarNumber: '',
    voterIdNumber: '',
    address: '',
    gender: '',
    password: '',
    confirmPassword: '',
    profileImage: null,
  });

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ delay: 0.2 });
      tl.from(".add-moderator-card", { opacity: 0, y: 50, scale: 0.98, duration: 0.8, ease: 'expo.out' })
        .from([".add-moderator-form-section h2", ".add-moderator-subtitle", ".add-moderator-form-group"],
          { opacity: 0, y: 30, stagger: 0.07, duration: 0.8, ease: 'power3.out' }, "-=0.5");
    }, main);
    return () => ctx.revert();
  }, []);

  const validateForm = () => {
    const newErrors = {};

    if (!/^[a-zA-Z]+$/.test(formData.firstName)) newErrors.firstName = 'First name must contain only letters.';
    if (!/^[a-zA-Z]+$/.test(formData.lastName)) newErrors.lastName = 'Last name must contain only letters.';
    if (!/^\S+@\S+\.\S+$/.test(formData.email)) newErrors.email = 'Please enter a valid email address.';
    if (!/^\d{10}$/.test(formData.phone)) newErrors.phone = 'Phone number must be exactly 10 digits.';
    if (!/^\d{12}$/.test(formData.aadhaarNumber)) newErrors.aadhaarNumber = 'Aadhaar number must be exactly 12 digits.';
    if (!/^[A-Z0-9]{10}$/.test(formData.voterIdNumber)) newErrors.voterIdNumber = 'Voter ID must be 10 alphanumeric characters.';
    if (formData.password.length < 8) newErrors.password = 'Password must be at least 8 characters long.';
    if (formData.password !== formData.confirmPassword) newErrors.confirmPassword = 'Passwords do not match.';
    if (!formData.gender) newErrors.gender = 'Please select a gender.';

    return newErrors;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    let processedValue = value;

    if (name === 'firstName' || name === 'lastName') {
      processedValue = value.replace(/[^a-zA-Z]/g, '');
    } else if (name === 'phone') {
      processedValue = value.replace(/\D/g, '').slice(0, 10);
    } else if (name === 'aadhaarNumber') {
      processedValue = value.replace(/\D/g, '').slice(0, 12);
    } else if (name === 'voterIdNumber') {
      processedValue = value.replace(/[^a-zA-Z0-9]/g, '').slice(0, 10).toUpperCase();
    }

    setFormData(prev => ({ ...prev, [name]: processedValue }));

    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: null }));
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData(prev => ({ ...prev, profileImage: file }));
    }
  };

  const handleGenderChange = (selectedGender) => {
    setFormData(prev => ({ ...prev, gender: selectedGender }));
    if (errors.gender) {
      setErrors(prev => ({ ...prev, gender: null }));
    }
  };

  const handleUploadClick = () => {
    fileInputRef.current.click();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setServerError('');
    setSuccess('');

    const formErrors = validateForm();
    if (Object.keys(formErrors).length > 0) {
      setErrors(formErrors);
      return;
    }
    setErrors({});

    const moderatorData = new FormData();
    for (const key in formData) {
      if (key !== 'confirmPassword') {
        moderatorData.append(key, formData[key]);
      }
    }

    setLoading(true);

    try {
      const response = await axiosInstance.post('/api/moderator/register', moderatorData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
        },
      });

      setSuccess(response.data.message || 'Moderator account created successfully!');

      setFormData({
        firstName: '', lastName: '', email: '', phone: '',
        aadhaarNumber: '', voterIdNumber: '', address: '',
        gender: '', password: '', confirmPassword: '',
        profileImage: null
      });
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }

    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Failed to create moderator. Please try again.';
      setServerError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const profileImagePreview = formData.profileImage
    ? URL.createObjectURL(formData.profileImage)
    : null;

  return (
    <div className="add-moderator-page" ref={main}>
      <div className="add-moderator-card">
        <div className="add-moderator-form-section">
          <h2>Add New Moderator</h2>
          <p className="add-moderator-subtitle">Create a new moderator account by filling out the details below.</p>

          <form onSubmit={handleSubmit} className="add-moderator-form" noValidate>
            {serverError && <p className="add-moderator-error-message">{serverError}</p>}
            {success && <p className="add-moderator-success-message">{success}</p>}

            <div className="add-moderator-form-group add-moderator-profile-photo-group">
              <input type="file" accept="image/png, image/jpeg" name="profileImage" ref={fileInputRef} onChange={handleImageChange} style={{ display: 'none' }} />
              <div className={`add-moderator-profile-photo-uploader ${profileImagePreview ? 'has-image' : ''}`} onClick={handleUploadClick} style={{ backgroundImage: `url(${profileImagePreview})` }}>
                {!profileImagePreview && (
                  <div className="add-moderator-uploader-placeholder">
                    <FaCamera />
                    <span>Upload Photo</span>
                  </div>
                )}
                <div className="add-moderator-uploader-overlay"><FaPencilAlt /></div>
              </div>
            </div>

            <div className="add-moderator-form-row">
              <div className="add-moderator-form-group">
                <FaUser className="add-moderator-input-icon" />
                <input type="text" name="firstName" placeholder="First Name" value={formData.firstName} onChange={handleChange} required pattern="[A-Za-z]+" title="Only letters are allowed" />
                {errors.firstName && <p className="add-moderator-validation-error">{errors.firstName}</p>}
              </div>
              <div className="add-moderator-form-group">
                <FaUser className="add-moderator-input-icon" />
                <input type="text" name="lastName" placeholder="Last Name" value={formData.lastName} onChange={handleChange} required pattern="[A-Za-z]+" title="Only letters are allowed" />
                {errors.lastName && <p className="add-moderator-validation-error">{errors.lastName}</p>}
              </div>
            </div>

            <div className="add-moderator-form-row">
              <div className="add-moderator-form-group">
                <FaEnvelope className="add-moderator-input-icon" />
                <input type="email" name="email" placeholder="Email Address" value={formData.email} onChange={handleChange} required />
                {errors.email && <p className="add-moderator-validation-error">{errors.email}</p>}
              </div>
              <div className="add-moderator-form-group">
                <FaPhone className="add-moderator-input-icon" />
                <input type="tel" name="phone" placeholder="Phone Number" value={formData.phone} onChange={handleChange} required maxLength="10" pattern="\d{10}" title="Must be 10 digits" />
                {errors.phone && <p className="add-moderator-validation-error">{errors.phone}</p>}
              </div>
            </div>

            <div className="add-moderator-form-row">
              <div className="add-moderator-form-group">
                <FaIdCard className="add-moderator-input-icon" />
                <input type="text" name="aadhaarNumber" placeholder="Aadhaar Number" value={formData.aadhaarNumber} onChange={handleChange} required maxLength="12" pattern="\d{12}" title="Must be 12 digits" />
                {errors.aadhaarNumber && <p className="add-moderator-validation-error">{errors.aadhaarNumber}</p>}
              </div>
              <div className="add-moderator-form-group">
                <FaAddressCard className="add-moderator-input-icon" />
                <input type="text" name="voterIdNumber" placeholder="Voter ID Number" value={formData.voterIdNumber} onChange={handleChange} required maxLength="10" pattern="[A-Z0-9]{10}" title="Must be 10 alphanumeric characters" />
                {errors.voterIdNumber && <p className="add-moderator-validation-error">{errors.voterIdNumber}</p>}
              </div>
            </div>

            <div className="add-moderator-form-group">
              <FaHome className="add-moderator-input-icon" />
              <textarea name="address" placeholder="Home Address" rows="2" value={formData.address} onChange={handleChange} required></textarea>
            </div>

            <div className="add-moderator-form-group">
              <div className="add-moderator-gender-options">
                <button type="button" onClick={() => handleGenderChange('male')} className={formData.gender === 'male' ? 'active' : ''}><FaMars /> Male</button>
                <button type="button" onClick={() => handleGenderChange('female')} className={formData.gender === 'female' ? 'active' : ''}><FaVenus /> Female</button>
                <button type="button" onClick={() => handleGenderChange('other')} className={formData.gender === 'other' ? 'active' : ''}><FaGenderless /> Other</button>
              </div>
              {errors.gender && <p className="add-moderator-validation-error">{errors.gender}</p>}
            </div>

            <div className="add-moderator-form-row">
              {/* --- PASSWORD FIELD WITH EYE ICON --- */}
              <div className="add-moderator-form-group add-moderator-password-group">
                <FaLock className="add-moderator-input-icon" />
                <input 
                    type={showPassword ? "text" : "password"} 
                    name="password" 
                    placeholder="Create Password" 
                    value={formData.password} 
                    onChange={handleChange} 
                    required 
                    minLength="8" 
                />
                <span className="password-toggle-icon add-moderator-password-toggle-icon" onClick={() => setShowPassword(!showPassword)}>
                  {showPassword ? <FaEyeSlash /> : <FaEye />}
                </span>
                {errors.password && <p className="add-moderator-validation-error">{errors.password}</p>}
              </div>

              {/* --- CONFIRM PASSWORD FIELD WITH EYE ICON --- */}
              <div className="add-moderator-form-group add-moderator-password-group">
                <FaLock className="add-moderator-input-icon" />
                <input 
                    type={showConfirmPassword ? "text" : "password"} 
                    name="confirmPassword" 
                    placeholder="Confirm Password" 
                    value={formData.confirmPassword} 
                    onChange={handleChange} 
                    required 
                />
                <span className="password-toggle-icon add-moderator-password-toggle-icon" onClick={() => setShowConfirmPassword(!showConfirmPassword)}>
                  {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
                </span>
                {errors.confirmPassword && <p className="add-moderator-validation-error">{errors.confirmPassword}</p>}
              </div>
            </div>

            <div className="add-moderator-form-group">
              <button type="submit" className="add-moderator-button" disabled={loading}>
                {loading ? 'Creating Account...' : 'Create Moderator Account'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default AddModerators;