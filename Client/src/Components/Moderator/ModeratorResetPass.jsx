import React, { useState, useLayoutEffect } from 'react';
import { gsap } from 'gsap';
import { FaKey, FaLock, FaArrowLeft } from 'react-icons/fa';
import { Link, useNavigate, useParams } from 'react-router-dom';

import axiosInstance from '../../api/baseUrl';
import '../../Styles/ModeratorResetPass.css'; 

function ModeratorResetPass() {
  const [formData, setFormData] = useState({
    password: '',
    confirmPassword: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);

  const navigate = useNavigate();
  const { token } = useParams();

  useLayoutEffect(() => {
    gsap.fromTo(
      ".moderator-reset-pass-card", 
      { opacity: 0, y: 50 },
      { opacity: 1, y: 0, duration: 0.8, ease: "power3.out" }
    );
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setError(null);
    setSuccessMessage(null);
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccessMessage(null);

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    if (formData.password.length < 8) {
      setError("Password must be at least 8 characters long.");
      return;
    }

    setLoading(true);
    try {
      const response = await axiosInstance.post(`/api/moderator/reset-password/${token}`, {
        password: formData.password,
        confirmPassword: formData.confirmPassword,
      });

      setSuccessMessage(response.data.message || "Password updated successfully!");
     

    } catch (err) {
      const message = err.response?.data?.message || "Failed to reset password. The link may be invalid or expired.";
      setError(message);
      console.error("Reset Password Error:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="moderator-reset-pass-page">
      <div className="moderator-reset-pass-card">
        <div className="moderator-reset-pass-visual">
          <FaKey className="moderator-reset-pass-icon" />
          <h2>Create New Password</h2>
          <p>Your new password must be different from previously used passwords.</p>
        </div>
        <div className="moderator-reset-pass-form-section">
          <h2>Set Your New Password</h2>

          {error && <p className="moderator-reset-pass-error-message">{error}</p>}
          {successMessage && <p className="moderator-reset-pass-success-message">{successMessage}</p>}

          <form onSubmit={handlePasswordSubmit}>
            <div className="moderator-reset-pass-form-group">
              <FaLock className="moderator-reset-pass-input-icon" />
              <input
                type="password"
                name="password"
                placeholder="New Password"
                value={formData.password}
                onChange={handleChange}
                required
              />
            </div>
            <div className="moderator-reset-pass-form-group">
              <FaLock className="moderator-reset-pass-input-icon" />
              <input
                type="password"
                name="confirmPassword"
                placeholder="Confirm New Password"
                value={formData.confirmPassword}
                onChange={handleChange}
                required
              />
            </div>
            <div className="moderator-reset-pass-form-group">
              <button
                type="submit"
                className="moderator-reset-pass-button"
                disabled={loading}
              >
                {loading ? 'Updating...' : 'Update Password'}
              </button>
            </div>
          </form>
          <p className="moderator-reset-pass-back-link">
            <Link to="/login/moderator">
              <FaArrowLeft /> Back to Login
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default ModeratorResetPass;