import React, { useEffect, useRef, useState } from 'react';
import { Routes, useLocation } from 'react-router-dom';

/*
  AnimatedRoutes: drop-in replacement for <Routes> with a branded page transition (about 2.8s).

    1. THREE arched panels (cyan, blue, black) sweep up one after another, so bright ribbons
       of colour lead the black curtain.
    2. The NEXT mark is drawn: a gradient frame traces itself around the logo, then the
       destination name rises in letter by letter while a percentage counts to 100 and a
       progress line fills along the bottom. The new page is swapped in behind all this.
    3. The panels lift away in reverse order (black first, blue, then cyan trailing last).

  No dependencies. Only opacity/transform are animated. Respects "reduce motion".
  Change the three timings below to make it faster or slower.
*/

const COVER_MS = 460; // quick panel rise (staggered, 360ms each)
const HOLD_MS = 1400; // mark + page name + counter stays on screen
const REVEAL_MS = 460; // quick reveal

const TITLES = {
  '/': 'Home',
  '/second-home': 'Second Home',
  '/second_next_home': 'Second Home',
  '/conferences': 'Conferences',
  '/speakers': 'Speakers',
  '/magazines': 'Magazines',
  '/gallery': 'Gallery',
  '/aboutus': 'About Us',
  '/contactus': 'Contact',
  '/committee': 'Committee',
  '/faqs': 'FAQs',
  '/privacypolicy': 'Privacy Policy',
  '/termsandconditions': 'Terms & Conditions',
  '/register': 'Register',
};

const titleFor = (pathname, titles) => {
  const key = pathname.length > 1 ? pathname.replace(/\/$/, '') : pathname;
  if (titles[key]) return titles[key];
  const seg = key.split('/').filter(Boolean)[0] || '';
  return titles['/' + seg] || seg.replace(/[-_]/g, ' ') || 'Home';
};

// white -> cyan across the letters of the page name
const letterColor = (i, n) => {
  const t = n < 2 ? 0 : Math.max(0, (i / (n - 1) - 0.35) / 0.65);
  const c = [255, 255, 255].map((v, k) => Math.round(v + ([46, 230, 255][k] - v) * t));
  return `rgb(${c.join(',')})`;
};

const EASE = 'cubic-bezier(.65,0,.2,1)';

const CSS = `
@property --n{syntax:'<integer>';inherits:false;initial-value:0}

.ar-curtain{position:fixed;inset:0;z-index:10000;overflow:hidden;pointer-events:none;visibility:hidden;color:#fff;
  display:grid;place-items:center}
.ar-curtain[data-stage="cover"],.ar-curtain[data-stage="hold"],.ar-curtain[data-stage="reveal"]{visibility:visible}

/* three arched panels; the arch rises first, so the leading edge is a soft curve */
.ar-panel{position:absolute;left:-10%;right:-10%;top:-8vw;bottom:0;overflow:hidden;
  border-radius:50% 50% 0 0 / 8vw 8vw 0 0;transform:translateY(100%)}
.ar-panel.cyan{background:linear-gradient(180deg,#2ee6ff,#2f7bff);--c:0ms;--r:100ms}
.ar-panel.blue{background:linear-gradient(180deg,#2f7bff,#1f3bff 60%,#1626b8);--c:50ms;--r:50ms}
.ar-panel.ink{--c:100ms;--r:0ms;
  background:
    radial-gradient(55% 50% at 80% 26%,rgba(46,230,255,.30),transparent 70%),
    radial-gradient(55% 60% at 10% 100%,rgba(31,59,255,.5),transparent 70%),
    #03050a}
.ar-panel.ink::before{content:"";position:absolute;inset:0;
  background-image:linear-gradient(rgba(255,255,255,.05) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.05) 1px,transparent 1px);
  background-size:56px 56px;-webkit-mask:radial-gradient(60% 60% at 50% 55%,#000,transparent 90%);mask:radial-gradient(60% 60% at 50% 55%,#000,transparent 90%)}
.ar-panel.ink::after{content:"N";position:absolute;right:4%;bottom:-14%;font:800 52vw/1 'Bricolage Grotesque','Arial Narrow',Impact,sans-serif;
  color:transparent;-webkit-text-stroke:2px rgba(255,255,255,.07)}

.ar-curtain[data-stage="cover"] .ar-panel{animation:arCover 360ms var(--c) ${EASE} both}
.ar-curtain[data-stage="hold"] .ar-panel{transform:none}
.ar-curtain[data-stage="reveal"] .ar-panel{animation:arReveal 360ms var(--r) ${EASE} forwards}
@keyframes arCover{from{transform:translateY(100%)}to{transform:none}}
@keyframes arReveal{from{transform:none}to{transform:translateY(-100%)}}

/* content */
.ar-content{position:relative;display:grid;justify-items:center;gap:22px;padding:24px;text-align:center;transition:opacity .25s ease}
.ar-curtain[data-stage="reveal"] .ar-content,.ar-curtain[data-stage="reveal"] .ar-corner{opacity:0}
.ar-curtain[data-stage="cover"] .ar-content,.ar-curtain[data-stage="cover"] .ar-corner{opacity:0}

.ar-mark{width:clamp(84px,9vw,118px);height:auto;overflow:visible}
.ar-ring{stroke-dasharray:1;stroke-dashoffset:1}
.ar-tile{transform-box:fill-box;transform-origin:center;opacity:0}
.ar-curtain[data-stage="hold"] .ar-ring{animation:arTrace .5s 0ms cubic-bezier(.65,0,.2,1) forwards}
.ar-curtain[data-stage="hold"] .ar-tile{animation:arPop .4s .04s cubic-bezier(.2,1.4,.4,1) forwards}
@keyframes arTrace{to{stroke-dashoffset:0}}
@keyframes arPop{from{opacity:0;transform:scale(.55) rotate(-10deg)}to{opacity:1;transform:none}}

.ar-label{opacity:0;font:600 13px/1 'Instrument Sans',system-ui,sans-serif;letter-spacing:.24em;text-transform:uppercase;color:rgba(255,255,255,.7)}
.ar-curtain[data-stage="hold"] .ar-label{animation:arFade .35s 0ms ease forwards}
@keyframes arFade{to{opacity:1}}

.ar-title{display:block;overflow:hidden;padding:.1em .08em .08em;
  font:800 clamp(44px,10vw,140px)/.9 'Bricolage Grotesque','Arial Narrow',Impact,sans-serif;font-stretch:90%;text-transform:uppercase;letter-spacing:-.045em}
.ar-title i{display:inline-block;font-style:normal;transform:translateY(118%)}
.ar-curtain[data-stage="hold"] .ar-title i{animation:arRise .45s calc(30ms + var(--i)*20ms) cubic-bezier(.2,.8,.2,1) forwards}
@keyframes arRise{to{transform:none}}

.ar-line{width:min(60vw,320px);height:3px;border-radius:3px;opacity:0;transform-origin:left;transform:scaleX(0);background:linear-gradient(90deg,#1f3bff,#2f7bff,#2ee6ff)}
.ar-curtain[data-stage="hold"] .ar-line{animation:arDraw .55s .12s cubic-bezier(.65,0,.2,1) forwards}
@keyframes arDraw{to{opacity:1;transform:scaleX(1)}}

/* corners: brand top-left, live counter bottom-left, progress line along the bottom */
.ar-corner{position:absolute;opacity:0;transition:opacity .3s ease}
.ar-brand{left:max(20px,4vw);top:26px;font:600 12px/1.3 'Instrument Sans',system-ui,sans-serif;letter-spacing:.22em;text-transform:uppercase;color:rgba(255,255,255,.6)}
.ar-count{left:max(20px,4vw);bottom:30px;font:800 clamp(40px,6vw,84px)/1 'Bricolage Grotesque','Arial Narrow',Impact,sans-serif;font-stretch:90%;
  letter-spacing:-.04em;font-variant-numeric:tabular-nums;color:#2ee6ff;counter-reset:n var(--n)}
.ar-count::before{content:counter(n) "%"}
.ar-curtain[data-stage="hold"] .ar-corner{opacity:1}
.ar-curtain[data-stage="hold"] .ar-count{animation:arCount 700ms 0ms cubic-bezier(.4,0,.2,1) forwards}
@keyframes arCount{from{--n:0}to{--n:100}}
.ar-progress{position:absolute;left:0;right:0;bottom:0;height:4px;transform-origin:left;transform:scaleX(0);
  background:linear-gradient(90deg,#1f3bff,#2f7bff 55%,#2ee6ff);box-shadow:0 0 24px 4px rgba(46,230,255,.5)}
.ar-curtain[data-stage="hold"] .ar-progress{animation:arDraw2 700ms 0ms cubic-bezier(.4,0,.2,1) forwards}
@keyframes arDraw2{to{transform:scaleX(1)}}

.ar-sr{position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0 0 0 0);white-space:nowrap}
@media (max-width:640px){.ar-brand{font-size:10px}.ar-panel.ink::after{font-size:90vw}}
@media (prefers-reduced-motion:reduce){.ar-curtain{display:none}}
`;

const AnimatedRoutes = ({ children, titles = TITLES }) => {
  const location = useLocation();
  const [shown, setShown] = useState(location); // the page currently rendered
  const [stage, setStage] = useState('idle'); // idle | cover | hold | reveal
  const busy = useRef(false);
  const swapped = useRef(false);
  const latest = useRef(location);
  const timers = useRef([]);

  useEffect(() => {
    latest.current = location;

    // A click during a transition: use the newest page when swapping
    if (busy.current) {
      if (swapped.current) setShown(location);
      return;
    }
    // Same page (only hash/search changed): no animation
    if (location.pathname === shown.pathname) {
      if (location !== shown) setShown(location);
      return;
    }
    if (window.matchMedia('(prefers-reduced-motion:reduce)').matches) {
      window.scrollTo(0, 0);
      setShown(location);
      return;
    }

    busy.current = true;
    swapped.current = false;
    setStage('cover');
    const swapAt = COVER_MS + 20;
    timers.current = [
      setTimeout(() => {
        window.scrollTo(0, 0);
        swapped.current = true;
        setShown(latest.current); // swap pages while the panels hide everything
        setStage('hold');
      }, swapAt),
      setTimeout(() => setStage('reveal'), swapAt + HOLD_MS),
      setTimeout(() => {
        busy.current = false;
        setStage('idle');
      }, swapAt + HOLD_MS + REVEAL_MS),
    ];
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location]);

  useEffect(() => () => timers.current.forEach(clearTimeout), []);

  const name = titleFor(location.pathname, titles);
  const chars = [...name];

  return (
    <>
      <style>{CSS}</style>
      <Routes location={shown}>{children}</Routes>

      <div className="ar-curtain" data-stage={stage} aria-hidden="true">
        <div className="ar-panel cyan" />
        <div className="ar-panel blue" />
        <div className="ar-panel ink" />

        <div className="ar-corner ar-brand">NEXT Premier League Conferences</div>
        <div className="ar-corner ar-count" />
        <div className="ar-progress" />

        <div className="ar-content">
          <svg className="ar-mark" viewBox="0 0 120 120" focusable="false">
            <defs>
              <linearGradient id="ar-lg" x1="0" y1="1" x2="1" y2="0">
                <stop offset="0" stopColor="#1F3BFF" />
                <stop offset="1" stopColor="#2EE6FF" />
              </linearGradient>
              <linearGradient id="ar-rg" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0" stopColor="#2EE6FF" />
                <stop offset="1" stopColor="#2F7BFF" />
              </linearGradient>
            </defs>
            <rect className="ar-ring" x="5" y="5" width="110" height="110" rx="32" pathLength="1" fill="none" stroke="url(#ar-rg)" strokeWidth="2.5" strokeLinecap="round" />
            <g className="ar-tile">
              <g transform="translate(30 30) scale(1.5)">
                <rect width="40" height="40" rx="11" fill="#fff" />
                <path d="M12 29V11h3.4l9.2 11.6V11H28v18h-3.4L15.4 17.4V29z" fill="#03050A" />
                <circle cx="29.5" cy="30" r="2.4" fill="url(#ar-lg)" />
              </g>
            </g>
          </svg>
          <div className="ar-label">Taking you to</div>
          <div className="ar-title" key={name}>
            {chars.map((ch, i) => (
              <i key={i} style={{ '--i': i, color: letterColor(i, chars.length) }}>
                {ch === ' ' ? '\u00A0' : ch}
              </i>
            ))}
          </div>
          <div className="ar-line" />
        </div>
      </div>
      <div className="ar-sr" role="status" aria-live="polite">
        {stage === 'idle' ? '' : `Loading ${name}`}
      </div>
    </>
  );
};

export default AnimatedRoutes;
