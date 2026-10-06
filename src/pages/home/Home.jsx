import React from 'react';
import ConferenceHero from '../../components/ConferenceHero';
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
            
            <ConferenceFeatures />
            
            <UpcomingConferences />
            
            <AboutBento />
            
            <HomeGallery />
            
            <HomeSpeakers />
            
            <Testimonials />
            
            {/* The rest of the home page content will go here below the 100vh hero */}
        </div>
    );
};

export default Home;
