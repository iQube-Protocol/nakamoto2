
import React from 'react';
import { X } from 'lucide-react';
import { MetaQube } from '@/lib/types';
import MetaQubeDisplay from '@/components/shared/MetaQubeDisplay';
import ScoreTooltip from '@/components/shared/ScoreTooltips';
import CubeIcon from './CubeIcon';
import { Link } from 'react-router-dom';
import { cn } from '@/lib/utils';

interface MetaQubeItemProps {
  metaQube?: MetaQube;
  qubeName: string;
  active: boolean;
  selected: boolean;
  onClick: () => void;
  onToggleActive?: (e: React.MouseEvent<HTMLDivElement>) => void;
  collapsed?: boolean;
  onClose?: (e: React.MouseEvent<HTMLButtonElement>) => void;
  className?: string;
  tooltipType?: 'dataQube' | 'agentQube';
}

const MetaQubeItem = ({
  metaQube,
  qubeName,
  active,
  selected,
  onClick,
  onToggleActive,
  collapsed = false,
  onClose,
  className = '',
  tooltipType = 'dataQube'
}: MetaQubeItemProps) => {
  const isPurple = tooltipType === 'agentQube';
  
  if (collapsed) {
    return (
      <div className="relative">
        <ScoreTooltip type={tooltipType}>
          <Link 
            to="/settings" 
            className={cn(
              "flex items-center justify-center py-3 px-3 rounded-md transition-all",
              isPurple ? "hover:bg-purple-500/20 bg-purple-500/10" : "hover:bg-iqube-primary/20 bg-iqube-primary/10"
            )}
            onClick={onClick}
          >
            <div className={cn("h-6 w-6", isPurple ? "text-purple-500" : "text-iqube-primary")}>
              <CubeIcon />
            </div>
          </Link>
        </ScoreTooltip>
        {onClose && (
          <button
            onClick={onClose}
            className="absolute top-0 right-0 p-1 rounded-full hover:bg-gray-200 text-gray-500 hover:text-gray-700"
          >
            <X className="h-3 w-3" />
          </button>
        )}
      </div>
    );
  }
  
  // Use metaQube if available, otherwise use simple version with just qubeName
  if (metaQube) {
    return (
      <div className={cn(
        "rounded-md relative",
        isPurple ? "bg-purple-500/10" : "bg-iqube-primary/10",
        className
      )}>
        <MetaQubeDisplay 
          metaQube={metaQube} 
          compact={true}
          onClick={onClick}
          className={cn(
            "cursor-pointer transition-colors",
            isPurple ? "hover:bg-purple-500/20" : "hover:bg-iqube-primary/20"
          )}
        />
        {onClose && (
          <button
            onClick={onClose}
            className="absolute top-2 right-2 p-1 rounded-full hover:bg-gray-200 text-gray-500 hover:text-gray-700"
          >
            <X className="h-3 w-3" />
          </button>
        )}
      </div>
    );
  }
  
  // Simple version when no metaQube is provided
  return (
    <div 
      className={cn(
        "flex items-center justify-between rounded-md px-2 py-1.5 text-sm",
        selected ? 'bg-accent/30 font-medium' : 'hover:bg-accent/20',
        active ? 'text-green-500' : '',
        className
      )}
      onClick={onClick}
    >
      <div className="flex items-center">
        <div className={cn("h-2.5 w-2.5 rounded-full mr-2", active ? 'bg-green-500' : 'bg-gray-400')} />
        <span>{qubeName}</span>
      </div>
      {onToggleActive && (
        <div 
          className="h-4 w-4 rounded hover:bg-accent/50 cursor-pointer flex items-center justify-center"
          onClick={onToggleActive}
        >
          <div className={cn("h-2 w-2 rounded-full", active ? 'bg-green-500' : 'bg-gray-300')} />
        </div>
      )}
    </div>
  );
};

export default MetaQubeItem;
