// src/App.js

import React from 'react';
import { BrowserRouter as Router, Routes, Route, NavLink } from 'react-router-dom';
import './App.css';
import Chat from './Chat';
import Upload from './Upload';
import AnalyzeCase from './AnalyzeCase'; // --- 1. IMPORT THE NEW COMPONENT ---

function App() {
  return (
    <Router>
      <div className="App">
        <div className="header">
          <div className="header-content">
            <h1>Network Engineer Agent</h1>
            <nav className="navigation">
              <NavLink to="/" className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}>
                Chat
              </NavLink>
              <NavLink to="/upload" className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}>
                Upload KB
              </NavLink>
              {/* --- 2. ADD THE NEW NAVIGATION LINK --- */}
              <NavLink to="/analyze" className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}>
                Analyze Case
              </NavLink>
            </nav>
          </div>
        </div>

        <div className="content-area">
          <Routes>
            <Route path="/" element={<Chat />} />
            <Route path="/upload" element={<Upload />} />
            {/* --- 3. ADD THE NEW ROUTE --- */}
            <Route path="/analyze" element={<AnalyzeCase />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App;