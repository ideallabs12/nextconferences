import React from 'react';
import { Link } from 'react-router-dom';
import speakersData from '../pages/speakers/speakers.json';
import './HomeSpeakers.css';

const HomeSpeakers = () => {
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
                        <div key={`${speaker.id}-${index}`} className="speaker-card-marquee">
                            <div className="speaker-image-wrapper">
                                <img 
                                    src={speaker.image} 
                                    alt={speaker.name} 
                                    className="speaker-image-marquee"
                                    loading="lazy"
                                />
                            </div>
                            <div className="speaker-info-marquee">
                                <h3 className="speaker-name-marquee">{speaker.name}</h3>
                                <p className="speaker-title-marquee">{speaker.description}</p>
                            </div>
                        </div>
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
