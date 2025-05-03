
import React, { createContext, useContext } from 'react';
import { toast } from 'sonner';
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
    console.error('useDocumentSelectorContext must be used within a DocumentSelectorProvider');
    throw new Error('useDocumentSelectorContext must be used within a DocumentSelectorProvider');
  }
  return context;
};

// Provider component with improved error handling
export const DocumentSelectorProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  try {
    // Get all state and handlers from our custom hook
    const contextValue = useDocumentSelectorState();

    return (
      <DocumentSelectorContext.Provider value={contextValue}>
        {children}
      </DocumentSelectorContext.Provider>
    );
  } catch (error) {
    console.error("Error in DocumentSelectorProvider:", error);
    
    // Dismiss any existing toasts to prevent duplicate errors
    toast.dismiss("document-selector-error");
    
    toast.error("Error initializing document selector", {
      description: error instanceof Error ? error.message : "Unknown error occurred",
      id: "document-selector-error",
      duration: 5000, // Auto dismiss after 5 seconds
    });
    
    // Provide default safe values on error that match the expected interface
    return (
      <DocumentSelectorContext.Provider 
        value={{ 
          ...defaultContextValue, 
          // Add required functions with safe implementations
          handleDialogChange: () => {},
          handleFileSelection: (doc) => doc,
          handleRefreshDocuments: async () => { return [] },
          handleConnectClick: async () => false,
          handleResetConnection: () => {},
          navigateToFolder: () => {},
          navigateToRoot: () => {},
          handleBack: () => {},
          setIsOpen: () => {},
        } as DocumentSelectorContextProps}
      >
        {children}
      </DocumentSelectorContext.Provider>
    );
  }
};
