// src/EditTacNoteModal.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL;

function EditTacNoteModal({ caseId, note, onUpdate, onClose }) {
  const [content, setContent] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');

  const isEditMode = note && note.id;

  useEffect(() => {
    if (isEditMode) {
      setContent(note.content);
    }
  }, [note, isEditMode]);

  const handleSave = async () => {
    setIsSaving(true);
    setError('');
    try {
      if (isEditMode) {
        // Update existing note
        await axios.put(`${API_URL}/api/v1/cases/${caseId}/notes/${note.id}`, { content });
      } else {
        // Create new note
        await axios.post(`${API_URL}/api/v1/cases/${caseId}/notes`, { content });
      }
      onUpdate();
      onClose();
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to save the note.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="modal-backdrop">
      <div className="modal-content">
        <h2>{isEditMode ? 'Edit TAC Note' : 'Add TAC Note'}</h2>
        <div className="form-group">
          <label htmlFor="tac-note-content">Enter your observation or finding.</label>
          <textarea
            id="tac-note-content"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows="5"
            disabled={isSaving}
            autoFocus
          />
        </div>
        {error && <p className="modal-error">{error}</p>}
        <div className="modal-actions">
          <button type="button" onClick={onClose} disabled={isSaving} className="btn-secondary">
            Cancel
          </button>
          <button type="button" onClick={handleSave} disabled={isSaving || !content.trim()} className="btn-primary">
            {isSaving ? 'Saving...' : 'Save Note'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default EditTacNoteModal;