
import React from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { KBAIKnowledgeItem } from '@/integrations/kbai';
import KnowledgeItem from './KnowledgeItem';
import KnowledgeSkeleton from './KnowledgeSkeleton';
import EmptyState from './EmptyState';

interface KnowledgeContentProps {
  items: KBAIKnowledgeItem[];
  isLoading: boolean;
  connectionStatus: 'disconnected' | 'connecting' | 'connected' | 'error';
  onRetryConnection?: () => void;
}

const KnowledgeContent = ({ 
  items, 
  isLoading, 
  connectionStatus,
  onRetryConnection
}: KnowledgeContentProps) => {
  return (
    <div className="flex-1 overflow-hidden">
      <ScrollArea className="h-[400px] pr-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pb-4">
          {isLoading ? (
            <KnowledgeSkeleton />
          ) : (
            items.length > 0 ? 
              items.map(item => <KnowledgeItem key={item.id} item={item} />) : 
              <EmptyState 
                connectionStatus={connectionStatus} 
                onRetryConnection={onRetryConnection}
              />
          )}
        </div>
      </ScrollArea>
    </div>
  );
};

export default KnowledgeContent;
