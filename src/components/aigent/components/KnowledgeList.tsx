
import React from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import KnowledgeItem from './KnowledgeItem';
import { useIsMobile } from '@/hooks/use-mobile';

interface KnowledgeListProps {
  filteredQryptoItems: any[];
  filteredMetaKnytsItems: any[];
  searchTerm: string;
  onItemClick: (item: any) => void;
  showBothSections: boolean;
}

const KnowledgeList = ({ 
  filteredQryptoItems, 
  filteredMetaKnytsItems, 
  searchTerm, 
  onItemClick,
  showBothSections
}: KnowledgeListProps) => {
  const isMobile = useIsMobile();

  const renderKnowledgeItems = (items: any[], knowledgeBase: string) => (
    <div className="space-y-4">
      {items.map(item => (
        <KnowledgeItem 
          key={item.id} 
          item={item} 
          knowledgeBase={knowledgeBase} 
          onItemClick={onItemClick} 
        />
      ))}
    </div>
  );

  const hasIQubesItems = filteredQryptoItems.length > 0;
  const hasCOYNItems = filteredMetaKnytsItems.length > 0;
  const hasAnyItems = hasIQubesItems || hasCOYNItems;

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <ScrollArea className="h-full">
        <div className="p-4 pb-2">
          {showBothSections ? (
            <div className="space-y-6">
              {hasIQubesItems && (
                <div>
                  <h3 className="font-semibold mb-3 text-blue-400 text-base">
                    iQubes Technical Knowledge
                  </h3>
                  {renderKnowledgeItems(filteredQryptoItems, 'iQubes')}
                </div>
              )}
              {hasCOYNItems && (
                <div>
                  <h3 className="font-semibold mb-3 text-orange-400 text-base">
                    COYN Economic Framework
                  </h3>
                  {renderKnowledgeItems(filteredMetaKnytsItems, 'COYN')}
                </div>
              )}
              {!hasAnyItems && (
                <p className="text-center text-gray-500 py-8">
                  No items found matching "{searchTerm}"
                </p>
              )}
            </div>
          ) : (
            <div>
              {hasIQubesItems && renderKnowledgeItems(filteredQryptoItems, 'iQubes')}
              {hasCOYNItems && renderKnowledgeItems(filteredMetaKnytsItems, 'COYN')}
              {!hasAnyItems && (
                <p className="text-center text-gray-500 py-8">
                  {searchTerm ? (
                    hasIQubesItems || filteredQryptoItems.length === 0 ? 
                    `No COYN items found matching "${searchTerm}"` :
                    `No iQubes items found matching "${searchTerm}"`
                  ) : (
                    hasIQubesItems || filteredQryptoItems.length === 0 ?
                    'No COYN items available' :
                    'No iQubes items available'
                  )}
                </p>
              )}
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  );
};

export default KnowledgeList;
