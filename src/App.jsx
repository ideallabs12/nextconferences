import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import ScrollToTop from './components/ScrollToTop.jsx';

import Home from './pages/home/Home.jsx';
import Conferences from './pages/conferences/Conferences.jsx';
import Speakers from './pages/speakers/Speakers.jsx';
import Gallery from './pages/gallery/Gallery.jsx';
import ContactUs from './pages/contactus/ContactUs.jsx';
import AboutUs from './pages/aboutus/AboutUs.jsx';

import ConferenceDetail from './pages/conferences/ConferenceDetail.jsx';

import Committee from './pages/committee/Committee.jsx';
import FAQs from './pages/faqs/Faqs.jsx';
import PrivacyPolicy from './pages/privacypolicy/PrivacyPolicy.jsx';
import TermsAndConditions from './pages/termsandconditions/TermsAndConditions.jsx';

import logoImage from './assets/logo.png';
import Navbar from './components/Navbar.jsx';
import ProceduralGroundBackground from './components/ProceduralGroundBackground.jsx';
import './App.css';

import Footer from './components/Footer.jsx';

function App() {
  return (
    <Router>
      <ScrollToTop />
      <div className="app-container">
        <ProceduralGroundBackground />
        <Navbar />
        <main className="main-content">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/conferences" element={<Conferences />} />
            <Route path="/conference/:slug" element={<ConferenceDetail />} />
            <Route path="/speakers" element={<Speakers />} />
            <Route path="/gallery" element={<Gallery />} />
            <Route path="/contactus" element={<ContactUs />} />
            <Route path="/aboutus" element={<AboutUs />} />
            
            <Route path="/committee" element={<Committee />} />
            <Route path="/faqs" element={<FAQs />} />
            <Route path="/privacypolicy" element={<PrivacyPolicy />} />
            <Route path="/termsandconditions" element={<TermsAndConditions />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </Router>
  );
}

export default App;
