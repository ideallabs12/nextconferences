import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import './HomeGallery.css';

const allImages = [
  '/gallery_imgs/next_gallery_2.jpg',
  '/gallery_imgs/next_gallery_3.jpg',
  '/gallery_imgs/next_gallery_4.jpg',
  '/gallery_imgs/next_gallery_5.jpg',
  '/gallery_imgs/next_gallery_6.jpg',
  '/gallery_imgs/next_gallery_7.jpg',
  '/gallery_imgs/next_gallery_8.jpg',
  '/gallery_imgs/next_gallery_9.jpg',
  '/gallery_imgs/next_gallery_10.jpg',
  '/gallery_imgs/next_gallery_11.jpg',
  '/gallery_imgs/next_gallery_12.jpg',
  '/gallery_imgs/next_gallery_13.jpg'
];

const HomeGallery = () => {
  // Use a smaller sample of images for the home page 3D slider (e.g. 5 images)
  const sampleImages = allImages.slice(0, 5);
  const [activeIndex, setActiveIndex] = useState(2);

  // Auto-play interval
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveIndex((current) => (current + 1) % sampleImages.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [sampleImages.length]);

  return (
    <section className="home-gallery-section">
      <div className="home-gallery-header">
        <span className="gallery-eyebrow">MOMENTS</span>
        <h2 className="gallery-title">Experience <span className="text-gradient">NEXT</span></h2>
        <p className="gallery-subtitle">
          A visual collection of our most recent works – each piece crafted
          with intention, emotion, and style.
        </p>
      </div>

      <div className="coverflow-container">
        <div className="coverflow-track">
          {sampleImages.map((src, idx) => {
            let offset = idx - activeIndex;
            // Handle wrapping for infinite feel
            if (offset < -2) offset += sampleImages.length;
            if (offset > 2) offset -= sampleImages.length;

            let className = "coverflow-item";
            if (offset === 0) className += " coverflow-active";
            else if (offset === -1) className += " coverflow-prev";
            else if (offset === 1) className += " coverflow-next";
            else if (offset === -2) className += " coverflow-prev-outer";
            else if (offset === 2) className += " coverflow-next-outer";
            else className += " coverflow-hidden";

            return (
              <div 
                key={idx} 
                className={className} 
                onClick={() => setActiveIndex(idx)}
              >
                <img
                  className="coverflow-img"
                  src={src}
                  alt={`gallery-${idx}`}
                />
              </div>
            );
          })}
        </div>
      </div>
      
      <div className="home-gallery-footer">
          <Link to="/gallery" className="btn-view-all">View Full Gallery ➔</Link>
      </div>
    </section>
  );
};

export default HomeGallery;
