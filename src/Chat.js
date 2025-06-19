// src/Chat.js

import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { useCaseContext } from './CaseContext'; // Corrected import path
import TacSummary from './TacSummary';
import SourceDocuments from './SourceDocuments';

const API_URL = process.env.REACT_APP_API_URL;

function Chat() {
  const [messages, setMessages] = useState([
    { text: "Hello! I'm the Network Troubleshooting Agent. How can I help you today?", sender: 'bot', sources: [] }
  ]);
  const [input, setInput] = useState('');
  const [isChatLoading, setIsChatLoading] = useState(false);

  const { activeCaseId } = useCaseContext();
  const [caseData, setCaseData] = useState(null);
  const [isSummaryLoading, setIsSummaryLoading] = useState(false);
  const [summaryError, setSummaryError] = useState(null);

  const chatWindowRef = useRef(null);

  useEffect(() => {
    const fetchCaseData = async () => {
      if (!activeCaseId) {
        setCaseData(null);
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
  }, [activeCaseId]);

  useEffect(() => {
    if (chatWindowRef.current) {
      chatWindowRef.current.scrollTop = chatWindowRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isChatLoading) return;

    const userMessage = { text: input, sender: 'user' };
    setMessages(prev => [...prev, userMessage]);
    const questionToAsk = input; // Capture input before clearing
    setInput('');
    setIsChatLoading(true);

    try {
      const response = await axios.post(`${API_URL}/ask`, { question: questionToAsk });
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
      {isSummaryLoading && <div className="tac-summary-widget loading">Loading Summary for Case {activeCaseId}...</div>}
      {summaryError && <div className="tac-summary-widget error">{summaryError}</div>}
      {caseData && <TacSummary caseData={caseData} />}

      <div className="chat-window" ref={chatWindowRef}>
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
        {/* --- THIS IS THE FIX --- */}
        <input type="text" value={input} onChange={(e) => setInput(e.target.value)} onKeyPress={handleKeyPress} placeholder="Ask a follow-up question..." disabled={isChatLoading} />
        <button onClick={handleSend} disabled={isChatLoading}>
          {isChatLoading ? '...' : 'Send'}
        </button>
      </div>
    </>
  );
}

export default Chat;