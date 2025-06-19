// src/TacSummary.js
import React from 'react';

// A small helper component to keep our JSX clean
const SummarySection = ({ title, children }) => (
  <div className="summary-section">
    <h4>{title}</h4>
    {children}
  </div>
);

function TacSummary({ caseData }) {
  // Show a loading state if data hasn't arrived yet
  if (!caseData) {
    return <div className="tac-summary-widget loading">Loading case data...</div>;
  }

  const { network_info, reported_issue, tac_notes, recommendations, next_steps } = caseData;

  return (
    <div className="tac-summary-widget">
      <h3>TAC Summary for Case: {caseData.case_id}</h3>

      <SummarySection title="Network Info">
        <p><strong>Platform:</strong> {network_info?.access_platform || 'N/A'}</p>
        <p><strong>SW Version:</strong> {network_info?.software_version || 'N/A'}</p>
        <p><strong>Affected Device:</strong> {network_info?.affected_device || 'N/A'}</p>
        <p><strong>Affected Interface:</strong> {network_info?.affected_interface || 'N/A'}</p>
      </SummarySection>

      <SummarySection title="Reported Issue">
        <p>{reported_issue || 'N/A'}</p>
      </SummarySection>

      <SummarySection title="TAC Notes">
        <p><strong>ERPS Analysis:</strong> {tac_notes?.erps_analysis || 'N/A'}</p>
        <p><strong>Interface Analysis:</strong> {tac_notes?.interface_analysis || 'N/A'}</p>
        <p><strong>Alarm Analysis:</strong> {tac_notes?.alarm_analysis || 'N/A'}</p>
        <p><strong>Correlation:</strong> {tac_notes?.correlation || 'N/A'}</p>
      </SummarySection>

      <SummarySection title="Recommendations">
        <ul>
          {recommendations?.map((rec, index) => (
            <li key={index}>{rec}</li>
          )) || <li>N/A</li>}
        </ul>
      </SummarySection>

      <SummarySection title="Next Steps">
        <p>{next_steps || 'N/A'}</p>
      </SummarySection>
    </div>
  );
}

export default TacSummary;