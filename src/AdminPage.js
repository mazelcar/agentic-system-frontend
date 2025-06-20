// src/AdminPage.js
import React from 'react';
import Upload from './Upload';
import './AdminPage.css';

function AdminPage() {
  return (
    <div className="admin-page-container">
      <div className="admin-header">
        <h2>Administrator Panel</h2>
        <p>Manage the agent's knowledge base and other system settings.</p>
      </div>
      <div className="admin-content">
        <Upload />
      </div>
    </div>
  );
}

export default AdminPage;