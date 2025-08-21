import React, { useLayoutEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Link } from 'react-router-dom';
import { FaBullseye, FaUsers, FaHeart } from 'react-icons/fa';

// Import the specific stylesheet for this page
import '../../Styles/About.css';

// Import your images
import heroBackground from '../../assets/Hand2.jpg';
import missionImage from '../../assets/Find.jpg';
import ecosystemImage from '../../assets/MembersSupport.jpg';
import joinImage from '../../assets/HappyFace.jpg';
import LandingNav from './LandingNav';

gsap.registerPlugin(ScrollTrigger);

function About() {
  const main = useRef();

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      // --- HERO ANIMATION ---
      gsap.to(".about-hero-section", {
        backgroundPosition: `50% 80%`, ease: "none",
        scrollTrigger: { trigger: ".about-hero-section", start: "top top", end: "bottom top", scrub: true },
      });

      const heroTimeline = gsap.timeline({ delay: 0.2 });
      heroTimeline
        .from(".about-hero-content h1 span", { y: '110%', skewY: 7, duration: 1.5, stagger: 0.1, ease: 'expo.out' })
        .from(".about-hero-content p", { opacity: 0, y: 20, duration: 1, ease: 'expo.out' }, "-=1.2");

      // --- REUSABLE ANIMATION FUNCTION ---
      const animateOnScroll = (selector, animProps, trigger = null) => {
        gsap.from(selector, {
          scrollTrigger: { trigger: trigger || selector, start: "top 85%", once: true },
          duration: 1.2, ease: 'expo.out', ...animProps,
        });
      };

      // Animate all section titles and subtitles
      const sections = gsap.utils.toArray('.about-section');
      sections.forEach(section => {
        const title = section.querySelector('.about-section-title');
        const subtitle = section.querySelector('.about-section-subtitle');
        if (title) animateOnScroll(title, { opacity: 0, y: 50 });
        if (subtitle) animateOnScroll(subtitle, { opacity: 0, y: 40, delay: 0.1 });
      });

      // --- SPECIFIC SECTION ANIMATIONS ---
      animateOnScroll(".about-origin-story-content > *", { opacity: 0, y: 40, stagger: 0.15 }, ".about-origin-story-content");

      const animateImageAndContent = (triggerSelector, imageSelector, contentSelector) => {
        const tl = gsap.timeline({ scrollTrigger: { trigger: triggerSelector, start: 'top 75%', once: true } });
        tl.from(imageSelector, { clipPath: 'polygon(0% 100%, 100% 100%, 100% 100%, 0% 100%)', duration: 1.5, ease: 'expo.out' })
          .from(contentSelector, { opacity: 0, y: 40, stagger: 0.15, duration: 1, ease: 'power3.out' }, '-=1.2');
      };

      animateImageAndContent('.about-mission-section', '.about-mission-image', '.about-mission-content > *');
      
      animateOnScroll(".about-ecosystem-card", { opacity: 0, y: 60, stagger: 0.15 }, ".about-ecosystem-grid");
      animateOnScroll(".about-value-card", { opacity: 0, y: 60, stagger: 0.15 }, ".about-values-grid");
      animateOnScroll(".about-join-us-section .about-container > *", { opacity: 0, y: 50, stagger: 0.1 }, ".about-join-us-section");
    }, main);

    return () => ctx.revert();
  }, []);

  return (
    <div>
      <LandingNav />
      <div className="about-page" ref={main}>
        <section className="about-hero-section about-section" style={{ backgroundImage: `url(${heroBackground})` }}>
          <div className="about-hero-overlay"></div>
          <div className="about-container">
            <div className="about-hero-content">
              <h1>
                <span>Connecting Communities,</span>
                <span>One Reunion at a Time.</span>
              </h1>
              <p>Findy was born from a simple idea: that technology, when paired with human kindness, can create powerful connections and bring immense relief.</p>
            </div>
          </div>
        </section>

        <section className="about-origin-story-section about-section">
          <div className="about-container">
            <h2 className="about-section-title">From a Simple Problem to a Shared Solution</h2>
            <div className="about-origin-story-content">
              <p>It started with a lost laptop in a bustling coffee shop. The panic, the lost work, the feeling of disconnection—it was overwhelming. Traditional methods felt slow and hopeless. That experience sparked a question: "What if there was a better way?"</p>
              <p>That question became Findy. We set out to build not just a tool, but a dedicated network of helpers. A place where a moment of honesty from one person could completely turn around another's day. We focused on pets and essential tech because they aren't just 'items'—they're family members and livelihoods.</p>
            </div>
          </div>
        </section>

        <section className="about-mission-section about-section about-alt-bg">
          <div className="about-container about-mission-container">
            <div className="about-mission-image">
              <img src={missionImage} alt="Person looking closely at something to find it" />
            </div>
            <div className="about-mission-content">
              <h2 className="about-section-title" style={{ textAlign: 'left' }}>Our Mission</h2>
              <p>Our mission is to bridge the gap between losing something valuable and the moment of joyful reunion. We believe in the power of community and the inherent honesty of people. Findy is more than an app; it's a network of neighbors helping neighbors.</p>
            </div>
          </div>
        </section>

        <section className="about-ecosystem-section about-section">
          <div className="about-container">
            <h2 className="about-section-title">The Findy Ecosystem</h2>
            <p className="about-section-subtitle">Our platform thrives because of the people who use it. Every member plays a vital role.</p>
            <div className="about-ecosystem-image-wrapper">
              <img src={ecosystemImage} alt="A diverse group of people working together" />
            </div>
            <div className="about-ecosystem-grid">
              <div className="about-ecosystem-card">
                <h3>The Seeker</h3>
                <p>Anyone who has lost a pet or a device. By providing clear, anonymous details, they empower the community to keep an eye out.</p>
              </div>
              <div className="about-ecosystem-card">
                <h3>The Finder</h3>
                <p>The heroes of our community. By taking a moment to post a found item, they initiate the process of reunion.</p>
              </div>
              <div className="about-ecosystem-card">
                <h3>The Community</h3>
                <p>The network of active users who share alerts and offer support. They are the eyes and ears that make rapid reunions possible.</p>
              </div>
            </div>
          </div>
        </section>

        <section className="about-values-section about-section about-alt-bg">
          <div className="about-container">
            <h2 className="about-section-title">Our Core Values</h2>
            <p className="about-section-subtitle">These principles guide every feature we build and every community we foster.</p>
            <div className="about-values-grid">
              <div className="about-value-card">
                <div className="about-value-icon-wrapper"><FaHeart /></div>
                <h3>Empathy & Urgency</h3>
                <p>We understand the stress and heartache of losing something important. Our platform is designed for speed and peace of mind.</p>
              </div>
              <div className="about-value-card">
                <div className="about-value-icon-wrapper"><FaUsers /></div>
                <h3>Community First</h3>
                <p>We empower individuals to make a real difference. Every successful reunion strengthens the fabric of the community.</p>
              </div>
              <div className="about-value-card">
                <div className="about-value-icon-wrapper"><FaBullseye /></div>
                <h3>Focused Innovation</h3>
                <p>We are dedicated to building the best tool for this one specific purpose, ensuring our technology is secure, private, and effective.</p>
              </div>
            </div>
          </div>
        </section>

        <section className="about-join-us-section about-section" style={{ backgroundImage: `url(${joinImage})` }}>
          <div className="about-hero-overlay"></div>
          <div className="about-container">
            <h2>Join Our Story</h2>
            <p>Every member who posts a lost item or reports a find becomes a part of our mission. Help us write the next happy ending.</p>
            <Link to="/register" className="about-cta-button">Become a Member</Link>
          </div>
        </section>
      </div>
    </div>
  );
}

export default About;