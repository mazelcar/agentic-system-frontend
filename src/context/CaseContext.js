// src/context/CaseContext.js
import React, { createContext, useState, useContext } from 'react';

// 1. Create the context object
const CaseContext = createContext();

// 2. Create a custom hook for easy consumption by other components
export const useCaseContext = () => {
  return useContext(CaseContext);
};

// 3. Create the Provider component that will wrap our app
export const CaseProvider = ({ children }) => {
  const [activeCaseId, setActiveCaseId] = useState(null);

  // The value that will be available to all consuming components
  const value = {
    activeCaseId,
    setActiveCaseId,
  };

  return <CaseContext.Provider value={value}>{children}</CaseContext.Provider>;
};