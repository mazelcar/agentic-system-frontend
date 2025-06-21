// src/TacNote.js
import React from 'react';

function TacNote({ note, onEdit, onDelete }) {
  const formattedTimestamp = new Date(note.timestamp).toLocaleString();

  return (
    <div className={`tac-note ${note.author.toLowerCase()}`}>
      <div className="note-header">
        <span className={`author-tag ${note.author.toLowerCase()}`}>{note.author}</span>
        <span className="note-timestamp">{formattedTimestamp}</span>
      </div>
      <p className="note-content">{note.content}</p>
      {note.author === 'Human' && (
        <div className="note-actions">
          <button onClick={() => onEdit(note)} className="btn-note-action">Edit</button>
          <button onClick={() => onDelete(note.id)} className="btn-note-action delete">Delete</button>
        </div>
      )}
    </div>
  );
}

export default TacNote;