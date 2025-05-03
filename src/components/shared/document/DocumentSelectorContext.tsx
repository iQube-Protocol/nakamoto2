
import React, { createContext, useContext } from 'react';
import { DocumentSelectorContextProps } from './types/documentSelectorTypes';
import { useDocumentSelectorState } from './hooks/useDocumentSelectorState';

// Create the context with default safe values
const defaultContextValue: Partial<DocumentSelectorContextProps> = {
  documents: [],
  folderHistory: [],
  isOpen: false,
  documentsLoading: false,
  driveConnected: false,
  connectionStatus: 'disconnected',
  isProcessing: false,
  apiLoadingState: 'loading',
  apiCheckAttempts: 0,
  connecting: false,
  connectionError: false,
  refreshAttempts: 0,
  connectionInProgress: false,
  connectionAttempts: 0,
};

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
  try {
    const contextValue = useDocumentSelectorState();

    return (
      <DocumentSelectorContext.Provider value={contextValue}>
        {children}
      </DocumentSelectorContext.Provider>
    );
  } catch (error) {
    console.error("Error in DocumentSelectorProvider:", error);
    // Provide default safe values on error
    return (
      <DocumentSelectorContext.Provider value={defaultContextValue as DocumentSelectorContextProps}>
        {children}
      </DocumentSelectorContext.Provider>
    );
  }
};
