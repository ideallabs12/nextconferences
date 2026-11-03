import React, { useState, useEffect } from 'react';
import './faqs.css';
import faqsData from './faqs.json';
import { fetchFaqsFromSupabase } from '../../lib/supabase.js';

const Faqs = () => {
    const [faqsList, setFaqsList] = useState(faqsData.faqs || []);
    const [activeIndex, setActiveIndex] = useState(null);

    useEffect(() => {
        fetchFaqsFromSupabase()
            .then(data => {
                if (data && data.length > 0) setFaqsList(data);
            })
            .catch(() => {});
    }, []);

    const toggleFaq = (index) => {
        setActiveIndex(activeIndex === index ? null : index);
    };

    return (
        <div className="faqs-page-wrapper">
            <div className="faqs-container">
                <div className="faqs-header">
                    <h1 className="faqs-title">Frequently Asked Questions</h1>
                    <p className="faqs-subtitle">
                        Find answers to all your questions about NEXT International Conferences.
                    </p>
                </div>
                
                <div className="faqs-list">
                    {faqsList.map((faq, index) => (
                        <div 
                            key={index} 
                            className={`faq-item ${activeIndex === index ? 'active' : ''}`}
                            onClick={() => toggleFaq(index)}
                        >
                            <div className="faq-question-bar">
                                <h3 className="faq-question">{faq.question}</h3>
                                <div className="faq-icon-wrapper">
                                    <svg 
                                        className="faq-icon" 
                                        viewBox="0 0 24 24" 
                                        fill="none" 
                                        stroke="currentColor" 
                                        strokeWidth="2" 
                                        strokeLinecap="round" 
                                        strokeLinejoin="round"
                                    >
                                        <polyline points="6 9 12 15 18 9"></polyline>
                                    </svg>
                                </div>
                            </div>
                            <div className="faq-answer-wrapper">
                                <div className="faq-answer">
                                    {faq.answer}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default Faqs;
