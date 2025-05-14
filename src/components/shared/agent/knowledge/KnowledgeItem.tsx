
import React from 'react';
import { Card } from '@/components/ui/card';
import { KBAIKnowledgeItem } from '@/integrations/kbai';

interface KnowledgeItemProps {
  item: KBAIKnowledgeItem;
}

const KnowledgeItem = ({ item }: KnowledgeItemProps) => {
  return (
    <Card key={item.id} className="p-4 hover:bg-card/90 transition-colors cursor-pointer">
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
};

export default KnowledgeItem;
