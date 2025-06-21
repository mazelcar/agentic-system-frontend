// src/NewCaseModal.js
import React, { useState } from 'react';
import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL;

// A new component for the multi-select dropdown
const MultiSelect = ({ label, options, selectedValues, onChange }) => {
  const handleSelect = (e) => {
    const selectedOptions = Array.from(e.target.selectedOptions, option => option.value);
    onChange(selectedOptions);
  };

  return (
    <div className="form-group">
      <label htmlFor="affected-platforms">{label}</label>
      <select
        id="affected-platforms"
        multiple
        value={selectedValues}
        onChange={handleSelect}
        required
        size="5" // Show 5 options at a time
      >
        {options.map(option => (
          <option key={option.id} value={option.id}>
            {option.displayName}
          </option>
        ))}
      </select>
      <small>Hold Ctrl (or Cmd on Mac) to select multiple options.</small>
    </div>
  );
};


function NewCaseModal({ availablePlatforms, onCaseCreated, onClose }) {
  const [caseId, setCaseId] = useState('');
  // RENAMED for clarity
  const [selectedPlatforms, setSelectedPlatforms] = useState([]);
  const [error, setError] = useState('');
  const [isCreating, setIsCreating] = useState(false);

  const handleCaseIdChange = (e) => {
    const value = e.target.value;
    // Allow only numbers and limit to 10 digits
    if (/^\d*$/.test(value) && value.length <= 10) {
      setCaseId(value);
    }
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
      // The backend expects the key "problem_areas" due to the Pydantic alias.
      // This is for backend compatibility with the validation tool.
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

          <MultiSelect
            label="Affected Platform(s)"
            options={availablePlatforms || []}
            selectedValues={selectedPlatforms}
            onChange={setSelectedPlatforms}
          />

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