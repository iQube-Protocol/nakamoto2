import React from 'react';
import { cn } from '@/lib/utils';
import { ChevronDown, Wallet } from 'lucide-react';
import { TooltipProvider, Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { AAQuickAction } from './sidebarData';
import { useIsMobile } from '@/hooks/use-mobile';
import { useNavigate, useLocation } from 'react-router-dom';

interface AAQuickActionsSectionProps {
  aaQuickActions: AAQuickAction[];
  aaActionsOpen: boolean;
  toggleAAActionsMenu: () => void;
  collapsed: boolean;
  toggleMobileSidebar?: () => void;
}

const AAQuickActionsSection: React.FC<AAQuickActionsSectionProps> = ({
  aaQuickActions,
  aaActionsOpen,
  toggleAAActionsMenu,
  collapsed,
  toggleMobileSidebar
}) => {
  const isMobile = useIsMobile();
  const navigate = useNavigate();
  const location = useLocation();

  const handleActionClick = (href: string) => {
    navigate(href);
    
    // If on mobile, close the sidebar
    if (isMobile && toggleMobileSidebar) {
      toggleMobileSidebar();
    }
  };

  if (collapsed) {
    return (
      <div className="pt-2">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <div
                className={cn(
                  "flex items-center justify-center p-2 rounded-md hover:bg-accent/30 cursor-pointer",
                  location.pathname.startsWith('/aa') && "bg-accent/20"
                )}
                onClick={() => navigate('/aa/library')}
              >
                <Wallet className="h-5 w-5" />
              </div>
            </TooltipTrigger>
            <TooltipContent side="right">AA Wallet Quick Actions</TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
    );
  }

  return (
    <div className="pt-2">
      <Collapsible
        open={aaActionsOpen}
        onOpenChange={toggleAAActionsMenu}
        className="border-t pt-2"
      >
        <CollapsibleTrigger className="flex w-full items-center justify-between p-2 hover:bg-accent/30 rounded-md">
          <div className="flex items-center">
            <Wallet className="h-5 w-5 mr-2" />
            <span className="text-sm font-medium">AA Quick Actions</span>
          </div>
          <ChevronDown className={cn(
            "h-4 w-4 transition-transform",
            aaActionsOpen && "transform rotate-180"
          )} />
        </CollapsibleTrigger>
        <CollapsibleContent className="mt-1 space-y-1 px-2">
          {aaQuickActions.map((action) => {
            const Icon = action.icon;
            const isActive = location.pathname === action.href || 
              (action.href.includes('?tab=purchases') && location.pathname === '/aa/library' && location.search.includes('tab=purchases'));
            
            return (
              <div 
                key={action.id}
                className={cn(
                  "flex items-center px-2 py-2 text-sm rounded-md hover:bg-accent/30 cursor-pointer transition-colors",
                  isActive && "bg-accent/20"
                )}
                onClick={() => handleActionClick(action.href)}
              >
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div className="flex items-center flex-1">
                        <Icon className="h-4 w-4 mr-2" />
                        <span>{action.name}</span>
                      </div>
                    </TooltipTrigger>
                    <TooltipContent side="top" align="center">
                      <div className="space-y-1">
                        <div className="font-semibold">{action.name}</div>
                        <div className="text-xs">{action.description}</div>
                      </div>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
            );
          })}
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
};

export default AAQuickActionsSection;
