import React, { useLayoutEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Link } from 'react-router-dom';
import { FaSearch, FaCloudUploadAlt, FaHeart, FaUsers, FaShieldAlt, FaLightbulb } from 'react-icons/fa';

import '../../Styles/LandingPage.css';
import heroBackground from '../../assets/Hand2.jpg';
import phoneImage from '../../assets/Traveller.jpg';
import petsImage from '../../assets/Pets.jpg';
import creativeTech from '../../assets/TakeItEasy.jpg';
import wallet from '../../assets/wallet.jpg'; 

import LandingNav from './LandingNav';

gsap.registerPlugin(ScrollTrigger);

function LandingPage() {
  const main = useRef();

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      // Parallax for Hero Background
      gsap.to(".landing-hero-section", {
        backgroundPosition: `50% 100%`,
        ease: "none",
        scrollTrigger: {
          trigger: ".landing-hero-section",
          start: "top top",
          end: "bottom top",
          scrub: true 
        },
      });

      // Hero Text Animation
      const heroTimeline = gsap.timeline({ delay: 0.2 });
      heroTimeline
        .from(".landing-hero-h1-word span", {
          y: '110%',
          skewY: 5,
          duration: 1.2,
          stagger: 0.08,
          ease: 'expo.out'
        })
        .from([".landing-hero-subtitle", ".landing-cta-button"], {
          opacity: 0,
          y: 30,
          duration: 1,
          stagger: 0.15,
          ease: 'expo.out'
        }, "-=1"); 

      const sections = gsap.utils.toArray('.landing-section');
      sections.forEach(section => {
        const title = section.querySelector('.landing-section-title');
        const subtitle = section.querySelector('.landing-section-subtitle');
        
        if (title) {
          gsap.from(title, {
            scrollTrigger: { trigger: title, start: "top 90%", once: true },
            opacity: 0,
            y: 50,
            duration: 1.2,
            ease: 'expo.out',
          });
        }
        if (subtitle) {
          gsap.from(subtitle, {
            scrollTrigger: { trigger: subtitle, start: "top 90%", once: true },
            opacity: 0,
            y: 40,
            duration: 1.2,
            ease: 'expo.out',
            delay: 0.1
          });
        }
      });
      
      gsap.from(".landing-info-card", {
        scrollTrigger: { trigger: ".landing-info-grid", start: "top 85%", once: true },
        opacity: 0,
        y: 60,
        duration: 1.2,
        ease: 'expo.out',
        stagger: 0.15
      });

      gsap.from(".landing-step-card", {
        scrollTrigger: { trigger: ".landing-how-it-works-grid", start: "top 85%", once: true },
        opacity: 0,
        y: 80,
        scale: 0.95,
        duration: 1.2,
        ease: 'expo.out',
        stagger: 0.15
      });

      const features = gsap.utils.toArray('.landing-feature-item');
      features.forEach(feature => {
        const imageWrapper = feature.querySelector('.landing-feature-image');
        const image = feature.querySelector('.landing-feature-image img');
        const content = feature.querySelectorAll('.landing-feature-content > *');

        gsap.to(image, {
          yPercent: -10,
          ease: "none",
          scrollTrigger: {
            trigger: feature,
            start: "top bottom",
            end: "bottom top",
            scrub: true
          },
        });

        const featureTimeline = gsap.timeline({
          scrollTrigger: {
            trigger: feature,
            start: "top 80%",
            once: true
          }
        });

        featureTimeline
          .from(imageWrapper, {
            clipPath: 'polygon(0% 100%, 100% 100%, 100% 100%, 0% 100%)', 
            duration: 1.5,
            ease: 'expo.out'
          })
          .from(content, {
            opacity: 0,
            y: 50,
            duration: 1.2,
            stagger: 0.1,
            ease: 'power3.out'
          }, "-=1.2");
      });

      gsap.from(".landing-final-cta-section .landing-container > *", {
        scrollTrigger: { trigger: ".landing-final-cta-section", start: "top 80%", once: true },
        opacity: 0,
        y: 50,
        duration: 1.2,
        ease: 'expo.out',
        stagger: 0.1
      });

    }, main); 

    return () => ctx.revert();
  }, []);

  return (
    <div>
      <div className="landing-page" ref={main}>
        <section className="landing-hero-section" style={{ backgroundImage: `url(${heroBackground})` }}>
          <div className="landing-hero-overlay"></div>
          <div className="landing-container">
            <div className="landing-hero-content">
              <h1>
                <div className="landing-hero-h1-word"><span>Lost Items & Pets,</span></div>
                <div className="landing-hero-h1-word"><span>Reunited by</span></div>
                <div className="landing-hero-h1-word"><span className="landing-brand-name">Findmate.</span></div>
              </h1>
              <p className="landing-hero-subtitle">The community platform for reuniting you with your lost pets, phones, wallets, and more. Your neighbors are ready to help.</p>
              <Link to="/User/register" className="landing-cta-button">Join the Community</Link>
            </div>
          </div>
        </section>

        <section className="landing-why-us-section landing-section">
          <div className="landing-container">
            <h2 className="landing-section-title">Why Choose Findmate?</h2>
            <p className="landing-section-subtitle">A faster, safer, and more effective way to find your lost companions and valuables.</p>
            <div className="landing-info-grid">
              <div className="landing-info-card">
                <div className="landing-info-icon-wrapper"><FaUsers /></div>
                <h3>Community-Powered</h3>
                <p>Harness the collective power of a local and global network of helpful, honest people ready to assist.</p>
              </div>
              <div className="landing-info-card">
                <div className="landing-info-icon-wrapper"><FaShieldAlt /></div>
                <h3>Secure & Private</h3>
                <p>Connect through our anonymous, secure messaging system. Your personal contact details are never shared.</p>
              </div>
              <div className="landing-info-card">
                <div className="landing-info-icon-wrapper"><FaLightbulb /></div>
                <h3>Simple & Focused</h3>
                <p>Our streamlined process is designed specifically for finding lost pets, electronics, and personal items, making it incredibly easy.</p>
              </div>
            </div>
          </div>
        </section>

        <section className="landing-how-it-works-section landing-section landing-alt-bg">
          <div className="landing-container">
            <h2 className="landing-section-title">A Simple Path to Reunion</h2>
            <p className="landing-section-subtitle">Our three-step process is designed to bring lost items together with their owners with ease and security.</p>
            <div className="landing-how-it-works-grid">
              <div className="landing-step-card">
                <div className="landing-step-number">1</div>
                <FaSearch className="landing-step-icon" />
                <h3>Describe What's Missing</h3>
                <p>Lost your pet, wallet, or device? Post a detailed, anonymous report. The more detail, the higher the chance of a match.</p>
              </div>
              <div className="landing-step-card">
                <div className="landing-step-number">2</div>
                <FaCloudUploadAlt className="landing-step-icon" />
                <h3>Report a Find</h3>
                <p>Found a lost pet or a handbag? Become a hero. Upload a photo and mark the location to help the owner.</p>
              </div>
              <div className="landing-step-card">
                <div className="landing-step-number">3</div>
                <FaHeart className="landing-step-icon" />
                <h3>Connect & Reunite</h3>
                <p>Our smart system matches reports. Once a match is found, we facilitate a secure chat to arrange a happy reunion.</p>
              </div>
            </div>
          </div>
        </section>

        <section className="landing-features-section landing-section">
          <div className="landing-container">
            <h2 className="landing-section-title">For Every Situation</h2>
            <p className="landing-section-subtitle">Life is unpredictable. Findmate is designed for the things that matter most in our modern lives.</p>

            <div className="landing-feature-item">
              <div className="landing-feature-image">
                <img src={petsImage} alt="Worried Pet Owner with their dog" />
              </div>
              <div className="landing-feature-content">
                <h3>The Worried Pet Owner</h3>
                <p>Our dedicated pet section uses location-based alerts to quickly notify neighbors. Share photos and unique traits to bring your furry friend home safely.</p>
                <Link to="/login/user" className="landing-feature-link">Report a lost pet</Link>
              </div>
            </div>

            <div className="landing-feature-item landing-layout-reversed">
              <div className="landing-feature-image">
                <img src={creativeTech} alt="Laptop and notebook on a desk" />
              </div>
              <div className="landing-feature-content">
                <h3>The Forgetful Creative</h3>
                <p>Left your laptop at a coffee shop? Your valuable work isn't gone forever. Connect with finders in your area and get back to creating.</p>
                <Link to="/login/user" className="landing-feature-link">Find your lost electronics</Link>
              </div>
            </div>

            {/* NEW SECTION FOR WALLETS AND HANDBAGS */}
            <div className="landing-feature-item">
              <div className="landing-feature-image">
                <img src={wallet} alt="A wallet and personal items on a table" />
              </div>
              <div className="landing-feature-content">
                <h3>The Busy Professional</h3>
                <p>A lost wallet or handbag can bring your day to a halt. Securely connect with the person who found it and retrieve your essentials without worry.</p>
                <Link to="/login/user" className="landing-feature-link">Report a lost wallet or bag</Link>
              </div>
            </div>

            <div className="landing-feature-item landing-layout-reversed">
              <div className="landing-feature-image">
                <img src={phoneImage} alt="A person looking at their phone on the go" />
              </div>
              <div className="landing-feature-content">
                <h3>The Disconnected Commuter</h3>
                <p>Losing your phone feels like losing a part of yourself. Our platform helps you quickly alert people on your route to get your digital life back on track.</p>
                <Link to="/login/user" className="landing-feature-link">Search for a lost phone</Link>
              </div>
            </div>

          </div>
        </section>

        <section className="landing-final-cta-section landing-section">
          <div className="landing-container">
            <h2>Rediscover What's Lost.</h2>
            <p>Whether you've lost a wallet, found a pet, or spotted a forgotten laptop, you can make a difference. Sign up today and help bring things home.</p>
            <Link to="/User/register" className="landing-cta-button-footer">Create Your Free Account</Link>
          </div>
        </section>

        <footer className="landing-site-footer">
          <div className="landing-container">
            <p>&copy; {new Date().getFullYear()} Findmate. All Rights Reserved. A community project for good.</p>
          </div>
        </footer>
      </div>
    </div>
  );
}

export default LandingPage;