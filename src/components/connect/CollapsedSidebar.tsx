
import React from 'react';
import { Button } from '@/components/ui/button';
import { ChevronLeft, Users, Calendar, MessageSquare } from 'lucide-react';

interface CollapsedSidebarProps {
  selectedTab: string | undefined;
  togglePanelCollapse: () => void;
  handleTabChange: (value: string) => void;
}

const CollapsedSidebar: React.FC<CollapsedSidebarProps> = ({
  selectedTab,
  togglePanelCollapse,
  handleTabChange,
}) => {
  return (
    <div className="border-l h-full flex flex-col items-center justify-start p-2">
      <Button
        variant="ghost"
        size="icon"
        onClick={togglePanelCollapse}
        className="mt-4"
      >
        <ChevronLeft className="h-6 w-6" />
      </Button>
      
      <div className="mt-6 flex flex-col space-y-6">
        <Button
          variant={selectedTab === 'members' ? 'secondary' : 'ghost'}
          size="icon"
          className={`p-2 ${selectedTab === 'members' ? 'bg-iqube-primary/20' : ''}`}
          onClick={() => handleTabChange('members')}
          title="Community"
        >
          <Users className="h-6 w-6" />
        </Button>
        
        <Button
          variant={selectedTab === 'groups' ? 'secondary' : 'ghost'}
          size="icon"
          className={`p-2 ${selectedTab === 'groups' ? 'bg-iqube-primary/20' : ''}`}
          onClick={() => handleTabChange('groups')}
          title="Groups"
        >
          <Users className="h-6 w-6" />
        </Button>
        
        <Button
          variant={selectedTab === 'events' ? 'secondary' : 'ghost'}
          size="icon"
          className={`p-2 ${selectedTab === 'events' ? 'bg-iqube-primary/20' : ''}`}
          onClick={() => handleTabChange('events')}
          title="Events"
        >
          <Calendar className="h-6 w-6" />
        </Button>
        
        <Button
          variant={selectedTab === 'messages' ? 'secondary' : 'ghost'}
          size="icon"
          className={`p-2 ${selectedTab === 'messages' ? 'bg-iqube-primary/20' : ''}`}
          onClick={() => handleTabChange('messages')}
          title="Messages"
        >
          <MessageSquare className="h-6 w-6" />
        </Button>
      </div>
    </div>
  );
};

export default CollapsedSidebar;
