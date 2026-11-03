import React, { useState, useEffect } from 'react';
import localCommitteeData from './committee.json';
import { fetchCommitteeFromSupabase, getCommitteeImageUrl } from '../../lib/supabase.js';
import './committee.css';

const Committee = () => {
    const [committeeData, setCommitteeData] = useState(localCommitteeData);

    useEffect(() => {
        fetchCommitteeFromSupabase()
            .then(data => {
                if (data && data.length > 0) setCommitteeData(data);
            })
            .catch(() => {});
    }, []);

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
                                    src={getCommitteeImageUrl(member)} 
                                    alt={member.name} 
                                    className="member-avatar-img" 
                                    onError={(e) => {
                                        e.target.onerror = null;
                                        const filename = (member.image || '').split('/').pop();
                                        if (filename) e.target.src = `/commitee_members/${filename}`;
                                    }}
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
