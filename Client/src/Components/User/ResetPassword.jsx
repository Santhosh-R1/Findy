import React, { useState, useLayoutEffect } from 'react';
import { gsap } from 'gsap';
import { FaKey, FaLock, FaArrowLeft } from 'react-icons/fa';
import { Link, useNavigate, useParams } from 'react-router-dom';

import axiosInstance from '../../api/baseUrl';
import '../../Styles/UserForgotPass.css';

function ResetPassword() {
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
      ".user-forgot-pass-card",
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
    if (formData.password.length < 6) {
      setError("Password must be at least 6 characters long.");
      return;
    }

    setLoading(true);
    try {
      const response = await axiosInstance.post(`/api/users/reset-password/${token}`, {
        password: formData.password,
        confirmPassword: formData.confirmPassword,
      });

      setSuccessMessage(response.data.message || "Password updated successfully! Redirecting...");
      setTimeout(() => {
        navigate('/login/user');
      }, 3000);

    } catch (err) {
      const message = err.response?.data?.message || "Failed to reset password. The link may be invalid or expired.";
      setError(message);
      console.error("Reset Password Error:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="user-forgot-pass-page">
        <div className="user-forgot-pass-card">
          <div className="user-forgot-pass-visual">
            <FaKey className="user-forgot-pass-icon" />
            <h2>Create New Password</h2>
            <p>Your new password must be different from previously used passwords.</p>
          </div>
          <div className="user-forgot-pass-form-section">
            <h2>Set Your New Password</h2>

            {error && <p className="user-forgot-pass-error-message">{error}</p>}
            {successMessage && <p className="user-forgot-pass-success-message">{successMessage}</p>}

            <form onSubmit={handlePasswordSubmit}>
              <div className="user-forgot-pass-form-group">
                <FaLock className="user-forgot-pass-input-icon" />
                <input
                  type="password"
                  name="password"
                  placeholder="New Password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="user-forgot-pass-form-group">
                <FaLock className="user-forgot-pass-input-icon" />
                <input
                  type="password"
                  name="confirmPassword"
                  placeholder="Confirm New Password"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="user-forgot-pass-form-group">
                <button
                  type="submit"
                  className="user-forgot-pass-button"
                  disabled={loading}
                >
                  {loading ? 'Updating...' : 'Update Password'}
                </button>
              </div>
            </form>
            <p className="user-forgot-pass-back-link">
              <Link to="/login/user">
                <FaArrowLeft /> Back to Login
              </Link>
            </p>
          </div>
        </div>
      </div>
    </>
  );
}

export default ResetPassword;