import React, { useState, useEffect, forwardRef, useId } from 'react';

const LIQUID_GLASS_CSS = `
/* ─── Liquid Glass Button (9-layer refractive lens rim + rising liquid wave fill) ─── */
.liquid-glass-btn {
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  white-space: nowrap;
  border-radius: 9999px;
  font-family: 'Instrument Sans', system-ui, -apple-system, sans-serif;
  font-size: 16px;
  font-weight: 600;
  letter-spacing: -0.01em;
  color: #03050a;
  background: rgba(255, 255, 255, 0.24);
  border: none;
  outline: none;
  cursor: pointer;
  text-decoration: none;
  isolation: isolate;
  user-select: none;
  overflow: hidden;
  transition:
    transform 320ms cubic-bezier(0.2, 0.8, 0.2, 1),
    color 320ms ease,
    box-shadow 320ms ease;
}

.liquid-glass-btn--default {
  height: 54px;
  padding: 0 32px;
}

.liquid-glass-btn--sm {
  height: 38px;
  padding: 0 18px;
  font-size: 13px;
}

.liquid-glass-btn--lg {
  height: 48px;
  padding: 0 26px;
  font-size: 15px;
}

.liquid-glass-btn--xl {
  height: 52px;
  padding: 0 30px;
  font-size: 15.5px;
}

.liquid-glass-btn--xxl {
  height: 54px;
  padding: 0 34px;
  font-size: 16px;
}

.liquid-glass-btn:hover,
.liquid-glass-btn:focus-visible {
  transform: translateY(-2px) scale(1.03);
  color: #ffffff;
  box-shadow: 0 12px 30px -8px rgba(31, 59, 255, 0.55);
}

.liquid-glass-btn:active {
  transform: translateY(0) scale(0.98);
}

/* ─── Rising Sloshing Liquid Tank Inside the Glass Capsule ─── */
.liquid-glass-btn__tank {
  position: absolute;
  inset: 0;
  border-radius: 9999px;
  overflow: hidden;
  pointer-events: none;
  z-index: 1;
}

.liquid-glass-btn__liquid {
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0;
  height: 135%;
  transform: translateY(104%);
  transition: transform 620ms cubic-bezier(0.22, 1, 0.36, 1);
  will-change: transform;
}

.liquid-glass-btn:hover .liquid-glass-btn__liquid,
.liquid-glass-btn:focus-visible .liquid-glass-btn__liquid {
  transform: translateY(8%);
}

/* Dual undulating wave crests at the surface of the rising liquid */
.liquid-glass-btn__wave {
  position: absolute;
  top: -22px;
  left: 0;
  width: 200%;
  height: 24px;
  display: block;
}

.liquid-glass-btn__wave--back {
  top: -20px;
  opacity: 0.65;
  animation: liquidWaveSlideBack 2.4s linear infinite;
}

.liquid-glass-btn__wave--front {
  top: -18px;
  animation: liquidWaveSlideFront 1.65s linear infinite;
}

@keyframes liquidWaveSlideFront {
  0% { transform: translateX(0); }
  100% { transform: translateX(-50%); }
}

@keyframes liquidWaveSlideBack {
  0% { transform: translateX(-50%); }
  100% { transform: translateX(0); }
}

.liquid-glass-btn__body {
  position: absolute;
  top: -1px;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(100deg, #1f3bff 0%, #2f7bff 55%, #2ee6ff 100%);
}

/* Rising micro-bubbles inside the liquid when hovered */
.liquid-glass-btn__bubble {
  position: absolute;
  bottom: -10px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.45);
  pointer-events: none;
  opacity: 0;
}

.liquid-glass-btn:hover .liquid-glass-btn__bubble--1 {
  left: 22%;
  width: 5px;
  height: 5px;
  animation: liquidBubbleRise 1.4s ease-in infinite 0.1s;
}

.liquid-glass-btn:hover .liquid-glass-btn__bubble--2 {
  left: 52%;
  width: 7px;
  height: 7px;
  animation: liquidBubbleRise 1.7s ease-in infinite 0.35s;
}

.liquid-glass-btn:hover .liquid-glass-btn__bubble--3 {
  left: 76%;
  width: 4px;
  height: 4px;
  animation: liquidBubbleRise 1.3s ease-in infinite 0.2s;
}

@keyframes liquidBubbleRise {
  0% {
    transform: translateY(0) scale(0.6);
    opacity: 0;
  }
  40% {
    opacity: 0.75;
  }
  100% {
    transform: translateY(-48px) scale(1.15);
    opacity: 0;
  }
}

/* Crystal Clear Liquid Glass Rim (Exact 9-layer shadow sitting over the liquid) */
.liquid-glass-btn__rim {
  position: absolute;
  top: 0;
  left: 0;
  z-index: 3;
  height: 100%;
  width: 100%;
  border-radius: 9999px;
  pointer-events: none;
  box-shadow:
    0 0 6px rgba(0, 0, 0, 0.03),
    0 2px 6px rgba(0, 0, 0, 0.08),
    inset 3px 3px 0.5px -3px rgba(0, 0, 0, 0.9),
    inset -3px -3px 0.5px -3px rgba(0, 0, 0, 0.85),
    inset 1px 1px 1px -0.5px rgba(0, 0, 0, 0.6),
    inset -1px -1px 1px -0.5px rgba(0, 0, 0, 0.6),
    inset 0 0 6px 6px rgba(0, 0, 0, 0.12),
    inset 0 0 2px 2px rgba(0, 0, 0, 0.06),
    0 0 12px rgba(255, 255, 255, 0.15);
  transition: box-shadow 350ms ease;
}

.liquid-glass-btn:hover .liquid-glass-btn__rim,
.liquid-glass-btn:focus-visible .liquid-glass-btn__rim {
  box-shadow:
    0 0 8px rgba(46, 230, 255, 0.25),
    0 4px 14px rgba(31, 59, 255, 0.25),
    inset 3px 3px 0.5px -3px rgba(255, 255, 255, 0.75),
    inset -3px -3px 0.5px -3px rgba(255, 255, 255, 0.85),
    inset 1px 1px 1px -0.5px rgba(255, 255, 255, 0.75),
    inset -1px -1px 1px -0.5px rgba(46, 230, 255, 0.7),
    inset 0 0 8px 6px rgba(255, 255, 255, 0.16),
    inset 0 0 2px 2px rgba(255, 255, 255, 0.12),
    0 0 16px rgba(46, 230, 255, 0.3);
}

.liquid-glass-btn__refraction {
  position: absolute;
  top: 0;
  left: 0;
  isolation: isolate;
  z-index: 0;
  height: 100%;
  width: 100%;
  overflow: hidden;
  border-radius: 9999px;
  pointer-events: none;
  backdrop-filter: url("#container-glass") blur(6px) saturate(160%);
  -webkit-backdrop-filter: url("#container-glass") blur(6px) saturate(160%);
}

.liquid-glass-btn__content {
  pointer-events: none;
  position: relative;
  z-index: 10;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.liquid-glass-svg-defs {
  position: absolute;
  width: 0;
  height: 0;
  overflow: hidden;
  pointer-events: none;
}

/* ─── MetalButton Styles ─── */
.metal-btn-wrapper {
  position: relative;
  display: inline-flex;
  border-radius: 9999px;
  padding: 1.5px;
  will-change: transform;
}

.metal-btn-inner {
  position: absolute;
  inset: 1px;
  border-radius: 9999px;
  will-change: transform;
}

.metal-btn-core {
  position: relative;
  z-index: 10;
  margin: 1px;
  border-radius: 9999px;
  display: inline-flex;
  height: 50px;
  cursor: pointer;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  padding: 0 28px;
  font-family: 'Instrument Sans', system-ui, sans-serif;
  font-size: 15.5px;
  font-weight: 600;
  line-height: 1;
  border: none;
  outline: none;
  color: #ffffff;
}
`;

function GlassFilter() {
  return (
    <svg className="liquid-glass-svg-defs" aria-hidden="true">
      <defs>
        <filter
          id="container-glass"
          x="0%"
          y="0%"
          width="100%"
          height="100%"
          colorInterpolationFilters="sRGB"
        >
          <feTurbulence
            type="fractalNoise"
            baseFrequency="0.05 0.05"
            numOctaves="1"
            seed="1"
            result="turbulence"
          />
          <feGaussianBlur in="turbulence" stdDeviation="2" result="blurredNoise" />
          <feDisplacementMap
            in="SourceGraphic"
            in2="blurredNoise"
            scale="70"
            xChannelSelector="R"
            yChannelSelector="B"
            result="displaced"
          />
          <feGaussianBlur in="displaced" stdDeviation="4" result="finalBlur" />
          <feComposite in="finalBlur" in2="finalBlur" operator="over" />
        </filter>
      </defs>
    </svg>
  );
}

export const LiquidButton = forwardRef(
  (
    {
      className = '',
      variant = 'default',
      size = 'xxl',
      as: Comp = 'button',
      children,
      ...props
    },
    ref
  ) => {
    const uid = useId().replace(/:/g, '');
    const sizeClass = `liquid-glass-btn--${size || 'xxl'}`;

    return (
      <>
        <style>{LIQUID_GLASS_CSS}</style>
        <Comp
          ref={ref}
          data-slot="button"
          className={`liquid-glass-btn ${sizeClass} ${className}`.trim()}
          {...props}
        >
          <div className="liquid-glass-btn__refraction" />

          {/* Rising Liquid Fill Tank with Dual Sloshing Waves & Bubbles */}
          <div className="liquid-glass-btn__tank" aria-hidden="true">
            <div className="liquid-glass-btn__liquid">
              {/* Back Wave */}
              <svg
                className="liquid-glass-btn__wave liquid-glass-btn__wave--back"
                viewBox="0 0 240 24"
                preserveAspectRatio="none"
              >
                <path
                  d="M0,12 C30,24 60,0 120,12 C180,24 210,0 240,12 L240,24 L0,24 Z"
                  fill="#2ee6ff"
                />
              </svg>

              {/* Front Wave */}
              <svg
                className="liquid-glass-btn__wave liquid-glass-btn__wave--front"
                viewBox="0 0 240 24"
                preserveAspectRatio="none"
              >
                <defs>
                  <linearGradient id={`lq-grad-${uid}`} x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#1f3bff" />
                    <stop offset="55%" stopColor="#2f7bff" />
                    <stop offset="100%" stopColor="#2ee6ff" />
                  </linearGradient>
                </defs>
                <path
                  d="M0,12 C40,0 80,24 120,12 C160,0 200,24 240,12 L240,24 L0,24 Z"
                  fill={`url(#lq-grad-${uid})`}
                />
              </svg>

              {/* Solid Liquid Body */}
              <div className="liquid-glass-btn__body">
                <span className="liquid-glass-btn__bubble liquid-glass-btn__bubble--1" />
                <span className="liquid-glass-btn__bubble liquid-glass-btn__bubble--2" />
                <span className="liquid-glass-btn__bubble liquid-glass-btn__bubble--3" />
              </div>
            </div>
          </div>

          <div className="liquid-glass-btn__rim" />
          <div className="liquid-glass-btn__content">{children}</div>
          <GlassFilter />
        </Comp>
      </>
    );
  }
);

LiquidButton.displayName = 'LiquidButton';

const METAL_PALETTES = {
  default: {
    outer: 'linear-gradient(180deg, #000000 0%, #A0A0A0 100%)',
    inner: 'linear-gradient(180deg, #FAFAFA 0%, #3E3E3E 50%, #E5E5E5 100%)',
    button: 'linear-gradient(180deg, #B9B9B9 0%, #969696 100%)',
    textShadow: '0 -1px 0 rgb(80 80 80 / 100%)',
  },
  primary: {
    outer: 'linear-gradient(180deg, #03050A 0%, #2EE6FF 100%)',
    inner: 'linear-gradient(180deg, #E0FAFF 0%, #0D259C 50%, #93C5FD 100%)',
    button: 'linear-gradient(180deg, #1F3BFF 0%, #091540 100%)',
    textShadow: '0 -1px 0 rgb(15 23 42 / 100%)',
  },
  gold: {
    outer: 'linear-gradient(180deg, #917100 0%, #EAD98F 100%)',
    inner: 'linear-gradient(180deg, #FFFDDD 0%, #856807 50%, #FFF1B3 100%)',
    button: 'linear-gradient(180deg, #FFEBA1 0%, #9B873F 100%)',
    textShadow: '0 -1px 0 rgb(178 140 2 / 100%)',
  },
};

export const MetalButton = forwardRef(
  ({ children = 'Button', className = '', variant = 'default', ...props }, ref) => {
    const [isPressed, setIsPressed] = useState(false);
    const [isHovered, setIsHovered] = useState(false);
    const [isTouchDevice, setIsTouchDevice] = useState(false);

    useEffect(() => {
      setIsTouchDevice('ontouchstart' in window || navigator.maxTouchPoints > 0);
    }, []);

    const palette = METAL_PALETTES[variant] || METAL_PALETTES.default;
    const transitionStyle = 'all 250ms cubic-bezier(0.1, 0.4, 0.2, 1)';

    return (
      <>
        <style>{LIQUID_GLASS_CSS}</style>
        <div
          className="metal-btn-wrapper"
          style={{
            background: palette.outer,
            transform: isPressed
              ? 'translateY(2.5px) scale(0.99)'
              : 'translateY(0) scale(1)',
            boxShadow: isPressed
              ? '0 1px 2px rgba(0, 0, 0, 0.15)'
              : isHovered && !isTouchDevice
              ? '0 4px 12px rgba(0, 0, 0, 0.12)'
              : '0 3px 8px rgba(0, 0, 0, 0.08)',
            transition: transitionStyle,
          }}
        >
          <div
            className="metal-btn-inner"
            style={{
              background: palette.inner,
              transition: transitionStyle,
              filter:
                isHovered && !isPressed && !isTouchDevice
                  ? 'brightness(1.05)'
                  : 'none',
            }}
          />
          <button
            ref={ref}
            type="button"
            className={`metal-btn-core ${className}`.trim()}
            style={{
              background: palette.button,
              textShadow: palette.textShadow,
              transform: isPressed ? 'scale(0.97)' : 'scale(1)',
              transition: transitionStyle,
            }}
            onMouseDown={() => setIsPressed(true)}
            onMouseUp={() => setIsPressed(false)}
            onMouseLeave={() => {
              setIsPressed(false);
              setIsHovered(false);
            }}
            onMouseEnter={() => {
              if (!isTouchDevice) setIsHovered(true);
            }}
            onTouchStart={() => setIsPressed(true)}
            onTouchEnd={() => setIsPressed(false)}
            onTouchCancel={() => setIsPressed(false)}
            {...props}
          >
            {children}
          </button>
        </div>
      </>
    );
  }
);

MetalButton.displayName = 'MetalButton';

export default LiquidButton;
