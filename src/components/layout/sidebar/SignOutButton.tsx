
import React from 'react';
import { cn } from '@/lib/utils';
import { LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface SignOutButtonProps {
  collapsed: boolean;
  onSignOut: () => void;
}

const SignOutButton: React.FC<SignOutButtonProps> = ({ collapsed, onSignOut }) => {
  return (
    <div className="mt-2 pt-2 border-t">
      <Button 
        variant="ghost"
        size={collapsed ? "icon" : "sm"}
        onClick={onSignOut}
        className={cn(
          "w-full flex items-center text-sm text-muted-foreground hover:text-foreground",
          collapsed ? "justify-center" : "justify-start"
        )}
      >
        <LogOut className={cn("h-5 w-5", collapsed ? "" : "mr-2")} />
        {!collapsed && <span>Sign out</span>}
      </Button>
    </div>
  );
};

export default SignOutButton;
