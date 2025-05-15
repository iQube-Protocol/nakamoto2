
import React from 'react';
import DocumentSelectorDialog from './DocumentSelectorDialog';
import { useDocumentSelection } from '@/hooks/useDocumentSelection';

interface DocumentSelectorProps {
  onDocumentSelect: (document: any) => void;
  triggerButton?: React.ReactNode;
}

const DocumentSelector: React.FC<DocumentSelectorProps> = ({ 
  onDocumentSelect,
  triggerButton 
}) => {
  const {
    isOpen,
    setIsOpen,
    processingDoc,
    documents,
    documentsLoading,
    currentFolder,
    folderHistory,
    driveConnected,
    connectionLoading,
    clientId,
    setClientId,
    apiKey,
    setApiKey,
    handleConnect,
    handleResetConnection,
    handleFileSelection,
    handleBack,
    navigateToFolder,
    navigateToRoot,
    refreshCurrentFolder
  } = useDocumentSelection(onDocumentSelect);
  
  return (
    <DocumentSelectorDialog
      isOpen={isOpen}
      setIsOpen={setIsOpen}
      triggerButton={triggerButton}
      processingDoc={processingDoc}
      documents={documents}
      documentsLoading={documentsLoading}
      currentFolder={currentFolder}
      folderHistory={folderHistory}
      driveConnected={driveConnected}
      connectionLoading={connectionLoading}
      clientId={clientId}
      setClientId={setClientId}
      apiKey={apiKey}
      setApiKey={setApiKey}
      handleConnect={handleConnect}
      handleResetConnection={handleResetConnection}
      handleFileSelection={handleFileSelection}
      handleBack={handleBack}
      navigateToFolder={navigateToFolder}
      navigateToRoot={navigateToRoot}
      refreshCurrentFolder={refreshCurrentFolder}
    />
  );
};

export default DocumentSelector;
