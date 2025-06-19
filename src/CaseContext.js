// src/context/CaseContext.js
import React from 'react';
import { createContext, useState, useContext } from 'react';

// Create the context
const CaseContext = createContext();

// Create a custom hook for easy access to the context
export const useCaseContext = () => {
  return useContext(CaseContext);
};

// Create the Provider component
export const CaseProvider = ({ children }) => {
  const [activeCaseId, setActiveCaseId] = useState(null);

  const value = {
    activeCaseId,
    setActiveCaseId,
  };

  return <CaseContext.Provider value={value}>{children}</CaseContext.Provider>;
};