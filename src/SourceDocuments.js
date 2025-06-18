// src/SourceDocuments.js

import React from 'react';

function SourceDocuments({ sources }) {
  // Don't render anything if sources are not provided or empty
  if (!sources || sources.length === 0) {
    return null;
  }

  return (
    <div className="sources-wrapper">
      <details className="sources-container">
        <summary className="sources-summary">Show Sources</summary>
        <div className="sources-list">
          {sources.map((source, index) => (
            <div key={index} className="source-item">
              <p className="source-content">{source.page_content}</p>
              <div className="source-metadata">
                <span>Source: {source.metadata.source}</span>
                <span>Page: {source.metadata.page}</span>
              </div>
            </div>
          ))}
        </div>
      </details>
    </div>
  );
}

export default SourceDocuments;