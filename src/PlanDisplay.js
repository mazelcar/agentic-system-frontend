// src/PlanDisplay.js
import React from 'react';
import './PlanDisplay.css';

// Helper to get the right icon for each status
const getStatusIcon = (status) => {
  switch (status) {
    case 'pending':
      return '🕒'; // Clock
    case 'executing':
      return '⚙️'; // Gear
    case 'completed':
      return '✅'; // Green check
    case 'failed':
      return '❌'; // Red X
    default:
      return '❔'; // Question mark
  }
};

function PlanDisplay({ plan }) {
  if (!plan || !plan.steps) {
    return null;
  }

  return (
    <div className="plan-display-container">
      <div className="plan-header">
        <span className="plan-status-icon">🤖</span>
        <div className="plan-title-group">
          <h4>Agent Plan</h4>
          <span>{`Status: ${plan.overall_status}`}</span>
        </div>
      </div>
      <ul className="plan-steps-list">
        {plan.steps.map((step) => (
          <li key={step.step_id} className={`plan-step ${step.status}`}>
            <span className="step-status-icon">{getStatusIcon(step.status)}</span>
            <div className="step-details">
              <span className="step-description">{step.description}</span>
              {step.status === 'failed' && (
                <span className="step-error">{step.error_message}</span>
              )}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default PlanDisplay;