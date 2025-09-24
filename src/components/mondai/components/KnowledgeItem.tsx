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
    .replace(/^### (.+)$/gm, 'About $1:').replace(/^## (.+)$/gm, 'Key info on $1:').replace(/^# (.+)$/gm, 'Understanding $1:')
    // Remove markdown formatting for preview
    .replace(/\*\*([^*]+)\*\*/g, '$1').replace(/^\* /gm, '• ').replace(/^- /gm, '• ')
    // Clean up
    .replace(/\n\n+/g, ' ').trim();
  };

  // Truncated content for summary with conversational processing
  const processedContent = processPreviewContent(item.content);
  const truncatedContent = processedContent.length > 150 ? `${processedContent.substring(0, 150)}...` : processedContent;

  // Show only first 3 keywords, with +X indicator if more
  const visibleKeywords = item.keywords.slice(0, 3);
  const remainingKeywords = item.keywords.length - 3;

  // Use different colors based on knowledge base with soft white text
  const baseColor = knowledgeBase === 'iQubes' ? 'blue' : 'orange';
  const keywordBgColor = knowledgeBase === 'iQubes' ? 'bg-blue-100/30 text-slate-200 hover:bg-blue-200/40' : 'bg-orange-100/30 text-slate-200 hover:bg-orange-200/40';
  const connectionBgColor = knowledgeBase === 'iQubes' ? 'bg-rose-100/30 text-slate-200 border-rose-300/40' : 'bg-purple-100/30 text-slate-200 border-purple-300/40';
  return <Card className="hover:shadow-lg transition-all duration-200 cursor-pointer hover:scale-[1.02] knowledge-content" onClick={() => onItemClick(item)}>
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between">
          <CardTitle className="leading-tight text-base">{item.title}</CardTitle>
          <Badge variant="outline" className="ml-2 rounded-md bg-slate-600/30 text-slate-200 border-slate-400/40 flex items-center gap-1 font-normal">
            {getCategoryIcon(item.category)}
            {item.category}
          </Badge>
        </div>
        <CardDescription className="text-sm">
          <strong>Source:</strong> {item.source} | <strong>Section:</strong> {item.section}
        </CardDescription>
      </CardHeader>
      <CardContent className="">
        <div className="mb-3 p-3 border-l-4 border-slate-300 rounded-r-lg bg-indigo-950">
          <p className="text-sm leading-relaxed text-slate-100">{truncatedContent}</p>
        </div>
        
        <div className="flex flex-wrap gap-1 mb-3">
          {visibleKeywords.map((keyword: string) => <Badge key={keyword} variant="secondary" className={`text-xs rounded-md px-2 py-1 h-6 transition-colors font-normal ${keywordBgColor}`}>
              {keyword}
            </Badge>)}
          {remainingKeywords > 0 && <Badge variant="secondary" className={`text-xs rounded-md px-2 py-1 h-6 transition-colors font-normal ${keywordBgColor}`}>
              +{remainingKeywords}
            </Badge>}
        </div>
        
        {item.connections && item.connections.length > 0 && <div className="mb-3 pt-2 border-t">
            <p className="text-xs text-gray-500 mb-1">Connected to {isMobile ? 'COYN' : 'QriptoCOYN'} concepts:</p>
            <div className="flex flex-wrap gap-1">
              {item.connections.slice(0, 2).map((connection: string) => <Badge key={connection} variant="outline" className={`text-xs rounded-md px-2 py-1 font-normal ${connectionBgColor} transition-colors`}>
                  {connection}
                </Badge>)}
              {item.connections.length > 2 && <Badge variant="outline" className="text-xs rounded-md px-2 py-1 bg-gray-100/30 text-slate-200 border-gray-300/40 font-normal">
                  +{item.connections.length - 2}
                </Badge>}
            </div>
          </div>}
        
        <div className="flex justify-between items-center">
          <Badge variant="outline" className={`text-xs rounded-md px-2 py-1 font-normal ${knowledgeBase === 'iQubes' ? 'bg-blue-100/30 text-slate-200 border-blue-300/40' : 'bg-orange-100/30 text-slate-200 border-orange-300/40'}`}>
            {knowledgeBase}
          </Badge>
          <Button variant="ghost" size="sm" className={`h-6 px-2 transition-colors ${knowledgeBase === 'iQubes' ? 'text-blue-600 hover:text-blue-800 hover:bg-blue-50' : 'text-orange-600 hover:text-orange-800 hover:bg-orange-50'}`}>
            <span className="text-xs">Read more</span>
            <ChevronRight className="h-3 w-3 ml-1" />
          </Button>
        </div>
      </CardContent>
    </Card>;
};
export default KnowledgeItem;