
import React from 'react';
import { X } from 'lucide-react';
import { MetaQube } from '@/lib/types';
import ScoreTooltip from '@/components/shared/ScoreTooltips';
import CubeIcon from './CubeIcon';
import { Link } from 'react-router-dom';

interface SimpleActiveQubeItemProps {
  metaQube: MetaQube;
  collapsed: boolean;
  onIQubeClick: (iqubeId: string) => void;
  onClose?: (e: React.MouseEvent<HTMLButtonElement>) => void;
  tooltipType: 'dataQube' | 'agentQube' | 'modelQube';
}

const SimpleActiveQubeItem = ({
  metaQube,
  collapsed,
  onIQubeClick,
  onClose,
  tooltipType
}: SimpleActiveQubeItemProps) => {
  const iqubeId = metaQube["iQube-Identifier"];
  
  // Determine color scheme based on qube type
  const getColorClasses = () => {
    if (tooltipType === 'modelQube') {
      return {
        text: "text-blue-500",
        bgHover: "hover:bg-blue-500/20",
        bg: "bg-blue-500/10"
      };
    } else if (tooltipType === 'agentQube') {
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
    <div className={`${colorClasses.bg} rounded-md relative p-3 cursor-pointer ${colorClasses.bgHover} transition-colors`}>
      <Link 
        to="/settings" 
        className="flex items-center gap-3"
        onClick={() => onIQubeClick(iqubeId)}
      >
        <div className={`${colorClasses.text} h-5 w-5`}>
          <CubeIcon />
        </div>
        <span className="text-sm font-medium">{iqubeId}</span>
      </Link>
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

export default SimpleActiveQubeItem;
