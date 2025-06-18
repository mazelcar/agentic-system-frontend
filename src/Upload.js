// src/Upload.js

import React, { useState } from 'react';

// --- CONFIGURATION ---
const API_URL = process.env.REACT_APP_API_URL;

function Upload() {
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploadStatus, setUploadStatus] = useState('idle'); // idle, uploading, success, error
  const [statusMessage, setStatusMessage] = useState('');

  const handleFileChange = (event) => {
    setSelectedFile(event.target.files[0]);
    setUploadStatus('idle'); // Reset status when a new file is chosen
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!selectedFile) {
      setStatusMessage('Please select a file first.');
      setUploadStatus('error');
      return;
    }

    setUploadStatus('uploading');
    setStatusMessage('Uploading document...');

    const formData = new FormData();
    formData.append('file', selectedFile);

    try {
      const response = await fetch(`${API_URL}/upload_kb`, {
        method: 'POST',
        body: formData, // No 'Content-Type' header, browser sets it for FormData
      });

      const data = await response.json();

      if (!response.ok) {
        // Use the error detail from FastAPI if available
        throw new Error(data.detail || `Server responded with ${response.status}`);
      }

      setUploadStatus('success');
      setStatusMessage(`Success! Document "${selectedFile.name}" ingested into the knowledge base.`);
      setSelectedFile(null); // Clear the file input
      event.target.reset(); // Reset the form
    } catch (error) {
      setUploadStatus('error');
      setStatusMessage(`Upload failed: ${error.message}`);
      console.error('Upload error:', error);
    }
  };

  return (
    <div className="upload-container">
      <h2>Upload Knowledge Base Document</h2>
      <p>Upload a PDF document to add it to the agent's knowledge base.</p>
      <form onSubmit={handleSubmit} className="upload-form">
        <input
          type="file"
          accept=".pdf" // Restrict to only PDF files
          onChange={handleFileChange}
          className="file-input"
          disabled={uploadStatus === 'uploading'}
        />
        <button type="submit" disabled={!selectedFile || uploadStatus === 'uploading'}>
          {uploadStatus === 'uploading' ? 'Uploading...' : 'Upload to KB'}
        </button>
      </form>
      {statusMessage && (
        <div className={`status-message ${uploadStatus}`}>
          {statusMessage}
        </div>
      )}
    </div>
  );
}

export default Upload;