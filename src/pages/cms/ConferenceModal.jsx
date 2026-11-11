import React, { useState, useEffect, useMemo } from 'react';
import { X, Upload, Plus, Trash2, Image, Sparkles, Check, FileText, Copy } from 'lucide-react';
import { uploadImageFile } from '../../lib/cmsService.js';

// ─── Standard Samples for Bulk Import ───
const SAMPLE_TEXT_FORMAT = `Title: Clinical Cardiology & Heart Failure
Topics: Arrhythmia & Electrophysiology, Heart Failure, Cardiac Imaging, Valvular Disease

Title: Pediatric & Congenital Heart Diseases
Topics: Fetal Cardiology, Neonatal Intensive Care, Pediatric Cardiac Surgery

Title: Artificial Intelligence in Healthcare
Topics: Diagnostic Imaging, Predictive Analytics, Medical Robotics, EHR Integration`;

const SAMPLE_JSON_FORMAT = `[
  {
    "title": "Clinical Cardiology & Heart Failure",
    "topics": [
      "Arrhythmia & Electrophysiology",
      "Heart Failure",
      "Cardiac Imaging",
      "Valvular Disease"
    ]
  },
  {
    "title": "Pediatric & Congenital Heart Diseases",
    "topics": [
      "Fetal Cardiology",
      "Neonatal Intensive Care",
      "Pediatric Cardiac Surgery"
    ]
  }
]`;

// ─── Flexible Bulk Sessions Parser ───
function parseBulkSessions(rawText) {
  if (!rawText || !rawText.trim()) return [];
  const text = rawText.trim();

  // 1. Try JSON parsing
  if (text.startsWith('[') || text.startsWith('{')) {
    try {
      const parsed = JSON.parse(text);
      const list = Array.isArray(parsed) ? parsed : (Array.isArray(parsed.sessions) ? parsed.sessions : null);
      if (list) {
        return list.map((item) => ({
          title: item.title || item.name || item.sessionTitle || 'Untitled Session',
          topics: Array.isArray(item.topics)
            ? item.topics.map((t) => String(t).trim()).filter(Boolean)
            : (typeof item.topics === 'string' ? item.topics.split(/[,;\n]/).map((t) => t.trim()).filter(Boolean) : [])
        })).filter((s) => s.title || s.topics.length > 0);
      } else if (typeof parsed === 'object') {
        return Object.entries(parsed).map(([title, topics]) => ({
          title: title.trim(),
          topics: Array.isArray(topics)
            ? topics.map((t) => String(t).trim()).filter(Boolean)
            : (typeof topics === 'string' ? topics.split(/[,;\n]/).map((t) => t.trim()).filter(Boolean) : [])
        }));
      }
    } catch {
      // Fall through to text-based parsing
    }
  }

  // 2. Text-based parsing (Supports Title:/Topics:, Markdown headings, and inline colons)
  const lines = text.split(/\r?\n/);
  const sessions = [];
  let currentSession = null;

  for (let rawLine of lines) {
    const line = rawLine.trim();
    if (!line) continue;

    const titleMatch = line.match(/^(?:title|session(?:\s+stream)?|stream)\s*:\s*(.+)$/i);
    const mdHeadingMatch = line.match(/^#{1,4}\s*(.+)$/);
    const inlineColonMatch =
      !titleMatch &&
      line.includes(':') &&
      !line.toLowerCase().startsWith('topics:') &&
      !line.toLowerCase().startsWith('keywords:');

    if (titleMatch) {
      if (currentSession) sessions.push(currentSession);
      currentSession = { title: titleMatch[1].trim(), topics: [] };
    } else if (mdHeadingMatch) {
      if (currentSession) sessions.push(currentSession);
      currentSession = { title: mdHeadingMatch[1].trim(), topics: [] };
    } else if (line.toLowerCase().startsWith('topics:') || line.toLowerCase().startsWith('keywords:')) {
      const topicsText = line.replace(/^(?:topics|keywords)\s*:\s*/i, '');
      const splitted = topicsText
        .split(/[,;]/)
        .map((t) => t.trim().replace(/^[-*•\d.]+\s*/, ''))
        .filter(Boolean);
      if (!currentSession) {
        currentSession = { title: 'Untitled Session', topics: [] };
      }
      currentSession.topics.push(...splitted);
    } else if (line.startsWith('-') || line.startsWith('*') || line.startsWith('•') || /^\d+\./.test(line)) {
      const topicText = line.replace(/^[-*•\d.]+\s*/, '').trim();
      const splitted = topicText.split(/[,;]/).map((t) => t.trim()).filter(Boolean);
      if (!currentSession) {
        currentSession = { title: 'Untitled Session', topics: [] };
      }
      currentSession.topics.push(...splitted);
    } else if (inlineColonMatch) {
      const colonIdx = line.indexOf(':');
      const sTitle = line.substring(0, colonIdx).trim();
      const rest = line.substring(colonIdx + 1).trim();
      if (currentSession) sessions.push(currentSession);
      currentSession = {
        title: sTitle,
        topics: rest
          ? rest
              .split(/[,;]/)
              .map((t) => t.trim().replace(/^[-*•\d.]+\s*/, ''))
              .filter(Boolean)
          : [],
      };
    } else {
      if (!currentSession) {
        currentSession = { title: line, topics: [] };
      } else {
        const splitted = line.split(/[,;]/).map((t) => t.trim()).filter(Boolean);
        currentSession.topics.push(...splitted);
      }
    }
  }

  if (currentSession) {
    sessions.push(currentSession);
  }

  return sessions.map((s) => ({
    title: s.title || 'Untitled Session',
    topics: Array.from(new Set(s.topics.map((t) => t.trim()).filter(Boolean))),
  })).filter((s) => s.title || s.topics.length > 0);
}

export default function ConferenceModal({ isOpen, conference, onSave, onClose, isSaving }) {
  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    date: '',
    location: '',
    theme: '',
    description: '',
    image: '',
    imageUrl: '',
    displayOrder: 1,
    insightSessions: [],
    packages: [],
  });

  const [activeTab, setActiveTab] = useState('general'); // 'general' | 'sessions' | 'packages'
  const [uploading, setUploading] = useState(false);
  const [newTopicInputs, setNewTopicInputs] = useState({});
  const [newOfferInputs, setNewOfferInputs] = useState({});

  // Bulk Sessions Import State
  const [showBulkImport, setShowBulkImport] = useState(false);
  const [bulkInputText, setBulkInputText] = useState('');
  const [bulkImportMode, setBulkImportMode] = useState('append'); // 'append' | 'replace'
  const [bulkTopicOpen, setBulkTopicOpen] = useState({});
  const [bulkTopicInputs, setBulkTopicInputs] = useState({});

  const parsedBulkPreview = useMemo(() => {
    return parseBulkSessions(bulkInputText);
  }, [bulkInputText]);

  useEffect(() => {
    if (conference) {
      setFormData({
        title: conference.title || '',
        slug: conference.slug || '',
        date: conference.date || '',
        location: conference.location || '',
        theme: conference.theme || '',
        description: conference.description || '',
        image: conference.image || '',
        imageUrl: conference.imageUrl || conference.image_url || '',
        displayOrder: conference.displayOrder ?? conference.display_order ?? 1,
        insightSessions: Array.isArray(conference.insightSessions || conference.insight_sessions)
          ? JSON.parse(JSON.stringify(conference.insightSessions || conference.insight_sessions))
          : [],
        packages: Array.isArray(conference.packages)
          ? JSON.parse(JSON.stringify(conference.packages))
          : [],
      });
    } else {
      setFormData({
        title: '',
        slug: '',
        date: '',
        location: '',
        theme: '',
        description: '',
        image: '',
        imageUrl: '',
        displayOrder: 1,
        insightSessions: [],
        packages: [],
      });
    }
    setActiveTab('general');
  }, [conference, isOpen]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const generateSlug = () => {
    if (!formData.title) return;
    const auto = formData.title
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
    setFormData((prev) => ({ ...prev, slug: auto }));
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const url = await uploadImageFile(file, 'conferences');
      setFormData((prev) => ({
        ...prev,
        image: file.name,
        imageUrl: url,
      }));
    } catch (err) {
      alert('Failed to upload image: ' + err.message);
    } finally {
      setUploading(false);
    }
  };

  // ─── Insight Sessions Handlers ───
  const addSession = () => {
    setFormData((prev) => ({
      ...prev,
      insightSessions: [
        ...prev.insightSessions,
        { title: 'New Insight Session', topics: ['Topic 1', 'Topic 2'] },
      ],
    }));
  };

  const updateSessionTitle = (idx, title) => {
    setFormData((prev) => {
      const copy = [...prev.insightSessions];
      copy[idx] = { ...copy[idx], title };
      return { ...prev, insightSessions: copy };
    });
  };

  const removeSession = (idx) => {
    setFormData((prev) => ({
      ...prev,
      insightSessions: prev.insightSessions.filter((_, i) => i !== idx),
    }));
  };

  const addTopic = (sessionIdx) => {
    const raw = (newTopicInputs[sessionIdx] || '').trim();
    if (!raw) return;
    const items = raw
      .split(/[,;\n]/)
      .map((t) => t.trim().replace(/^[-*•\d.]+\s*/, ''))
      .filter(Boolean);
    if (items.length === 0) return;

    setFormData((prev) => {
      const copy = [...prev.insightSessions];
      const existing = Array.isArray(copy[sessionIdx].topics) ? [...copy[sessionIdx].topics] : [];
      const merged = [...existing];
      items.forEach((item) => {
        if (!merged.includes(item)) {
          merged.push(item);
        }
      });
      copy[sessionIdx] = { ...copy[sessionIdx], topics: merged };
      return { ...prev, insightSessions: copy };
    });
    setNewTopicInputs((prev) => ({ ...prev, [sessionIdx]: '' }));
  };

  const handleBulkAddTopics = (sessionIdx) => {
    const raw = (bulkTopicInputs[sessionIdx] || '').trim();
    if (!raw) return;
    const items = raw
      .split(/[,;\n]/)
      .map((t) => t.trim().replace(/^[-*•\d.]+\s*/, ''))
      .filter(Boolean);
    if (items.length === 0) return;

    setFormData((prev) => {
      const copy = [...prev.insightSessions];
      const existing = Array.isArray(copy[sessionIdx].topics) ? [...copy[sessionIdx].topics] : [];
      const merged = [...existing];
      items.forEach((item) => {
        if (!merged.includes(item)) {
          merged.push(item);
        }
      });
      copy[sessionIdx] = { ...copy[sessionIdx], topics: merged };
      return { ...prev, insightSessions: copy };
    });
    setBulkTopicInputs((prev) => ({ ...prev, [sessionIdx]: '' }));
    setBulkTopicOpen((prev) => ({ ...prev, [sessionIdx]: false }));
  };

  const loadSampleText = () => {
    setBulkInputText(SAMPLE_TEXT_FORMAT);
  };

  const loadSampleJson = () => {
    setBulkInputText(SAMPLE_JSON_FORMAT);
  };

  const loadCurrentSessionsIntoBulk = () => {
    if (!formData.insightSessions || formData.insightSessions.length === 0) return;
    const formatted = formData.insightSessions
      .map((s) => {
        const title = s.title || 'Untitled Session';
        const topics = (s.topics || []).join(', ');
        return `Title: ${title}\nTopics: ${topics}`;
      })
      .join('\n\n');
    setBulkInputText(formatted);
  };

  const applyBulkImport = () => {
    if (parsedBulkPreview.length === 0) return;
    setFormData((prev) => {
      let nextSessions;
      if (bulkImportMode === 'replace') {
        nextSessions = [...parsedBulkPreview];
      } else {
        nextSessions = [...prev.insightSessions, ...parsedBulkPreview];
      }
      return { ...prev, insightSessions: nextSessions };
    });
    setBulkInputText('');
    setShowBulkImport(false);
  };

  const removeTopic = (sessionIdx, topicIdx) => {
    setFormData((prev) => {
      const copy = [...prev.insightSessions];
      copy[sessionIdx].topics = copy[sessionIdx].topics.filter((_, i) => i !== topicIdx);
      return { ...prev, insightSessions: copy };
    });
  };

  // ─── Packages Handlers ───
  const addPackage = () => {
    setFormData((prev) => ({
      ...prev,
      packages: [
        ...prev.packages,
        {
          packageName: 'New Delegate Package',
          price: 499,
          offers: ['Entry to all sessions', 'Conference proceedings'],
        },
      ],
    }));
  };

  const updatePackageField = (idx, field, value) => {
    setFormData((prev) => {
      const copy = [...prev.packages];
      copy[idx] = { ...copy[idx], [field]: value };
      return { ...prev, packages: copy };
    });
  };

  const removePackage = (idx) => {
    setFormData((prev) => ({
      ...prev,
      packages: prev.packages.filter((_, i) => i !== idx),
    }));
  };

  const addOffer = (pkgIdx) => {
    const raw = (newOfferInputs[pkgIdx] || '').trim();
    if (!raw) return;
    const items = raw
      .split(/[,;\n]/)
      .map((t) => t.trim().replace(/^[-*•\d.]+\s*/, ''))
      .filter(Boolean);
    if (items.length === 0) return;

    setFormData((prev) => {
      const copy = [...prev.packages];
      const offers = Array.isArray(copy[pkgIdx].offers) ? [...copy[pkgIdx].offers] : [];
      const merged = [...offers];
      items.forEach((item) => {
        if (!merged.includes(item)) {
          merged.push(item);
        }
      });
      copy[pkgIdx] = { ...copy[pkgIdx], offers: merged };
      return { ...prev, packages: copy };
    });
    setNewOfferInputs((prev) => ({ ...prev, [pkgIdx]: '' }));
  };

  const removeOffer = (pkgIdx, offerIdx) => {
    setFormData((prev) => {
      const copy = [...prev.packages];
      copy[pkgIdx].offers = copy[pkgIdx].offers.filter((_, i) => i !== offerIdx);
      return { ...prev, packages: copy };
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      alert('Please enter a conference title');
      return;
    }
    if (!formData.slug.trim()) {
      alert('Please enter or generate a slug URL');
      return;
    }

    // Auto-commit any unsaved text in newTopicInputs
    const sessionsCopy = formData.insightSessions.map((session, sIdx) => {
      const pendingTopic = (newTopicInputs[sIdx] || '').trim();
      if (!pendingTopic) return session;
      const splitted = pendingTopic
        .split(/[,;\n]/)
        .map((t) => t.trim().replace(/^[-*•\d.]+\s*/, ''))
        .filter(Boolean);
      const existing = Array.isArray(session.topics) ? [...session.topics] : [];
      splitted.forEach((item) => {
        if (!existing.includes(item)) existing.push(item);
      });
      return { ...session, topics: existing };
    });

    onSave({ ...formData, insightSessions: sessionsCopy });
  };

  const currentPreviewImg = formData.imageUrl || (formData.image ? `/conferences_imgs/${formData.image}` : '');

  return (
    <div className="cms-modal-backdrop" onClick={onClose}>
      <div className="cms-modal cms-modal--large" onClick={(e) => e.stopPropagation()}>
        <div className="cms-modal-header">
          <div>
            <h3>{conference ? 'Edit Conference' : 'Add New Conference'}</h3>
            <p className="cms-modal-sub">
              {formData.slug ? `/conference/${formData.slug}` : 'Configure conference details, agenda, and passes'}
            </p>
          </div>
          <button type="button" className="cms-close-btn" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        {/* Modal Tabs */}
        <div className="cms-modal-nav">
          <button
            type="button"
            className={`cms-tab-btn ${activeTab === 'general' ? 'is-active' : ''}`}
            onClick={() => setActiveTab('general')}
          >
            General Details
          </button>
          <button
            type="button"
            className={`cms-tab-btn ${activeTab === 'sessions' ? 'is-active' : ''}`}
            onClick={() => setActiveTab('sessions')}
          >
            Insight Sessions ({formData.insightSessions.length})
          </button>
          <button
            type="button"
            className={`cms-tab-btn ${activeTab === 'packages' ? 'is-active' : ''}`}
            onClick={() => setActiveTab('packages')}
          >
            Registration Packages ({formData.packages.length})
          </button>
        </div>

        <form onSubmit={handleSubmit} className="cms-modal-form">
          <div className="cms-modal-body">
            {/* ─── TAB 1: GENERAL DETAILS ─── */}
            {activeTab === 'general' && (
              <div className="cms-form-grid">
                <div className="cms-form-group cms-col-12">
                  <label>Conference Title *</label>
                  <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleChange}
                    placeholder="e.g. NEXT Premier League Conference on Quantum Leadership"
                    required
                  />
                </div>

                <div className="cms-form-group cms-col-6">
                  <div className="cms-label-row">
                    <label>URL Slug *</label>
                    <button
                      type="button"
                      className="cms-mini-btn"
                      onClick={generateSlug}
                      title="Auto-generate slug from title"
                    >
                      <Sparkles size={12} /> Auto-Generate
                    </button>
                  </div>
                  <input
                    type="text"
                    name="slug"
                    value={formData.slug}
                    onChange={handleChange}
                    placeholder="e.g. quantum-leadership-2027"
                    required
                  />
                </div>

                <div className="cms-form-group cms-col-6">
                  <label>Display Order</label>
                  <input
                    type="number"
                    name="displayOrder"
                    value={formData.displayOrder}
                    onChange={handleChange}
                    min="1"
                  />
                </div>

                <div className="cms-form-group cms-col-6">
                  <label>Date *</label>
                  <input
                    type="text"
                    name="date"
                    value={formData.date}
                    onChange={handleChange}
                    placeholder="e.g. Oct 15-17, 2026"
                    required
                  />
                </div>

                <div className="cms-form-group cms-col-6">
                  <label>Location *</label>
                  <input
                    type="text"
                    name="location"
                    value={formData.location}
                    onChange={handleChange}
                    placeholder="e.g. Paris, France."
                    required
                  />
                </div>

                <div className="cms-form-group cms-col-12">
                  <label>Theme / Tagline</label>
                  <input
                    type="text"
                    name="theme"
                    value={formData.theme}
                    onChange={handleChange}
                    placeholder="e.g. Transforming Human Consciousness: Re-imagining Spirituality..."
                  />
                </div>

                <div className="cms-form-group cms-col-12">
                  <label>Conference Banner Image</label>
                  <div className="cms-image-upload-box">
                    {currentPreviewImg ? (
                      <div className="cms-img-preview">
                        <img src={currentPreviewImg} alt="Preview" />
                      </div>
                    ) : (
                      <div className="cms-img-placeholder">
                        <Image size={32} />
                        <span>No image uploaded</span>
                      </div>
                    )}
                    <div className="cms-upload-controls">
                      <label className="cms-btn cms-btn--outline cms-upload-label">
                        <Upload size={14} />
                        <span>{uploading ? 'Uploading...' : 'Upload Image File'}</span>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleFileUpload}
                          disabled={uploading}
                          style={{ display: 'none' }}
                        />
                      </label>
                      <span className="cms-or-text">or paste Image URL:</span>
                      <input
                        type="text"
                        name="imageUrl"
                        value={formData.imageUrl}
                        onChange={handleChange}
                        placeholder="https://... or /conferences_imgs/name.jpg"
                      />
                    </div>
                  </div>
                </div>

                <div className="cms-form-group cms-col-12">
                  <label>Description</label>
                  <textarea
                    name="description"
                    rows="6"
                    value={formData.description}
                    onChange={handleChange}
                    placeholder="Full conference summary, mission, and attendee highlights..."
                  />
                </div>
              </div>
            )}

            {/* ─── TAB 2: INSIGHT SESSIONS ─── */}
            {activeTab === 'sessions' && (
              <div className="cms-sublist-wrapper">
                <div className="cms-sublist-header">
                  <div>
                    <h4>Insight Sessions & Topic Agendas</h4>
                    <p>Curate keynote streams and specialized discussion areas</p>
                  </div>
                  <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', flexWrap: 'wrap' }}>
                    <button
                      type="button"
                      className={`cms-btn ${showBulkImport ? 'cms-btn--primary' : 'cms-btn--outline'}`}
                      onClick={() => setShowBulkImport((prev) => !prev)}
                    >
                      <FileText size={14} /> {showBulkImport ? 'Hide Bulk Paste' : 'Bulk Paste Sessions'}
                    </button>
                    <button type="button" className="cms-btn cms-btn--secondary" onClick={addSession}>
                      <Plus size={14} /> Add Session Stream
                    </button>
                  </div>
                </div>

                {/* ─── Bulk Sessions Importer ─── */}
                {showBulkImport && (
                  <div className="cms-bulk-import-card">
                    <div className="cms-bulk-import-top">
                      <div>
                        <h5>
                          <Sparkles size={16} color="currentColor" /> Quick Bulk Session Importer
                        </h5>
                        <p>
                          Add multiple sessions & topics all at once. Paste standard text or JSON below.
                        </p>
                      </div>
                      <div className="cms-bulk-quick-actions">
                        <button
                          type="button"
                          className="cms-btn-xs cms-btn-xs--ghost"
                          onClick={loadSampleText}
                        >
                          Load Standard Format Sample
                        </button>
                        <button
                          type="button"
                          className="cms-btn-xs cms-btn-xs--ghost"
                          onClick={loadSampleJson}
                        >
                          Load JSON Sample
                        </button>
                        {formData.insightSessions.length > 0 && (
                          <button
                            type="button"
                            className="cms-btn-xs cms-btn-xs--outline"
                            onClick={loadCurrentSessionsIntoBulk}
                            title="Export current sessions into the box for quick bulk editing"
                          >
                            <Copy size={12} /> Fill Current Sessions
                          </button>
                        )}
                      </div>
                    </div>

                    <div className="cms-bulk-format-hint">
                      <strong>Standard Format:</strong> <code>Title: [Stream Title]</code> followed by <code>Topics: Topic 1, Topic 2, Topic 3...</code> (or bullet points <code>- Topic</code>). Separate sessions with a blank line. You can also paste pure JSON!
                    </div>

                    <textarea
                      className="cms-bulk-textarea"
                      rows={8}
                      value={bulkInputText}
                      onChange={(e) => setBulkInputText(e.target.value)}
                      placeholder={`Title: Clinical Cardiology & Heart Failure\nTopics: Arrhythmia, Heart Transplant, Cardiac Imaging, Valvular Disease\n\nTitle: Pediatric & Congenital Heart Diseases\nTopics: Fetal Cardiology, Neonatal Care, Pediatric Surgery`}
                    />

                    <div className="cms-bulk-footer">
                      <div className="cms-bulk-stats">
                        {parsedBulkPreview.length > 0 ? (
                          <span className="cms-badge cms-badge--success">
                            <Check size={13} /> Detected: {parsedBulkPreview.length} session(s) &amp; {parsedBulkPreview.reduce((sum, s) => sum + s.topics.length, 0)} topic(s)
                          </span>
                        ) : (
                          <span className="cms-badge cms-badge--neutral">
                            Paste text or JSON above to preview detection
                          </span>
                        )}
                      </div>

                      <div className="cms-bulk-controls">
                        <label className="cms-bulk-radio-label">
                          <input
                            type="radio"
                            name="bulkMode"
                            value="append"
                            checked={bulkImportMode === 'append'}
                            onChange={() => setBulkImportMode('append')}
                          />
                          Append to current
                        </label>
                        <label className="cms-bulk-radio-label">
                          <input
                            type="radio"
                            name="bulkMode"
                            value="replace"
                            checked={bulkImportMode === 'replace'}
                            onChange={() => setBulkImportMode('replace')}
                          />
                          Replace all
                        </label>

                        <button
                          type="button"
                          className="cms-btn cms-btn--primary"
                          disabled={parsedBulkPreview.length === 0}
                          onClick={applyBulkImport}
                        >
                          <Sparkles size={14} /> Apply Bulk Import ({parsedBulkPreview.length})
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {formData.insightSessions.length === 0 ? (
                  <div className="cms-empty-sublist">
                    <p>No insight sessions added yet.</p>
                    <button type="button" className="cms-btn cms-btn--outline" onClick={addSession}>
                      <Plus size={14} /> Create First Session Stream
                    </button>
                  </div>
                ) : (
                  <div className="cms-accordion-list">
                    {formData.insightSessions.map((session, sIdx) => (
                      <div key={sIdx} className="cms-session-card">
                        <div className="cms-session-card-header">
                          <input
                            type="text"
                            value={session.title || ''}
                            onChange={(e) => updateSessionTitle(sIdx, e.target.value)}
                            placeholder="Session Stream Title"
                            className="cms-session-title-input"
                          />
                          <button
                            type="button"
                            className="cms-icon-btn-danger"
                            onClick={() => removeSession(sIdx)}
                            title="Remove Session"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>

                        <div className="cms-topics-section">
                          <div className="cms-topics-label-row">
                            <label>Session Topics / Keywords ({session.topics?.length || 0}):</label>
                            <button
                              type="button"
                              className="cms-text-btn"
                              onClick={() =>
                                setBulkTopicOpen((prev) => ({ ...prev, [sIdx]: !prev[sIdx] }))
                              }
                            >
                              {bulkTopicOpen[sIdx] ? 'Hide Bulk Paste' : '+ Bulk Paste Topics'}
                            </button>
                          </div>

                          {bulkTopicOpen[sIdx] && (
                            <div className="cms-single-bulk-box">
                              <textarea
                                rows={3}
                                className="cms-single-bulk-textarea"
                                value={bulkTopicInputs[sIdx] || ''}
                                onChange={(e) =>
                                  setBulkTopicInputs((prev) => ({
                                    ...prev,
                                    [sIdx]: e.target.value,
                                  }))
                                }
                                placeholder="Paste topics separated by commas, semicolons, or new lines... (e.g. Topic 1, Topic 2, Topic 3)"
                              />
                              <div className="cms-single-bulk-actions">
                                <button
                                  type="button"
                                  className="cms-btn cms-btn--secondary cms-btn--sm"
                                  onClick={() => handleBulkAddTopics(sIdx)}
                                >
                                  <Plus size={13} /> Add Pasted Topics
                                </button>
                                <button
                                  type="button"
                                  className="cms-btn cms-btn--ghost cms-btn--sm"
                                  onClick={() =>
                                    setBulkTopicOpen((prev) => ({ ...prev, [sIdx]: false }))
                                  }
                                >
                                  Cancel
                                </button>
                              </div>
                            </div>
                          )}

                          <div className="cms-chips-wrap">
                            {(session.topics || []).map((topic, tIdx) => (
                              <span key={tIdx} className="cms-chip">
                                {topic}
                                <button
                                  type="button"
                                  onClick={() => removeTopic(sIdx, tIdx)}
                                  className="cms-chip-del"
                                >
                                  ×
                                </button>
                              </span>
                            ))}
                          </div>

                          <div className="cms-add-chip-row">
                            <input
                              type="text"
                              value={newTopicInputs[sIdx] || ''}
                              onChange={(e) =>
                                setNewTopicInputs((prev) => ({ ...prev, [sIdx]: e.target.value }))
                              }
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                  e.preventDefault();
                                  addTopic(sIdx);
                                }
                              }}
                              placeholder="Type topic or paste comma-separated list & press Enter..."
                            />
                            <button
                              type="button"
                              className="cms-btn cms-btn--ghost"
                              onClick={() => addTopic(sIdx)}
                            >
                              <Plus size={14} /> Add Topic
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* ─── TAB 3: PACKAGES ─── */}
            {activeTab === 'packages' && (
              <div className="cms-sublist-wrapper">
                <div className="cms-sublist-header">
                  <div>
                    <h4>Conference Registration Packages</h4>
                    <p>Manage pass tiers, pricing, and attendee entitlements</p>
                  </div>
                  <button type="button" className="cms-btn cms-btn--secondary" onClick={addPackage}>
                    <Plus size={14} /> Add Registration Tier
                  </button>
                </div>

                {formData.packages.length === 0 ? (
                  <div className="cms-empty-sublist">
                    <p>No registration packages configured.</p>
                    <button type="button" className="cms-btn cms-btn--outline" onClick={addPackage}>
                      <Plus size={14} /> Add Default Package
                    </button>
                  </div>
                ) : (
                  <div className="cms-packages-grid">
                    {formData.packages.map((pkg, pIdx) => (
                      <div key={pIdx} className="cms-pkg-card">
                        <div className="cms-pkg-top-row">
                          <input
                            type="text"
                            value={pkg.packageName || ''}
                            onChange={(e) => updatePackageField(pIdx, 'packageName', e.target.value)}
                            placeholder="Package Name (e.g. Speaker Enrollment)"
                            className="cms-pkg-name-input"
                          />
                          <div className="cms-pkg-price-row">
                            <span>$</span>
                            <input
                              type="number"
                              value={pkg.price ?? ''}
                              onChange={(e) => updatePackageField(pIdx, 'price', Number(e.target.value))}
                              placeholder="Price"
                              className="cms-pkg-price-input"
                            />
                          </div>
                          <button
                            type="button"
                            className="cms-icon-btn-danger"
                            onClick={() => removePackage(pIdx)}
                            title="Remove Package"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>

                        <div className="cms-pkg-offers">
                          <label>Included Offers & Benefits:</label>
                          <ul className="cms-offers-list">
                            {(pkg.offers || []).map((offer, oIdx) => (
                              <li key={oIdx} className="cms-offer-item">
                                <span>• {offer}</span>
                                <button
                                  type="button"
                                  onClick={() => removeOffer(pIdx, oIdx)}
                                  className="cms-offer-del"
                                >
                                  ×
                                </button>
                              </li>
                            ))}
                          </ul>

                          <div className="cms-add-chip-row">
                            <input
                              type="text"
                              value={newOfferInputs[pIdx] || ''}
                              onChange={(e) =>
                                setNewOfferInputs((prev) => ({ ...prev, [pIdx]: e.target.value }))
                              }
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                  e.preventDefault();
                                  addOffer(pIdx);
                                }
                              }}
                              placeholder="Add entitlement (e.g. Lunch & kit provided)..."
                            />
                            <button
                              type="button"
                              className="cms-btn cms-btn--ghost"
                              onClick={() => addOffer(pIdx)}
                            >
                              <Plus size={14} /> Add
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="cms-modal-footer">
            <button type="button" className="cms-btn cms-btn--ghost" onClick={onClose} disabled={isSaving}>
              Cancel
            </button>
            <button type="submit" className="cms-btn cms-btn--primary" disabled={isSaving}>
              <Check size={16} />
              <span>{isSaving ? 'Saving Changes...' : 'Save Conference'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

