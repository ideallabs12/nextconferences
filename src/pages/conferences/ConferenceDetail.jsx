import React, { useState, useEffect } from 'react';
import { useParams, Link, useLocation, useNavigate } from 'react-router-dom';
import { Sparkles, ArrowRight, BookOpen, Calendar, MapPin } from 'lucide-react';
import conferencesData from './conferences.json';
import defaultPackages from './packages.json';
import ConferencePackages from './ConferencePackages.jsx';
import './conferenceDetail.css';

const ConferenceDetail = () => {
    const { slug } = useParams();
    const navigate = useNavigate();
    const conference = conferencesData.find(c => c.slug === slug);

    // Get packages from conference or fallback to defaultPackages
    const packages = (conference && conference.packages && conference.packages.length > 0)
        ? conference.packages
        : defaultPackages;

    // Handle scroll to hash (e.g. #packages or #sessions)
    useEffect(() => {
        if (location.hash) {
            const el = document.querySelector(location.hash);
            if (el) {
                setTimeout(() => {
                    el.scrollIntoView({ behavior: 'smooth' });
                }, 100);
            }
        }
    }, [location.hash, slug]);

    if (!conference) {
        return (
            <div className="conference-not-found">
                <h2>Conference Not Found</h2>
                <Link to="/conferences" className="back-link">← Back to Conferences</Link>
            </div>
        );
    }

    const handleHeroRegisterClick = (e) => {
        e.preventDefault();
        const packagesEl = document.getElementById('packages');
        if (packagesEl) {
            packagesEl.scrollIntoView({ behavior: 'smooth' });
        } else {
            navigate(`/register/${conference.slug}`);
        }
    };

    // Format the description properly
    const renderDescription = () => {
        return conference.description.split('\n').map((paragraph, index) => {
            const trimmed = paragraph.trim();
            if (trimmed) {
                return <p key={index}>{trimmed}</p>;
            }
            return null;
        });
    };

    return (
        <div className="conference-detail-container">
            <Link to="/conferences" className="back-link">← Back to Conferences</Link>
            
            <header className="conference-detail-header">
                <div className="conference-detail-hero">
                    <div className="conference-detail-image-wrapper">
                        <img 
                            src={`/conferences_imgs/${conference.image}`} 
                            alt={conference.title} 
                            className="conference-detail-image"
                            onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&q=80'; }}
                        />
                    </div>
                    <div className="conference-detail-info">
                        <div className="conference-detail-meta">
                            <span className="conference-detail-date">
                                <Calendar size={16} /> {conference.date}
                            </span>
                            <span className="conference-detail-location">
                                <MapPin size={16} /> {conference.location}
                            </span>
                        </div>
                        <h1 className="conference-detail-title">{conference.title}</h1>
                        <p className="conference-detail-theme">
                            <strong>Theme:</strong> {conference.theme}
                        </p>

                        <div className="conference-hero-actions">
                            <a
                                href="#packages"
                                onClick={handleHeroRegisterClick}
                                className="hero-btn-primary"
                            >
                                <Sparkles size={16} />
                                <span>View Packages & Pricing</span>
                            </a>
                            {conference.insightSessions && conference.insightSessions.length > 0 && (
                                <a href="#sessions" className="hero-btn-secondary">
                                    <BookOpen size={16} />
                                    <span>Insight Sessions</span>
                                </a>
                            )}
                        </div>
                    </div>
                </div>
            </header>

            <section className="conference-detail-content">
                <div className="conference-description-card">
                    <h2 className="conference-section-title">About the Conference</h2>
                    <div className="conference-description">
                        {renderDescription()}
                    </div>
                </div>

                {conference.insightSessions && conference.insightSessions.length > 0 && (
                    <div className="insight-sessions-section" id="sessions">
                        <h2 className="conference-section-title">Insight Sessions</h2>
                        <div className="insight-sessions-grid">
                            {conference.insightSessions.map((session, index) => (
                                <div key={index} className="insight-session-card">
                                    <h3>{session.title}</h3>
                                    <div className="insight-topics-list">
                                        {session.topics.map((topic, tIndex) => (
                                            <span key={tIndex} className="insight-topic-badge">{topic}</span>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Packages Section */}
                <ConferencePackages
                    packages={packages}
                    conferenceSlug={conference.slug}
                />
            </section>
        </div>
    );
};

export default ConferenceDetail;
