// src/NewCaseModal.js
import React, { useState, useEffect } from 'react';
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
      <label htmlFor="problem-areas">{label}</label>
      <select
        id="problem-areas"
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


function NewCaseModal({ onCaseCreated, onClose }) {
  const [caseId, setCaseId] = useState('');
  const [problemAreas, setProblemAreas] = useState([]);
  const [availableCategories, setAvailableCategories] = useState([]);
  const [error, setError] = useState('');
  const [isCreating, setIsCreating] = useState(false);

  // Fetch problem categories when the modal mounts
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        // This assumes your problem categories are available via the context-options endpoint
        // or you could create a dedicated endpoint for it.
        const response = await axios.get(`${API_URL}/api/v1/context-options`);
        // Let's assume the categories are in a separate key or we derive them
        // For now, let's mock it based on a potential new endpoint or structure
        const problemCatsResponse = await axios.get(`${API_URL}/api/v1/problem-categories`); // Hypothetical endpoint
        setAvailableCategories(problemCatsResponse.data.categories);
      } catch (err) {
        // Let's fetch from the context-options as a fallback for now
         try {
            const response = await axios.get(`${API_URL}/api/v1/context-options`);
            // This is a placeholder. We need a dedicated categories endpoint.
            // For now, we'll create a dummy one.
            const categories = [
                { id: 'ont_issue', displayName: 'ONT/GPON Issue' },
                { id: 'interface_issue', displayName: 'Interface/Port Issue' },
                { id: 'system_issue', displayName: 'Platform/System Issue' },
                { id: 'routing_issue', displayName: 'BGP/Routing Issue' },
            ];
            setAvailableCategories(categories);
         } catch (finalErr) {
            setError('Could not load problem categories from server.');
         }
      }
    };
    // Let's create a dedicated endpoint for problem categories for cleaner design
    const fetchProblemCategories = async () => {
        try {
            const response = await axios.get(`${API_URL}/api/v1/problem-categories`); // We will need to create this endpoint
            setAvailableCategories(response.data.categories);
        } catch (err) {
            console.error("Failed to fetch problem categories", err);
            setError("Failed to load configuration from server.");
        }
    };
    // For now, let's just use a hardcoded list until the endpoint is made
    const categories = [
        { id: 'ont_issue', displayName: 'ONT/GPON Issue' },
        { id: 'interface_issue', displayName: 'Interface/Port Issue' },
        { id: 'system_issue', displayName: 'Platform/System Issue' },
        { id: 'routing_issue', displayName: 'BGP/Routing Issue' },
    ];
    setAvailableCategories(categories);

  }, []);


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
    if (problemAreas.length === 0) {
      setError('At least one Problem Area must be selected.');
      return;
    }
    setError('');
    setIsCreating(true);

    try {
      await axios.post(`${API_URL}/cases`, {
        case_id: caseId,
        problem_areas: problemAreas,
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
            label="Problem Area(s)"
            options={availableCategories}
            selectedValues={problemAreas}
            onChange={setProblemAreas}
          />

          {error && <p className="modal-error">{error}</p>}
          <div className="modal-actions">
            <button type="button" onClick={onClose} disabled={isCreating} className="btn-secondary">
              Cancel
            </button>
            <button type="submit" disabled={isCreating || problemAreas.length === 0} className="btn-primary">
              {isCreating ? 'Creating...' : 'Create Case'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default NewCaseModal;