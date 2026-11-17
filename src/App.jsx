import React, { Suspense, lazy, useEffect } from 'react';
import { BrowserRouter as Router, Route, useLocation, Navigate } from 'react-router-dom';
import TransitionRoutes from './components/TransitionRoutes.jsx';
// Note: The letters & alphabet storm animation is preserved in:
// import TransitionRoutes from './components/TransitionRoutesPoster.jsx';

const PAGE_NAMES = {
  '/': 'Home',
  '/second-home': 'Second Home',
  '/second_next_home': 'Second Home',
  '/conferences': 'Conferences',
  '/conference': 'Conferences',
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
  '/cms': 'CMS Portal',
  '/admin': 'CMS Portal',
};

// Keep primary landing pages eagerly loaded for instant first paint
import Home from './pages/home/Home.jsx';
import SecondHome from './pages/second_next_home/SecondHome.jsx';

// Lazy-load secondary routes so initial bundle stays small and fast
const Conferences = lazy(() => import('./pages/conferences/Conferences.jsx'));
const ConferenceDetail = lazy(() => import('./pages/conferences/ConferenceDetail.jsx'));
const Register = lazy(() => import('./pages/register/Register.jsx'));
const Speakers = lazy(() => import('./pages/speakers/Speakers.jsx'));
const SpeakerDetail = lazy(() => import('./pages/speakers/SpeakerDetail.jsx'));
const Magazines = lazy(() => import('./pages/magazines/Magazines.jsx'));
const MagazineDetail = lazy(() => import('./pages/magazines/MagazineDetail.jsx'));
const Gallery = lazy(() => import('./pages/gallery/Gallery.jsx'));
const ContactUs = lazy(() => import('./pages/contactus/Contactus.jsx'));
const AboutUs = lazy(() => import('./pages/aboutus/Aboutus.jsx'));
const Committee = lazy(() => import('./pages/committee/Committee.jsx'));
const FAQs = lazy(() => import('./pages/faqs/Faqs.jsx'));
const PrivacyPolicy = lazy(() => import('./pages/privacypolicy/Privacypolicy.jsx'));
const TermsAndConditions = lazy(() => import('./pages/termsandconditions/Termsandconditions.jsx'));
const CmsPortal = lazy(() => import('./pages/cms/CmsPortal.jsx'));

import Navbar from './components/Navbar.jsx';
import ProceduralGroundBackground from './components/ProceduralGroundBackground.jsx';
import Footer from './components/Footer.jsx';
import './App.css';

function AppContent() {
  const location = useLocation();
  const isCms =
    location.pathname.startsWith('/cms') ||
    location.pathname.startsWith('/admin');
  const isSecondHome =
    location.pathname === '/second-home' ||
    location.pathname === '/second_next_home';

  // Silently warm up main navigation chunks during browser idle time after initial load
  useEffect(() => {
    const prefetch = () => {
      import('./pages/conferences/Conferences.jsx');
      import('./pages/speakers/Speakers.jsx');
      import('./pages/magazines/Magazines.jsx');
      import('./pages/gallery/Gallery.jsx');
      import('./pages/aboutus/Aboutus.jsx');
    };
    if (typeof window !== 'undefined' && 'requestIdleCallback' in window) {
      const id = window.requestIdleCallback(prefetch, { timeout: 2500 });
      return () => window.cancelIdleCallback(id);
    } else {
      const t = setTimeout(prefetch, 1800);
      return () => clearTimeout(t);
    }
  }, []);

  if (isCms) {
    return (
      <Suspense fallback={null}>
        <CmsPortal />
      </Suspense>
    );
  }

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
          <Route path="/conference" element={<Navigate to="/conferences" replace />} />
          <Route path="/conference/:slug" element={<ConferenceDetail />} />
          <Route path="/conference/:slug/register" element={<Register />} />
          <Route path="/register/:slug" element={<Register />} />
          <Route path="/register" element={<Register />} />
          <Route path="/speakers" element={<Speakers />} />
          <Route path="/speaker" element={<Navigate to="/speakers" replace />} />
          <Route path="/speakers/:slug" element={<SpeakerDetail />} />
          <Route path="/speaker/:slug" element={<SpeakerDetail />} />
          <Route path="/magazines" element={<Magazines />} />
          <Route path="/magazine" element={<Navigate to="/magazines" replace />} />
          <Route path="/magazine/:id" element={<MagazineDetail />} />
          <Route path="/magazines/:id" element={<MagazineDetail />} />
          <Route path="/gallery" element={<Gallery />} />
          <Route path="/contactus" element={<ContactUs />} />
          <Route path="/aboutus" element={<AboutUs />} />

          <Route path="/committee" element={<Committee />} />
          <Route path="/faqs" element={<FAQs />} />
          <Route path="/privacypolicy" element={<PrivacyPolicy />} />
          <Route path="/termsandconditions" element={<TermsAndConditions />} />
          <Route path="/cms" element={<CmsPortal />} />
          <Route path="/admin" element={<CmsPortal />} />
          <Route path="*" element={<Navigate to="/" replace />} />
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
