import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import localConferencesData from '../../../conferences/conferences.json';
import { fetchConferencesFromSupabase, getConferenceImageUrl } from '../../lib/supabase.js';
import { NotchedProjectCard } from '../../components/ui/NotchedProjectCard.jsx';
import { LiquidButton } from '../../components/ui/LiquidGlassButton.jsx';
import './SecondUpcomingConferences.css';

const SecondUpcomingConferences = ({ isDarkMode = false }) => {
  const [conferencesData, setConferencesData] = useState(localConferencesData);

  useEffect(() => {
    fetchConferencesFromSupabase()
      .then((data) => {
        if (data && data.length > 0) setConferencesData(data);
      })
      .catch(() => {});
  }, []);

  const upcoming = [...conferencesData]
    .sort((a, b) => {
      const orderA =
        typeof a.displayOrder === 'number'
          ? a.displayOrder
          : typeof a.order === 'number'
          ? a.order
          : 999999;
      const orderB =
        typeof b.displayOrder === 'number'
          ? b.displayOrder
          : typeof b.order === 'number'
          ? b.order
          : 999999;
      return orderA - orderB;
    })
    .slice(0, 6);

  return (
    <section className="second-upcoming-section">
      {/* Background soft color mesh */}
      <div className="second-upcoming-bg" aria-hidden="true" />

      <div className="second-upcoming-container">
        <header className="second-upcoming-header">
          <span className="second-upcoming-eyebrow">WHAT'S NEXT</span>
          <h2 className="second-upcoming-title">
            Our Future <span className="sh-conf-gradient">Conferences</span>
          </h2>
          <p className="second-upcoming-subtitle">
            Join global leaders and visionaries at our upcoming flagship events.
            Secure your spot and be part of the future.
          </p>
        </header>

        <div className="second-upcoming-grid">
          {upcoming.map((conf, index) => {
            const cleanLocation = (conf.location || '').replace(/\.$/, '');
            const cleanDate = (conf.date || '').replace(/\.$/, '');

            return (
              <NotchedProjectCard
                key={conf.slug || index}
                href={`/conference/${conf.slug}`}
                title={conf.title}
                image={getConferenceImageUrl(conf)}
                imageAlt={conf.title}
                onImageError={(e) => {
                  e.target.onerror = null;
                  e.target.src = `/conferences_imgs/${conf.image}`;
                }}
                badge={cleanDate}
                locationBadge={`📍 ${cleanLocation}`}
                surface={isDarkMode ? '#050814' : '#ffffff'}
                accent={isDarkMode ? '#2ee6ff' : '#1f3bff'}
                accentForeground="#ffffff"
                className={isDarkMode ? 'is-second-dark-theme' : 'is-light-theme'}
              />
            );
          })}
        </div>

        <div className="second-upcoming-footer">
          <LiquidButton as={Link} to="/conferences">
            Explore All Conferences ➔
          </LiquidButton>
        </div>
      </div>
    </section>
  );
};

export default SecondUpcomingConferences;

