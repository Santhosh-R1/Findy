import React, { useState, useLayoutEffect } from 'react';
import { gsap } from 'gsap';
import { FaKey, FaEnvelope, FaArrowLeft } from 'react-icons/fa';
import { Link } from 'react-router-dom';

import axiosInstance from '../../api/baseUrl';
import '../../Styles/ModeratorForgotPass.css'; 

function ModeratorForgotPass() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);

  useLayoutEffect(() => {
    gsap.fromTo(
      ".moderator-forgot-pass-card", 
      { opacity: 0, y: 50 },
      { opacity: 1, y: 0, duration: 0.8, ease: "power3.out" }
    );
  }, []);

  const handleChange = (e) => {
    setEmail(e.target.value);
    setError(null);
    setSuccessMessage(null);
  };

  const handleEmailSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccessMessage(null);
    setLoading(true);

    try {
      const response = await axiosInstance.post('/api/moderator/forgot-password', { email });
      setSuccessMessage(response.data.message);
      setEmail(''); 
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to send reset link. Please try again.");
      console.error("Forgot Password Error:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="moderator-forgot-pass-page">
      <div className="moderator-forgot-pass-card">
        <div className="moderator-forgot-pass-visual">
          <FaKey className="moderator-forgot-pass-icon" />
          <h2>Forgot Your Password?</h2>
          <p>No worries! Enter your email and we'll send you a link to reset it.</p>
        </div>

        <div className="moderator-forgot-pass-form-section">
          <h2>Reset Your Password</h2>
          <p className="moderator-forgot-pass-subtitle">
            Enter the email address associated with your account.
          </p>

          {error && <p className="moderator-forgot-pass-error-message">{error}</p>}
          {successMessage && <p className="moderator-forgot-pass-success-message">{successMessage}</p>}

          <form onSubmit={handleEmailSubmit}>
            <div className="moderator-forgot-pass-form-group">
              <FaEnvelope className="moderator-forgot-pass-input-icon" />
              <input
                type="email"
                name="email"
                placeholder="Email Address"
                value={email}
                onChange={handleChange}
                required
              />
            </div>
            <div className="moderator-forgot-pass-form-group">
              <button
                type="submit"
                className="moderator-forgot-pass-button"
                disabled={loading}
              >
                {loading ? 'Sending...' : 'Send Reset Link'}
              </button>
            </div>
          </form>
          <p className="moderator-forgot-pass-back-link">
            <Link to="/login/moderator">
              <FaArrowLeft /> Back to Login
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default ModeratorForgotPass;