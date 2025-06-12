
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
}) => {
  const iqubeId = metaQube["iQube-Identifier"];
  const isAgentQube = tooltipType === 'agentQube';
  const isModelQube = tooltipType === 'modelQube';
  
  // Determine color scheme based on qube type
  const getColorClasses = () => {
    if (isModelQube) {
      return {
        text: "text-blue-500",
        bgHover: "hover:bg-blue-500/20",
        bg: "bg-blue-500/10"
      };
    } else if (isAgentQube) {
      return {
        text: "text-purple-500", 
        bgHover: "hover:bg-purple-500/20",
        bg: "bg-purple-500/10"
      };
    } else {
      return {
        text: "text-iqube-primary",
        bgHover: "hover:bg-iqube-primary/20", 
        bg: "bg-iqube-primary/10"
      };
    }
  };

  const colorClasses = getColorClasses();
  
  if (collapsed) {
    return (
      <div className="relative">
        <ScoreTooltip type={tooltipType}>
          <Link 
            to="/settings" 
            className={`flex items-center justify-center py-3 px-3 rounded-md transition-all ${colorClasses.bgHover} ${colorClasses.bg}`}
            onClick={() => onIQubeClick(iqubeId)}
          >
            <div className={`${colorClasses.text} h-6 w-6`}>
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
    <div className={`${colorClasses.bg} rounded-md relative ${className}`}>
      <MetaQubeDisplay 
        metaQube={metaQube} 
        compact={true}
        onClick={() => onIQubeClick(iqubeId)}
        className={`cursor-pointer ${colorClasses.bgHover} transition-colors`}
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
