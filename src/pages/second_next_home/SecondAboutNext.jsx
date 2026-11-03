import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowUpRight } from 'lucide-react';
import './SecondAboutNext.css';

/* ─── Background-less 3D Apple Visuals for About NEXT ─── */

/**
 * 3D Orbital Glass Globe (for "Connections Without Boundaries")
 */
function VisualGlobalSphere() {
  return (
    <div className="san-visual san-visual--globe" aria-hidden="true">
      <svg
        viewBox="0 0 320 260"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="san-3d-svg"
      >
        <defs>
          <radialGradient id="san-globe-shadow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#03050a" stopOpacity="0.16" />
            <stop offset="65%" stopColor="#1f3bff" stopOpacity="0.06" />
            <stop offset="100%" stopColor="#03050a" stopOpacity="0" />
          </radialGradient>

          <radialGradient id="san-globe-core" cx="34%" cy="28%" r="68%">
            <stop offset="0%" stopColor="#e0f2fe" />
            <stop offset="28%" stopColor="#2ee6ff" />
            <stop offset="66%" stopColor="#1f3bff" />
            <stop offset="100%" stopColor="#060f3d" />
          </radialGradient>

          <radialGradient id="san-node-obsidian" cx="30%" cy="28%" r="70%">
            <stop offset="0%" stopColor="#64748b" />
            <stop offset="45%" stopColor="#0f172a" />
            <stop offset="100%" stopColor="#03050a" />
          </radialGradient>

          <linearGradient id="san-ring-grad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#1f3bff" stopOpacity="0.55" />
            <stop offset="50%" stopColor="#2ee6ff" stopOpacity="0.9" />
            <stop offset="100%" stopColor="#03050a" stopOpacity="0.2" />
          </linearGradient>
        </defs>

        {/* Contact Shadow */}
        <ellipse cx="165" cy="234" rx="108" ry="15" fill="url(#san-globe-shadow)" />

        {/* Outer Meridian Ring 1 */}
        <ellipse
          cx="165"
          cy="126"
          rx="126"
          ry="46"
          transform="rotate(-18 165 126)"
          stroke="url(#san-ring-grad)"
          strokeWidth="2.2"
          strokeDasharray="6 6"
        />

        {/* Main 3D Glass Sphere */}
        <g className="san-float-main">
          <circle cx="165" cy="124" r="72" fill="url(#san-globe-core)" />

          {/* Internal Latitude / Longitude Glass Wireframes */}
          <ellipse
            cx="165"
            cy="124"
            rx="72"
            ry="28"
            stroke="#ffffff"
            strokeOpacity="0.32"
            strokeWidth="1.4"
          />
          <ellipse
            cx="165"
            cy="124"
            rx="36"
            ry="72"
            transform="rotate(14 165 124)"
            stroke="#ffffff"
            strokeOpacity="0.32"
            strokeWidth="1.4"
          />

          {/* Studio Specular Highlight */}
          <ellipse
            cx="138"
            cy="90"
            rx="26"
            ry="13"
            transform="rotate(-28 138 90)"
            fill="#ffffff"
            fillOpacity="0.65"
          />
        </g>

        {/* Foreground Orbital Arc Passing in Front of Sphere */}
        <path
          d="M 52 146 A 122 44 16 0 0 278 112"
          stroke="url(#san-ring-grad)"
          strokeWidth="3.2"
          strokeLinecap="round"
        />

        {/* Floating Satellite Nodes */}
        <g className="san-float-sat1">
          <circle cx="66" cy="144" r="16" fill="url(#san-node-obsidian)" />
          <circle cx="61" cy="139" r="4" fill="#ffffff" fillOpacity="0.6" />
        </g>

        <g className="san-float-sat2">
          <circle cx="262" cy="96" r="19" fill="url(#san-globe-core)" />
          <circle cx="256" cy="90" r="5" fill="#ffffff" fillOpacity="0.8" />
        </g>

        <circle cx="212" cy="54" r="8" fill="#2ee6ff" />
      </svg>
    </div>
  );
}

/**
 * 3D Precision Ring Gauge (for "98% Satisfaction Rate")
 */
function VisualSatisfactionRing() {
  return (
    <div className="san-visual san-visual--gauge" aria-hidden="true">
      <svg viewBox="0 0 120 120" fill="none" className="san-gauge-svg">
        <defs>
          <linearGradient id="san-gauge-grad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#1f3bff" />
            <stop offset="55%" stopColor="#2f7bff" />
            <stop offset="100%" stopColor="#2ee6ff" />
          </linearGradient>
        </defs>
        {/* Track */}
        <circle
          cx="60"
          cy="60"
          r="44"
          className="san-gauge-track"
          strokeWidth="12"
        />
        {/* 98% Progress Arc */}
        <circle
          cx="60"
          cy="60"
          r="44"
          stroke="url(#san-gauge-grad)"
          strokeWidth="12"
          strokeLinecap="round"
          strokeDasharray="270 280"
          transform="rotate(-90 60 60)"
        />
        {/* Glowing Tip Node */}
        <circle cx="52" cy="17" r="4.5" fill="#ffffff" />
      </svg>
    </div>
  );
}

/**
 * 3D Extruded NEXT Emblem Cube (for "Next Premier League")
 */
function VisualNextEmblem() {
  return (
    <div className="san-visual san-visual--emblem" aria-hidden="true">
      <svg viewBox="0 0 110 110" fill="none" className="san-emblem-svg">
        <defs>
          <linearGradient id="san-cube-face" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#1f3bff" />
            <stop offset="100%" stopColor="#08124a" />
          </linearGradient>
          <linearGradient id="san-cube-rim" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#2ee6ff" />
            <stop offset="100%" stopColor="#1f3bff" />
          </linearGradient>
        </defs>
        {/* Back 3D Extrusion Layer */}
        <rect
          x="22"
          y="14"
          width="70"
          height="70"
          rx="20"
          transform="rotate(8 57 49)"
          fill="url(#san-cube-rim)"
          opacity="0.45"
        />
        {/* Front 3D Hardware Tile */}
        <rect
          x="16"
          y="20"
          width="72"
          height="72"
          rx="20"
          fill="url(#san-cube-face)"
          stroke="rgba(255,255,255,0.35)"
          strokeWidth="1.5"
        />
        {/* NEXT 'N.' Monogram */}
        <path
          d="M36 70V42h7.5l14.5 18.5V42H65v28h-7.2L43.2 51.5V70H36Z"
          fill="#ffffff"
        />
        <circle cx="71.5" cy="66.5" r="3.8" fill="#2ee6ff" />
      </svg>
    </div>
  );
}

export default function SecondAboutNext() {
  return (
    <section className="second-about-section" id="about-next">
      {/* Same soft colour mesh + fine architectural grid as Hero & Future Conferences */}
      <div className="second-about-bg" aria-hidden="true" />

      <div className="second-about-container">
        {/* Section Header */}
        <header className="second-about-header">
          <span className="second-about-eyebrow">OUR IMPACT</span>
          <h2 className="second-about-title">
            About <span className="sh-about-gradient">NEXT</span>
          </h2>
          <p className="second-about-subtitle">
            We&apos;ve connected thousands of visionaries and leaders to achieve
            their goals through immersive experiences and world-class
            networking.
          </p>
        </header>

        {/* Apple Bento Grid matching original AboutBento structure */}
        <div className="second-about-bento">
          {/* 1. Main Large Flagship Card (Spans 2 cols x 2 rows) */}
          <article className="san-card san-card--large">
            <div className="san-large-copy">
              <span className="san-pill-badge">Global Reach</span>
              <h3 className="san-heading-large">
                CONNECTIONS
                <br />
                WITHOUT
                <br />
                <span className="sh-about-gradient">BOUNDARIES.</span>
              </h3>
              <p className="san-large-desc">
                We host world-class speakers and unite visionary audiences
                across the globe to foster meaningful connections and drive
                impactful change.
              </p>
            </div>

            <VisualGlobalSphere />
          </article>

          {/* 2. Satisfaction Rate Card */}
          <article className="san-card san-card--stats">
            <div className="san-stats-top">
              <span className="san-stats-eyebrow">Satisfaction Rate</span>
              <VisualSatisfactionRing />
            </div>

            <div className="san-stats-bottom">
              <span className="san-stats-number">98%</span>
              <div className="san-progress-track">
                <div className="san-progress-fill" />
              </div>
            </div>
          </article>

          {/* 3. Next Premier League Card (Obsidian Apple Pro Card) */}
          <article className="san-card san-card--brand">
            <VisualNextEmblem />
            <div className="san-brand-copy">
              <h4 className="san-brand-title">Next Premier League</h4>
              <p className="san-brand-desc">Pioneering the Future</p>
            </div>
          </article>

          {/* 4. Join the Community CTA Card (Spans 2 cols) */}
          <Link to="/aboutus" className="san-card san-card--cta">
            <div className="san-cta-copy">
              <span className="san-cta-tag">GLOBAL COMMUNITY</span>
              <h4 className="san-cta-title">Join the community</h4>
              <p className="san-cta-desc">
                Connect with a global network of like-minded industry leaders.
              </p>
            </div>

            <div className="san-cta-action" aria-hidden="true">
              <ArrowUpRight size={24} strokeWidth={2.3} />
            </div>
          </Link>
        </div>
      </div>
    </section>
  );
}

