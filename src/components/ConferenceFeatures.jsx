import React, { useRef, useState } from 'react';
import {
  Users,
  Compass,
  Sparkles,
  Radar,
  MessageSquare,
  ArrowUpRight,
} from 'lucide-react';
import './ConferenceFeatures.css';

const PILLARS = [
  {
    number: '01',
    badge: 'Network',
    title: 'Meet People Who Move Ideas Forward',
    description:
      'Build genuine connections with professionals, decision-makers and experts who share your interests and ambitions. Sometimes, the most valuable part of a conference begins with a simple conversation.',
    icon: Users,
    glow: 'rgba(0, 210, 255, 0.15)',
    accent: '#00d2ff',
  },
  {
    number: '02',
    badge: 'Insights',
    title: 'Learn From Experience, Not Just Theory',
    description:
      'Hear directly from people who have worked through real challenges, discovered new possibilities and made an impact in their fields. Take home perspectives and ideas you can put into practice.',
    icon: Compass,
    glow: 'rgba(56, 189, 248, 0.15)',
    accent: '#38bdf8',
  },
  {
    number: '03',
    badge: 'Visibility',
    title: 'Put Your Work in the Spotlight',
    description:
      'Present your research, share your expertise and introduce your ideas to an audience that values innovation and fresh thinking. Give your work the visibility and recognition it deserves.',
    icon: Sparkles,
    glow: 'rgba(168, 85, 247, 0.15)',
    accent: '#c084fc',
  },
  {
    number: '04',
    badge: 'Vision',
    title: 'Discover What Comes Next',
    description:
      'Explore emerging trends, new approaches and developments shaping your industry. Leave with a broader perspective and a better understanding of the opportunities ahead.',
    icon: Radar,
    glow: 'rgba(45, 212, 191, 0.15)',
    accent: '#2dd4bf',
  },
  {
    number: '05',
    badge: 'Exchange',
    title: 'Be Part of Conversations That Matter',
    description:
      'Take part in discussions, expert panels and interactive sessions where different perspectives come together. Ask questions, challenge ideas and contribute your own experiences.',
    icon: MessageSquare,
    glow: 'rgba(96, 165, 250, 0.15)',
    accent: '#60a5fa',
  },
  {
    number: '06',
    badge: 'Impact',
    title: 'Turn Connections Into Opportunities',
    description:
      'A meaningful introduction today could become a future collaboration, partnership or career opportunity. Build relationships that have the potential to grow long after the conference concludes.',
    icon: ArrowUpRight,
    glow: 'rgba(0, 210, 255, 0.15)',
    accent: '#00d2ff',
  },
];

const ApplePillarCard = ({ pillar }) => {
  const cardRef = useRef(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);

  const handleMouseMove = (e) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    setMousePos({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
  };

  const Icon = pillar.icon;

  return (
    <div
      ref={cardRef}
      className="apple-pillar-card"
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        '--card-glow': pillar.glow,
        '--card-accent': pillar.accent,
      }}
    >
      {/* Dynamic Specular Spotlight Following Cursor */}
      {isHovered && (
        <div
          className="apple-card-spotlight"
          style={{
            left: `${mousePos.x}px`,
            top: `${mousePos.y}px`,
          }}
        />
      )}

      {/* Atmospheric Ambient Glow behind card */}
      <div className="apple-card-ambient" />

      {/* Top Meta Bar */}
      <div className="apple-card-top">
        <span className="apple-card-num">{pillar.number}</span>
        <div className="apple-card-icon-pill">
          <Icon className="apple-card-icon" size={17} strokeWidth={1.8} />
          <span className="apple-card-badge">{pillar.badge}</span>
        </div>
      </div>

      {/* Content */}
      <div className="apple-card-body">
        <h3 className="apple-card-title">{pillar.title}</h3>
        <p className="apple-card-desc">{pillar.description}</p>
      </div>

      {/* Subtle Bottom Light Reflection */}
      <div className="apple-card-edge-light" />
    </div>
  );
};

const ConferenceFeatures = () => {
  return (
    <section className="apple-why-section">
      <div className="apple-why-container">
        {/* Apple Keynote Style Hero Header */}
        <header className="apple-why-header">
          <span className="apple-why-eyebrow">Why Join Us</span>
          <h2 className="apple-why-title">
            More Than a Conference.
            <span className="apple-why-title-sub">A Room Full of Possibilities.</span>
          </h2>
          <p className="apple-why-lead">
            The right conversation can open a door. The right connection can
            change the direction of your career or business. Our conference
            brings together professionals, industry leaders, researchers,
            innovators and ambitious minds to share ideas, exchange
            experiences and create opportunities that go beyond the event
            itself.
          </p>
        </header>

        {/* Apple Bento Pro Grid */}
        <div className="apple-why-grid">
          {PILLARS.map((pillar) => (
            <ApplePillarCard key={pillar.number} pillar={pillar} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default ConferenceFeatures;
