// src/NetworkInfoForm.js
import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL;

function NetworkInfoForm({ caseData, contextOptions, affectedPlatformConfig, onUpdate }) {
  const [formData, setFormData] = useState({});
  const [isUpdating, setIsUpdating] = useState(false);
  const [error, setError] = useState('');

  // When caseData changes, update the form's internal state
  useEffect(() => {
    if (caseData?.network_info) {
      setFormData(caseData.network_info);
    }
  }, [caseData]);

  // Calculate which fields to show based on selected platforms
  const requiredFields = useMemo(() => {
    if (!caseData?.problem_areas || !affectedPlatformConfig) {
      return new Set();
    }
    const fields = new Set();
    caseData.problem_areas.forEach(platformId => {
      const platform = affectedPlatformConfig.find(p => p.id === platformId);
      platform?.required_fields?.forEach(field => fields.add(field));
    });
    return fields;
  }, [caseData?.problem_areas, affectedPlatformConfig]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleUpdate = async () => {
    setIsUpdating(true);
    setError('');
    try {
      await axios.post(`${API_URL}/api/v1/cases/${caseData.case_id}/network-info`, {
        network_info: formData,
      });
      onUpdate(); // Notify parent to refetch case data
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to update network info.');
    } finally {
      setIsUpdating(false);
    }
  };

  // MODIFIED: Helper to get dropdown options for a given field
  const getOptionsForField = (fieldName) => {
    if (!contextOptions) return [];
    switch (fieldName) {
      case 'platform':
        return contextOptions.platforms?.map(p => p.name) || [];
      case 'software_version':
        const selectedPlatform = contextOptions.platforms?.find(p => p.name === formData.platform);
        return selectedPlatform?.software_versions || [];
      case 'olt_card_type':
        const platformForOlt = contextOptions.platforms?.find(p => p.name === formData.platform);
        return platformForOlt?.olt_card_types || [];
      case 'ont_model':
        return contextOptions.ont_models || [];
      // --- NEW CASES FOR OUR NEW FIELDS ---
      case 'type_of_card':
        return contextOptions.type_of_card || [];
      case 'axos_version':
        return contextOptions.axos_versions || [];
      case 'smx_version':
        return contextOptions.smx_versions || [];
      default:
        return [];
    }
  };

  const renderField = (fieldName) => {
    const options = getOptionsForField(fieldName);
    const label = fieldName.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());

    if (options.length > 0) {
      return (
        <div key={fieldName} className="form-row">
          <label htmlFor={fieldName}>{label}</label>
          <select
            id={fieldName}
            name={fieldName}
            value={formData[fieldName] || 'N/A'}
            onChange={handleInputChange}
          >
            <option value="N/A" disabled>Select...</option>
            {options.map(opt => <option key={opt} value={opt}>{opt}</option>)}
          </select>
        </div>
      );
    }

    // This handles text inputs like 'smx_linux_version'
    return (
      <div key={fieldName} className="form-row">
        <label htmlFor={fieldName}>{label}</label>
        <input
          type="text"
          id={fieldName}
          name={fieldName}
          value={formData[fieldName] || ''}
          onChange={handleInputChange}
          placeholder={label}
        />
      </div>
    );
  };

  if (requiredFields.size === 0) {
    return (
        <div className="network-info-form">
            <h4>Network Info</h4>
            <p>Select an affected platform to specify network context.</p>
        </div>
    );
  }

  return (
    <div className="network-info-form">
      <div className="form-header">
        <h4>Network Info</h4>
        <button onClick={handleUpdate} disabled={isUpdating}>
          {isUpdating ? 'Updating...' : 'Update Context'}
        </button>
      </div>
      <div className="form-grid">
        {Array.from(requiredFields).sort().map(fieldName => renderField(fieldName))}
      </div>
      {error && <p className="form-error">{error}</p>}
    </div>
  );
}

export default NetworkInfoForm;