import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, ChevronLeft, ChevronRight, Sparkles } from 'lucide-react';
import { magazinesData as localMagazinesData } from './magazinesData';
import { fetchMagazinesFromSupabase } from '../../lib/supabase.js';
import './magazineDetail.css';

const MagazineDetail = () => {
  const { id } = useParams();
  const [magazinesData, setMagazinesData] = useState(localMagazinesData);
  const [currentPage, setCurrentPage] = useState(0);

  useEffect(() => {
    fetchMagazinesFromSupabase()
      .then((data) => {
        if (data && data.length > 0) setMagazinesData(data);
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    setCurrentPage(0);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [id]);

  const magazine = magazinesData.find(
    (m) => m.id === id || m.name.toLowerCase().replace(/[^a-z0-9]+/g, '-') === id
  );

  if (!magazine) {
    return (
      <div className="magazine-detail-page">
        <div className="magazine-detail-container">
          <Link to="/magazines" className="mag-back-link">
            <ArrowLeft size={16} /> Back to Magazines
          </Link>
          <div className="mag-not-found">
            <h2>Magazine Edition Not Found</h2>
            <p>The requested speaker publication could not be found.</p>
          </div>
        </div>
      </div>
    );
  }

  const allPages = [
    magazine.coverImage,
    ...(Array.isArray(magazine.flipPages) ? magazine.flipPages : []),
  ].filter(Boolean);
  const hasMultiplePages = allPages.length > 1;

  return (
    <div className="magazine-detail-page">
      <div className="magazine-detail-container">
        <Link to="/magazines" className="mag-back-link">
          <ArrowLeft size={16} /> Back to Magazines
        </Link>

        {/* ─── Top Speaker Editorial Hero ─── */}
        <section className="mag-detail-hero">
          <div className="mag-detail-cover-col">
            <div className="mag-detail-cover-card">
              <img
                src={magazine.coverImage}
                alt={magazine.name}
                className="mag-detail-cover-img"
              />
            </div>
          </div>

          <div className="mag-detail-info-col">
            {magazine.category && (
              <span className="mag-detail-category">{magazine.category}</span>
            )}
            <h1 className="mag-detail-name">{magazine.name}</h1>
            {magazine.title && (
              <p className="mag-detail-role">{magazine.title}</p>
            )}

            {magazine.quote && (
              <blockquote className="mag-detail-quote">
                “{magazine.quote}”
              </blockquote>
            )}

            {magazine.bio && (
              <div className="mag-detail-bio">
                {magazine.bio.split('\n\n').map((para, i) => (
                  <p key={i}>{para}</p>
                ))}
              </div>
            )}

            {Array.isArray(magazine.highlights) && magazine.highlights.length > 0 && (
              <div className="mag-detail-highlights">
                <h3 className="mag-highlights-heading">
                  <Sparkles size={15} /> Key Focus Areas
                </h3>
                <div className="mag-highlights-grid">
                  {magazine.highlights.map((item, i) => (
                    <div key={i} className="mag-highlight-item">
                      <span className="mag-highlight-dot" />
                      <span>{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </section>

        {/* ─── Multi-Page Magazine Pages Section ─── */}
        {hasMultiplePages && (
          <section className="mag-pages-section">
            <div className="mag-pages-header">
              <div>
                <span className="mag-pages-eyebrow">FULL PUBLICATION</span>
                <h2 className="mag-pages-title">Magazine Pages ({allPages.length} Pages)</h2>
              </div>

              <span className="mag-page-counter">
                Page {currentPage + 1} of {allPages.length}
              </span>
            </div>

            {/* Active Page Viewer with Left/Right Arrows */}
            <div className="mag-active-page-stage">
              <button
                type="button"
                className="mag-stage-arrow"
                onClick={() => setCurrentPage((p) => Math.max(p - 1, 0))}
                disabled={currentPage === 0}
                aria-label="Previous page"
              >
                <ChevronLeft size={22} />
              </button>

              <div className="mag-active-page-frame">
                <img
                  src={allPages[currentPage]}
                  alt={`${magazine.name} - Page ${currentPage + 1}`}
                  className="mag-active-page-img"
                />
              </div>

              <button
                type="button"
                className="mag-stage-arrow"
                onClick={() => setCurrentPage((p) => Math.min(p + 1, allPages.length - 1))}
                disabled={currentPage === allPages.length - 1}
                aria-label="Next page"
              >
                <ChevronRight size={22} />
              </button>
            </div>

            {/* Compact Page Thumbnails Strip */}
            <div className="mag-pages-thumbs">
              {allPages.map((pageUrl, idx) => (
                <button
                  key={idx}
                  type="button"
                  className={`mag-page-thumb ${currentPage === idx ? 'active' : ''}`}
                  onClick={() => setCurrentPage(idx)}
                >
                  <img src={pageUrl} alt={`Page ${idx + 1}`} />
                  <span>{idx === 0 ? 'Cover' : `P.${idx + 1}`}</span>
                </button>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
};

export default MagazineDetail;
