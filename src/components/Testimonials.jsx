import React from 'react';
import './Testimonials.css';

const testimonialsData = [
    {
        id: 1,
        quote: "NEXT Premier League Conferences brings together brilliant minds from around the world. It was an honor to share my insights and learn from fellow global experts.",
        name: "Jonathan Miles"
    },
    {
        id: 2,
        quote: "Speaking at NEXT Premier League Conferences was a phenomenal experience. The audience was diverse and deeply engaged, and the event was flawlessly organized.",
        name: "Dr. Carla Martínez"
    },
    {
        id: 3,
        quote: "Being part of a NEXT Premier League Conference event was truly rewarding. It’s a space where knowledge flows freely and global collaboration begins.",
        name: "David Lee"
    }
];

const StarRating = () => (
    <div className="stars-container">
        {[1, 2, 3, 4, 5].map((star) => (
            <svg key={star} width="22" height="20" viewBox="0 0 22 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M10.525.464a.5.5 0 0 1 .95 0l2.107 6.482a.5.5 0 0 0 .475.346h6.817a.5.5 0 0 1 .294.904l-5.515 4.007a.5.5 0 0 0-.181.559l2.106 6.483a.5.5 0 0 1-.77.559l-5.514-4.007a.5.5 0 0 0-.588 0l-5.514 4.007a.5.5 0 0 1-.77-.56l2.106-6.482a.5.5 0 0 0-.181-.56L.832 8.197a.5.5 0 0 1 .294-.904h6.817a.5.5 0 0 0 .475-.346z" fill="#00d2ff"/>
            </svg>
        ))}
    </div>
);

const TestimonialCard = ({ testimonial }) => (
    <div className="testimonial-card">
        <div className="testimonial-content">
            <StarRating />
            <p className="testimonial-quote">"{testimonial.quote}"</p>
        </div>
        <div className="testimonial-author">
            <h4 className="testimonial-name">— {testimonial.name}</h4>
        </div>
    </div>
);

const Testimonials = () => {
    return (
        <section className="testimonials-section">
            <div className="testimonials-container">
                <div className="testimonials-header">
                    <span className="testimonials-eyebrow">TESTIMONIALS</span>
                    <h2 className="testimonials-title">What They <span className="text-gradient">Say</span></h2>
                    <p className="testimonials-subtitle">
                        Hear from the thought leaders and experts who have experienced our conferences firsthand.
                    </p>
                </div>
                
                <div className="testimonials-scroll-wrapper">
                    <div className="testimonials-scroll-track">
                        {/* Group 1 */}
                        <div className="testimonials-scroll-group">
                            {testimonialsData.map((testimonial) => (
                                <TestimonialCard key={`g1-${testimonial.id}`} testimonial={testimonial} />
                            ))}
                        </div>
                        {/* Group 2 (Duplicate for seamless loop) */}
                        <div className="testimonials-scroll-group">
                            {testimonialsData.map((testimonial) => (
                                <TestimonialCard key={`g2-${testimonial.id}`} testimonial={testimonial} />
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default Testimonials;
