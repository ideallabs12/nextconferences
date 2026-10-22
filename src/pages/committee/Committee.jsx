import React from 'react';
import committeeData from './committee.json';
import './committee.css';

const Committee = () => {
    return (
        <div className="committee-page">
            <header className="committee-header">
                <span className="committee-eyebrow">HONORARY COMMITTEE</span>
                <h1 className="committee-title">Advisory Committee</h1>
                <p className="committee-subtitle">
                    Guiding NEXT Conferences with visionary leadership, resilience strategy, and executive excellence.
                </p>
            </header>

            <div className="committee-showcase">
                {committeeData.map((member) => (
                    <div key={member.id} className="committee-member-card">
                        <div className="member-avatar-wrapper">
                            <div className="member-avatar-ring">
                                <img 
                                    src={member.image} 
                                    alt={member.name} 
                                    className="member-avatar-img" 
                                />
                            </div>
                        </div>

                        <div className="member-meta">
                            <h2 className="member-name">{member.name}</h2>
                            <div className="member-divider" />
                            <p className="member-details">{member.details}</p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Committee;
