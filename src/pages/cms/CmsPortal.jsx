import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  Layers,
  Mic,
  BookOpen,
  Plus,
  Edit3,
  Trash2,
  Search,
  Download,
  RefreshCw,
  ExternalLink,
  CheckCircle,
  AlertCircle,
  Database,
  GitBranch,
  Calendar,
  MapPin,
  Sparkles,
  ArrowUpDown,
} from 'lucide-react';

import {
  loadCmsData,
  saveConferences,
  saveSpeakers,
  saveMagazines,
  downloadJsonFile,
  downloadMagazinesJs,
  isLocalhost,
} from '../../lib/cmsService.js';

import { getSpeakerSlug, getConferenceImageUrl, getSpeakerImageUrl } from '../../lib/supabase.js';

import ConferenceModal from './ConferenceModal.jsx';
import SpeakerModal from './SpeakerModal.jsx';
import MagazineModal from './MagazineModal.jsx';
import DeleteConfirmModal from './DeleteConfirmModal.jsx';
import './CmsPortal.css';

export default function CmsPortal() {
  const [activeTab, setActiveTab] = useState('conferences'); // 'conferences' | 'speakers' | 'magazines' | 'sync'
  const [conferences, setConferences] = useState([]);
  const [speakers, setSpeakers] = useState([]);
  const [magazines, setMagazines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Search queries
  const [confSearch, setConfSearch] = useState('');
  const [speakerSearch, setSpeakerSearch] = useState('');
  const [magSearch, setMagSearch] = useState('');

  // Modals state
  const [confModal, setConfModal] = useState({ isOpen: false, data: null });
  const [speakerModal, setSpeakerModal] = useState({ isOpen: false, data: null });
  const [magModal, setMagModal] = useState({ isOpen: false, data: null });
  const [deleteModal, setDeleteModal] = useState({ isOpen: false, type: '', item: null });

  // Toast feedback
  const [toast, setToast] = useState(null);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => {
      setToast(null);
    }, 4500);
  };

  // Initial load
  const loadData = async () => {
    setLoading(true);
    try {
      const data = await loadCmsData();
      setConferences(data.conferences || []);
      setSpeakers(data.speakers || []);
      setMagazines(data.magazines || []);
    } catch (err) {
      showToast('Failed to load initial CMS data: ' + err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // ──────────────────────── CONFERENCES CRUD ────────────────────────
  const handleSaveConference = async (formData) => {
    setSaving(true);
    try {
      let updated;
      const existingIdx = conferences.findIndex((c) => c.slug === formData.slug);
      if (existingIdx !== -1) {
        // Edit existing
        updated = [...conferences];
        updated[existingIdx] = { ...updated[existingIdx], ...formData };
      } else {
        // Add new
        updated = [formData, ...conferences];
      }

      const res = await saveConferences(updated);
      if (res.success) {
        setConferences(updated);
        setConfModal({ isOpen: false, data: null });
        showToast(
          `Conference "${formData.title}" saved successfully to local files and Supabase!`
        );
      } else {
        showToast('Error saving conference: ' + (res.error || 'Unknown error'), 'error');
      }
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteConference = async () => {
    if (!deleteModal.item) return;
    setSaving(true);
    try {
      const updated = conferences.filter((c) => c.slug !== deleteModal.item.slug);
      const res = await saveConferences(updated);
      if (res.success) {
        setConferences(updated);
        setDeleteModal({ isOpen: false, type: '', item: null });
        showToast(`Conference "${deleteModal.item.title}" deleted.`);
      } else {
        showToast('Error deleting conference: ' + res.error, 'error');
      }
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setSaving(false);
    }
  };

  // ──────────────────────── SPEAKERS CRUD ────────────────────────
  const handleSaveSpeaker = async (formData) => {
    setSaving(true);
    try {
      let updated;
      const existingIdx = speakers.findIndex((s) => String(s.id) === String(formData.id));
      if (existingIdx !== -1) {
        updated = [...speakers];
        updated[existingIdx] = { ...updated[existingIdx], ...formData };
      } else {
        updated = [formData, ...speakers];
      }

      const res = await saveSpeakers(updated);
      if (res.success) {
        setSpeakers(updated);
        setSpeakerModal({ isOpen: false, data: null });
        showToast(`Speaker "${formData.name}" saved successfully!`);
      } else {
        showToast('Error saving speaker: ' + res.error, 'error');
      }
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteSpeaker = async () => {
    if (!deleteModal.item) return;
    setSaving(true);
    try {
      const updated = speakers.filter((s) => String(s.id) !== String(deleteModal.item.id));
      const res = await saveSpeakers(updated);
      if (res.success) {
        setSpeakers(updated);
        setDeleteModal({ isOpen: false, type: '', item: null });
        showToast(`Speaker "${deleteModal.item.name}" deleted.`);
      } else {
        showToast('Error deleting speaker: ' + res.error, 'error');
      }
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setSaving(false);
    }
  };

  // ──────────────────────── MAGAZINES CRUD ────────────────────────
  const handleSaveMagazine = async (formData) => {
    setSaving(true);
    try {
      let updated;
      const existingIdx = magazines.findIndex((m) => String(m.id) === String(formData.id));
      if (existingIdx !== -1) {
        updated = [...magazines];
        updated[existingIdx] = { ...updated[existingIdx], ...formData };
      } else {
        updated = [formData, ...magazines];
      }

      const res = await saveMagazines(updated);
      if (res.success) {
        setMagazines(updated);
        setMagModal({ isOpen: false, data: null });
        showToast(`Magazine "${formData.name}" saved successfully!`);
      } else {
        showToast('Error saving magazine: ' + res.error, 'error');
      }
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteMagazine = async () => {
    if (!deleteModal.item) return;
    setSaving(true);
    try {
      const updated = magazines.filter((m) => String(m.id) !== String(deleteModal.item.id));
      const res = await saveMagazines(updated);
      if (res.success) {
        setMagazines(updated);
        setDeleteModal({ isOpen: false, type: '', item: null });
        showToast(`Magazine "${deleteModal.item.name}" deleted.`);
      } else {
        showToast('Error deleting magazine: ' + res.error, 'error');
      }
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setSaving(false);
    }
  };

  // ──────────────────────── FILTERED LISTS ────────────────────────
  const filteredConferences = useMemo(() => {
    const q = confSearch.trim().toLowerCase();
    if (!q) return conferences;
    return conferences.filter(
      (c) =>
        (c.title && c.title.toLowerCase().includes(q)) ||
        (c.slug && c.slug.toLowerCase().includes(q)) ||
        (c.location && c.location.toLowerCase().includes(q)) ||
        (c.theme && c.theme.toLowerCase().includes(q))
    );
  }, [conferences, confSearch]);

  const filteredSpeakers = useMemo(() => {
    const q = speakerSearch.trim().toLowerCase();
    if (!q) return speakers;
    return speakers.filter(
      (s) =>
        (s.name && s.name.toLowerCase().includes(q)) ||
        (s.description && s.description.toLowerCase().includes(q))
    );
  }, [speakers, speakerSearch]);

  const filteredMagazines = useMemo(() => {
    const q = magSearch.trim().toLowerCase();
    if (!q) return magazines;
    return magazines.filter(
      (m) =>
        (m.name && m.name.toLowerCase().includes(q)) ||
        (m.title && m.title.toLowerCase().includes(q)) ||
        (m.id && m.id.toLowerCase().includes(q))
    );
  }, [magazines, magSearch]);

  return (
    <div className="cms-portal">
      {/* Toast Feedback Banner */}
      {toast && (
        <div className={`cms-toast cms-toast--${toast.type}`}>
          {toast.type === 'success' ? <CheckCircle size={18} /> : <AlertCircle size={18} />}
          <span>{toast.message}</span>
        </div>
      )}

      {/* ─── Topbar ─── */}
      <header className="cms-header">
        <div className="cms-brand-row">
          <div className="cms-brand-logo">
            <span className="cms-brand-badge">NEXT</span>
            <h2>CMS PORTAL</h2>
          </div>
          <div className="cms-status-badges">
            <span className="cms-pill cms-pill--local">
              <span className="cms-status-dot" /> Localhost Active
            </span>
            <span className="cms-pill cms-pill--db">
              <Database size={12} /> Supabase Sync Live
            </span>
          </div>
        </div>

        <div className="cms-header-actions">
          <button
            type="button"
            className="cms-btn cms-btn--ghost"
            onClick={loadData}
            title="Reload from local files and Supabase"
            disabled={loading}
          >
            <RefreshCw size={14} className={loading ? 'cms-spin' : ''} />
            <span>Reload</span>
          </button>
          <Link to="/" target="_blank" className="cms-btn cms-btn--outline" title="Open public website">
            <ExternalLink size={14} />
            <span>View Public Site</span>
          </Link>
        </div>
      </header>

      {/* ─── Navigation Tabs ─── */}
      <nav className="cms-nav-bar">
        <div className="cms-nav-tabs">
          <button
            type="button"
            className={`cms-main-tab ${activeTab === 'conferences' ? 'is-active' : ''}`}
            onClick={() => setActiveTab('conferences')}
          >
            <Layers size={16} />
            <span>Conferences</span>
            <span className="cms-tab-count">{conferences.length}</span>
          </button>

          <button
            type="button"
            className={`cms-main-tab ${activeTab === 'speakers' ? 'is-active' : ''}`}
            onClick={() => setActiveTab('speakers')}
          >
            <Mic size={16} />
            <span>Speakers</span>
            <span className="cms-tab-count">{speakers.length}</span>
          </button>

          <button
            type="button"
            className={`cms-main-tab ${activeTab === 'magazines' ? 'is-active' : ''}`}
            onClick={() => setActiveTab('magazines')}
          >
            <BookOpen size={16} />
            <span>Magazines</span>
            <span className="cms-tab-count">{magazines.length}</span>
          </button>

          <button
            type="button"
            className={`cms-main-tab ${activeTab === 'sync' ? 'is-active' : ''}`}
            onClick={() => setActiveTab('sync')}
          >
            <GitBranch size={16} />
            <span>Git & Data Exports</span>
          </button>
        </div>
      </nav>

      {/* ─── Main Content Area ─── */}
      <main className="cms-main">
        {/* ══════════════════════════════════════════════════════════════
            1. CONFERENCES TAB
           ══════════════════════════════════════════════════════════════ */}
        {activeTab === 'conferences' && (
          <section className="cms-section">
            <div className="cms-toolbar">
              <div className="cms-search-box">
                <Search size={16} />
                <input
                  type="text"
                  placeholder="Search conferences by title, location, or slug..."
                  value={confSearch}
                  onChange={(e) => setConfSearch(e.target.value)}
                />
                {confSearch && (
                  <button type="button" className="cms-clear-search" onClick={() => setConfSearch('')}>
                    ×
                  </button>
                )}
              </div>

              <button
                type="button"
                className="cms-btn cms-btn--primary"
                onClick={() => setConfModal({ isOpen: true, data: null })}
              >
                <Plus size={16} />
                <span>Add New Conference</span>
              </button>
            </div>

            {loading ? (
              <div className="cms-loading-state">
                <RefreshCw size={24} className="cms-spin" />
                <p>Loading conferences...</p>
              </div>
            ) : filteredConferences.length === 0 ? (
              <div className="cms-empty-state">
                <Layers size={36} />
                <h4>No conferences found</h4>
                <p>{confSearch ? 'Try a different search term.' : 'Click "Add New Conference" to create your first event.'}</p>
              </div>
            ) : (
              <div className="cms-cards-grid">
                {filteredConferences.map((conf) => {
                  const imgUrl = getConferenceImageUrl(conf) || (conf.image ? `/conferences_imgs/${conf.image}` : '');
                  const packagesCount = Array.isArray(conf.packages) ? conf.packages.length : 0;
                  const sessionsCount = Array.isArray(conf.insightSessions || conf.insight_sessions)
                    ? (conf.insightSessions || conf.insight_sessions).length
                    : 0;

                  return (
                    <div key={conf.slug} className="cms-item-card">
                      <div className="cms-card-image-wrap">
                        {imgUrl ? (
                          <img src={imgUrl} alt={conf.title} className="cms-card-img" />
                        ) : (
                          <div className="cms-card-no-img">
                            <Layers size={24} />
                          </div>
                        )}
                        <span className="cms-order-badge">#{conf.displayOrder || conf.display_order || '1'}</span>
                      </div>

                      <div className="cms-card-content">
                        <div className="cms-card-meta-row">
                          <span className="cms-slug-tag">/{conf.slug}</span>
                          {conf.date && (
                            <span className="cms-meta-item">
                              <Calendar size={12} /> {conf.date}
                            </span>
                          )}
                          {conf.location && (
                            <span className="cms-meta-item">
                              <MapPin size={12} /> {conf.location}
                            </span>
                          )}
                        </div>

                        <h3 className="cms-card-title">{conf.title}</h3>

                        {conf.theme && <p className="cms-card-theme">{conf.theme}</p>}

                        <div className="cms-card-badges-row">
                          <span className="cms-badge">{packagesCount} Packages</span>
                          <span className="cms-badge">{sessionsCount} Agenda Streams</span>
                        </div>
                      </div>

                      <div className="cms-card-actions">
                        <Link
                          to={`/conference/${conf.slug}`}
                          target="_blank"
                          className="cms-icon-action-btn"
                          title="Preview public page"
                        >
                          <ExternalLink size={15} />
                        </Link>
                        <button
                          type="button"
                          className="cms-btn cms-btn--outline"
                          onClick={() => setConfModal({ isOpen: true, data: conf })}
                        >
                          <Edit3 size={14} /> Edit
                        </button>
                        <button
                          type="button"
                          className="cms-btn cms-btn--danger-ghost"
                          onClick={() =>
                            setDeleteModal({
                              isOpen: true,
                              type: 'conference',
                              item: conf,
                            })
                          }
                          title="Delete conference"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </section>
        )}

        {/* ══════════════════════════════════════════════════════════════
            2. SPEAKERS TAB
           ══════════════════════════════════════════════════════════════ */}
        {activeTab === 'speakers' && (
          <section className="cms-section">
            <div className="cms-toolbar">
              <div className="cms-search-box">
                <Search size={16} />
                <input
                  type="text"
                  placeholder="Search speakers by name or credentials..."
                  value={speakerSearch}
                  onChange={(e) => setSpeakerSearch(e.target.value)}
                />
                {speakerSearch && (
                  <button type="button" className="cms-clear-search" onClick={() => setSpeakerSearch('')}>
                    ×
                  </button>
                )}
              </div>

              <button
                type="button"
                className="cms-btn cms-btn--primary"
                onClick={() => setSpeakerModal({ isOpen: true, data: null })}
              >
                <Plus size={16} />
                <span>Add New Speaker</span>
              </button>
            </div>

            {loading ? (
              <div className="cms-loading-state">
                <RefreshCw size={24} className="cms-spin" />
                <p>Loading speakers...</p>
              </div>
            ) : filteredSpeakers.length === 0 ? (
              <div className="cms-empty-state">
                <Mic size={36} />
                <h4>No speakers found</h4>
                <p>{speakerSearch ? 'Try a different search term.' : 'Click "Add New Speaker" to create a profile.'}</p>
              </div>
            ) : (
              <div className="cms-speakers-grid">
                {filteredSpeakers.map((speaker) => {
                  const slug = getSpeakerSlug(speaker);
                  const imgUrl = getSpeakerImageUrl(speaker) || (speaker.image ? `/speakers_imgs/${speaker.image}` : '');
                  const linkedMag = magazines.find(
                    (m) => String(m.speakerId) === String(speaker.id) || m.id === slug
                  );

                  return (
                    <div key={speaker.id || slug} className="cms-speaker-row-card">
                      <div className="cms-speaker-avatar-wrap">
                        {imgUrl ? (
                          <img src={imgUrl} alt={speaker.name} className="cms-speaker-avatar" />
                        ) : (
                          <div className="cms-speaker-avatar-empty">
                            <Mic size={20} />
                          </div>
                        )}
                        <span className="cms-order-badge">#{speaker.displayOrder || speaker.display_order || '1'}</span>
                      </div>

                      <div className="cms-speaker-info">
                        <div className="cms-speaker-header-row">
                          <h3 className="cms-speaker-name">{speaker.name}</h3>
                          <span className="cms-slug-tag">/speakers/{slug}</span>
                        </div>
                        <p className="cms-speaker-desc">{speaker.description}</p>
                        {linkedMag && (
                          <span className="cms-badge cms-badge--mag">
                            <BookOpen size={11} /> Featured in {linkedMag.name} Magazine
                          </span>
                        )}
                      </div>

                      <div className="cms-speaker-actions">
                        <Link
                          to={`/speakers/${slug}`}
                          target="_blank"
                          className="cms-icon-action-btn"
                          title="Preview public profile"
                        >
                          <ExternalLink size={15} />
                        </Link>
                        <button
                          type="button"
                          className="cms-btn cms-btn--outline"
                          onClick={() => setSpeakerModal({ isOpen: true, data: speaker })}
                        >
                          <Edit3 size={14} /> Edit
                        </button>
                        <button
                          type="button"
                          className="cms-btn cms-btn--danger-ghost"
                          onClick={() =>
                            setDeleteModal({
                              isOpen: true,
                              type: 'speaker',
                              item: speaker,
                            })
                          }
                          title="Delete speaker"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </section>
        )}

        {/* ══════════════════════════════════════════════════════════════
            3. MAGAZINES TAB
           ══════════════════════════════════════════════════════════════ */}
        {activeTab === 'magazines' && (
          <section className="cms-section">
            <div className="cms-toolbar">
              <div className="cms-search-box">
                <Search size={16} />
                <input
                  type="text"
                  placeholder="Search magazines by name, title, or ID..."
                  value={magSearch}
                  onChange={(e) => setMagSearch(e.target.value)}
                />
                {magSearch && (
                  <button type="button" className="cms-clear-search" onClick={() => setMagSearch('')}>
                    ×
                  </button>
                )}
              </div>

              <button
                type="button"
                className="cms-btn cms-btn--primary"
                onClick={() => setMagModal({ isOpen: true, data: null })}
              >
                <Plus size={16} />
                <span>Add New Magazine</span>
              </button>
            </div>

            {loading ? (
              <div className="cms-loading-state">
                <RefreshCw size={24} className="cms-spin" />
                <p>Loading magazines...</p>
              </div>
            ) : filteredMagazines.length === 0 ? (
              <div className="cms-empty-state">
                <BookOpen size={36} />
                <h4>No magazines found</h4>
                <p>{magSearch ? 'Try a different search term.' : 'Click "Add New Magazine" to publish a feature.'}</p>
              </div>
            ) : (
              <div className="cms-cards-grid">
                {filteredMagazines.map((mag) => {
                  const flipPagesCount = Array.isArray(mag.flipPages || mag.flip_pages)
                    ? (mag.flipPages || mag.flip_pages).length
                    : 0;

                  return (
                    <div key={mag.id} className="cms-item-card cms-item-card--mag">
                      <div className="cms-card-image-wrap cms-card-image-wrap--mag">
                        {mag.coverImage || mag.cover_image ? (
                          <img
                            src={mag.coverImage || mag.cover_image}
                            alt={mag.name}
                            className="cms-card-img"
                          />
                        ) : (
                          <div className="cms-card-no-img">
                            <BookOpen size={24} />
                          </div>
                        )}
                        <span className="cms-order-badge">#{mag.displayOrder || mag.display_order || '1'}</span>
                      </div>

                      <div className="cms-card-content">
                        <div className="cms-card-meta-row">
                          <span className="cms-slug-tag">/magazine/{mag.id}</span>
                          {mag.issueNumber && <span className="cms-meta-item">{mag.issueNumber}</span>}
                          {mag.issueDate && <span className="cms-meta-item">{mag.issueDate}</span>}
                        </div>

                        <h3 className="cms-card-title">{mag.name}</h3>
                        {mag.title && <p className="cms-card-theme">{mag.title}</p>}
                        {mag.tagline && <p className="cms-card-subtext">{mag.tagline}</p>}

                        <div className="cms-card-badges-row">
                          <span className="cms-badge">
                            {mag.hasFlipbook ? `Flipbook: ${flipPagesCount} Spreads` : 'Static Feature'}
                          </span>
                          {mag.speakerId && <span className="cms-badge">Speaker Linked</span>}
                        </div>
                      </div>

                      <div className="cms-card-actions">
                        <Link
                          to={`/magazine/${mag.id}`}
                          target="_blank"
                          className="cms-icon-action-btn"
                          title="Open flipbook publication"
                        >
                          <ExternalLink size={15} />
                        </Link>
                        <button
                          type="button"
                          className="cms-btn cms-btn--outline"
                          onClick={() => setMagModal({ isOpen: true, data: mag })}
                        >
                          <Edit3 size={14} /> Edit
                        </button>
                        <button
                          type="button"
                          className="cms-btn cms-btn--danger-ghost"
                          onClick={() =>
                            setDeleteModal({
                              isOpen: true,
                              type: 'magazine',
                              item: mag,
                            })
                          }
                          title="Delete magazine"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </section>
        )}

        {/* ══════════════════════════════════════════════════════════════
            4. GIT & DATA EXPORTS TAB
           ══════════════════════════════════════════════════════════════ */}
        {activeTab === 'sync' && (
          <section className="cms-section cms-sync-section">
            <div className="cms-sync-intro">
              <div className="cms-sync-icon">
                <GitBranch size={28} />
              </div>
              <div>
                <h2>Git Repository & Local File Sync</h2>
                <p>
                  All additions and edits made in this portal are automatically written to your local disk files
                  and synchronized with Supabase in real-time. You can also download updated JSON files below to
                  keep backups or commit changes to GitHub.
                </p>
              </div>
            </div>

            <div className="cms-sync-grid">
              {/* Conferences Card */}
              <div className="cms-sync-card">
                <div className="cms-sync-card-header">
                  <Layers size={22} />
                  <div>
                    <h4>conferences.json</h4>
                    <span>{conferences.length} Active Conferences</span>
                  </div>
                </div>
                <p>
                  Updates <code>conferences/conferences.json</code> and{' '}
                  <code>src/pages/conferences/conferences.json</code>.
                </p>
                <button
                  type="button"
                  className="cms-btn cms-btn--secondary"
                  onClick={() => downloadJsonFile('conferences.json', conferences)}
                >
                  <Download size={14} /> Download conferences.json
                </button>
              </div>

              {/* Speakers Card */}
              <div className="cms-sync-card">
                <div className="cms-sync-card-header">
                  <Mic size={22} />
                  <div>
                    <h4>speakers.json</h4>
                    <span>{speakers.length} Active Speakers</span>
                  </div>
                </div>
                <p>
                  Updates <code>src/pages/speakers/speakers.json</code> with names, bios, and portraits.
                </p>
                <button
                  type="button"
                  className="cms-btn cms-btn--secondary"
                  onClick={() => downloadJsonFile('speakers.json', speakers)}
                >
                  <Download size={14} /> Download speakers.json
                </button>
              </div>

              {/* Magazines Card */}
              <div className="cms-sync-card">
                <div className="cms-sync-card-header">
                  <BookOpen size={22} />
                  <div>
                    <h4>magazinesData.js</h4>
                    <span>{magazines.length} Publications</span>
                  </div>
                </div>
                <p>
                  Updates <code>src/pages/magazines/magazinesData.js</code> with interactive flipbook data.
                </p>
                <button
                  type="button"
                  className="cms-btn cms-btn--secondary"
                  onClick={() => downloadMagazinesJs(magazines)}
                >
                  <Download size={14} /> Download magazinesData.js
                </button>
              </div>
            </div>

            <div className="cms-git-tip-box">
              <h4>Git Commit Guide:</h4>
              <p>Whenever you edit or add items on <code>localhost:5173/cms</code>, run in your terminal:</p>
              <pre className="cms-code-block">
                git status{'\n'}git add .{'\n'}git commit -m "Update conference, speaker, and magazine data"{'\n'}git push origin main
              </pre>
            </div>
          </section>
        )}
      </main>

      {/* ─── MODALS ─── */}
      <ConferenceModal
        isOpen={confModal.isOpen}
        conference={confModal.data}
        onSave={handleSaveConference}
        onClose={() => setConfModal({ isOpen: false, data: null })}
        isSaving={saving}
      />

      <SpeakerModal
        isOpen={speakerModal.isOpen}
        speaker={speakerModal.data}
        onSave={handleSaveSpeaker}
        onClose={() => setSpeakerModal({ isOpen: false, data: null })}
        isSaving={saving}
      />

      <MagazineModal
        isOpen={magModal.isOpen}
        magazine={magModal.data}
        speakers={speakers}
        onSave={handleSaveMagazine}
        onClose={() => setMagModal({ isOpen: false, data: null })}
        isSaving={saving}
      />

      <DeleteConfirmModal
        isOpen={deleteModal.isOpen}
        title={`Delete ${deleteModal.type}`}
        itemName={deleteModal.item ? (deleteModal.item.title || deleteModal.item.name) : ''}
        onConfirm={
          deleteModal.type === 'conference'
            ? handleDeleteConference
            : deleteModal.type === 'speaker'
            ? handleDeleteSpeaker
            : handleDeleteMagazine
        }
        onCancel={() => setDeleteModal({ isOpen: false, type: '', item: null })}
        isDeleting={saving}
      />
    </div>
  );
}

