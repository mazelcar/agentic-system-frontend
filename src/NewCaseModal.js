// src/NewCaseModal.js
import React, { useState } from 'react';
import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL;

function NewCaseModal({ onCaseCreated, onClose }) {
  const [caseId, setCaseId] = useState('');
  const [initialIssue, setInitialIssue] = useState('');
  const [error, setError] = useState('');
  const [isCreating, setIsCreating] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!caseId.trim() || !initialIssue.trim()) {
      setError('Both Case ID and Initial Issue are required.');
      return;
    }
    setError('');
    setIsCreating(true);

    try {
      await axios.post(`${API_URL}/cases`, {
        case_id: caseId,
        initial_issue: initialIssue,
      });
      // On success, call the callback function passed from the parent
      onCaseCreated(caseId);
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to create case.');
      console.error(err);
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="modal-backdrop">
      <div className="modal-content">
        <h2>Create New Case</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="new-case-id">Case ID</label>
            <input
              id="new-case-id"
              type="text"
              value={caseId}
              onChange={(e) => setCaseId(e.target.value)}
              placeholder="Enter a unique case number"
              disabled={isCreating}
            />
          </div>
          <div className="form-group">
            <label htmlFor="initial-issue">Initial Issue Description</label>
            <textarea
              id="initial-issue"
              value={initialIssue}
              onChange={(e) => setInitialIssue(e.target.value)}
              rows="4"
              placeholder="Briefly describe the problem..."
              disabled={isCreating}
            />
          </div>
          {error && <p className="modal-error">{error}</p>}
          <div className="modal-actions">
            <button type="button" onClick={onClose} disabled={isCreating} className="btn-secondary">
              Cancel
            </button>
            <button type="submit" disabled={isCreating} className="btn-primary">
              {isCreating ? 'Creating...' : 'Create Case'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default NewCaseModal;