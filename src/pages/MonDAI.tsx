
import React, { useEffect, useState, useCallback } from 'react';
import { AgentInterface } from '@/components/shared/agent';
import { useKnowledgeBase } from '@/hooks/mcp/useKnowledgeBase';
import { useMondAI } from '@/hooks/use-mondai';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Loader2, RefreshCw, AlertTriangle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

// Extend the agent service to support 'mondai' type
declare module '@/services/agent-service' {
  interface ConversationContextOptions {
    agentType: "learn" | "earn" | "connect" | "mondai";
  }
}

const MonDAI = () => {
  // Use our custom hook
  const {
    conversationId,
    isLoading,
    documentUpdates,
    handleAIMessage,
    handleDocumentContextUpdated,
  } = useMondAI();
  
  // Track manual retry attempts
  const [isRetrying, setIsRetrying] = useState(false);
  const [showConnectionAlert, setShowConnectionAlert] = useState(false);
  
  // Initialize knowledge base
  const { 
    items: knowledgeItems,
    fetchKnowledgeItems,
    retryConnection,
    connectionStatus,
    isLoading: kbLoading
  } = useKnowledgeBase();

  // Set fullscreen mode effect for mobile
  useEffect(() => {
    // Add a class to the root element for fullscreen styling
    document.documentElement.classList.add('fullscreen-mode');
    
    // Remove the class when component unmounts
    return () => {
      document.documentElement.classList.remove('fullscreen-mode');
    };
  }, []);
  
  // Check KBAI connection on initial load - without continuous retries
  useEffect(() => {
    console.log("MonDAI: Initializing connection to knowledge base");
    
    const initialCheck = async () => {
      try {
        // First attempt to load knowledge items
        console.log('MonDAI: Initial connection attempt...');
        await fetchKnowledgeItems();
        
        if (connectionStatus === 'error' || connectionStatus === 'disconnected') {
          console.log('Initial connection failed');
          // Show the connection alert after initial failure
          setShowConnectionAlert(true);
        }
      } catch (error) {
        console.error('Error in initial connection setup:', error);
        setShowConnectionAlert(true);
      }
    };
    
    initialCheck();
  }, [fetchKnowledgeItems]);

  // Handle manual connection retry
  const handleManualRetry = async () => {
    setIsRetrying(true);
    toast.info('Attempting to connect to knowledge base...', { duration: 3000 });
    
    try {
      const success = await retryConnection();
      
      if (success) {
        setShowConnectionAlert(false);
        toast.success('Successfully connected to knowledge base!');
      } else {
        toast.error('Unable to connect to knowledge base', {
          description: 'Using offline mode with fallback data',
          duration: 5000
        });
      }
    } catch (error) {
      console.error('Error during retry attempt:', error);
      toast.error('Connection retry failed', {
        description: 'Please try again later',
      });
    } finally {
      setIsRetrying(false);
    }
  };

  const getStatusDescription = () => {
    if (kbLoading || isRetrying) return "Connecting to knowledge base...";
    switch (connectionStatus) {
      case 'connected': return "Community agent with KBAI integration";
      case 'connecting': return "Establishing knowledge base connection...";
      case 'error': return "Community agent with offline knowledge base";
      default: return "Community agent with offline knowledge base";
    }
  };

  return (
    <div className="container py-6 max-w-7xl mx-auto h-full agent-interface">
      <div className="grid gap-6 h-full">
        {showConnectionAlert && connectionStatus !== 'connected' && (
          <Alert variant="warning" className="mb-4">
            <AlertTriangle className="h-4 w-4 mr-2" />
            <AlertDescription>
              Unable to connect to the knowledge base. Using offline data instead. 
              <Button 
                variant="link" 
                className="px-2 py-0 h-auto font-semibold" 
                onClick={handleManualRetry}
                disabled={isRetrying}
              >
                Try reconnecting
              </Button>
            </AlertDescription>
          </Alert>
        )}
        
        <div className="flex flex-col h-full">
          <div className="flex flex-row justify-between items-center mb-2">
            <div className="flex-1">
              {/* This is empty space for alignment */}
            </div>
            <div className="flex items-center gap-2">
              {(connectionStatus === 'error' || connectionStatus === 'disconnected') && (
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={handleManualRetry}
                  disabled={isRetrying}
                >
                  {isRetrying ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Connecting...
                    </>
                  ) : (
                    <>
                      <RefreshCw className="h-4 w-4 mr-2" />
                      Retry Connection
                    </>
                  )}
                </Button>
              )}
            </div>
          </div>
          
          <AgentInterface
            title="MonDAI"
            description={getStatusDescription()}
            agentType="learn" // Using learn type for compatibility
            onMessageSubmit={handleAIMessage}
            onDocumentAdded={handleDocumentContextUpdated}
            documentContextUpdated={documentUpdates}
            conversationId={conversationId}
            initialMessages={[
              {
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
              }
            ]}
          />
        </div>
      </div>
    </div>
  );
};

export default MonDAI;
