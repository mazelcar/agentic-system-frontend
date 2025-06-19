// src/Chat.js

import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { useCaseContext } from './context/CaseContext'; // Import our context hook
import TacSummary from './TacSummary'; // Import our new widget
import SourceDocuments from './SourceDocuments';

const API_URL = process.env.REACT_APP_API_URL;

function Chat() {
  // State for the chat messages
  const [messages, setMessages] = useState([
    { text: "Hello! I'm the Network Troubleshooting Agent. How can I help you today?", sender: 'bot', sources: [] }
  ]);
  const [input, setInput] = useState('');
  const [isChatLoading, setIsChatLoading] = useState(false);

  // --- NEW STATE FOR THE TAC SUMMARY ---
  const { activeCaseId } = useCaseContext(); // Get the active case ID from global context
  const [caseData, setCaseData] = useState(null);
  const [isSummaryLoading, setIsSummaryLoading] = useState(false);
  const [summaryError, setSummaryError] = useState(null);

  const chatWindowRef = useRef(null);

  // --- NEW EFFECT to fetch the TAC Summary when activeCaseId changes ---
  useEffect(() => {
    const fetchCaseData = async () => {
      if (!activeCaseId) {
        setCaseData(null); // Clear data if no case is active
        return;
      }

      setIsSummaryLoading(true);
      setSummaryError(null);
      setCaseData(null);

      try {
        const response = await axios.get(`${API_URL}/case/${activeCaseId}`);
        setCaseData(response.data);
      } catch (error) {
        console.error("Failed to fetch case data:", error);
        setSummaryError(`Could not load summary for case ${activeCaseId}. Please try analyzing it again.`);
      } finally {
        setIsSummaryLoading(false);
      }
    };

    fetchCaseData();
  }, [activeCaseId]); // This effect runs whenever the active case changes

  // Effect to scroll chat window
  useEffect(() => {
    if (chatWindowRef.current) {
      chatWindowRef.current.scrollTop = chatWindowRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isChatLoading) return;

    const userMessage = { text: input, sender: 'user' };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsChatLoading(true);

    try {
      const response = await axios.post(`${API_URL}/ask`, { question: input });
      const botMessage = {
        text: response.data.answer,
        sender: 'bot',
        sources: response.data.source_documents || []
      };
      setMessages(prev => [...prev, botMessage]);
    } catch (error) {
      const errorMessage = { text: `Sorry, an error occurred: ${error.message}`, sender: 'bot', sources: [] };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsChatLoading(false);
    }
  };

  const handleKeyPress = (event) => {
    if (event.key === 'Enter') handleSend();
  };

  return (
    <>
      {/* --- NEW: Conditional rendering for the TAC Summary --- */}
      {isSummaryLoading && <div className="tac-summary-widget loading">Loading Summary for Case {activeCaseId}...</div>}
      {summaryError && <div className="tac-summary-widget error">{summaryError}</div>}
      {caseData && <TacSummary caseData={caseData} />}

      <div className="chat-window" ref={chatWindowRef}>
        {/* The chat message mapping remains the same */}
        {messages.map((message, index) => (
          <div key={index} className={`message-container ${message.sender}`}>
            <div className="message-bubble">{message.text}</div>
            <SourceDocuments sources={message.sources} />
          </div>
        ))}
        {isChatLoading && (
          <div className="message-container bot">
            <div className="message-bubble"><div className="typing-indicator"><span /><span /><span /></div></div>
          </div>
        )}
      </div>
      <div className="chat-input">
        <input type="text" value={input} onChange={(e) => setInput(e.targe.value)} onKeyPress={handleKeyPress} placeholder="Ask a follow-up question..." disabled={isChatLoading} />
        <button onClick={handleSend} disabled={isChatLoading}>
          {isChatLoading ? '...' : 'Send'}
        </button>
      </div>
    </>
  );
}

export default Chat;