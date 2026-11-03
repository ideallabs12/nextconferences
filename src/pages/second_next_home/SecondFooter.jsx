import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import './SecondFooter.css';

export default function SecondFooter() {
  const typographyRef = useRef(null);
  const [isGlowing, setIsGlowing] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsGlowing(true);
          const timer = setTimeout(() => {
            setIsGlowing(false);
          }, 2400);
          return () => clearTimeout(timer);
        }
      },
      { threshold: 0.35 }
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
    <footer className="second-footer" id="second-footer">
      {/* Background ambient lighting */}
      <div className="second-footer-bg" aria-hidden="true" />

      <div className="second-footer-container">
        {/* Top Section: CTA, Brand & Links */}
        <div className="sf-top">
          <div className="sf-brand-col">
            <Link to="/second-home" className="sf-brand-link" aria-label="NEXT Conferences Home">
              <div className="sf-brand-badge">
                <svg viewBox="0 0 40 40" aria-hidden="true">
                  <defs>
                    <linearGradient id="sf-brand-lg" x1="0" y1="1" x2="1" y2="0">
                      <stop offset="0%" stopColor="#1F3BFF" />
                      <stop offset="100%" stopColor="#2EE6FF" />
                    </linearGradient>
                  </defs>
                  <rect width="40" height="40" rx="10" fill="currentColor" className="sf-badge-bg" />
                  <path d="M12 29V11h3.4l9.2 11.6V11H28v18h-3.4L15.4 17.4V29z" fill="#fff" />
                  <circle cx="29.5" cy="30" r="2.4" fill="url(#sf-brand-lg)" />
                </svg>
              </div>
              <span className="sf-brand-title">NEXT</span>
            </Link>

            <h3 className="sf-cta-heading">
              Ready for what's <span className="sf-gradient-text">NEXT?</span>
            </h3>

            <p className="sf-brand-desc">
              Join the world's most visionary thinkers and leaders at our upcoming premier league conferences.
            </p>

            <div className="sf-socials">
              <a
                href="https://www.instagram.com/next.conferences/"
                target="_blank"
                rel="noopener noreferrer"
                className="sf-social-pill"
                aria-label="Instagram"
              >
                IG
              </a>
              <a
                href="https://www.facebook.com/profile.php?id=61586080764495"
                target="_blank"
                rel="noopener noreferrer"
                className="sf-social-pill"
                aria-label="Facebook"
              >
                FB
              </a>
              <a
                href="https://x.com/NextConferences"
                target="_blank"
                rel="noopener noreferrer"
                className="sf-social-pill"
                aria-label="X (Twitter)"
              >
                X
              </a>
              <a
                href="https://www.linkedin.com/company/next-premier-conferences/"
                target="_blank"
                rel="noopener noreferrer"
                className="sf-social-pill"
                aria-label="LinkedIn"
              >
                IN
              </a>
              <a
                href="https://www.youtube.com/@NEXTConferences"
                target="_blank"
                rel="noopener noreferrer"
                className="sf-social-pill"
                aria-label="YouTube"
              >
                YT
              </a>
            </div>
          </div>

          <div className="sf-links-grid">
            <div className="sf-links-col">
              <h4 className="sf-col-heading">Navigation</h4>
              <ul>
                <li><Link to="/">Home</Link></li>
                <li><Link to="/second-home">2H</Link></li>
                <li><Link to="/conferences">Conferences</Link></li>
                <li><Link to="/speakers">Speakers</Link></li>
                <li><Link to="/magazines">Magazines</Link></li>
                <li><Link to="/gallery">Gallery</Link></li>
              </ul>
            </div>

            <div className="sf-links-col">
              <h4 className="sf-col-heading">Company</h4>
              <ul>
                <li><Link to="/aboutus">About Us</Link></li>
                <li><Link to="/contactus">Contact</Link></li>
                <li><Link to="/committee">Committee</Link></li>
              </ul>
            </div>

            <div className="sf-links-col">
              <h4 className="sf-col-heading">Legal</h4>
              <ul>
                <li><Link to="/faqs">FAQs</Link></li>
                <li><Link to="/privacypolicy">Privacy Policy</Link></li>
                <li><Link to="/termsandconditions">Terms & Conditions</Link></li>
              </ul>
            </div>
          </div>
        </div>

        {/* Bottom Section: Apple Massive Glowing Typography */}
        <div className="sf-massive-typography" ref={typographyRef}>
          <div className="sf-massive-word" aria-label="NEXT">
            <span className={`sf-letter ${isGlowing ? 'sf-active-glow' : ''}`}>N</span>
            <span className={`sf-letter ${isGlowing ? 'sf-active-glow' : ''}`}>E</span>
            <span className={`sf-letter ${isGlowing ? 'sf-active-glow' : ''}`}>X</span>
            <span className={`sf-letter ${isGlowing ? 'sf-active-glow' : ''}`}>T</span>
          </div>
          <div className={`sf-massive-subtext ${isGlowing ? 'sf-active-sub-glow' : ''}`}>
            <span>PREMIER</span>
            <span>LEAGUE</span>
            <span>CONFERENCES</span>
          </div>
        </div>

        {/* Footer Meta / Copyright */}
        <div className="sf-bottom-meta">
          <p className="sf-copyright">
            &copy; {new Date().getFullYear()} NEXT Conferences. All rights reserved.
          </p>
          <p className="sf-credits">
            Designed for the Future
          </p>
        </div>
      </div>
    </footer>
  );
}

