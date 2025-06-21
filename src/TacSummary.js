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

function TacSummary({ caseData, contextOptions, problemCategories, onUpdate }) {
  if (!caseData) {
    return <div className="tac-summary-widget loading">Loading case data...</div>;
  }

  const { tac_notes, recommendations, next_steps, problem_areas } = caseData;

  return (
    <div className="tac-summary-widget">
      <div className="summary-header">
        <h3>TAC Summary for Case: {caseData.case_id}</h3>
        {/* We can add an "Edit Problem Areas" button here later */}
      </div>

      {/* The new, dynamic, editable form */}
      <NetworkInfoForm
        caseData={caseData}
        contextOptions={contextOptions}
        problemCategories={problemCategories}
        onUpdate={onUpdate}
      />

      <SummarySection title="Problem Area(s)">
        <p>{problem_areas?.join(', ') || 'N/A'}</p>
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