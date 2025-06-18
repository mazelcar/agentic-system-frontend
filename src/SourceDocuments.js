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
              {/* --- ROBUST RENDERING LOGIC --- */}
              {typeof source === 'object' && source !== null && source.page_content ? (
                // This is the ideal case: we have a full document object
                <>
                  <p className="source-content">{source.page_content}</p>
                  {source.metadata && (
                    <div className="source-metadata">
                      <span>Source: {source.metadata.source || 'N/A'}</span>
                      <span>Page: {source.metadata.page !== undefined ? source.metadata.page : 'N/A'}</span>
                    </div>
                  )}
                </>
              ) : (
                // This is the fallback case: the source is just a string
                <p className="source-content">{String(source)}</p>
              )}
            </div>
          ))}
        </div>
      </details>
    </div>
  );
}

export default SourceDocuments;