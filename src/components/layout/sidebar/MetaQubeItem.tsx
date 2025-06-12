
import React from 'react';
import { X } from 'lucide-react';
import { MetaQube } from '@/lib/types';
import MetaQubeDisplay from '@/components/shared/MetaQubeDisplay';
import ScoreTooltip from '@/components/shared/ScoreTooltips';
import CubeIcon from './CubeIcon';
import { Link } from 'react-router-dom';

interface MetaQubeItemProps {
  metaQube: MetaQube;
  collapsed: boolean;
  onIQubeClick: (iqubeId: string) => void;
  onClose?: (e: React.MouseEvent<HTMLButtonElement>) => void;
  className?: string;
  tooltipType?: 'dataQube' | 'agentQube' | 'modelQube';
}

const MetaQubeItem = ({
  metaQube,
  collapsed,
  onIQubeClick,
  onClose,
  className = '',
  tooltipType = 'dataQube'
}: MetaQubeItemProps) => {
  const iqubeId = metaQube["iQube-Identifier"];
  const isPurple = tooltipType === 'agentQube';
  const isGreen = tooltipType === 'modelQube';
  
  // Determine color scheme based on tooltip type
  const getColorScheme = () => {
    if (isPurple) return { bg: "purple-500/10", hover: "purple-500/20", text: "purple-500" };
    if (isGreen) return { bg: "green-500/10", hover: "green-500/20", text: "green-500" };
    return { bg: "iqube-primary/10", hover: "iqube-primary/20", text: "iqube-primary" };
  };
  
  const colors = getColorScheme();
  
  if (collapsed) {
    return (
      <div className="relative">
        <ScoreTooltip type={tooltipType}>
          <Link 
            to="/settings" 
            className={`flex items-center justify-center py-3 px-3 rounded-md transition-all hover:bg-${colors.hover} bg-${colors.bg}`}
            onClick={() => onIQubeClick(iqubeId)}
          >
            <div className={`text-${colors.text} h-6 w-6`}>
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
  
  return (
    <div className={`bg-${colors.bg} rounded-md relative ${className}`}>
      <MetaQubeDisplay 
        metaQube={metaQube} 
        compact={true}
        onClick={() => onIQubeClick(iqubeId)}
        className={`cursor-pointer hover:bg-${colors.hover} transition-colors`}
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
};

export default MetaQubeItem;
