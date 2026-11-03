import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowUpRight } from 'lucide-react';
import localSpeakersData from '../speakers/speakers.json';
import {
  fetchSpeakersFromSupabase,
  getSpeakerImageUrl,
  getSpeakerSlug,
} from '../../lib/supabase.js';
import { LiquidButton } from '../../components/ui/LiquidGlassButton.jsx';
import './SecondSpeakers.css';

export default function SecondSpeakers() {
  const [speakersData, setSpeakersData] = useState(localSpeakersData);

  useEffect(() => {
    fetchSpeakersFromSupabase()
      .then((data) => {
        if (data && data.length > 0) setSpeakersData(data);
      })
      .catch(() => {});
  }, []);

  const marqueeSpeakers = [...speakersData, ...speakersData];

  return (
    <section className="second-speakers-section" id="previous-speakers">
      <div className="second-speakers-bg" aria-hidden="true" />

      <div className="second-speakers-header">
        <span className="second-speakers-eyebrow">OUR VISIONARIES</span>
        <h2 className="second-speakers-title">
          Previous <span className="sh-speakers-gradient">Speakers</span>
        </h2>
        <p className="second-speakers-subtitle">
          Learn from industry leaders, innovators, and subject matter experts
          who have graced our stages in the past.
        </p>
      </div>

      <div className="second-speakers-marquee">
        <div className="second-speakers-track">
          {marqueeSpeakers.map((speaker, index) => (
            <Link
              key={`${speaker.id}-${index}`}
              to={`/speakers/${getSpeakerSlug(speaker)}`}
              className="sspk-card"
            >
              <div className="sspk-frame">
                <img
                  src={getSpeakerImageUrl(speaker)}
                  alt={speaker.name}
                  className="sspk-img"
                  loading="lazy"
                  onError={(e) => {
                    e.target.onerror = null;
                    const filename = (speaker.image || '').split('/').pop();
                    if (filename) e.target.src = `/speakers_imgs/${filename}`;
                  }}
                />

                {/* Apple Frosted Glass Floating Name Capsule */}
                <div className="sspk-glass-bar">
                  <div className="sspk-meta">
                    <span className="sspk-role">Keynote Visionary</span>
                    <h3 className="sspk-name">{speaker.name}</h3>
                  </div>
                  <span className="sspk-arrow" aria-hidden="true">
                    <ArrowUpRight size={15} strokeWidth={2.3} />
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>

      <div className="second-speakers-footer">
        <LiquidButton as={Link} to="/speakers">
          View All Speakers ➔
        </LiquidButton>
      </div>
    </section>
  );
}

