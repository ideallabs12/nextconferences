import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import localSpeakersData from '../pages/speakers/speakers.json';
import { fetchSpeakersFromSupabase, getSpeakerImageUrl, getSpeakerSlug } from '../lib/supabase.js';
import './HomeSpeakers.css';

const HomeSpeakers = () => {
    const [speakersData, setSpeakersData] = useState(localSpeakersData);

    useEffect(() => {
        fetchSpeakersFromSupabase()
            .then(data => {
                if (data && data.length > 0) setSpeakersData(data);
            })
            .catch(() => {});
    }, []);

    // For an infinite marquee effect, we can duplicate the array
    const marqueeSpeakers = [...speakersData, ...speakersData];

    return (
        <section className="home-speakers-section">
            <div className="home-speakers-header">
                <span className="speakers-eyebrow">OUR VISIONARIES</span>
                <h2 className="speakers-title">Previous <span className="text-gradient">Speakers</span></h2>
                <p className="speakers-subtitle">
                    Learn from industry leaders, innovators, and subject matter experts 
                    who have graced our stages in the past.
                </p>
            </div>

            <div className="marquee-container">
                <div className="marquee-track">
                    {marqueeSpeakers.map((speaker, index) => (
                        <Link
                            key={`${speaker.id}-${index}`}
                            to={`/speakers/${getSpeakerSlug(speaker)}`}
                            className="speaker-card-marquee"
                        >
                            <div className="speaker-image-wrapper">
                                <img 
                                    src={getSpeakerImageUrl(speaker)} 
                                    alt={speaker.name} 
                                    className="speaker-image-marquee"
                                    loading="lazy"
                                    onError={(e) => {
                                        e.target.onerror = null;
                                        const filename = (speaker.image || '').split('/').pop();
                                        if (filename) e.target.src = `/speakers_imgs/${filename}`;
                                    }}
                                />
                            </div>
                            <div className="speaker-info-marquee">
                                <h3 className="speaker-name-marquee">{speaker.name}</h3>
                            </div>
                        </Link>
                    ))}
                </div>
            </div>

            <div className="home-speakers-footer">
                <Link to="/speakers" className="btn-view-all">View All Speakers ➔</Link>
            </div>
        </section>
    );
};

export default HomeSpeakers;
