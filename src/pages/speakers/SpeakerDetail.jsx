import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import localSpeakersData from './speakers.json';
import { magazinesData as localMagazinesData } from '../magazines/magazinesData.js';
import {
  fetchSpeakersFromSupabase,
  fetchMagazinesFromSupabase,
  getSpeakerImageUrl,
  getSpeakerSlug,
} from '../../lib/supabase.js';
import './speakerDetail.css';

const SpeakerDetail = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [speakersData, setSpeakersData] = useState(localSpeakersData);
  const [magazinesData, setMagazinesData] = useState(localMagazinesData);

  useEffect(() => {
    fetchSpeakersFromSupabase()
      .then((data) => {
        if (data && data.length > 0) setSpeakersData(data);
      })
      .catch(() => {});
    fetchMagazinesFromSupabase()
      .then((data) => {
        if (data && data.length > 0) setMagazinesData(data);
      })
      .catch(() => {});
  }, []);

  const currentIndex = speakersData.findIndex(
    (s) => getSpeakerSlug(s) === slug || String(s.id) === slug
  );
  const speaker = currentIndex !== -1 ? speakersData[currentIndex] : null;

  const totalSpeakers = speakersData.length;
  const prevSpeaker =
    totalSpeakers > 0 && currentIndex !== -1
      ? speakersData[(currentIndex - 1 + totalSpeakers) % totalSpeakers]
      : null;
  const nextSpeaker =
    totalSpeakers > 0 && currentIndex !== -1
      ? speakersData[(currentIndex + 1) % totalSpeakers]
      : null;

  const goPrev = useCallback(() => {
    if (prevSpeaker) {
      navigate(`/speakers/${getSpeakerSlug(prevSpeaker)}`);
    }
  }, [prevSpeaker, navigate]);

  const goNext = useCallback(() => {
    if (nextSpeaker) {
      navigate(`/speakers/${getSpeakerSlug(nextSpeaker)}`);
    }
  }, [nextSpeaker, navigate]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'ArrowLeft') goPrev();
      if (e.key === 'ArrowRight') goNext();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [goPrev, goNext]);

  if (!speaker) {
    return (
      <div className="speaker-detail-page">
        <div className="speaker-detail-container">
          <Link to="/speakers" className="speaker-back-link">
            ← Back to Speakers
          </Link>
          <div className="speaker-not-found">
            <h2>Speaker Not Found</h2>
            <p>The speaker profile you are looking for does not exist.</p>
          </div>
        </div>
      </div>
    );
  }

  const mag = magazinesData.find(
    (m) => m.speakerId === speaker.id || m.id === slug
  );

  const credentials =
    speaker.description ||
    mag?.title ||
    'Distinguished Keynote Speaker & Thought Leader';

  return (
    <div className="speaker-detail-page">
      <div className="speaker-detail-container">
        <div className="speaker-detail-topbar">
          <Link to="/speakers" className="speaker-back-link">
            ← Back to Speakers
          </Link>

          <div className="speaker-topbar-nav">
            <button
              type="button"
              className="speaker-top-arrow-btn"
              onClick={goPrev}
              title={prevSpeaker ? `Previous: ${prevSpeaker.name}` : 'Previous Speaker'}
              aria-label="Previous speaker"
            >
              ‹
            </button>
            <span className="speaker-counter">
              {currentIndex + 1} / {totalSpeakers}
            </span>
            <button
              type="button"
              className="speaker-top-arrow-btn"
              onClick={goNext}
              title={nextSpeaker ? `Next: ${nextSpeaker.name}` : 'Next Speaker'}
              aria-label="Next speaker"
            >
              ›
            </button>
          </div>
        </div>

        <div className="speaker-profile-stage">
          <button
            type="button"
            className="speaker-side-arrow prev"
            onClick={goPrev}
            title={prevSpeaker ? `Previous: ${prevSpeaker.name}` : 'Previous Speaker'}
            aria-label="Previous speaker"
          >
            ‹
          </button>

          <div className="speaker-profile-card">
            <div className="speaker-profile-photo-col">
              <div className="speaker-profile-photo-frame">
                {speaker.image || speaker.image_url ? (
                  <img
                    src={getSpeakerImageUrl(speaker)}
                    alt={speaker.name}
                    className="speaker-profile-photo"
                    onError={(e) => {
                      e.target.onerror = null;
                      const filename = (speaker.image || '').split('/').pop();
                      if (filename) e.target.src = `/speakers_imgs/${filename}`;
                    }}
                  />
                ) : (
                  <div className="speaker-profile-placeholder">
                    <svg
                      width="64"
                      height="64"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.5"
                    >
                      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                      <circle cx="12" cy="7" r="4"></circle>
                    </svg>
                  </div>
                )}
              </div>
            </div>

            <div className="speaker-profile-content-col">
              <span className="speaker-profile-badge">
                {mag?.category || 'Keynote Speaker'}
              </span>
              <h1 className="speaker-profile-name">{speaker.name}</h1>

              <div className="speaker-profile-section">
                <h3 className="speaker-section-heading">Credentials & Role</h3>
                <p className="speaker-profile-credentials">{credentials}</p>
              </div>

              {mag?.quote && (
                <blockquote className="speaker-profile-quote">
                  “{mag.quote}”
                </blockquote>
              )}

              {mag?.bio && (
                <div className="speaker-profile-section">
                  <h3 className="speaker-section-heading">Biography</h3>
                  <p className="speaker-profile-bio">{mag.bio}</p>
                </div>
              )}

              {mag?.highlights && mag.highlights.length > 0 && (
                <div className="speaker-profile-section">
                  <h3 className="speaker-section-heading">Key Focus Areas</h3>
                  <div className="speaker-highlights-list">
                    {mag.highlights.map((item, idx) => (
                      <span key={idx} className="speaker-highlight-tag">
                        {item}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <div className="speaker-profile-actions">
                {mag && (
                  <Link
                    to={`/magazines/${mag.id}`}
                    className="speaker-btn-primary"
                  >
                    Read Magazine Feature ➔
                  </Link>
                )}
                <Link to="/conferences" className="speaker-btn-secondary">
                  Explore Conferences
                </Link>
              </div>
            </div>
          </div>

          <button
            type="button"
            className="speaker-side-arrow next"
            onClick={goNext}
            title={nextSpeaker ? `Next: ${nextSpeaker.name}` : 'Next Speaker'}
            aria-label="Next speaker"
          >
            ›
          </button>
        </div>

        <div className="speaker-bottom-travel">
          {prevSpeaker && (
            <Link
              to={`/speakers/${getSpeakerSlug(prevSpeaker)}`}
              className="speaker-travel-link prev"
            >
              <span className="travel-arrow">←</span>
              <div className="travel-meta">
                <span className="travel-label">Previous Speaker</span>
                <span className="travel-name">{prevSpeaker.name}</span>
              </div>
            </Link>
          )}
          {nextSpeaker && (
            <Link
              to={`/speakers/${getSpeakerSlug(nextSpeaker)}`}
              className="speaker-travel-link next"
            >
              <div className="travel-meta">
                <span className="travel-label">Next Speaker</span>
                <span className="travel-name">{nextSpeaker.name}</span>
              </div>
              <span className="travel-arrow">→</span>
            </Link>
          )}
        </div>
      </div>
    </div>
  );
};

export default SpeakerDetail;
