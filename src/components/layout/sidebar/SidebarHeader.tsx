
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

const SidebarHeader: React.FC<SidebarHeaderProps> = ({ collapsed, toggleSidebar }) => {
  return (
    <div className={cn(
      "flex items-center mb-6 px-3",
      collapsed ? "justify-center" : "justify-between"
    )}>
      {!collapsed ? (
        <Link to="/mondai" className="flex items-center group">
          <Bot className="h-7 w-7 text-primary-purple mr-3 transition-colors duration-300 group-hover:text-primary-orange" />
          <h1 className="text-xl font-bold qrypto-gradient tracking-wide">
            QryptoCOYN
          </h1>
        </Link>
      ) : (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Link to="/mondai" className="group">
                <Bot className="h-7 w-7 text-primary-purple transition-colors duration-300 group-hover:text-primary-orange" />
              </Link>
            </TooltipTrigger>
            <TooltipContent side="right" className="font-medium">
              QryptoCOYN
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      )}

      {/* Collapse/Expand button */}
      <Button 
        variant="ghost" 
        size="icon" 
        onClick={toggleSidebar}
        className={cn(
          "text-primary-purple hover:text-primary-orange hover:bg-primary-purple/10 transition-all duration-300",
          collapsed ? "hidden" : ""
        )}
      >
        {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
      </Button>
    </div>
  );
};

export default SidebarHeader;
