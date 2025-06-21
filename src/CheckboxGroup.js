// src/CheckboxGroup.js
import React from 'react';
import './CheckboxGroup.css'; // We will create this CSS file next

function CheckboxGroup({ label, options, selectedValues, onChange }) {
  // This handler is called by the parent component's state logic
  const handleCheckboxChange = (event) => {
    onChange(event.target.value);
  };

  return (
    <div className="form-group">
      <label className="checkbox-group-label">{label}</label>
      <div className="checkbox-group-container">
        {(options || []).map((option) => (
          <div key={option.id} className="checkbox-item">
            <input
              type="checkbox"
              id={`checkbox-${option.id}`}
              value={option.id}
              checked={selectedValues.includes(option.id)}
              onChange={handleCheckboxChange}
            />
            <label htmlFor={`checkbox-${option.id}`}>{option.displayName}</label>
          </div>
        ))}
      </div>
    </div>
  );
}

export default CheckboxGroup;