// src/TacSummary.js
import React, { useState } from 'react';
import axios from 'axios';
import NetworkInfoForm from './NetworkInfoForm';
import EditPlatformsModal from './EditPlatformsModal';
import EditReportedIssueModal from './EditReportedIssueModal';
import EditTacNoteModal from './EditTacNoteModal';
import TacNote from './TacNote';

const API_URL = process.env.REACT_APP_API_URL;

const SummarySection = ({ title, children, onAction, actionText }) => (
  <div className="summary-section">
    <div className="summary-section-header">
      <h4>{title}</h4>
      {onAction && <button onClick={onAction} className="btn-section-action">{actionText}</button>}
    </div>
    <div>{children}</div>
  </div>
);

function TacSummary({ caseData, contextOptions, affectedPlatformConfig, onUpdate }) {
  const [showEditPlatformsModal, setShowEditPlatformsModal] = useState(false);
  const [showEditIssueModal, setShowEditIssueModal] = useState(false);
  const [showEditNoteModal, setShowEditNoteModal] = useState(false);
  const [noteToEdit, setNoteToEdit] = useState(null);

  if (!caseData) {
    return <div className="tac-summary-widget loading">Loading case data...</div>;
  }

  const { recommendations, next_steps, reported_issue, tac_notes } = caseData;

  const platformDisplayNames = caseData.problem_areas?.map(id => {
    const platform = affectedPlatformConfig?.find(p => p.id === id);
    return platform ? platform.displayName : id;
  }).join(', ') || 'N/A';

  const handleAddNoteClick = () => {
    setNoteToEdit(null);
    setShowEditNoteModal(true);
  };

  const handleEditNoteClick = (note) => {
    setNoteToEdit(note);
    setShowEditNoteModal(true);
  };

  const handleDeleteNote = async (noteId) => {
    if (window.confirm('Are you sure you want to delete this note?')) {
      try {
        await axios.delete(`${API_URL}/api/v1/cases/${caseData.case_id}/notes/${noteId}`);
        onUpdate();
      } catch (err) {
        alert(`Failed to delete note: ${err.response?.data?.detail || err.message}`);
      }
    }
  };

  return (
    <>
      {showEditPlatformsModal && (
        <EditPlatformsModal
          caseId={caseData.case_id}
          availablePlatforms={affectedPlatformConfig}
          currentPlatforms={caseData.problem_areas}
          onUpdate={onUpdate}
          onClose={() => setShowEditPlatformsModal(false)}
        />
      )}
      {showEditIssueModal && (
        <EditReportedIssueModal
          caseId={caseData.case_id}
          currentContent={reported_issue}
          onUpdate={onUpdate}
          onClose={() => setShowEditIssueModal(false)}
        />
      )}
      {showEditNoteModal && (
        <EditTacNoteModal
          caseId={caseData.case_id}
          note={noteToEdit}
          onUpdate={onUpdate}
          onClose={() => setShowEditNoteModal(false)}
        />
      )}

      <div className="tac-summary-widget">
        <div className="summary-header">
          <h3>TAC Summary for Case: {caseData.case_id}</h3>
          <div className="platforms-header">
            <span>Affected Platforms: <strong>{platformDisplayNames}</strong></span>
            <button onClick={() => setShowEditPlatformsModal(true)} className="btn-edit-platforms">Edit</button>
          </div>
        </div>

        <NetworkInfoForm
          caseData={caseData}
          contextOptions={contextOptions}
          affectedPlatformConfig={affectedPlatformConfig}
          onUpdate={onUpdate}
        />

        <SummarySection title="Reported Issue" onAction={() => setShowEditIssueModal(true)} actionText="Edit">
          <p>{reported_issue || 'Please provide a description of the issue.'}</p>
        </SummarySection>

        <SummarySection title="TAC Notes" onAction={handleAddNoteClick} actionText="Add Note">
          {tac_notes && tac_notes.length > 0 ? (
            <div className="tac-notes-container">
              {tac_notes.map(note => (
                <TacNote key={note.id} note={note} onEdit={handleEditNoteClick} onDelete={handleDeleteNote} />
              ))}
            </div>
          ) : (
            <p>No notes added yet.</p>
          )}
        </SummarySection>

        <SummarySection title="Recommendations / Next Steps">
          <ul>
            {recommendations?.length > 0 ? recommendations.map((rec, index) => <li key={index}>{rec}</li>) : <li>N/A</li>}
          </ul>
          {next_steps && next_steps !== 'N/A' && <p>{next_steps}</p>}
        </SummarySection>
      </div>
    </>
  );
}

export default TacSummary;