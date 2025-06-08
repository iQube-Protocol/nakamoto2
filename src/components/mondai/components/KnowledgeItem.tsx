
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ChevronRight } from 'lucide-react';
import { getCategoryIcon, getCategoryColor } from '../utils/categoryUtils';
import { useIsMobile } from '@/hooks/use-mobile';
interface KnowledgeItemProps {
  item: any;
  knowledgeBase: string;
  onItemClick: (item: any) => void;
}
const KnowledgeItem = ({
  item,
  knowledgeBase,
  onItemClick
}: KnowledgeItemProps) => {
  const isMobile = useIsMobile();

  // Truncated content for summary
  const truncatedContent = item.content.length > 150 ? `${item.content.substring(0, 150)}...` : item.content;

  // Show only first 3 keywords, with +X indicator if more
  const visibleKeywords = item.keywords.slice(0, 3);
  const remainingKeywords = item.keywords.length - 3;
  return <Card className="hover:shadow-lg transition-all duration-200 cursor-pointer hover:scale-[1.02]" onClick={() => onItemClick(item)}>
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between">
          <CardTitle className="leading-tight text-base">{item.title}</CardTitle>
          <Badge variant="outline" className={`ml-2 rounded-md ${getCategoryColor(item.category)} flex items-center gap-1`}>
            {getCategoryIcon(item.category)}
            {item.category}
          </Badge>
        </div>
        <CardDescription className="text-sm">
          <strong>Source:</strong> {item.source} | <strong>Section:</strong> {item.section}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-sm mb-3 text-zinc-300">{truncatedContent}</p>
        <div className="flex flex-wrap gap-1 mb-3 bg-gray-700">
          {visibleKeywords.map((keyword: string) => <Badge key={keyword} variant="secondary" className="text-xs rounded-md px-2 py-1 transition-colors bg-gray-500 text-white border-gray-300/70 hover:bg-amber-600">
              {keyword}
            </Badge>)}
          {remainingKeywords > 0 && <Badge variant="outline" className="text-xs rounded-md px-2 py-1 bg-gray-500 text-white border-gray-300/70">
              +{remainingKeywords}
            </Badge>}
        </div>
        {item.connections && item.connections.length > 0 && <div className="mb-3 pt-2 border-t">
            <p className="text-xs text-gray-500 mb-1">Connected to {isMobile ? 'COYN' : 'QryptoCOYN'} concepts:</p>
            <div className="flex flex-wrap gap-1 bg-gray-700">
              {item.connections.slice(0, 2).map((connection: string) => <Badge key={connection} variant="outline" className="text-xs rounded-md px-2 py-1 bg-gray-500 text-white border-rose-300/70 hover:bg-amber-600 transition-colors">
                  {connection}
                </Badge>)}
              {item.connections.length > 2 && <Badge variant="outline" className="text-xs rounded-md px-2 py-1 bg-gray-500 text-white border-gray-300/70">
                  +{item.connections.length - 2}
                </Badge>}
            </div>
          </div>}
        <div className="flex justify-between items-center">
          <Badge variant="outline" className="text-xs rounded-md px-2 py-1 bg-gray-500 text-white border-gray-300/70">
            {knowledgeBase}
          </Badge>
          <Button variant="ghost" size="sm" className="h-6 px-2 text-blue-600 hover:text-blue-800 hover:bg-blue-50 transition-colors">
            <span className="text-xs">Read more</span>
            <ChevronRight className="h-3 w-3 ml-1" />
          </Button>
        </div>
      </CardContent>
    </Card>;
};
export default KnowledgeItem;
