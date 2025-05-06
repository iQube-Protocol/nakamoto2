
import React from 'react';
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
  // Only render the full component when the tab is active
  if (!isActiveTab) {
    return <div className="p-4 text-center text-muted-foreground">Select this tab to load documents.</div>;
  }

  return (
    <DocumentContext
      conversationId={conversationId}
      onDocumentAdded={onDocumentAdded}
      isInTabView={true}
      isActiveTab={isActiveTab}
    />
  );
};

export default DocumentsTab;
