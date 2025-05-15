
import React, { useEffect, useState, useCallback, memo } from 'react';
import { AgentInterface } from '@/components/shared/agent';
import { useKnowledgeBase } from '@/hooks/mcp/useKnowledgeBase';
import { useMondAI } from '@/hooks/use-mondai';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { AlertCircle, RefreshCw } from 'lucide-react';

// Memoized component to prevent unnecessary rerenders
const MonDAI = memo(() => {
  // Use our custom hook
  const {
    conversationId,
    isLoading,
    documentUpdates,
    handleAIMessage,
    handleDocumentContextUpdated
  } = useMondAI();

  // Initialize knowledge base with reduced frequency of updates
  const {
    items: knowledgeItems,
    fetchKnowledgeItems,
    connectionStatus,
    isLoading: kbLoading
  } = useKnowledgeBase({ forceOfflineFirst: true });
  
  // System status tracking
  const [systemStatus, setSystemStatus] = useState<'initializing' | 'ready' | 'error'>('initializing');
  const [initAttempted, setInitAttempted] = useState(false);

  // Set fullscreen mode effect for mobile
  useEffect(() => {
    // Add a class to the root element for fullscreen styling
    document.documentElement.classList.add('fullscreen-mode');
    
    // Start initializing system
    setSystemStatus('initializing');
    
    // After a short delay, consider the system ready regardless of backend status
    const timer = setTimeout(() => {
      if (systemStatus === 'initializing') {
        setSystemStatus('ready');
      }
    }, 2000); // Reduced from 3000ms to 2000ms

    // Remove the class when component unmounts
    return () => {
      document.documentElement.classList.remove('fullscreen-mode');
      clearTimeout(timer);
    };
  }, []);

  // Check KBAI connection on initial load once only
  useEffect(() => {
    if (initAttempted) return;
    
    setInitAttempted(true);
    console.log("MonDAI: Initializing connection to knowledge base");
    
    // Lazy load knowledge base after a delay
    const timer = setTimeout(() => {
      fetchKnowledgeItems({ forceOfflineFirst: true })
        .then(() => {
          setSystemStatus('ready');
        })
        .catch(() => {
          setSystemStatus('ready'); // Still set ready, just with offline mode
        });
    }, 3000); // Delay initial load to improve page responsiveness
    
    return () => clearTimeout(timer);
  }, [fetchKnowledgeItems, initAttempted]);

  const getStatusDescription = () => {
    if (kbLoading || systemStatus === 'initializing') return "Connecting to knowledge base...";
    switch (connectionStatus) {
      case 'connected':
        return "Community agent with KBAI integration";
      case 'connecting':
        return "Establishing knowledge base connection...";
      case 'error':
      case 'disconnected':
      default:
        return "Community agent with offline knowledge base";
    }
  };
  
  // Force refresh system with debounce
  const [isRefreshing, setIsRefreshing] = useState(false);
  const handleForceRefresh = useCallback(() => {
    if (isRefreshing) return;
    
    setIsRefreshing(true);
    toast.info('Refreshing system...');
    
    setSystemStatus('initializing');
    
    // Attempt to refresh knowledge base after a short delay
    setTimeout(() => {
      fetchKnowledgeItems({ query: 'force-refresh' })
        .then(() => {
          setSystemStatus('ready');
          toast.success('System refreshed');
        })
        .catch(() => {
          setSystemStatus('ready'); // Still set ready, just with offline mode
          toast.error('Failed to refresh online system, using offline mode');
        })
        .finally(() => {
          setIsRefreshing(false);
        });
    }, 500);
  }, [fetchKnowledgeItems, isRefreshing]);
  
  // Create wrapper functions to match the expected types
  const handleMessageSubmit = useCallback((message: string) => {
    return handleAIMessage(message);
  }, [handleAIMessage]);
  
  const handleDocumentAdded = useCallback(() => {
    // This is a wrapper function that will be called when a document is added
    console.log('Document added event triggered');
    toast.info('Document added to context');
  }, []);
  
  return <div className="container py-6 max-w-7xl mx-auto h-full agent-interface">
      <div className="grid gap-6 h-full">
        <div className="flex flex-col h-full">
          <div className="flex flex-row justify-between items-center mb-2">
            <div className="flex-1">
              {systemStatus === 'error' && (
                <div className="flex items-center text-amber-500 text-sm">
                  <AlertCircle className="h-4 w-4 mr-1" />
                  <span>System experiencing issues</span>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={handleForceRefresh}
                    disabled={isRefreshing}
                    className="ml-2"
                  >
                    <RefreshCw className={`h-3.5 w-3.5 mr-1 ${isRefreshing ? 'animate-spin' : ''}`} />
                    {isRefreshing ? 'Refreshing...' : 'Refresh'}
                  </Button>
                </div>
              )}
            </div>
          </div>
          
          <AgentInterface 
            title="MonDAI" 
            description={getStatusDescription()} 
            agentType="learn" // Using learn type for compatibility
            onMessageSubmit={handleMessageSubmit}
            onDocumentAdded={handleDocumentAdded}
            documentContextUpdated={documentUpdates} 
            conversationId={conversationId} 
            initialMessages={[{
              id: "1",
              sender: "agent",
              message: connectionStatus === 'connected' 
                ? "Hello! I'm your MonDAI assistant with direct KBAI integration. I can help you learn about Web3, cryptocurrency, blockchain concepts, and more using my integrated knowledge base. What would you like to know about today?" 
                : "Hello! I'm your MonDAI assistant. I'm currently using an offline knowledge base for Web3 concepts. You can still ask me about blockchain, cryptocurrency, and other topics. What would you like to explore today?",
              timestamp: new Date().toISOString(),
              metadata: {
                version: "1.0",
                modelUsed: "gpt-4o",
                knowledgeSource: connectionStatus === 'connected' ? "KBAI MCP Direct" : "Offline Knowledge Base"
              }
            }]} 
          />
        </div>
      </div>
    </div>;
});

export default MonDAI;
