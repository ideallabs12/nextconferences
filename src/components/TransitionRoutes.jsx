/**
 * TransitionRoutes — NEXT Premier League Conferences
 * "The Beam": a slanted blade of light sweeps across the screen, led by two
 * thin ribbons of colour (cyan-blue, then violet) that peel off the black panel
 * behind them. The destination name rises out of the dark inside a soft
 * aurora while a hairline of light draws beneath it. A second sweep, with the
 * ribbons trailing, wipes the dark away to reveal the new page.
 *
 * Drop-in replacement for react-router's <Routes>. Keep your <Route> lines.
 * Only opacity and transform are animated. No images, no dependencies.
 */
import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { Routes, useLocation } from 'react-router-dom';

/* ───────────────────────── Timings (milliseconds) ─────────────────────────
   IN_MS   : light sweeps in and covers the screen
   HOLD_MS : screen is covered, new page is swapped in, name is shown
   OUT_MS  : light sweeps out and reveals the new page
   Total = IN + HOLD + OUT (about 2.3 seconds by default)                    */
export const IN_MS = 800;
export const HOLD_MS = 650;
export const OUT_MS = 850;

/* ───────────────────────────── Helpers ───────────────────────────── */
const strip = (p) => (p.length > 1 ? p.replace(/\/+$/, '') : p) || '/';

const prefersReduced = () =>
  typeof window !== 'undefined' &&
  !!window.matchMedia &&
  window.matchMedia('(prefers-reduced-motion: reduce)').matches;

const isSpeakerRoute = (pathname) => {
  if (!pathname) return false;
  const p = strip(pathname).toLowerCase();
  return (
    p === '/speakers' ||
    p.startsWith('/speakers/') ||
    p === '/speaker' ||
    p.startsWith('/speaker/')
  );
};

const scrollTop = () => {
  try {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
  } catch {
    window.scrollTo(0, 0);
  }
};

function prettify(segment) {
  let s = segment || '';
  try {
    s = decodeURIComponent(s);
  } catch {
    /* keep raw segment */
  }
  return s
    .replace(/[-_]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

/** Page name from the URL. `names` can override, e.g. { '/about': 'About Us' } */
function pageName(pathname, names) {
  const path = strip(pathname);
  if (names) {
    if (names[path]) return names[path];
    const first = '/' + (path.split('/')[1] || '');
    if (names[first]) return names[first];
  }
  if (path === '/') return 'Home';
  return prettify(path.split('/')[1]) || 'Home';
}

/* ───────────────────────────── Component ───────────────────────────── */
export default function TransitionRoutes({ children, names }) {
  const location = useLocation();

  const [shown, setShown] = useState(location); // location actually rendered
  const [phase, setPhase] = useState('idle'); // idle | in | hold | out
  const [label, setLabel] = useState('');
  const [status, setStatus] = useState('');
  const [run, setRun] = useState(0); // remounts the overlay for each run

  const phaseRef = useRef('idle');
  const latest = useRef(location); // most recent URL the router reports
  const shownRef = useRef(location);
  const scrollRef = useRef(false);
  const namesRef = useRef(names);
  const timer = useRef(0);
  const api = useRef({});

  namesRef.current = names;

  const go = (p) => {
    phaseRef.current = p;
    setPhase(p);
  };

  const commit = (loc, scroll) => {
    shownRef.current = loc;
    scrollRef.current = scroll;
    setShown(loc);
  };

  // Scroll to top right after the new page has been committed to the DOM.
  useLayoutEffect(() => {
    if (scrollRef.current) {
      scrollRef.current = false;
      scrollTop();
    }
  }, [shown]);

  api.current.begin = () => {
    const name = pageName(latest.current.pathname, namesRef.current);
    setRun((r) => r + 1);
    setLabel(name);
    setStatus(`Loading ${name}`);
    go('in');

    timer.current = setTimeout(() => {
      // Screen is fully covered: swap the page and reset scroll.
      const next = latest.current;
      commit(next, true);
      setLabel(pageName(next.pathname, namesRef.current));
      go('hold');

      timer.current = setTimeout(() => {
        go('out');
        timer.current = setTimeout(api.current.finish, OUT_MS);
      }, HOLD_MS);
    }, IN_MS);
  };

  api.current.finish = () => {
    const next = latest.current;
    const cur = shownRef.current;
    go('idle');
    // The user navigated again while we were revealing: go straight on.
    if (strip(next.pathname) !== strip(cur.pathname)) {
      if (isSpeakerRoute(next.pathname)) {
        commit(next, true);
        setStatus(`${pageName(next.pathname, namesRef.current)} page loaded`);
        return;
      }
      api.current.begin();
      return;
    }
    if (next.key !== cur.key) commit(next, false);
    setStatus(`${pageName(next.pathname, namesRef.current)} page loaded`);
  };

  // React to every navigation.
  useEffect(() => {
    latest.current = location;
    const cur = shownRef.current;
    if (location.key === cur.key && phaseRef.current === 'idle') return;

    const pathChanged = strip(location.pathname) !== strip(cur.pathname);

    // Disable page transition for reduced motion OR any speaker route (speakers list & individual speaker pages)
    const isTargetSpeaker = isSpeakerRoute(location.pathname);
    const shouldSkipAnimation = prefersReduced() || isTargetSpeaker;

    if (shouldSkipAnimation) {
      clearTimeout(timer.current);
      if (phaseRef.current !== 'idle') go('idle');
      if (location.key !== cur.key || pathChanged) {
        commit(location, pathChanged);
        if (pathChanged) {
          setStatus(`${pageName(location.pathname, namesRef.current)} page loaded`);
        }
      }
      return;
    }

    const p = phaseRef.current;
    if (p === 'idle') {
      if (!pathChanged) {
        commit(location, false); // only hash or search changed: no animation
        return;
      }
      api.current.begin();
    } else if (p === 'in') {
      // Swap happens at the end of "in" with the latest location.
      const name = pageName(location.pathname, namesRef.current);
      setLabel(name);
      setStatus(`Loading ${name}`);
    } else if (p === 'hold') {
      // Still covered: swap again, no need to restart the animation.
      commit(location, true);
      const name = pageName(location.pathname, namesRef.current);
      setLabel(name);
      setStatus(`Loading ${name}`);
    }
    // p === 'out': picked up by finish().
  }, [location]);

  useEffect(() => () => clearTimeout(timer.current), []);

  const words = label.split(' ').filter(Boolean);
  let n = 0;

  return (
    <>
      <style>{CSS}</style>

      <Routes location={shown}>{children}</Routes>

      <div className="nx-sr" role="status" aria-live="polite" aria-atomic="true">
        {status}
      </div>

      {phase !== 'idle' && (
        <div
          key={run}
          className="nx"
          data-phase={phase}
          aria-hidden="true"
          style={{
            '--nx-in': `${IN_MS}ms`,
            '--nx-hold': `${HOLD_MS}ms`,
            '--nx-out': `${OUT_MS}ms`,
          }}
        >
          <div className="nx-sweep nx-sweep--1">
            <div className="nx-skew">
              <span className="nx-edge nx-edge--lead" />
              <span className="nx-edge nx-edge--trail" />
            </div>
          </div>
          <div className="nx-sweep nx-sweep--2">
            <div className="nx-skew" />
          </div>
          <div className="nx-sweep nx-sweep--3">
            <div className="nx-skew" />
          </div>

          <div className="nx-copy">
            <span className="nx-bloom" />
            <span className="nx-name" key={label}>
              {words.map((w, wi) => (
                <span className="nx-word" key={wi}>
                  {Array.from(w).map((ch, ci) => (
                    <span className="nx-ch" style={{ '--i': n++ }} key={ci}>
                      {ch}
                    </span>
                  ))}
                </span>
              ))}
            </span>
            <span className="nx-rule" />
          </div>
        </div>
      )}
    </>
  );
}

/* ───────────────────────────── Styles ───────────────────────────── */
const CSS = `
.nx {
  /* Palette: theme blues + cyan, with violet and a touch of magenta for depth */
  --nx-ink: #000;
  --nx-cyan: #18d6ff;
  --nx-radiant: #2e7dff;
  --nx-electric: #1f4bff;
  --nx-violet: #8b3dff;
  --nx-magenta: #ff4fd8;

  --nx-pad: max(24vh, 26vw);
  --nx-lag: 70ms;                                   /* gap between layers */
  --nx-in-d: calc(var(--nx-in) - var(--nx-lag) * 2);
  --nx-out-d: calc(var(--nx-out) - var(--nx-lag) * 2);
  --nx-ease: cubic-bezier(.76, 0, .24, 1);

  position: fixed;
  inset: 0;
  z-index: 2147483000;
  overflow: hidden;
  touch-action: none;
  overscroll-behavior: contain;
  font-family: inherit;
  color: #fff;
}
.nx[data-phase="out"] { pointer-events: none; }

/* Three stacked panels. Wider than the screen so slanted edges never show. */
.nx-sweep {
  position: absolute;
  top: 0;
  bottom: 0;
  left: calc(var(--nx-pad) * -1);
  width: calc(100% + var(--nx-pad) * 2);
  transform: translate3d(-100%, 0, 0);
  will-change: transform;
}
/* In: colour ribbons lead, black follows. Out: black leaves first, ribbons trail. */
.nx-sweep--1 { --d-in: 0ms;                 --d-out: calc(var(--nx-lag) * 2); }
.nx-sweep--2 { --d-in: var(--nx-lag);       --d-out: var(--nx-lag); }
.nx-sweep--3 { --d-in: calc(var(--nx-lag) * 2); --d-out: 0ms; }

.nx[data-phase="in"] .nx-sweep {
  animation: nx-in var(--nx-in-d) var(--nx-ease) var(--d-in) both;
}
.nx[data-phase="hold"] .nx-sweep { transform: translate3d(0, 0, 0); }
.nx[data-phase="out"] .nx-sweep {
  animation: nx-out var(--nx-out-d) var(--nx-ease) var(--d-out) both;
}
@keyframes nx-in  { from { transform: translate3d(-100%, 0, 0); } to { transform: translate3d(0, 0, 0); } }
@keyframes nx-out { from { transform: translate3d(0, 0, 0); }    to { transform: translate3d(100%, 0, 0); } }

.nx-skew {
  position: absolute;
  inset: 0;
  transform: skewX(-12deg);
}

/* Layer 1: cyan to radiant blue ribbon */
.nx-sweep--1 .nx-skew {
  background: linear-gradient(180deg, var(--nx-cyan), var(--nx-radiant) 55%, var(--nx-electric));
}
/* Layer 2: electric to violet ribbon */
.nx-sweep--2 .nx-skew {
  background: linear-gradient(180deg, var(--nx-electric), var(--nx-violet) 60%, var(--nx-magenta));
}
/* Layer 3: black panel with a quiet aurora and fine vertical lines */
.nx-sweep--3 .nx-skew {
  background:
    radial-gradient(65% 55% at 78% 116%, rgba(46, 125, 255, .5), transparent 70%),
    radial-gradient(45% 45% at 16% -10%, rgba(139, 61, 255, .34), transparent 70%),
    radial-gradient(34% 34% at 52% 108%, rgba(255, 79, 216, .2), transparent 70%),
    repeating-linear-gradient(90deg, rgba(255, 255, 255, .035) 0 1px, transparent 1px 72px),
    var(--nx-ink);
}

/* Light spilling off both edges of the outermost ribbon. */
.nx-edge {
  position: absolute;
  top: 0;
  bottom: 0;
  width: min(28vw, 380px);
  pointer-events: none;
}
.nx-edge::before {
  content: "";
  position: absolute;
  top: 0;
  bottom: 0;
  width: 2px;
  background: linear-gradient(180deg, #fff, var(--nx-cyan) 30%, var(--nx-violet) 70%, var(--nx-magenta));
  box-shadow: 0 0 22px 3px rgba(46, 125, 255, .6);
}
.nx-edge--lead {
  left: 100%;
  background:
    radial-gradient(70% 42% at 0% 18%, rgba(24, 214, 255, .5), transparent),
    radial-gradient(70% 46% at 0% 58%, rgba(139, 61, 255, .42), transparent),
    radial-gradient(60% 40% at 0% 100%, rgba(255, 79, 216, .34), transparent);
}
.nx-edge--lead::before { left: 0; }
.nx-edge--trail {
  right: 100%;
  background:
    radial-gradient(70% 42% at 100% 18%, rgba(24, 214, 255, .42), transparent),
    radial-gradient(70% 46% at 100% 58%, rgba(46, 125, 255, .42), transparent),
    radial-gradient(60% 40% at 100% 100%, rgba(139, 61, 255, .34), transparent);
}
.nx-edge--trail::before { right: 0; }

/* Destination name, centred on the dark. */
.nx-copy {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: clamp(14px, 2.6vh, 28px);
  padding: 0 6vw;
  text-align: center;
}
.nx[data-phase="out"] .nx-copy {
  animation: nx-copy-out calc(var(--nx-out) * .4) ease-in both;
}
@keyframes nx-copy-out {
  to { opacity: 0; transform: translate3d(0, -14px, 0); }
}

/* Soft bloom of light behind the name. */
.nx-bloom {
  position: absolute;
  left: 50%;
  top: 50%;
  width: min(120vw, 900px);
  height: min(80vw, 520px);
  margin: calc(min(80vw, 520px) / -2) 0 0 calc(min(120vw, 900px) / -2);
  background:
    radial-gradient(closest-side at 38% 50%, rgba(46, 125, 255, .38), transparent),
    radial-gradient(closest-side at 64% 46%, rgba(139, 61, 255, .3), transparent),
    radial-gradient(closest-side at 52% 66%, rgba(24, 214, 255, .16), transparent);
  opacity: 0;
  animation: nx-bloom calc(var(--nx-in) * .8) ease-out calc(var(--nx-in) * .45) both;
  pointer-events: none;
}
@keyframes nx-bloom { to { opacity: 1; } }

.nx-name {
  position: relative;
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  column-gap: .26em;
  max-width: 100%;
  font-weight: 700;
  font-size: clamp(2.5rem, 12.5vw, 8rem);
  line-height: 1;
  letter-spacing: -.03em;
  text-shadow: 0 0 42px rgba(46, 125, 255, .45);
}
.nx-word {
  display: inline-block;
  overflow: hidden;
  padding: .08em .04em .14em;
  margin: -.08em -.04em -.14em;
}
.nx-ch {
  display: inline-block;
  transform: translate3d(0, 115%, 0);
  animation: nx-rise .62s cubic-bezier(.2, .8, .2, 1)
             calc(var(--nx-in) * .6 + var(--i) * 34ms) both;
}
@keyframes nx-rise { to { transform: translate3d(0, 0, 0); } }

/* A hairline of light that draws while the page loads. */
.nx-rule {
  position: relative;
  width: min(260px, 50vw);
  height: 2px;
  background: linear-gradient(90deg, var(--nx-cyan), var(--nx-electric) 40%, var(--nx-violet) 75%, var(--nx-magenta));
  box-shadow: 0 0 16px rgba(46, 125, 255, .7);
  transform: scaleX(0);
  transform-origin: left center;
  animation: nx-rule calc(var(--nx-hold) + var(--nx-in) * .4)
             cubic-bezier(.65, 0, .35, 1) calc(var(--nx-in) * .6) both;
}
@keyframes nx-rule { to { transform: scaleX(1); } }

/* Visually hidden live region. */
.nx-sr {
  position: absolute;
  width: 1px;
  height: 1px;
  margin: -1px;
  padding: 0;
  overflow: hidden;
  clip: rect(0 0 0 0);
  white-space: nowrap;
  border: 0;
}

@media (prefers-reduced-motion: reduce) {
  .nx { display: none; }
}
`;
