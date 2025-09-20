import React, { useState, useLayoutEffect, useRef } from 'react';
import { gsap } from 'gsap';
import {
  FaUser, FaEnvelope, FaPhone, FaLock, FaUserPlus, FaHome,
  FaMars, FaVenus, FaGenderless, FaCamera, FaPencilAlt
} from 'react-icons/fa';
import { Link, useNavigate } from 'react-router-dom';
import axiosInstance from '../../api/baseUrl';
import '../../Styles/UserRegistration.css';

function UserRegistration() {
  const main = useRef();
  const fileInputRef = useRef(null);
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [serverError, setServerError] = useState(''); 
  const [success, setSuccess] = useState('');
  const [errors, setErrors] = useState({}); 

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
    gender: '',
    password: '',
    confirmPassword: '',
    profileImage: null,
  });

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ delay: 0.3 });
      tl.from(".registration-card", { opacity: 0, scale: 0.9, duration: 0.8, ease: 'expo.out' })
        .from(".registration-visual", { x: "-100%", duration: 1.2, ease: 'power4.inOut' }, "-=0.6")
        .from([".registration-icon", ".registration-visual h2", ".registration-visual p"], { opacity: 0, y: 30, stagger: 0.15, duration: 0.8, ease: 'power3.out' }, "-=0.8")
        .from([".registration-form-section h2", ".registration-form-group", ".registration-login-link"], { opacity: 0, x: 40, stagger: 0.07, duration: 0.8, ease: 'power3.out' }, "-=1");
    }, main);
    return () => ctx.revert();
  }, []);

  const validateForm = () => {
    const newErrors = {};

    if (!/^[a-zA-Z]+$/.test(formData.firstName)) newErrors.firstName = 'First name must contain only letters.';
    if (!/^[a-zA-Z]+$/.test(formData.lastName)) newErrors.lastName = 'Last name must contain only letters.';
    if (!/^\S+@\S+\.\S+$/.test(formData.email)) newErrors.email = 'Please enter a valid email address.';
    if (!/^\d{10}$/.test(formData.phone)) newErrors.phone = 'Phone number must be exactly 10 digits.';
    if (formData.password.length < 8) newErrors.password = 'Password must be at least 8 characters long.';
    if (formData.password !== formData.confirmPassword) newErrors.confirmPassword = 'Passwords do not match.';
    if (!formData.gender) newErrors.gender = 'Please select a gender.';
    if (!formData.address.trim()) newErrors.address = 'Address is required.';
    
    return newErrors;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    let processedValue = value;

    if (name === 'firstName' || name === 'lastName') {
      processedValue = value.replace(/[^a-zA-Z]/g, '');
    } else if (name === 'phone') {
      processedValue = value.replace(/\D/g, '').slice(0, 10);
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

    const registrationData = new FormData();
    for (const key in formData) {
      if (key !== 'confirmPassword') {
        registrationData.append(key, formData[key]);
      }
    }

    setLoading(true);

    try {
      const response = await axiosInstance.post('/api/users/register', registrationData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      setSuccess('Registration successful! Redirecting to login...');
      setTimeout(() => navigate('/login/user'), 2000);

    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Registration failed. Please try again.';
      setServerError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const profileImagePreview = formData.profileImage
    ? URL.createObjectURL(formData.profileImage)
    : null;

  return (
    <>
      <div className="registration-page" ref={main}>
        <div className="registration-card">
          <div className="registration-visual">
            <FaUserPlus className="registration-icon" />
            <h2>Create Your Account</h2>
            <p>Join our community to unlock exclusive features and personalize your experience.</p>
          </div>

          <div className="registration-form-section">
            <h2>Get Started</h2>
            <p className="registration-subtitle">Signing up is quick and easy.</p>

            <form onSubmit={handleSubmit} className="registration-form" noValidate>
              {serverError && <p className="registration-error-message">{serverError}</p>}
              {success && <p className="registration-success-message">{success}</p>}

              <div className="registration-form-group profile-photo-group">
                <input type="file" accept="image/png, image/jpeg" name="profileImage" ref={fileInputRef} onChange={handleImageChange} style={{ display: 'none' }} />
                <div className={`profile-photo-uploader ${profileImagePreview ? 'has-image' : ''}`} onClick={handleUploadClick} style={{ backgroundImage: `url(${profileImagePreview})` }}>
                  {!profileImagePreview && (
                    <div className="uploader-placeholder">
                      <FaCamera /><span>Upload Photo</span>
                    </div>
                  )}
                  <div className="uploader-overlay"><FaPencilAlt /></div>
                </div>
              </div>

              <div className="registration-form-row">
                <div className="registration-form-group">
                  <FaUser className="registration-input-icon" />
                  <input type="text" name="firstName" placeholder="First Name" value={formData.firstName} onChange={handleChange} required />
                  {errors.firstName && <p className="registration-validation-error">{errors.firstName}</p>}
                </div>
                <div className="registration-form-group">
                  <FaUser className="registration-input-icon" />
                  <input type="text" name="lastName" placeholder="Last Name" value={formData.lastName} onChange={handleChange} required />
                  {errors.lastName && <p className="registration-validation-error">{errors.lastName}</p>}
                </div>
              </div>

              <div className="registration-form-row">
                <div className="registration-form-group">
                  <FaEnvelope className="registration-input-icon" />
                  <input type="email" name="email" placeholder="Email Address" value={formData.email} onChange={handleChange} required />
                  {errors.email && <p className="registration-validation-error">{errors.email}</p>}
                </div>
                <div className="registration-form-group">
                  <FaPhone className="registration-input-icon" />
                  <input type="tel" name="phone" placeholder="Phone Number" value={formData.phone} onChange={handleChange} required maxLength="10" />
                  {errors.phone && <p className="registration-validation-error">{errors.phone}</p>}
                </div>
              </div>

              <div className="registration-form-group">
                <FaHome className="registration-input-icon" />
                <textarea name="address" placeholder="Home Address" rows="2" value={formData.address} onChange={handleChange} required></textarea>
                {errors.address && <p className="registration-validation-error">{errors.address}</p>}
              </div>

              <div className="registration-form-group">
                <div className="gender-options">
                  <button type="button" onClick={() => handleGenderChange('male')} className={formData.gender === 'male' ? 'active' : ''}><FaMars /> Male</button>
                  <button type="button" onClick={() => handleGenderChange('female')} className={formData.gender === 'female' ? 'active' : ''}><FaVenus /> Female</button>
                  <button type="button" onClick={() => handleGenderChange('other')} className={formData.gender === 'other' ? 'active' : ''}><FaGenderless /> Other</button>
                </div>
                {errors.gender && <p className="registration-validation-error center-text">{errors.gender}</p>}
              </div>

              <div className="registration-form-row">
                <div className="registration-form-group">
                  <FaLock className="registration-input-icon" />
                  <input type="password" name="password" placeholder="Password" value={formData.password} onChange={handleChange} required minLength="8" />
                  {errors.password && <p className="registration-validation-error">{errors.password}</p>}
                </div>
                <div className="registration-form-group">
                  <FaLock className="registration-input-icon" />
                  <input type="password" name="confirmPassword" placeholder="Confirm Password" value={formData.confirmPassword} onChange={handleChange} required />
                  {errors.confirmPassword && <p className="registration-validation-error">{errors.confirmPassword}</p>}
                </div>
              </div>

              <div className="registration-form-group">
                <button type="submit" className="registration-button" disabled={loading}>
                  {loading ? 'Creating Account...' : 'Create Account'}
                </button>
              </div>
            </form>

            <p className="registration-login-link">
              Already have an account? <Link to="/login/user">Sign In</Link>
            </p>
          </div>
        </div>
      </div>
    </>
  );
}

export default UserRegistration;