import React, { useState, useLayoutEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { FaBalanceScale, FaEnvelope, FaLock, FaEye, FaEyeSlash } from 'react-icons/fa';
import { Link, useNavigate } from 'react-router-dom';
import axiosInstance from '../../api/baseUrl';

import '../../Styles/ModeratorLogin.css';
import LandingNav from '../Common/LandingNav';

function ModeratorLogin() {
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
      tl.from(".moderator-login-card", { opacity: 0, scale: 0.9, duration: 0.8, ease: 'expo.out' })
        .from(".moderator-login-visual", { x: "-100%", duration: 1.2, ease: 'power4.inOut' }, "-=0.6")
        .from([".moderator-login-icon", ".moderator-login-visual h2", ".moderator-login-visual p"], { opacity: 0, y: 30, stagger: 0.15, duration: 0.8, ease: 'power3.out' }, "-=0.8")
        .from([".moderator-login-form-section h2", ".moderator-login-form-group", ".moderator-login-forgot-password"], { opacity: 0, x: 40, stagger: 0.1, duration: 0.8, ease: 'power3.out' }, "-=0.9");
    }, main);
    return () => ctx.revert();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevData => ({ ...prevData, [name]: value }));
    setError('');
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await axiosInstance.post('/api/moderator/login', formData);
      localStorage.setItem('moderatorToken', response.data.token);
      localStorage.setItem('moderatorInfo', JSON.stringify(response.data));
      navigate('/moderator/DashBoard');
    } catch (err) {
      if (err.response && err.response.data && err.response.data.message) {
        setError(err.response.data.message);
      } else {
        setError('Login failed. Please check your credentials and try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <LandingNav />
      <div className="moderator-login-page" ref={main}>
        <div className="background-triangles">
            {[...Array(10)].map((_, i) => <div key={i} className="triangle"></div>)}
        </div>

        <div className="moderator-login-card">
          <div className="moderator-login-visual">
            <FaBalanceScale className="moderator-login-icon" />
            <h2>Moderator Hub</h2>
            <p>Maintain community standards and ensure a safe, positive environment for all users.</p>
          </div>
          <div className="moderator-login-form-section">
            <h2>Moderator Access</h2>
            <p className="moderator-login-subtitle">Please sign in to access moderation tools.</p>
            
            <form onSubmit={handleSubmit} className="moderator-login-form" autoComplete="off">
              {/* Fake fields to trick browser autofill */}
              <input type="text" style={{display: 'none'}} />
              <input type="password" style={{display: 'none'}} />

              {error && <p className="moderator-login-error-message">{error}</p>}
              
              <div className="moderator-login-form-group">
                <FaEnvelope className="moderator-login-input-icon" />
                <input
                  type="email"
                  id="email"
                  name="email"
                  placeholder="Moderator Email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  autoComplete="off"
                  readOnly
                  onFocus={(e) => e.target.removeAttribute('readonly')}
                />
              </div>
              <div className="moderator-login-form-group password-group">
                <FaLock className="moderator-login-input-icon" />
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
                <span className="password-toggle-icon" onClick={togglePasswordVisibility}>
                  {showPassword ? <FaEyeSlash /> : <FaEye />}
                </span>
              </div>
              <div className="moderator-login-form-group">
                <button
                  type="submit"
                  className="moderator-login-button"
                  disabled={loading}
                >
                  {loading ? 'Logging In...' : 'Log In to Moderate'}
                </button>
              </div>
            </form>
            <Link to="/moderator/forgot-password" className="moderator-login-forgot-password">
              Forgot Password?
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}

export default ModeratorLogin;