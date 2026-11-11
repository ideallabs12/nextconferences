import React, { useId } from 'react';
import { Link } from 'react-router-dom';
import { ArrowUpRight } from 'lucide-react';
import './NotchedProjectCard.css';

const DISC = 64;   // the arrow disc, px
const BLOCK = 80;  // the notch block, px (radius = BLOCK - DISC / 2)
const FILLET = 28; // the curve where the cut meets the cover's edges, px

export function NotchedProjectCard({
  href = '#',
  title,
  description,
  image,
  imageAlt = '',
  onImageError,
  badge,
  locationBadge,
  tags = [],
  screen,
  dim,
  monochrome = false,
  surface = 'var(--notched-card-surface, #060b16)',
  accent = '#00d2ff',
  accentForeground = '#0a0a0a',
  className = '',
  style = {},
}) {
  const uid = useId().replace(/:/g, '');
  const effectiveDim = typeof dim === 'number' ? dim : (screen ? 0.45 : 0);
  const isInternal = typeof href === 'string' && href.startsWith('/');
  const Wrapper = isInternal ? Link : 'a';
  const wrapperProps = isInternal ? { to: href } : { href };

  return (
    <Wrapper
      {...wrapperProps}
      className={`notched-project-card ${monochrome ? 'is-monochrome' : ''} ${className}`.trim()}
      style={{
        '--card-accent': accent,
        '--card-accent-fg': accentForeground,
        ...style,
      }}
    >
      <div className="notched-card-media-wrap">
        {/* the cover */}
        <div className="notched-card-cover">
          <img
            src={image}
            alt={screen ? '' : imageAlt || title}
            onError={onImageError}
            className={`notched-card-img ${!screen ? 'zoom-on-hover' : ''}`}
          />

          {effectiveDim > 0 && (
            <div
              aria-hidden="true"
              className="notched-card-dim"
              style={{ backgroundColor: `rgb(0 0 0 / ${effectiveDim})` }}
            />
          )}

          {screen && (
            <img
              src={screen.src}
              alt={screen.alt || ''}
              className={`notched-card-screen ${screen.className || ''}`.trim()}
            />
          )}

          {badge && (
            <div className="notched-card-badge-wrap">
              <span className="notched-card-badge">{badge}</span>
            </div>
          )}

          {locationBadge && (
            <div className="notched-card-location-wrap">
              <span className="notched-card-location-badge">{locationBadge}</span>
            </div>
          )}
        </div>

        {/* the notch: a block with a concave corner, and a fillet at each
            end where the cut meets the cover's right and bottom edges */}
        <div
          aria-hidden="true"
          className="notched-card-block"
          style={{
            width: BLOCK,
            height: BLOCK,
            borderTopLeftRadius: BLOCK - DISC / 2,
            background: surface,
          }}
        />
        {[
          { bottom: BLOCK, right: 0 },
          { bottom: 0, right: BLOCK },
        ].map((pos, i) => (
          <div
            key={i}
            aria-hidden="true"
            className="notched-card-fillet"
            style={{
              ...pos,
              width: FILLET,
              height: FILLET,
              background: `radial-gradient(circle at top left, transparent ${FILLET - 0.5}px, ${surface} ${FILLET}px)`,
            }}
          />
        ))}

        {/* the arrow disc, nested in the notch with rising liquid fill animation */}
        <span
          aria-hidden="true"
          className="notched-card-disc"
          style={{
            width: DISC,
            height: DISC,
          }}
        >
          {/* Rising Liquid Fill Tank with Dual Sloshing Waves & Bubbles */}
          <span className="notched-disc-tank">
            <span className="notched-disc-liquid">
              {/* Back Wave */}
              <svg
                className="notched-disc-wave notched-disc-wave--back"
                viewBox="0 0 160 22"
                preserveAspectRatio="none"
              >
                <path
                  d="M0,11 C20,22 40,0 80,11 C120,22 140,0 160,11 L160,22 L0,22 Z"
                  fill="#2ee6ff"
                />
              </svg>

              {/* Front Wave */}
              <svg
                className="notched-disc-wave notched-disc-wave--front"
                viewBox="0 0 160 22"
                preserveAspectRatio="none"
              >
                <defs>
                  <linearGradient id={`nd-lq-${uid}`} x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#1f3bff" />
                    <stop offset="55%" stopColor="#2f7bff" />
                    <stop offset="100%" stopColor="#2ee6ff" />
                  </linearGradient>
                </defs>
                <path
                  d="M0,11 C26,0 54,22 80,11 C106,0 134,22 160,11 L160,22 L0,22 Z"
                  fill={`url(#nd-lq-${uid})`}
                />
              </svg>

              {/* Solid Liquid Body */}
              <span className="notched-disc-body">
                <span className="notched-disc-bubble notched-disc-bubble--1" />
                <span className="notched-disc-bubble notched-disc-bubble--2" />
                <span className="notched-disc-bubble notched-disc-bubble--3" />
              </span>
            </span>
          </span>

          {/* Glass Rim Overlay */}
          <span className="notched-disc-rim" />

          <ArrowUpRight className="notched-card-arrow" />
        </span>
      </div>

      <h3 className="notched-card-title">{title}</h3>
      {description && <p className="notched-card-desc">{description}</p>}
      {tags.length > 0 && (
        <ul className="notched-card-tags">
          {tags.map((t, i) => (
            <li key={`${t}-${i}`} className="notched-card-tag">
              {t}
            </li>
          ))}
        </ul>
      )}
    </Wrapper>
  );
}

export default NotchedProjectCard;

