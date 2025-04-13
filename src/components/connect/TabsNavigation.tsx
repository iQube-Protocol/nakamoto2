
import React from 'react';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface TabsNavigationProps {
  selectedTab: string | undefined;
  handleTabChange: (value: string) => void;
}

const TabsNavigation: React.FC<TabsNavigationProps> = ({
  selectedTab,
  handleTabChange,
}) => {
  return (
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
  );
};

export default TabsNavigation;
