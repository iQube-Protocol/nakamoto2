
import React, { createContext, useContext } from 'react';
import { DocumentSelectorContextProps } from './types/documentSelectorTypes';
import { useDocumentSelectorState } from './hooks/useDocumentSelectorState';

// Create the context
const DocumentSelectorContext = createContext<DocumentSelectorContextProps | undefined>(undefined);

// Hook to access the context
export const useDocumentSelectorContext = () => {
  const context = useContext(DocumentSelectorContext);
  if (context === undefined) {
    throw new Error('useDocumentSelectorContext must be used within a DocumentSelectorProvider');
  }
  return context;
};

// Provider component
export const DocumentSelectorProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Get all state and handlers from our custom hook
  const contextValue = useDocumentSelectorState();

  return (
    <DocumentSelectorContext.Provider value={contextValue}>
      {children}
    </DocumentSelectorContext.Provider>
  );
};
