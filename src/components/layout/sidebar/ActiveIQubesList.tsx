
import React from 'react';
import SimpleActiveQubeItem from './SimpleActiveQubeItem';
import { qubeData } from '@/components/settings/QubeData';

interface ActiveIQubesListProps {
  collapsed: boolean;
  activeIQubes: { [key: string]: boolean };
  handleIQubeClick: (iqubeId: string) => void;
  handleCloseMetisIQube: (e: React.MouseEvent<HTMLButtonElement>) => void;
}

const ActiveIQubesList = ({ 
  collapsed, 
  activeIQubes, 
  handleIQubeClick, 
  handleCloseMetisIQube 
}: ActiveIQubesListProps) => {
  return (
    <div className="space-y-2">
      {/* Qrypto Persona - Always visible */}
      <SimpleActiveQubeItem
        metaQube={qubeData.monDai}
        collapsed={collapsed}
        onIQubeClick={handleIQubeClick}
        tooltipType="dataQube"
      />
      
      {/* Venice - Show when active */}
      {activeIQubes["Venice"] && (
        <SimpleActiveQubeItem
          metaQube={qubeData.venice}
          collapsed={collapsed}
          onIQubeClick={handleIQubeClick}
          tooltipType="modelQube"
        />
      )}
      
      {/* Metis - Show when active with close button */}
      {activeIQubes["Metis"] && (
        <SimpleActiveQubeItem
          metaQube={qubeData.metis}
          collapsed={collapsed}
          onIQubeClick={handleIQubeClick}
          onClose={handleCloseMetisIQube}
          tooltipType="agentQube"
        />
      )}
    </div>
  );
};

export default ActiveIQubesList;
