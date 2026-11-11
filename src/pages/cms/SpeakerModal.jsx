import React, { useState, useEffect } from 'react';
import { X, Upload, Image, Check } from 'lucide-react';
import { uploadImageFile } from '../../lib/cmsService.js';
import { getSpeakerSlug } from '../../lib/supabase.js';

export default function SpeakerModal({ isOpen, speaker, onSave, onClose, isSaving }) {
  const [formData, setFormData] = useState({
    id: '',
    name: '',
    description: '',
    image: '',
    imageUrl: '',
    displayOrder: 1,
  });

  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (speaker) {
      setFormData({
        id: speaker.id ?? '',
        name: speaker.name || '',
        description: speaker.description || '',
        image: speaker.image || '',
        imageUrl: speaker.imageUrl || speaker.image_url || '',
        displayOrder: speaker.displayOrder ?? speaker.display_order ?? 1,
      });
    } else {
      setFormData({
        id: Date.now(),
        name: '',
        description: '',
        image: '',
        imageUrl: '',
        displayOrder: 1,
      });
    }
  }, [speaker, isOpen]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const url = await uploadImageFile(file, 'speakers');
      setFormData((prev) => ({
        ...prev,
        image: file.name,
        imageUrl: url,
      }));
    } catch (err) {
      alert('Failed to upload speaker photo: ' + err.message);
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      alert('Please enter speaker name');
      return;
    }
    onSave(formData);
  };

  const slugPreview = getSpeakerSlug(formData.name || 'speaker');
  const previewImg = formData.imageUrl || (formData.image ? (formData.image.startsWith('/') ? formData.image : `/speakers_imgs/${formData.image}`) : '');

  return (
    <div className="cms-modal-backdrop" onClick={onClose}>
      <div className="cms-modal cms-modal--medium" onClick={(e) => e.stopPropagation()}>
        <div className="cms-modal-header">
          <div>
            <h3>{speaker ? 'Edit Speaker' : 'Add New Speaker'}</h3>
            <p className="cms-modal-sub">
              Profile URL: <code>/speakers/{slugPreview}</code>
            </p>
          </div>
          <button type="button" className="cms-close-btn" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="cms-modal-form">
          <div className="cms-modal-body">
            <div className="cms-form-grid">
              <div className="cms-form-group cms-col-8">
                <label>Speaker Full Name *</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="e.g. Dr. Safyra Bakshani"
                  required
                />
              </div>

              <div className="cms-form-group cms-col-4">
                <label>Display Order</label>
                <input
                  type="number"
                  name="displayOrder"
                  value={formData.displayOrder}
                  onChange={handleChange}
                  min="1"
                />
              </div>

              <div className="cms-form-group cms-col-12">
                <label>Speaker Photo / Portrait</label>
                <div className="cms-image-upload-box">
                  {previewImg ? (
                    <div className="cms-avatar-preview">
                      <img src={previewImg} alt="Speaker Preview" />
                    </div>
                  ) : (
                    <div className="cms-img-placeholder cms-img-placeholder--avatar">
                      <Image size={28} />
                      <span>No photo</span>
                    </div>
                  )}
                  <div className="cms-upload-controls">
                    <label className="cms-btn cms-btn--outline cms-upload-label">
                      <Upload size={14} />
                      <span>{uploading ? 'Uploading...' : 'Upload Speaker Photo'}</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleFileUpload}
                        disabled={uploading}
                        style={{ display: 'none' }}
                      />
                    </label>
                    <span className="cms-or-text">or photo URL / path:</span>
                    <input
                      type="text"
                      name="imageUrl"
                      value={formData.imageUrl}
                      onChange={handleChange}
                      placeholder="https://... or /speakers_imgs/name.jpg"
                    />
                  </div>
                </div>
              </div>

              <div className="cms-form-group cms-col-12">
                <label>Credentials & Title / Bio *</label>
                <textarea
                  name="description"
                  rows="4"
                  value={formData.description}
                  onChange={handleChange}
                  placeholder="e.g. International Clairvoyant Hypnotherapist, CHt. & Somatic Healer. Keynote speaker on human consciousness..."
                  required
                />
              </div>
            </div>
          </div>

          <div className="cms-modal-footer">
            <button type="button" className="cms-btn cms-btn--ghost" onClick={onClose} disabled={isSaving}>
              Cancel
            </button>
            <button type="submit" className="cms-btn cms-btn--primary" disabled={isSaving}>
              <Check size={16} />
              <span>{isSaving ? 'Saving...' : 'Save Speaker'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

