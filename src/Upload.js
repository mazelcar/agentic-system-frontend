// src/Upload.js

import React, { useState } from 'react';
import axios from 'axios'; // Import axios

// --- CONFIGURATION ---
const API_URL = process.env.REACT_APP_API_URL;

function Upload() {
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploadStatus, setUploadStatus] = useState('idle'); // idle, uploading, success, error
  const [statusMessage, setStatusMessage] = useState('');
  const [uploadProgress, setUploadProgress] = useState(0); // New state for progress percentage

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      setSelectedFile(file);
      setUploadStatus('idle'); // Reset status when a new file is chosen
      setStatusMessage(`${file.name} (${(file.size / 1024 / 1024).toFixed(2)} MB)`);
    }
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
    setUploadProgress(0); // Reset progress to 0 on new upload

    const formData = new FormData();
    formData.append('file', selectedFile);

    try {
      // --- AXIOS UPLOAD LOGIC ---
      const response = await axios.post(`${API_URL}/upload_kb`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          setUploadProgress(percentCompleted);
        },
      });

      setUploadStatus('success');
      setStatusMessage(`Success! Document "${selectedFile.name}" ingested into the knowledge base.`);
      setSelectedFile(null); // Clear the file input
      event.target.reset(); // Reset the form
    } catch (error) {
      setUploadStatus('error');
      // Axios wraps the server response in error.response
      const serverMessage = error.response?.data?.detail || error.message;
      setStatusMessage(`Upload failed: ${serverMessage}`);
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
          accept=".pdf"
          onChange={handleFileChange}
          className="file-input"
          disabled={uploadStatus === 'uploading'}
        />
        <button type="submit" disabled={!selectedFile || uploadStatus === 'uploading'}>
          {uploadStatus === 'uploading' ? 'Uploading...' : 'Upload to KB'}
        </button>
      </form>

      {/* Display progress bar ONLY during upload */}
      {uploadStatus === 'uploading' && (
        <div className="progress-container">
          <div className="progress-bar-container">
            <div className="progress-bar" style={{ width: `${uploadProgress}%` }}>
              {uploadProgress}%
            </div>
          </div>
        </div>
      )}

      {/* Display status message for idle, success, or error states */}
      {statusMessage && uploadStatus !== 'uploading' && (
        <div className={`status-message ${uploadStatus}`}>
          {statusMessage}
        </div>
      )}
    </div>
  );
}

export default Upload;