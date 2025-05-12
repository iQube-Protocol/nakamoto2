
import React from 'react';
import { Link } from 'react-router-dom';
import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface NavItemProps {
  icon: LucideIcon;
  href: string;
  children: React.ReactNode;
  active?: boolean;
  collapsed?: boolean;
  onClick?: () => void;
  onNavigate?: () => void;
}

const NavItem: React.FC<NavItemProps> = ({
  icon: Icon,
  href,
  children,
  active,
  collapsed,
  onClick,
  onNavigate,
}) => {
  const handleClick = (e: React.MouseEvent) => {
    if (onClick) onClick();
    if (onNavigate) onNavigate();
  };

  const content = (
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
  );

  if (collapsed) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            {content}
          </TooltipTrigger>
          <TooltipContent side="right">
            {children}
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  return content;
};

export default NavItem;
