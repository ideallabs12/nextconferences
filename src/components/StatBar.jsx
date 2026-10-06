import React from 'react';
import './StatBar.css';

const StatBar = () => {
  const stats = [
    { value: '10+', label: 'Years Experience' },
    { value: '50+', label: 'Global Events' },
    { value: '10k+', label: 'Attendees' },
    { value: '500+', label: 'Speakers' },
  ];

  return (
    <div className="stat-bar-container">
      <div className="stat-bar">
        {stats.map((stat, index) => (
          <div key={index} className="stat-item">
            <span className="stat-value">{stat.value}</span>
            <span className="stat-label">{stat.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default StatBar;
