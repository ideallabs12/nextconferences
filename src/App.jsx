import React from 'react';
import { BrowserRouter as Router, Route, Link, useLocation } from 'react-router-dom';
import TransitionRoutes from './components/TransitionRoutes.jsx';

const PAGE_NAMES = {
  '/': 'Home',
  '/second-home': 'Second Home',
  '/second_next_home': 'Second Home',
  '/conferences': 'Conferences',
  '/speakers': 'Speakers',
  '/magazines': 'Magazines',
  '/gallery': 'Gallery',
  '/aboutus': 'About Us',
  '/contactus': 'Contact Us',
  '/committee': 'Committee',
  '/faqs': 'FAQs',
  '/privacypolicy': 'Privacy Policy',
  '/termsandconditions': 'Terms & Conditions',
  '/register': 'Register',
};

import Home from './pages/home/Home.jsx';
import SecondHome from './pages/second_next_home/SecondHome.jsx';
import Conferences from './pages/conferences/Conferences.jsx';
import Speakers from './pages/speakers/Speakers.jsx';
import SpeakerDetail from './pages/speakers/SpeakerDetail.jsx';
import Gallery from './pages/gallery/Gallery.jsx';
import ContactUs from './pages/contactus/Contactus.jsx';
import AboutUs from './pages/aboutus/Aboutus.jsx';

import ConferenceDetail from './pages/conferences/ConferenceDetail.jsx';
import Register from './pages/register/Register.jsx';
import Magazines from './pages/magazines/Magazines.jsx';
import MagazineDetail from './pages/magazines/MagazineDetail.jsx';

import Committee from './pages/committee/Committee.jsx';
import FAQs from './pages/faqs/Faqs.jsx';
import PrivacyPolicy from './pages/privacypolicy/Privacypolicy.jsx';
import TermsAndConditions from './pages/termsandconditions/Termsandconditions.jsx';

import logoImage from './assets/logo.png';
import Navbar from './components/Navbar.jsx';
import ProceduralGroundBackground from './components/ProceduralGroundBackground.jsx';
import './App.css';

import Footer from './components/Footer.jsx';

function AppContent() {
  const location = useLocation();
  const isSecondHome =
    location.pathname === '/second-home' ||
    location.pathname === '/second_next_home';

  return (
    <div className={`app-container ${isSecondHome ? 'is-second-home-layout' : ''}`}>
      {!isSecondHome && <ProceduralGroundBackground />}
      {!isSecondHome && <Navbar />}
      <main className="main-content">
        <TransitionRoutes names={PAGE_NAMES}>
          <Route path="/" element={<Home />} />
          <Route path="/second-home" element={<SecondHome />} />
          <Route path="/second_next_home" element={<SecondHome />} />
          <Route path="/conferences" element={<Conferences />} />
          <Route path="/conference/:slug" element={<ConferenceDetail />} />
          <Route path="/conference/:slug/register" element={<Register />} />
          <Route path="/register/:slug" element={<Register />} />
          <Route path="/register" element={<Register />} />
          <Route path="/speakers" element={<Speakers />} />
          <Route path="/speakers/:slug" element={<SpeakerDetail />} />
          <Route path="/speaker/:slug" element={<SpeakerDetail />} />
          <Route path="/magazines" element={<Magazines />} />
          <Route path="/magazines/:id" element={<MagazineDetail />} />
          <Route path="/gallery" element={<Gallery />} />
          <Route path="/contactus" element={<ContactUs />} />
          <Route path="/aboutus" element={<AboutUs />} />
          
          <Route path="/committee" element={<Committee />} />
          <Route path="/faqs" element={<FAQs />} />
          <Route path="/privacypolicy" element={<PrivacyPolicy />} />
          <Route path="/termsandconditions" element={<TermsAndConditions />} />
        </TransitionRoutes>
      </main>
      {!isSecondHome && <Footer />}
    </div>
  );
}

function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

export default App;
