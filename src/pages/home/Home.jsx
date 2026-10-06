import React from 'react';
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
    return (
        <div className="home-page">
            <ConferenceHero />
            
            <StatBar />
            
            <UpcomingConferences />
            
            <ConferenceFeatures />
            
            <AboutBento />
            
            <HomeGallery />
            
            <HomeSpeakers />
            
            <Testimonials />
            
            {/* The rest of the home page content will go here below the 100vh hero */}
        </div>
    );
};

export default Home;
