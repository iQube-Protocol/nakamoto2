
import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, RefreshCw, WifiOff, AlertTriangle, Info } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { KBAIKnowledgeItem } from '@/integrations/kbai/KBAIMCPService';
import { useKnowledgeBase } from '@/hooks/mcp/useKnowledgeBase';
import DocumentViewer from './document/DocumentViewer';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

interface KnowledgeBaseProps {
  agentType: 'learn' | 'earn' | 'connect';
}

const KnowledgeBase = ({ agentType }: KnowledgeBaseProps) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedItem, setSelectedItem] = useState<KBAIKnowledgeItem | null>(null);
  const [isViewerOpen, setIsViewerOpen] = useState(false);
  
  const {
    items,
    isLoading,
    connectionStatus,
    errorMessage,
    fetchKnowledgeItems,
    searchKnowledge,
    resetSearch
  } = useKnowledgeBase({
    limit: 8
  });
  
  // Handle search
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      searchKnowledge(searchQuery.trim());
    } else {
      resetSearch();
    }
  };
  
  // Handle refresh - explicitly passing an empty object to force refresh
  const handleRefresh = () => {
    fetchKnowledgeItems({});
  };
  
  // Handle knowledge item click
  const handleKnowledgeItemClick = (item: KBAIKnowledgeItem) => {
    setSelectedItem(item);
    setIsViewerOpen(true);
  };
  
  // Render knowledge item
  const renderKnowledgeItem = (item: KBAIKnowledgeItem) => (
    <Card 
      key={item.id} 
      className="p-4 hover:bg-card/90 transition-colors cursor-pointer"
      onClick={() => handleKnowledgeItemClick(item)}
    >
      <h4 className="font-medium">{item.title}</h4>
      <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
        <span className="bg-primary/10 px-2 py-0.5 rounded">{item.type}</span>
        <span>Relevance: {(item.relevance * 100).toFixed(0)}%</span>
      </div>
      <p className="text-sm text-muted-foreground mt-2 line-clamp-2">
        {item.content}
      </p>
    </Card>
  );
  
  // Render loading skeleton
  const renderSkeleton = () => (
    <>
      {[1, 2, 3, 4].map((i) => (
        <Card key={i} className="p-4">
          <Skeleton className="h-5 w-2/3 mb-2" />
          <Skeleton className="h-3 w-1/3 mb-3" />
          <Skeleton className="h-4 w-full mb-1" />
          <Skeleton className="h-4 w-3/4" />
        </Card>
      ))}
    </>
  );
  
  // Render connection status
  const renderConnectionStatus = () => {
    if (connectionStatus === 'connected') return null;
    
    return (
      <div className={`p-2 rounded text-sm flex items-center gap-2 mb-4 ${
        connectionStatus === 'error' 
          ? 'bg-destructive/10 text-destructive' 
          : connectionStatus === 'connecting'
            ? 'bg-blue-500/10 text-blue-500'
            : 'bg-amber-500/10 text-amber-500'
      }`}>
        {connectionStatus === 'error' ? (
          <>
            <WifiOff size={16} />
            <div className="flex-1">
              <span>Could not connect to knowledge base. Using fallback data.</span>
              {errorMessage && (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-5 w-5 ml-1 hover:bg-destructive/20">
                      <Info size={14} />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent className="max-w-sm">
                    <p className="text-xs">{errorMessage}</p>
                  </TooltipContent>
                </Tooltip>
              )}
            </div>
          </>
        ) : connectionStatus === 'connecting' ? (
          <>
            <span className="animate-pulse">●</span>
            <span>Connecting to knowledge base...</span>
          </>
        ) : (
          <>
            <AlertTriangle size={16} />
            <span>Knowledge base disconnected</span>
          </>
        )}
      </div>
    );
  };

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <div className="mb-4">
        <h3 className="text-lg font-medium">Knowledge Base</h3>
        <p className="text-sm text-muted-foreground">
          Access specialized information related to {
            agentType === 'learn' ? 'web3 education' : 
            agentType === 'earn' ? 'MonDAI tokens' : 'community connections'
          }.
        </p>
        
        <form onSubmit={handleSearch} className="relative mt-3">
          <Input
            placeholder="Search knowledge base..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pr-10"
          />
          <Button 
            type="submit" 
            variant="ghost" 
            size="icon" 
            className="absolute right-0 top-0"
          >
            <Search size={18} />
          </Button>
        </form>
        
        {renderConnectionStatus()}
      </div>
      
      <div className="flex items-center justify-between mb-3">
        <h4 className="text-sm font-medium">
          {searchQuery ? `Results for "${searchQuery}"` : "Relevant Knowledge"}
        </h4>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleRefresh}
          disabled={isLoading}
          className="h-8 px-2"
        >
          <RefreshCw size={16} className={isLoading ? 'animate-spin' : ''} />
        </Button>
      </div>
      
      <div className="flex-1 overflow-hidden">
        <ScrollArea className="h-full">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pr-4">
            {isLoading ? renderSkeleton() : (
              items.length > 0 ? 
                items.map(renderKnowledgeItem) : 
                <div className="col-span-full text-center py-8 text-muted-foreground">
                  No knowledge items found.
                </div>
            )}
          </div>
        </ScrollArea>
      </div>

      {/* Knowledge Item Viewer Dialog */}
      <DocumentViewer
        document={selectedItem ? {
          id: selectedItem.id,
          name: selectedItem.title,
          content: selectedItem.content,
          mimeType: 'text/plain'
        } : null}
        isOpen={isViewerOpen}
        onOpenChange={setIsViewerOpen}
      />
    </div>
  );
};

export default KnowledgeBase;
