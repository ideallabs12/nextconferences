import React from 'react';
import { Link } from 'react-router-dom';
import conferencesData from '../../conferences/conferences.json';
import './UpcomingConferences.css';

const UpcomingConferences = () => {
    // Get the first 6 conferences to display in a 2-row grid on the home page
    const upcoming = conferencesData.slice(0, 6);

    return (
        <section className="upcoming-section">
            <div className="upcoming-header">
                <span className="upcoming-eyebrow">WHAT'S NEXT</span>
                <h2 className="upcoming-title">Our Future <span className="text-gradient">Conferences</span></h2>
                <p className="upcoming-subtitle">
                    Join global leaders and visionaries at our upcoming flagship events. 
                    Secure your spot and be part of the future.
                </p>
            </div>
            
            <div className="upcoming-grid">
                {upcoming.map((conf, index) => (
                    <Link to={`/conference/${conf.slug}`} key={index} className="upcoming-card" style={{ animationDelay: `${index * 0.15}s`, textDecoration: 'none' }}>
                        <div className="upcoming-image-container">
                            <img 
                                src={`/conferences_imgs/${conf.image}`} 
                                alt={conf.title} 
                                className="upcoming-image"
                                onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&q=80'; }}
                            />
                            <div className="upcoming-date-badge">
                                {conf.date.split(',')[0]}
                            </div>
                        </div>
                        <div className="upcoming-content">
                            <div className="upcoming-meta">
                                <span className="upcoming-location">📍 {conf.location}</span>
                            </div>
                            <h3 className="upcoming-card-title">{conf.title}</h3>
                        </div>
                    </Link>
                ))}
            </div>
            
            <div className="upcoming-footer">
                <Link to="/conferences" className="btn-view-all">Explore All Conferences ➔</Link>
            </div>
        </section>
    );
};

export default UpcomingConferences;
