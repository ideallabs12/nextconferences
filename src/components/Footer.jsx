import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import './Footer.css';

const Footer = () => {
  const typographyRef = useRef(null);
  const [isGlowing, setIsGlowing] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        // When footer enters the viewport
        if (entry.isIntersecting) {
          setIsGlowing(true);
          // Turn off the glow after 2 seconds
          setTimeout(() => {
            setIsGlowing(false);
          }, 2000);
        }
      },
      { threshold: 0.5 } // Trigger when 50% of the typography is visible
    );

    if (typographyRef.current) {
      observer.observe(typographyRef.current);
    }

    return () => {
      if (typographyRef.current) {
        observer.unobserve(typographyRef.current);
      }
    };
  }, []);

  return (
    <footer className="modern-footer">
      <div className="footer-content-wrapper">
        {/* Top Section: CTA & Links */}
        <div className="footer-top">
          <div className="footer-brand-section">
            <h3 className="footer-cta-text">
              Ready for what's <span className="text-gradient">NEXT?</span>
            </h3>
            <p className="footer-brand-desc">
              Join the world's most visionary thinkers and leaders at our upcoming premier league conferences.
            </p>
            <div className="footer-socials">
              <a href="#" className="social-icon">IN</a>
              <a href="#" className="social-icon">TW</a>
              <a href="#" className="social-icon">IG</a>
              <a href="#" className="social-icon">YT</a>
            </div>
          </div>

          <div className="footer-links-grid">
            <div className="footer-column">
              <h4 className="footer-col-title">Navigation</h4>
              <ul>
                <li><Link to="/">Home</Link></li>
                <li><Link to="/conferences">Conferences</Link></li>
                <li><Link to="/speakers">Speakers</Link></li>
                <li><Link to="/gallery">Gallery</Link></li>
              </ul>
            </div>
            <div className="footer-column">
              <h4 className="footer-col-title">Company</h4>
              <ul>
                <li><Link to="/aboutus">About Us</Link></li>
                <li><Link to="/contactus">Contact</Link></li>
                <li><Link to="/committee">Committee</Link></li>
              </ul>
            </div>
            <div className="footer-column">
              <h4 className="footer-col-title">Legal</h4>
              <ul>
                <li><Link to="/faqs">FAQs</Link></li>
                <li><Link to="/privacypolicy">Privacy Policy</Link></li>
                <li><Link to="/termsandconditions">Terms & Conditions</Link></li>
              </ul>
            </div>
          </div>
        </div>

        {/* Bottom Section: Massive Typography */}
        <div className="massive-typography" ref={typographyRef}>
          <div className="massive-word">
            <span className={`letter n ${isGlowing ? 'active-glow' : ''}`}>N</span>
            <span className={`letter e ${isGlowing ? 'active-glow' : ''}`}>E</span>
            <span className={`letter x ${isGlowing ? 'active-glow' : ''}`}>X</span>
            <span className={`letter t ${isGlowing ? 'active-glow' : ''}`}>T</span>
          </div>
          <div className={`massive-subtext ${isGlowing ? 'active-sub-glow' : ''}`}>
            <span>PREMIER</span>
            <span>LEAGUE</span>
            <span>CONFERENCES</span>
          </div>
        </div>

        <div className="footer-copyright">
          <p>&copy; {new Date().getFullYear()} NEXT Conferences. All rights reserved.</p>
          <p className="footer-credits">Designed for the Future</p>
        </div>

      </div>
    </footer>
  );
};

export default Footer;
