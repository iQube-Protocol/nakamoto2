
import React, { memo } from 'react';
import { Card } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';

interface KnowledgeBaseProps {
  agentType: 'learn' | 'earn' | 'connect';
}

const KnowledgeBase = memo(({ agentType }: KnowledgeBaseProps) => {
  const knowledgeItems = React.useMemo(() => [1, 2, 3, 4, 5, 6, 7, 8].map((i) => ({
    id: i,
    title: agentType === 'learn' ? `Web3 Learning Module ${i}` :
           agentType === 'earn' ? `Token Economics Guide ${i}` :
           `Community Guide ${i}`,
    description: agentType === 'learn' ? "Learn about blockchain fundamentals and web3 applications." :
                 agentType === 'earn' ? "Understand MonDAI token metrics and rewards." :
                 "Connect with like-minded individuals in the community."
  })), [agentType]);

  return (
    <div className="flex flex-col h-full">
      <div className="p-4 pb-2">
        <h3 className="text-lg font-medium">Knowledge Base</h3>
        <p className="text-sm text-muted-foreground mt-1">
          Access specialized information related to {agentType === 'learn' ? 'web3 education' : 
            agentType === 'earn' ? 'MonDAI tokens' : 'community connections'}.
        </p>
      </div>
      
      <ScrollArea className="h-[400px] px-4 flex-grow">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pb-4">
          {knowledgeItems.map((item) => (
            <Card key={item.id} className="p-4 hover:bg-card/90 transition-colors cursor-pointer">
              <h4 className="font-medium">{item.title}</h4>
              <p className="text-sm text-muted-foreground mt-1">{item.description}</p>
            </Card>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
});

KnowledgeBase.displayName = 'KnowledgeBase';

export default KnowledgeBase;
