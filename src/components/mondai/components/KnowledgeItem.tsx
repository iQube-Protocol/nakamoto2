
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

  // Process content for preview using our conversational guidelines
  const processPreviewContent = (content: string) => {
    return content
      // Convert headers to friendly phrases
      .replace(/^### (.+)$/gm, 'About $1:')
      .replace(/^## (.+)$/gm, 'Key info on $1:')
      .replace(/^# (.+)$/gm, 'Understanding $1:')
      // Remove markdown formatting for preview
      .replace(/\*\*([^*]+)\*\*/g, '$1')
      .replace(/^\* /gm, '• ')
      .replace(/^- /gm, '• ')
      // Clean up
      .replace(/\n\n+/g, ' ')
      .trim();
  };

  // Truncated content for summary with conversational processing
  const processedContent = processPreviewContent(item.content);
  const truncatedContent = processedContent.length > 150 ? `${processedContent.substring(0, 150)}...` : processedContent;

  // Show only first 3 keywords, with +X indicator if more
  const visibleKeywords = item.keywords.slice(0, 3);
  const remainingKeywords = item.keywords.length - 3;

  // Use different colors based on knowledge base
  const baseColor = knowledgeBase === 'iQubes' ? 'blue' : 'orange';
  const keywordBgColor = knowledgeBase === 'iQubes' ? 'bg-blue-100 text-blue-800 hover:bg-blue-200' : 'bg-orange-100 text-orange-800 hover:bg-orange-200';
  const connectionBgColor = knowledgeBase === 'iQubes' ? 'bg-rose-100 text-rose-800 border-rose-300' : 'bg-purple-100 text-purple-800 border-purple-300';

  return (
    <Card className="hover:shadow-lg transition-all duration-200 cursor-pointer hover:scale-[1.02] knowledge-content" onClick={() => onItemClick(item)}>
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
        <div className="mb-3 p-3 bg-slate-50 border-l-4 border-slate-300 rounded-r-lg">
          <p className="text-sm text-slate-700 leading-relaxed">{truncatedContent}</p>
        </div>
        
        <div className="flex flex-wrap gap-1 mb-3">
          {visibleKeywords.map((keyword: string) => (
            <Badge 
              key={keyword} 
              variant="secondary" 
              className={`text-xs rounded-md px-2 py-1 h-6 transition-colors ${keywordBgColor}`}
            >
              {keyword}
            </Badge>
          ))}
          {remainingKeywords > 0 && (
            <Badge 
              variant="secondary" 
              className={`text-xs rounded-md px-2 py-1 h-6 transition-colors ${keywordBgColor}`}
            >
              +{remainingKeywords}
            </Badge>
          )}
        </div>
        
        {item.connections && item.connections.length > 0 && (
          <div className="mb-3 pt-2 border-t">
            <p className="text-xs text-gray-500 mb-1">Connected to {isMobile ? 'COYN' : 'QryptoCOYN'} concepts:</p>
            <div className="flex flex-wrap gap-1">
              {item.connections.slice(0, 2).map((connection: string) => (
                <Badge 
                  key={connection} 
                  variant="outline" 
                  className={`text-xs rounded-md px-2 py-1 ${connectionBgColor} transition-colors`}
                >
                  {connection}
                </Badge>
              ))}
              {item.connections.length > 2 && (
                <Badge 
                  variant="outline" 
                  className="text-xs rounded-md px-2 py-1 bg-gray-100 text-gray-600 border-gray-300"
                >
                  +{item.connections.length - 2}
                </Badge>
              )}
            </div>
          </div>
        )}
        
        <div className="flex justify-between items-center">
          <Badge variant="outline" className={`text-xs rounded-md px-2 py-1 ${knowledgeBase === 'iQubes' ? 'bg-blue-100 text-blue-800 border-blue-300' : 'bg-orange-100 text-orange-800 border-orange-300'}`}>
            {knowledgeBase}
          </Badge>
          <Button variant="ghost" size="sm" className={`h-6 px-2 transition-colors ${knowledgeBase === 'iQubes' ? 'text-blue-600 hover:text-blue-800 hover:bg-blue-50' : 'text-orange-600 hover:text-orange-800 hover:bg-orange-50'}`}>
            <span className="text-xs">Read more</span>
            <ChevronRight className="h-3 w-3 ml-1" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default KnowledgeItem;
