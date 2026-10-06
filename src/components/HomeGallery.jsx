import React from 'react';
import { Link } from 'react-router-dom';
import './HomeGallery.css';

const imageModules = import.meta.glob('../pages/gallery/gallery_imgs/*.(png|jpg|jpeg|webp)', { eager: true, import: 'default' });
const allImages = Object.values(imageModules);

const HomeGallery = () => {
  // Use up to 6 images for the accordion gallery
  const images = allImages.slice(0, 6);

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

      <div className="home-gallery-container">
        {images.map((src, idx) => (
          <div key={idx} className="home-gallery-item">
            <img
              className="home-gallery-img"
              src={src}
              alt={`gallery-${idx}`}
            />
          </div>
        ))}
      </div>
      
      <div className="home-gallery-footer">
          <Link to="/gallery" className="btn-view-all">View Full Gallery ➔</Link>
      </div>
    </section>
  );
};

export default HomeGallery;
