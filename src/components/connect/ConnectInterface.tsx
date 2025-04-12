
import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import AgentInterface from '@/components/shared/AgentInterface';
import MetaQubeDisplay from '@/components/shared/MetaQubeDisplay';
import { MetaQube, CommunityMetrics } from '@/lib/types';
import ConnectDashboard from '@/components/connect/ConnectDashboard';
import MemberDetail from '@/components/connect/MemberDetail';
import GroupDetail from '@/components/connect/GroupDetail';
import EventDetail from '@/components/connect/EventDetail';
import MessageDetail from '@/components/connect/MessageDetail';
import { connectData } from '@/components/connect/data/connectData';

interface ConnectInterfaceProps {
  metaQube: MetaQube;
  communityMetrics: CommunityMetrics;
}

const ConnectInterface = ({ metaQube, communityMetrics }: ConnectInterfaceProps) => {
  const [selectedTab, setSelectedTab] = useState<string | undefined>(undefined);
  const [currentItemIndex, setCurrentItemIndex] = useState(0);
  
  const { members, groups, events, messages } = connectData;

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

  const getCurrentItems = () => {
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
  };

  const renderDetailPanel = () => {
    const currentItems = getCurrentItems();
    if (currentItems.length === 0) return null;
    
    const current = currentItems[currentItemIndex];
    
    if (!current) return null;

    switch(current.type) {
      case 'member':
        return <MemberDetail member={current} currentIndex={currentItemIndex} totalItems={currentItems.length} onNext={goToNext} onPrev={goToPrev} />;
      case 'group':
        return <GroupDetail group={current} currentIndex={currentItemIndex} totalItems={currentItems.length} onNext={goToNext} onPrev={goToPrev} />;
      case 'event':
        return <EventDetail event={current} currentIndex={currentItemIndex} totalItems={currentItems.length} onNext={goToNext} onPrev={goToPrev} />;
      case 'message':
        return <MessageDetail message={current} currentIndex={currentItemIndex} totalItems={currentItems.length} onNext={goToNext} onPrev={goToPrev} />;
      default:
        return null;
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-full">
      <div className="lg:col-span-2 flex flex-col">
        <AgentInterface
          title="Connection Assistant"
          description="Community insights and networking opportunities"
          agentType="connect"
          initialMessages={[
            {
              id: "1",
              sender: "agent",
              message: "Welcome to your Connect dashboard. Based on your iQube profile, I've identified several community members with similar interests in DeFi and NFTs. Would you like me to suggest potential connections or keep you updated on upcoming events?",
              timestamp: new Date().toISOString(),
            }
          ]}
        />
      </div>

      <div className="space-y-6 flex flex-col">
        <div className="py-2 border rounded-lg shadow-sm bg-card">
          <div className="px-6">
            <MetaQubeDisplay metaQube={metaQube} compact={true} />
          </div>
        </div>

        <div className="flex-grow">
          {selectedTab ? renderDetailPanel() : <ConnectDashboard communityMetrics={communityMetrics} members={members.slice(0, 2)} />}
        </div>
      </div>

      <div className="lg:col-span-3">
        <Tabs value={selectedTab || ''}>
          <TabsList className="w-full grid grid-cols-4">
            <TabsTrigger 
              value="members" 
              onClick={() => handleTabChange('members')}
              data-state={selectedTab === 'members' ? 'active' : ''}
            >
              Community
            </TabsTrigger>
            <TabsTrigger 
              value="groups" 
              onClick={() => handleTabChange('groups')}
              data-state={selectedTab === 'groups' ? 'active' : ''}
            >
              Groups
            </TabsTrigger>
            <TabsTrigger 
              value="events" 
              onClick={() => handleTabChange('events')}
              data-state={selectedTab === 'events' ? 'active' : ''}
            >
              Events
            </TabsTrigger>
            <TabsTrigger 
              value="messages" 
              onClick={() => handleTabChange('messages')}
              data-state={selectedTab === 'messages' ? 'active' : ''}
            >
              Messages
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>
    </div>
  );
};

export default ConnectInterface;
