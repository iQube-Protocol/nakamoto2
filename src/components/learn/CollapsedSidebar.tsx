
import React from 'react';
import { Button } from '@/components/ui/button';
import { BookOpen, Award, Trophy, ChevronLeft } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface CollapsedSidebarProps {
  activeTab: string | null;
  handleTabClick: (value: string) => void;
  togglePanelCollapse: () => void;
}

const CollapsedSidebar = ({ 
  activeTab, 
  handleTabClick, 
  togglePanelCollapse 
}: CollapsedSidebarProps) => {
  return (
    <div className="flex flex-col items-center space-y-6 border-l pl-2">
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              onClick={togglePanelCollapse}
              className="mt-4"
            >
              <ChevronLeft className="h-6 w-6" />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="left">
            Expand panel
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
      
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant={activeTab === 'courses' ? 'secondary' : 'ghost'}
              size="icon"
              className={`p-2 ${activeTab === 'courses' ? 'bg-iqube-primary/20' : ''}`}
              onClick={() => handleTabClick('courses')}
            >
              <BookOpen className="h-6 w-6" />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="left">
            Available Courses
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
      
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant={activeTab === 'certifications' ? 'secondary' : 'ghost'}
              size="icon"
              className={`p-2 ${activeTab === 'certifications' ? 'bg-iqube-primary/20' : ''}`}
              onClick={() => handleTabClick('certifications')}
            >
              <Award className="h-6 w-6" />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="left">
            Your Certifications
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
      
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant={activeTab === 'achievements' ? 'secondary' : 'ghost'}
              size="icon"
              className={`p-2 ${activeTab === 'achievements' ? 'bg-iqube-primary/20' : ''}`}
              onClick={() => handleTabClick('achievements')}
            >
              <Trophy className="h-6 w-6" />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="left">
            Your Achievements
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </div>
  );
};

export default CollapsedSidebar;
