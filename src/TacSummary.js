// src/TacSummary.js
import React from 'react';
import NetworkInfoForm from './NetworkInfoForm'; // Import the new form

// A small helper component to keep our JSX clean
const SummarySection = ({ title, children }) => (
  <div className="summary-section">
    <h4>{title}</h4>
    {children}
  </div>
);

function TacSummary({ caseData, contextOptions, affectedPlatformConfig, onUpdate }) {
  if (!caseData) {
    return <div className="tac-summary-widget loading">Loading case data...</div>;
  }

  const { tac_notes, recommendations, next_steps } = caseData;

  // NEW: Map platform IDs from case data to their display names from the config
  const platformDisplayNames = caseData.problem_areas?.map(id => {
      const platform = affectedPlatformConfig?.find(p => p.id === id);
      return platform ? platform.displayName : id;
    }).join(', ') || 'N/A';

  return (
    <div className="tac-summary-widget">
      <div className="summary-header">
        <h3>TAC Summary for Case: {caseData.case_id}</h3>
      </div>

      <NetworkInfoForm
        caseData={caseData}
        contextOptions={contextOptions}
        affectedPlatformConfig={affectedPlatformConfig}
        onUpdate={onUpdate}
      />

      <SummarySection title="Affected Platform(s)">
        <p>{platformDisplayNames}</p>
      </SummarySection>

      <SummarySection title="TAC Notes">
        <p>{tac_notes?.correlation || 'No analysis notes yet.'}</p>
      </SummarySection>

      <SummarySection title="Recommendations">
        <ul>
          {recommendations?.length > 0
            ? recommendations.map((rec, index) => <li key={index}>{rec}</li>)
            : <li>N/A</li>
          }
        </ul>
      </SummarySection>

      <SummarySection title="Next Steps">
         <p>{next_steps || 'N/A'}</p>
      </SummarySection>
    </div>
  );
}

export default TacSummary;