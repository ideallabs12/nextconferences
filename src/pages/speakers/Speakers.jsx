import React, { useState, useEffect } from 'react';
import './speakers.css';
import speakersData from './speakers.json';

const Speakers = () => {
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
                {speakersData.map((speaker) => (
                    <div key={speaker.id} className="speaker-card">
                        <div className="speaker-image-wrapper">
                            {speaker.image ? (
                                <img 
                                    src={speaker.image} 
                                    alt={speaker.name} 
                                    className="speaker-image" 
                                    loading="lazy" 
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
                            <p className="speaker-desc">{speaker.description || "Keynote Speaker"}</p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Speakers;
