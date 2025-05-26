
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

  const hasQryptoItems = filteredQryptoItems.length > 0;
  const hasMetaKnytsItems = filteredMetaKnytsItems.length > 0;
  const hasAnyItems = hasQryptoItems || hasMetaKnytsItems;

  return (
    <div className="flex-1 flex flex-col min-h-0">
      <ScrollArea className="flex-1">
        <div className="p-4 pb-2">
          {showBothSections ? (
            <div className="space-y-6">
              {hasQryptoItems && (
                <div>
                  <h3 className="font-semibold mb-3 text-orange-400 text-base">
                    {isMobile ? 'COYN' : 'QryptoCOYN'} Factual Knowledge
                  </h3>
                  {renderKnowledgeItems(filteredQryptoItems, isMobile ? 'COYN' : 'QryptoCOYN')}
                </div>
              )}
              {hasMetaKnytsItems && (
                <div>
                  <h3 className="font-semibold mb-3 text-violet-400 text-base">
                    {isMobile ? 'COYN' : 'QryptoCOYN'} fictional lore: {isMobile ? 'KNYT' : 'mẹtaKnyts'}
                  </h3>
                  {renderKnowledgeItems(filteredMetaKnytsItems, isMobile ? 'KNYT' : 'mẹtaKnyts')}
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
              {hasQryptoItems && renderKnowledgeItems(filteredQryptoItems, isMobile ? 'COYN' : 'QryptoCOYN')}
              {hasMetaKnytsItems && renderKnowledgeItems(filteredMetaKnytsItems, isMobile ? 'KNYT' : 'mẹtaKnyts')}
              {!hasAnyItems && (
                <p className="text-center text-gray-500 py-8">
                  {searchTerm ? (
                    hasQryptoItems || filteredQryptoItems.length === 0 ? 
                    `No ${isMobile ? 'KNYT' : 'mẹtaKnyts'} items found matching "${searchTerm}"` :
                    `No ${isMobile ? 'COYN' : 'QryptoCOYN'} items found matching "${searchTerm}"`
                  ) : (
                    hasQryptoItems || filteredQryptoItems.length === 0 ?
                    `No ${isMobile ? 'KNYT' : 'mẹtaKnyts'} items available` :
                    `No ${isMobile ? 'COYN' : 'QryptoCOYN'} items available`
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
