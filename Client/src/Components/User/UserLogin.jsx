import React, { useState, useLayoutEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { FaEnvelope, FaLock, FaUserCircle, FaEye, FaEyeSlash } from 'react-icons/fa';
import { Link, useNavigate } from 'react-router-dom';
import axiosInstance from '../../api/baseUrl';
import '../../Styles/UserLogin.css';

function UserLogin() {
  const main = useRef();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ delay: 0.3 });
      tl.from(".user-login-card", { opacity: 0, scale: 0.9, duration: 0.8, ease: 'expo.out' })
        .from(".user-login-visual", { x: "-100%", duration: 1.2, ease: 'power4.inOut' }, "-=0.6")
        .from([".user-login-icon", ".user-login-visual h2", ".user-login-visual p"], { opacity: 0, y: 30, stagger: 0.15, duration: 0.8, ease: 'power3.out' }, "-=0.8")
        .from([".user-login-form-section h2", ".user-login-form-group", ".user-login-links"], { opacity: 0, x: 40, stagger: 0.1, duration: 0.8, ease: 'power3.out' }, "-=0.9");
    }, main);
    return () => ctx.revert();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevData => ({ ...prevData, [name]: value }));
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await axiosInstance.post('/api/users/login', formData);
      localStorage.setItem('userInfo', JSON.stringify(response.data));
      navigate('/user/dashboard');
    } catch (err) {
      if (err.response && err.response.data && err.response.data.message) {
        setError(err.response.data.message);
      } else {
        setError('Login failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="user-login-page" ref={main}>
        {/* Animated Background Bubbles */}
        <div className="background-bubbles">
          {[...Array(10)].map((_, i) => <div key={i} className="bubble"></div>)}
        </div>

        <div className="user-login-card">
          <div className="user-login-visual">
            <FaUserCircle className="user-login-icon" />
            <h2>Welcome Back!</h2>
            <p>Sign in to access your dashboard, settings, and personalized content.</p>
          </div>
          <div className="user-login-form-section">
            <h2>Login to Your Account</h2>
            <p className="user-login-subtitle">Please enter your credentials to continue.</p>
            
            <form onSubmit={handleSubmit} className="user-login-form" autoComplete="off">
              {/* Fake inputs to prevent browser autofill */}
              <input type="text" style={{display: 'none'}} />
              <input type="password" style={{display: 'none'}} />

              {error && <p className="user-login-error-message">{error}</p>}
              
              <div className="user-login-form-group">
                <FaEnvelope className="user-login-input-icon" />
                <input
                  type="email"
                  id="email"
                  name="email"
                  placeholder="Email Address"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  autoComplete="off"
                  readOnly
                  onFocus={(e) => e.target.removeAttribute('readonly')}
                />
              </div>
              <div className="user-login-form-group password-group">
                <FaLock className="user-login-input-icon" />
                <input
                  type={showPassword ? "text" : "password"}
                  id="password"
                  name="password"
                  placeholder="Password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  autoComplete="new-password"
                  readOnly
                  onFocus={(e) => e.target.removeAttribute('readonly')}
                />
                <span className="password-toggle-icon-user" onClick={togglePasswordVisibility}>
                  {showPassword ? <FaEyeSlash /> : <FaEye />}
                </span>
              </div>
              <div className="user-login-form-group">
                <button
                  type="submit"
                  className="user-login-button"
                  disabled={loading}
                >
                  {loading ? 'Signing In...' : 'Sign In'}
                </button>
              </div>
            </form>
            <div className="user-login-links">
              <Link to="/User/Forgot-Password" className="user-login-forgot-password">
                Forgot Password?
              </Link>
              <p className="user-login-signup-link">
                Don't have an account? <Link to="/User/register">Sign Up</Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default UserLogin;