import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useParams, Link, useNavigate, useLocation } from 'react-router-dom';
import {
    Check,
    ShieldCheck,
    Mail,
    Phone,
    Building,
    Globe,
    User,
    Award,
    Calendar,
    MapPin,
    ArrowRight,
    ArrowLeft,
    CreditCard,
    CheckCircle2,
    FileText,
    ChevronDown,
    Home,
    Printer,
    QrCode,
    Sparkles,
    Ticket
} from 'lucide-react';
import conferencesData from '../conferences/conferences.json';
import defaultPackages from '../conferences/packages.json';
import BeamsBackground from '../../components/BeamsBackground.jsx';
import './register.css';

const COUNTRY_CODES = [
    { code: 'US', name: 'United States', dial: '+1' },
    { code: 'GB', name: 'United Kingdom', dial: '+44' },
    { code: 'FR', name: 'France', dial: '+33' },
    { code: 'DE', name: 'Germany', dial: '+49' },
    { code: 'IT', name: 'Italy', dial: '+39' },
    { code: 'ES', name: 'Spain', dial: '+34' },
    { code: 'CA', name: 'Canada', dial: '+1' },
    { code: 'AU', name: 'Australia', dial: '+61' },
    { code: 'JP', name: 'Japan', dial: '+81' },
    { code: 'AE', name: 'United Arab Emirates', dial: '+971' },
    { code: 'IN', name: 'India', dial: '+91' },
    { code: 'CN', name: 'China', dial: '+86' },
    { code: 'SG', name: 'Singapore', dial: '+65' },
    { code: 'CH', name: 'Switzerland', dial: '+41' },
    { code: 'NL', name: 'Netherlands', dial: '+31' },
    { code: 'SE', name: 'Sweden', dial: '+46' },
    { code: 'BR', name: 'Brazil', dial: '+55' },
    { code: 'ZA', name: 'South Africa', dial: '+27' },
    { code: 'KR', name: 'South Korea', dial: '+82' },
    { code: 'SA', name: 'Saudi Arabia', dial: '+966' },
    { code: 'QA', name: 'Qatar', dial: '+974' },
    { code: 'TR', name: 'Turkey', dial: '+90' },
    { code: 'EG', name: 'Egypt', dial: '+20' },
    { code: 'NZ', name: 'New Zealand', dial: '+64' },
    { code: 'MX', name: 'Mexico', dial: '+52' },
    { code: 'IE', name: 'Ireland', dial: '+353' },
    { code: 'BE', name: 'Belgium', dial: '+32' },
    { code: 'AT', name: 'Austria', dial: '+43' },
    { code: 'DK', name: 'Denmark', dial: '+45' },
    { code: 'NO', name: 'Norway', dial: '+47' },
    { code: 'FI', name: 'Finland', dial: '+358' },
    { code: 'PL', name: 'Poland', dial: '+48' },
    { code: 'PT', name: 'Portugal', dial: '+351' },
    { code: 'GR', name: 'Greece', dial: '+30' },
    { code: 'MY', name: 'Malaysia', dial: '+60' },
    { code: 'TH', name: 'Thailand', dial: '+66' },
    { code: 'ID', name: 'Indonesia', dial: '+62' },
    { code: 'PH', name: 'Philippines', dial: '+63' },
    { code: 'NG', name: 'Nigeria', dial: '+234' },
    { code: 'KE', name: 'Kenya', dial: '+254' },
    { code: 'AR', name: 'Argentina', dial: '+54' },
    { code: 'CL', name: 'Chile', dial: '+56' },
    { code: 'CO', name: 'Colombia', dial: '+57' },
    { code: 'IL', name: 'Israel', dial: '+972' }
];

const ALL_COUNTRIES = [
    'United States', 'United Kingdom', 'Canada', 'Australia', 'France',
    'Germany', 'Italy', 'Spain', 'Japan', 'United Arab Emirates',
    'India', 'China', 'Singapore', 'Switzerland', 'Netherlands',
    'Sweden', 'Norway', 'Denmark', 'Finland', 'Belgium',
    'Austria', 'Ireland', 'Portugal', 'Poland', 'Brazil',
    'Mexico', 'South Africa', 'Saudi Arabia', 'Qatar', 'New Zealand',
    'South Korea', 'Turkey', 'Egypt', 'Malaysia', 'Thailand',
    'Indonesia', 'Philippines', 'Nigeria', 'Kenya', 'Argentina',
    'Chile', 'Colombia', 'Israel', 'Greece', 'Czech Republic'
];

function CountryCodeDropdown({ value, onChange }) {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef(null);

    useEffect(() => {
        function handleClickOutside(event) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        }
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const selectedItem = COUNTRY_CODES.find(c => c.dial === value) || COUNTRY_CODES[0];

    return (
        <div ref={dropdownRef} className="country-code-picker">
            <div
                className="country-code-trigger"
                onClick={() => setIsOpen(!isOpen)}
                role="button"
                tabIndex={0}
            >
                <img
                    src={`https://flagcdn.com/w20/${selectedItem.code.toLowerCase()}.png`}
                    width="20"
                    alt={selectedItem.name}
                    className="country-flag-icon"
                    onError={(e) => { e.target.src = 'https://flagcdn.com/w20/un.png'; }}
                />
                <span className="country-code-text">{value}</span>
                <ChevronDown size={12} className="country-code-arrow" />
            </div>

            {isOpen && (
                <div className="country-code-list no-scrollbar">
                    {COUNTRY_CODES.map((c) => (
                        <div
                            key={c.code}
                            className={`country-code-option ${value === c.dial ? 'active' : ''}`}
                            onClick={() => {
                                onChange(c.dial);
                                setIsOpen(false);
                            }}
                        >
                            <img
                                src={`https://flagcdn.com/w20/${c.code.toLowerCase()}.png`}
                                width="20"
                                alt={c.name}
                                className="country-flag-icon"
                                onError={(e) => { e.target.src = 'https://flagcdn.com/w20/un.png'; }}
                            />
                            <span className="option-name">{c.name}</span>
                            <span className="option-dial">{c.dial}</span>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

function ConferenceSearchDropdown({ value, onChange, conferences }) {
    const [isOpen, setIsOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const dropdownRef = useRef(null);
    const searchInputRef = useRef(null);

    useEffect(() => {
        if (isOpen && searchInputRef.current) {
            searchInputRef.current.focus();
        }
    }, [isOpen]);

    useEffect(() => {
        function handleClickOutside(event) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
                setSearchQuery('');
            }
        }
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const selectedConf = conferences.find(c => c.slug === value) || conferences[0];

    const filtered = conferences.filter(c => {
        const q = searchQuery.toLowerCase();
        return (c.title && c.title.toLowerCase().includes(q)) ||
            (c.location && c.location.toLowerCase().includes(q)) ||
            (c.date && c.date.toLowerCase().includes(q));
    });

    return (
        <div ref={dropdownRef} className="conf-dropdown-container">
            <div
                className="conf-dropdown-trigger"
                onClick={() => setIsOpen(!isOpen)}
                role="button"
                tabIndex={0}
            >
                <span className="conf-dropdown-label">
                    {selectedConf ? selectedConf.title : 'Select a conference...'}
                </span>
                <ChevronDown size={14} className="conf-dropdown-arrow" />
            </div>

            {isOpen && (
                <div className="conf-dropdown-menu no-scrollbar">
                    <div className="conf-dropdown-search-wrap">
                        <input
                            ref={searchInputRef}
                            type="text"
                            placeholder="Search by conference name or city..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="conf-search-input"
                        />
                    </div>
                    <div className="conf-options-list">
                        {filtered.map(c => (
                            <div
                                key={c.slug}
                                className={`conf-option-item ${value === c.slug ? 'selected' : ''}`}
                                onClick={() => {
                                    onChange(c.slug);
                                    setIsOpen(false);
                                    setSearchQuery('');
                                }}
                            >
                                <div className="conf-option-title">{c.title}</div>
                                <div className="conf-option-meta">
                                    {c.date} • {c.location}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}

export default function Register() {
    const { slug } = useParams();
    const location = useLocation();
    const navigate = useNavigate();

    const searchParams = useMemo(() => new URLSearchParams(location.search), [location.search]);
    const confQuery = searchParams.get('conf');
    const packageQuery = searchParams.get('package');

    const initialConfSlug = slug || confQuery || conferencesData[0]?.slug;
    const [selectedConfSlug, setSelectedConfSlug] = useState(initialConfSlug);
    const conf = conferencesData.find(c => c.slug === selectedConfSlug) || conferencesData[0];

    const availablePackages = (conf && conf.packages && conf.packages.length > 0)
        ? conf.packages
        : defaultPackages;

    const [selectedPackageName, setSelectedPackageName] = useState(() => {
        if (packageQuery) {
            const found = availablePackages.find(
                p => p.packageName.toLowerCase() === packageQuery.toLowerCase()
            );
            if (found) return found.packageName;
        }
        return availablePackages[0]?.packageName || 'Speaker Enrollment';
    });

    useEffect(() => {
        const activeSlug = slug || confQuery;
        if (activeSlug && activeSlug !== selectedConfSlug) {
            setSelectedConfSlug(activeSlug);
        }
    }, [slug, confQuery]);

    useEffect(() => {
        if (availablePackages && availablePackages.length > 0) {
            const match = packageQuery
                ? availablePackages.find(p => p.packageName.toLowerCase() === packageQuery.toLowerCase())
                : null;
            if (match) {
                setSelectedPackageName(match.packageName);
            } else if (!availablePackages.some(p => p.packageName === selectedPackageName)) {
                setSelectedPackageName(availablePackages[0].packageName);
            }
        }
    }, [availablePackages, packageQuery]);

    const currentPackage = availablePackages.find(p => p.packageName === selectedPackageName) || availablePackages[0];

    const [formData, setFormData] = useState({
        name: '',
        email: '',
        countryCode: '+1',
        phone: '',
        country: ''
    });

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);
    const [registrationId, setRegistrationId] = useState('');
    const [mobileStep, setMobileStep] = useState(1);
    const [step1Error, setStep1Error] = useState('');

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        if (step1Error) setStep1Error('');
    };

    const validateStep1 = () => {
        if (!formData.name.trim()) {
            setStep1Error('Please enter your full name to proceed.');
            return false;
        }
        if (!formData.email.trim() || !formData.email.includes('@')) {
            setStep1Error('Please enter a valid email address.');
            return false;
        }
        if (!formData.phone.trim()) {
            setStep1Error('Please enter your phone number.');
            return false;
        }
        if (!formData.country) {
            setStep1Error('Please select your country / region.');
            return false;
        }
        setStep1Error('');
        return true;
    };

    const handleContinueToSummary = (e) => {
        e.preventDefault();
        if (validateStep1()) {
            setMobileStep(2);
            window.scrollTo({ top: 100, behavior: 'smooth' });
        }
    };

    const handleConferenceChange = (newSlug) => {
        setSelectedConfSlug(newSlug);
        navigate(`/register/${newSlug}?package=${encodeURIComponent(selectedPackageName)}`);
    };

    const handlePackageDropdownChange = (e) => {
        const newPkg = e.target.value;
        setSelectedPackageName(newPkg);
        if (conf?.slug) {
            navigate(`/register/${conf.slug}?package=${encodeURIComponent(newPkg)}`, { replace: true });
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!validateStep1()) {
            setMobileStep(1);
            return;
        }
        setIsSubmitting(true);

        setTimeout(() => {
            const randomCode = Math.floor(100000 + Math.random() * 900000);
            const prefix = conf?.slug ? conf.slug.toUpperCase().slice(0, 4) : 'NEXT';
            setRegistrationId(`NEXT-${prefix}-${randomCode}`);
            setIsSubmitting(false);
            setIsSuccess(true);
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }, 850);
    };


    if (isSuccess) {
        return (
            <BeamsBackground intensity="strong">
                <div className="registration-container ticket-screen-container">
                    {/* Top Confirmed Header */}
                    <div className="ticket-success-header">
                        <div className="ticket-success-badge">
                            <CheckCircle2 size={16} className="badge-check-icon" />
                            <span>REGISTRATION CONFIRMED • OFFICIAL PASS ISSUED</span>
                        </div>
                        <h1 className="ticket-page-title">Your Conference Ticket</h1>
                        <p className="ticket-page-sub">
                            Thank you, <strong>{formData.name}</strong>. Your delegate enrollment has been processed and your official conference pass is ready.
                        </p>
                    </div>

                    {/* Premium Conference Ticket / Delegate Boarding Pass */}
                    <div className="conference-ticket-card" id="conferenceTicket">
                        {/* Decorative Top Holographic Glow Line */}
                        <div className="ticket-holographic-bar" />

                        {/* Main Body (Left on desktop, Top on mobile) */}
                        <div className="ticket-main-body">
                            {/* Header row with Branding & Pass Tier */}
                            <div className="ticket-header-row">
                                <div className="ticket-brand">
                                    <div className="ticket-brand-super">NEXT CONFERENCES</div>
                                    <div className="ticket-brand-sub">INTERNATIONAL SUMMIT PASS</div>
                                </div>
                                <div className="ticket-tier-badge">
                                    <Sparkles size={13} className="tier-icon" />
                                    <span>{currentPackage?.packageName || 'Official Delegate'}</span>
                                </div>
                            </div>

                            {/* Conference Title & Meta */}
                            <div className="ticket-conf-section">
                                <span className="ticket-eyebrow">EVENT INFORMATION</span>
                                <h2 className="ticket-conf-title">{conf?.title}</h2>
                                <div className="ticket-conf-meta-row">
                                    {conf?.date && (
                                        <span className="ticket-meta-pill">
                                            <Calendar size={13} className="meta-pill-icon" />
                                            <span>{conf.date}</span>
                                        </span>
                                    )}
                                    {conf?.location && (
                                        <span className="ticket-meta-pill">
                                            <MapPin size={13} className="meta-pill-icon" />
                                            <span>{conf.location}</span>
                                        </span>
                                    )}
                                </div>
                            </div>

                            {/* Perforated hairline separator */}
                            <div className="ticket-inner-divider" />

                            {/* Attendee Details Grid */}
                            <div className="ticket-delegate-grid">
                                <div className="delegate-field">
                                    <span className="delegate-field-lbl">ATTENDEE NAME</span>
                                    <span className="delegate-field-val highlight-name">
                                        <User size={13} className="field-icon" />
                                        {formData.name || 'Registered Delegate'}
                                    </span>
                                </div>

                                <div className="delegate-field">
                                    <span className="delegate-field-lbl">EMAIL ADDRESS</span>
                                    <span className="delegate-field-val">
                                        <Mail size={13} className="field-icon" />
                                        {formData.email}
                                    </span>
                                </div>

                                <div className="delegate-field">
                                    <span className="delegate-field-lbl">PHONE / WHATSAPP</span>
                                    <span className="delegate-field-val">
                                        <Phone size={13} className="field-icon" />
                                        {formData.countryCode} {formData.phone}
                                    </span>
                                </div>

                                <div className="delegate-field">
                                    <span className="delegate-field-lbl">COUNTRY / REGION</span>
                                    <span className="delegate-field-val">
                                        <Globe size={13} className="field-icon" />
                                        {formData.country || 'International'}
                                    </span>
                                </div>
                            </div>

                            {/* Package & Payment Summary Footer */}
                            <div className="ticket-footer-row">
                                <div className="ticket-package-summary">
                                    <span className="pkg-lbl">SELECTED PACKAGE</span>
                                    <span className="pkg-name">{currentPackage?.packageName}</span>
                                    <span className="pkg-sub">All Sessions • Official Kit & Certificate</span>
                                </div>
                                <div className="ticket-fee-summary">
                                    <span className="fee-lbl">TOTAL FEE</span>
                                    <span className="fee-amount">
                                        ${currentPackage?.price} <span className="fee-currency">USD</span>
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Perforated Notch Divider */}
                        <div className="ticket-perforated-notch">
                            <div className="notch-cutout notch-top" />
                            <div className="notch-line" />
                            <div className="notch-cutout notch-bottom" />
                        </div>

                        {/* Ticket Stub / Security Verification */}
                        <div className="ticket-stub-body">
                            <div className="stub-header">
                                <span className="stub-lbl">PASS REFERENCE</span>
                                <span className="stub-code">{registrationId}</span>
                            </div>

                            <div className="stub-qr-wrap">
                                <div className="stub-qr-box">
                                    <QrCode size={64} className="stub-qr-icon" />
                                </div>
                                <span className="stub-qr-label">SCAN AT VENUE GATE</span>
                            </div>

                            <div className="stub-barcode-section">
                                <svg viewBox="0 0 160 32" className="barcode-svg" preserveAspectRatio="none">
                                    <rect x="0" y="0" width="3" height="32" fill="currentColor"/>
                                    <rect x="5" y="0" width="2" height="32" fill="currentColor"/>
                                    <rect x="9" y="0" width="4" height="32" fill="currentColor"/>
                                    <rect x="15" y="0" width="1" height="32" fill="currentColor"/>
                                    <rect x="18" y="0" width="3" height="32" fill="currentColor"/>
                                    <rect x="23" y="0" width="5" height="32" fill="currentColor"/>
                                    <rect x="30" y="0" width="2" height="32" fill="currentColor"/>
                                    <rect x="34" y="0" width="3" height="32" fill="currentColor"/>
                                    <rect x="39" y="0" width="1" height="32" fill="currentColor"/>
                                    <rect x="42" y="0" width="4" height="32" fill="currentColor"/>
                                    <rect x="48" y="0" width="2" height="32" fill="currentColor"/>
                                    <rect x="52" y="0" width="5" height="32" fill="currentColor"/>
                                    <rect x="59" y="0" width="2" height="32" fill="currentColor"/>
                                    <rect x="63" y="0" width="3" height="32" fill="currentColor"/>
                                    <rect x="68" y="0" width="4" height="32" fill="currentColor"/>
                                    <rect x="74" y="0" width="1" height="32" fill="currentColor"/>
                                    <rect x="77" y="0" width="3" height="32" fill="currentColor"/>
                                    <rect x="82" y="0" width="4" height="32" fill="currentColor"/>
                                    <rect x="88" y="0" width="2" height="32" fill="currentColor"/>
                                    <rect x="92" y="0" width="5" height="32" fill="currentColor"/>
                                    <rect x="99" y="0" width="1" height="32" fill="currentColor"/>
                                    <rect x="102" y="0" width="3" height="32" fill="currentColor"/>
                                    <rect x="107" y="0" width="4" height="32" fill="currentColor"/>
                                    <rect x="113" y="0" width="2" height="32" fill="currentColor"/>
                                    <rect x="117" y="0" width="3" height="32" fill="currentColor"/>
                                    <rect x="122" y="0" width="5" height="32" fill="currentColor"/>
                                    <rect x="129" y="0" width="2" height="32" fill="currentColor"/>
                                    <rect x="133" y="0" width="4" height="32" fill="currentColor"/>
                                    <rect x="139" y="0" width="1" height="32" fill="currentColor"/>
                                    <rect x="142" y="0" width="3" height="32" fill="currentColor"/>
                                    <rect x="147" y="0" width="4" height="32" fill="currentColor"/>
                                    <rect x="153" y="0" width="2" height="32" fill="currentColor"/>
                                    <rect x="157" y="0" width="3" height="32" fill="currentColor"/>
                                </svg>
                                <span className="stub-barcode-sub">{registrationId}</span>
                            </div>

                            <div className="stub-status-pill">
                                <span className="stub-status-dot" />
                                <span>VERIFIED DELEGATE</span>
                            </div>
                        </div>
                    </div>

                    {/* Email Dispatch Notice */}
                    <div className="ticket-dispatch-note">
                        <ShieldCheck size={16} className="dispatch-icon" />
                        <span>
                            An official receipt and calendar confirmation have been sent to <strong>{formData.email}</strong>. Please present this pass or barcode upon venue arrival.
                        </span>
                    </div>

                    {/* Action Buttons: "Back to Home" and "Print Ticket" */}
                    <div className="ticket-actions-row">
                        <Link to="/" className="btn-ticket-home">
                            <Home size={17} />
                            <span>Back to Home</span>
                        </Link>
                        <button
                            type="button"
                            className="btn-ticket-print"
                            onClick={() => window.print()}
                        >
                            <Printer size={17} />
                            <span>Print / Save Pass</span>
                        </button>
                    </div>
                </div>
            </BeamsBackground>
        );
    }

    return (
        <BeamsBackground intensity="strong">
            <div className="registration-container">
                <div className="registration-top-bar">
                    <Link to={`/conference/${conf.slug}`} className="btn-back-link">
                        <ArrowLeft size={16} /> Back to Conference
                    </Link>
                    <div className="ssl-badge">
                        <ShieldCheck size={14} /> 256-Bit SSL Encrypted
                    </div>
                </div>

                <div className="registration-header">
                    <h1>Register for Conference</h1>
                    <p className="registration-header-sub">
                        Complete your attendee details and finalize registration for NEXT International Conferences.
                    </p>
                </div>

                {/* 2-Step Progress Indicator (Mobile Only) */}
                <div className="mobile-step-indicator">
                    <button
                        type="button"
                        className={`step-tab ${mobileStep === 1 ? 'active' : 'completed'}`}
                        onClick={() => setMobileStep(1)}
                    >
                        <span className="step-badge">{mobileStep > 1 ? '✓' : '1'}</span>
                        <span className="step-lbl-full">Attendee Details</span>
                        <span className="step-lbl-short">Details</span>
                    </button>
                    <button
                        type="button"
                        className={`step-tab ${mobileStep === 2 ? 'active' : ''}`}
                        onClick={() => {
                            if (validateStep1()) setMobileStep(2);
                        }}
                    >
                        <span className="step-badge">2</span>
                        <span className="step-lbl-full">Order Summary</span>
                        <span className="step-lbl-short">Summary</span>
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="registration-content">
                    {/* Left Column: Attendee Details Form */}
                    <div className={`registration-form-section ${mobileStep === 1 ? 'mobile-step-active' : 'mobile-step-hidden'}`}>
                        <h2>Attendee Details</h2>

                        <div className="registration-form">
                            {/* Conference Dropdown */}
                            <div className="form-group full-width">
                                <label>Conference *</label>
                                <ConferenceSearchDropdown
                                    value={conf.slug}
                                    onChange={handleConferenceChange}
                                    conferences={conferencesData}
                                />
                            </div>

                            {/* Package Dropdown Selector */}
                            <div className="form-group full-width">
                                <div className="pkg-label-row">
                                    <label htmlFor="packageSelect">Selected Package *</label>
                                    <Link to={`/conference/${conf.slug}#packages`} className="browse-packages-link">
                                        Browse all package details on conference page ➔
                                    </Link>
                                </div>
                                <select
                                    id="packageSelect"
                                    value={selectedPackageName}
                                    onChange={handlePackageDropdownChange}
                                    className="package-select-control"
                                    required
                                >
                                    {availablePackages.map(pkg => (
                                        <option key={pkg.packageName} value={pkg.packageName}>
                                            {pkg.packageName} — ${pkg.price} USD
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* Full Name */}
                            <div className="form-group">
                                <label htmlFor="name">Full Name *</label>
                                <input
                                    type="text"
                                    id="name"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleInputChange}
                                    required
                                    placeholder="Prof. / Dr. / Mr. / Ms."
                                />
                            </div>

                            {/* Email */}
                            <div className="form-group">
                                <label htmlFor="email">Email Address *</label>
                                <input
                                    type="email"
                                    id="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleInputChange}
                                    required
                                    placeholder="yourname@institution.edu"
                                />
                            </div>

                            {/* Phone with Country Code Flag Picker */}
                            <div className="form-group">
                                <label htmlFor="phone">Phone Number *</label>
                                <div className="phone-input-row">
                                    <CountryCodeDropdown
                                        value={formData.countryCode}
                                        onChange={(val) => setFormData(prev => ({ ...prev, countryCode: val }))}
                                    />
                                    <input
                                        type="tel"
                                        id="phone"
                                        name="phone"
                                        value={formData.phone}
                                        onChange={handleInputChange}
                                        placeholder="234 567 8900"
                                        required
                                        className="phone-number-field"
                                    />
                                </div>
                            </div>

                            {/* Country Dropdown */}
                            <div className="form-group">
                                <label htmlFor="country">Country / Region *</label>
                                <select
                                    id="country"
                                    name="country"
                                    value={formData.country}
                                    onChange={handleInputChange}
                                    required
                                >
                                    <option value="">Select a country</option>
                                    {ALL_COUNTRIES.map((country) => (
                                        <option key={country} value={country}>
                                            {country}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* Conference Event Preview Tile (left image, right info) */}
                            <div className="registration-event-tile">
                                {conf.image && (
                                    <div className="registration-event-img-wrap">
                                        <img
                                            src={`/conferences_imgs/${conf.image}`}
                                            alt={conf.title}
                                            className="registration-event-img"
                                            onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&q=80'; }}
                                        />
                                    </div>
                                )}
                                <div className="registration-event-info">
                                    <span className="registration-conf-eyebrow">SELECTED CONFERENCE</span>
                                    <h4 className="registration-conf-title" title={conf.title}>
                                        {conf.title}
                                    </h4>
                                    <div className="registration-conf-meta">
                                        {conf.date && (
                                            <span className="meta-badge">
                                                <Calendar size={13} className="meta-icon" />
                                                <span>{conf.date}</span>
                                            </span>
                                        )}
                                        {conf.location && (
                                            <span className="meta-badge">
                                                <MapPin size={13} className="meta-icon" />
                                                <span>{conf.location}</span>
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {step1Error && (
                            <div className="step-error-banner">
                                ⚠️ {step1Error}
                            </div>
                        )}

                        {/* Desktop Submit Button (Left Column) */}
                        <div className="submit-btn-wrap desktop-only-submit">
                            <button
                                type="submit"
                                className="submit-registration-btn"
                                disabled={isSubmitting}
                            >
                                {isSubmitting ? 'Processing Enrollment...' : 'Proceed to Payment & Confirm Registration'}
                            </button>
                        </div>

                        {/* Mobile Step 1 Continue Button */}
                        <div className="submit-btn-wrap mobile-only-submit">
                            <button
                                type="button"
                                className="mobile-glassy-btn"
                                onClick={handleContinueToSummary}
                            >
                                <span>Continue to Order Summary</span>
                                <ArrowRight size={16} className="glassy-btn-arrow" />
                            </button>
                            <div className="mobile-step-hint">
                                <span>Step 1 of 2 • Review package & pricing next</span>
                            </div>
                        </div>
                    </div>

                    {/* Right Column: Order Summary showing selected package details */}
                    <div className={`registration-summary-section ${mobileStep === 2 ? 'mobile-step-active' : 'mobile-step-hidden'}`}>
                        <div className="step2-nav-bar mobile-only-flex">
                            <button
                                type="button"
                                className="btn-step-back"
                                onClick={() => {
                                    setMobileStep(1);
                                    window.scrollTo({ top: 100, behavior: 'smooth' });
                                }}
                            >
                                <ArrowLeft size={14} className="step-back-arrow" />
                                <span>Back to Details</span>
                            </button>
                            <span className="step2-badge">Step 2 of 2</span>
                        </div>

                        <h2>Order Summary</h2>

                        {/* Mobile Attendee Recap Card (Mobile Only) */}
                        <div className="mobile-attendee-recap mobile-only-flex">
                            <div className="recap-header">
                                <User size={13} className="recap-icon" />
                                <span>ATTENDEE RECAP</span>
                                <button
                                    type="button"
                                    className="recap-edit-btn"
                                    onClick={() => {
                                        setMobileStep(1);
                                        window.scrollTo({ top: 100, behavior: 'smooth' });
                                    }}
                                >
                                    Edit
                                </button>
                            </div>
                            <div className="recap-body">
                                <div className="recap-item">
                                    <span className="recap-lbl">Name:</span>
                                    <span className="recap-val">{formData.name || 'Not provided'}</span>
                                </div>
                                <div className="recap-item">
                                    <span className="recap-lbl">Email:</span>
                                    <span className="recap-val">{formData.email || 'Not provided'}</span>
                                </div>
                                <div className="recap-item">
                                    <span className="recap-lbl">Phone:</span>
                                    <span className="recap-val">{formData.countryCode} {formData.phone || '—'}</span>
                                </div>
                                <div className="recap-item">
                                    <span className="recap-lbl">Country:</span>
                                    <span className="recap-val">{formData.country || '—'}</span>
                                </div>
                            </div>
                        </div>

                        {currentPackage ? (
                            <div className="summary-card">
                                <h3>{currentPackage.packageName}</h3>
                                <div className="summary-price">
                                    ${currentPackage.price}
                                    <span className="summary-price-tax">USD</span>
                                </div>

                                <div className="summary-features-header">Package Inclusions:</div>
                                <ul className="summary-features">
                                    {currentPackage.offers.map((feat, index) => (
                                        <li key={index}>{feat}</li>
                                    ))}
                                </ul>

                                <div className="summary-line-items">
                                    <div className="summary-line-row">
                                        <span>Package Registration</span>
                                        <span>${currentPackage.price}.00</span>
                                    </div>
                                    <div className="summary-line-row">
                                        <span>Conference Kit & Badge</span>
                                        <span className="free-badge">Included</span>
                                    </div>
                                    <div className="summary-line-row">
                                        <span>Catering / Session Access</span>
                                        <span className="free-badge">Included</span>
                                    </div>
                                </div>

                                <div className="summary-total">
                                    <span>Total Amount:</span>
                                    <span className="total-val">${currentPackage.price} USD</span>
                                </div>
                            </div>
                        ) : (
                            <p>Please select a package.</p>
                        )}

                        {/* Mobile Submit Button: Placed after Order Summary */}
                        <div className="submit-btn-wrap mobile-only-submit">
                            <button
                                type="submit"
                                className="mobile-glassy-btn"
                                disabled={isSubmitting}
                            >
                                <CreditCard size={18} className="glassy-btn-icon" />
                                <span>{isSubmitting ? 'Processing Payment...' : 'Proceed to Payment'}</span>
                                <ArrowRight size={16} className="glassy-btn-arrow" />
                            </button>
                            <div className="mobile-payment-subtext">
                                <ShieldCheck size={13} className="subtext-icon" />
                                <span>256-Bit SSL Encrypted • Official Portal</span>
                            </div>
                        </div>
                    </div>
                </form>
            </div>
        </BeamsBackground>
    );
}
