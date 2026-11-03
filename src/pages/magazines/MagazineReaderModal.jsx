import React, { useState, useEffect } from 'react';
import './magazineReader.css';

const MagazineReaderModal = ({ magazine, onClose }) => {
  // Combine coverImage + flipPages into a single ordered list of pages
  const allPages = magazine
    ? [magazine.coverImage, ...(Array.isArray(magazine.flipPages) ? magazine.flipPages : [])].filter(Boolean)
    : [];
  const totalPages = allPages.length;
  const isMultiPage = totalPages > 1;

  const [currentIndex, setCurrentIndex] = useState(0);
  const [flipDirection, setFlipDirection] = useState(null); // 'next' | 'prev' | null

  useEffect(() => {
    setCurrentIndex(0);
    setFlipDirection(null);
  }, [magazine]);

  const goNext = () => {
    if (!isMultiPage || currentIndex >= totalPages - 1 || flipDirection) return;
    setFlipDirection('next');
    setTimeout(() => {
      setCurrentIndex((prev) => Math.min(prev + 1, totalPages - 1));
      setFlipDirection(null);
    }, 260);
  };

  const goPrev = () => {
    if (!isMultiPage || currentIndex <= 0 || flipDirection) return;
    setFlipDirection('prev');
    setTimeout(() => {
      setCurrentIndex((prev) => Math.max(prev - 1, 0));
      setFlipDirection(null);
    }, 260);
  };

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        onClose();
      } else if (e.key === 'ArrowRight') {
        goNext();
      } else if (e.key === 'ArrowLeft') {
        goPrev();
      }
    };

    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [currentIndex, totalPages, flipDirection]);

  if (!magazine) return null;

  return (
    <div className="mag-reader-overlay" onClick={onClose}>
      <div className="mag-reader-modal" onClick={(e) => e.stopPropagation()}>
        {/* ─── Minimal Header ─── */}
        <header className="mag-reader-header">
          <h2 className="mag-reader-speaker">{magazine.name}</h2>

          <div className="mag-reader-actions">
            {isMultiPage && (
              <span className="mag-page-indicator">
                {currentIndex + 1} / {totalPages}
              </span>
            )}
            <button className="mag-close-btn" onClick={onClose} title="Close (Esc)">
              ✕
            </button>
          </div>
        </header>

        {/* ─── Clean Magazine Stage ─── */}
        <div className="mag-reader-body">
          {isMultiPage && (
            <button
              className="mag-nav-arrow mag-nav-prev"
              onClick={goPrev}
              disabled={currentIndex === 0}
              aria-label="Previous page"
            >
              ‹
            </button>
          )}

          <div
            className={`mag-page-frame ${flipDirection ? `flip-${flipDirection}` : ''}`}
            onClick={isMultiPage && currentIndex < totalPages - 1 ? goNext : undefined}
            style={{ cursor: isMultiPage && currentIndex < totalPages - 1 ? 'pointer' : 'default' }}
          >
            <img
              src={allPages[currentIndex]}
              alt={`${magazine.name} - Page ${currentIndex + 1}`}
              className="mag-page-image"
            />
          </div>

          {isMultiPage && (
            <button
              className="mag-nav-arrow mag-nav-next"
              onClick={goNext}
              disabled={currentIndex === totalPages - 1}
              aria-label="Next page"
            >
              ›
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default MagazineReaderModal;
