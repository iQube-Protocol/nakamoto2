
import React, { useState } from 'react';
import { MetaQube, CommunityMetrics, BlakQube } from '@/lib/types';
import AgentPanel from './AgentPanel';
import DetailPanel from './panels/DetailPanel';
import DashboardPanel from './panels/DashboardPanel';
import CollapsedSidebar from './CollapsedSidebar';
import TabsNavigation from './TabsNavigation';
import { ConnectItem } from './types';
import { members, groups, events, messages } from './data/connectData';

interface ConnectInterfaceProps {
  communityMetrics: CommunityMetrics;
  metaQube: MetaQube;
  blakQube?: BlakQube;
}

const ConnectInterface = ({ communityMetrics, metaQube, blakQube }: ConnectInterfaceProps) => {
  const [selectedTab, setSelectedTab] = useState<string | undefined>(undefined);
  const [currentItemIndex, setCurrentItemIndex] = useState(0);
  const [isPanelCollapsed, setIsPanelCollapsed] = useState<boolean>(true);

  const goToPrev = () => {
    const currentItems = getCurrentItems();
    setCurrentItemIndex((prevIndex) => 
      prevIndex === 0 ? currentItems.length - 1 : prevIndex - 1
    );
  };

  const goToNext = () => {
    const currentItems = getCurrentItems();
    setCurrentItemIndex((prevIndex) => 
      prevIndex === currentItems.length - 1 ? 0 : prevIndex + 1
    );
  };

  const getCurrentItems = (): ConnectItem[] => {
    switch(selectedTab) {
      case 'members':
        return members;
      case 'groups':
        return groups;
      case 'events':
        return events;
      case 'messages':
        return messages;
      default:
        return [];
    }
  };

  const handleTabChange = (value: string) => {
    if (value === selectedTab) {
      setSelectedTab(undefined);
      return;
    }
    setSelectedTab(value);
    setCurrentItemIndex(0);
    setIsPanelCollapsed(false);
  };

  const togglePanelCollapse = () => {
    setIsPanelCollapsed(!isPanelCollapsed);
  };

  return (
    <div className="grid grid-cols-12 gap-6 h-full">
      <div className={isPanelCollapsed ? "col-span-11" : "col-span-8"}>
        <AgentPanel
          communityMetrics={communityMetrics}
          metaQube={metaQube}
          blakQube={blakQube}
          isPanelCollapsed={isPanelCollapsed}
        />
      </div>

      <div className={isPanelCollapsed ? "col-span-1" : "col-span-4"}>
        {isPanelCollapsed ? (
          <CollapsedSidebar 
            selectedTab={selectedTab} 
            togglePanelCollapse={togglePanelCollapse} 
            handleTabChange={handleTabChange}
          />
        ) : (
          <div className="space-y-6 flex flex-col">
            <div className="flex-grow">
              {selectedTab ? 
                <DetailPanel
                  selectedTab={selectedTab}
                  currentItemIndex={currentItemIndex}
                  currentItems={getCurrentItems()}
                  goToPrev={goToPrev}
                  goToNext={goToNext}
                  togglePanelCollapse={togglePanelCollapse}
                /> : 
                <DashboardPanel 
                  communityMetrics={communityMetrics} 
                  togglePanelCollapse={togglePanelCollapse} 
                  members={members}
                />
              }
            </div>
          </div>
        )}
      </div>

      <div className="col-span-12">
        <TabsNavigation 
          selectedTab={selectedTab} 
          handleTabChange={handleTabChange} 
        />
      </div>
    </div>
  );
};

export default ConnectInterface;
