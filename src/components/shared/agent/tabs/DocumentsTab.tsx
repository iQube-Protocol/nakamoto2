
import React, { useState, useEffect } from 'react';
import DocumentContext from '../DocumentContext';

interface DocumentsTabProps {
  conversationId: string | null;
  onDocumentAdded: () => void;
  isActiveTab: boolean;
}

const DocumentsTab: React.FC<DocumentsTabProps> = ({
  conversationId,
  onDocumentAdded,
  isActiveTab
}) => {
  // Use state to track if the component has been loaded yet
  const [hasLoaded, setHasLoaded] = useState(false);
  
  // Set loaded state when tab becomes active
  useEffect(() => {
    if (isActiveTab && !hasLoaded) {
      // Use a small timeout to prevent UI freezing during tab transition
      const timer = setTimeout(() => {
        setHasLoaded(true);
      }, 100); // Increased timeout to give more breathing room
      
      return () => clearTimeout(timer);
    }
  }, [isActiveTab, hasLoaded]);
  
  // If tab is not active and hasn't been loaded yet, return placeholder
  if (!isActiveTab && !hasLoaded) {
    return <div className="p-4 text-center text-muted-foreground">Select this tab to load documents.</div>;
  }
  
  // If tab is not currently active but has been loaded before, render with hidden state
  if (!isActiveTab && hasLoaded) {
    return (
      <div className="hidden" aria-hidden="true">
        <DocumentContext
          conversationId={conversationId}
          onDocumentAdded={onDocumentAdded}
          isInTabView={true}
          isActiveTab={false}
        />
      </div>
    );
  }
  
  // Otherwise render the DocumentContext component with active state
  return (
    <DocumentContext
      conversationId={conversationId}
      onDocumentAdded={onDocumentAdded}
      isInTabView={true}
      isActiveTab={true}
    />
  );
};

export default DocumentsTab;
