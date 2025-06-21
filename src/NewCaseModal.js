// src/NewCaseModal.js
import React, { useState } from 'react';
import axios from 'axios';
import CheckboxGroup from './CheckboxGroup'; // <-- IMPORT THE NEW COMPONENT

const API_URL = process.env.REACT_APP_API_URL;

// The old MultiSelect component is now completely removed.

function NewCaseModal({ availablePlatforms, onCaseCreated, onClose }) {
  const [caseId, setCaseId] = useState('');
  const [selectedPlatforms, setSelectedPlatforms] = useState([]);
  const [error, setError] = useState('');
  const [isCreating, setIsCreating] = useState(false);

  const handleCaseIdChange = (e) => {
    const value = e.target.value;
    if (/^\d*$/.test(value) && value.length <= 10) {
      setCaseId(value);
    }
  };

  // NEW HANDLER: This contains the logic for toggling checkboxes.
  const handlePlatformChange = (platformId) => {
    setSelectedPlatforms((prevSelected) => {
      // If the ID is already in the array, remove it (uncheck)
      if (prevSelected.includes(platformId)) {
        return prevSelected.filter((id) => id !== platformId);
      }
      // Otherwise, add it to the array (check)
      else {
        return [...prevSelected, platformId];
      }
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!caseId.trim()) {
      setError('Case ID is required.');
      return;
    }
    if (selectedPlatforms.length === 0) {
      setError('At least one Affected Platform must be selected.');
      return;
    }
    setError('');
    setIsCreating(true);

    try {
      await axios.post(`${API_URL}/cases`, {
        case_id: caseId,
        problem_areas: selectedPlatforms,
      });
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
            <label htmlFor="new-case-id">Case ID (Numeric, max 10 digits)</label>
            <input
              id="new-case-id"
              type="text"
              value={caseId}
              onChange={handleCaseIdChange}
              placeholder="Enter a unique case number"
              required
              disabled={isCreating}
              pattern="[0-9]*"
              maxLength="10"
            />
          </div>

          {/* --- THIS IS THE REPLACEMENT --- */}
          <CheckboxGroup
            label="Affected Platform(s)"
            options={availablePlatforms || []}
            selectedValues={selectedPlatforms}
            onChange={handlePlatformChange}
          />
          {/* --- END REPLACEMENT --- */}

          {error && <p className="modal-error">{error}</p>}
          <div className="modal-actions">
            <button type="button" onClick={onClose} disabled={isCreating} className="btn-secondary">
              Cancel
            </button>
            <button type="submit" disabled={isCreating || selectedPlatforms.length === 0} className="btn-primary">
              {isCreating ? 'Creating...' : 'Create Case'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default NewCaseModal;