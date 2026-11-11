import React, { useState, useEffect } from 'react';
import { X, Upload, Image, Check, Sparkles, Plus, Trash2 } from 'lucide-react';
import { uploadImageFile } from '../../lib/cmsService.js';

export default function MagazineModal({
  isOpen,
  magazine,
  speakers = [],
  onSave,
  onClose,
  isSaving,
}) {
  const [formData, setFormData] = useState({
    id: '',
    speakerId: '',
    name: '',
    title: '',
    tagline: '',
    bio: '',
    quote: '',
    coverImage: '',
    articleUrl: '',
    hasFlipbook: true,
    flipPages: [],
    issueNumber: '',
    issueDate: '',
    totalPages: 1,
    highlights: [],
    displayOrder: 1,
  });

  const [uploading, setUploading] = useState(false);
  const [activeTab, setActiveTab] = useState('profile'); // 'profile' | 'flipbook' | 'highlights'
  const [newHighlight, setNewHighlight] = useState('');
  const [newFlipPageUrl, setNewFlipPageUrl] = useState('');

  useEffect(() => {
    if (magazine) {
      setFormData({
        id: magazine.id || '',
        speakerId: magazine.speakerId || magazine.speaker_id || '',
        name: magazine.name || '',
        title: magazine.title || '',
        tagline: magazine.tagline || '',
        bio: magazine.bio || '',
        quote: magazine.quote || '',
        coverImage: magazine.coverImage || magazine.cover_image || '',
        articleUrl: magazine.articleUrl || magazine.article_url || '',
        hasFlipbook: magazine.hasFlipbook !== undefined ? Boolean(magazine.hasFlipbook) : Boolean(magazine.has_flipbook),
        flipPages: Array.isArray(magazine.flipPages || magazine.flip_pages)
          ? [...(magazine.flipPages || magazine.flip_pages)]
          : [],
        issueNumber: magazine.issueNumber || magazine.issue_number || '',
        issueDate: magazine.issueDate || magazine.issue_date || '',
        totalPages: magazine.totalPages || magazine.total_pages || 1,
        highlights: Array.isArray(magazine.highlights) ? [...magazine.highlights] : [],
        displayOrder: magazine.displayOrder ?? magazine.display_order ?? 1,
      });
    } else {
      setFormData({
        id: '',
        speakerId: '',
        name: '',
        title: '',
        tagline: '',
        bio: '',
        quote: '',
        coverImage: '',
        articleUrl: '',
        hasFlipbook: true,
        flipPages: [],
        issueNumber: 'Vol. 01 / Issue 01',
        issueDate: '2026 Edition',
        totalPages: 1,
        highlights: [],
        displayOrder: 1,
      });
    }
    setActiveTab('profile');
  }, [magazine, isOpen]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSpeakerSelect = (e) => {
    const spId = e.target.value;
    const selected = speakers.find((s) => String(s.id) === String(spId));
    if (selected) {
      setFormData((prev) => ({
        ...prev,
        speakerId: selected.id,
        name: prev.name || selected.name,
        title: prev.title || selected.description,
        id: prev.id || selected.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, ''),
      }));
    } else {
      setFormData((prev) => ({ ...prev, speakerId: '' }));
    }
  };

  const generateId = () => {
    if (!formData.name) return;
    const auto = formData.name
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
    setFormData((prev) => ({ ...prev, id: auto }));
  };

  const handleFileUpload = async (e, targetField = 'coverImage') => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const url = await uploadImageFile(file, 'magazines');
      if (targetField === 'coverImage') {
        setFormData((prev) => ({ ...prev, coverImage: url }));
      } else if (targetField === 'flipPage') {
        setFormData((prev) => ({
          ...prev,
          flipPages: [...prev.flipPages, url],
          totalPages: prev.flipPages.length + 1,
        }));
      }
    } catch (err) {
      alert('Failed to upload image: ' + err.message);
    } finally {
      setUploading(false);
    }
  };

  const addFlipPage = () => {
    if (!newFlipPageUrl.trim()) return;
    setFormData((prev) => ({
      ...prev,
      flipPages: [...prev.flipPages, newFlipPageUrl.trim()],
      totalPages: prev.flipPages.length + 1,
    }));
    setNewFlipPageUrl('');
  };

  const removeFlipPage = (idx) => {
    setFormData((prev) => {
      const updated = prev.flipPages.filter((_, i) => i !== idx);
      return {
        ...prev,
        flipPages: updated,
        totalPages: Math.max(1, updated.length),
      };
    });
  };

  const addHighlight = () => {
    if (!newHighlight.trim()) return;
    setFormData((prev) => ({
      ...prev,
      highlights: [...prev.highlights, newHighlight.trim()],
    }));
    setNewHighlight('');
  };

  const removeHighlight = (idx) => {
    setFormData((prev) => ({
      ...prev,
      highlights: prev.highlights.filter((_, i) => i !== idx),
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      alert('Please enter magazine / speaker name');
      return;
    }
    if (!formData.id.trim()) {
      alert('Please enter magazine ID/slug');
      return;
    }
    onSave(formData);
  };

  return (
    <div className="cms-modal-backdrop" onClick={onClose}>
      <div className="cms-modal cms-modal--large" onClick={(e) => e.stopPropagation()}>
        <div className="cms-modal-header">
          <div>
            <h3>{magazine ? 'Edit Magazine Publication' : 'Add New Magazine Publication'}</h3>
            <p className="cms-modal-sub">
              Publication route: <code>/magazine/{formData.id || 'slug'}</code>
            </p>
          </div>
          <button type="button" className="cms-close-btn" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        {/* Modal Navigation */}
        <div className="cms-modal-nav">
          <button
            type="button"
            className={`cms-tab-btn ${activeTab === 'profile' ? 'is-active' : ''}`}
            onClick={() => setActiveTab('profile')}
          >
            Editorial Profile
          </button>
          <button
            type="button"
            className={`cms-tab-btn ${activeTab === 'flipbook' ? 'is-active' : ''}`}
            onClick={() => setActiveTab('flipbook')}
          >
            Flipbook Pages ({formData.flipPages.length})
          </button>
          <button
            type="button"
            className={`cms-tab-btn ${activeTab === 'highlights' ? 'is-active' : ''}`}
            onClick={() => setActiveTab('highlights')}
          >
            Key Highlights ({formData.highlights.length})
          </button>
        </div>

        <form onSubmit={handleSubmit} className="cms-modal-form">
          <div className="cms-modal-body">
            {/* ─── TAB 1: EDITORIAL PROFILE ─── */}
            {activeTab === 'profile' && (
              <div className="cms-form-grid">
                <div className="cms-form-group cms-col-6">
                  <label>Linked Speaker (Optional)</label>
                  <select
                    value={formData.speakerId || ''}
                    onChange={handleSpeakerSelect}
                    className="cms-select"
                  >
                    <option value="">-- Choose existing speaker --</option>
                    {speakers.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name} ({s.id})
                      </option>
                    ))}
                  </select>
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
                  <label>Speaker / Feature Name *</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="e.g. Dr. Krista Fee"
                    required
                  />
                </div>

                <div className="cms-form-group cms-col-6">
                  <div className="cms-label-row">
                    <label>Magazine ID / Slug *</label>
                    <button
                      type="button"
                      className="cms-mini-btn"
                      onClick={generateId}
                      title="Auto-generate ID from name"
                    >
                      <Sparkles size={12} /> Auto-ID
                    </button>
                  </div>
                  <input
                    type="text"
                    name="id"
                    value={formData.id}
                    onChange={handleChange}
                    placeholder="e.g. krista-fee"
                    required
                  />
                </div>

                <div className="cms-form-group cms-col-6">
                  <label>Issue Number</label>
                  <input
                    type="text"
                    name="issueNumber"
                    value={formData.issueNumber}
                    onChange={handleChange}
                    placeholder="e.g. Vol. 04 / Issue 02"
                  />
                </div>

                <div className="cms-form-group cms-col-6">
                  <label>Issue Date</label>
                  <input
                    type="text"
                    name="issueDate"
                    value={formData.issueDate}
                    onChange={handleChange}
                    placeholder="e.g. Winter 2026"
                  />
                </div>

                <div className="cms-form-group cms-col-12">
                  <label>Professional Title & Organization</label>
                  <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleChange}
                    placeholder="e.g. Founder & CEO, RISEUP Phoenix Trauma & Crisis Institute"
                  />
                </div>

                <div className="cms-form-group cms-col-12">
                  <label>Magazine Tagline / Subtitle</label>
                  <input
                    type="text"
                    name="tagline"
                    value={formData.tagline}
                    onChange={handleChange}
                    placeholder="e.g. Trauma Specialist & Clinical Expert | Keynote Speaker & Author"
                  />
                </div>

                <div className="cms-form-group cms-col-12">
                  <label>Magazine Cover Image</label>
                  <div className="cms-image-upload-box">
                    {formData.coverImage ? (
                      <div className="cms-mag-cover-preview">
                        <img src={formData.coverImage} alt="Cover Preview" />
                      </div>
                    ) : (
                      <div className="cms-img-placeholder">
                        <Image size={32} />
                        <span>No cover image</span>
                      </div>
                    )}
                    <div className="cms-upload-controls">
                      <label className="cms-btn cms-btn--outline cms-upload-label">
                        <Upload size={14} />
                        <span>{uploading ? 'Uploading...' : 'Upload Cover Image'}</span>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => handleFileUpload(e, 'coverImage')}
                          disabled={uploading}
                          style={{ display: 'none' }}
                        />
                      </label>
                      <span className="cms-or-text">or paste image URL:</span>
                      <input
                        type="text"
                        name="coverImage"
                        value={formData.coverImage}
                        onChange={handleChange}
                        placeholder="https://... or /magazines/folder/cover.avif"
                      />
                    </div>
                  </div>
                </div>

                <div className="cms-form-group cms-col-12">
                  <label>Editorial Bio / Summary</label>
                  <textarea
                    name="bio"
                    rows="4"
                    value={formData.bio}
                    onChange={handleChange}
                    placeholder="Comprehensive editorial profile highlighting achievements and keynote focus..."
                  />
                </div>

                <div className="cms-form-group cms-col-12">
                  <label>Keynote Quote</label>
                  <input
                    type="text"
                    name="quote"
                    value={formData.quote}
                    onChange={handleChange}
                    placeholder="e.g. 'Turning profound crisis into lasting post-traumatic strength...'"
                  />
                </div>

                <div className="cms-form-group cms-col-12">
                  <label>External Article URL (Optional)</label>
                  <input
                    type="url"
                    name="articleUrl"
                    value={formData.articleUrl}
                    onChange={handleChange}
                    placeholder="https://medium.com/@... or external publication link"
                  />
                </div>
              </div>
            )}

            {/* ─── TAB 2: FLIPBOOK PAGES ─── */}
            {activeTab === 'flipbook' && (
              <div className="cms-sublist-wrapper">
                <div className="cms-sublist-header">
                  <div>
                    <h4>Interactive Flipbook Pages</h4>
                    <p>Configure page scans or editorial spreads for interactive reading</p>
                  </div>
                  <div className="cms-toggle-row">
                    <label className="cms-checkbox-label">
                      <input
                        type="checkbox"
                        name="hasFlipbook"
                        checked={formData.hasFlipbook}
                        onChange={handleChange}
                      />
                      <span>Enable Interactive Flipbook</span>
                    </label>
                  </div>
                </div>

                <div className="cms-page-upload-row">
                  <label className="cms-btn cms-btn--secondary cms-upload-label">
                    <Upload size={14} />
                    <span>Upload Next Page Scan</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleFileUpload(e, 'flipPage')}
                      disabled={uploading}
                      style={{ display: 'none' }}
                    />
                  </label>
                  <div className="cms-inline-add">
                    <input
                      type="text"
                      value={newFlipPageUrl}
                      onChange={(e) => setNewFlipPageUrl(e.target.value)}
                      placeholder="or enter image URL for page..."
                    />
                    <button type="button" className="cms-btn cms-btn--outline" onClick={addFlipPage}>
                      <Plus size={14} /> Add URL Page
                    </button>
                  </div>
                </div>

                {formData.flipPages.length === 0 ? (
                  <div className="cms-empty-sublist">
                    <p>No additional flipbook pages added. Cover image will be page 1.</p>
                  </div>
                ) : (
                  <div className="cms-flipbook-grid">
                    {formData.flipPages.map((pageUrl, idx) => (
                      <div key={idx} className="cms-flip-page-card">
                        <div className="cms-flip-page-num">Page {idx + 1}</div>
                        <div className="cms-flip-page-thumb">
                          <img src={pageUrl} alt={`Page ${idx + 1}`} />
                        </div>
                        <button
                          type="button"
                          className="cms-icon-btn-danger cms-flip-del"
                          onClick={() => removeFlipPage(idx)}
                          title="Remove Page"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* ─── TAB 3: KEY HIGHLIGHTS ─── */}
            {activeTab === 'highlights' && (
              <div className="cms-sublist-wrapper">
                <div className="cms-sublist-header">
                  <div>
                    <h4>Key Feature Highlights</h4>
                    <p>Bullet accomplishments, keynotes, or career milestones</p>
                  </div>
                </div>

                <div className="cms-add-chip-row">
                  <input
                    type="text"
                    value={newHighlight}
                    onChange={(e) => setNewHighlight(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        addHighlight();
                      }
                    }}
                    placeholder="Enter highlight bullet (e.g. Keynote speaker at Paris Summit)..."
                  />
                  <button type="button" className="cms-btn cms-btn--secondary" onClick={addHighlight}>
                    <Plus size={14} /> Add Highlight
                  </button>
                </div>

                <ul className="cms-highlights-list">
                  {formData.highlights.map((hl, idx) => (
                    <li key={idx} className="cms-hl-item">
                      <span>• {hl}</span>
                      <button
                        type="button"
                        className="cms-chip-del"
                        onClick={() => removeHighlight(idx)}
                      >
                        ×
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          <div className="cms-modal-footer">
            <button type="button" className="cms-btn cms-btn--ghost" onClick={onClose} disabled={isSaving}>
              Cancel
            </button>
            <button type="submit" className="cms-btn cms-btn--primary" disabled={isSaving}>
              <Check size={16} />
              <span>{isSaving ? 'Saving...' : 'Save Magazine'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

