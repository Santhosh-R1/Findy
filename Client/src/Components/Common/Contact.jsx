import React, { useState, useLayoutEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { FaEnvelope, FaPhoneAlt, FaTwitter, FaFacebook, FaInstagram } from 'react-icons/fa';
import axios from 'axios'; 
import '../../Styles/Contact.css';
import heroBackground from '../../assets/HappyFace.jpg';
import LandingNav from './LandingNav';
import axiosInstance from '../../api/baseUrl';

gsap.registerPlugin(ScrollTrigger);

function Contact() {
  const main = useRef();
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });

  const [loading, setLoading] = useState(false);
  const [formStatus, setFormStatus] = useState({ message: '', type: '' });

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      gsap.to(".contact-hero-section", {
        backgroundPosition: `50% 70%`,
        ease: "none",
        scrollTrigger: { trigger: ".contact-hero-section", start: "top top", end: "bottom top", scrub: true },
      });

      const heroTimeline = gsap.timeline({ delay: 0.2 });
      heroTimeline
        .from(".contact-hero-content h1", { y: '100%', skewY: 5, duration: 1.2, ease: 'expo.out' })
        .from(".contact-hero-content p", { opacity: 0, y: 20, duration: 1, ease: 'expo.out' }, "-=0.8");

      const animateOnScroll = (selector, animProps, trigger = null) => {
        gsap.from(selector, {
          scrollTrigger: { trigger: trigger || selector, start: "top 85%", once: true },
          duration: 1.2,
          ease: 'expo.out',
          ...animProps,
        });
      };
      
      animateOnScroll(".contact-info > *", { opacity: 0, y: 40, stagger: 0.15 }, ".contact-grid");
      animateOnScroll(".contact-form .contact-form-group", { opacity: 0, x: 40, stagger: 0.1 }, ".contact-grid");
      animateOnScroll(".contact-form .contact-cta-button", { opacity: 0, y: 30 }, ".contact-grid");

    }, main);

    return () => ctx.revert();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormStatus({ message: '', type: '' }); 
    setLoading(true);

    try {
      const response = await axiosInstance.post('/api/contact', formData);
      
      setFormStatus({ message: response.data.message || "Message sent successfully!", type: 'success' });
            setFormData({ name: '', email: '', subject: '', message: '' });

    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Failed to send message. Please try again later.';
      setFormStatus({ message: errorMessage, type: 'error' });
      console.error('Contact Form Error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <LandingNav />
      <div className="contact-page" ref={main}>
        <section className="contact-hero-section contact-section" style={{ backgroundImage: `url(${heroBackground})` }}>
          <div className="contact-hero-overlay"></div>
          <div className="contact-container">
            <div className="contact-hero-content">
              <h1>We'd Love to Hear From You</h1>
              <p>Whether you have a question, a suggestion, or a story to share, our team is ready to listen.</p>
            </div>
          </div>
        </section>

        <section className="contact-main-section contact-section">
          <div className="contact-container">
            <div className="contact-grid">
              <div className="contact-info">
                <h3>Contact Information</h3>
                <p>Fill out the form to send us a message, or reach out to us directly using the details below. We typically respond within 24 hours.</p>
                <ul>
                  <li><FaEnvelope className="contact-info-icon" /><span>support@findy.com</span></li>
                  <li><FaPhoneAlt className="contact-info-icon" /><span>+1 (555) 123-4567</span></li>
                </ul>
                <div className="contact-social-links">
                  <a href="#twitter" aria-label="Twitter"><FaTwitter /></a>
                  <a href="#facebook" aria-label="Facebook"><FaFacebook /></a>
                  <a href="#instagram" aria-label="Instagram"><FaInstagram /></a>
                </div>
              </div>

              <div className="contact-form">
                <h3>Send Us a Message</h3>
                <form onSubmit={handleSubmit}>
                  {formStatus.message && (
                    <div className={`contact-form-status ${formStatus.type}`}>
                      {formStatus.message}
                    </div>
                  )}

                  <div className="contact-form-group">
                    <label htmlFor="name">Full Name</label>
                    <input type="text" id="name" name="name" value={formData.name} onChange={handleChange} required />
                  </div>
                  <div className="contact-form-group">
                    <label htmlFor="email">Email Address</label>
                    <input type="email" id="email" name="email" value={formData.email} onChange={handleChange} required />
                  </div>
                  <div className="contact-form-group">
                    <label htmlFor="subject">Subject</label>
                    <input type="text" id="subject" name="subject" value={formData.subject} onChange={handleChange} required />
                  </div>
                  <div className="contact-form-group">
                    <label htmlFor="message">Your Message</label>
                    <textarea id="message" name="message" rows="6" value={formData.message} onChange={handleChange} required></textarea>
                  </div>
                  <button type="submit" className="contact-cta-button" disabled={loading}>
                    {loading ? 'Sending...' : 'Send Message'}
                  </button>
                </form>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

export default Contact;