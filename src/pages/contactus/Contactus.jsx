import React, { useEffect, useRef, useState, useCallback } from "react";
import { Mail, Phone, Headphones, ArrowRight } from "lucide-react";
import * as d3 from "d3";
import { feature } from "topojson-client";
import './contactus.css';

const CONTACT_LINKS = [
  { icon: Mail, label: "contact@nextconferences.com", href: "mailto:contact@nextconferences.com" },
  { icon: Phone, label: "+1 (800) 555-NEXT", href: "tel:+18005556398" },
  { icon: Headphones, label: "support@nextconferences.com", href: "mailto:support@nextconferences.com" },
];

const cityCoordinates = {
  "san francisco": [37.7749, -122.4194],
  "new york": [40.7128, -74.006],
  london: [51.5074, -0.1278],
  tokyo: [35.6762, 139.6503],
  paris: [48.8566, 2.3522],
  moscow: [55.7558, 37.6176],
  dubai: [25.2048, 55.2708],
  singapore: [1.3521, 103.8198],
  sydney: [-33.8688, 151.2093],
  mumbai: [19.076, 72.8777],
  "los angeles": [34.0522, -118.2437],
  chicago: [41.8781, -87.6298],
};

function orthographicRaw(x, y) {
  const cosy = Math.cos(y);
  return [cosy * Math.sin(x), Math.sin(y)];
}

function equirectangularRaw(lambda, phi) {
  return [lambda, phi];
}

function interpolateProjection(raw0, raw1) {
  let t = 0;
  const createRawProjection = (alpha) => {
    return (lambda, phi) => {
      const [x0, y0] = raw0(lambda, phi);
      const [x1, y1] = raw1(lambda, phi);
      return [x0 + alpha * (x1 - x0), y0 + alpha * (y1 - y0)];
    };
  };

  const projection = d3.geoProjection(createRawProjection(t));
  const alphaMethod = (value) => {
    if (value !== undefined) {
      t = +value;
      const newProjection = d3.geoProjection(createRawProjection(t));
      if (projection.scale()) newProjection.scale(projection.scale());
      if (projection.translate()) newProjection.translate(projection.translate());
      if (projection.rotate()) newProjection.rotate(projection.rotate());
      if (projection.precision()) newProjection.precision(projection.precision());
      newProjection.alpha = alphaMethod;
      return newProjection;
    }
    return t;
  };
  projection.alpha = alphaMethod;
  return projection;
}

function GlobeWireframe({
  width,
  height,
  className = "",
  strokeColor = "rgba(0, 210, 255, 0.5)",
  strokeWidth = 0.6,
  graticuleColor = "rgba(255, 255, 255, 0.1)",
  graticuleOpacity = 0.12,
  sphereOutlineColor = "rgba(0, 210, 255, 0.2)",
  sphereOutlineWidth = 1,
  autoRotate = true,
  autoRotateSpeed = 0.45,
  rotateToLocation,
  rotateCities = [],
  rotationSpeed = 3000,
  initialRotation = [0, 0],
  enableInteraction = true,
  showGraticule = true,
  startAsGlobe = true,
  countryFillColor,
  countryHoverColor,
  variant = "wireframesolid",
  scale = 1,
  backgroundColor = "transparent",
}) {
  const svgRef = useRef(null);
  const containerRef = useRef(null);
  const [progress, setProgress] = useState(startAsGlobe ? 0 : 100);
  const [worldData, setWorldData] = useState([]);
  const [rotation, setRotation] = useState(initialRotation);
  const [isDragging, setIsDragging] = useState(false);
  const [lastMouse, setLastMouse] = useState([0, 0]);
  const [isVisible, setIsVisible] = useState(false);
  const rotationInterval = useRef(null);
  const rotationAnimFrame = useRef(null);
  const rotationStartTime = useRef(null);
  const rotationFrom = useRef([0, 0]);
  const rotationTo = useRef([0, 0]);
  const animationFrame = useRef(null);
  const [currentCityIndex, setCurrentCityIndex] = useState(0);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const resizeObserver = useRef(null);
  const rotationRef = useRef(rotation);

  useEffect(() => {
    rotationRef.current = rotation;
  }, [rotation]);

  const useResponsive = !width && !height;
  const finalWidth = useResponsive ? dimensions.width : width || 800;
  const finalHeight = useResponsive ? dimensions.height : height || 500;

  useEffect(() => {
    if (!containerRef.current) return;
    const container = containerRef.current;
    const updateDimensions = () => {
      if (container && useResponsive) {
        const width = container.offsetWidth || 300;
        setDimensions({ width, height: width });
      }
    };
    updateDimensions();
    if (useResponsive) {
      resizeObserver.current = new ResizeObserver(updateDimensions);
      resizeObserver.current.observe(container);
    }
    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        setIsVisible(entry.isIntersecting);
      },
      { threshold: 0.1 }
    );
    observer.observe(container);
    return () => {
      if (resizeObserver.current) resizeObserver.current.disconnect();
      observer.unobserve(container);
    };
  }, [useResponsive]);

  useEffect(() => {
    const loadWorldData = async () => {
      try {
        const response = await fetch("https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json");
        const world = await response.json();
        const countries = feature(world, world.objects.countries).features;
        setWorldData(countries);
      } catch (error) {
        setWorldData([{
          type: "Feature",
          geometry: {
            type: "Polygon",
            coordinates: [[[-180, -90], [180, -90], [180, 90], [-180, 90], [-180, -90]]]
          },
          properties: {}
        }]);
      }
    };
    loadWorldData();
  }, []);

  useEffect(() => {
    if (!autoRotate || !isVisible || isDragging || rotateCities.length > 0) {
      if (animationFrame.current) {
        cancelAnimationFrame(animationFrame.current);
        animationFrame.current = null;
      }
      return;
    }
    const rotate = () => {
      setRotation((prev) => [(prev[0] + autoRotateSpeed) % 360, prev[1]]);
      animationFrame.current = requestAnimationFrame(rotate);
    };
    animationFrame.current = requestAnimationFrame(rotate);
    return () => {
      if (animationFrame.current) cancelAnimationFrame(animationFrame.current);
    };
  }, [autoRotate, autoRotateSpeed, isVisible, isDragging, rotateCities.length]);

  const animateRotationTo = useCallback((target, duration = 1200) => {
    if (rotationAnimFrame.current) cancelAnimationFrame(rotationAnimFrame.current);
    rotationFrom.current = rotationRef.current;
    rotationTo.current = target;
    rotationStartTime.current = performance.now();
    const animate = (time) => {
      const elapsed = time - (rotationStartTime.current || 0);
      const t = Math.min(elapsed / duration, 1);
      const eased = t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
      const lon = rotationFrom.current[0] + (rotationTo.current[0] - rotationFrom.current[0]) * eased;
      const lat = rotationFrom.current[1] + (rotationTo.current[1] - rotationFrom.current[1]) * eased;
      setRotation([lon, lat]);
      if (t < 1) rotationAnimFrame.current = requestAnimationFrame(animate);
    };
    rotationAnimFrame.current = requestAnimationFrame(animate);
  }, []);

  const handleMouseDown = (event) => {
    if (!enableInteraction) return;
    setIsDragging(true);
    const rect = svgRef.current?.getBoundingClientRect();
    if (rect) setLastMouse([event.clientX - rect.left, event.clientY - rect.top]);
  };

  const handleMouseMove = (event) => {
    if (!isDragging || !enableInteraction) return;
    const rect = svgRef.current?.getBoundingClientRect();
    if (!rect) return;
    const currentMouse = [event.clientX - rect.left, event.clientY - rect.top];
    const dx = currentMouse[0] - lastMouse[0];
    const dy = currentMouse[1] - lastMouse[1];
    setRotation((prev) => [
      prev[0] + dx * 0.5,
      Math.max(-90, Math.min(90, prev[1] - dy * 0.5))
    ]);
    setLastMouse(currentMouse);
  };

  const handleMouseUp = () => setIsDragging(false);
  const handleMouseLeave = () => setIsDragging(false);

  useEffect(() => {
    if (!svgRef.current || worldData.length === 0 || !isVisible) return;
    if (useResponsive && dimensions.width === 0) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    let projection = d3.geoOrthographic()
      .scale((Math.min(finalWidth, finalHeight) / 2) * scale * 0.9)
      .translate([finalWidth / 2, finalHeight / 2])
      .rotate([rotation[0], rotation[1]])
      .precision(0.1);
    
    const path = d3.geoPath().projection(projection);

    svg.selectAll(".country")
      .data(worldData)
      .enter()
      .append("path")
      .attr("class", "country")
      .attr("d", (d) => {
        try {
          const p = path(d);
          return (p && !p.includes("NaN")) ? p : "";
        } catch(e) { return ""; }
      })
      .attr("fill", "none")
      .attr("stroke", strokeColor)
      .attr("stroke-width", strokeWidth)
      .style("visibility", function() {
        const d = d3.select(this).attr("d");
        return d && d.length > 0 && !d.includes("NaN") ? "visible" : "hidden";
      });

    try {
      const sphereOutline = path({ type: "Sphere" });
      if (sphereOutline) {
        svg.append("path")
          .datum({ type: "Sphere" })
          .attr("d", sphereOutline)
          .attr("fill", "none")
          .attr("stroke", sphereOutlineColor)
          .attr("stroke-width", 1.5)
          .attr("opacity", 0.8);
      }
    } catch (e) {}
  }, [worldData, rotation, isVisible, finalWidth, finalHeight, strokeColor, strokeWidth, sphereOutlineColor, scale, useResponsive, dimensions.width]);

  return (
    <div ref={containerRef} className={className} style={{ width: '100%', height: '100%', minHeight: '300px' }}>
      <svg
        ref={svgRef}
        width={finalWidth}
        height={finalHeight}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseLeave}
        style={{
          cursor: enableInteraction ? (isDragging ? "grabbing" : "grab") : "default",
          opacity: useResponsive ? (dimensions.width > 0 ? 1 : 0) : 1,
          transition: 'opacity 1s ease'
        }}
      />
    </div>
  );
}

export default function ContactUs() {
  return (
    <div className="contactus-container">
      <div className="contact-wrapper">
        <div className="contact-grid">
          {/* Info & Globe Column */}
          <div className="contact-info-col">
            <div>
              <h3 className="info-title">Global Presence</h3>
              <p className="info-desc">
                Reach out via any channel below. Our team connects innovators across the world.
              </p>
            </div>

            <div className="contact-links">
              {CONTACT_LINKS.map(({ icon: Icon, label, href }) => (
                <a key={label} href={href} className="contact-link-item">
                  <div className="contact-icon-wrapper">
                    <Icon size={18} />
                  </div>
                  {label}
                </a>
              ))}
            </div>

            <div className="globe-container">
              <GlobeWireframe className="absolute-globe" />
            </div>
          </div>

          {/* Form Column */}
          <div className="contact-form-col">
            <div>
              <h3 className="form-header-title">Send a message</h3>
              <p className="form-header-desc">
                Fill out the form and we'll get back to you promptly.
              </p>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Full Name</label>
                <input type="text" placeholder="John Doe" className="form-input" />
              </div>
              <div className="form-group">
                <label className="form-label">Company</label>
                <input type="text" placeholder="NEXT Innovations" className="form-input" />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Email Address</label>
              <input type="email" placeholder="john@example.com" className="form-input" />
            </div>

            <div className="form-group">
              <label className="form-label">Message</label>
              <textarea placeholder="Type your message here..." rows="4" className="form-textarea"></textarea>
            </div>

            <button className="submit-btn">
              Submit Message
              <ArrowRight size={16} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
