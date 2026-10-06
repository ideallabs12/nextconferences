import React, { useRef } from 'react';
import './ConferenceFeatures.css';

const ConferenceFeatures = () => {
  const containerRef = useRef(null);

  const handleMouseMove = (e) => {
    if (!containerRef.current) return;
    const cards = containerRef.current.getElementsByClassName('feature-card');
    for (const card of cards) {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      card.style.setProperty('--mouse-x', `${x}px`);
      card.style.setProperty('--mouse-y', `${y}px`);
    }
  };
  const features = [
    {
      id: 1,
      title: "Stronger Networking Opportunities",
      description: "Face-to-face interactions build lasting professional relationships.",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
          <circle cx="9" cy="7" r="4"></circle>
          <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
          <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
        </svg>
      )
    },
    {
      id: 2,
      title: "Enhanced Engagement & Focus",
      description: "In-person settings reduce distractions and increase active participation.",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10"></circle>
          <circle cx="12" cy="12" r="6"></circle>
          <circle cx="12" cy="12" r="2"></circle>
        </svg>
      )
    },
    {
      id: 3,
      title: "High-Impact Brand Presence",
      description: "Live demos and booths create memorable brand impressions.",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
        </svg>
      )
    },
    {
      id: 4,
      title: "Immersive Experience",
      description: "The atmosphere encourages spontaneous, meaningful interactions.",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline>
        </svg>
      )
    }
  ];

  return (
    <section className="features-section">
      <div className="features-container">
        
        <div className="features-header">
          <span className="section-eyebrow">Why Join</span>
          <h2 className="features-title">
            NEXT Premier League Conferences
          </h2>
          <p className="features-description">
            Physical conferences offer unmatched value through face-to-face networking, 
            focused engagement, and immersive experiences that drive meaningful connections 
            and business growth.
          </p>
        </div>

        <div className="features-grid bento-grid" ref={containerRef} onMouseMove={handleMouseMove}>
          {features.map((feature, index) => (
            <div key={feature.id} className={`feature-card bento-card-${index}`}>
              <div className="feature-icon-wrapper">
                {feature.icon}
              </div>
              <h3 className="feature-card-title">{feature.title}</h3>
              <p className="feature-card-desc">{feature.description}</p>
              
              {/* Interactive Spotlight background glow */}
              <div className="feature-card-border"></div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
};

export default ConferenceFeatures;
