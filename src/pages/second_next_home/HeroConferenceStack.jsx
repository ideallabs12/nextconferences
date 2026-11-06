import React, { useState, useEffect, useRef, useCallback, useId } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate, Link } from 'react-router-dom';
import {
  Calendar,
  MapPin,
  ArrowUpRight,
  Layers,
  Sparkles,
  QrCode,
  X,
  Globe,
  Users,
  CheckCircle2,
  Ticket,
  RotateCcw,
} from 'lucide-react';
import localConferencesData from '../../../conferences/conferences.json';
import { fetchConferencesFromSupabase, getConferenceImageUrl } from '../../lib/supabase.js';

// ---------------------------------------------------------------------------
// Procedural Liquid Surface Art Engine (Adapted from 21st.dev GlassFolder
// & bespoke-tuned to NEXT Premier League Conferences' Sapphire/Cyan palette)
// ---------------------------------------------------------------------------

export const ART_PRESETS = {
  nextSapphire: {
    style: 'marble',
    colors: ['#03050a', '#091540', '#1f3bff', '#0b132b', '#2f7bff', '#2ee6ff', '#e0faff'],
    scale: 0.65,
    warp: 3.2,
    angle: -0.5,
    gloss: 0.6,
    veins: 0.45,
  },
  nextAurora: {
    style: 'streak',
    colors: ['#03050a', '#0d259c', '#1f3bff', '#2f7bff', '#2ee6ff', '#ffffff'],
    scale: 0.7,
    warp: 1.6,
    angle: -0.62,
    gloss: 0.3,
    veins: 0.15,
  },
  nextDusk: {
    style: 'marble',
    colors: ['#050711', '#1e1b4b', '#3b82f6', '#0f172a', '#06b6d4', '#67e8f9', '#f0f9ff'],
    scale: 0.72,
    warp: 3.4,
    angle: 0.8,
    gloss: 0.5,
    veins: 0.4,
  },
};

function hexToRgb(hex) {
  let h = hex.trim().replace(/^#/, '');
  if (h.length === 3) h = h[0] + h[0] + h[1] + h[1] + h[2] + h[2];
  const n = /^[0-9a-f]{6}$/i.test(h) ? parseInt(h, 16) : 0x1f3bff;
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

function rng(seed) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function hashString(s) {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) h = Math.imul(h ^ s.charCodeAt(i), 16777619);
  return h >>> 0;
}

function makeFbm(seed) {
  const r = rng(seed);
  const perm = new Uint8Array(512);
  const grad = new Float32Array(512);
  const p = [];
  for (let i = 0; i < 256; i++) p.push(i);
  for (let i = 255; i > 0; i--) {
    const j = Math.floor(r() * (i + 1));
    const t = p[i];
    p[i] = p[j];
    p[j] = t;
  }
  for (let i = 0; i < 512; i++) perm[i] = p[i & 255];
  for (let i = 0; i < 256; i++) {
    const a = r() * Math.PI * 2;
    grad[i * 2] = Math.cos(a);
    grad[i * 2 + 1] = Math.sin(a);
  }
  const noise = (x, y) => {
    const xi = Math.floor(x);
    const yi = Math.floor(y);
    const xf = x - xi;
    const yf = y - yi;
    const X = xi & 255;
    const Y = yi & 255;
    const h00 = perm[X + perm[Y]] * 2;
    const h10 = perm[X + 1 + perm[Y]] * 2;
    const h01 = perm[X + perm[Y + 1]] * 2;
    const h11 = perm[X + 1 + perm[Y + 1]] * 2;
    const d00 = grad[h00] * xf + grad[h00 + 1] * yf;
    const d10 = grad[h10] * (xf - 1) + grad[h10 + 1] * yf;
    const d01 = grad[h01] * xf + grad[h01 + 1] * (yf - 1);
    const d11 = grad[h11] * (xf - 1) + grad[h11 + 1] * (yf - 1);
    const u = xf * xf * xf * (xf * (xf * 6 - 15) + 10);
    const v = yf * yf * yf * (yf * (yf * 6 - 15) + 10);
    return d00 + u * (d10 - d00) + v * (d01 - d00 + u * (d11 - d01 - d10 + d00));
  };
  return (x, y, octaves) => {
    let sum = 0;
    let amp = 0.5;
    for (let i = 0; i < octaves; i++) {
      sum += amp * noise(x, y);
      const nx = 1.6 * x + 1.2 * y + 7.1;
      y = -1.2 * x + 1.6 * y + 3.3;
      x = nx;
      amp *= 0.5;
    }
    return sum;
  };
}

function createArtJob(width, height, recipe, seed) {
  const w = Math.max(1, Math.round(width));
  const h = Math.max(1, Math.round(height));
  const colors = recipe.colors.length >= 2 ? recipe.colors : ['#03050a', '#2ee6ff'];
  const stops = colors.map((c, i) => ({ t: i / (colors.length - 1), c: hexToRgb(c) }));
  const scale = recipe.scale ?? 0.7;
  const warp = recipe.warp ?? 3;
  const gloss = recipe.gloss ?? 0.4;
  const veins = recipe.veins ?? 0;
  const streak = recipe.style === 'streak';
  const fbm = makeFbm(seed * 977 + 13);
  const r = rng(seed + 1);
  const ox = r() * 50;
  const oy = r() * 50;
  const angle = (recipe.angle ?? 0) + (r() - 0.5) * 0.5;
  const ca = Math.cos(angle);
  const sa = Math.sin(angle);
  const m = Math.min(w, h);
  const gw = Math.ceil(w / 2) + 3;
  const gh = Math.ceil(h / 2) + 3;
  const G = new Float32Array(gw * gh);
  const GQ = new Float32Array(gw * gh);
  const F = new Float32Array(w * h);
  const Q = new Float32Array(w * h);
  const pixels = new Uint8ClampedArray(w * h * 4);
  let row = 0;

  const field = (gy) => {
    for (let gx = 0; gx < gw; gx++) {
      const u = ((gx - 1) * 2 - w / 2) / m;
      const v = ((gy - 1) * 2 - h / 2) / m;
      let px = (u * ca - v * sa) * scale;
      let py = (u * sa + v * ca) * scale;
      if (streak) {
        px *= 0.14;
        py *= 2.2;
      }
      px += ox;
      py += oy;
      const qx = fbm(px, py, 3);
      const qy = fbm(px + 5.2, py + 1.3, 3);
      const rx = fbm(px + warp * qx + 1.7, py + warp * qy + 9.2, 3);
      const ry = fbm(px + warp * qx + 8.3, py + warp * qy + 2.8, 3);
      G[gy * gw + gx] = fbm(px + warp * rx, py + warp * ry, 4);
      GQ[gy * gw + gx] = Math.sqrt(qx * qx + qy * qy);
    }
  };

  const upsample = () => {
    const cr = (a, b, c, d) => (-a + 9 * b + 9 * c - d) / 16;
    const T = new Float32Array(w * gh);
    for (let gy = 0; gy < gh; gy++) {
      const rIdx = gy * gw;
      for (let x = 0; x < w; x++) {
        const c = (x >> 1) + 1;
        T[gy * w + x] = x & 1 ? cr(G[rIdx + c - 1], G[rIdx + c], G[rIdx + c + 1], G[rIdx + c + 2]) : G[rIdx + c];
      }
    }
    for (let y = 0; y < h; y++) {
      const c = (y >> 1) + 1;
      for (let x = 0; x < w; x++) {
        F[y * w + x] =
          y & 1 ? cr(T[(c - 1) * w + x], T[c * w + x], T[(c + 1) * w + x], T[(c + 2) * w + x]) : T[c * w + x];
        const gx = (x >> 1) + 1;
        const q0 = GQ[c * gw + gx];
        const qx = x & 1 ? (q0 + GQ[c * gw + gx + 1]) / 2 : q0;
        const q1 =
          y & 1 ? (x & 1 ? (GQ[(c + 1) * gw + gx] + GQ[(c + 1) * gw + gx + 1]) / 2 : GQ[(c + 1) * gw + gx]) : qx;
        Q[y * w + x] = (qx + q1) / 2;
      }
    }
  };

  const colorize = () => {
    const sample = [];
    const stride = Math.max(1, Math.floor(F.length / 4096));
    for (let i = 0; i < F.length; i += stride) sample.push(F[i]);
    sample.sort((a, b) => a - b);
    const lo = sample[Math.floor(sample.length * 0.02)];
    const hi = sample[Math.floor(sample.length * 0.98)];
    const k = 1 / (hi - lo || 1);
    const lx = -0.55;
    const ly = -0.65;
    const lz = 0.52;
    const slope = k * m * 0.012;
    for (let y = 0; y < h; y++) {
      for (let x = 0; x < w; x++) {
        const i = y * w + x;
        let t = (F[i] - lo) * k;
        t = t < 0 ? 0 : t > 1 ? 1 : t;
        let j = 1;
        while (j < stops.length - 1 && stops[j].t < t) j++;
        const a = stops[j - 1];
        const b = stops[j];
        let f = (t - a.t) / (b.t - a.t || 1);
        f = f < 0 ? 0 : f > 1 ? 1 : f;
        f = f * f * (3 - 2 * f);
        const gx = (F[x < w - 1 ? i + 1 : i] - F[x > 0 ? i - 1 : i]) * slope;
        const gy = (F[y < h - 1 ? i + w : i] - F[y > 0 ? i - w : i]) * slope;
        const nd = (-gx * lx - gy * ly + lz) / Math.sqrt(gx * gx + gy * gy + 1);
        const spec = Math.pow(nd > 0 ? nd : 0, 24) * gloss * 255;
        const silk = 1 + 0.035 * Math.sin(t * 150 + Q[i] * 24);
        const vein = veins * Math.max(0, 1 - Math.abs(Q[i] - 0.42) * 14) * 0.6;
        const lit = (0.82 + 0.28 * nd) * silk * (1 - vein);
        pixels[i * 4] = (a.c[0] + (b.c[0] - a.c[0]) * f) * lit + spec;
        pixels[i * 4 + 1] = (a.c[1] + (b.c[1] - a.c[1]) * f) * lit + spec;
        pixels[i * 4 + 2] = (a.c[2] + (b.c[2] - a.c[2]) * f) * lit + spec;
        pixels[i * 4 + 3] = 255;
      }
    }
  };

  const step = (rows) => {
    if (row >= gh) return true;
    const end = Math.min(gh, row + Math.max(1, rows));
    while (row < end) field(row++);
    if (row < gh) return false;
    upsample();
    colorize();
    return true;
  };

  return { width: w, height: h, pixels, step };
}

function fanSlot(index, count) {
  return count <= 1 ? 0 : (index / (count - 1)) * 2 - 1;
}

const recipeOf = (art) => (typeof art === 'string' ? ART_PRESETS[art] || ART_PRESETS.nextSapphire : art);

const artCache = new Map();
const queue = [];
let pumping = false;

function pump() {
  if (pumping) return;
  pumping = true;
  const tick = () => {
    const until = performance.now() + 7;
    while (queue.length && performance.now() < until) {
      const head = queue[0];
      if (head.job.step(4)) {
        queue.shift();
        const c = document.createElement('canvas');
        c.width = head.job.width;
        c.height = head.job.height;
        c.getContext('2d')?.putImageData(new ImageData(head.job.pixels, c.width, c.height), 0, 0);
        head.done(c);
      }
    }
    if (queue.length) requestAnimationFrame(tick);
    else pumping = false;
  };
  requestAnimationFrame(tick);
}

function paint(recipe, seed, w, h, priority) {
  const key = JSON.stringify([recipe, seed, w, h]);
  let p = artCache.get(key);
  if (!p) {
    p = new Promise((done) => {
      let at = queue.length;
      while (at > 1 && queue[at - 1].priority > priority) at--;
      queue.splice(at, 0, { job: createArtJob(w, h, recipe, seed), priority, done });
      pump();
    });
    artCache.set(key, p);
  }
  return p;
}

function ArtCanvas({ art, seed, w, h, density, priority, className }) {
  const ref = useRef(null);
  const [ready, setReady] = useState(false);
  const recipe = recipeOf(art);
  const key = JSON.stringify(recipe);
  const pw = Math.round(w * density);
  const ph = Math.round(h * density);

  useEffect(() => {
    let live = true;
    setReady(false);
    paint(JSON.parse(key), seed, pw, ph, priority).then((src) => {
      const c = ref.current;
      if (!live || !c) return;
      c.width = src.width;
      c.height = src.height;
      c.getContext('2d')?.drawImage(src, 0, 0);
      setReady(true);
    });
    return () => {
      live = false;
    };
  }, [key, seed, pw, ph, priority]);

  return (
    <canvas
      ref={ref}
      aria-hidden="true"
      className={className}
      data-ready={ready || undefined}
      style={{ width: w, height: h, maxWidth: 'none' }}
    />
  );
}

// ---------------------------------------------------------------------------
// Deterministic SVG QR Code Generator for Conference VIP Pass
// ---------------------------------------------------------------------------
function ConferenceQrCode({ value = 'next-conference', size = 86 }) {
  const cells = React.useMemo(() => {
    const N = 21;
    const grid = Array.from({ length: N }, () => Array(N).fill(false));
    const reserved = Array.from({ length: N }, () => Array(N).fill(false));

    const drawFinder = (ox, oy) => {
      for (let y = -1; y <= 7; y++) {
        for (let x = -1; x <= 7; x++) {
          const gx = ox + x;
          const gy = oy + y;
          if (gx < 0 || gy < 0 || gx >= N || gy >= N) continue;
          reserved[gy][gx] = true;
          const onBorder = x === 0 || x === 6 || y === 0 || y === 6;
          const inCore = x >= 2 && x <= 4 && y >= 2 && y <= 4;
          const inBounds = x >= 0 && x <= 6 && y >= 0 && y <= 6;
          grid[gy][gx] = inBounds && (onBorder || inCore);
        }
      }
    };

    drawFinder(0, 0);
    drawFinder(N - 7, 0);
    drawFinder(0, N - 7);

    // Timing patterns
    for (let i = 8; i < N - 8; i++) {
      reserved[6][i] = true;
      reserved[i][6] = true;
      grid[6][i] = i % 2 === 0;
      grid[i][6] = i % 2 === 0;
    }

    // Center brand reserve (3x3)
    for (let y = 9; y <= 11; y++) {
      for (let x = 9; x <= 11; x++) {
        reserved[y][x] = true;
        grid[y][x] = false;
      }
    }

    const r = rng(hashString(value));
    for (let y = 0; y < N; y++) {
      for (let x = 0; x < N; x++) {
        if (!reserved[y][x]) {
          grid[y][x] = r() > 0.46;
        }
      }
    }

    const rects = [];
    for (let y = 0; y < N; y++) {
      for (let x = 0; x < N; x++) {
        if (grid[y][x]) rects.push({ x, y });
      }
    }
    return rects;
  }, [value]);

  return (
    <div className="hcs-qr-box" style={{ width: size, height: size }}>
      <svg viewBox="0 0 21 21" width={size} height={size} shapeRendering="crispEdges">
        <rect width="21" height="21" fill="#ffffff" rx="1.5" />
        {cells.map((c, idx) => (
          <rect
            key={idx}
            x={c.x}
            y={c.y}
            width="0.92"
            height="0.92"
            rx="0.2"
            fill="#03050a"
          />
        ))}
        {/* Center NEXT badge inside QR */}
        <rect x="8.8" y="8.8" width="3.4" height="3.4" rx="0.8" fill="#1f3bff" />
        <circle cx="10.5" cy="10.5" r="0.85" fill="#2ee6ff" />
      </svg>
      <div className="hcs-qr-scanline" aria-hidden="true" />
    </div>
  );
}

// ---------------------------------------------------------------------------
// Stage Geometry (Scaled dynamically to fit the Hero right column)
// ---------------------------------------------------------------------------
const W = 380;
const H = 304;
const HEADROOM = 46;
const FRONT_TOP = 98;
const FRONT_H = H - FRONT_TOP;
const SHEET_W = 312;
const SHEET_H = 210;

const BACK_PATH =
  `M0 62A24 24 0 0 1 24 38L162 38C188 38 190 0 218 0L356 0A24 24 0 0 1 380 24L380 280A24 24 0 0 1 356 304L24 304A24 24 0 0 1 0 280Z`;

const FRONT_PATH =
  `M0 24A24 24 0 0 1 24 0L134 0C162 0 164 34 192 34L356 34A24 24 0 0 1 380 58L380 ${FRONT_H - 24}A24 24 0 0 1 356 ${FRONT_H}L24 ${FRONT_H}A24 24 0 0 1 0 ${FRONT_H - 24}Z`;

const MAX_VISIBLE = 4;

/** Helper to clean conference title for compact card display */
function formatShortTitle(rawTitle = '') {
  return rawTitle
    .replace(/^NEXT Premier League Conferences?\s+on\s+/i, '')
    .replace(/^NEXT Premier League\s+/i, '')
    .trim();
}

export default function HeroConferenceStack() {
  const uid = useId().replace(/:/g, '');
  const navigate = useNavigate();
  const rootRef = useRef(null);
  const filesRef = useRef(null);
  const hitRef = useRef(null);
  const keyRef = useRef(null);
  const passCardRef = useRef(null);

  const [conferencesData, setConferencesData] = useState(localConferencesData);
  const [open, setOpen] = useState(false);
  const [hovered, setHovered] = useState(false);
  const [entered, setEntered] = useState(false);
  const [droppedId, setDroppedId] = useState(null);
  const [bump, setBump] = useState(0);
  const [containerWidth, setContainerWidth] = useState(440);
  // Extracted Conference Card state (when user clicks a card to pull it out of the folder)
  const [selectedConf, setSelectedConf] = useState(null);

  // Fetch live conferences from Supabase if available
  useEffect(() => {
    fetchConferencesFromSupabase()
      .then((data) => {
        if (data && data.length > 0) setConferencesData(data);
      })
      .catch(() => {});
  }, []);

  // Build ordered list of flagship conferences
  const initialConfs = React.useMemo(() => {
    return [...conferencesData]
      .sort((a, b) => {
        const oA = typeof a.displayOrder === 'number' ? a.displayOrder : typeof a.order === 'number' ? a.order : 999;
        const oB = typeof b.displayOrder === 'number' ? b.displayOrder : typeof b.order === 'number' ? b.order : 999;
        return oA - oB;
      })
      .slice(0, 5)
      .map((conf, idx) => {
        const minPrice =
          Array.isArray(conf.packages) && conf.packages.length > 0
            ? Math.min(...conf.packages.map((p) => Number(p.price) || 399))
            : 399;
        const cityCode = (conf.location || 'GLB')
          .slice(0, 3)
          .toUpperCase();
        return {
          id: conf.slug || `conf-${idx}`,
          index: idx + 1,
          slug: conf.slug,
          fullTitle: conf.title,
          shortTitle: formatShortTitle(conf.title),
          theme: (conf.theme || '').replace(/^[“"]+|[”"]+$/g, ''),
          date: (conf.date || '').replace(/\.$/, ''),
          location: (conf.location || '').replace(/\.$/, ''),
          image: getConferenceImageUrl(conf),
          rawImage: conf.image,
          minPrice,
          serialCode: `NPLC-26-${cityCode}-0${idx + 1}`,
          art: idx % 2 === 0 ? 'nextSapphire' : 'nextDusk',
        };
      });
  }, [conferencesData]);

  const [deck, setDeck] = useState(initialConfs);

  useEffect(() => {
    setDeck(initialConfs);
  }, [initialConfs]);

  // Responsive width scaling
  useEffect(() => {
    const updateWidth = () => {
      const vw = window.innerWidth;
      if (vw < 360) setContainerWidth(Math.min(270, vw - 24));
      else if (vw < 480) setContainerWidth(Math.min(340, vw - 40));
      else if (vw < 820) setContainerWidth(390);
      else if (vw < 1200) setContainerWidth(410);
      else setContainerWidth(445);
    };
    updateWidth();
    window.addEventListener('resize', updateWidth);
    return () => window.removeEventListener('resize', updateWidth);
  }, []);

  // Entrance assembly animation
  useEffect(() => {
    const t = setTimeout(() => setEntered(true), 180);
    return () => clearTimeout(t);
  }, []);

  // 3D Pointer Parallax
  useEffect(() => {
    const el = rootRef.current;
    if (!el) return;
    let raf = 0;
    let px = 0;
    let py = 0;
    const write = () => {
      raf = 0;
      el.style.setProperty('--gf-px', px.toFixed(3));
      el.style.setProperty('--gf-py', py.toFixed(3));
    };
    const move = (e) => {
      if (e.pointerType === 'touch') return;
      const r = el.getBoundingClientRect();
      px = ((e.clientX - r.left) / r.width) * 2 - 1;
      py = ((e.clientY - r.top) / r.height) * 2 - 1;
      if (!raf) raf = requestAnimationFrame(write);
    };
    const leave = () => {
      px = 0;
      py = 0;
      if (!raf) raf = requestAnimationFrame(write);
    };
    el.addEventListener('pointermove', move);
    el.addEventListener('pointerleave', leave);
    return () => {
      el.removeEventListener('pointermove', move);
      el.removeEventListener('pointerleave', leave);
      cancelAnimationFrame(raf);
    };
  }, []);

  // Close fan or extracted pass on Escape or clicking outside anywhere on the screen
  useEffect(() => {
    if (!open && !selectedConf) return;

    const onKey = (e) => {
      if (e.key === 'Escape') {
        if (selectedConf) {
          setSelectedConf(null);
        } else {
          setOpen(false);
          hitRef.current?.focus();
        }
      }
    };

    const onPointerDown = (e) => {
      if (selectedConf && passCardRef.current && !passCardRef.current.contains(e.target)) {
        setSelectedConf(null);
      }
    };

    // Small delay so opening click doesn't instantly dismiss
    const timer = setTimeout(() => {
      window.addEventListener('pointerdown', onPointerDown);
    }, 60);

    document.addEventListener('keydown', onKey);

    const prevOverflow = document.body.style.overflow;
    if (selectedConf) {
      document.body.style.overflow = 'hidden';
    }

    return () => {
      clearTimeout(timer);
      window.removeEventListener('pointerdown', onPointerDown);
      document.removeEventListener('keydown', onKey);
      if (selectedConf) {
        document.body.style.overflow = prevOverflow;
      }
    };
  }, [open, selectedConf]);

  // Cycle the stack: takes the back-most card and drops it to the front of the pocket!
  const cycleNextCard = useCallback(() => {
    setDeck((prev) => {
      if (prev.length <= 1) return prev;
      const [first, ...rest] = prev;
      const updated = [...rest, first];
      const newestFront = updated[updated.length - 1];
      setDroppedId(newestFront.id);
      setBump((b) => b + 1);
      return updated;
    });
  }, []);

  // Gentle auto-cycle every 5.2s when idle (not hovered, not fanned, and no extracted card)
  useEffect(() => {
    if (hovered || open || selectedConf) return;
    const interval = setInterval(() => {
      cycleNextCard();
    }, 5200);
    return () => clearInterval(interval);
  }, [hovered, open, selectedConf, cycleNextCard]);

  const k = containerWidth / W;
  const density = Math.min(1.5, Math.max(1, typeof window === 'undefined' ? 1 : window.devicePixelRatio || 1)) * k;

  const start = Math.max(0, deck.length - MAX_VISIBLE);
  const visible = deck.slice(start);
  const frontConf = visible[visible.length - 1] || deck[0];

  return (
    <div
      className="hcs-wrapper"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <style>{HCS_CSS}</style>

      {/* ─── Architectural Orbital Rings & Ambient Backdrop (Fills Right Column) ─── */}
      <div className="hcs-ambient-glow" aria-hidden="true" />
      <div className="hcs-pedestal-glow" aria-hidden="true" />
      <svg className="hcs-orbital-rings" viewBox="0 0 560 560" aria-hidden="true">
        <defs>
          <linearGradient id={`hcs-orb-${uid}`} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#1f3bff" stopOpacity="0.24" />
            <stop offset="50%" stopColor="#2ee6ff" stopOpacity="0.35" />
            <stop offset="100%" stopColor="#03050a" stopOpacity="0.06" />
          </linearGradient>
        </defs>
        <circle cx="280" cy="280" r="250" fill="none" stroke={`url(#hcs-orb-${uid})`} strokeWidth="1" strokeDasharray="5 7" />
        <circle cx="280" cy="280" r="198" fill="none" stroke="rgba(3,5,10,0.06)" strokeWidth="1" />
        <circle cx="96" cy="112" r="4" fill="#1f3bff" opacity="0.5" />
        <circle cx="476" cy="128" r="4" fill="#2ee6ff" opacity="0.8" />
        <circle cx="64" cy="390" r="3.5" fill="#1f3bff" opacity="0.4" />
      </svg>

      {/* ─── Natural Architectural Floating Elements Framing the Folder ─── */}
      {/* 1. Top-Left Floating Delegate & Keynote Telemetry Card */}
      <div className="hcs-float-card hcs-float-topleft">
        <div className="hcs-float-users-icon" aria-hidden="true">
          <svg viewBox="0 0 24 24" width="22" height="22" fill="none">
            <path
              d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"
              stroke="#0084ff"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <circle
              cx="9"
              cy="7"
              r="4"
              stroke="#0084ff"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M22 21v-2a4 4 0 0 0-3-3.87"
              stroke="#00b4d8"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M16 3.13a4 4 0 0 1 0 7.75"
              stroke="#00b4d8"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
        <div className="hcs-float-copy">
          <span className="hcs-float-val">5,000+ Visionaries</span>
          <span className="hcs-float-sub">Attend • Network • Collaborate</span>
        </div>
      </div>

      {/* 2. Top-Right Floating Active Destination Hub Pill */}
      {frontConf && (
        <button
          type="button"
          className="hcs-float-card hcs-float-topright"
          onClick={() => setSelectedConf(frontConf)}
          title="Click to inspect official conference pass & QR code"
        >
          <span className="hcs-pulse-star">✦</span>
          <div className="hcs-float-copy">
            <span className="hcs-float-eyebrow">ACTIVE SUMMIT PASS</span>
            <span className="hcs-float-val">{frontConf.location}</span>
          </div>
        </button>
      )}

      {/* 3. Bottom-Left Floating Accreditation & B2B Badge */}
      <div className="hcs-float-card hcs-float-bottomleft">
        <div className="hcs-float-icon-badge">
          <CheckCircle2 size={15} />
        </div>
        <div className="hcs-float-copy">
          <span className="hcs-float-val">CPD Accredited</span>
          <span className="hcs-float-sub">Click any card for VIP Pass &amp; Info</span>
        </div>
      </div>

      {/* ─── 3D Glass Folder Stage ─── */}
      <div
        ref={rootRef}
        className={`gf-root ${selectedConf ? 'gf-root--dimmed' : ''}`}
        data-tone="dark"
        data-open={open || undefined}
        data-entered={entered || undefined}
        data-place="bottom-left"
        style={{ width: containerWidth, height: (H + HEADROOM) * k }}
      >
        <div
          className="gf-stage"
          style={{ transform: `translateY(${HEADROOM * k}px) scale(${k})` }}
        >
          <div className="gf-tilt">
            <div className="gf-shadow" aria-hidden="true" />

            {/* Back Panel with NEXT Sapphire Liquid Marble Shader */}
            <div
              className="gf-back"
              style={{ clipPath: `path('${BACK_PATH}')` }}
              aria-hidden="true"
            >
              <ArtCanvas
                className="gf-art"
                art="nextSapphire"
                seed={7}
                w={W + 24}
                h={H + 24}
                density={density}
                priority={0}
              />
              <div className="gf-back-sheen" />
            </div>

            <svg
              className="gf-rim gf-back-rim"
              viewBox={`0 0 ${W} ${H}`}
              aria-hidden="true"
            >
              <path d={BACK_PATH} />
            </svg>

            {/* Stacked Conference Cards Tucked Inside the Glass Pocket */}
            <div
              ref={filesRef}
              className="gf-files"
              role="list"
              aria-label="Upcoming Flagship Conferences"
            >
              {visible.map((conf, v) => {
                const slot = fanSlot(v, visible.length);
                const jitter = rng(hashString(conf.id));
                const isFront = v === visible.length - 1;
                const isDropped = conf.id === droppedId;
                const isSelected = selectedConf?.id === conf.id;

                return (
                  <div key={conf.id} role="listitem" className="gf-sheet-slot">
                    <button
                      type="button"
                      className={`gf-sheet gf-sheet--art ${isDropped ? 'gf-sheet--drop' : ''} ${isFront ? 'gf-sheet--front' : ''} ${isSelected ? 'gf-sheet--extracted' : ''}`}
                      style={{
                        '--gf-slot': slot,
                        '--gf-depth': visible.length - 1 - v,
                        '--gf-jx': `${((jitter() - 0.5) * 8).toFixed(2)}px`,
                        '--gf-jr': `${((jitter() - 0.5) * 2.8).toFixed(2)}deg`,
                        zIndex: v + 1,
                      }}
                      onAnimationEnd={isDropped ? () => setDroppedId(null) : undefined}
                      onClick={(e) => {
                        e.stopPropagation();
                        // Pull this conference card out of the folder with QR pass!
                        setSelectedConf(conf);
                      }}
                      title={`Click to pull out ${conf.shortTitle} Pass`}
                    >
                      {/* Conference Cover Image with Fallback */}
                      {conf.image ? (
                        <img
                          className="gf-sheet-art"
                          src={conf.image}
                          alt={conf.shortTitle}
                          width={SHEET_W}
                          height={SHEET_H}
                          draggable={false}
                          onError={(e) => {
                            e.target.onerror = null;
                            if (conf.rawImage) {
                              e.target.src = `/conferences_imgs/${conf.rawImage}`;
                            }
                          }}
                        />
                      ) : (
                        <ArtCanvas
                          className="gf-sheet-art"
                          art={conf.art}
                          seed={hashString(conf.id) % 997}
                          w={SHEET_W}
                          h={SHEET_H}
                          density={Math.min(density, 1.25)}
                          priority={1}
                        />
                      )}

                      {/* Top Header on each card (Always visible peeking out of the pocket) */}
                      <span className="gf-sheet-head">
                        <span className="gf-sheet-badges">
                          <span className="gf-conf-date-pill">
                            <Calendar size={10} />
                            <span>{conf.date}</span>
                          </span>
                          <span className="gf-conf-loc-pill">
                            <MapPin size={10} />
                            <span>{conf.location}</span>
                          </span>
                        </span>
                        <span className="gf-conf-card-title">{conf.shortTitle}</span>
                      </span>

                      {/* Bottom Explore CTA revealed when fanned/hovered */}
                      <span className="gf-sheet-foot">
                        <span className="gf-conf-theme-tag">
                          <QrCode size={11} />
                          <span>Click for VIP Pass &amp; QR</span>
                        </span>
                        <span className="gf-conf-card-cta">
                          <span>Pull Out</span>
                          <ArrowUpRight size={12} />
                        </span>
                      </span>
                    </button>
                  </div>
                );
              })}
            </div>

            {/* Hinged Frosted Glass Front Panel */}
            <div
              key={bump}
              className={`gf-front ${bump ? 'gf-front--bump' : ''}`}
              style={{ clipPath: `path('${FRONT_PATH}')` }}
            >
              <div className="gf-tint" aria-hidden="true" />
              <div className="gf-spec" aria-hidden="true" />
              <svg
                className="gf-rim gf-front-rim"
                viewBox={`0 0 ${W} ${FRONT_H}`}
                aria-hidden="true"
              >
                <defs>
                  <linearGradient id={`gf-rim-${uid}`} x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0" stopColor="#2ee6ff" stopOpacity="0.95" />
                    <stop offset="0.45" stopColor="#ffffff" stopOpacity="0.45" />
                    <stop offset="1" stopColor="#1f3bff" stopOpacity="0.25" />
                  </linearGradient>
                </defs>
                <path d={FRONT_PATH} stroke={`url(#gf-rim-${uid})`} />
              </svg>

              <button
                ref={hitRef}
                type="button"
                className="gf-hit"
                aria-expanded={open}
                aria-label={open ? 'Stack conference cards' : 'Fan out conference cards'}
                onClick={() => setOpen((o) => !o)}
              />

              {frontConf && (
                <div className="gf-label">
                  <span className="gf-eyebrow">
                    <Sparkles size={11} className="gf-eyebrow-icon" />
                    <span>FLAGSHIP SUMMIT DECK · {deck.length} EVENTS</span>
                  </span>
                  <span className="gf-title" key={frontConf.id}>
                    {frontConf.shortTitle}
                  </span>
                  <span className="gf-meta" key={`${frontConf.id}-meta`}>
                    {frontConf.location} · {frontConf.date}
                  </span>
                </div>
              )}
            </div>

            {/* Tactile Corner Key: Cycles to the Next Conference in the Stack */}
            <button
              ref={keyRef}
              type="button"
              className="gf-key gf-key--cycle"
              aria-label="Cycle to next conference card"
              title="Next Summit in Stack"
              onClick={(e) => {
                e.stopPropagation();
                cycleNextCard();
              }}
            >
              <Layers size={22} className="gf-cycle-icon" />
              <span className="gf-key-sub">NEXT</span>
            </button>
          </div>
        </div>
      </div>

      {/* ─── Extracted Professional Conference Pass Card (Rendered via Body Portal) ─── */}
      {selectedConf && typeof document !== 'undefined' && createPortal(
        <div
          className="hcs-pass-backdrop"
          onClick={() => setSelectedConf(null)}
          role="dialog"
          aria-modal="true"
          aria-label={`${selectedConf.shortTitle} Conference Pass`}
        >
          <div
            ref={passCardRef}
            className="hcs-pass-card"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Top Cover Visual & Official Header */}
            <div className="hcs-pass-cover">
              {selectedConf.image && (
                <img
                  src={selectedConf.image}
                  alt={selectedConf.shortTitle}
                  className="hcs-pass-img"
                  onError={(e) => {
                    e.target.onerror = null;
                    if (selectedConf.rawImage) {
                      e.target.src = `/conferences_imgs/${selectedConf.rawImage}`;
                    }
                  }}
                />
              )}
              <div className="hcs-pass-cover-overlay" />

              <div className="hcs-pass-top-bar">
                <span className="hcs-pass-official-badge">
                  <Ticket size={12} />
                  <span>OFFICIAL SUMMIT PASS · 0{selectedConf.index}</span>
                </span>
                <button
                  type="button"
                  className="hcs-pass-close"
                  onClick={() => setSelectedConf(null)}
                  aria-label="Return card to folder"
                  title="Put back in folder"
                >
                  <X size={15} />
                </button>
              </div>

              <div className="hcs-pass-cover-title-wrap">
                <span className="hcs-pass-series">NEXT PREMIER LEAGUE CONGRESS</span>
                <h3 className="hcs-pass-title">{selectedConf.shortTitle}</h3>
              </div>
            </div>

            {/* Pass Body: Event Details */}
            <div className="hcs-pass-body">
              {selectedConf.theme && (
                <p className="hcs-pass-theme">“{selectedConf.theme}”</p>
              )}

              <div className="hcs-pass-grid">
                <div className="hcs-pass-field">
                  <span className="hcs-pass-lbl">DATE</span>
                  <span className="hcs-pass-val">
                    <Calendar size={13} className="hcs-pass-ic" />
                    {selectedConf.date}
                  </span>
                </div>
                <div className="hcs-pass-field">
                  <span className="hcs-pass-lbl">LOCATION</span>
                  <span className="hcs-pass-val">
                    <MapPin size={13} className="hcs-pass-ic" />
                    {selectedConf.location}
                  </span>
                </div>
                <div className="hcs-pass-field">
                  <span className="hcs-pass-lbl">FORMAT</span>
                  <span className="hcs-pass-val">
                    <Globe size={13} className="hcs-pass-ic" />
                    Hybrid (In-Person &amp; Virtual)
                  </span>
                </div>
                <div className="hcs-pass-field">
                  <span className="hcs-pass-lbl">DELEGATE PASS</span>
                  <span className="hcs-pass-val hcs-pass-price">
                    From ${selectedConf.minPrice} USD
                  </span>
                </div>
              </div>
            </div>

            {/* Perforated Ticket Divider with Side Notches */}
            <div className="hcs-pass-perforation" aria-hidden="true">
              <span className="hcs-notch hcs-notch-l" />
              <span className="hcs-perf-line" />
              <span className="hcs-notch hcs-notch-r" />
            </div>

            {/* Pass Stub Footer: Authentic SVG QR Code + Serial + Actions */}
            <div className="hcs-pass-stub">
              <div className="hcs-pass-qr-row">
                <ConferenceQrCode
                  value={`https://nextconferences.com/conference/${selectedConf.slug}`}
                  size={78}
                />
                <div className="hcs-pass-serial-info">
                  <span className="hcs-serial-tag">{selectedConf.serialCode}</span>
                  <span className="hcs-serial-hint">
                    Scan or click below to view full agenda, keynote speakers &amp; registration packages.
                  </span>
                  <div className="hcs-pass-actions">
                    <button
                      type="button"
                      className="hcs-pass-btn-primary"
                      onClick={() => navigate(`/conference/${selectedConf.slug}`)}
                    >
                      <span>Open Conference</span>
                      <ArrowUpRight size={14} />
                    </button>
                    <Link
                      to="/register"
                      className="hcs-pass-btn-ghost"
                    >
                      Register
                    </Link>
                    <button
                      type="button"
                      className="hcs-pass-btn-back"
                      onClick={() => setSelectedConf(null)}
                      title="Return to folder"
                    >
                      <RotateCcw size={13} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}

const HCS_CSS = `
.hcs-wrapper {
  position: relative;
  width: 100%;
  min-height: 470px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  z-index: 5;
  user-select: none;
}

.hcs-ambient-glow {
  position: absolute;
  width: 96%;
  height: 88%;
  top: 6%;
  border-radius: 50%;
  background: radial-gradient(
    circle,
    rgba(46, 230, 255, 0.38) 0%,
    rgba(31, 59, 255, 0.22) 48%,
    transparent 74%
  );
  filter: blur(36px);
  pointer-events: none;
  z-index: -2;
}

/* Architectural Orbital Rings Framing the Folder */
.hcs-orbital-rings {
  position: absolute;
  width: 540px;
  height: 540px;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  pointer-events: none;
  z-index: -1;
  animation: hcsSlowSpin 50s linear infinite;
}

@keyframes hcsSlowSpin {
  to { transform: translate(-50%, -50%) rotate(360deg); }
}

/* ─── Natural Floating Architectural Badges Around the Folder ─── */
.hcs-float-card {
  position: absolute;
  z-index: 14;
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 9px 14px;
  border-radius: 16px;
  background: rgba(255, 255, 255, 0.9);
  border: 1px solid rgba(3, 5, 10, 0.09);
  box-shadow:
    0 14px 34px -8px rgba(3, 5, 10, 0.1),
    inset 0 1px 0 rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  font-family: 'Instrument Sans', system-ui, sans-serif;
  transition: transform 0.3s cubic-bezier(0.2, 0.8, 0.2, 1), box-shadow 0.3s ease, border-color 0.3s ease;
}

.hcs-float-topleft {
  top: 32px;
  left: -34px;
  animation: hcsFloatA 6s ease-in-out infinite alternate;
}

.hcs-float-topright {
  top: 46px;
  right: -18px;
  cursor: pointer;
  animation: hcsFloatB 7s ease-in-out infinite alternate;
}

.hcs-float-topright:hover {
  border-color: #1f3bff;
  box-shadow: 0 18px 38px -8px rgba(31, 59, 255, 0.22);
  transform: translateY(-3px) scale(1.02);
}

.hcs-float-bottomleft {
  bottom: 14px;
  left: -38px;
  animation: hcsFloatB 6.5s ease-in-out infinite alternate-reverse;
}

@keyframes hcsFloatA {
  from { transform: translateY(0px); }
  to { transform: translateY(-7px); }
}

@keyframes hcsFloatB {
  from { transform: translateY(0px); }
  to { transform: translateY(6px); }
}

.hcs-float-users-icon {
  width: 28px;
  height: 28px;
  border-radius: 8px;
  background: rgba(0, 132, 255, 0.12);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.hcs-avatar-stack {
  display: flex;
  align-items: center;
}

.hcs-av {
  width: 26px;
  height: 26px;
  border-radius: 50%;
  border: 2px solid #ffffff;
  font-size: 9.5px;
  font-weight: 800;
  color: #ffffff;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  margin-left: -7px;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.15);
}

.hcs-av:first-child { margin-left: 0; }
.hcs-av-1 { background: #03050a; }
.hcs-av-2 { background: #1f3bff; }
.hcs-av-3 { background: #00b4d8; }
.hcs-av-plus {
  background: linear-gradient(135deg, #1f3bff, #2ee6ff);
  font-size: 9px;
}

.hcs-float-copy {
  display: flex;
  flex-direction: column;
  text-align: left;
  line-height: 1.2;
}

.hcs-float-eyebrow {
  font-size: 9px;
  font-weight: 800;
  letter-spacing: 0.1em;
  color: #1f3bff;
  text-transform: uppercase;
}

.hcs-float-val {
  font-size: 12.5px;
  font-weight: 700;
  color: #03050a;
}

.hcs-float-sub {
  font-size: 10.5px;
  font-weight: 500;
  color: #64748b;
}

.hcs-pulse-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #10b981;
  box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.2);
  flex-shrink: 0;
}

.hcs-qr-mini-btn {
  width: 28px;
  height: 28px;
  border-radius: 8px;
  background: #03050a;
  color: #2ee6ff;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  margin-left: 4px;
}

.hcs-float-icon-badge {
  width: 28px;
  height: 28px;
  border-radius: 9px;
  background: rgba(31, 59, 255, 0.1);
  color: #1f3bff;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

/* ─── Glass Folder Core & Elevated Card Stack ─── */
.gf-root {
  --gf-px: 0;
  --gf-py: 0;
  --gf-ease: cubic-bezier(.2, .8, .2, 1);
  --gf-spring: cubic-bezier(.34, 1.36, .5, 1);
  --gf-hinge: -8deg;
  --gf-lift: -42px;
  --gf-spread: 14px;
  --gf-fan: 2.5deg;
  --gf-stack: 20px;
  --gf-ink: #f8fafc;
  --gf-ink-soft: rgba(248, 250, 252, .72);
  position: relative;
  display: inline-block;
  flex: none;
  vertical-align: top;
  font-family: 'Instrument Sans', ui-sans-serif, system-ui, -apple-system, sans-serif;
  -webkit-font-smoothing: antialiased;
  -webkit-tap-highlight-color: transparent;
  isolation: isolate;
  transition: filter 0.35s ease, transform 0.35s ease;
}

.gf-root--dimmed {
  filter: blur(4px) brightness(0.85);
  transform: scale(0.95);
  pointer-events: none;
}

.gf-root:hover,
.gf-root:focus-within {
  --gf-hinge: -16deg;
  --gf-lift: -72px;
  --gf-spread: 26px;
  --gf-fan: 4deg;
  --gf-stack: 26px;
}

.gf-root[data-open] {
  --gf-hinge: -26deg;
  --gf-lift: -124px;
  --gf-spread: 52px;
  --gf-fan: 6.5deg;
  --gf-stack: 34px;
}

.gf-stage {
  position: absolute;
  left: 0;
  top: 0;
  width: 380px;
  height: 304px;
  transform-origin: 0 0;
}

.gf-tilt {
  position: absolute;
  inset: 0;
  transform: perspective(1400px) rotateX(calc(var(--gf-py) * -3.5deg)) rotateY(calc(var(--gf-px) * 4.5deg));
  transition: transform .9s var(--gf-ease);
}

.gf-shadow {
  position: absolute;
  left: 18px;
  right: 18px;
  bottom: -10px;
  height: 64px;
  border-radius: 44px;
  background: rgba(3, 5, 10, .46);
  filter: blur(26px);
  transform: translateX(calc(var(--gf-px) * -8px));
  transition: transform .9s var(--gf-ease), opacity .9s var(--gf-ease);
}

.gf-back {
  position: absolute;
  inset: 0;
  overflow: hidden;
  background: linear-gradient(180deg, #0b132b 0%, #03050a 100%);
}

.gf-art {
  position: absolute;
  left: -12px;
  top: -12px;
  max-width: none;
  object-fit: cover;
  transform: translate(calc(var(--gf-px) * -7px), calc(var(--gf-py) * -6px)) scale(1.02);
  transition: transform 1.1s var(--gf-ease), opacity 1.2s var(--gf-ease), filter 1.2s var(--gf-ease);
}

canvas.gf-art { opacity: 0; filter: blur(14px) saturate(.6); }
canvas.gf-art[data-ready] { opacity: 1; filter: none; }

.gf-back-sheen {
  position: absolute;
  inset: 0;
  background:
    linear-gradient(180deg, rgba(46, 230, 255, .28) 0%, rgba(255, 255, 255, 0) 26%),
    radial-gradient(120% 80% at 80% 0%, rgba(31, 59, 255, .28), rgba(255, 255, 255, 0) 60%);
  pointer-events: none;
}

.gf-rim {
  position: absolute;
  left: 0;
  top: 0;
  max-width: none;
  overflow: visible;
  pointer-events: none;
  fill: none;
}

.gf-back-rim { width: 380px; height: 304px; }
.gf-back-rim path { stroke: rgba(46, 230, 255, .35); stroke-width: 1.2; }

/* ─── Stacked Conference Cards ─── */
.gf-files {
  position: absolute;
  inset: 0;
  z-index: 5;
  pointer-events: none;
  clip-path: inset(-440px -440px 10px -440px);
}

.gf-sheet-slot { display: contents; }

.gf-sheet {
  all: unset;
  box-sizing: border-box;
  position: absolute;
  left: 34px;
  top: 86px;
  width: 312px;
  height: 210px;
  border-radius: 18px;
  overflow: hidden;
  cursor: pointer;
  pointer-events: auto;
  background: #090d16;
  box-shadow:
    inset 0 1px 0 rgba(255, 255, 255, .32),
    0 0 0 1px rgba(255, 255, 255, .14),
    0 14px 32px -8px rgba(3, 5, 10, .68);
  transform-origin: 50% 100%;
  transform:
    translate(calc(var(--gf-jx) + var(--gf-slot) * var(--gf-spread)), calc(var(--gf-lift) + var(--gf-depth) * var(--gf-stack) * -1))
    rotate(calc(var(--gf-jr) + var(--gf-slot) * var(--gf-fan)));
  transition:
    transform .75s var(--gf-spring) calc(var(--gf-depth) * 40ms),
    box-shadow .4s var(--gf-ease),
    translate .9s var(--gf-ease),
    opacity .9s var(--gf-ease);
}

.gf-sheet:hover,
.gf-sheet:focus-visible {
  transform:
    translate(calc(var(--gf-jx) + var(--gf-slot) * var(--gf-spread)), calc(var(--gf-lift) + var(--gf-depth) * var(--gf-stack) * -1 - 18px))
    rotate(calc(var(--gf-slot) * var(--gf-fan) * .5))
    scale(1.02);
  box-shadow:
    inset 0 1px 0 rgba(46, 230, 255, .85),
    0 0 0 1.5px rgba(46, 230, 255, .6),
    0 24px 44px -10px rgba(3, 5, 10, .78);
  transition-delay: 0s;
}

.gf-sheet--extracted {
  opacity: 0;
  transform: translateY(-220px) scale(1.08);
}

.gf-sheet-art {
  position: absolute;
  left: 0;
  top: 0;
  width: 312px;
  height: 210px;
  max-width: none;
  object-fit: cover;
  transition: transform .6s var(--gf-ease), opacity .9s var(--gf-ease);
}

.gf-sheet:hover .gf-sheet-art {
  transform: scale(1.05);
}

.gf-sheet--art::after {
  content: "";
  position: absolute;
  inset: 0;
  border-radius: inherit;
  background: linear-gradient(
    180deg,
    rgba(3, 5, 10, 0.84) 0%,
    rgba(3, 5, 10, 0.45) 45%,
    rgba(3, 5, 10, 0.88) 100%
  );
  box-shadow: inset 0 0 0 1px rgba(255, 255, 255, .2);
  pointer-events: none;
}

/* Conference Card Top Header & Pills */
.gf-sheet-head {
  position: absolute;
  left: 14px;
  right: 14px;
  top: 12px;
  z-index: 2;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.gf-sheet-badges {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 6px;
}

.gf-conf-date-pill,
.gf-conf-loc-pill {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 3.5px 9px;
  border-radius: 99px;
  font-size: 10px;
  font-weight: 600;
  letter-spacing: 0.02em;
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
}

.gf-conf-date-pill {
  background: rgba(31, 59, 255, 0.85);
  color: #ffffff;
  border: 1px solid rgba(46, 230, 255, 0.45);
}

.gf-conf-loc-pill {
  background: rgba(3, 5, 10, 0.72);
  color: #e2e8f0;
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.gf-conf-card-title {
  font-family: 'Bricolage Grotesque', 'Instrument Sans', sans-serif;
  font-size: 14.5px;
  font-weight: 700;
  line-height: 1.22;
  color: #ffffff;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-shadow: 0 2px 10px rgba(0, 0, 0, 0.75);
}

/* Conference Card Bottom Footer */
.gf-sheet-foot {
  position: absolute;
  left: 14px;
  right: 14px;
  bottom: 14px;
  z-index: 2;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
}

.gf-conf-theme-tag {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  font-size: 10px;
  font-weight: 600;
  letter-spacing: 0.04em;
  color: rgba(226, 232, 240, 0.85);
}

.gf-conf-card-cta {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 4.5px 10px;
  border-radius: 99px;
  background: rgba(46, 230, 255, 0.22);
  border: 1px solid rgba(46, 230, 255, 0.55);
  color: #2ee6ff;
  font-size: 10.5px;
  font-weight: 700;
  white-space: nowrap;
  flex-shrink: 0;
}

.gf-sheet--drop {
  animation: gf-drop .82s var(--gf-ease) both;
}

@keyframes gf-drop {
  0% { translate: 0 -190px; rotate: -8deg; opacity: 0; }
  35% { opacity: 1; }
  72% { translate: 0 10px; rotate: 1deg; }
  100% { translate: 0 0; rotate: 0deg; opacity: 1; }
}

/* ─── Hinged Frosted Glass Front Panel ─── */
.gf-front {
  position: absolute;
  left: 0;
  top: 98px;
  width: 380px;
  height: 206px;
  z-index: 10;
  -webkit-backdrop-filter: blur(24px) saturate(1.7);
  backdrop-filter: blur(24px) saturate(1.7);
  transform-origin: 50% 100%;
  transform: perspective(820px) rotateX(var(--gf-hinge));
  transition: transform .8s var(--gf-spring), translate 1s var(--gf-ease), opacity 1s var(--gf-ease);
}

.gf-front--bump {
  animation: gf-bump .68s var(--gf-ease) .32s both;
}

@keyframes gf-bump {
  0% { scale: 1; }
  35% { scale: 1.018 .975; }
  70% { scale: .996 1.006; }
  100% { scale: 1; }
}

.gf-tint {
  position: absolute;
  inset: 0;
  background: linear-gradient(
    180deg,
    rgba(15, 23, 42, .24) 0%,
    rgba(6, 11, 25, .72) 48%,
    rgba(3, 5, 10, .95) 100%
  );
}

.gf-spec {
  position: absolute;
  inset: 0;
  background: radial-gradient(
    280px 210px at calc(50% + var(--gf-px) * 46%) calc(30% + var(--gf-py) * 40%),
    rgba(46, 230, 255, .32),
    rgba(255, 255, 255, 0) 70%
  );
  mix-blend-mode: screen;
  opacity: .75;
  transition: background-position .6s var(--gf-ease);
  pointer-events: none;
}

.gf-front-rim { width: 380px; height: 206px; }
.gf-front-rim path { stroke-width: 2.2; transition: stroke-width .3s var(--gf-ease); }

.gf-hit {
  all: unset;
  position: absolute;
  inset: 0;
  z-index: 1;
  cursor: pointer;
}

.gf-label {
  position: absolute;
  left: 26px;
  bottom: 26px;
  right: 98px;
  z-index: 2;
  display: flex;
  flex-direction: column;
  gap: 5px;
  pointer-events: none;
  color: var(--gf-ink);
}

.gf-eyebrow {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  font-size: 9.5px;
  font-weight: 700;
  letter-spacing: 0.09em;
  text-transform: uppercase;
  color: #2ee6ff;
}

.gf-title {
  font-family: 'Bricolage Grotesque', 'Instrument Sans', sans-serif;
  font-size: 17px;
  font-weight: 700;
  line-height: 1.2;
  letter-spacing: -.015em;
  color: #ffffff;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  animation: gf-roll .45s var(--gf-ease) both;
}

.gf-meta {
  font-family: ui-monospace, "SF Mono", Menlo, Consolas, monospace;
  font-size: 11.5px;
  letter-spacing: .02em;
  color: rgba(226, 232, 240, .78);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  animation: gf-roll .5s var(--gf-ease) both;
}

@keyframes gf-roll {
  from { opacity: 0; translate: 0 7px; filter: blur(3px); }
  to { opacity: 1; translate: 0 0; filter: blur(0); }
}

/* ─── Tactile Corner Key: Cycle Next Conference ─── */
.gf-key {
  all: unset;
  box-sizing: border-box;
  position: absolute;
  right: 22px;
  bottom: 22px;
  z-index: 12;
  width: 62px;
  height: 62px;
  border-radius: 18px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 2px;
  cursor: pointer;
  color: #ffffff;
  background: linear-gradient(145deg, #1f3bff 0%, #0d259c 65%, #03050a 100%);
  box-shadow:
    inset 0 1px 0 rgba(46, 230, 255, .55),
    0 0 0 1px rgba(46, 230, 255, .3),
    0 14px 24px -6px rgba(31, 59, 255, .55);
  transition: transform .35s var(--gf-spring), box-shadow .35s var(--gf-ease), background .35s var(--gf-ease);
}

.gf-key:hover {
  transform: translateY(-3px) scale(1.03);
  background: linear-gradient(145deg, #2f7bff 0%, #1f3bff 65%, #091540 100%);
  box-shadow:
    inset 0 1px 0 rgba(255, 255, 255, .75),
    0 0 0 1px rgba(46, 230, 255, .6),
    0 18px 28px -6px rgba(46, 230, 255, .5);
}

.gf-key:active {
  transform: translateY(0) scale(.94);
  transition-duration: .12s;
}

.gf-key-sub {
  font-size: 8.5px;
  font-weight: 800;
  letter-spacing: 0.12em;
  color: #2ee6ff;
}

/* ─── Entrance Assembly ─── */
.gf-root:not([data-entered]) .gf-back,
.gf-root:not([data-entered]) .gf-back-rim { translate: 0 22px; opacity: 0; }
.gf-root:not([data-entered]) .gf-sheet { translate: 0 -120px; opacity: 0; }
.gf-root:not([data-entered]) .gf-front { translate: 0 46px; opacity: 0; }
.gf-root:not([data-entered]) .gf-key { opacity: 0; scale: .6; }
.gf-root:not([data-entered]) .gf-shadow { opacity: 0; }
.gf-back, .gf-back-rim { transition: translate 1s var(--gf-ease), opacity .9s var(--gf-ease); }
.gf-root[data-entered] .gf-sheet { transition-delay: calc(var(--gf-depth) * 40ms), 0s, calc(.18s + var(--gf-depth) * 90ms), calc(.18s + var(--gf-depth) * 90ms); }
.gf-root[data-entered] .gf-front { transition-delay: 0s, .42s, .42s; }
.gf-key { transition: transform .35s var(--gf-spring), box-shadow .35s var(--gf-ease), opacity .6s var(--gf-ease) .7s, scale .7s var(--gf-spring) .7s; }

/* ═══════════════════════════════════════════════════════════════════════════
   EXTRACTED PROFESSIONAL CONFERENCE PASS (PULLS OUT OF FOLDER WITH QR CODE)
   ═══════════════════════════════════════════════════════════════════════════ */
.hcs-pass-backdrop {
  position: fixed;
  inset: 0;
  width: 100vw;
  height: 100vh;
  z-index: 99999;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  background: rgba(3, 5, 10, 0.72);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  cursor: pointer;
  animation: hcsBackdropIn 0.24s ease forwards;
}

@keyframes hcsBackdropIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

.hcs-pass-card {
  position: relative;
  width: 395px;
  max-width: 94vw;
  max-height: 90vh;
  overflow-y: auto;
  cursor: default;
  border-radius: 24px;
  background: #060a14;
  color: #ffffff;
  border: 1px solid rgba(46, 230, 255, 0.35);
  box-shadow:
    0 32px 80px -12px rgba(3, 5, 10, 0.85),
    0 0 0 1px rgba(255, 255, 255, 0.1),
    0 0 50px -10px rgba(31, 59, 255, 0.55);
  font-family: 'Instrument Sans', system-ui, sans-serif;
  transform-origin: 50% 85%;
  animation: hcsCardPullOut 0.48s cubic-bezier(0.22, 1.28, 0.36, 1) forwards;
}

.hcs-pass-card::-webkit-scrollbar {
  width: 5px;
}

.hcs-pass-card::-webkit-scrollbar-thumb {
  background: rgba(46, 230, 255, 0.35);
  border-radius: 99px;
}

@keyframes hcsCardPullOut {
  0% {
    opacity: 0;
    transform: translateY(95px) scale(0.74) rotateX(22deg) rotateZ(-3deg);
  }
  60% {
    opacity: 1;
    transform: translateY(-10px) scale(1.02) rotateX(-3deg) rotateZ(0.5deg);
  }
  100% {
    opacity: 1;
    transform: translateY(0) scale(1) rotateX(0deg) rotateZ(0deg);
  }
}

.hcs-pass-cover {
  position: relative;
  height: 148px;
  overflow: hidden;
  background: linear-gradient(135deg, #0d259c, #03050a);
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  padding: 14px 18px;
}

.hcs-pass-img {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  transform: scale(1.03);
}

.hcs-pass-cover-overlay {
  position: absolute;
  inset: 0;
  background: linear-gradient(
    180deg,
    rgba(3, 5, 10, 0.65) 0%,
    rgba(3, 5, 10, 0.35) 40%,
    rgba(6, 10, 20, 0.96) 100%
  );
}

.hcs-pass-top-bar {
  position: relative;
  z-index: 2;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.hcs-pass-official-badge {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 4px 10px;
  border-radius: 99px;
  background: rgba(31, 59, 255, 0.85);
  border: 1px solid rgba(46, 230, 255, 0.5);
  font-size: 10px;
  font-weight: 800;
  letter-spacing: 0.08em;
  color: #ffffff;
}

.hcs-pass-close {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  border: 1px solid rgba(255, 255, 255, 0.25);
  background: rgba(3, 5, 10, 0.65);
  color: #ffffff;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: background 0.2s ease, transform 0.2s ease;
}

.hcs-pass-close:hover {
  background: #1f3bff;
  transform: scale(1.08);
}

.hcs-pass-cover-title-wrap {
  position: relative;
  z-index: 2;
}

.hcs-pass-series {
  display: block;
  font-size: 9.5px;
  font-weight: 800;
  letter-spacing: 0.14em;
  color: #2ee6ff;
  margin-bottom: 3px;
}

.hcs-pass-title {
  margin: 0;
  font-family: 'Bricolage Grotesque', 'Instrument Sans', sans-serif;
  font-size: 17.5px;
  font-weight: 800;
  line-height: 1.18;
  color: #ffffff;
}

.hcs-pass-body {
  padding: 12px 18px 14px;
  background: #060a14;
}

.hcs-pass-theme {
  margin: 0 0 12px;
  font-size: 11.5px;
  line-height: 1.45;
  color: #94a3b8;
  font-style: italic;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.hcs-pass-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px 12px;
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.07);
  border-radius: 14px;
  padding: 10px 12px;
}

.hcs-pass-field {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.hcs-pass-lbl {
  font-size: 9px;
  font-weight: 700;
  letter-spacing: 0.1em;
  color: #64748b;
}

.hcs-pass-val {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  font-size: 12px;
  font-weight: 600;
  color: #f1f5f9;
}

.hcs-pass-ic {
  color: #2ee6ff;
  flex-shrink: 0;
}

.hcs-pass-price {
  color: #2ee6ff;
  font-weight: 700;
}

/* Perforated Ticket Stub Divider */
.hcs-pass-perforation {
  position: relative;
  height: 18px;
  display: flex;
  align-items: center;
  background: #060a14;
}

.hcs-perf-line {
  width: 100%;
  border-top: 1.5px dashed rgba(255, 255, 255, 0.16);
  margin: 0 14px;
}

.hcs-notch {
  position: absolute;
  width: 18px;
  height: 18px;
  border-radius: 50%;
  background: #e8f4fc;
  border: 1px solid rgba(46, 230, 255, 0.35);
}

.hcs-notch-l { left: -10px; }
.hcs-notch-r { right: -10px; }

/* QR Code Stub Footer */
.hcs-pass-stub {
  padding: 10px 18px 16px;
  background: linear-gradient(180deg, #060a14 0%, #091228 100%);
}

.hcs-pass-qr-row {
  display: flex;
  align-items: center;
  gap: 14px;
}

.hcs-qr-box {
  position: relative;
  padding: 5px;
  border-radius: 12px;
  background: #ffffff;
  box-shadow: 0 6px 20px rgba(46, 230, 255, 0.25);
  overflow: hidden;
  flex-shrink: 0;
}

.hcs-qr-scanline {
  position: absolute;
  left: 0;
  right: 0;
  height: 2px;
  background: linear-gradient(90deg, transparent, #1f3bff, #2ee6ff, transparent);
  box-shadow: 0 0 8px #2ee6ff;
  animation: hcsQrScan 2.6s ease-in-out infinite;
}

@keyframes hcsQrScan {
  0%, 100% { top: 6%; }
  50% { top: 92%; }
}

.hcs-pass-serial-info {
  display: flex;
  flex-direction: column;
  gap: 5px;
  flex: 1;
  min-width: 0;
}

.hcs-serial-tag {
  font-family: ui-monospace, "SF Mono", Menlo, Consolas, monospace;
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.08em;
  color: #2ee6ff;
}

.hcs-serial-hint {
  font-size: 10.5px;
  line-height: 1.35;
  color: #94a3b8;
}

.hcs-pass-actions {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-top: 4px;
}

.hcs-pass-btn-primary {
  border: none;
  background: linear-gradient(135deg, #1f3bff 0%, #2f7bff 100%);
  color: #ffffff;
  font-family: inherit;
  font-size: 11.5px;
  font-weight: 700;
  padding: 7px 12px;
  border-radius: 99px;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 4px;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.hcs-pass-btn-primary:hover {
  transform: translateY(-1px);
  box-shadow: 0 6px 18px rgba(31, 59, 255, 0.45);
}

.hcs-pass-btn-ghost {
  text-decoration: none;
  background: rgba(255, 255, 255, 0.08);
  border: 1px solid rgba(255, 255, 255, 0.2);
  color: #ffffff;
  font-size: 11.5px;
  font-weight: 600;
  padding: 6.5px 12px;
  border-radius: 99px;
  transition: background 0.2s ease;
}

.hcs-pass-btn-ghost:hover {
  background: rgba(255, 255, 255, 0.16);
  color: #ffffff;
}

.hcs-pass-btn-back {
  border: 1px solid rgba(255, 255, 255, 0.16);
  background: rgba(255, 255, 255, 0.05);
  color: #cbd5e1;
  width: 29px;
  height: 29px;
  border-radius: 50%;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;
}

.hcs-pass-btn-back:hover {
  background: rgba(255, 255, 255, 0.15);
  color: #ffffff;
}

.hcs-pulse-star {
  font-size: 14px;
  line-height: 1;
  color: #10b981;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  filter: drop-shadow(0 0 6px rgba(16, 185, 129, 0.5));
}

.hcs-pedestal-glow {
  position: absolute;
  bottom: 12px;
  left: 50%;
  transform: translateX(-50%);
  width: 320px;
  height: 38px;
  border-radius: 50%;
  background: radial-gradient(ellipse at center, rgba(46, 230, 255, 0.72) 0%, rgba(31, 59, 255, 0.3) 48%, transparent 74%);
  filter: blur(14px);
  pointer-events: none;
  z-index: 0;
}

@media (max-width: 640px) {
  .hcs-wrapper {
    min-height: 410px;
    padding: 12px 0 20px;
    width: 100%;
    max-width: 100%;
    overflow: hidden;
  }
  .gf-root {
    margin: 0 auto;
    display: block;
  }
  .hcs-orbital-rings {
    width: 310px;
    height: 310px;
  }
  .hcs-float-card {
    padding: 7px 12px;
    gap: 8px;
    border-radius: 14px;
    box-shadow: 0 10px 24px -6px rgba(3, 5, 10, 0.12);
  }
  .hcs-float-topleft {
    left: 4px;
    top: -10px;
  }
  .hcs-float-topleft .hcs-float-val {
    font-size: 11.5px;
  }
  .hcs-float-topleft .hcs-float-sub {
    font-size: 9px;
  }
  .hcs-float-topright {
    right: 4px;
    top: 28px;
  }
  .hcs-float-topright .hcs-float-eyebrow {
    font-size: 8.5px;
  }
  .hcs-float-topright .hcs-float-val {
    font-size: 11.5px;
  }
  .hcs-float-bottomleft {
    left: 4px;
    bottom: -14px;
  }
  .hcs-float-bottomleft .hcs-float-val {
    font-size: 11.5px;
  }
  .hcs-float-bottomleft .hcs-float-sub {
    font-size: 9px;
  }
  .hcs-pedestal-glow {
    bottom: -2px;
    width: 280px;
    height: 34px;
  }
}

@media (max-width: 390px) {
  .hcs-wrapper {
    min-height: 375px;
  }
  .hcs-orbital-rings {
    width: 275px;
    height: 275px;
  }
  .hcs-float-card {
    padding: 5px 8px;
    gap: 6px;
    border-radius: 12px;
  }
  .hcs-avatar-stack .hcs-av {
    width: 20px;
    height: 20px;
    font-size: 7.5px;
    margin-left: -5px;
  }
  .hcs-float-topleft {
    left: 2px;
    top: -10px;
  }
  .hcs-float-topleft .hcs-float-val {
    font-size: 10.5px;
  }
  .hcs-float-topleft .hcs-float-sub {
    font-size: 8px;
  }
  .hcs-float-topright {
    right: 2px;
    top: 22px;
  }
  .hcs-float-topright .hcs-float-eyebrow {
    font-size: 7.5px;
  }
  .hcs-float-topright .hcs-float-val {
    font-size: 10px;
  }
  .hcs-float-bottomleft {
    left: 2px;
    bottom: -12px;
  }
  .hcs-float-bottomleft .hcs-float-val {
    font-size: 10px;
  }
  .hcs-float-bottomleft .hcs-float-sub {
    font-size: 8px;
  }
  .hcs-pedestal-glow {
    width: 230px;
    height: 26px;
  }
}

@media (prefers-reduced-motion: reduce) {
  .gf-root *, .gf-root *::before, .gf-root *::after,
  .hcs-orbital-rings, .hcs-float-card, .hcs-qr-scanline {
    transition-duration: 0s !important;
    transition-delay: 0s !important;
    animation: none !important;
  }
  .gf-tilt { transform: none; }
}
`;
