// src/EditPlatformsModal.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import CheckboxGroup from './CheckboxGroup';

const API_URL = process.env.REACT_APP_API_URL;

function EditPlatformsModal({ caseId, availablePlatforms, currentPlatforms, onUpdate, onClose }) {
  const [selectedPlatforms, setSelectedPlatforms] = useState([]);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');

  // When the modal opens, initialize its state with the case's current platforms
  useEffect(() => {
    setSelectedPlatforms(currentPlatforms || []);
  }, [currentPlatforms]);

  const handlePlatformChange = (platformId) => {
    setSelectedPlatforms((prevSelected) => {
      if (prevSelected.includes(platformId)) {
        return prevSelected.filter((id) => id !== platformId);
      } else {
        return [...prevSelected, platformId];
      }
    });
  };

  const handleSave = async () => {
    if (selectedPlatforms.length === 0) {
      setError('At least one Affected Platform must be selected.');
      return;
    }
    setError('');
    setIsSaving(true);

    try {
      await axios.put(`${API_URL}/api/v1/cases/${caseId}/platforms`, {
        affected_platforms: selectedPlatforms,
      });
      onUpdate(); // This will trigger a refetch in the parent
      onClose();   // Close the modal on success
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to update platforms.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="modal-backdrop">
      <div className="modal-content">
        <h2>Edit Affected Platforms</h2>
        <p>Select the platforms involved in this case. This will update the required fields in the Network Info form.</p>

        <CheckboxGroup
          label="Available Platforms"
          options={availablePlatforms || []}
          selectedValues={selectedPlatforms}
          onChange={handlePlatformChange}
        />

        {error && <p className="modal-error">{error}</p>}
        <div className="modal-actions">
          <button type="button" onClick={onClose} disabled={isSaving} className="btn-secondary">
            Cancel
          </button>
          <button type="button" onClick={handleSave} disabled={isSaving || selectedPlatforms.length === 0} className="btn-primary">
            {isSaving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default EditPlatformsModal;