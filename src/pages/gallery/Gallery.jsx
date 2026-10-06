import React, { useState } from 'react';
import './gallery.css';

// Dynamically import all images in the gallery_imgs directory
const images = [
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

const Gallery = () => {
    const [selectedImg, setSelectedImg] = useState(null);

    return (
        <div className="gallery-page">
            <header className="gallery-header">
                <span className="gallery-label">Moments</span>
                <h1 className="gallery-title">Our Visual Journey</h1>
                <p className="gallery-subtitle">
                    Explore highlights from past NEXT Premier League Conferences. 
                    Witness the convergence of visionary leaders, holistic well-being, and conscious growth.
                </p>
            </header>

            <div className="gallery-grid">
                {images.map((src, index) => (
                    <div 
                        key={index} 
                        className="gallery-item"
                        onClick={() => setSelectedImg(src)}
                    >
                        <img 
                            src={src} 
                            alt={`Gallery moment ${index + 1}`} 
                            loading="lazy" 
                        />
                        <div className="gallery-item-overlay">
                            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M15 3h6v6"></path>
                                <path d="M9 21H3v-6"></path>
                                <path d="M21 3l-7 7"></path>
                                <path d="M3 21l7-7"></path>
                            </svg>
                        </div>
                    </div>
                ))}
            </div>

            {/* Lightbox Modal */}
            {selectedImg && (
                <div className="lightbox" onClick={() => setSelectedImg(null)}>
                    <button className="lightbox-close" onClick={() => setSelectedImg(null)}>
                        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <line x1="18" y1="6" x2="6" y2="18"></line>
                            <line x1="6" y1="6" x2="18" y2="18"></line>
                        </svg>
                    </button>
                    <img 
                        src={selectedImg} 
                        alt="Enlarged view" 
                        className="lightbox-img" 
                        onClick={(e) => e.stopPropagation()} 
                    />
                </div>
            )}
        </div>
    );
};

export default Gallery;
