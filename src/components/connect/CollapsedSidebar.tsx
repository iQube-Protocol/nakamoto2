
import React from 'react';
import { Button } from '@/components/ui/button';
import { ChevronRight, Users, Calendar, MessageSquare } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface CollapsedSidebarProps {
  selectedTab: string | undefined;
  togglePanelCollapse: () => void;
  handleTabChange: (value: string) => void;
}

const CollapsedSidebar: React.FC<CollapsedSidebarProps> = ({
  selectedTab,
  togglePanelCollapse,
  handleTabChange,
}) => {
  return (
    <div className="border-l h-full flex flex-col items-center justify-start p-2">
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              onClick={togglePanelCollapse}
              className="mt-4"
            >
              <ChevronRight className="h-6 w-6" />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="left">
            Expand panel
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
      
      <div className="mt-6 flex flex-col space-y-6">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant={selectedTab === 'members' ? 'secondary' : 'ghost'}
                size="icon"
                className={`p-2 ${selectedTab === 'members' ? 'bg-iqube-primary/10' : ''}`}
                onClick={() => handleTabChange('members')}
              >
                <Users className="h-6 w-6" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="left">
              Community Members
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
        
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant={selectedTab === 'groups' ? 'secondary' : 'ghost'}
                size="icon"
                className={`p-2 ${selectedTab === 'groups' ? 'bg-iqube-primary/10' : ''}`}
                onClick={() => handleTabChange('groups')}
              >
                <Users className="h-6 w-6" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="left">
              Community Groups
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
        
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant={selectedTab === 'events' ? 'secondary' : 'ghost'}
                size="icon"
                className={`p-2 ${selectedTab === 'events' ? 'bg-iqube-primary/10' : ''}`}
                onClick={() => handleTabChange('events')}
              >
                <Calendar className="h-6 w-6" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="left">
              Community Events
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
        
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant={selectedTab === 'messages' ? 'secondary' : 'ghost'}
                size="icon"
                className={`p-2 ${selectedTab === 'messages' ? 'bg-iqube-primary/10' : ''}`}
                onClick={() => handleTabChange('messages')}
              >
                <MessageSquare className="h-6 w-6" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="left">
              Community Messages
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
    </div>
  );
};

export default CollapsedSidebar;
