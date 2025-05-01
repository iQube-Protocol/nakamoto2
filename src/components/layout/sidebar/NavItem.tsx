
import React from 'react';
import { NavLink } from 'react-router-dom';
import { cn } from '@/lib/utils';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger
} from "@/components/ui/tooltip";

interface NavItemProps {
  to: string;
  icon: React.ReactNode;
  label: string;
  collapsed: boolean;
  onClick?: () => void;
}

const NavItem = ({ to, icon, label, collapsed, onClick }: NavItemProps) => {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        cn(
          "flex items-center py-3 px-3 rounded-md transition-all hover:bg-iqube-primary/20 group",
          isActive ? "bg-iqube-primary/20 text-iqube-primary" : "text-sidebar-foreground"
        )
      }
      onClick={onClick}
    >
      {collapsed ? (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="flex items-center justify-center">
                <div className="text-xl">{icon}</div>
                <span className="sr-only">{label}</span>
              </div>
            </TooltipTrigger>
            <TooltipContent side="right">
              {label}
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      ) : (
        <>
          <div className="mr-3 text-xl">{icon}</div>
          <span>{label}</span>
        </>
      )}
    </NavLink>
  );
};

export default NavItem;
