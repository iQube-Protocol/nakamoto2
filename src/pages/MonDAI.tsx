import React, { useEffect, useState } from 'react';
import { AgentInterface } from '@/components/shared/agent';
import { useKnowledgeBase } from '@/hooks/mcp/useKnowledgeBase';
import { useMondAI } from '@/hooks/use-mondai';
import { sonnerToast as toast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Loader2, RefreshCw, Settings } from 'lucide-react';
import { getKBAIDirectService, KBAIServerSettings } from '@/integrations/kbai/KBAIDirectService';
import { KBAIServerConfig } from '@/components/shared/agent/KBAIServerConfig';

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
  const [serverConfig, setServerConfig] = useState<KBAIServerSettings>(() => {
    // Initialize from the service
    const kbaiService = getKBAIDirectService();
    return kbaiService.getServerConfig();
  });
  
  // Initialize knowledge base
  const { 
    items: knowledgeItems,
    fetchKnowledgeItems,
    retryConnection,
    connectionStatus,
    isLoading: kbLoading
  } = useKnowledgeBase();

  // Handle server config updates
  const handleConfigUpdate = (config: KBAIServerSettings) => {
    setServerConfig(config);
    // The service will already be updated from within the config component
  };

  // Set fullscreen mode effect for mobile
  useEffect(() => {
    // Add a class to the root element for fullscreen styling
    document.documentElement.classList.add('fullscreen-mode');
    
    // Remove the class when component unmounts
    return () => {
      document.documentElement.classList.remove('fullscreen-mode');
    };
  }, []);
  
  // Check KBAI connection on initial load and auto-retry with exponential backoff
  useEffect(() => {
    console.log("MonDAI: Initializing connection to knowledge base");
    const maxRetries = 3;
    const checkConnection = async (retryCount = 0) => {
      try {
        console.log(`MonDAI: Attempt ${retryCount + 1} to connect to knowledge base...`);
        // First attempt to load knowledge items
        await fetchKnowledgeItems();
        
        console.log(`MonDAI: Connection status after fetch: ${connectionStatus}`);
        
        if (connectionStatus === 'error' && retryCount < maxRetries) {
          const delay = Math.min(2000 * Math.pow(2, retryCount), 10000); // exponential backoff
          console.log(`Connection failed, retrying in ${delay/1000}s (attempt ${retryCount + 1}/${maxRetries})...`);
          
          setTimeout(async () => {
            console.log(`MonDAI: Starting retry attempt ${retryCount + 1}...`);
            const success = await retryConnection();
            console.log(`MonDAI: Retry attempt ${retryCount + 1} result: ${success ? 'success' : 'failure'}`);
            
            if (!success && retryCount + 1 < maxRetries) {
              checkConnection(retryCount + 1);
            } else if (!success) {
              console.log('All retry attempts failed, using fallback data');
              toast.info('Using offline knowledge base', {
                description: 'Connection to knowledge base unavailable. Using local data.',
                duration: 5000,
              });
            }
          }, delay);
        } else if (connectionStatus === 'connected') {
          console.log('MonDAI: Successfully connected to KBAI service!');
        }
      } catch (error) {
        console.error('Error in initial connection check:', error);
        if (retryCount < maxRetries) {
          setTimeout(() => checkConnection(retryCount + 1), 2000);
        }
      }
    };
    
    checkConnection();
  }, []);

  // Handle manual connection retry
  const handleManualRetry = async () => {
    setIsRetrying(true);
    try {
      console.log('MonDAI: Manual connection retry initiated');
      toast.info('Attempting to reconnect to knowledge base...', {
        duration: 3000,
      });
      
      const success = await retryConnection();
      
      if (success) {
        toast.success('Successfully connected to knowledge base!');
      } else {
        toast.error('Unable to connect to knowledge base', {
          description: 'Using offline mode with fallback data',
          duration: 5000
        });
      }
    } catch (error) {
      console.error('Error during manual retry:', error);
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
        <div className="flex flex-col h-full">
          <div className="flex flex-row justify-between items-center mb-2">
            <div className="flex-1">
              {/* This is empty space for alignment */}
            </div>
            <div className="flex items-center gap-2">
              <KBAIServerConfig 
                onConfigUpdate={handleConfigUpdate}
                currentSettings={serverConfig}
              />
            
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
