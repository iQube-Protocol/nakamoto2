import React from 'react';
import { cn } from '@/lib/utils';
import { Bot, ChevronLeft, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { TooltipProvider, Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Button } from "@/components/ui/button";
interface SidebarHeaderProps {
  collapsed: boolean;
  toggleSidebar: () => void;
}
const SidebarHeader: React.FC<SidebarHeaderProps> = ({
  collapsed,
  toggleSidebar
}) => {
  return <div className={cn("flex items-center mb-6 px-3", collapsed ? "justify-center" : "justify-between")}>
      {!collapsed ? <Link to="/mondai" className="flex items-center">
          <Bot className="h-6 w-6 text-qripto-primary mr-2" />
          <div className="flex flex-col">
            <h1 className="text-2xl font-bold bg-gradient-to-r from-qripto-primary to-qripto-accent inline-block text-transparent bg-clip-text">
              Qripto
            </h1>
            
          </div>
        </Link> : <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <button onClick={toggleSidebar} className="p-0 bg-transparent border-none">
                <Bot className="h-6 w-6 text-qripto-primary mt-1" />
              </button>
            </TooltipTrigger>
            <TooltipContent side="right">
              Expand Sidebar
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>}

      {/* Collapse/Expand button */}
      <Button variant="ghost" size="icon" onClick={toggleSidebar} className={collapsed ? "hidden" : ""}>
        {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
      </Button>
    </div>;
};
export default SidebarHeader;