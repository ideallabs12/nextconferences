import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import localConferencesData from '../../conferences/conferences.json';
import { fetchConferencesFromSupabase, getConferenceImageUrl } from '../lib/supabase.js';
import { NotchedProjectCard } from './ui/NotchedProjectCard.jsx';
import './UpcomingConferences.css';

const UpcomingConferences = () => {
    const [conferencesData, setConferencesData] = useState(localConferencesData);

    useEffect(() => {
        fetchConferencesFromSupabase()
            .then(data => {
                if (data && data.length > 0) setConferencesData(data);
            })
            .catch(() => {});
    }, []);

    // Get the top 6 conferences based on displayOrder to display on the home page
    const upcoming = [...conferencesData]
        .sort((a, b) => {
            const orderA = typeof a.displayOrder === 'number' ? a.displayOrder : (typeof a.order === 'number' ? a.order : 999999);
            const orderB = typeof b.displayOrder === 'number' ? b.displayOrder : (typeof b.order === 'number' ? b.order : 999999);
            return orderA - orderB;
        })
        .slice(0, 6);

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
            
            <div className="upcoming-notched-grid">
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
                            surface="var(--notched-card-surface, #050a15)"
                            accent="#00d2ff"
                            accentForeground="#040914"
                        />
                    );
                })}
            </div>
            
            <div className="upcoming-footer">
                <Link to="/conferences" className="btn-view-all">Explore All Conferences ➔</Link>
            </div>
        </section>
    );
};

export default UpcomingConferences;
