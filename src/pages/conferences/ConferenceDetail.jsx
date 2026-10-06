import React from 'react';
import { useParams, Link } from 'react-router-dom';
import conferencesData from './conferences.json';
import './conferenceDetail.css';

const ConferenceDetail = () => {
    const { slug } = useParams();
    const conference = conferencesData.find(c => c.slug === slug);

    if (!conference) {
        return (
            <div className="conference-not-found">
                <h2>Conference Not Found</h2>
                <Link to="/conferences" className="back-link">← Back to Conferences</Link>
            </div>
        );
    }

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
                        />
                    </div>
                    <div className="conference-detail-info">
                        <div className="conference-detail-meta">
                            <span className="conference-detail-date">📅 {conference.date}</span>
                            <span className="conference-detail-location">📍 {conference.location}</span>
                        </div>
                        <h1 className="conference-detail-title">{conference.title}</h1>
                        <p className="conference-detail-theme"><strong>Theme:</strong> {conference.theme}</p>
                    </div>
                </div>
            </header>

            <section className="conference-detail-content">
                <div className="conference-description">
                    {renderDescription()}
                </div>

                {conference.insightSessions && conference.insightSessions.length > 0 && (
                    <div className="insight-sessions-section">
                        <h2>Insight Sessions</h2>
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
            </section>
        </div>
    );
};

export default ConferenceDetail;
