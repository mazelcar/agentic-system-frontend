// src/TacSummary.js
import React from 'react';

// A small helper component to keep our JSX clean
const SummarySection = ({ title, evidenceType, availableEvidence, onEvidenceClick, children }) => (
  <div className="summary-section">
    <div className="summary-section-header">
      <h4>{title}</h4>
      {availableEvidence?.includes(evidenceType) && (
        <button className="view-evidence-btn" onClick={() => onEvidenceClick(evidenceType)}>
          View Evidence
        </button>
      )}
    </div>
    {children}
  </div>
);

function TacSummary({ caseData, onEvidenceClick }) {
  if (!caseData) {
    return <div className="tac-summary-widget loading">Loading case data...</div>;
  }

  const { network_info, reported_issue, tac_notes, recommendations, next_steps, available_evidence } = caseData;

  // A helper to render the main sections, reducing repetition
  const renderMainSection = (title, evidenceType, content) => (
    <SummarySection
      title={title}
      evidenceType={evidenceType}
      availableEvidence={available_evidence}
      onEvidenceClick={onEvidenceClick}
    >
      <p>{content || 'N/A'}</p>
    </SummarySection>
  );

  return (
    <div className="tac-summary-widget">
      <h3>TAC Summary for Case: {caseData.case_id}</h3>

      <SummarySection
        title="Network Info"
        evidenceType="version"
        availableEvidence={available_evidence}
        onEvidenceClick={onEvidenceClick}
      >
        <p><strong>Platform:</strong> {network_info?.access_platform || 'N/A'}</p>
        <p><strong>SW Version:</strong> {network_info?.software_version || 'N/A'}</p>
        <p><strong>Affected Device:</strong> {network_info?.affected_device || 'N/A'}</p>
        <p><strong>Affected Interface:</strong> {network_info?.affected_interface || 'N/A'}</p>
      </SummarySection>

      {renderMainSection("Reported Issue", null, reported_issue)}

      <div className="summary-section">
        <h4>TAC Notes</h4>
        {renderMainSection("ERPS Analysis", "timeouts", tac_notes?.erps_analysis)}
        {renderMainSection("Interface Analysis", "interfaces", tac_notes?.interface_analysis)}
        {renderMainSection("Alarm Analysis", "alarms", tac_notes?.alarm_analysis)}
        {renderMainSection("Correlation", "errors", tac_notes?.correlation)}
      </div>

      <SummarySection title="Recommendations">
        <ul>
          {recommendations?.length > 0
            ? recommendations.map((rec, index) => <li key={index}>{rec}</li>)
            : <li>N/A</li>
          }
        </ul>
      </SummarySection>

      {renderMainSection("Next Steps", null, next_steps)}
    </div>
  );
}

export default TacSummary;