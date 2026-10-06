import React from 'react';
import { Link } from 'react-router-dom';
import './ConferenceHero.css';

const ConferenceHero = ({

  titleLine1 = "NEXT",
  titleLine2 = "PREMIER LEAGUE",
  titleHighlight = "CONFERENCES",
  description = "World-class conferences bringing together visionaries, industry leaders and changemakers.",
  ctaText = "EXPLORE EVENTS",
  ctaLink = "/conferences",
  date = "APR 24–26, 2025",
  location = "LONDON, UK",
  attendees = "5,000+ ATTENDEES",
  backgroundImage = "/images/hero_background.png"
}) => {
  return (
    <section className="conference-hero">
      <div className="hero-background">
        <img 
            src={backgroundImage} 
            className="hero-image" 
            alt="Conference Background" 
        />
        <div className="hero-overlay hero-overlay-back" />
        <div className="hero-overlay hero-overlay-main" />
        <div className="hero-overlay hero-overlay-front" />
      </div>

      <div className="hero-content-wrapper">
        <div className="hero-text-content">

          <h1 className="hero-main-title">
            {titleLine1} <br />
            {titleLine2} <br />
            <span className="hero-highlight">{titleHighlight}</span>
          </h1>
          <p className="hero-main-description">
            {description}
          </p>
        </div>
      </div>
    </section>
  );
};

export default ConferenceHero;
