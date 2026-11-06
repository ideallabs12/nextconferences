/**
 * TransitionRoutes — NEXT Premier League Conferences
 *
 * "The Letter Reel": on every page change the screen dissolves into a clean
 * typographic poster. The destination page name rolls into place with slot-reel
 * precision, framed by fine architectural rules and corner dice. Once locked,
 * the poster dissolves directly into the new page.
 *
 * No sliding panels, no ribbons, pure focused typography.
 * Drop-in replacement for react-router's <Routes>. Keep your <Route> lines.
 */
import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { Routes, useLocation } from 'react-router-dom';

/* ───────────────────────── Timings (milliseconds) ─────────────────────────
   IN_MS   : background and alphabet storm streams across in alternating rows
   HOLD_MS : alphabets storm shutters away, centered title rolls & thumps into place
   OUT_MS  : gentle fade-out revealing the new page
   Total = ~2.5 seconds                                                      */
export const IN_MS = 600;
export const HOLD_MS = 1450;
export const OUT_MS = 450;

const DEFAULTS = {
  brand: 'NEXT Premier League', // top-left label
  year: String(new Date().getFullYear()), // top-right label
  roles: ['Visionaries', 'Changemakers'], // bottom labels
  badge: 'NEXT/LEAGUE', // round badge, "/" breaks the line
  accent: '#1f4bff', // electric blue
  paper: '#f6f8fc', // off-white
  ink: '#07080c', // deep black
};

/* ───────────────────────────── Helpers ───────────────────────────── */
const strip = (p) => (p.length > 1 ? p.replace(/\/+$/, '') : p) || '/';

const prefersReduced = () =>
  typeof window !== 'undefined' &&
  !!window.matchMedia &&
  window.matchMedia('(prefers-reduced-motion: reduce)').matches;

const isIndividualSpeakerRoute = (pathname) => {
  if (!pathname) return false;
  const p = strip(pathname).toLowerCase();
  return (
    (p.startsWith('/speakers/') && p !== '/speakers') ||
    (p.startsWith('/speaker/') && p !== '/speaker')
  );
};

// Tracks visited routes in the current session (resets on full browser reload / refresh)
const visitedRoutes = new Set();
const normalizePath = (p) => {
  const s = strip(p || '').toLowerCase();
  if (s === '/second_next_home') return '/second-home';
  if (s === '/conference') return '/conferences';
  if (s === '/speaker') return '/speakers';
  if (s === '/magazine') return '/magazines';
  return s;
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

/** Looks a path up in a map like { '/about': 'About Us' } (exact, then first segment). */
function lookup(map, pathname) {
  if (!map || Array.isArray(map)) return undefined;
  const path = strip(pathname);
  return map[path] ?? map['/' + (path.split('/')[1] || '')];
}

function pageName(pathname, names) {
  const hit = lookup(names, pathname);
  if (hit) return hit;
  const path = strip(pathname);
  if (path === '/') return 'Home';
  return prettify(path.split('/')[1]) || 'Home';
}

/* ───────────────────────────── Router wrapper ───────────────────────────── */
export default function TransitionRoutes({
  children,
  names, // optional: { '/about': 'About Us' }
  brand = DEFAULTS.brand,
  year = DEFAULTS.year,
  roles = DEFAULTS.roles,
  badge = DEFAULTS.badge,
  accent = DEFAULTS.accent,
  paper = DEFAULTS.paper,
  ink = DEFAULTS.ink,
}) {
  const location = useLocation();

  const [shown, setShown] = useState(location); // location actually rendered
  const [phase, setPhase] = useState('idle'); // idle | in | hold | out
  const [scene, setScene] = useState({ label: '' });
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
    const target = latest.current;
    const label = pageName(target.pathname, namesRef.current);
    setRun((r) => r + 1);
    setScene({ label });
    setStatus(`Loading ${label}`);
    go('in');

    timer.current = setTimeout(() => {
      // Screen is fully covered: swap the page and reset scroll.
      commit(latest.current, true);
      go('hold');

      timer.current = setTimeout(() => {
        go('out');
        timer.current = setTimeout(api.current.finish, OUT_MS);
      }, HOLD_MS);
    }, IN_MS);
  };

  const isFirstMount = useRef(true);

  api.current.finish = () => {
    const next = latest.current;
    const cur = shownRef.current;
    go('idle');
    // The user navigated again while we were revealing: go straight on.
    if (strip(next.pathname) !== strip(cur.pathname)) {
      const normNext = normalizePath(next.pathname);
      if (isIndividualSpeakerRoute(next.pathname) || visitedRoutes.has(normNext)) {
        commit(next, true);
        setStatus(`${pageName(next.pathname, namesRef.current)} page loaded`);
        return;
      }
      visitedRoutes.add(normNext);
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
    const normPath = normalizePath(location.pathname);
    const isIndividualSpeaker = isIndividualSpeakerRoute(location.pathname);

    // Initial load: play animation for the first page visited in this session
    if (isFirstMount.current) {
      isFirstMount.current = false;
      if (!prefersReduced() && !isIndividualSpeaker && !visitedRoutes.has(normPath)) {
        visitedRoutes.add(normPath);
        api.current.begin();
        return;
      }
      visitedRoutes.add(normPath);
      return;
    }

    if (location.key === cur.key && phaseRef.current === 'idle') return;

    const pathChanged = strip(location.pathname) !== strip(cur.pathname);

    // Disable page transition for reduced motion OR individual speaker pages
    const shouldSkipAnimation = prefersReduced() || isIndividualSpeaker;

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

    // If this page was already visited in this session without reloading (refresh), STOP animation!
    const alreadyVisited = visitedRoutes.has(normPath);
    if (alreadyVisited) {
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

    // First time opening this page in this session:
    visitedRoutes.add(normPath);

    const p = phaseRef.current;
    if (p === 'idle') {
      if (!pathChanged) {
        commit(location, false); // only hash or search changed: no animation
        return;
      }
      api.current.begin();
    } else if (p === 'hold') {
      commit(location, true); // still covered: swap again, keep playing
    }
  }, [location]);

  useEffect(() => () => clearTimeout(timer.current), []);

  const cfg = { brand, year, roles, badge, accent, paper, ink };

  return (
    <>
      <style>{CSS}</style>

      <Routes location={shown}>{children}</Routes>

      <div className="wpl-sr" role="status" aria-live="polite" aria-atomic="true">
        {status}
      </div>

      {phase !== 'idle' && <Overlay key={run} phase={phase} scene={scene} cfg={cfg} />}
    </>
  );
}

function Overlay({ phase, scene, cfg }) {
  return (
    <div
      className="wpl-clip"
      data-phase={phase}
      aria-hidden="true"
      style={{
        '--in': `${IN_MS}ms`,
        '--h': `${HOLD_MS}ms`,
        '--out': `${OUT_MS}ms`,
        '--wpl-accent': cfg.accent,
        '--wpl-paper': cfg.paper,
        '--wpl-ink': cfg.ink,
      }}
    >
      <Stage scene={scene} cfg={cfg} />
    </div>
  );
}

// #region glyphs
const WIDE = { A: 1.04, M: 1.3, N: 1.04, Q: 1.02, V: 1.04, W: 1.44, X: 1.02 };

function glyphWidth(ch, w, s) {
  if (ch === 'I') return s;
  if (ch === ' ') return w * 0.5;
  return w * (WIDE[ch] ?? 1);
}

function glyphPath(ch, w, h, s) {
  const i = s / 2;
  const x0 = i;
  const x1 = w - i;
  const y0 = i;
  const y1 = h - i;
  const xm = w / 2;
  const ym = h / 2;
  const bw = x1 - x0;
  const bh = y1 - y0;
  const r = bw / 2;
  const c = Math.min(bw * 0.62, bh / 4);
  const q = (...parts) =>
    parts.map((p) => (typeof p === 'number' ? String(Math.round(p * 10) / 10) : p)).join(' ');
  const arc = (rad, sweep, x, y) => q('A', rad, rad, 0, 0, sweep, x, y);
  const stadium = q('M', x0, y0 + r) + arc(r, 1, x1, y0 + r) + q('L', x1, y1 - r) + arc(r, 1, x0, y1 - r) + 'Z';
  const open = q('M', x1, y0 + r) + arc(r, 0, x0, y0 + r) + q('L', x0, y1 - r) + arc(r, 0, x1, y1 - r);
  const bowl = (yb) => {
    const k = Math.min(c, (yb - y0) / 2);
    return q('M', x0, y1, 'L', x0, y0, 'L', x1 - k, y0) + arc(k, 1, x1, y0 + k) + q('L', x1, yb - k) + arc(k, 1, x1 - k, yb) + q('L', x0, yb);
  };
  switch (ch) {
    case 'A': {
      const ay = y0 + bh * 0.64;
      const t = (y1 - ay) / bh;
      return q('M', x0, y1, 'L', xm, y0, 'L', x1, y1, 'M', x0 + (xm - x0) * t, ay, 'L', x1 - (x1 - xm) * t, ay);
    }
    case 'B': {
      const yb = y0 + bh * 0.47;
      const xt = x1 - s * 0.4;
      const ct = Math.min(c, (yb - y0) / 2, xt - x0);
      const cb = Math.min(c, (y1 - yb) / 2, bw);
      return (
        q('M', x0, yb, 'L', xt - ct, yb) + arc(ct, 0, xt, yb - ct) + q('L', xt, y0 + ct) + arc(ct, 0, xt - ct, y0) +
        q('L', x0, y0, 'L', x0, y1, 'L', x1 - cb, y1) + arc(cb, 0, x1, y1 - cb) + q('L', x1, yb + cb) + arc(cb, 0, x1 - cb, yb) +
        q('L', x0, yb)
      );
    }
    case 'C':
      return open;
    case 'D': {
      const k = Math.min(bw * 0.75, bh / 2);
      return q('M', x0, y0, 'L', x1 - k, y0) + arc(k, 1, x1, y0 + k) + q('L', x1, y1 - k) + arc(k, 1, x1 - k, y1) + q('L', x0, y1) + 'Z';
    }
    case 'E':
      return q('M', x1, y0, 'L', x0, y0, 'L', x0, y1, 'L', x1, y1, 'M', x0, ym, 'L', x1 - bw * 0.12, ym);
    case 'F':
      return q('M', x1, y0, 'L', x0, y0, 'L', x0, y1, 'M', x0, ym - bh * 0.02, 'L', x1 - bw * 0.12, ym - bh * 0.02);
    case 'G':
      return open + q('L', x1, ym + bh * 0.04, 'L', xm, ym + bh * 0.04);
    case 'H':
      return q('M', x0, y0, 'L', x0, y1, 'M', x1, y0, 'L', x1, y1, 'M', x0, ym, 'L', x1, ym);
    case 'I':
      return q('M', xm, y0, 'L', xm, y1);
    case 'J':
      return q('M', x1, y0, 'L', x1, y1 - r) + arc(r, 1, x0, y1 - r) + q('L', x0, y1 - r - bh * 0.06);
    case 'K':
      return q('M', x0, y0, 'L', x0, y1, 'M', x1, y0, 'L', x0, y0 + bh * 0.62, 'M', x0 + bw * 0.28, y0 + bh * 0.47, 'L', x1, y1);
    case 'L':
      return q('M', x0, y0, 'L', x0, y1, 'L', x1, y1);
    case 'M':
      return q('M', x0, y1, 'L', x0, y0, 'L', xm, y0 + bh * 0.55, 'L', x1, y0, 'L', x1, y1);
    case 'N':
      return q('M', x0, y1, 'L', x0, y0, 'L', x1, y1, 'L', x1, y0);
    case 'O':
      return stadium;
    case 'P':
      return bowl(y0 + bh * 0.52);
    case 'Q':
      return stadium + q('M', xm + bw * 0.1, y1 - bh * 0.16, 'L', x1 + s * 0.2, y1 + s * 0.3);
    case 'R':
      return bowl(y0 + bh * 0.5) + q('M', x0 + bw * 0.42, y0 + bh * 0.5, 'L', x1, y1);
    case 'S':
      return q('M', x1, y0 + r) + arc(r, 0, x0, y0 + r) + q('C', x0, ym - bh * 0.02, x1, ym + bh * 0.02, x1, y1 - r) + arc(r, 1, x0, y1 - r);
    case 'T':
      return q('M', x0, y0, 'L', x1, y0, 'M', xm, y0, 'L', xm, y1);
    case 'U':
      return q('M', x0, y0, 'L', x0, y1 - r) + arc(r, 0, x1, y1 - r) + q('L', x1, y0);
    case 'V':
      return q('M', x0, y0, 'L', xm, y1, 'L', x1, y0);
    case 'W': {
      const k = bw * 0.24;
      return q('M', x0, y0, 'L', x0 + k, y1, 'L', xm, y0 + bh * 0.3, 'L', x1 - k, y1, 'L', x1, y0);
    }
    case 'X':
      return q('M', x0, y0, 'L', x1, y1, 'M', x1, y0, 'L', x0, y1);
    case 'Y':
      return q('M', x0, y0, 'L', xm, ym - bh * 0.04, 'L', x1, y0, 'M', xm, ym - bh * 0.04, 'L', xm, y1);
    case 'Z':
      return q('M', x0, y0, 'L', x1, y0, 'L', x0, y1, 'L', x1, y1);
    default:
      return '';
  }
}
// #endregion glyphs

// #region layout
const cleanRow = (s) => s.toUpperCase().replace(/[^A-Z ]/g, '').replace(/\s+/g, ' ');

const hash = (n) => {
  const x = Math.sin(n * 127.1 + 311.7) * 43758.5453;
  return x - Math.floor(x);
};

function layoutPoster(label, compact) {
  const margin = compact ? 30 : 60;
  const cleanName = cleanRow(label).trim() || 'HOME';
  const len = cleanName.replace(/ /g, '').length;
  const tight = len > 8;

  // Responsive typography for prominent, centered letters
  const LH = tight ? 260 : 310;
  const lw0 = tight ? (cleanName.length > 10 ? 86 : 98) : (compact ? 110 : 130);
  const LS = tight ? 22 : 28;
  const gap = tight ? 16 : 24;
  const TOP = Math.round((700 - LH) / 2);

  // Measure total width to achieve exact horizontal centering:
  let totalWidth = 0;
  for (let i = 0; i < cleanName.length; i++) {
    const ch = cleanName[i];
    if (ch === ' ') {
      totalWidth += lw0 * 0.55;
    } else {
      totalWidth += glyphWidth(ch, lw0, LS);
      if (i < cleanName.length - 1) totalWidth += gap;
    }
  }

  const posterWidth = Math.max(1100, Math.round(totalWidth + margin * 2));
  const startX = Math.round((posterWidth - totalWidth) / 2);

  const cells = [];
  let x = startX;
  for (const ch of cleanName) {
    if (ch === ' ') {
      x += lw0 * 0.55;
      continue;
    }
    const w = glyphWidth(ch, lw0, LS);
    cells.push({ ch, x, y: TOP, w, h: LH, s: LS, row: 0, giant: false, base: lw0 });
    x += w + gap;
  }

  return { cells, width: posterWidth, height: 700, margin };
}
// #endregion layout

const AZ = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
const LABEL = 30; // label font size, poster units
const labelWidth = (s) => s.length * LABEL * 0.72;

const at = (f) => IN_MS + Math.round(HOLD_MS * f);

/** Decodes a label from random capitals, letter by letter. */
function useScramble(text, startAt) {
  const [out, setOut] = useState('');
  useEffect(() => {
    setOut('');
    let raf = 0;
    let last = 0;
    const t0 = performance.now();
    const tick = (now) => {
      const t = now - t0 - startAt;
      if (t >= (text.length - 1) * 22 + 240) {
        setOut(text);
        return;
      }
      if (t >= 0 && now - last > 40) {
        last = now;
        let s = '';
        for (let i = 0; i < text.length && t >= i * 22; i++) {
          const ch = text[i];
          s += ch === ' ' || t > i * 22 + 240 ? ch : AZ[(Math.random() * 26) | 0];
        }
        setOut(s);
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [text, startAt]);
  return out;
}

// #region stage
function Stage({ scene, cfg }) {
  const [compact] = useState(
    () => typeof window !== 'undefined' && window.innerWidth / Math.max(1, window.innerHeight) < 0.9,
  );
  const [storm, setStorm] = useState(true);

  useEffect(() => {
    const id = setTimeout(() => setStorm(false), at(0.42));
    return () => clearTimeout(id);
  }, []);

  const L = useMemo(() => layoutPoster(scene.label, compact), [scene.label, compact]);
  const accent = cfg.accent;
  const paper = cfg.paper;
  const ink = cfg.ink;

  const letters = scene.label.toUpperCase().replace(/[^A-Z]/g, '') || 'NEXT';
  const stormRows = useMemo(() => {
    const pool = letters + letters + AZ;
    return Array.from({ length: 6 }, (_, row) => {
      let x = 0;
      const half = [];
      for (let k = 0; k < 24; k++) {
        const ch = pool[Math.floor(hash(row * 97 + k * 13) * pool.length)];
        const w = glyphWidth(ch, 62, 12);
        half.push({ ch, x, w });
        x += w + 26;
      }
      return { row, half, span: x };
    });
  }, [letters]);

  const nameU = cfg.brand.toUpperCase();
  const yearU = String(cfg.year).toUpperCase();
  const roleL = (cfg.roles[0] ?? '').toUpperCase();
  const roleR = (cfg.roles[1] ?? '').toUpperCase();
  const nameT = useScramble(nameU, at(0.18));
  const yearT = useScramble(yearU, at(0.22));
  const roleLT = useScramble(roleL, at(0.18));
  const roleRT = useScramble(roleR, at(0.22));

  const sig = cfg.badge.toUpperCase().split('/').slice(0, 2);
  const dv = [((scene.label.length * 5) % 6) + 1, ((scene.label.length * 3 + 2) % 6) + 1];
  const nameEnd = L.margin + labelWidth(nameU) + 26;
  const yearStart = L.width - L.margin - labelWidth(yearU) - 26;
  const roleLEnd = L.margin + labelWidth(roleL) + 26;
  const roleRStart = L.width - L.margin - labelWidth(roleR) - 26;

  return (
    <div className="wpl-root">
      <svg className="wpl-poster" viewBox={'0 0 ' + L.width + ' ' + L.height} preserveAspectRatio="xMidYMid meet">
        <g>
          <text className="wpl-label" x={L.margin} y={73}>{nameT}</text>
          <text className="wpl-label" x={L.width - L.margin} y={73} textAnchor="end">{yearT}</text>
          <Rule a={nameEnd} b={yearStart} y={62} mid delay={at(0.20)} color={accent} />
          <text className="wpl-label" x={L.margin} y={663}>{roleLT}</text>
          <text className="wpl-label" x={L.width - L.margin} y={663} textAnchor="end">{roleRT}</text>
          <Rule a={roleLEnd} b={roleRStart} y={652} delay={at(0.24)} color={accent} />
        </g>

        {/* Pure centered letters rolling in */}
        <g>
          {L.cells.map((c, i) => (
            <LetterCell
              key={i}
              c={c}
              i={i}
              delay={at(0.18 + (i / Math.max(1, L.cells.length)) * 0.16)}
              color={accent}
            />
          ))}
        </g>
      </svg>

      {storm && (
        <div className="wpl-storm">
          {stormRows.map(({ row, half, span }) => (
            <div
              key={row}
              className="wpl-srow"
              data-dir={row % 2 ? 'r' : 'l'}
              style={{ animationDelay: row * 30 + 'ms, ' + at(0.08 + row * 0.03) + 'ms' }}
            >
              <svg
                className="wpl-strip"
                data-dir={row % 2 ? 'r' : 'l'}
                viewBox={'0 -6 ' + span * 2 + ' 152'}
                style={{ animationDuration: 2.6 + (row % 3) * 0.8 + 's' }}
                fill="none"
                strokeLinecap="square"
                strokeMiterlimit={4}
              >
                {[0, span].map((off) =>
                  half.map((g, n) => {
                    const d = glyphPath(g.ch, g.w, 140, 12);
                    return (
                      <g key={off + '-' + n} transform={'translate(' + (off + g.x) + ' 0)'}>
                        <path d={d} stroke={row % 3 === 2 ? ink : accent} strokeWidth={12} />
                        {row % 3 !== 0 && <path d={d} stroke={paper} strokeWidth={5} />}
                      </g>
                    );
                  }),
                )}
              </svg>
            </div>
          ))}
        </div>
      )}

      {[0, 1].map((n) => (
        <div key={n} className={'wpl-corner ' + (n ? 'wpl-corner-r' : 'wpl-corner-l')}>
          <svg viewBox="0 0 170 170">
            {[108, 124, 140].map((v) => (
              <path key={v} d={'M 0 ' + v + ' L ' + v + ' ' + v + ' L ' + v + ' 0'} fill="none" stroke={accent} strokeWidth={2} />
            ))}
            <rect x={0} y={0} width={92} height={92} fill={accent} />
            {pips(dv[n]).map(([px, py], m) => (
              <circle key={m} cx={48 + px * 20} cy={46 + py * 20} r={7.5} fill={paper} />
            ))}
          </svg>
        </div>
      ))}

      <div className="wpl-sign">
        <Signature lines={sig} color={accent} />
      </div>
    </div>
  );
}
// #endregion stage

function pips(n) {
  const m = {
    1: [[0, 0]],
    2: [[-1, -1], [1, 1]],
    3: [[-1, -1], [0, 0], [1, 1]],
    4: [[-1, -1], [1, -1], [-1, 1], [1, 1]],
    5: [[-1, -1], [1, -1], [0, 0], [-1, 1], [1, 1]],
    6: [[-1, -1], [1, -1], [-1, 0], [1, 0], [-1, 1], [1, 1]],
  };
  return m[n] ?? m[1];
}

function Rule({ a, b, y, mid, delay, color }) {
  if (b - a < 40) return null;
  const dots = mid ? [a, (a + b) / 2, b] : [a, b];
  return (
    <g>
      <path
        className="wpl-draw"
        pathLength={1}
        d={'M ' + a + ' ' + y + ' L ' + b + ' ' + y}
        stroke={color}
        strokeWidth={3}
        style={{ animationDelay: delay + 'ms' }}
      />
      {dots.map((x, n) => (
        <circle key={n} className="wpl-dot" cx={x} cy={y} r={6.5} fill={color} style={{ animationDelay: delay + n * Math.round(HOLD_MS * 0.06) + 'ms' }} />
      ))}
    </g>
  );
}

function LetterCell({ c, i, delay, color }) {
  const pad = c.s;
  const pitch = c.h + c.s * 2 + 24;
  const n = 8;
  const reel = [];
  for (let k = 1; k < n; k++) {
    const ch = AZ[Math.floor(hash(i * 131 + k * 53) * 26)];
    reel.push({ ch, w: Math.min(glyphWidth(ch, c.base, c.s), c.w * 1.25) });
  }
  const style = {
    '--dist': (n - 1) * pitch + 'px',
    '--delay': delay + 'ms',
    '--dur': Math.round(HOLD_MS * 0.32) + 'ms',
  };
  return (
    <svg
      x={c.x - pad}
      y={c.y - pad}
      width={c.w + pad * 2}
      height={c.h + pad * 2}
      viewBox={-pad + ' ' + -pad + ' ' + (c.w + pad * 2) + ' ' + (c.h + pad * 2)}
      overflow="hidden"
    >
      <g className="wpl-reel" style={style} fill="none" stroke={color} strokeWidth={c.s} strokeLinecap="square" strokeMiterlimit={4}>
        <path d={glyphPath(c.ch, c.w, c.h, c.s)} />
        {reel.map((g, k) => (
          <path key={k} transform={'translate(' + (c.w - g.w) / 2 + ' ' + -(k + 1) * pitch + ')'} d={glyphPath(g.ch, g.w, c.h, c.s)} />
        ))}
      </g>
    </svg>
  );
}

function Signature({ lines, color }) {
  const H = 26;
  const S = 3.6;
  const G = 4;
  const rows = lines.map((line) => {
    const chars = [...line.replace(/[^A-Z ]/g, '')];
    let x = 0;
    const items = chars.map((ch) => {
      const w = glyphWidth(ch, 15, S);
      const it = { ch, x, w };
      x += w + G;
      return it;
    });
    return { items, width: Math.max(0, x - G) };
  });
  const widest = Math.max(1, ...rows.map((r) => r.width));
  const k = Math.min(1, 80 / widest);
  const ys = rows.length > 1 ? [30, 66] : [48];
  const step = Math.round(HOLD_MS * 0.022);
  let n = 0;
  return (
    <svg viewBox="-10 -18 140 140">
      <path
        className="wpl-draw"
        pathLength={1}
        d="M 60 8 C 96 6 116 30 114 62 C 112 96 88 114 58 112 C 26 110 6 88 8 58 C 10 28 30 10 66 12"
        fill="none"
        stroke={color}
        strokeWidth={4}
        strokeLinecap="round"
        style={{ animationDelay: at(0.24) + 'ms' }}
      />
      {rows.map((row, ri) => (
        <g key={ri} transform={'translate(' + (60 - (row.width * k) / 2) + ' ' + (ys[ri] - (H * k) / 2) + ') scale(' + k + ')'}>
          {row.items.map((it, ii) => {
            const j = n++;
            const rot = (hash(j * 7 + 3) - 0.5) * 16;
            const dy = (hash(j * 11 + 5) - 0.5) * 5;
            return (
              <path
                key={ii}
                className="wpl-draw"
                pathLength={1}
                transform={'translate(' + it.x + ' ' + dy + ') rotate(' + rot + ' ' + it.w / 2 + ' ' + H / 2 + ')'}
                d={glyphPath(it.ch, it.w, H, S)}
                fill="none"
                stroke={color}
                strokeWidth={S}
                strokeLinecap="round"
                strokeLinejoin="round"
                style={{ animationDelay: at(0.27) + j * step + 'ms' }}
              />
            );
          })}
        </g>
      ))}
      {['M 110 2 L 118 -8', 'M 118 16 L 130 11', 'M 100 -2 L 101 -14'].map((d, i) => (
        <path
          key={d}
          className="wpl-draw"
          pathLength={1}
          d={d}
          stroke={color}
          strokeWidth={4}
          strokeLinecap="round"
          style={{ animationDelay: at(0.62) + i * step + 'ms' }}
        />
      ))}
    </svg>
  );
}

/* ───────────────────────────── Styles ─────────────────────────────
   Pure typographic dissolve: no sweeping panels / sliders.                 */
const CSS = `
.wpl-clip {
  position: fixed;
  inset: 0;
  z-index: 2147483000;
  overflow: hidden;
  background: var(--wpl-paper);
  color: var(--wpl-ink);
  touch-action: none;
  overscroll-behavior: contain;
  font-family: inherit;
  opacity: 1;
}

.wpl-clip[data-phase="in"] {
  animation: wpl-fade-in var(--in) cubic-bezier(0.16, 1, 0.3, 1) both;
}

.wpl-clip[data-phase="hold"] {
  opacity: 1;
}

.wpl-clip[data-phase="out"] {
  pointer-events: none;
  animation: wpl-fade-out var(--out) cubic-bezier(0.16, 1, 0.3, 1) both;
}

@keyframes wpl-fade-in {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes wpl-fade-out {
  from { opacity: 1; }
  to { opacity: 0; }
}

.wpl-root {
  position: absolute;
  inset: 0;
  overflow: hidden;
  background: var(--wpl-paper);
  color: var(--wpl-ink);
  container-type: size;
  isolation: isolate;
  user-select: none;
  -webkit-user-select: none;
  display: flex;
  align-items: center;
  justify-content: center;
}

.wpl-poster {
  position: absolute;
  left: 4%;
  top: 10%;
  width: 92%;
  height: 80%;
  max-width: none;
  overflow: visible;
  z-index: 2;
  animation: wpl-thump calc(var(--h) * .2) calc(var(--in) + var(--h) * .55) both;
}

.wpl-label {
  font-family: "Futura", "Century Gothic", "Avenir Next", "Trebuchet MS", ui-sans-serif, system-ui, sans-serif;
  font-weight: 700;
  font-size: 30px;
  letter-spacing: .04em;
  fill: var(--wpl-accent);
}

.wpl-draw {
  stroke-dasharray: 1;
  stroke-dashoffset: 0;
  animation: wpl-draw calc(var(--h) * .24) cubic-bezier(.6,0,.2,1) both;
}

.wpl-dot {
  transform-box: fill-box;
  transform-origin: center;
  animation: wpl-dot calc(var(--h) * .12) cubic-bezier(.3,1.8,.5,1) both;
}

.wpl-reel {
  animation: wpl-roll var(--dur) var(--delay) both;
}

.wpl-corner {
  position: absolute;
  top: 0;
  width: clamp(64px, 15cqmin, 168px);
  height: clamp(64px, 15cqmin, 168px);
  z-index: 4;
}

.wpl-corner-l {
  left: 0;
  animation: wpl-corner-l calc(var(--h) * .3) calc(var(--in) + var(--h) * .18) cubic-bezier(.2,.9,.2,1) both;
}

.wpl-corner-r {
  right: 0;
  animation: wpl-corner-r calc(var(--h) * .3) calc(var(--in) + var(--h) * .22) cubic-bezier(.2,.9,.2,1) both;
}

.wpl-corner svg {
  display: block;
  width: 100%;
  height: 100%;
  max-width: none;
  overflow: visible;
}

.wpl-corner-r svg {
  transform: scaleX(-1);
}

.wpl-sign {
  position: absolute;
  left: 50%;
  bottom: clamp(12px, 4cqh, 44px);
  width: clamp(60px, 11cqmin, 120px);
  height: clamp(60px, 11cqmin, 120px);
  z-index: 4;
  margin-left: calc(clamp(60px, 11cqmin, 120px) / -2);
}

.wpl-sign svg {
  display: block;
  width: 100%;
  height: 100%;
  max-width: none;
  overflow: visible;
  animation: wpl-sign calc(var(--h) * .24) calc(var(--in) + var(--h) * .24) cubic-bezier(.3,1.6,.5,1) both;
}

.wpl-sr {
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

/* Storm of letters (alphabets animation) */
.wpl-storm {
  position: absolute;
  inset: -25% -15%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 2.2cqh;
  transform: rotate(-7deg);
  pointer-events: none;
  z-index: 3;
}

.wpl-srow {
  height: 15cqh;
  flex: none;
  overflow: visible;
  animation: wpl-row-in calc(var(--in) * .6) cubic-bezier(.2,.9,.2,1) both,
             wpl-shutter calc(var(--h) * .2) cubic-bezier(.7,0,.3,1) forwards;
}

.wpl-srow[data-dir="r"] {
  animation-name: wpl-row-in-r, wpl-shutter;
}

.wpl-strip {
  display: block;
  height: 100%;
  width: auto;
  max-width: none;
  animation: wpl-marq 3s linear infinite;
  will-change: transform;
}

.wpl-strip[data-dir="r"] {
  animation-name: wpl-marq-r;
}

@container (max-aspect-ratio: 9/10) {
  .wpl-poster {
    left: 2%;
    width: 96%;
    top: 12%;
    height: 76%;
  }
}

@keyframes wpl-roll {
  0% { transform: translateY(var(--dist)); opacity: 0; animation-timing-function: cubic-bezier(.5,0,.25,1); }
  6% { opacity: 1; }
  82% { transform: translateY(-16px); opacity: 1; animation-timing-function: ease-in-out; }
  100% { transform: translateY(0px); opacity: 1; }
}

@keyframes wpl-thump {
  0% { transform: none; }
  30% { transform: translateY(7px) scale(1.012); }
  60% { transform: translateY(-3px); }
  100% { transform: none; }
}

@keyframes wpl-draw {
  from { stroke-dashoffset: 1; }
  to { stroke-dashoffset: 0; }
}

@keyframes wpl-dot {
  from { transform: scale(0); }
  to { transform: scale(1); }
}

@keyframes wpl-corner-l {
  from { transform: translate(-70%, -70%); }
  to { transform: translate(0, 0); }
}

@keyframes wpl-corner-r {
  from { transform: translate(70%, -70%); }
  to { transform: translate(0, 0); }
}

@keyframes wpl-sign {
  from { transform: scale(0) rotate(-40deg); }
  to { transform: scale(1) rotate(0deg); }
}

@keyframes wpl-row-in {
  from { transform: translateX(35%); opacity: 0; }
  to { transform: translateX(0); opacity: 1; }
}

@keyframes wpl-row-in-r {
  from { transform: translateX(-35%); opacity: 0; }
  to { transform: translateX(0); opacity: 1; }
}

@keyframes wpl-shutter {
  from { transform: scaleY(1); opacity: 1; }
  to { transform: scaleY(0); opacity: 0; }
}

@keyframes wpl-marq {
  from { transform: translateX(0); }
  to { transform: translateX(-50%); }
}

@keyframes wpl-marq-r {
  from { transform: translateX(-50%); }
  to { transform: translateX(0); }
}

@media (prefers-reduced-motion: reduce) {
  .wpl-clip { display: none; }
}
`;
