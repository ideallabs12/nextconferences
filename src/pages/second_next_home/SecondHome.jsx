import React, { useState, useEffect } from 'react';
import { Sun, Moon } from 'lucide-react';
import SecondHero from './SecondHero.jsx';
import SecondWhyJoinUs from './SecondWhyJoinUs.jsx';
import SecondUpcomingConferences from './SecondUpcomingConferences.jsx';
import SecondAboutNext from './SecondAboutNext.jsx';
import SecondExperienceNext from './SecondExperienceNext.jsx';
import SecondSpeakers from './SecondSpeakers.jsx';
import SecondTestimonials from './SecondTestimonials.jsx';
import SecondFooter from './SecondFooter.jsx';
import './SecondHome.css';

const SecondHome = () => {
  const [isDarkMode, setIsDarkMode] = useState(() => {
    return localStorage.getItem('next_second_home_theme') === 'dark';
  });

  useEffect(() => {
    const handleThemeChange = (e) => {
      const mode =
        e.detail ||
        (localStorage.getItem('next_second_home_theme') === 'dark'
          ? 'dark'
          : 'light');
      setIsDarkMode(mode === 'dark');
    };

    window.addEventListener('second-theme-change', handleThemeChange);
    window.addEventListener('storage', handleThemeChange);
    return () => {
      window.removeEventListener('second-theme-change', handleThemeChange);
      window.removeEventListener('storage', handleThemeChange);
    };
  }, []);

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('second-dark-mode');
      document.body.style.backgroundColor = '#050814';
    } else {
      document.documentElement.classList.remove('second-dark-mode');
      document.body.style.backgroundColor = '#ffffff';
    }
    return () => {
      document.documentElement.classList.remove('second-dark-mode');
      document.body.style.backgroundColor = '';
    };
  }, [isDarkMode]);

  const toggleTheme = (e) => {
    if (e && e.preventDefault) {
      e.preventDefault();
    }
    const nextMode = !isDarkMode;
    setIsDarkMode(nextMode);
    const themeVal = nextMode ? 'dark' : 'light';
    try {
      localStorage.setItem('next_second_home_theme', themeVal);
    } catch {
      // ignore local storage errors
    }
    window.dispatchEvent(
      new CustomEvent('second-theme-change', { detail: themeVal })
    );
  };

  return (
    <div
      className={`second-home-page ${
        isDarkMode ? 'dark-mode' : 'light-mode'
      }`}
    >
      {/* Floating Apple Glass Theme Switch */}
      <button
        type="button"
        className="second-home-float-toggle"
        onClick={toggleTheme}
        aria-label={`Switch to ${isDarkMode ? 'light' : 'dark'} mode`}
        title={`Switch to ${isDarkMode ? 'light' : 'dark'} mode`}
      >
        <span className="sh-float-icon">
          {isDarkMode ? (
            <Sun size={15} strokeWidth={2.4} />
          ) : (
            <Moon size={15} strokeWidth={2.4} />
          )}
        </span>
        <span className="sh-float-text">
          {isDarkMode ? 'Light Mode' : 'Dark Mode'}
        </span>
      </button>

      <SecondHero isDarkMode={isDarkMode} toggleTheme={toggleTheme} />
      <SecondWhyJoinUs />
      <SecondUpcomingConferences isDarkMode={isDarkMode} />
      <SecondAboutNext />
      <SecondExperienceNext />
      <SecondSpeakers />
      <SecondTestimonials />
      <SecondFooter />
    </div>
  );
};

export default SecondHome;
