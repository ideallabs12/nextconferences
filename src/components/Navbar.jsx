import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Sun, Moon } from 'lucide-react';
import logoImage from '../assets/logo.png';
import './navbar.css';

function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isLightMode, setIsLightMode] = useState(() => {
    return localStorage.getItem('next_home_theme') === 'light';
  });
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };

    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Listen for theme changes across components
  useEffect(() => {
    const handleThemeChange = (e) => {
      const mode = e.detail || (localStorage.getItem('next_home_theme') === 'light' ? 'light' : 'dark');
      setIsLightMode(mode === 'light');
    };
    window.addEventListener('next-theme-change', handleThemeChange);
    window.addEventListener('storage', handleThemeChange);
    return () => {
      window.removeEventListener('next-theme-change', handleThemeChange);
      window.removeEventListener('storage', handleThemeChange);
    };
  }, []);

  const toggleTheme = () => {
    const next = !isLightMode;
    const themeVal = next ? 'light' : 'dark';
    setIsLightMode(next);
    localStorage.setItem('next_home_theme', themeVal);
    window.dispatchEvent(new CustomEvent('next-theme-change', { detail: themeVal }));
  };

  // Close mobile menu on route change
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location.pathname]);

  const isActive = (path) => {
    return location.pathname === path ? 'active' : '';
  };

  return (
    <nav className={`navbar dynamic-island ${scrolled ? 'scrolled' : ''} ${isMobileMenuOpen ? 'menu-expanded' : ''}`}>
      <div className="navbar-container">
        <div className="navbar-top-row">
          <div className="navbar-logo">
            <Link to="/" onClick={() => setIsMobileMenuOpen(false)}>
              <img src={logoImage} alt="NEXT Conferences" className="navbar-logo-img" />
            </Link>
          </div>

          <div 
            className="navbar-mobile-toggle" 
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label="Toggle navigation"
            role="button"
            tabIndex={0}
          >
            <span className={`hamburger-line ${isMobileMenuOpen ? 'open' : ''}`}></span>
            <span className={`hamburger-line ${isMobileMenuOpen ? 'open' : ''}`}></span>
            <span className={`hamburger-line ${isMobileMenuOpen ? 'open' : ''}`}></span>
          </div>
        </div>

        <ul className={`navbar-links ${isMobileMenuOpen ? 'active-mobile' : ''}`}>
          <li><Link to="/" className={isActive('/')} onClick={() => setIsMobileMenuOpen(false)}>Home</Link></li>
          <li><Link to="/second-home" className={isActive('/second-home')} onClick={() => setIsMobileMenuOpen(false)}>2H</Link></li>
          <li><Link to="/conferences" className={isActive('/conferences')} onClick={() => setIsMobileMenuOpen(false)}>Conferences</Link></li>
          <li><Link to="/speakers" className={isActive('/speakers')} onClick={() => setIsMobileMenuOpen(false)}>Speakers</Link></li>
          <li><Link to="/magazines" className={isActive('/magazines')} onClick={() => setIsMobileMenuOpen(false)}>Magazines</Link></li>
          <li><Link to="/gallery" className={isActive('/gallery')} onClick={() => setIsMobileMenuOpen(false)}>Gallery</Link></li>
          <li><Link to="/aboutus" className={isActive('/aboutus')} onClick={() => setIsMobileMenuOpen(false)}>About Us</Link></li>
          <li><Link to="/contactus" className={isActive('/contactus')} onClick={() => setIsMobileMenuOpen(false)}>Contact</Link></li>
        </ul>

        <div className={`navbar-actions ${isMobileMenuOpen ? 'active-mobile' : ''}`}>
          {location.pathname === '/' && (
            <button
              type="button"
              className="navbar-theme-btn"
              onClick={toggleTheme}
              aria-label={`Switch to ${isLightMode ? 'dark' : 'light'} theme`}
              title={`Switch home page to ${isLightMode ? 'dark' : 'light'} theme`}
            >
              {isLightMode ? <Moon size={15} /> : <Sun size={15} />}
              <span className="navbar-theme-label">{isLightMode ? 'Dark' : 'Light'}</span>
            </button>
          )}

          <Link to="/register" className="btn-primary-nav" onClick={() => setIsMobileMenuOpen(false)}>
            <span className="btn-dot"></span>
            <span>Get Tickets</span>
          </Link>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
