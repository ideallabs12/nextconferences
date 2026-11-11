import React from 'react';
import { AlertTriangle, Trash2, X } from 'lucide-react';

export default function DeleteConfirmModal({ isOpen, title, itemName, onConfirm, onCancel, isDeleting }) {
  if (!isOpen) return null;

  return (
    <div className="cms-modal-backdrop" onClick={onCancel}>
      <div className="cms-modal cms-modal--danger" onClick={(e) => e.stopPropagation()}>
        <div className="cms-modal-header">
          <div className="cms-danger-title">
            <div className="cms-danger-icon">
              <AlertTriangle size={20} />
            </div>
            <h3>{title || 'Confirm Delete'}</h3>
          </div>
          <button type="button" className="cms-close-btn" onClick={onCancel}>
            <X size={18} />
          </button>
        </div>

        <div className="cms-modal-body">
          <p className="cms-confirm-text">
            Are you sure you want to delete <strong>"{itemName}"</strong>?
          </p>
          <p className="cms-confirm-warning">
            This will remove it from both your local project files and the Supabase database.
          </p>
        </div>

        <div className="cms-modal-footer">
          <button type="button" className="cms-btn cms-btn--ghost" onClick={onCancel} disabled={isDeleting}>
            Cancel
          </button>
          <button
            type="button"
            className="cms-btn cms-btn--danger"
            onClick={onConfirm}
            disabled={isDeleting}
          >
            <Trash2 size={15} />
            <span>{isDeleting ? 'Deleting...' : 'Delete Permanently'}</span>
          </button>
        </div>
      </div>
    </div>
  );
}

