// src/EditReportedIssueModal.js
import React, { useState } from 'react';
import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL;

function EditReportedIssueModal({ caseId, currentContent, onUpdate, onClose }) {
  const [content, setContent] = useState(currentContent || '');
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');

  const handleSave = async () => {
    setIsSaving(true);
    setError('');
    try {
      await axios.put(`${API_URL}/api/v1/cases/${caseId}/reported-issue`, { content });
      onUpdate();
      onClose();
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to save reported issue.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="modal-backdrop">
      <div className="modal-content">
        <h2>Edit Reported Issue</h2>
        <div className="form-group">
          <label htmlFor="reported-issue-content">Provide a clear, one-sentence summary of the problem.</label>
          <textarea
            id="reported-issue-content"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows="4"
            disabled={isSaving}
          />
        </div>
        {error && <p className="modal-error">{error}</p>}
        <div className="modal-actions">
          <button type="button" onClick={onClose} disabled={isSaving} className="btn-secondary">
            Cancel
          </button>
          <button type="button" onClick={handleSave} disabled={isSaving || !content.trim()} className="btn-primary">
            {isSaving ? 'Saving...' : 'Save'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default EditReportedIssueModal;