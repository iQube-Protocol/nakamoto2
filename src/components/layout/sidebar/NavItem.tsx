
import React from 'react';
import { Link } from 'react-router-dom';
import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useIsMobile } from '@/hooks/use-mobile';

interface NavItemProps {
  icon: LucideIcon;
  href: string;
  children: React.ReactNode;
  active?: boolean;
  collapsed?: boolean;
  onClick?: () => void;
  toggleMobileSidebar?: () => void;
}

const NavItem: React.FC<NavItemProps> = ({
  icon: Icon,
  href,
  children,
  active,
  collapsed,
  onClick,
  toggleMobileSidebar,
}) => {
  const isMobile = useIsMobile();
  
  const handleClick = () => {
    // Call the original onClick if provided
    if (onClick) {
      onClick();
      return; // Don't navigate if onClick is provided
    }
    
    // If we're on mobile, also close the sidebar
    if (isMobile && toggleMobileSidebar) {
      toggleMobileSidebar();
    }
  };
  
  const content = (
    <div
      onClick={onClick ? handleClick : undefined}
      className={cn(
        "flex items-center rounded-md p-2 text-sm hover:bg-accent/30",
        active && "bg-accent/20 text-white font-medium", // Ensure text stays white in active state
        collapsed ? "justify-center" : "",
        onClick ? "cursor-pointer" : ""
      )}
    >
      <Icon className={cn("h-5 w-5", active && "text-white", collapsed ? "" : "mr-2")} />
      {!collapsed && <span>{children}</span>}
    </div>
  );

  // If there's no onClick handler, wrap in Link
  const linkContent = !onClick ? (
    <Link
      to={href}
      onClick={handleClick}
      className={cn(
        "flex items-center rounded-md p-2 text-sm hover:bg-accent/30",
        active && "bg-accent/20 text-white font-medium", // Ensure text stays white in active state
        collapsed ? "justify-center" : ""
      )}
    >
      <Icon className={cn("h-5 w-5", active && "text-white", collapsed ? "" : "mr-2")} />
      {!collapsed && <span>{children}</span>}
    </Link>
  ) : content;

  if (collapsed) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            {linkContent}
          </TooltipTrigger>
          <TooltipContent side="right">
            {children}
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  return linkContent;
};

export default NavItem;
