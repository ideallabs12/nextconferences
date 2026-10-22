import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Check, Sparkles, Award, Hotel, ShieldCheck, Video, Users, ArrowRight } from 'lucide-react';
import './conferencePackages.css';

const getPackageMeta = (pkgName) => {
    const name = pkgName.toLowerCase();
    if (name === 'speaker enrollment') {
        return {
            category: 'speaker',
            badge: 'Most Popular',
            icon: Award,
            accent: 'cyan',
            subtitle: 'In-Person Presentation & Conference Kit'
        };
    }
    if (name === 'suite - a') {
        return {
            category: 'speaker',
            badge: '2 Nights Hotel',
            icon: Hotel,
            accent: 'blue',
            subtitle: 'Speaker Access + 2 Nights Accommodation'
        };
    }
    if (name === 'suite - b') {
        return {
            category: 'speaker',
            badge: '3 Nights Hotel',
            icon: Hotel,
            accent: 'purple',
            subtitle: 'VIP Speaker Access + 3 Nights Accommodation'
        };
    }
    if (name === 'exhibitor enrollment') {
        return {
            category: 'exhibitor',
            badge: 'Exhibition & Sponsor',
            icon: Sparkles,
            accent: 'amber',
            subtitle: 'Booth 3×3m & 1-Year Global Online Promotion'
        };
    }
    if (name.includes('keynote')) {
        return {
            category: 'virtual',
            badge: 'Virtual Keynote',
            icon: Video,
            accent: 'sky',
            subtitle: 'Online Keynote Presentation & Mailed Certificates'
        };
    }
    if (name.includes('virtual speaker')) {
        return {
            category: 'virtual',
            badge: 'Virtual Speaker',
            icon: Video,
            accent: 'teal',
            subtitle: 'Online Presentation & Soft Copy Proceedings'
        };
    }
    return {
        category: 'delegate',
        badge: 'Delegate Pass',
        icon: Users,
        accent: 'violet',
        subtitle: 'Conference Entry, Kit, Certificate & Catering'
    };
};

const ConferencePackages = ({ packages, conferenceSlug, onSelectPackage }) => {
    const [activeFilter, setActiveFilter] = useState('all');

    if (!packages || packages.length === 0) return null;

    const filteredPackages = packages.filter(pkg => {
        if (activeFilter === 'all') return true;
        const meta = getPackageMeta(pkg.packageName);
        if (activeFilter === 'speaker') return meta.category === 'speaker';
        if (activeFilter === 'virtual') return meta.category === 'virtual';
        if (activeFilter === 'expo') return meta.category === 'exhibitor' || meta.category === 'delegate';
        return true;
    });

    return (
        <section className="conf-packages-section" id="packages">
            <div className="conf-packages-header">
                <span className="conf-packages-eyebrow">REGISTRATION & ENROLLMENT</span>
                <h2 className="conf-packages-title">
                    Conference <span className="text-gradient">Packages</span>
                </h2>
                <p className="conf-packages-subtitle">
                    Select the ideal registration tier for in-person presentations, hotel accommodation suites, virtual attendance, or commercial exhibition.
                </p>

                {/* Filter Tabs */}
                <div className="conf-packages-tabs">
                    <button
                        className={`conf-pkg-tab ${activeFilter === 'all' ? 'active' : ''}`}
                        onClick={() => setActiveFilter('all')}
                    >
                        All Packages ({packages.length})
                    </button>
                    <button
                        className={`conf-pkg-tab ${activeFilter === 'speaker' ? 'active' : ''}`}
                        onClick={() => setActiveFilter('speaker')}
                    >
                        In-Person & Suites (3)
                    </button>
                    <button
                        className={`conf-pkg-tab ${activeFilter === 'virtual' ? 'active' : ''}`}
                        onClick={() => setActiveFilter('virtual')}
                    >
                        Virtual Sessions (2)
                    </button>
                    <button
                        className={`conf-pkg-tab ${activeFilter === 'expo' ? 'active' : ''}`}
                        onClick={() => setActiveFilter('expo')}
                    >
                        Exhibitor & Delegate (2)
                    </button>
                </div>
            </div>

            <div className="conf-packages-grid">
                {filteredPackages.map((pkg, idx) => {
                    const meta = getPackageMeta(pkg.packageName);
                    const IconComponent = meta.icon;
                    const isPopular = meta.badge === 'Most Popular';

                    return (
                        <div
                            key={idx}
                            className={`conf-package-card conf-pkg-accent-${meta.accent} ${isPopular ? 'conf-pkg-featured' : ''}`}
                        >
                            {meta.badge && (
                                <div className="conf-pkg-badge">
                                    <IconComponent size={13} />
                                    <span>{meta.badge}</span>
                                </div>
                            )}

                            <div className="conf-pkg-header">
                                <h3 className="conf-pkg-name">{pkg.packageName}</h3>
                                <p className="conf-pkg-subtext">{meta.subtitle}</p>
                            </div>

                            <div className="conf-pkg-pricing">
                                {pkg.price !== null ? (
                                    <div className="conf-pkg-price-row">
                                        <span className="conf-pkg-currency">$</span>
                                        <span className="conf-pkg-amount">{pkg.price}</span>
                                        <span className="conf-pkg-unit">/ pass</span>
                                    </div>
                                ) : (
                                    <div className="conf-pkg-price-row conf-pkg-inquire">
                                        <span className="conf-pkg-amount-text">Contact Us</span>
                                        <span className="conf-pkg-unit">/ Delegate</span>
                                    </div>
                                )}
                                <span className="conf-pkg-note">
                                    {pkg.price !== null ? 'Official receipt & invoice included' : 'Group discount & institutional pass'}
                                </span>
                            </div>

                            <div className="conf-pkg-divider" />

                            <div className="conf-pkg-offers-wrapper">
                                <h4 className="conf-pkg-offers-heading">Package Inclusions:</h4>
                                <ul className="conf-pkg-offers-list">
                                    {pkg.offers.map((offer, oIdx) => (
                                        <li key={oIdx} className="conf-pkg-offer-item">
                                            <span className="conf-pkg-check-wrap">
                                                <Check size={14} className="conf-pkg-check-icon" />
                                            </span>
                                            <span className="conf-pkg-offer-text">{offer}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>

                            <div className="conf-pkg-footer">
                                <Link
                                    to={conferenceSlug ? `/register/${conferenceSlug}?package=${encodeURIComponent(pkg.packageName)}` : `/register?package=${encodeURIComponent(pkg.packageName)}`}
                                    className="conf-pkg-btn-register"
                                    aria-label={`Register for ${pkg.packageName}`}
                                >
                                    <span>Register Now</span>
                                    <ArrowRight size={16} className="conf-pkg-btn-arrow" />
                                </Link>
                            </div>
                        </div>
                    );
                })}
            </div>

            <div className="conf-packages-guarantee">
                <div className="conf-guarantee-card">
                    <ShieldCheck size={24} className="conf-guarantee-icon" />
                    <div className="conf-guarantee-text">
                        <strong>Official Registration & Payment Support</strong>
                        <p>
                            NEXT Conferences accepts international credit/debit cards via Stripe and PayPal, as well as official bank wire transfers. Group discounts of up to 25% apply for delegations of 4 or more participants.
                        </p>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default ConferencePackages;
