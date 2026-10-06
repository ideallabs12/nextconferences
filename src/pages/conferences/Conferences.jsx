import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import './conferences.css';
import conferencesData from './conferences.json';

const CATEGORIES = [
    { id: 'all', label: 'All', emoji: '🌐' },
    { id: 'mental-health', label: 'Mental Health', emoji: '🧠' },
    { id: 'spirituality', label: 'Spirituality & Well-Being', emoji: '🌿' },
    { id: 'women-leadership', label: "Women's Leadership", emoji: '👑' },
];

const YEARS = ['All Years', '2026', '2027'];

function getCategory(title) {
    const t = title.toLowerCase();
    const cats = [];
    if (t.includes('mental health') || t.includes('psychiatry') || t.includes('psychology')) cats.push('mental-health');
    if (t.includes('spirituality') || t.includes('spiritual') || t.includes('well-being') || t.includes('wellbeing')) cats.push('spirituality');
    if (t.includes('women') || t.includes('leadership')) cats.push('women-leadership');
    return cats;
}

function getYear(date) {
    const match = date.match(/\d{4}/);
    return match ? match[0] : null;
}

const Conferences = () => {
    const [activeTab, setActiveTab] = useState('all');
    const [activeYear, setActiveYear] = useState('All Years');
    const [search, setSearch] = useState('');

    const filtered = useMemo(() => {
        return conferencesData.filter(c => {
            const matchCat = activeTab === 'all' || getCategory(c.title).includes(activeTab);
            const matchYear = activeYear === 'All Years' || getYear(c.date) === activeYear;
            const q = search.trim().toLowerCase();
            const matchSearch = !q
                || c.title.toLowerCase().includes(q)
                || c.location.toLowerCase().includes(q)
                || c.date.toLowerCase().includes(q);
            return matchCat && matchYear && matchSearch;
        });
    }, [activeTab, activeYear, search]);

    return (
        <div className="conferences-container">
            <header className="conferences-header">
                <h1>Our Conferences</h1>
                <p>Explore our upcoming global summits and congresses shaping the future.</p>
            </header>

            {/* ─── Controls Bar ─── */}
            <div className="conf-controls-bar">

                {/* Search */}
                <div className="conf-search-wrapper">
                    <span className="conf-search-icon">🔍</span>
                    <input
                        type="text"
                        className="conf-search-input"
                        placeholder="Search by title, location or date…"
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                    />
                    {search && (
                        <button className="conf-search-clear" onClick={() => setSearch('')}>✕</button>
                    )}
                </div>

                <div className="conf-filters-row">
                    {/* Category tabs */}
                    <div className="conf-filter-bar">
                        {CATEGORIES.map(cat => (
                            <button
                                key={cat.id}
                                className={`conf-filter-tab${activeTab === cat.id ? ' active' : ''}`}
                                onClick={() => setActiveTab(cat.id)}
                            >
                                <span className="conf-filter-emoji">{cat.emoji}</span>
                                <span className="conf-filter-label">{cat.label}</span>
                            </button>
                        ))}
                    </div>

                    {/* Year filter */}
                    <div className="conf-year-bar">
                        {YEARS.map(yr => (
                            <button
                                key={yr}
                                className={`conf-year-tab${activeYear === yr ? ' active' : ''}`}
                                onClick={() => setActiveYear(yr)}
                            >
                                {yr}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* ─── Grid ─── */}
            {filtered.length === 0 ? (
                <div className="conf-empty">
                    <span>😕</span>
                    <p>No conferences match your filters. Try adjusting your search or category.</p>
                </div>
            ) : (
                <div className="conferences-list" key={`${activeTab}-${activeYear}-${search}`}>
                    {filtered.map((conf, idx) => (
                        <div key={conf.slug} className="conf-card" style={{ animationDelay: `${idx * 0.04}s` }}>
                            <div className="conf-card-image-side">
                                <img
                                    src={`/src/pages/conferences/conferences_imgs/${conf.image}`}
                                    alt={conf.title}
                                    className="conf-card-image"
                                />
                                <div className="conf-card-image-overlay" />
                            </div>

                            <div className="conf-card-body">
                                <div className="conf-card-tags">
                                    <span className="conf-tag conf-tag-upcoming">Upcoming</span>
                                </div>

                                <h2 className="conf-card-title">{conf.title}</h2>

                                <div className="conf-card-meta">
                                    <div className="conf-meta-item">
                                        <span className="conf-meta-icon">📅</span>
                                        <span className="conf-meta-text">{conf.date}</span>
                                    </div>
                                    <div className="conf-meta-item">
                                        <span className="conf-meta-icon">📍</span>
                                        <span className="conf-meta-text">{conf.location}</span>
                                    </div>
                                </div>

                                <div className="conf-card-actions">
                                    <a
                                        href="https://www.nextconferences.org/register"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="conf-btn conf-btn-register"
                                    >
                                        Register Now
                                    </a>
                                    <Link
                                        to={`/conference/${conf.slug}`}
                                        className="conf-btn conf-btn-details"
                                    >
                                        View Details
                                    </Link>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default Conferences;
