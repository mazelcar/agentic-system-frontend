// src/TacSummary.js
import React, { useState } from 'react';
import NetworkInfoForm from './NetworkInfoForm';
import EditPlatformsModal from './EditPlatformsModal'; // Import the new modal

// A small helper component to keep our JSX clean
const SummarySection = ({ title, children }) => (
  <div className="summary-section">
    <h4>{title}</h4>
    <div>
      {children}
    </div>
  </div>
);

function TacSummary({ caseData, contextOptions, affectedPlatformConfig, onUpdate }) {
  const [showEditModal, setShowEditModal] = useState(false);

  if (!caseData) {
    return <div className="tac-summary-widget loading">Loading case data...</div>;
  }

  const { tac_notes, recommendations, next_steps, reported_issue } = caseData;

  // Map platform IDs from case data to their display names from the config
  const platformDisplayNames = caseData.problem_areas?.map(id => {
      const platform = affectedPlatformConfig?.find(p => p.id === id);
      return platform ? platform.displayName : id;
    }).join(', ') || 'N/A';

  return (
    <>
      {showEditModal && (
        <EditPlatformsModal
          caseId={caseData.case_id}
          availablePlatforms={affectedPlatformConfig}
          currentPlatforms={caseData.problem_areas}
          onUpdate={onUpdate}
          onClose={() => setShowEditModal(false)}
        />
      )}

      <div className="tac-summary-widget">
        <div className="summary-header">
          <h3>TAC Summary for Case: {caseData.case_id}</h3>
          <div className="platforms-header">
            <span>Affected Platforms: <strong>{platformDisplayNames}</strong></span>
            <button onClick={() => setShowEditModal(true)} className="btn-edit-platforms">
              Edit
            </button>
          </div>
        </div>

        <NetworkInfoForm
          caseData={caseData}
          contextOptions={contextOptions}
          affectedPlatformConfig={affectedPlatformConfig}
          onUpdate={onUpdate}
        />

        <SummarySection title="Reported Issue">
          <p>{reported_issue || 'Awaiting context to generate issue summary.'}</p>
        </SummarySection>

        <SummarySection title="TAC Notes">
          <p>{tac_notes?.correlation || 'No analysis notes yet.'}</p>
        </SummarySection>

        <SummarySection title="Recommendations / Next Steps">
          <ul>
            {recommendations?.length > 0
              ? recommendations.map((rec, index) => <li key={index}>{rec}</li>)
              : <li>N/A</li>
            }
          </ul>
          {next_steps && next_steps !== 'N/A' && <p>{next_steps}</p>}
        </SummarySection>
      </div>
    </>
  );
}

export default TacSummary;