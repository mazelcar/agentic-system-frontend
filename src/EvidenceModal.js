// src/EvidenceModal.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL;

function EvidenceModal({ caseId, evidenceType, onClose }) {
  const [content, setContent] = useState('Loading evidence...');
  const [error, setError] = useState('');

  useEffect(() => {
    if (caseId && evidenceType) {
      const fetchEvidence = async () => {
        try {
          const response = await axios.get(`${API_URL}/case/${caseId}/evidence/${evidenceType}`);
          setContent(response.data || 'Evidence file is empty.');
        } catch (err) {
          setError(err.response?.data?.detail || 'Failed to load evidence.');
          setContent('');
        }
      };
      fetchEvidence();
    }
  }, [caseId, evidenceType]);

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-content evidence-modal" onClick={(e) => e.stopPropagation()}>
        <h2>Evidence: {evidenceType}</h2>
        <div className="evidence-content">
          {error && <p className="modal-error">{error}</p>}
          <pre>{content}</pre>
        </div>
        <div className="modal-actions">
          <button onClick={onClose} className="btn-secondary">Close</button>
        </div>
      </div>
    </div>
  );
}

export default EvidenceModal;