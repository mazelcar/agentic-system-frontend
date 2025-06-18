// src/Chat.js

import React, { useState, useEffect, useRef } from 'react';
import SourceDocuments from './SourceDocuments'; // Import the new component

// --- CONFIGURATION ---
const API_URL = process.env.REACT_APP_API_URL;

function Chat() {
  const [messages, setMessages] = useState([
    { text: "Hello! I'm the Network Troubleshooting Agent. How can I help you today?", sender: 'bot', sources: [] }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const chatWindowRef = useRef(null);

  useEffect(() => {
    if (chatWindowRef.current) {
      chatWindowRef.current.scrollTop = chatWindowRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage = { text: input, sender: 'user' };
    setMessages(prevMessages => [...prevMessages, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await fetch(`${API_URL}/ask`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          question: input
        }),
      });

      if (!response.ok) {
        throw new Error(`API request failed with status ${response.status}`);
      }

      const data = await response.json();
      // Create the bot's response message, now including the sources
      const botMessage = {
        text: data.answer,
        sender: 'bot',
        sources: data.source_documents || [] // Ensure sources is always an array
      };
      setMessages(prevMessages => [...prevMessages, botMessage]);

    } catch (error) {
      console.error("Failed to fetch from API:", error);
      const errorMessage = { text: `Sorry, I encountered an error. Please try again. (${error.message})`, sender: 'bot', sources: [] };
      setMessages(prevMessages => [...prevMessages, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (event) => {
    if (event.key === 'Enter') {
      handleSend();
    }
  };

  return (
    <>
      <div className="chat-window" ref={chatWindowRef}>
        {messages.map((message, index) => (
          <div key={index} className={`message-container ${message.sender}`}>
            <div className="message-bubble">
              {message.text}
            </div>
            {/* Conditionally render the SourceDocuments component */}
            <SourceDocuments sources={message.sources} />
          </div>
        ))}
        {isLoading && (
          <div className="message-container bot">
            <div className="message-bubble">
              <div className="typing-indicator">
                <span></span>
                <span></span>
                <span></span>
              </div>
            </div>
          </div>
        )}
      </div>
      <div className="chat-input">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Ask a question about your network..."
          disabled={isLoading}
        />
        <button onClick={handleSend} disabled={isLoading}>
          {isLoading ? 'Sending...' : 'Send'}
        </button>
      </div>
    </>
  );
}

export default Chat;