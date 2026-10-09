import React, { useState, useEffect } from 'react';
import './privacypolicy.css';
import privacyData from './privacypolicy.json';

const Privacypolicy = () => {
    const { title, effective_date, sections } = privacyData.privacy_policy;
    const [activeSection, setActiveSection] = useState(0);

    const scrollToSection = (index) => {
        setActiveSection(index);
        const element = document.getElementById(`privacy-section-${index}`);
        if (element) {
            element.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    };

    return (
        <div className="privacy-page-wrapper">
            <div className="privacy-header-bg">
                <div className="privacy-header-content">
                    <h1 className="privacy-main-title">{title}</h1>
                    <p className="privacy-date">Effective Date: {new Date(effective_date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                </div>
            </div>

            <div className="privacy-content-container">
                <aside className="privacy-sidebar">
                    <div className="privacy-sidebar-inner">
                        <h3 className="privacy-sidebar-title">Table of Contents</h3>
                        <nav className="privacy-nav">
                            {sections.map((section, index) => (
                                <button
                                    key={index}
                                    className={`privacy-nav-link ${activeSection === index ? 'active' : ''}`}
                                    onClick={() => scrollToSection(index)}
                                >
                                    {section.heading}
                                </button>
                            ))}
                        </nav>
                    </div>
                </aside>

                <main className="privacy-main-content">
                    {sections.map((section, index) => (
                        <section 
                            key={index} 
                            id={`privacy-section-${index}`} 
                            className="privacy-section"
                        >
                            <h2 className="privacy-section-heading">
                                <span className="privacy-section-number">
                                    {(index + 1).toString().padStart(2, '0')}
                                </span>
                                {section.heading}
                            </h2>
                            <div className="privacy-section-body">
                                {section.content}
                            </div>
                        </section>
                    ))}
                </main>
            </div>
        </div>
    );
};

export default Privacypolicy;
