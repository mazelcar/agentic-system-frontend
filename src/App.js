// src/App.js

import React from 'react';
import { BrowserRouter as Router, Routes, Route, NavLink } from 'react-router-dom';
import './App.css';
import './AdminPage.css';
import './PlanDisplay.css'; // <-- ADD THIS LINE
import Workspace from './Workspace';
import AdminPage from './AdminPage';
import { CaseProvider, useCaseContext } from './context/CaseContext';

// A new component for the header to access context
function AppHeader() {
  const { activeCaseId } = useCaseContext();

  return (
    <div className="header">
      <div className="header-content">
        <NavLink to="/" className="nav-link-title">
          <h1>
            {activeCaseId ? `Case: ${activeCaseId}` : 'Network Engineer Agent'}
          </h1>
        </NavLink>
        <nav className="navigation">
          <NavLink to="/" className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}>
            Workspace
          </NavLink>
          <NavLink to="/admin" className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}>
            Admin
          </NavLink>
        </nav>
      </div>
    </div>
  );
}


function App() {
  return (
    <CaseProvider>
      <Router>
        <div className="App">
          <AppHeader />
          <div className="content-area">
            <Routes>
              <Route path="/" element={<Workspace />} />
              <Route path="/admin" element={<AdminPage />} />
            </Routes>
          </div>
        </div>
      </Router>
    </CaseProvider>
  );
}

export default App;