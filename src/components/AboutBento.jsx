import React from 'react';
import { Link } from 'react-router-dom';
import './AboutBento.css';

export default function AboutBento() {
  return (
    <section className="about-bento-section">
      <div className="about-bento-container">
        <div className="about-bento-header">
          <span className="bento-eyebrow">OUR IMPACT</span>
          <h2 className="bento-title">
            About <span className="text-gradient">NEXT</span>
          </h2>
          <p className="bento-subtitle">
            We've connected thousands of visionaries and leaders to achieve their
            goals through immersive experiences and world-class networking.
          </p>
        </div>

        <div className="bento-cards-grid">
          {/* Main Large Card */}
          <div className="bento-card card-large">
            <svg
              width="377"
              height="368"
              className="bento-spinning-star"
              viewBox="0 0 377 368"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path d="M179.692 5.79814C182.635 -1.93287 193.572 -1.93285 196.515 5.79816L229.505 92.466C231.206 96.9342 236.103 99.2928 240.657 97.8366L328.986 69.5929C336.865 67.0735 343.684 75.6242 339.474 82.7452L292.284 162.574C289.851 166.69 291.061 171.99 295.038 174.642L372.192 226.091C379.075 230.68 376.641 241.343 368.449 242.491L276.613 255.369C271.878 256.033 268.489 260.283 268.895 265.047L276.776 357.445C277.479 365.688 267.625 370.433 261.619 364.744L194.293 300.973C190.821 297.686 185.386 297.686 181.914 300.973L114.588 364.744C108.582 370.433 98.7281 365.688 99.4311 357.445L107.312 265.047C107.718 260.283 104.329 256.033 99.5941 255.369L7.7582 242.491C-0.433812 241.343 -2.86746 230.68 4.01488 226.091L81.1687 174.642C85.1465 171.99 86.3561 166.69 83.9231 162.574L36.7325 82.7452C32.523 75.6242 39.342 67.0735 47.2212 69.5929L135.55 97.8366C140.104 99.2928 145.001 96.9342 146.702 92.4659L179.692 5.79814Z" />
            </svg>
            <div className="bento-content-z">
              <div className="bento-badge badge-violet">Global Reach</div>
              <h3 className="bento-heading-large">
                CONNECTIONS<br />WITHOUT<br />BOUNDARIES.
              </h3>
            </div>
            <div className="bento-bottom-text bento-content-z">
              <p>
                We host world-class speakers and unite visionary audiences across the globe to foster meaningful connections and drive impactful change.
              </p>
            </div>
          </div>

          {/* Growth / Stats Card */}
          <div className="bento-card card-stats">
            <span className="stats-eyebrow">Satisfaction Rate</span>
            <div className="stats-data">
              <span className="stats-number">98%</span>
              <div className="progress-bar-bg">
                <div className="progress-bar-fill"></div>
              </div>
            </div>
          </div>

          {/* Small Feature Card */}
          <div className="bento-card card-small">
            <div className="bento-icon-box">
              <div className="bento-icon-dot"></div>
            </div>
            <h4 className="card-small-title">Next Premier League</h4>
            <p className="card-small-desc">Pioneering the Future</p>
          </div>

          {/* Call to Action Card */}
          <Link to="/aboutus" className="bento-card card-cta">
            <div className="cta-content bento-content-z">
              <h4 className="cta-title">Join the community</h4>
              <p className="cta-desc">Connect with a global network of like-minded industry leaders.</p>
            </div>
            <div className="cta-arrow bento-content-z">→</div>
          </Link>
        </div>
      </div>
    </section>
  );
}
