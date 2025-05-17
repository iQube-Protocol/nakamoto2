
import React from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useKnowledgeBase } from '@/hooks/mcp/useKnowledgeBase';
import { Button } from '@/components/ui/button';
import { RefreshCw, Loader2 } from 'lucide-react';

interface KnowledgeBaseProps {
  agentType: 'learn' | 'earn' | 'connect';
}

const KnowledgeBase: React.FC<KnowledgeBaseProps> = ({ agentType }) => {
  const { items, isLoading, fetchKnowledgeItems } = useKnowledgeBase();
  
  const getAgentKnowledgeItems = () => {
    // Filter items based on agent type if needed
    return items;
  };
  
  const agentKnowledgeItems = getAgentKnowledgeItems();
  
  return (
    <div className="flex flex-col h-[400px] overflow-hidden">
      <div className="mb-4 flex justify-between items-center">
        <h3 className="text-sm font-medium">Knowledge Base Resources</h3>
        <Button 
          variant="ghost" 
          size="sm" 
          className="flex gap-1 items-center"
          onClick={fetchKnowledgeItems}
          disabled={isLoading}
        >
          {isLoading ? 
            <Loader2 className="h-3.5 w-3.5 animate-spin" /> : 
            <RefreshCw className="h-3.5 w-3.5" />
          }
          Refresh
        </Button>
      </div>
      
      <div className="flex-1 overflow-hidden">
        <ScrollArea className="h-full">
          <div className="p-2">
            {isLoading ? (
              <div className="flex justify-center p-4">
                <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
              </div>
            ) : agentKnowledgeItems.length === 0 ? (
              <div className="text-center py-8 text-sm text-muted-foreground">
                No knowledge base resources available.
              </div>
            ) : (
              <div className="space-y-2">
                {agentKnowledgeItems.map((item) => (
                  <div 
                    key={item.id} 
                    className="p-2 border rounded-md hover:bg-accent cursor-pointer"
                  >
                    <h4 className="font-medium">{item.title}</h4>
                    {item.description && (
                      <p className="text-xs text-muted-foreground">{item.description}</p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </ScrollArea>
      </div>
    </div>
  );
};

export default KnowledgeBase;
