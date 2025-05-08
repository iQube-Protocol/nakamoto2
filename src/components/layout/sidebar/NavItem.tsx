
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
}

const NavItem: React.FC<NavItemProps> = ({
  icon: Icon,
  href,
  children,
  active,
  collapsed,
  onClick,
}) => {
  const content = (
    <Link
      to={href}
      onClick={onClick}
      className={cn(
        "flex items-center rounded-md p-2 text-sm hover:bg-accent/30",
        active && "bg-accent/20 text-accent-foreground",
        collapsed ? "justify-center" : ""
      )}
    >
      <Icon className={cn("h-5 w-5", collapsed ? "" : "mr-2")} />
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
