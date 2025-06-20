// src/Workspace.js

import React, { useState, useEffect, useCallback, useRef } from 'react';
import axios from 'axios';
import { useCaseContext } from './context/CaseContext';
import TacSummary from './TacSummary';
import NewCaseModal from './NewCaseModal';
import EvidenceModal from './EvidenceModal';
import PlanDisplay from './PlanDisplay';

const API_URL = process.env.REACT_APP_API_URL;
const POLLING_INTERVAL = 3000; // Poll every 3 seconds

function Workspace() {
  // Global state
  const { activeCaseId, setActiveCaseId } = useCaseContext();

  // Component State
  const [caseData, setCaseData] = useState(null);
  const [isSummaryLoading, setIsSummaryLoading] = useState(false);
  const [summaryError, setSummaryError] = useState(null);
  const [recentCases, setRecentCases] = useState([]);
  const [isCaseListLoading, setIsCaseListLoading] = useState(true);
  const [showNewCaseModal, setShowNewCaseModal] = useState(false);

  // State for interactive workspace
  const [userInput, setUserInput] = useState('');
  const [isProcessingAction, setIsProcessingAction] = useState(false);
  const [interactions, setInteractions] = useState([]);
  const [activePlanId, setActivePlanId] = useState(null);
  const [viewingEvidence, setViewingEvidence] = useState(null);
  const logContainerRef = useRef(null);
  const pollingIntervalRef = useRef(null);

  // --- Data Fetching Callbacks ---
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
  }, []);

  const fetchRecentCases = useCallback(async () => {
    try {
      const response = await axios.get(`${API_URL}/cases`);
      setRecentCases(response.data);
    } catch (error) {
      console.error("Failed to fetch recent cases:", error);
    } finally {
      setIsCaseListLoading(false);
    }
  }, []);


  // --- Effects ---
  useEffect(() => {
    fetchRecentCases();
  }, [fetchRecentCases]);

  useEffect(() => {
    if (activeCaseId) {
      fetchCaseData(activeCaseId);
      setInteractions([]);
      setActivePlanId(null);
    } else {
      setCaseData(null);
    }
  }, [activeCaseId, fetchCaseData]);

  useEffect(() => {
    if (logContainerRef.current) {
      logContainerRef.current.scrollTop = logContainerRef.current.scrollHeight;
    }
  }, [interactions]);

  const pollPlanStatus = useCallback(async () => {
    if (!activePlanId) return;
    try {
      const response = await axios.get(`${API_URL}/plan/status/${activePlanId}`);
      const updatedPlan = response.data;
      setInteractions(prev =>
        prev.map(interaction =>
          interaction.type === 'plan' && interaction.plan.plan_id === activePlanId
            ? { ...interaction, plan: updatedPlan }
            : interaction
        )
      );
      if (updatedPlan.overall_status === 'completed' || updatedPlan.overall_status === 'failed') {
        setActivePlanId(null);
        setIsProcessingAction(false);
        if (JSON.stringify(updatedPlan).includes("case_updater_v1")) {
            fetchCaseData(activeCaseId);
        }
      }
    } catch (error) {
      console.error("Polling failed:", error);
      setInteractions(prev => [...prev, { type: 'agent', text: `Error checking plan status: ${error.message}` }]);
      setActivePlanId(null);
      setIsProcessingAction(false);
    }
  }, [activePlanId, activeCaseId, fetchCaseData]);

  useEffect(() => {
    if (activePlanId) {
      pollingIntervalRef.current = setInterval(pollPlanStatus, POLLING_INTERVAL);
    } else {
      clearInterval(pollingIntervalRef.current);
    }
    return () => clearInterval(pollingIntervalRef.current);
  }, [activePlanId, pollPlanStatus]);

  const handleCaseCreated = (newCaseId) => {
    setActiveCaseId(newCaseId);
    setRecentCases(prev => [newCaseId, ...prev.filter(id => id !== newCaseId)]);
    setShowNewCaseModal(false);
  };

  const handleActionSubmit = async (e) => {
    e.preventDefault();
    if (!userInput.trim() || !activeCaseId) return;
    const currentInput = userInput;
    setInteractions(prev => [...prev, { type: 'user', text: currentInput }]);
    setUserInput('');
    setIsProcessingAction(true);
    try {
      const response = await axios.post(`${API_URL}/cases/${activeCaseId}/action`, {
        user_input: currentInput,
      });
      const initialPlan = response.data;
      setInteractions(prev => [...prev, { type: 'plan', plan: initialPlan }]);
      setActivePlanId(initialPlan.plan_id);
    } catch (error) {
      console.error("Failed to start plan:", error);
      const errorMsg = `Error: ${error.response?.data?.detail || error.message}`;
      setInteractions(prev => [...prev, { type: 'agent', text: errorMsg }]);
      setIsProcessingAction(false);
    }
  };

  const renderNoActiveCaseView = () => (
    <div className="no-case-view">
      <h2>Welcome to the Workspace</h2>
      <p>Please select a case to begin or create a new one.</p>
      <div className="case-selection-actions">
        <button onClick={() => setShowNewCaseModal(true)} className="btn-primary">New Case</button>
        <div className="recent-cases-container">
          <label htmlFor="recent-cases">Open Recent Case:</label>
          <select id="recent-cases" onChange={(e) => setActiveCaseId(e.target.value)} value={activeCaseId || ""} disabled={isCaseListLoading}>
            <option value="" disabled>{isCaseListLoading ? "Loading..." : "Select a case"}</option>
            {recentCases.map(caseId => (<option key={caseId} value={caseId}>{caseId}</option>))}
          </select>
        </div>
      </div>
    </div>
  );

  const renderWorkspaceView = () => (
    <>
      <div className="tac-summary-wrapper">
        {isSummaryLoading && <div className="tac-summary-widget loading">Loading Summary for Case {activeCaseId}...</div>}
        {summaryError && !isSummaryLoading && <div className="tac-summary-widget error">{summaryError}</div>}
        {caseData && <TacSummary caseData={caseData} onEvidenceClick={setViewingEvidence} />}
      </div>

      <div className="interaction-log-container" ref={logContainerRef}>
        {interactions.map((msg, index) => {
          // --- THIS IS THE REFINED RENDER LOGIC ---
          if (msg.type === 'plan') {
            return (
              <div key={index} className="interaction-message-wrapper agent">
                <PlanDisplay plan={msg.plan} />
              </div>
            );
          }
          return (
            <div key={index} className={`interaction-message-wrapper ${msg.type}`}>
              <div className={`interaction-message ${msg.type}`}>
                <strong>{msg.type === 'user' ? 'You' : 'Agent'}</strong>
                {msg.text}
              </div>
            </div>
          );
          // --- END OF REFINED RENDER LOGIC ---
        })}
      </div>

      <form className="chat-input" onSubmit={handleActionSubmit}>
        <input
          type="text"
          placeholder={isProcessingAction ? "Agent is executing a plan..." : "What should I do next for this case?"}
          value={userInput}
          onChange={(e) => setUserInput(e.target.value)}
          disabled={isProcessingAction || isSummaryLoading}
        />
        <button type="submit" disabled={isProcessingAction || isSummaryLoading || !userInput.trim()}>
          {isProcessingAction ? '...' : 'Submit'}
        </button>
      </form>
    </>
  );

  return (
    <div className="workspace-container">
      {showNewCaseModal && <NewCaseModal onCaseCreated={handleCaseCreated} onClose={() => setShowNewCaseModal(false)} />}
      {viewingEvidence && <EvidenceModal caseId={activeCaseId} evidenceType={viewingEvidence} onClose={() => setViewingEvidence(null)} />}
      {activeCaseId ? renderWorkspaceView() : renderNoActiveCaseView()}
    </div>
  );
}

export default Workspace;