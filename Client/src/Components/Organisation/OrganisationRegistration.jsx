import { useState, useLayoutEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { useNavigate, Link } from 'react-router-dom';
import {
  FaBuilding, FaSitemap, FaUser, FaIdCard, FaEnvelope, FaGlobe, FaMapMarkerAlt,
  FaLock, FaImage, FaPencilAlt
} from 'react-icons/fa';
import axiosInstance from '../../api/baseUrl';
import '../../Styles/OrganisationRegistration.css';

function OrganisationRegistration() {
  const fileInputRef = useRef(null);
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    organisationName: '',
    organisationType: '',
    contactPerson: '',
    registrationId: '',
    email: '',
    website: '',
    address: '',
    password: '',
    confirmPassword: '',
    organisationLogo: null,
  });

  const [loading, setLoading] = useState(false);
  const [serverError, setServerError] = useState(''); 
  const [errors, setErrors] = useState({}); 

  useLayoutEffect(() => {
    gsap.fromTo(
      ".org-registration-card",
      { opacity: 0, y: 50 },
      { opacity: 1, y: 0, duration: 0.8, ease: "power3.out" }
    );
  }, []);

  const validateForm = () => {
    const newErrors = {};
    if (!formData.organisationName.trim()) newErrors.organisationName = 'Organization name is required.';
    if (!formData.organisationType) newErrors.organisationType = 'Please select an organization type.';
    if (!/^[a-zA-Z\s]+$/.test(formData.contactPerson)) newErrors.contactPerson = 'Contact person must contain only letters and spaces.';
    if (!/^\S+@\S+\.\S+$/.test(formData.email)) newErrors.email = 'Please enter a valid email address.';
    if (formData.website && !/^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([/\w .-]*)*\/?$/.test(formData.website)) {
      newErrors.website = 'Please enter a valid website URL (e.g., https://example.com).';
    }
    if (!formData.address.trim()) newErrors.address = 'Address is required.';
    if (formData.password.length < 8) newErrors.password = 'Password must be at least 8 characters long.';
    if (formData.password !== formData.confirmPassword) newErrors.confirmPassword = 'Passwords do not match.';
    
    return newErrors;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    let processedValue = value;
    if (name === 'contactPerson') {
        processedValue = value.replace(/[^a-zA-Z\s]/g, '');
    }

    setFormData(prev => ({ ...prev, [name]: processedValue }));
    if (errors[name]) {
        setErrors(prev => ({...prev, [name]: null}));
    }
  };

  const handleLogoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData(prev => ({ ...prev, organisationLogo: file }));
    }
  };

  const handleUploadClick = () => {
    fileInputRef.current.click();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setServerError('');
    
    const formErrors = validateForm();
    if (Object.keys(formErrors).length > 0) {
        setErrors(formErrors);
        return;
    }
    setErrors({});

    setLoading(true);
    const submissionData = new FormData();
    Object.keys(formData).forEach(key => {
      if (key !== 'confirmPassword') {
        submissionData.append(key, formData[key]);
      }
    });

    try {
      const response = await axiosInstance.post('/api/organaisation/register', submissionData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      console.log("Registration successful:", response.data);
      alert("Registration successful! You will be redirected to the login page.");
      navigate('/login/organisation');

    } catch (err) {
      const message = err.response?.data?.message || "An unexpected error occurred. Please try again.";
      setServerError(message);
      console.error("Registration failed:", err.response?.data || err);
    } finally {
      setLoading(false);
    }
  };

  const logoPreview = formData.organisationLogo ? URL.createObjectURL(formData.organisationLogo) : null;

  return (
    <div className="org-registration-page">
      <div className="org-registration-card">
        <div className="org-registration-visual">
          <FaBuilding className="org-registration-icon" />
          <h2>Partner with Findy</h2>
          <p>Register your organization to become a verified part of our recovery network.</p>
        </div>

        <div className="org-registration-form-section">
          <h2>Organization Registration</h2>
          <p className="org-registration-subtitle">Join our network to help the community.</p>
          {serverError && <p className="org-registration-error-message">{serverError}</p>}

          <form onSubmit={handleSubmit} className="org-registration-form" noValidate>
            <div className="org-registration-form-group org-registration-logo-upload-group">
              <input type="file" accept="image/png, image/jpeg" name="organisationLogo" ref={fileInputRef} onChange={handleLogoChange} style={{ display: 'none' }} />
              <div className={`org-registration-logo-uploader ${logoPreview ? 'org-registration-has-image' : ''}`} onClick={handleUploadClick} style={{ backgroundImage: `url(${logoPreview})` }}>
                {!logoPreview && (
                  <div className="org-registration-uploader-placeholder"><FaImage /><span>Upload Logo</span></div>
                )}
                <div className="org-registration-uploader-overlay"><FaPencilAlt /></div>
              </div>
            </div>

            <div className="org-registration-form-row">
              <div className="org-registration-form-group">
                <FaBuilding className="org-registration-input-icon" />
                <input type="text" name="organisationName" placeholder="Organization Name" value={formData.organisationName} onChange={handleChange} required />
                {errors.organisationName && <p className="org-registration-validation-error">{errors.organisationName}</p>}
              </div>
              <div className="org-registration-form-group">
                <FaSitemap className="org-registration-input-icon" />
                <select name="organisationType" value={formData.organisationType} onChange={handleChange} required>
                  <option value="" disabled>Organization Type...</option>
                  <option value="cafe">Café / Restaurant</option>
                  <option value="retail">Retail Store</option>
                  <option value="public">Public Venue (Library, Park)</option>
                  <option value="transport">Public Transport</option>
                  <option value="police">Police Department</option>
                  <option value="corporate">Corporate Office</option>
                  <option value="other">Other</option>
                </select>
                {errors.organisationType && <p className="org-registration-validation-error">{errors.organisationType}</p>}
              </div>
            </div>
            
            <div className="org-registration-form-row">
              <div className="org-registration-form-group">
                <FaUser className="org-registration-input-icon" />
                <input type="text" name="contactPerson" placeholder="Contact Person" value={formData.contactPerson} onChange={handleChange} required />
                {errors.contactPerson && <p className="org-registration-validation-error">{errors.contactPerson}</p>}
              </div>
              <div className="org-registration-form-group">
                <FaIdCard className="org-registration-input-icon" />
                <input type="text" name="registrationId" placeholder="Business ID (Optional)" value={formData.registrationId} onChange={handleChange} />
              </div>
            </div>
            
            <div className="org-registration-form-row">
              <div className="org-registration-form-group">
                <FaEnvelope className="org-registration-input-icon" />
                <input type="email" name="email" placeholder="Official Email" value={formData.email} onChange={handleChange} required />
                {errors.email && <p className="org-registration-validation-error">{errors.email}</p>}
              </div>
              <div className="org-registration-form-group">
                <FaGlobe className="org-registration-input-icon" />
                <input type="url" name="website" placeholder="Website (e.g., https://...)" value={formData.website} onChange={handleChange} />
                {errors.website && <p className="org-registration-validation-error">{errors.website}</p>}
              </div>
            </div>
            
            <div className="org-registration-form-group">
              <FaMapMarkerAlt className="org-registration-input-icon" />
              <textarea name="address" placeholder="Official Address" rows="2" value={formData.address} onChange={handleChange} required></textarea>
              {errors.address && <p className="org-registration-validation-error">{errors.address}</p>}
            </div>
            
            <div className="org-registration-form-row">
              <div className="org-registration-form-group">
                <FaLock className="org-registration-input-icon" />
                <input type="password" name="password" placeholder="Password" value={formData.password} onChange={handleChange} required minLength="8" />
                {errors.password && <p className="org-registration-validation-error">{errors.password}</p>}
              </div>
              <div className="org-registration-form-group">
                <FaLock className="org-registration-input-icon" />
                <input type="password" name="confirmPassword" placeholder="Confirm Password" value={formData.confirmPassword} onChange={handleChange} required />
                {errors.confirmPassword && <p className="org-registration-validation-error">{errors.confirmPassword}</p>}
              </div>
            </div>

            <div className="org-registration-form-group">
              <button type="submit" className="org-registration-button" disabled={loading}>
                {loading ? 'Registering...' : 'Register Organization'}
              </button>
            </div>
          </form>
          <p className="organaisation-login-link">
            Already have an account? <Link to="/login/organisation">Sign In</Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default OrganisationRegistration;