
import React from 'react';
import { Button } from '@/components/ui/button';
import { RefreshCw } from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface KnowledgeHeaderProps {
  searchQuery: string;
  isLoading: boolean;
  onRefresh: () => void;
}

const KnowledgeHeader = ({ searchQuery, isLoading, onRefresh }: KnowledgeHeaderProps) => {
  return (
    <div className="flex items-center justify-between mb-3">
      <h4 className="text-sm font-medium">
        {searchQuery ? `Results for "${searchQuery}"` : "Relevant Knowledge"}
      </h4>
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              onClick={onRefresh}
              disabled={isLoading}
              className="h-8 px-2"
            >
              <RefreshCw size={16} className={isLoading ? 'animate-spin' : ''} />
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Refresh knowledge items</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </div>
  );
};

export default KnowledgeHeader;
