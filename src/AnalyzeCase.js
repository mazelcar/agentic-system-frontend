// src/AnalyzeCase.js

import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom'; // To navigate programmatically
import { useCaseContext } from './context/CaseContext'; // Import our new context hook

const API_URL = process.env.REACT_APP_API_URL;

function AnalyzeCase() {
  const [caseId, setCaseId] = useState('');
  const [reportedIssue, setReportedIssue] = useState('');
  const [logFile, setLogFile] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');
  const [taskId, setTaskId] = useState(null);

  const intervalRef = useRef(null);
  const navigate = useNavigate(); // Hook for navigation
  const { setActiveCaseId } = useCaseContext(); // Get the setter from our context

  useEffect(() => {
    if (taskId) {
      pollStatus(taskId);
      intervalRef.current = setInterval(() => pollStatus(taskId), 3000);
    }
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [taskId]);

  const handleFileChange = (e) => {
    setLogFile(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!caseId || !reportedIssue || !logFile) {
      setStatusMessage('Please fill out all fields and select a file.');
      return;
    }
    setIsProcessing(true);
    setStatusMessage('Uploading file and starting analysis...');
    const formData = new FormData();
    formData.append('case_id', caseId);
    formData.append('reported_issue', reportedIssue);
    formData.append('log_file', logFile);

    try {
      const response = await axios.post(`${API_URL}/analyze_case`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setStatusMessage('Analysis in progress... Polling for status.');
      setTaskId(response.data.task_id);
    } catch (error) {
      setStatusMessage(`Error: ${error.response?.data?.detail || error.message}`);
      setIsProcessing(false);
    }
  };

  const pollStatus = async (currentTaskId) => {
    try {
      const response = await axios.get(`${API_URL}/case/status/${currentTaskId}`);
      const task = response.data;

      switch (task.status) {
        case 'SUCCESS':
          clearInterval(intervalRef.current);
          setStatusMessage(`Analysis for Case ID ${caseId} is complete! Navigating to summary...`);
          // --- THIS IS THE NEW LOGIC ---
          // 1. Set the active case ID in our global context
          setActiveCaseId(caseId);
          // 2. Navigate the user to the chat page to see the summary
          setTimeout(() => navigate('/'), 1500); // Navigate after a short delay
          break;
        case 'FAILURE':
          setStatusMessage(`Analysis failed. Error: ${JSON.stringify(task.result)}`);
          clearInterval(intervalRef.current);
          setIsProcessing(false);
          setTaskId(null);
          break;
        default:
          setStatusMessage(`Polling... Status: ${task.status}`);
      }
    } catch (error) {
      setStatusMessage('Error polling for status. Check the console.');
      clearInterval(intervalRef.current);
      setIsProcessing(false);
      setTaskId(null);
    }
  };

  return (
    <div className="analyze-case-container">
      <h2>Analyze New Case</h2>
      <p>Upload the pre-processed log file to have the AI generate a TAC Summary.</p>
      <form onSubmit={handleSubmit} className="case-form">
        {/* Form inputs are unchanged */}
        <div className="form-group">
          <label htmlFor="caseId">Case ID</label>
          <input type="text" id="caseId" value={caseId} onChange={(e) => setCaseId(e.target.value)} placeholder="e.g., 03457611" required disabled={isProcessing} />
        </div>
        <div className="form-group">
          <label htmlFor="reportedIssue">Customer Reported Issue</label>
          <textarea id="reportedIssue" value={reportedIssue} onChange={(e) => setReportedIssue(e.target.value)} placeholder="e.g., 'ONT is stuck in a discovery loop.'" rows="4" required disabled={isProcessing} />
        </div>
        <div className="form-group">
          <label htmlFor="logFile">Extracted Log File (.txt)</label>
          <input type="file" id="logFile" accept=".txt" onChange={handleFileChange} required disabled={isProcessing} />
        </div>
        <button type="submit" disabled={isProcessing}>
          {isProcessing ? 'Analyzing...' : 'Start Analysis'}
        </button>
      </form>
      {statusMessage && (
        <div className="status-box">
          <strong>Status:</strong> {statusMessage}
        </div>
      )}
    </div>
  );
}

export default AnalyzeCase;