// src/Chat.js

import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useCaseContext } from './context/CaseContext';
import TacSummary from './TacSummary';
import NewCaseModal from './NewCaseModal';

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

  // --- NEW STATE FOR THE ACTION PANEL ---
  const [userInput, setUserInput] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);

  // --- Reusable function to fetch case data ---
  const fetchCaseData = useCallback(async (id) => {
    if (!id) {
      setCaseData(null);
      return;
    }
    setIsSummaryLoading(true);
    setSummaryError(null);
    try {
      const response = await axios.get(`${API_URL}/case/${id}`);
      setCaseData(response.data);
    } catch (error) {
      console.error("Failed to fetch case data:", error);
      setSummaryError(`Could not load summary for case ${id}.`);
    } finally {
      setIsSummaryLoading(false);
    }
  }, []); // useCallback with empty dependency array as it has no external dependencies

  // --- This effect fetches the list of recent cases on initial load ---
  useEffect(() => {
    const fetchRecentCases = async () => {
      try {
        const response = await axios.get(`${API_URL}/cases`);
        setRecentCases(response.data);
      } catch (error) {
        console.error("Failed to fetch recent cases:", error);
      } finally {
        setIsCaseListLoading(false);
      }
    };
    fetchRecentCases();
  }, []); // Empty dependency array means this runs only once on mount

  // --- This effect fetches the data for the ACTIVE case ---
  useEffect(() => {
    fetchCaseData(activeCaseId);
  }, [activeCaseId, fetchCaseData]); // Re-runs whenever activeCaseId or the fetch function changes

  const handleCaseCreated = (newCaseId) => {
    setActiveCaseId(newCaseId);
    setRecentCases(prev => [newCaseId, ...prev.filter(id => id !== newCaseId)]);
    setShowNewCaseModal(false);
  };

  // --- NEW: Function to handle submitting updates from the Action Panel ---
  const handleUpdateCase = async (e) => {
    e.preventDefault();
    if (!userInput.trim() || !activeCaseId) return;

    setIsUpdating(true);
    try {
      // Call the backend agent to update the case
      await axios.post(`${API_URL}/cases/${activeCaseId}/update`, {
        user_input: userInput,
      });

      // Clear the input field on success
      setUserInput('');

      // Re-fetch the case data to refresh the TacSummary widget
      await fetchCaseData(activeCaseId);

    } catch (error) {
      console.error("Failed to update case:", error);
      setSummaryError(`Failed to apply update: ${error.response?.data?.detail || error.message}`);
    } finally {
      setIsUpdating(false);
    }
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
      {summaryError && !isSummaryLoading && <div className="tac-summary-widget error">{summaryError}</div>}
      {caseData && <TacSummary caseData={caseData} />}

      {/* --- UPDATED: The Action Panel is now a functional form --- */}
      <form className="chat-input" onSubmit={handleUpdateCase}>
        <input
          type="text"
          placeholder="Enter case notes or actions... (e.g., 'The affected device is MEMPHIS-1')"
          value={userInput}
          onChange={(e) => setUserInput(e.target.value)}
          disabled={isUpdating || isSummaryLoading}
        />
        <button type="submit" disabled={isUpdating || isSummaryLoading || !userInput.trim()}>
          {isUpdating ? 'Updating...' : 'Update Case'}
        </button>
      </form>
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