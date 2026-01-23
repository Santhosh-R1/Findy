import React, { useState, useLayoutEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { FaUserShield, FaEnvelope, FaLock, FaEye, FaEyeSlash } from 'react-icons/fa';
import { Link, useNavigate } from 'react-router-dom';
import axiosInstance from '../../api/baseUrl';

import '../../Styles/AdminLogin.css';

function AdminLogin() {
  const main = useRef();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ delay: 0.3 });
      tl.from(".admin-login-card", { opacity: 0, scale: 0.9, duration: 0.8, ease: 'expo.out' })
        .from(".admin-login-visual", { x: "-100%", duration: 1.2, ease: 'power4.inOut' }, "-=0.6")
        .from([".admin-login-icon", ".admin-login-visual h2", ".admin-login-visual p"], { opacity: 0, y: 30, stagger: 0.15, duration: 0.8, ease: 'power3.out' }, "-=0.8")
        .from([".admin-login-form-section h2", ".admin-login-form-group", ".admin-login-forgot-password"], { opacity: 0, x: 40, stagger: 0.1, duration: 0.8, ease: 'power3.out' }, "-=0.9");
    }, main);
    return () => ctx.revert();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setError(null);
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const response = await axiosInstance.post('/api/admin/login', formData);
      if (response.data && response.data.token) {
        localStorage.setItem('adminToken', response.data.token);
        navigate('/admin/dashboard');
      }
    } catch (err) {
      const message = err.response?.data?.message || "An unexpected error occurred. Please try again.";
      setError(message);
      console.error("Admin login failed:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="admin-login-page" ref={main}>
        <div className="background-shapes">
            <span></span><span></span><span></span><span></span><span></span><span></span><span></span><span></span>
        </div>

        <div className="admin-login-card">
          <div className="admin-login-visual">
            <FaUserShield className="admin-login-icon" />
            <h2>Admin Panel</h2>
            <p>Secure access for authorized personnel only. Welcome to the control center.</p>
          </div>
          <div className="admin-login-form-section">
            <h2>Welcome, Administrator</h2>
            <p className="admin-login-subtitle">Please enter your credentials to proceed.</p>
            {error && <p className="admin-login-error-message">{error}</p>}

            <form onSubmit={handleSubmit} className="admin-login-form" autoComplete="off">
              <div className="admin-login-form-group">
                <FaEnvelope className="admin-login-input-icon" />
                <input
                  type="email"
                  id="email"
                  name="email"
                  placeholder="Email Address"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  autoComplete="off" 
                />
              </div>
              <div className="admin-login-form-group password-group">
                <FaLock className="admin-login-input-icon" />
                <input
                  type={showPassword ? "text" : "password"}
                  id="password"
                  name="password"
                  placeholder="Password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  autoComplete="off"
                />
                <span className="password-toggle-icon" onClick={togglePasswordVisibility}>
                  {showPassword ? <FaEyeSlash /> : <FaEye />}
                </span>
              </div>

              <div className="admin-login-form-group">
                <button
                  type="submit"
                  className="admin-login-button"
                  disabled={loading}
                >
                  {loading ? 'Logging In...' : 'Log In Securely'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </>
  );
}

export default AdminLogin;