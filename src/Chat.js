// src/Chat.js

import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { useCaseContext } from './context/CaseContext';
import TacSummary from './TacSummary';
import NewCaseModal from './NewCaseModal'; // Import the new modal

const API_URL = process.env.REACT_APP_API_URL;

function Chat() {
  // Global state for the active case
  const { activeCaseId, setActiveCaseId } = useCaseContext();

  // State for this component
  const [caseData, setCaseData] = useState(null);
  const [isSummaryLoading, setIsSummaryLoading] = useState(false);
  const [summaryError, setSummaryError] = useState(null);

  const [recentCases, setRecentCases] = useState([]);
  const [isCaseListLoading, setIsCaseListLoading] = useState(true);

  const [showNewCaseModal, setShowNewCaseModal] = useState(false);

  // --- This effect fetches the list of recent cases on initial load ---
  useEffect(() => {
    const fetchRecentCases = async () => {
      try {
        const response = await axios.get(`${API_URL}/cases`);
        setRecentCases(response.data);
      } catch (error) {
        console.error("Failed to fetch recent cases:", error);
        // Handle error gracefully in UI if needed
      } finally {
        setIsCaseListLoading(false);
      }
    };
    fetchRecentCases();
  }, []); // Empty dependency array means this runs only once on mount

  // --- This effect fetches the data for the ACTIVE case ---
  useEffect(() => {
    const fetchCaseData = async () => {
      if (!activeCaseId) {
        setCaseData(null);
        return;
      }
      setIsSummaryLoading(true);
      setSummaryError(null);
      try {
        const response = await axios.get(`${API_URL}/case/${activeCaseId}`);
        setCaseData(response.data);
      } catch (error) {
        console.error("Failed to fetch case data:", error);
        setSummaryError(`Could not load summary for case ${activeCaseId}.`);
      } finally {
        setIsSummaryLoading(false);
      }
    };
    fetchCaseData();
  }, [activeCaseId]); // Re-runs whenever activeCaseId changes

  const handleCaseCreated = (newCaseId) => {
    setActiveCaseId(newCaseId);
    // Add new case to the top of the recent cases list
    setRecentCases(prev => [newCaseId, ...prev.filter(id => id !== newCaseId)]);
    setShowNewCaseModal(false);
  };

  // --- The "No Active Case" View ---
  const renderNoActiveCaseView = () => (
    <div className="no-case-view">
      <h2>Welcome to the Workspace</h2>
      <p>Please select a case to begin or create a new one.</p>
      <div className="case-selection-actions">
        <button onClick={() => setShowNewCaseModal(true)} className="btn-primary">
          New Case
        </button>
        <div className="recent-cases-container">
          <label htmlFor="recent-cases">Open Recent Case:</label>
          <select
            id="recent-cases"
            onChange={(e) => setActiveCaseId(e.target.value)}
            value={activeCaseId || ""}
            disabled={isCaseListLoading}
          >
            <option value="" disabled>{isCaseListLoading ? "Loading..." : "Select a case"}</option>
            {recentCases.map(caseId => (
              <option key={caseId} value={caseId}>{caseId}</option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );

  // --- The "Workspace" View (with an active case) ---
  const renderWorkspaceView = () => (
    <>
      {isSummaryLoading && <div className="tac-summary-widget loading">Loading Summary for Case {activeCaseId}...</div>}
      {summaryError && <div className="tac-summary-widget error">{summaryError}</div>}
      {caseData && <TacSummary caseData={caseData} />}

      {/* The Action/Notes Panel will go here in the next step */}
      <div className="chat-input">
        <input type="text" placeholder="Enter case notes or actions..." />
        <button>Update Case</button>
      </div>
    </>
  );

  return (
    <div className="workspace-container">
      {showNewCaseModal && (
        <NewCaseModal
          onCaseCreated={handleCaseCreated}
          onClose={() => setShowNewCaseModal(false)}
        />
      )}

      {activeCaseId ? renderWorkspaceView() : renderNoActiveCaseView()}
    </div>
  );
}

export default Chat;