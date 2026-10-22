import React, { useEffect, useRef, useState } from 'react';
import { 
  Users, 
  Target, 
  Star, 
  Activity, 
  BookOpen, 
  TrendingUp 
} from 'lucide-react';
import './ConferenceFeatures.css';

const FEATURES_DATA = [
  {
    id: 1,
    title: "Stronger Networking Opportunities",
    description: "Face-to-face interactions build lasting professional relationships.",
    icon: Users,
    image: "https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&w=800&q=80",
    imageAlt: "Professionals networking and exchanging ideas at a business conference",
    imagePosition: "center 30%"
  },
  {
    id: 2,
    title: "Enhanced Engagement & Focus",
    description: "In-person settings reduce distractions and increase active participation.",
    icon: Target,
    image: "https://images.unsplash.com/photo-1475721027785-f74eccf877e2?auto=format&fit=crop&w=800&q=80",
    imageAlt: "Keynote speaker presenting dynamically to an engaged conference audience",
    imagePosition: "center 20%"
  },
  {
    id: 3,
    title: "High-Impact Brand Presence",
    description: "Live demos and booths create memorable brand impressions.",
    icon: Star,
    image: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=800&q=80",
    imageAlt: "Modern exhibition booth and interactive showcase at an international summit",
    imagePosition: "center center"
  },
  {
    id: 4,
    title: "Immersive Experience",
    description: "The atmosphere encourages spontaneous, meaningful interactions.",
    icon: Activity,
    image: "https://images.unsplash.com/photo-1505373877841-8d25f7d46678?auto=format&fit=crop&w=800&q=80",
    imageAlt: "Large conference auditorium with cinematic lighting and engaged audience",
    imagePosition: "center 40%"
  },
  {
    id: 5,
    title: "Exclusive Industry Insights",
    description: "Access private keynotes and expert panels not available online.",
    icon: BookOpen,
    image: "https://images.unsplash.com/photo-1515187029135-18ee286d815b?auto=format&fit=crop&w=800&q=80",
    imageAlt: "Distinguished industry experts participating in a live conference panel discussion",
    imagePosition: "center 25%"
  },
  {
    id: 6,
    title: "Accelerated Career Growth",
    description: "Connect with industry leaders and discover new opportunities.",
    icon: TrendingUp,
    image: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=800&q=80",
    imageAlt: "Global summit attendees collaborating and discovering career-defining opportunities",
    imagePosition: "center 30%"
  }
];

const ConferenceFeatures = () => {
  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          if (sectionRef.current) {
            observer.unobserve(sectionRef.current);
          }
        }
      },
      { threshold: 0.12 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => {
      if (sectionRef.current) {
        observer.unobserve(sectionRef.current);
      }
    };
  }, []);

  return (
    <section className="features-section" ref={sectionRef}>
      {/* ─── Central Global Network Motif (Background Supporting Element) ─── */}
      <div className="network-globe-backdrop" aria-hidden="true">
        <svg 
          viewBox="0 0 1000 600" 
          fill="none" 
          xmlns="http://www.w3.org/2000/svg" 
          className="network-globe-svg"
        >
          <circle cx="500" cy="300" r="260" stroke="url(#globeGrad1)" strokeWidth="1" strokeDasharray="4 6" opacity="0.35" />
          <circle cx="500" cy="300" r="180" stroke="url(#globeGrad2)" strokeWidth="1" opacity="0.25" />
          <ellipse cx="500" cy="300" rx="360" ry="130" stroke="url(#globeGrad1)" strokeWidth="1" strokeDasharray="3 7" opacity="0.38" />
          <ellipse cx="500" cy="300" rx="130" ry="260" stroke="url(#globeGrad2)" strokeWidth="1" opacity="0.2" />
          <ellipse cx="500" cy="300" rx="400" ry="170" stroke="#00d2ff" strokeWidth="0.75" strokeDasharray="2 10" opacity="0.22" transform="rotate(-15 500 300)" />
          
          {/* Subtle Connection Nodes */}
          <circle cx="320" cy="240" r="3" fill="#00d2ff" className="node-pulse" />
          <circle cx="680" cy="360" r="3" fill="#38bdf8" className="node-pulse" />
          <circle cx="500" cy="120" r="3.5" fill="#00d2ff" className="node-pulse" />
          <circle cx="500" cy="480" r="3" fill="#3a7bd5" className="node-pulse" />
          <circle cx="230" cy="310" r="2.5" fill="#38bdf8" className="node-pulse" />
          <circle cx="770" cy="290" r="3.5" fill="#00d2ff" className="node-pulse" />

          {/* Interconnecting Lines */}
          <line x1="320" y1="240" x2="500" y2="120" stroke="url(#lineGrad)" strokeWidth="0.8" opacity="0.35" />
          <line x1="500" y1="120" x2="770" y2="290" stroke="url(#lineGrad)" strokeWidth="0.8" opacity="0.35" />
          <line x1="680" y1="360" x2="500" y2="480" stroke="url(#lineGrad)" strokeWidth="0.8" opacity="0.35" />
          <line x1="230" y1="310" x2="320" y2="240" stroke="url(#lineGrad)" strokeWidth="0.8" opacity="0.35" />

          <defs>
            <linearGradient id="globeGrad1" x1="160" y1="180" x2="840" y2="420" gradientUnits="userSpaceOnUse">
              <stop stopColor="#00d2ff" stopOpacity="0.8" />
              <stop offset="1" stopColor="#3a7bd5" stopOpacity="0.1" />
            </linearGradient>
            <linearGradient id="globeGrad2" x1="320" y1="120" x2="680" y2="480" gradientUnits="userSpaceOnUse">
              <stop stopColor="#38bdf8" stopOpacity="0.6" />
              <stop offset="1" stopColor="#1e3a8a" stopOpacity="0.1" />
            </linearGradient>
            <linearGradient id="lineGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop stopColor="#00d2ff" stopOpacity="0.7" />
              <stop offset="100%" stopColor="#3a7bd5" stopOpacity="0.1" />
            </linearGradient>
          </defs>
        </svg>
      </div>

      <div className="features-container">
        
        {/* ─── Header: Eyebrow + Gradient Title + Description ─── */}
        <div className="features-header">
          <div className="features-eyebrow-wrapper">
            <span className="eyebrow-line" />
            <span className="section-eyebrow">WHY JOIN US</span>
            <span className="eyebrow-line" />
          </div>

          <h2 className="features-title">
            <span className="title-gradient">NEXT</span> Premier League Conferences
          </h2>

          <p className="features-description">
            Physical conferences offer unmatched value through face-to-face networking, 
            focused engagement, and immersive experiences that drive meaningful connections 
            and business growth.
          </p>
        </div>

        {/* ─── 3x2 Cinematic Panels Grid ─── */}
        <div className="features-grid">
          {FEATURES_DATA.map((feature, index) => {
            const IconComponent = feature.icon;
            return (
              <article 
                key={feature.id} 
                className={`feature-card ${isVisible ? 'animate-in' : ''}`}
                style={{ animationDelay: `${index * 80}ms` }}
              >
                {/* Photographic Background & Directional Dark Overlay */}
                <div className="card-media-wrapper">
                  <img 
                    src={feature.image} 
                    alt={feature.imageAlt}
                    className="card-bg-image"
                    loading="lazy"
                    style={{ objectPosition: feature.imagePosition }}
                    onError={(e) => {
                      e.target.style.opacity = '0';
                    }}
                  />
                  <div className="card-gradient-overlay" />
                  <div className="card-glow-border" />
                </div>

                {/* Card Content Layer */}
                <div className="card-inner-content">
                  <div className="feature-icon-wrapper">
                    <IconComponent size={22} strokeWidth={2.2} />
                  </div>

                  <div className="card-text-block">
                    <h3 className="feature-card-title">{feature.title}</h3>
                    <div className="feature-accent-line" />
                    <p className="feature-card-desc">{feature.description}</p>
                  </div>
                </div>
              </article>
            );
          })}
        </div>

      </div>
    </section>
  );
};

export default ConferenceFeatures;
