
import React from 'react';
import { useKnowledgeBase } from '@/hooks/mcp/useKnowledgeBase';
import { toast } from 'sonner';
import { DiagnosticResult } from '@/integrations/kbai/types';

export const useKnowledgeBaseStatus = () => {
  const [documentUpdates, setDocumentUpdates] = React.useState<number>(0);
  const [showDeploymentHelp, setShowDeploymentHelp] = React.useState<boolean>(false);
  const [activeTab, setActiveTab] = React.useState<'chat' | 'knowledge' | 'documents'>('chat');
  const [diagnosticResults, setDiagnosticResults] = React.useState<DiagnosticResult | null>(null);

  const { 
    connectionStatus,
    errorMessage,
    reconnect,
    fetchKnowledgeItems,
    runDiagnostics: runKnowledgeBaseDiagnostics
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

  // Run diagnostics wrapper
  const handleRunDiagnostics = async (): Promise<DiagnosticResult> => {
    try {
      const results = await runKnowledgeBaseDiagnostics();
      setDiagnosticResults(results);
      
      if (results.edgeFunctionHealthy) {
        toast.success("Edge function is deployed and healthy!");
      } else {
        toast.error("Edge function not available or has issues");
      }
      
      return results;
    } catch (error) {
      console.error("Error running diagnostics:", error);
      const errorResult: DiagnosticResult = {
        error: error instanceof Error ? error.message : String(error),
        timestamp: new Date().toISOString()
      };
      setDiagnosticResults(errorResult);
      return errorResult;
    }
  };

  return {
    documentUpdates,
    showDeploymentHelp,
    setShowDeploymentHelp,
    activeTab,
    connectionStatus,
    errorMessage,
    diagnosticResults,
    handleDocumentContextUpdated,
    handleTabChange,
    handleManualReconnect,
    handleShowDeploymentHelp,
    runDiagnostics: handleRunDiagnostics
  };
};
