import React from 'react';
import './SecondTestimonials.css';

const testimonialsData = [
  {
    id: 1,
    initials: 'JM',
    name: 'Jonathan Miles',
    role: 'Global Summit Speaker',
    quote:
      'NEXT Premier League Conferences brings together brilliant minds from around the world. It was an honor to share my insights and learn from fellow global experts.',
  },
  {
    id: 2,
    initials: 'CM',
    name: 'Dr. Carla Martínez',
    role: 'Keynote Panelist',
    quote:
      'Speaking at NEXT Premier League Conferences was a phenomenal experience. The audience was diverse and deeply engaged, and the event was flawlessly organized.',
  },
  {
    id: 3,
    initials: 'DL',
    name: 'David Lee',
    role: 'Featured Speaker',
    quote:
      'Being part of a NEXT Premier League Conference event was truly rewarding. It’s a space where knowledge flows freely and global collaboration begins.',
  },
];

function AppleStarRating({ uid }) {
  return (
    <div className="stesti-stars" aria-label="5 out of 5 stars">
      <svg width="0" height="0" className="stesti-grad-def" aria-hidden="true">
        <defs>
          <linearGradient id={`stesti-star-${uid}`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#1f3bff" />
            <stop offset="60%" stopColor="#2f7bff" />
            <stop offset="100%" stopColor="#00b4d8" />
          </linearGradient>
        </defs>
      </svg>
      {[1, 2, 3, 4, 5].map((star) => (
        <svg
          key={star}
          width="17"
          height="16"
          viewBox="0 0 22 20"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M10.525.464a.5.5 0 0 1 .95 0l2.107 6.482a.5.5 0 0 0 .475.346h6.817a.5.5 0 0 1 .294.904l-5.515 4.007a.5.5 0 0 0-.181.559l2.106 6.483a.5.5 0 0 1-.77.559l-5.514-4.007a.5.5 0 0 0-.588 0l-5.514 4.007a.5.5 0 0 1-.77-.56l2.106-6.482a.5.5 0 0 0-.181-.56L.832 8.197a.5.5 0 0 1 .294-.904h6.817a.5.5 0 0 0 .475-.346z"
            fill={`url(#stesti-star-${uid})`}
          />
        </svg>
      ))}
    </div>
  );
}

function TestimonialGlassCard({ testimonial, groupKey }) {
  return (
    <article className="stesti-card">
      <div className="stesti-card-top">
        <AppleStarRating uid={`${groupKey}-${testimonial.id}`} />
        <span className="stesti-quote-mark" aria-hidden="true">
          &ldquo;
        </span>
      </div>

      <p className="stesti-quote">&ldquo;{testimonial.quote}&rdquo;</p>

      <div className="stesti-author">
        <span className="stesti-avatar" aria-hidden="true">
          {testimonial.initials}
        </span>
        <div className="stesti-author-meta">
          <h4 className="stesti-name">{testimonial.name}</h4>
          <span className="stesti-role">{testimonial.role}</span>
        </div>
      </div>
    </article>
  );
}

export default function SecondTestimonials() {
  return (
    <section className="second-testi-section" id="testimonials">
      <div className="second-testi-bg" aria-hidden="true" />

      <div className="second-testi-container">
        <header className="second-testi-header">
          <span className="second-testi-eyebrow">TESTIMONIALS</span>
          <h2 className="second-testi-title">
            What They <span className="sh-testi-gradient">Say</span>
          </h2>
          <p className="second-testi-subtitle">
            Hear from the thought leaders and experts who have experienced our
            conferences firsthand.
          </p>
        </header>

        <div className="stesti-marquee">
          <div className="stesti-track">
            <div className="stesti-group">
              {testimonialsData.map((t) => (
                <TestimonialGlassCard
                  key={`g1-${t.id}`}
                  testimonial={t}
                  groupKey="g1"
                />
              ))}
            </div>
            <div className="stesti-group" aria-hidden="true">
              {testimonialsData.map((t) => (
                <TestimonialGlassCard
                  key={`g2-${t.id}`}
                  testimonial={t}
                  groupKey="g2"
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

