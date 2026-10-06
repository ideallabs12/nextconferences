import React, { useRef, useState, useEffect, useCallback } from "react";
import "./morphGallery.css";

// #region gallery
export const wrapIndex = (i, n, loop) => {
  if (n <= 0) return 0;
  return loop ? ((i % n) + n) % n : Math.min(Math.max(i, 0), n - 1);
};

export const easeInOutQuint = (t) => {
  const x = Math.min(Math.max(t, 0), 1);
  return x < 0.5 ? 16 * x ** 5 : 1 - (-2 * x + 2) ** 5 / 2;
};

export const coverScale = (canvasAspect, imgAspect) =>
  canvasAspect > imgAspect
    ? [1, imgAspect / canvasAspect]
    : [canvasAspect / imgAspect, 1];
// #endregion

const VERT = `
attribute vec2 a_position;
varying vec2 v_uv;
void main() {
  v_uv = a_position * 0.5 + 0.5;
  gl_Position = vec4(a_position, 0.0, 1.0);
}
`;

const FRAG = `
precision highp float;

uniform sampler2D u_from;
uniform sampler2D u_to;
uniform float u_progress;
uniform vec2 u_resolution;
uniform float u_fromAspect;
uniform float u_toAspect;
uniform float u_scale;
uniform float u_direction;
uniform float u_edge;
uniform float u_drift;

varying vec2 v_uv;

vec3 permute(vec3 x) {
  return mod(((x * 34.0) + 1.0) * x, 289.0);
}

float snoise(vec2 v) {
  const vec4 C = vec4(
    0.211324865405187,
    0.366025403784439,
   -0.577350269189626,
    0.024390243902439
  );
  vec2 i  = floor(v + dot(v, C.yy));
  vec2 x0 = v - i + dot(i, C.xx);
  vec2 i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
  vec4 x12 = x0.xyxy + C.xxzz;
  x12.xy -= i1;
  i = mod(i, 289.0);
  vec3 p = permute(
    permute(i.y + vec3(0.0, i1.y, 1.0)) + i.x + vec3(0.0, i1.x, 1.0)
  );
  vec3 m = max(0.5 - vec3(dot(x0, x0), dot(x12.xy, x12.xy), dot(x12.zw, x12.zw)), 0.0);
  m = m * m;
  m = m * m;
  vec3 x  = 2.0 * fract(p * C.www) - 1.0;
  vec3 h  = abs(x) - 0.5;
  vec3 ox = floor(x + 0.5);
  vec3 a0 = x - ox;
  m *= 1.79284291400159 - 0.85373472095314 * (a0 * a0 + h * h);
  vec3 g;
  g.x  = a0.x  * x0.x  + h.x  * x0.y;
  g.yz = a0.yz * x12.xz + h.yz * x12.yw;
  return 130.0 * dot(m, g);
}

float fbm(vec2 v) {
  float value = 0.0;
  float amplitude = 0.5;
  for (int i = 0; i < 5; i++) {
    value += amplitude * snoise(v);
    v *= 2.0;
    amplitude *= 0.5;
  }
  return value;
}

vec2 mirror(vec2 uv) {
  return 1.0 - abs(1.0 - mod(uv, 2.0));
}

vec2 coverUV(vec2 uv, float imgAspect) {
  float canvasAspect = u_resolution.x / u_resolution.y;
  vec2 scale = (canvasAspect > imgAspect)
    ? vec2(1.0, imgAspect / canvasAspect)
    : vec2(canvasAspect / imgAspect, 1.0);
  return mirror((uv - 0.5) * scale + 0.5);
}

void main() {
  float adjusted = u_progress * (1.0 + 2.0 * u_edge) - u_edge;

  float noise = fbm(v_uv * u_scale + vec2(0.0, u_progress * u_direction)) * 0.5 + 0.5;
  noise = smoothstep(
    0.0,
    2.0,
    length(texture2D(u_to, coverUV(v_uv, u_toAspect)).rgb) + noise
  );

  float mixFactor = 1.0 - smoothstep(adjusted - u_edge, adjusted + u_edge, noise);

  vec2 fromUV = coverUV(
    v_uv + vec2(0.0, noise * u_progress * u_drift * u_direction),
    u_fromAspect
  );
  vec2 toUV = coverUV(
    v_uv + vec2(0.0, noise * (1.0 - u_progress) * -0.5 * u_drift * u_direction),
    u_toAspect
  );

  gl_FragColor = mix(texture2D(u_from, fromUV), texture2D(u_to, toUV), mixFactor);
}
`;

const compile = (gl, type, src) => {
  const shader = gl.createShader(type);
  if (!shader) throw new Error("could not create shader");
  gl.shaderSource(shader, src);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    const log = gl.getShaderInfoLog(shader);
    gl.deleteShader(shader);
    throw new Error("shader compile failed: " + log);
  }
  return shader;
};

const link = (gl, vertSrc, fragSrc) => {
  const vert = compile(gl, gl.VERTEX_SHADER, vertSrc);
  const frag = compile(gl, gl.FRAGMENT_SHADER, fragSrc);
  const program = gl.createProgram();
  if (!program) throw new Error("could not create program");
  gl.attachShader(program, vert);
  gl.attachShader(program, frag);
  gl.linkProgram(program);
  gl.deleteShader(vert);
  gl.deleteShader(frag);
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    const log = gl.getProgramInfoLog(program);
    gl.deleteProgram(program);
    throw new Error("program link failed: " + log);
  }
  return program;
};

const loadImage = (src) =>
  new Promise((resolve, reject) => {
    const img = new Image();
    img.decoding = "async";
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error("could not load " + src));
    img.src = src;
  });

export default function MorphGallery({
  items,
  height = "100svh",
  duration = 1500,
  noiseScale = 3.5,
  edge = 0.15,
  drift = 0.5,
  loop = true,
  autoplay = 0,
  arrows = true,
  thumbnails = true,
  index,
  defaultIndex = 0,
  onIndexChange,
  className = "",
}) {
  const canvasRef = useRef(null);
  const [uncontrolled, setUncontrolled] = useState(() =>
    wrapIndex(defaultIndex, items.length, loop),
  );
  const active = index === undefined ? uncontrolled : wrapIndex(index, items.length, loop);

  const [failed, setFailed] = useState(false);
  const [ready, setReady] = useState(false);
  const [generation, setGeneration] = useState(0);
  const [reduced, setReduced] = useState(false);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => setReduced(mq.matches);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);

  const go = useCallback(
    (next) => {
      const wrapped = wrapIndex(next, items.length, loop);
      if (index === undefined) setUncontrolled(wrapped);
      onIndexChange?.(wrapped);
    },
    [index, items.length, loop, onIndexChange],
  );

  const tuning = useRef({ duration, noiseScale, edge, drift, reduced });
  tuning.current = { duration, noiseScale, edge, drift, reduced };

  const request = useRef(null);
  const previous = useRef(active);
  useEffect(() => {
    if (previous.current === active) return;
    request.current = { from: previous.current, to: active };
    previous.current = active;
  }, [active]);

  const sources = items.map((i) => i.src).join("\\n");

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || items.length === 0) return;

    const gl =
      canvas.getContext("webgl", { alpha: false, antialias: false }) ??
      canvas.getContext("experimental-webgl");
    if (!gl) {
      setFailed(true);
      return;
    }

    let program = null;
    let buffer = null;
    const textures = items.map(() => null);
    const aspects = items.map(() => 1);
    let raf = 0;
    let disposed = false;

    let from = active;
    let to = active;
    let progress = 1;
    let startedAt = 0;
    let direction = 1;

    const onLost = (e) => {
      e.preventDefault();
      cancelAnimationFrame(raf);
    };
    const onRestored = () => setGeneration((g) => g + 1);
    canvas.addEventListener("webglcontextlost", onLost);
    canvas.addEventListener("webglcontextrestored", onRestored);

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const w = Math.round(canvas.clientWidth * dpr);
      const h = Math.round(canvas.clientHeight * dpr);
      if (w === 0 || h === 0 || (canvas.width === w && canvas.height === h)) return;
      canvas.width = w;
      canvas.height = h;
      gl.viewport(0, 0, w, h);
    };
    const observer = new ResizeObserver(resize);
    observer.observe(canvas);

    let uniforms = {};

    const pick = (i) => textures[i] ?? textures.find((t) => t) ?? null;

    const draw = () => {
      if (disposed) return;
      const t = tuning.current;

      const pending = request.current;
      if (pending) {
        request.current = null;
        if (pending.from !== pending.to) {
          from = pending.from;
          to = pending.to;
          progress = 0;
          startedAt = performance.now();
          const n = items.length;
          const forward = loop
            ? ((pending.to - pending.from + n) % n) * 2 <= n
            : pending.to > pending.from;
          direction = forward ? 1 : -1;
        }
      }

      if (progress < 1) {
        const span = t.reduced ? 0 : Math.max(t.duration, 1);
        const elapsed = performance.now() - startedAt;
        progress = span === 0 ? 1 : easeInOutQuint(Math.min(elapsed / span, 1));
      }

      const fromTex = pick(from);
      const toTex = pick(to);
      if (!fromTex || !toTex) return;

      gl.activeTexture(gl.TEXTURE0);
      gl.bindTexture(gl.TEXTURE_2D, fromTex);
      gl.uniform1i(uniforms.from, 0);
      gl.activeTexture(gl.TEXTURE1);
      gl.bindTexture(gl.TEXTURE_2D, toTex);
      gl.uniform1i(uniforms.to, 1);

      gl.uniform1f(uniforms.progress, progress);
      gl.uniform2f(uniforms.resolution, canvas.width, canvas.height);
      gl.uniform1f(uniforms.fromAspect, aspects[from] ?? 1);
      gl.uniform1f(uniforms.toAspect, aspects[to] ?? 1);
      gl.uniform1f(uniforms.scale, t.noiseScale);
      gl.uniform1f(uniforms.direction, direction);
      gl.uniform1f(uniforms.edge, Math.max(t.edge, 0.001));
      gl.uniform1f(uniforms.drift, t.drift);
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    };

    const frame = () => {
      draw();
      raf = requestAnimationFrame(frame);
    };

    const start = async () => {
      try {
        program = link(gl, VERT, FRAG);
        gl.useProgram(program);

        buffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
        gl.bufferData(
          gl.ARRAY_BUFFER,
          new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]),
          gl.STATIC_DRAW,
        );
        const loc = gl.getAttribLocation(program, "a_position");
        gl.enableVertexAttribArray(loc);
        gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);

        for (const name of [
          "from", "to", "progress", "resolution",
          "fromAspect", "toAspect", "scale", "direction", "edge", "drift",
        ]) {
          uniforms[name] = gl.getUniformLocation(program, "u_" + name);
        }

        gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);

        let running = false;
        let refused = 0;
        await Promise.all(
          items.map((item, i) =>
            loadImage(item.src).then(
              (img) => {
                if (disposed) return;
                const tex = gl.createTexture();
                gl.bindTexture(gl.TEXTURE_2D, tex);
                gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, img);
                gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
                gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
                gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
                gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
                textures[i] = tex;
                aspects[i] = img.naturalWidth / Math.max(img.naturalHeight, 1);
                if (!running) {
                  running = true;
                  resize();
                  setReady(true);
                  raf = requestAnimationFrame(frame);
                }
              },
              () => {
                refused += 1;
                if (refused === items.length && !disposed) setFailed(true);
              },
            ),
          ),
        );
      } catch {
        if (!disposed) setFailed(true);
      }
    };
    void start();

    return () => {
      disposed = true;
      cancelAnimationFrame(raf);
      observer.disconnect();
      canvas.removeEventListener("webglcontextlost", onLost);
      canvas.removeEventListener("webglcontextrestored", onRestored);
      for (const tex of textures) if (tex) gl.deleteTexture(tex);
      if (buffer) gl.deleteBuffer(buffer);
      if (program) gl.deleteProgram(program);
      textures.fill(null);
    };
  }, [sources, generation, items.length, loop]);

  useEffect(() => {
    if (!autoplay || reduced || paused || items.length < 2) return;
    const id = window.setInterval(() => go(active + 1), Math.max(autoplay, 600));
    return () => window.clearInterval(id);
  }, [autoplay, reduced, paused, active, go, items.length]);

  useEffect(() => {
    const sync = () => setPaused(document.hidden);
    document.addEventListener("visibilitychange", sync);
    return () => document.removeEventListener("visibilitychange", sync);
  }, []);

  const swipe = useRef(null);
  const onPointerDown = (e) => {
    swipe.current = e.clientX;
  };
  const onPointerUp = (e) => {
    const startX = swipe.current;
    swipe.current = null;
    if (startX === null) return;
    const dx = e.clientX - startX;
    if (Math.abs(dx) > 48) go(active + (dx < 0 ? 1 : -1));
  };
  const onKeyDown = (e) => {
    if (e.key === "ArrowLeft") {
      e.preventDefault();
      go(active - 1);
    } else if (e.key === "ArrowRight") {
      e.preventDefault();
      go(active + 1);
    }
  };

  const atStart = !loop && active === 0;
  const atEnd = !loop && active === items.length - 1;
  const current = items[active];

  return (
    <section
      className={"morph-gallery-container " + className}
      style={{ height }}
      role="region"
      aria-roledescription="carousel"
      aria-label="Image gallery"
      tabIndex={0}
      onKeyDown={onKeyDown}
      onPointerDown={onPointerDown}
      onPointerUp={onPointerUp}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
    >
      {failed ? (
        items.map((item, i) => (
          <img
            key={item.src}
            src={item.src}
            alt={item.alt ?? ""}
            className="morph-gallery-fallback-img"
            style={{ opacity: i === active ? 1 : 0 }}
            aria-hidden={i !== active}
          />
        ))
      ) : (
        <canvas
          ref={canvasRef}
          className="morph-gallery-canvas"
          style={{ opacity: ready ? 1 : 0, transition: "opacity 400ms ease" }}
          aria-hidden="true"
        />
      )}

      <div className="morph-gallery-gradient" aria-hidden="true" />

      {arrows && items.length > 1 && (
        <>
          <button
            type="button"
            className="morph-gallery-arrow morph-gallery-arrow-left"
            onClick={() => go(active - 1)}
            disabled={atStart}
            aria-label="Previous image"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <polyline points="15 18 9 12 15 6" />
            </svg>
          </button>
          <button
            type="button"
            className="morph-gallery-arrow morph-gallery-arrow-right"
            onClick={() => go(active + 1)}
            disabled={atEnd}
            aria-label="Next image"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <polyline points="9 18 15 12 9 6" />
            </svg>
          </button>
        </>
      )}

      {thumbnails && items.length > 1 && (
        <ul className="morph-gallery-thumbnails">
          {items.map((item, i) => (
            <li key={item.src} className="morph-gallery-thumbnail-item">
              <button
                type="button"
                onClick={() => go(i)}
                aria-current={i === active}
                aria-label={item.alt ? "Show " + item.alt : "Show image " + (i + 1)}
                className={"morph-gallery-thumbnail-btn " + (i === active ? "active" : "")}
              >
                <img
                  src={item.thumb ?? item.src}
                  alt=""
                  width={80}
                  height={50}
                  loading="lazy"
                  decoding="async"
                />
              </button>
            </li>
          ))}
        </ul>
      )}

      <span className="sr-only" aria-live="polite">
        {current ? current.alt ?? "Image " + (active + 1) : ""}
        {" — "}
        {active + 1} of {items.length}
      </span>
    </section>
  );
}
