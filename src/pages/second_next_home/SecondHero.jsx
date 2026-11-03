import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Sun, Moon } from 'lucide-react';
import HeroConferenceStack from './HeroConferenceStack.jsx';
import { LiquidButton } from '../../components/ui/LiquidGlassButton.jsx';
import './SecondHero.css';

const SecondHero = ({ isDarkMode = false, toggleTheme }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useLocation ? useNavigate() : null;
  const l1Ref = useRef(null);
  const l3Ref = useRef(null);

  // Pixel-perfect alignment: ensure NEXT and CONFERENCES start and end at the exact same coordinates on desktop
  useEffect(() => {
    const alignWidths = () => {
      // On mobile view (<= 960px), let CSS dictate responsive typography without JS interference
      if (window.innerWidth <= 960) {
        if (l3Ref.current) {
          l3Ref.current.style.letterSpacing = '';
          l3Ref.current.style.marginRight = '';
        }
        return;
      }
      if (!l1Ref.current || !l3Ref.current) return;
      l3Ref.current.style.letterSpacing = '';
      l3Ref.current.style.marginRight = '';
      const w1 = l1Ref.current.getBoundingClientRect().width;
      const w3 = l3Ref.current.getBoundingClientRect().width;
      if (w1 > 0 && w3 > 0) {
        // CONFERENCES has 11 letters = 10 character intervals
        const diff = w1 - w3;
        const extraSpacingPx = diff / 10;
        l3Ref.current.style.letterSpacing = `${extraSpacingPx}px`;
        l3Ref.current.style.marginRight = `${-extraSpacingPx}px`;
      }
    };

    alignWidths();
    window.addEventListener('resize', alignWidths);
    if (document.fonts) {
      document.fonts.ready.then(alignWidths);
    }
    const t1 = setTimeout(alignWidths, 60);
    const t2 = setTimeout(alignWidths, 300);
    return () => {
      window.removeEventListener('resize', alignWidths);
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, []);

  // Close mobile menu on Escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') setMobileMenuOpen(false);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Prevent background scroll when mobile menu is open
  useEffect(() => {
    document.body.style.overflow = mobileMenuOpen ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [mobileMenuOpen]);

  return (
    <header className="second-hero" id="second-hero">
      {/* Background soft colour mesh + fine grid */}
      <div className="second-hero-bg" aria-hidden="true" />

      {/* Second Home's Dedicated Nav */}
      <nav className="sh-nav" aria-label="Main">
        <Link to="/second-home" className="sh-brand" aria-label="NEXT Premier League Conferences, home">
          <svg viewBox="0 0 40 40" aria-hidden="true">
            <defs>
              <linearGradient id="sh-brand-lg" x1="0" y1="1" x2="1" y2="0">
                <stop offset="0" stopColor="#1F3BFF" />
                <stop offset="100%" stopColor="#2EE6FF" />
              </linearGradient>
            </defs>
            <rect width="40" height="40" rx="11" fill="#03050A" />
            <path d="M12 29V11h3.4l9.2 11.6V11H28v18h-3.4L15.4 17.4V29z" fill="#fff" />
            <circle cx="29.5" cy="30" r="2.4" fill="url(#sh-brand-lg)" />
          </svg>
          <span>NEXT</span>
        </Link>

        <ul className={`sh-links ${mobileMenuOpen ? 'open' : ''}`} id="sh-links">
          <li>
            <Link
              to="/"
              className={location.pathname === '/' ? 'sh-link-active' : ''}
              onClick={() => setMobileMenuOpen(false)}
            >
              Home
            </Link>
          </li>
          <li>
            <Link
              to="/second-home"
              className={location.pathname === '/second-home' ? 'sh-link-active' : ''}
              onClick={() => setMobileMenuOpen(false)}
            >
              2H
            </Link>
          </li>
          <li>
            <Link to="/conferences" onClick={() => setMobileMenuOpen(false)}>
              Conferences
            </Link>
          </li>
          <li>
            <Link to="/speakers" onClick={() => setMobileMenuOpen(false)}>
              Speakers
            </Link>
          </li>
          <li>
            <Link to="/magazines" onClick={() => setMobileMenuOpen(false)}>
              Magazines
            </Link>
          </li>
          <li>
            <Link to="/gallery" onClick={() => setMobileMenuOpen(false)}>
              Gallery
            </Link>
          </li>
          <li>
            <Link to="/aboutus" onClick={() => setMobileMenuOpen(false)}>
              About Us
            </Link>
          </li>
          <li>
            <Link to="/contactus" onClick={() => setMobileMenuOpen(false)}>
              Contact
            </Link>
          </li>
        </ul>

        <div className="sh-nav-right">
          {toggleTheme && (
            <button
              type="button"
              className="sh-nav-theme-btn"
              onClick={(e) => toggleTheme(e)}
              aria-label={`Switch to ${isDarkMode ? 'light' : 'dark'} mode`}
              title={`Switch to ${isDarkMode ? 'light' : 'dark'} mode`}
            >
              <span className="sh-nav-theme-icon">
                {isDarkMode ? <Sun size={14} strokeWidth={2.4} /> : <Moon size={14} strokeWidth={2.4} />}
              </span>
              <span className="sh-nav-theme-label">{isDarkMode ? 'Light' : 'Dark'}</span>
            </button>
          )}

          <button
            type="button"
            className="sh-menu-btn"
            aria-expanded={mobileMenuOpen}
            aria-controls="sh-links"
            aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
            onClick={() => setMobileMenuOpen((prev) => !prev)}
          >
            <span className="sh-burger-line"></span>
            <span className="sh-burger-line"></span>
            <span className="sh-burger-line"></span>
          </button>
        </div>
      </nav>

      {/* Hero Content */}
      <div className="second-hero-main">
        <div className="second-hero-copy">
          <h1 className="second-hero-title">
            <span className="sh-m sh-l1">
              <span className="sh-text-glyph" ref={l1Ref}>NEXT</span>
            </span>
            <span className="sh-m sh-l2">
              <span className="sh-text-glyph">PREMIER LEAGUE</span>
            </span>
            <span className="sh-m sh-l3">
              <span className="sh-text-glyph" ref={l3Ref}>CONFERENCES</span>
            </span>
          </h1>

          <div className="second-hero-foot">
            <p className="second-hero-desc">
              World–class premier conferences convening visionary leaders, innovators, and global changemakers to shape the future of impact.
            </p>
            <div className="second-hero-ctas">
              <Link to="/conferences" className="sh-btn">
                Explore Conferences ➔
              </Link>
              <LiquidButton
                onClick={() => navigate('/contactus')}
                className="sh-btn-speaker"
              >
                Become a Speaker
              </LiquidButton>
            </div>
          </div>
        </div>

        {/* Right Showcase: Interactive 3D Glass Conference Stack */}
        <div className="second-hero-showcase">
          <HeroConferenceStack />
        </div>
      </div>
    </header>
  );
};

export default SecondHero;
