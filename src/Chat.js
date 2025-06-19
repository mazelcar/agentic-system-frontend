// src/Chat.js

import React, { useState, useEffect, useCallback, useRef } from 'react';
import axios from 'axios';
import { useCaseContext } from './context/CaseContext';
import TacSummary from './TacSummary';
import NewCaseModal from './NewCaseModal';
import SourceDocuments from './SourceDocuments';

const API_URL = process.env.REACT_APP_API_URL;

function Chat() {
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
  const logContainerRef = useRef(null);

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

  useEffect(() => {
    const fetchRecentCases = async () => {
      try {
        const response = await axios.get(`${API_URL}/cases`);
        setRecentCases(response.data);
      } catch (error) { console.error("Failed to fetch recent cases:", error); }
      finally { setIsCaseListLoading(false); }
    };
    fetchRecentCases();
  }, []);

  useEffect(() => {
    if (activeCaseId) {
      fetchCaseData(activeCaseId);
      setInteractions([]);
    }
  }, [activeCaseId, fetchCaseData]);

  useEffect(() => {
    if (logContainerRef.current) {
      logContainerRef.current.scrollTop = logContainerRef.current.scrollHeight;
    }
  }, [interactions]);

  const handleCaseCreated = (newCaseId) => {
    setActiveCaseId(newCaseId);
    setRecentCases(prev => [newCaseId, ...prev.filter(id => id !== newCaseId)]);
    setShowNewCaseModal(false);
  };

  const handleActionSubmit = async (e) => {
    e.preventDefault();
    if (!userInput.trim() || !activeCaseId) return;

    const currentInput = userInput;
    setInteractions(prev => [...prev, { sender: 'user', text: currentInput }]);
    setUserInput('');
    setIsProcessingAction(true);

    try {
      const response = await axios.post(`${API_URL}/cases/${activeCaseId}/action`, {
        user_input: currentInput,
      });

      const { type, content, sources } = response.data;

      if (type === 'answer') {
        setInteractions(prev => [...prev, { sender: 'agent', text: content, sources: sources || [] }]);
      } else if (type === 'update') {
        await fetchCaseData(activeCaseId);
        setInteractions(prev => [...prev, { sender: 'agent', text: "OK, I've updated the case summary.", sources: [] }]);
      }
    } catch (error) {
      console.error("Failed to process action:", error);
      const errorMsg = `Error: ${error.response?.data?.detail || error.message}`;
      setInteractions(prev => [...prev, { sender: 'agent', text: errorMsg, sources: [] }]);
    } finally {
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
      {/* This wrapper allows the summary to scroll independently */}
      <div className="tac-summary-wrapper">
        {isSummaryLoading && <div className="tac-summary-widget loading">Loading Summary for Case {activeCaseId}...</div>}
        {summaryError && !isSummaryLoading && <div className="tac-summary-widget error">{summaryError}</div>}
        {caseData && <TacSummary caseData={caseData} />}
      </div>

      {/* The interaction log is now a sibling, not a child, of the summary */}
      <div className="interaction-log-container" ref={logContainerRef}>
        {interactions.map((msg, index) => (
          <div key={index} className={`interaction-message-wrapper ${msg.sender}`}>
            <div className={`interaction-message ${msg.sender}`}>
              <strong>{msg.sender === 'user' ? 'You' : 'Agent'}</strong>
              {msg.text}
              {msg.sources && msg.sources.length > 0 && <SourceDocuments sources={msg.sources} />}
            </div>
          </div>
        ))}
      </div>

      <form className="chat-input" onSubmit={handleActionSubmit}>
        <input
          type="text"
          placeholder={isProcessingAction ? "Agent is thinking..." : "Provide data or ask a question..."}
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
      {activeCaseId ? renderWorkspaceView() : renderNoActiveCaseView()}
    </div>
  );
}

export default Chat;