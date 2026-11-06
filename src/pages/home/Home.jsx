import React, { useState, useEffect } from 'react';
import ConferenceHero from '../../components/ConferenceHero';
import StatBar from '../../components/StatBar';
import ConferenceFeatures from '../../components/ConferenceFeatures';
import UpcomingConferences from '../../components/UpcomingConferences';
import AboutBento from '../../components/AboutBento';
import HomeGallery from '../../components/HomeGallery';
import HomeSpeakers from '../../components/HomeSpeakers';
import Testimonials from '../../components/Testimonials';
import './home.css';

const Home = () => {
  const [isLightMode, setIsLightMode] = useState(() => {
    return localStorage.getItem('next_home_theme') === 'light';
  });

  useEffect(() => {
    const handleThemeChange = (e) => {
      const mode = e.detail || (localStorage.getItem('next_home_theme') === 'light' ? 'light' : 'dark');
      setIsLightMode(mode === 'light');
    };
    window.addEventListener('next-theme-change', handleThemeChange);
    window.addEventListener('storage', handleThemeChange);
    return () => {
      window.removeEventListener('next-theme-change', handleThemeChange);
      window.removeEventListener('storage', handleThemeChange);
    };
  }, []);

  const toggleTheme = () => {
    setIsLightMode((prev) => {
      const next = !prev;
      const themeVal = next ? 'light' : 'dark';
      localStorage.setItem('next_home_theme', themeVal);
      window.dispatchEvent(new CustomEvent('next-theme-change', { detail: themeVal }));
      return next;
    });
  };

  return (
    <div className={`home-page ${isLightMode ? 'light-mode' : ''}`}>
      <ConferenceHero />

      <StatBar />

      <UpcomingConferences />

      <ConferenceFeatures />

      <AboutBento />

      <HomeGallery />

      <HomeSpeakers />

      <Testimonials />
    </div>
  );
};

export default Home;
