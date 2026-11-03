import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import './speakers.css';
import localSpeakersData from './speakers.json';
import { fetchSpeakersFromSupabase, getSpeakerImageUrl, getSpeakerSlug } from '../../lib/supabase.js';

const Speakers = () => {
    const [speakersData, setSpeakersData] = useState(localSpeakersData);

    useEffect(() => {
        fetchSpeakersFromSupabase()
            .then(data => {
                if (data && data.length > 0) setSpeakersData(data);
            })
            .catch(() => {});
    }, []);

    return (
        <div className="speakers-page">
            <header className="speakers-header">
                <span className="speakers-label">Visionaries</span>
                <h1 className="speakers-title">Meet Our Speakers</h1>
                <p className="speakers-subtitle">
                    Hear from world-renowned leaders, healers, and visionaries guiding us toward a new paradigm of human consciousness and holistic well-being.
                </p>
            </header>

            <div className="speakers-grid">
                {speakersData.map((speaker) => {
                    const slug = getSpeakerSlug(speaker);

                    return (
                        <Link
                            key={speaker.id || slug}
                            to={`/speakers/${slug}`}
                            className="speaker-card"
                        >
                            <div className="speaker-image-wrapper">
                                {(speaker.image || speaker.image_url) ? (
                                    <img 
                                        src={getSpeakerImageUrl(speaker)} 
                                        alt={speaker.name} 
                                        className="speaker-image" 
                                        loading="lazy" 
                                        onError={(e) => {
                                            e.target.onerror = null;
                                            const filename = (speaker.image || '').split('/').pop();
                                            if (filename) e.target.src = `/speakers_imgs/${filename}`;
                                        }}
                                    />
                                ) : (
                                    <div className="speaker-image-placeholder">
                                        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                                            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                                            <circle cx="12" cy="7" r="4"></circle>
                                        </svg>
                                    </div>
                                )}
                                <div className="speaker-overlay"></div>
                            </div>
                            
                            <div className="speaker-info">
                                <h3 className="speaker-name">{speaker.name}</h3>
                            </div>
                        </Link>
                    );
                })}
            </div>
        </div>
    );
};

export default Speakers;
