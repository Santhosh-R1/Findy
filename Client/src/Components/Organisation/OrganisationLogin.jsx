import React, { useState, useLayoutEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { FaBuilding, FaEnvelope, FaLock } from 'react-icons/fa';
import { Link, useNavigate } from 'react-router-dom';
import '../../Styles/OrganisationLogin.css';
import LandingNav from '../Common/LandingNav';
import axiosInstance from '../../api/baseUrl';

function OrganisationLogin() {
  const main = useRef();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ delay: 0.3 });
      tl.from(".organisation-login-card", {
        opacity: 0,
        scale: 0.9,
        duration: 0.8,
        ease: 'expo.out'
      })
      .from(".organisation-login-visual", {
        x: "-100%",
        duration: 1.2,
        ease: 'power4.inOut'
      }, "-=0.6")
      .from([".organisation-login-icon", ".organisation-login-visual h2", ".organisation-login-visual p"], {
        opacity: 0,
        y: 30,
        stagger: 0.15,
        duration: 0.8,
        ease: 'power3.out'
      }, "-=0.8")
      .from([
        ".organisation-login-form-section h2",
        ".organisation-login-form-group",
        ".organisation-login-links"
      ], {
        opacity: 0,
        x: 40,
        stagger: 0.1,
        duration: 0.8,
        ease: 'power3.out'
      }, "-=0.9");
    }, main);
    return () => ctx.revert();
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const response = await axiosInstance.post('/api/organaisation/login', formData);
      console.log('Login successful:', response.data);
      localStorage.setItem('organisationInfo', JSON.stringify(response.data));
      navigate('/organisation/DashBoard');
    } catch (err) {
      const errorMessage = err.response?.data?.message || "An unexpected error occurred. Please try again.";
      setError(errorMessage);
      console.error('Login error:', err.response || err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <LandingNav />
      <div className="organisation-login-page" ref={main}>
        {/* Animated Constellation Background */}
        <div className="background-constellation">
          <div className="star"></div>
          <div className="star"></div>
          <div className="star"></div>
          <div className="star"></div>
          <div className="star"></div>
          <div className="star"></div>
          <div className="star"></div>
          <div className="star"></div>
          <div className="star"></div>
          <div className="star"></div>
          <div className="star"></div>
          <div className="star"></div>
        </div>

        <div className="organisation-login-card">
          <div className="organisation-login-visual">
            <FaBuilding className="organisation-login-icon" />
            <h2>Organization Portal</h2>
            <p>Access your dashboard to manage members, settings, and services.</p>
          </div>
          <div className="organisation-login-form-section">
            <h2>Organization Sign In</h2>
            <p className="organisation-login-subtitle">Enter your official credentials to access the portal.</p>
            {error && <p className="organisation-login-error-message">{error}</p>}
            <form onSubmit={handleSubmit} className="organisation-login-form">
              <div className="organisation-login-form-group">
                <FaEnvelope className="organisation-login-input-icon" />
                <input
                  type="email"
                  id="email"
                  name="email"
                  placeholder="Official Email Address"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="organisation-login-form-group">
                <FaLock className="organisation-login-input-icon" />
                <input
                  type="password"
                  id="password"
                  name="password"
                  placeholder="Password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="organisation-login-form-group">
                <button
                  type="submit"
                  className="organisation-login-button"
                  disabled={loading}
                >
                  {loading ? 'Signing In...' : 'Access Portal'}
                </button>
              </div>
            </form>
            <div className="organisation-login-links">
              <Link to="/Organisation/Forgot-Password" className="organisation-login-forgot-password">
                Forgot Password?
              </Link>
              <p className="organisation-login-signup-link">
                Not a partner yet? <Link to="/Organisation/register">Register your Organization</Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default OrganisationLogin;