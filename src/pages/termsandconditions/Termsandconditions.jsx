import React, { useState } from 'react';
import './termsandconditions.css';
import termsData from './termsandconditions.json';

const Termsandconditions = () => {
    const { title, intro, sections } = termsData;
    const [activeSection, setActiveSection] = useState(0);

    const scrollToSection = (index) => {
        setActiveSection(index);
        const element = document.getElementById(`terms-section-${index}`);
        if (element) {
            element.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    };

    return (
        <div className="terms-page-wrapper">
            <div className="terms-hero">
                <div className="terms-hero-content">
                    <h1 className="terms-title">{title}</h1>
                    <p className="terms-intro">{intro}</p>
                </div>
                <div className="terms-hero-shapes">
                    <div className="shape shape-1"></div>
                    <div className="shape shape-2"></div>
                </div>
            </div>

            <div className="terms-layout">
                <aside className="terms-sidebar">
                    <div className="terms-sidebar-sticky">
                        <h3 className="terms-sidebar-heading">Navigation</h3>
                        <ul className="terms-nav-list">
                            {sections.map((section, index) => (
                                <li key={index}>
                                    <button
                                        className={`terms-nav-btn ${activeSection === index ? 'active' : ''}`}
                                        onClick={() => scrollToSection(index)}
                                    >
                                        <span className="nav-indicator"></span>
                                        {section.heading}
                                    </button>
                                </li>
                            ))}
                        </ul>
                    </div>
                </aside>

                <main className="terms-main">
                    {sections.map((section, index) => (
                        <div 
                            key={index} 
                            id={`terms-section-${index}`} 
                            className="terms-card"
                        >
                            <div className="terms-card-header">
                                <span className="terms-card-index">0{index + 1}</span>
                                <h2 className="terms-card-title">{section.heading}</h2>
                            </div>
                            <div className="terms-card-body">
                                {section.content.split('\n').map((paragraph, pIndex) => (
                                    <p key={pIndex}>{paragraph}</p>
                                ))}
                            </div>
                        </div>
                    ))}
                </main>
            </div>
        </div>
    );
};

export default Termsandconditions;
