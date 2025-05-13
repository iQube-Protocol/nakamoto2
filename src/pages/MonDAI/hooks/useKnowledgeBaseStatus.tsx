
import React from 'react';
import { useKnowledgeBase } from '@/hooks/mcp/useKnowledgeBase';
import { toast } from 'sonner';

export const useKnowledgeBaseStatus = () => {
  const [documentUpdates, setDocumentUpdates] = React.useState<number>(0);
  const [showDeploymentHelp, setShowDeploymentHelp] = React.useState<boolean>(false);
  const [activeTab, setActiveTab] = React.useState<'chat' | 'knowledge' | 'documents'>('chat');

  const { 
    connectionStatus,
    errorMessage,
    reconnect,
    fetchKnowledgeItems,
    runDiagnostics
  } = useKnowledgeBase();

  // Handle document context updates
  const handleDocumentContextUpdated = () => {
    setDocumentUpdates(prev => prev + 1);
  };
  
  // Handle tab changes
  const handleTabChange = (tab: 'chat' | 'knowledge' | 'documents') => {
    setActiveTab(tab);
    
    // Refresh knowledge items when knowledge tab is selected
    if (tab === 'knowledge') {
      fetchKnowledgeItems();
    }
  };

  // Handle manual reconnection
  const handleManualReconnect = async () => {
    toast("Attempting to reconnect: Connecting to knowledge base...");
    
    try {
      await reconnect();
    } catch (error) {
      toast("Reconnection failed: Please try again later");
    }
  };

  // Show deployment help dialog
  const handleShowDeploymentHelp = () => {
    setShowDeploymentHelp(true);
  };

  return {
    documentUpdates,
    showDeploymentHelp,
    setShowDeploymentHelp,
    activeTab,
    connectionStatus,
    errorMessage,
    handleDocumentContextUpdated,
    handleTabChange,
    handleManualReconnect,
    handleShowDeploymentHelp,
    runDiagnostics
  };
};
