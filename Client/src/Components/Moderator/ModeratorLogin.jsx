import React, { useLayoutEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { FaBalanceScale, FaEnvelope, FaLock } from 'react-icons/fa';
import { Link } from 'react-router-dom';

// Import the specific stylesheet for this page
import '../../Styles/ModeratorLogin.css';

// Import the shared LandingNav
import LandingNav from '../Common/LandingNav';

function ModeratorLogin() {
  const main = useRef();

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      // GSAP Animation Timeline
      const tl = gsap.timeline({ delay: 0.3 });

      tl.from(".moderator-login-card", {
        opacity: 0,
        scale: 0.9,
        duration: 0.8,
        ease: 'expo.out'
      })
      .from(".moderator-login-visual", {
        x: "-100%",
        duration: 1.2,
        ease: 'power4.inOut'
      }, "-=0.6")
      .from([".moderator-login-icon", ".moderator-login-visual h2", ".moderator-login-visual p"], {
        opacity: 0,
        y: 30,
        stagger: 0.15,
        duration: 0.8,
        ease: 'power3.out'
      }, "-=0.8")
      .from([
        ".moderator-login-form-section h2", 
        ".moderator-login-form-group",
        ".moderator-login-forgot-password"
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

  const handleSubmit = (e) => {
    e.preventDefault();
    // Moderator login logic would go here
    console.log("Moderator login attempt");
    alert("Login functionality to be implemented.");
  };

  return (
    <>
      <LandingNav />
      <div className="moderator-login-page" ref={main}>
        <div className="moderator-login-card">
          
          {/* Left Visual Section */}
          <div className="moderator-login-visual">
            <FaBalanceScale className="moderator-login-icon" />
            <h2>Moderator Hub</h2>
            <p>Maintain community standards and ensure a safe, positive environment for all users.</p>
          </div>

          {/* Right Form Section */}
          <div className="moderator-login-form-section">
            <h2>Moderator Access</h2>
            <p className="moderator-login-subtitle">Please sign in to access moderation tools.</p>
            
            <form onSubmit={handleSubmit} className="moderator-login-form">
              <div className="moderator-login-form-group">
                <FaEnvelope className="moderator-login-input-icon" />
                <input type="email" id="email" name="email" placeholder="Moderator Email" required />
              </div>
              <div className="moderator-login-form-group">
                <FaLock className="moderator-login-input-icon" />
                <input type="password" id="password" name="password" placeholder="Password" required />
              </div>

              <div className="moderator-login-form-group">
                <button type="submit" className="moderator-login-button">
                  Log In to Moderate
                </button>
              </div>
            </form>
            
            <Link to="/forgot-password" className="moderator-login-forgot-password">
              Forgot Password?
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}

export default ModeratorLogin;