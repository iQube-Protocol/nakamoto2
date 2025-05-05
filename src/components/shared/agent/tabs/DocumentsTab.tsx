
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
