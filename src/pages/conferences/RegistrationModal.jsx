import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { X, Check, ShieldCheck, Mail, Phone, Globe, User, Calendar, MapPin, ArrowRight } from 'lucide-react';
import './registrationModal.css';

const RegistrationModal = ({ isOpen, onClose, selectedPackage, conference }) => {
    const [formData, setFormData] = useState({
        fullName: '',
        email: '',
        phone: '',
        country: ''
    });

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);
    const [registrationId, setRegistrationId] = useState('');

    if (!isOpen || !selectedPackage || !conference) return null;


    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        setIsSubmitting(true);

        setTimeout(() => {
            const randomCode = Math.floor(100000 + Math.random() * 900000);
            const prefix = conference.slug ? conference.slug.toUpperCase().slice(0, 4) : 'CONF';
            setRegistrationId(`NEXT-${prefix}-${randomCode}`);
            setIsSubmitting(false);
            setIsSuccess(true);
        }, 800);
    };

    const handleResetAndClose = () => {
        setIsSuccess(false);
        setFormData({
            fullName: '',
            email: '',
            phone: '',
            country: ''
        });
        onClose();
    };

    return createPortal(
        <div className="reg-modal-backdrop" onClick={handleResetAndClose}>
            <div className="reg-modal-wrapper" onClick={(e) => e.stopPropagation()}>
                <button className="reg-modal-close" onClick={handleResetAndClose} aria-label="Close modal">
                    <X size={20} />
                </button>

                {isSuccess ? (
                    <div className="reg-modal-success">
                        <div className="reg-success-icon-wrap">
                            <Check size={40} className="reg-success-icon" />
                        </div>
                        <h2 className="reg-success-title">Registration Submitted!</h2>
                        <p className="reg-success-sub">
                            Thank you, <strong>{formData.fullName}</strong>. Your registration for <strong>{selectedPackage.packageName}</strong> has been received.
                        </p>

                        <div className="reg-success-card">
                            <div className="reg-success-row">
                                <span className="reg-success-label">Registration ID</span>
                                <span className="reg-success-code">{registrationId}</span>
                            </div>
                            <div className="reg-success-row">
                                <span className="reg-success-label">Conference</span>
                                <span className="reg-success-val">{conference.title}</span>
                            </div>
                            <div className="reg-success-row">
                                <span className="reg-success-label">Package</span>
                                <span className="reg-success-val">{selectedPackage.packageName}</span>
                            </div>
                            <div className="reg-success-row">
                                <span className="reg-success-label">Fee Payable</span>
                                <span className="reg-success-val highlight">
                                    {selectedPackage.price !== null ? `$${selectedPackage.price} USD` : 'Delegate Invoicing / Contact'}
                                </span>
                            </div>
                            <div className="reg-success-row">
                                <span className="reg-success-label">Confirmation Email</span>
                                <span className="reg-success-val">{formData.email}</span>
                            </div>
                        </div>

                        <div className="reg-payment-note">
                            <ShieldCheck size={18} className="reg-shield-icon" />
                            <span>
                                An official invoice with Stripe, PayPal, and wire transfer payment details has been routed to your email. Our secretariat will follow up within 24 hours.
                            </span>
                        </div>

                        <div className="reg-success-actions">
                            <button className="reg-btn-submit" onClick={handleResetAndClose}>
                                Done
                            </button>
                        </div>
                    </div>
                ) : (
                    <div className="reg-modal-content">
                        <div className="reg-modal-header">
                            <span className="reg-modal-eyebrow">REGISTRATION ENROLLMENT</span>
                            <h2 className="reg-modal-title">{conference.title}</h2>
                            <div className="reg-modal-meta">
                                <span><Calendar size={14} /> {conference.date}</span>
                                <span><MapPin size={14} /> {conference.location}</span>
                            </div>
                        </div>

                        <div className="reg-package-banner">
                            <div className="reg-package-info">
                                <span className="reg-package-tag">Selected Package</span>
                                <h3 className="reg-package-name">{selectedPackage.packageName}</h3>
                            </div>
                            <div className="reg-package-price-wrap">
                                {selectedPackage.price !== null ? (
                                    <>
                                        <span className="reg-price-currency">$</span>
                                        <span className="reg-price-amount">{selectedPackage.price}</span>
                                        <span className="reg-price-tax">USD</span>
                                    </>
                                ) : (
                                    <span className="reg-price-inquire">Inquire / Custom</span>
                                )}
                            </div>
                        </div>

                        <form className="reg-form" onSubmit={handleSubmit}>
                            <h4 className="reg-section-heading">Attendee Details</h4>

                            <div className="reg-form-grid">
                                <div className="reg-field">
                                    <label htmlFor="fullName">
                                        <User size={14} /> Full Name <span className="required">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        id="fullName"
                                        name="fullName"
                                        placeholder="Dr. / Prof. / Mr. / Ms."
                                        required
                                        value={formData.fullName}
                                        onChange={handleChange}
                                    />
                                </div>

                                <div className="reg-field">
                                    <label htmlFor="email">
                                        <Mail size={14} /> Email Address <span className="required">*</span>
                                    </label>
                                    <input
                                        type="email"
                                        id="email"
                                        name="email"
                                        placeholder="yourname@institution.org"
                                        required
                                        value={formData.email}
                                        onChange={handleChange}
                                    />
                                </div>

                                <div className="reg-field">
                                    <label htmlFor="phone">
                                        <Phone size={14} /> Phone / WhatsApp <span className="required">*</span>
                                    </label>
                                    <input
                                        type="tel"
                                        id="phone"
                                        name="phone"
                                        placeholder="+1 (555) 000-0000"
                                        required
                                        value={formData.phone}
                                        onChange={handleChange}
                                    />
                                </div>



                                <div className="reg-field reg-field-full">
                                    <label htmlFor="country">
                                        <Globe size={14} /> Country / Region <span className="required">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        id="country"
                                        name="country"
                                        placeholder="e.g. United States, France, Japan"
                                        required
                                        value={formData.country}
                                        onChange={handleChange}
                                    />
                                </div>


                            </div>

                            <div className="reg-form-footer">
                                <div className="reg-security-badge">
                                    <ShieldCheck size={16} />
                                    <span>Verified Secure Registration</span>
                                </div>
                                <div className="reg-buttons-row">
                                    <button
                                        type="button"
                                        className="reg-btn-cancel"
                                        onClick={handleResetAndClose}
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        className="reg-btn-submit"
                                        disabled={isSubmitting}
                                    >
                                        {isSubmitting ? (
                                            'Processing...'
                                        ) : (
                                            <>
                                                Confirm & Register <ArrowRight size={16} />
                                            </>
                                        )}
                                    </button>
                                </div>
                            </div>
                        </form>
                    </div>
                )}
            </div>
        </div>,
        document.body
    );
};

export default RegistrationModal;
