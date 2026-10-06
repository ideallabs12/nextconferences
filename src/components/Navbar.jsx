import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import logoImage from '../assets/logo.png';
import './navbar.css';

function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const isActive = (path) => {
    return location.pathname === path ? 'active' : '';
  };

  return (
    <nav className={`navbar ${scrolled ? 'scrolled' : ''}`}>
      <div className="navbar-container">
        <div className="navbar-logo">
          <Link to="/">
            <img src={logoImage} alt="NEXT Conferences" className="navbar-logo-img" />
          </Link>
        </div>
        <div className="navbar-mobile-toggle" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
          <span className={`hamburger-line ${isMobileMenuOpen ? 'open' : ''}`}></span>
          <span className={`hamburger-line ${isMobileMenuOpen ? 'open' : ''}`}></span>
          <span className={`hamburger-line ${isMobileMenuOpen ? 'open' : ''}`}></span>
        </div>

        <ul className={`navbar-links ${isMobileMenuOpen ? 'active-mobile' : ''}`}>
          <li><Link to="/" className={isActive('/')} onClick={() => setIsMobileMenuOpen(false)}>Home</Link></li>
          <li><Link to="/conferences" className={isActive('/conferences')} onClick={() => setIsMobileMenuOpen(false)}>Conferences</Link></li>
          <li><Link to="/speakers" className={isActive('/speakers')} onClick={() => setIsMobileMenuOpen(false)}>Speakers</Link></li>
          <li><Link to="/gallery" className={isActive('/gallery')} onClick={() => setIsMobileMenuOpen(false)}>Gallery</Link></li>
          <li><Link to="/aboutus" className={isActive('/aboutus')} onClick={() => setIsMobileMenuOpen(false)}>About Us</Link></li>
          <li><Link to="/contactus" className={isActive('/contactus')} onClick={() => setIsMobileMenuOpen(false)}>Contact</Link></li>
        </ul>

        <div className="navbar-actions">
            <Link to="/conferences" className="btn-primary-nav" onClick={() => setIsMobileMenuOpen(false)}>Get Tickets</Link>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
