
import React, { useState } from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useKnowledgeBase } from '@/hooks/mcp/useKnowledgeBase';
import { Button } from '@/components/ui/button';
import { RefreshCw, Loader2, X, ChevronRight, Info } from 'lucide-react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { KBAIKnowledgeItem } from '@/integrations/kbai';

interface KnowledgeBaseProps {
  agentType: 'learn' | 'earn' | 'connect';
}

const KnowledgeBase: React.FC<KnowledgeBaseProps> = ({ agentType }) => {
  const { items, isLoading, fetchKnowledgeItems } = useKnowledgeBase();
  const [selectedItem, setSelectedItem] = useState<KBAIKnowledgeItem | null>(null);
  
  const getAgentKnowledgeItems = () => {
    // Filter items based on agent type if needed
    return items;
  };
  
  const agentKnowledgeItems = getAgentKnowledgeItems();
  
  // Create a handler function that will call fetchKnowledgeItems with forceRefresh=true
  const handleRefreshClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    fetchKnowledgeItems(true);
  };
  
  const handleItemClick = (item: KBAIKnowledgeItem) => {
    setSelectedItem(item);
  };
  
  const closeDialog = () => {
    setSelectedItem(null);
  };
  
  return (
    <div className="flex flex-col h-[400px] overflow-hidden">
      <div className="mb-4 flex justify-between items-center">
        <h3 className="text-sm font-medium">Knowledge Base Resources</h3>
        <Button 
          variant="ghost" 
          size="sm" 
          className="flex gap-1 items-center"
          onClick={handleRefreshClick}
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
                    className="p-2 border rounded-md hover:bg-iqube-accent/20 cursor-pointer transition-colors"
                    onClick={() => handleItemClick(item)}
                  >
                    <div className="flex justify-between items-start">
                      <h4 className="font-medium">{item.title}</h4>
                      {item.type === 'agent-info' && (
                        <Info className="h-3.5 w-3.5 text-blue-500 flex-shrink-0 mt-1" />
                      )}
                    </div>
                    {item.content && (
                      <p className="text-xs text-muted-foreground mt-1">
                        {item.content.length > 100 ? `${item.content.substring(0, 100)}...` : item.content}
                      </p>
                    )}
                    <div className="flex justify-between items-center mt-2">
                      <span className="text-xs text-muted-foreground">{item.source}</span>
                      <Button variant="ghost" size="sm" className="h-6 px-2">
                        <span className="text-xs">Read more</span>
                        <ChevronRight className="h-3 w-3 ml-1" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </ScrollArea>
      </div>
      
      {/* Detailed knowledge item dialog */}
      <Dialog open={!!selectedItem} onOpenChange={(open) => !open && closeDialog()}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle className="pr-8">{selectedItem?.title}</DialogTitle>
            <DialogDescription className="text-xs">
              Source: {selectedItem?.source} • Type: {selectedItem?.type}
            </DialogDescription>
          </DialogHeader>
          <ScrollArea className="flex-1 max-h-[60vh]">
            <div className="p-4 whitespace-pre-line">
              {selectedItem?.content}
            </div>
          </ScrollArea>
          <div className="border-t pt-2 flex justify-end">
            <Button variant="outline" size="sm" onClick={closeDialog}>
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default KnowledgeBase;
