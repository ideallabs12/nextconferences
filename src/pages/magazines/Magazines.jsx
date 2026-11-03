import React, { useState, useEffect } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import { magazinesData as localMagazinesData } from './magazinesData';
import { fetchMagazinesFromSupabase } from '../../lib/supabase.js';
import './magazines.css';

const Magazines = () => {
  const [magazinesData, setMagazinesData] = useState(localMagazinesData);
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  useEffect(() => {
    fetchMagazinesFromSupabase()
      .then(data => {
        if (data && data.length > 0) setMagazinesData(data);
      })
      .catch(() => {});
  }, []);

  // Redirect legacy ?speaker= query parameter to individual page /magazines/:id
  useEffect(() => {
    const speakerParam = searchParams.get('speaker');
    if (speakerParam) {
      const match = magazinesData.find(
        m => m.id === speakerParam || m.name.toLowerCase().includes(speakerParam.toLowerCase())
      );
      if (match) {
        navigate(`/magazines/${match.id}`, { replace: true });
      }
    }
  }, [searchParams, magazinesData, navigate]);

  return (
    <div className="magazines-page">
      <div className="magazines-container">
        {/* ─── Hero Header ─── */}
        <header className="magazines-hero">
          <span className="magazines-label">Publications</span>
          <h1 className="magazines-title">
            Speaker Spotlight <span className="text-gradient">Magazines</span>
          </h1>
          <p className="magazines-subtitle">
            Explore exclusive editorial publications and keynote spotlights from our visionary conference speakers.
          </p>
        </header>

        {/* ─── Magazines Grid ─── */}
        <section className="magazines-grid-section">
          <div className="magazines-grid">
            {magazinesData.map((mag, idx) => (
              <Link
                key={mag.id}
                to={`/magazines/${mag.id}`}
                className="magazine-card"
                style={{ animationDelay: `${idx * 0.06}s`, textDecoration: 'none' }}
              >
                <div className="mag-card-cover-wrapper">
                  <div className="mag-card-book">
                    <img
                      src={mag.coverImage}
                      alt={mag.name}
                      className="mag-card-img"
                      loading="lazy"
                    />
                    <div className="mag-card-overlay">
                      <span className="btn-hover-read">
                        View Speaker Page ➔
                      </span>
                    </div>
                  </div>
                </div>

                <div className="mag-card-body">
                  <h3 className="mag-card-speaker">{mag.name}</h3>
                  <p className="mag-card-role">{mag.title}</p>
                </div>
              </Link>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
};

export default Magazines;
