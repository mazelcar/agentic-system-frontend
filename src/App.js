// src/App.js
import React, { useState, useEffect, useRef } from 'react';
import './App.css';

// --- CONFIGURATION ---
// Replace this with your Lightsail instance's public IP address
const API_URL = process.env.REACT_APP_API_URL;

function App() {
  const [messages, setMessages] = useState([
    { text: "Hello! I'm the Network Troubleshooting Agent. How can I help you today?", sender: 'bot' }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Create a ref to the chat window for auto-scrolling
  const chatWindowRef = useRef(null);

  // This effect will run every time the 'messages' array changes
  useEffect(() => {
    // Scroll to the bottom of the chat window
    if (chatWindowRef.current) {
      chatWindowRef.current.scrollTop = chatWindowRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage = { text: input, sender: 'user' };

    // Add user's message and set loading state
    setMessages(prevMessages => [...prevMessages, userMessage]);
    setInput('');
    setIsLoading(true);

    // --- REAL API CALL LOGIC ---
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
        // Handle HTTP errors like 500, 404 etc.
        throw new Error(`API request failed with status ${response.status}`);
      }

      const data = await response.json();

      // Create the bot's response message from the API data
      const botMessage = { text: data.answer, sender: 'bot' };
      setMessages(prevMessages => [...prevMessages, botMessage]);

    } catch (error) {
      console.error("Failed to fetch from API:", error);
      // Show an error message to the user in the chat
      const errorMessage = { text: `Sorry, I encountered an error. Please try again. (${error.message})`, sender: 'bot' };
      setMessages(prevMessages => [...prevMessages, errorMessage]);
    } finally {
      // Always stop loading, whether the call succeeded or failed
      setIsLoading(false);
    }
  };

  const handleKeyPress = (event) => {
    if (event.key === 'Enter') {
      handleSend();
    }
  };

  return (
    <div className="App">
      <div className="header">
        <h1>Network Engineer Agent</h1>
      </div>
      <div className="chat-window" ref={chatWindowRef}>
        {messages.map((message, index) => (
          <div key={index} className={`message ${message.sender}`}>
            {message.text}
          </div>
        ))}
        {isLoading && (
          <div className="message bot">
            <div className="typing-indicator">
              <span></span>
              <span></span>
              <span></span>
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
    </div>
  );
}

export default App;