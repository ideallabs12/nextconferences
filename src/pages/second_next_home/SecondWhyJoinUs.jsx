import React from 'react';
import './SecondWhyJoinUs.css';

/* ─── Bespoke Background-less 3D Apple-Style Object Visuals ─── */

/**
 * 1. Floating 3D Glass Spheres & Orbital Nodes ("Meet People Who Move Ideas Forward")
 */
function VisualNetworkOrbs() {
  return (
    <div className="sw-visual sw-visual--orbs" aria-hidden="true">
      <svg
        viewBox="0 0 340 240"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="sw-3d-svg"
      >
        <defs>
          {/* Soft floor contact shadow */}
          <radialGradient id="sw-floor-shadow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#03050a" stopOpacity="0.16" />
            <stop offset="65%" stopColor="#1f3bff" stopOpacity="0.06" />
            <stop offset="100%" stopColor="#03050a" stopOpacity="0" />
          </radialGradient>

          {/* Center Cobalt 3D Sphere */}
          <radialGradient id="sw-orb-cobalt" cx="32%" cy="26%" r="68%">
            <stop offset="0%" stopColor="#a5f3fc" />
            <stop offset="24%" stopColor="#2f7bff" />
            <stop offset="68%" stopColor="#1f3bff" />
            <stop offset="100%" stopColor="#08124a" />
          </radialGradient>

          {/* Left Obsidian Chrome 3D Sphere */}
          <radialGradient id="sw-orb-obsidian" cx="30%" cy="25%" r="70%">
            <stop offset="0%" stopColor="#64748b" />
            <stop offset="35%" stopColor="#1e293b" />
            <stop offset="78%" stopColor="#03050a" />
            <stop offset="100%" stopColor="#000000" />
          </radialGradient>

          {/* Right Cyan Glass 3D Sphere */}
          <radialGradient id="sw-orb-cyan" cx="30%" cy="24%" r="70%">
            <stop offset="0%" stopColor="#ffffff" />
            <stop offset="28%" stopColor="#2ee6ff" />
            <stop offset="72%" stopColor="#0096c7" />
            <stop offset="100%" stopColor="#1f3bff" />
          </radialGradient>

          {/* Pearl Mini Satellite Sphere */}
          <radialGradient id="sw-orb-pearl" cx="32%" cy="28%" r="68%">
            <stop offset="0%" stopColor="#ffffff" />
            <stop offset="55%" stopColor="#dbeafe" />
            <stop offset="100%" stopColor="#93c5fd" />
          </radialGradient>

          {/* Glass Orbital Ring Gradient */}
          <linearGradient id="sw-orbit-ring" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#1f3bff" stopOpacity="0.45" />
            <stop offset="50%" stopColor="#2ee6ff" stopOpacity="0.85" />
            <stop offset="100%" stopColor="#03050a" stopOpacity="0.15" />
          </linearGradient>
        </defs>

        {/* Ambient Floor Shadow (No background, floats directly on card) */}
        <ellipse cx="172" cy="212" rx="115" ry="16" fill="url(#sw-floor-shadow)" />

        {/* Back Orbital Ring */}
        <ellipse
          cx="170"
          cy="122"
          rx="124"
          ry="44"
          transform="rotate(-16 170 122)"
          stroke="url(#sw-orbit-ring)"
          strokeWidth="2.2"
          strokeDasharray="6 6"
        />

        {/* Solid Glass Connection Arc */}
        <ellipse
          cx="170"
          cy="122"
          rx="96"
          ry="32"
          transform="rotate(14 170 122)"
          stroke="url(#sw-orbit-ring)"
          strokeWidth="3"
        />

        {/* Left Obsidian Sphere */}
        <g className="sw-float-slow">
          <circle cx="82" cy="134" r="32" fill="url(#sw-orb-obsidian)" />
          <ellipse
            cx="71"
            cy="119"
            rx="10"
            ry="5.5"
            transform="rotate(-28 71 119)"
            fill="#ffffff"
            fillOpacity="0.45"
          />
        </g>

        {/* Center Hero Cobalt Sphere */}
        <g className="sw-float-main">
          <circle cx="172" cy="108" r="52" fill="url(#sw-orb-cobalt)" />
          {/* Specular studio softbox reflection */}
          <ellipse
            cx="152"
            cy="82"
            rx="18"
            ry="9.5"
            transform="rotate(-26 152 82)"
            fill="#ffffff"
            fillOpacity="0.65"
          />
          <circle cx="142" cy="96" r="3.5" fill="#ffffff" fillOpacity="0.45" />
        </g>

        {/* Right Cyan Glass Sphere */}
        <g className="sw-float-delayed">
          <circle cx="256" cy="94" r="36" fill="url(#sw-orb-cyan)" />
          <ellipse
            cx="244"
            cy="78"
            rx="12"
            ry="6"
            transform="rotate(-25 244 78)"
            fill="#ffffff"
            fillOpacity="0.75"
          />
        </g>

        {/* Foreground Pearl Node */}
        <g className="sw-float-fast">
          <circle cx="222" cy="162" r="18" fill="url(#sw-orb-pearl)" />
          <circle cx="216" cy="156" r="4.5" fill="#ffffff" fillOpacity="0.9" />
        </g>

        {/* Top Mini Satellite */}
        <circle cx="112" cy="60" r="10" fill="url(#sw-orb-cyan)" />
      </svg>
    </div>
  );
}

/**
 * 2. Floating 3D Glass Insight Prisms ("Learn From Experience, Not Just Theory")
 */
function VisualInsightPrisms() {
  return (
    <div className="sw-visual sw-visual--prisms" aria-hidden="true">
      <svg
        viewBox="0 0 280 220"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="sw-3d-svg"
      >
        <defs>
          <radialGradient id="sw-prism-shadow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#1f3bff" stopOpacity="0.18" />
            <stop offset="100%" stopColor="#03050a" stopOpacity="0" />
          </radialGradient>

          <linearGradient id="sw-slab-back" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#03050a" />
            <stop offset="100%" stopColor="#1e293b" />
          </linearGradient>

          <linearGradient id="sw-slab-mid" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#2ee6ff" />
            <stop offset="45%" stopColor="#2f7bff" />
            <stop offset="100%" stopColor="#1f3bff" />
          </linearGradient>

          <linearGradient id="sw-slab-front" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="0.92" />
            <stop offset="55%" stopColor="#e0f2fe" stopOpacity="0.82" />
            <stop offset="100%" stopColor="#bae6fd" stopOpacity="0.72" />
          </linearGradient>
        </defs>

        <ellipse cx="140" cy="196" rx="96" ry="14" fill="url(#sw-prism-shadow)" />

        {/* Back Obsidian 3D Tile */}
        <g className="sw-float-slow">
          <rect
            x="56"
            y="38"
            width="116"
            height="86"
            rx="20"
            transform="rotate(-12 114 81)"
            fill="url(#sw-slab-back)"
          />
          <circle cx="88" cy="64" r="8" fill="#2ee6ff" />
          <rect
            x="104"
            y="60"
            width="46"
            height="7"
            rx="3.5"
            transform="rotate(-12 127 63)"
            fill="#ffffff"
            fillOpacity="0.35"
          />
        </g>

        {/* Middle Radiant Blue 3D Prism */}
        <g className="sw-float-main">
          <rect
            x="84"
            y="58"
            width="124"
            height="92"
            rx="22"
            transform="rotate(-3 146 104)"
            fill="url(#sw-slab-mid)"
          />
          {/* Rising 3D Bar Graph inside middle slab */}
          <rect x="108" y="112" width="12" height="22" rx="6" fill="#ffffff" fillOpacity="0.5" />
          <rect x="128" y="98" width="12" height="36" rx="6" fill="#ffffff" fillOpacity="0.75" />
          <rect x="148" y="82" width="12" height="52" rx="6" fill="#ffffff" />
          <rect x="168" y="72" width="12" height="62" rx="6" fill="#2ee6ff" />
        </g>

        {/* Front Frosted Glass Lens Slab */}
        <g className="sw-float-delayed">
          <rect
            x="106"
            y="88"
            width="122"
            height="86"
            rx="22"
            transform="rotate(7 167 131)"
            fill="url(#sw-slab-front)"
            stroke="#ffffff"
            strokeWidth="2"
          />
          {/* Precision Wave Curve */}
          <path
            d="M124 138 C142 114, 158 148, 178 122 C192 104, 202 118, 212 106"
            stroke="#1f3bff"
            strokeWidth="4"
            strokeLinecap="round"
          />
          <circle cx="212" cy="106" r="6" fill="#2ee6ff" stroke="#1f3bff" strokeWidth="2.5" />
        </g>
      </svg>
    </div>
  );
}

/**
 * 3. Floating 3D Stage Spotlight & Crystal ("Put Your Work in the Spotlight")
 */
function VisualSpotlightCrystal() {
  return (
    <div className="sw-visual sw-visual--spotlight" aria-hidden="true">
      <svg
        viewBox="0 0 280 220"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="sw-3d-svg"
      >
        <defs>
          {/* Volumetric Spotlight Cone */}
          <linearGradient id="sw-beam-cone" x1="50%" y1="100%" x2="50%" y2="0%">
            <stop offset="0%" stopColor="#1f3bff" stopOpacity="0.38" />
            <stop offset="55%" stopColor="#2ee6ff" stopOpacity="0.18" />
            <stop offset="100%" stopColor="#2ee6ff" stopOpacity="0" />
          </linearGradient>

          {/* 3D Podium Disc */}
          <linearGradient id="sw-stage-disc" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#03050a" />
            <stop offset="50%" stopColor="#1f3bff" />
            <stop offset="100%" stopColor="#03050a" />
          </linearGradient>

          {/* Faceted Crystal Top */}
          <linearGradient id="sw-crystal-left" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#ffffff" />
            <stop offset="45%" stopColor="#2ee6ff" />
            <stop offset="100%" stopColor="#2f7bff" />
          </linearGradient>

          <linearGradient id="sw-crystal-right" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#2f7bff" />
            <stop offset="100%" stopColor="#0b1966" />
          </linearGradient>
        </defs>

        {/* Volumetric Light Beam */}
        <polygon points="94,174 186,174 226,26 54,26" fill="url(#sw-beam-cone)" />

        {/* 3D Stage Base Disc */}
        <ellipse cx="140" cy="182" rx="76" ry="18" fill="#03050a" fillOpacity="0.12" />
        <ellipse cx="140" cy="174" rx="64" ry="15" fill="url(#sw-stage-disc)" />
        <ellipse
          cx="140"
          cy="171"
          rx="48"
          ry="10"
          fill="#2ee6ff"
          fillOpacity="0.35"
          stroke="#ffffff"
          strokeWidth="1.5"
        />

        {/* Floating 3D Faceted Diamond / Prism in the Spotlight */}
        <g className="sw-float-main">
          {/* Upper Left Facet */}
          <polygon points="140,38 92,98 140,114" fill="url(#sw-crystal-left)" />
          {/* Upper Right Facet */}
          <polygon points="140,38 188,98 140,114" fill="url(#sw-crystal-right)" />
          {/* Lower Left Facet */}
          <polygon points="92,98 140,152 140,114" fill="#2f7bff" />
          {/* Lower Right Facet */}
          <polygon points="188,98 140,152 140,114" fill="#08124a" />
          {/* Specular Ridge Line */}
          <polyline
            points="140,38 140,152"
            stroke="#ffffff"
            strokeWidth="2"
            strokeOpacity="0.85"
          />
          <polyline
            points="92,98 140,114 188,98"
            stroke="#ffffff"
            strokeWidth="1.5"
            strokeOpacity="0.7"
          />
        </g>

        {/* Floating Sparkle Accents */}
        <g className="sw-float-fast">
          <circle cx="76" cy="66" r="5" fill="#2ee6ff" />
          <circle cx="204" cy="58" r="6.5" fill="#1f3bff" />
          <circle cx="196" cy="128" r="4" fill="#2ee6ff" />
        </g>
      </svg>
    </div>
  );
}

/**
 * 4. Interlocking 3D Glass Torus Rings ("Turn Connections Into Opportunities")
 */
function VisualOpportunityRings() {
  return (
    <div className="sw-visual sw-visual--rings" aria-hidden="true">
      <svg
        viewBox="0 0 340 240"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="sw-3d-svg"
      >
        <defs>
          <radialGradient id="sw-rings-shadow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#03050a" stopOpacity="0.16" />
            <stop offset="100%" stopColor="#03050a" stopOpacity="0" />
          </radialGradient>

          <linearGradient id="sw-torus-blue" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#2ee6ff" />
            <stop offset="45%" stopColor="#1f3bff" />
            <stop offset="100%" stopColor="#060d3a" />
          </linearGradient>

          <linearGradient id="sw-torus-obsidian" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#475569" />
            <stop offset="50%" stopColor="#0f172a" />
            <stop offset="100%" stopColor="#03050a" />
          </linearGradient>

          <linearGradient id="sw-torus-highlight" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="0.8" />
            <stop offset="100%" stopColor="#2ee6ff" stopOpacity="0" />
          </linearGradient>
        </defs>

        <ellipse cx="170" cy="212" rx="112" ry="15" fill="url(#sw-rings-shadow)" />

        {/* Left 3D Torus Ring (Electric Blue -> Cyan) */}
        <g className="sw-float-main">
          <ellipse
            cx="134"
            cy="116"
            rx="68"
            ry="48"
            transform="rotate(-24 134 116)"
            stroke="url(#sw-torus-blue)"
            strokeWidth="22"
          />
          <ellipse
            cx="134"
            cy="116"
            rx="68"
            ry="48"
            transform="rotate(-24 134 116)"
            stroke="url(#sw-torus-highlight)"
            strokeWidth="4"
          />
        </g>

        {/* Right Interlocking 3D Torus Ring (Obsidian Chrome) */}
        <g className="sw-float-delayed">
          <ellipse
            cx="208"
            cy="118"
            rx="68"
            ry="48"
            transform="rotate(24 208 118)"
            stroke="url(#sw-torus-obsidian)"
            strokeWidth="22"
          />
          <ellipse
            cx="208"
            cy="118"
            rx="68"
            ry="48"
            transform="rotate(24 208 118)"
            stroke="#ffffff"
            strokeOpacity="0.35"
            strokeWidth="3"
          />
        </g>

        {/* Interlock Overpass Clip so rings physically weave */}
        <g className="sw-float-main">
          <path
            d="M 156 76 A 68 48 -24 0 1 196 114"
            stroke="url(#sw-torus-blue)"
            strokeWidth="22"
            strokeLinecap="round"
          />
        </g>

        {/* Floating Radiant Core Spark */}
        <g className="sw-float-fast">
          <circle cx="171" cy="116" r="12" fill="#2ee6ff" />
          <circle cx="168" cy="113" r="4" fill="#ffffff" />
        </g>
      </svg>
    </div>
  );
}

const FEATURES = [
  {
    id: 'network',
    eyebrow: 'Global Network',
    title: 'Meet People Who Move Ideas Forward',
    description:
      'Build genuine connections with professionals, decision-makers, and experts who share your ambitions.',
    span: 'wide',
    Visual: VisualNetworkOrbs,
  },
  {
    id: 'insights',
    eyebrow: 'Real Insights',
    title: 'Learn From Experience, Not Just Theory',
    description:
      'Hear directly from leaders solving real challenges and take home ideas you can apply immediately.',
    span: 'compact',
    Visual: VisualInsightPrisms,
  },
  {
    id: 'spotlight',
    eyebrow: 'Visibility',
    title: 'Put Your Work in the Spotlight',
    description:
      'Present your research and introduce your ideas to an audience that values fresh thinking.',
    span: 'compact',
    Visual: VisualSpotlightCrystal,
  },
  {
    id: 'opportunities',
    eyebrow: 'Lasting Impact',
    title: 'Turn Connections Into Opportunities',
    description:
      'A meaningful introduction today can become a future collaboration, partnership, or career milestone.',
    span: 'wide',
    Visual: VisualOpportunityRings,
  },
];

export default function SecondWhyJoinUs() {
  return (
    <section className="second-why-section" id="why-join-us">
      {/* Same soft colour mesh + fine architectural grid as Hero & Future Conferences */}
      <div className="second-why-bg" aria-hidden="true" />

      <div className="second-why-container">
        {/* Section Header matching Hero & Our Future Conferences */}
        <header className="second-why-header">
          <span className="second-why-eyebrow">WHY JOIN US</span>
          <h2 className="second-why-title">
            More Than A Conference.{' '}
            <span className="sh-why-gradient">A Room Of Possibilities.</span>
          </h2>
          <p className="second-why-subtitle">
            The right conversation can open a door. The right connection can
            transform the direction of your research, career, or organization.
          </p>
        </header>

        {/* 4-Card Apple Product Bento Grid with Background-less 3D Visuals */}
        <div className="second-why-bento">
          {FEATURES.map((item) => {
            const VisualComponent = item.Visual;
            return (
              <article
                key={item.id}
                className={`second-why-card is-${item.span}`}
              >
                <div className="second-why-copy">
                  <span className="second-why-card-eyebrow">{item.eyebrow}</span>
                  <h3 className="second-why-card-title">{item.title}</h3>
                  <p className="second-why-card-desc">{item.description}</p>
                </div>

                <div className="second-why-art">
                  <VisualComponent />
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
