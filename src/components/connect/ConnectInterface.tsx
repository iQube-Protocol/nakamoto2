
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Users, 
  Calendar, 
  MessageSquare, 
  Activity,
  UserPlus,
  CheckCheck,
  ArrowUpRight,
  MapPin,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import AgentInterface from '@/components/shared/AgentInterface';
import MetaQubeDisplay from '@/components/shared/MetaQubeDisplay';
import { MetaQube, CommunityMetrics } from '@/lib/types';

interface ConnectInterfaceProps {
  metaQube: MetaQube;
  communityMetrics: CommunityMetrics;
}

interface Member {
  id: number;
  name: string;
  role: string;
  avatar: string;
  interests: string[];
  type: 'member';
}

interface Group {
  id: number;
  name: string;
  members: number;
  activity: string;
  type: 'group';
}

interface Event {
  id: number;
  title: string;
  date: string;
  location: string;
  attendees: number;
  type: 'event';
}

interface Message {
  id: number;
  sender: string;
  content: string;
  timestamp: string;
  unread: boolean;
  type: 'message';
}

type ConnectItem = Member | Group | Event | Message;

const ConnectInterface = ({ metaQube, communityMetrics }: ConnectInterfaceProps) => {
  const [selectedTab, setSelectedTab] = useState<string | undefined>(undefined);
  const [currentItemIndex, setCurrentItemIndex] = useState(0);

  const members: Member[] = [
    { id: 1, name: 'Alex Chen', role: 'Developer', avatar: '', interests: ['DeFi', 'Smart Contracts'], type: 'member' },
    { id: 2, name: 'Mia Wong', role: 'Designer', avatar: '', interests: ['NFTs', 'DAO'], type: 'member' },
    { id: 3, name: 'Sam Johnson', role: 'Product', avatar: '', interests: ['DeFi', 'Governance'], type: 'member' },
    { id: 4, name: 'Jamie Smith', role: 'Researcher', avatar: '', interests: ['Privacy', 'Zero Knowledge'], type: 'member' },
    { id: 5, name: 'Taylor Kim', role: 'Educator', avatar: '', interests: ['Education', 'Onboarding'], type: 'member' },
  ];

  const events: Event[] = [
    { 
      id: 1, 
      title: 'Web3 Community Meetup', 
      date: '2025-04-15T18:00:00', 
      location: 'Virtual',
      attendees: 42,
      type: 'event'
    },
    { 
      id: 2, 
      title: 'NFT Showcase', 
      date: '2025-04-20T15:00:00', 
      location: 'New York',
      attendees: 75,
      type: 'event'
    },
    { 
      id: 3, 
      title: 'DeFi Workshop', 
      date: '2025-04-25T10:00:00', 
      location: 'London',
      attendees: 28,
      type: 'event'
    },
  ];

  const groups: Group[] = [
    { id: 1, name: 'DeFi Enthusiasts', members: 120, activity: 'High', type: 'group' },
    { id: 2, name: 'NFT Creators', members: 85, activity: 'Medium', type: 'group' },
    { id: 3, name: 'DAO Governance', members: 64, activity: 'High', type: 'group' },
    { id: 4, name: 'Privacy Advocates', members: 42, activity: 'Low', type: 'group' },
  ];

  const messages: Message[] = [
    { id: 1, sender: 'Alex Chen', content: 'Hey! Saw your post about DeFi protocols. Would love to chat.', timestamp: '2025-04-10T14:30:00', unread: true, type: 'message' },
    { id: 2, sender: 'DAO Governance', content: 'New proposal available for voting. Check it out!', timestamp: '2025-04-09T09:15:00', unread: true, type: 'message' },
    { id: 3, sender: 'Mia Wong', content: 'Thanks for connecting! Looking forward to collaborating.', timestamp: '2025-04-08T16:45:00', unread: false, type: 'message' },
    { id: 4, sender: 'DeFi Enthusiasts', content: 'Welcome to the group! Introduce yourself.', timestamp: '2025-04-07T11:20:00', unread: false, type: 'message' },
  ];

  const isMember = (item: ConnectItem): item is Member => item.type === 'member';
  const isGroup = (item: ConnectItem): item is Group => item.type === 'group';
  const isEvent = (item: ConnectItem): item is Event => item.type === 'event';
  const isMessage = (item: ConnectItem): item is Message => item.type === 'message';

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase();
  };

  const getRandomColorClass = (id: number) => {
    const colors = [
      'bg-blue-500',
      'bg-green-500',
      'bg-purple-500',
      'bg-amber-500',
      'bg-pink-500',
      'bg-indigo-500',
      'bg-rose-500',
    ];
    return colors[id % colors.length];
  };

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
  };

  const renderDetailPanel = () => {
    const currentItems = getCurrentItems();
    if (currentItems.length === 0) return null;
    
    const current = currentItems[currentItemIndex];
    
    if (!current) return null;

    return (
      <Card className="h-full">
        <CardHeader className="pb-2 flex flex-row items-center justify-between">
          <CardTitle className="text-lg">
            {selectedTab === 'members' && 'Community Member'}
            {selectedTab === 'groups' && 'Group'}
            {selectedTab === 'events' && 'Event'}
            {selectedTab === 'messages' && 'Message'}
          </CardTitle>
          <div className="flex items-center space-x-2">
            <Button 
              variant="outline" 
              size="icon" 
              className="h-8 w-8" 
              onClick={goToPrev}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="text-sm font-medium">{currentItemIndex + 1}/{currentItems.length}</span>
            <Button 
              variant="outline" 
              size="icon" 
              className="h-8 w-8" 
              onClick={goToNext}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="pt-4">
          {isMember(current) && (
            <div className="flex flex-col">
              <div className="flex items-center mb-4">
                <Avatar className="h-12 w-12 mr-3">
                  <AvatarImage src={current.avatar} />
                  <AvatarFallback className={getRandomColorClass(current.id)}>
                    {getInitials(current.name)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="font-medium">{current.name}</h3>
                  <p className="text-sm text-muted-foreground">{current.role}</p>
                </div>
              </div>
              <div className="mb-4">
                <h4 className="text-sm font-medium mb-2">Interests</h4>
                <div className="flex flex-wrap gap-2">
                  {current.interests.map((interest, i) => (
                    <Badge key={i} variant="outline" className="bg-iqube-primary/5">
                      {interest}
                    </Badge>
                  ))}
                </div>
              </div>
              <div className="flex space-x-2 mt-auto pt-4">
                <Button size="sm" className="flex-1 bg-iqube-primary hover:bg-iqube-primary/90">
                  Connect
                </Button>
                <Button size="sm" variant="outline" className="flex-1">
                  Message
                </Button>
              </div>
            </div>
          )}
          
          {isGroup(current) && (
            <div>
              <div className="bg-iqube-primary/20 w-12 h-12 rounded-full flex items-center justify-center mb-4">
                <Users className="h-6 w-6 text-iqube-primary" />
              </div>
              <h3 className="font-semibold mb-1">{current.name}</h3>
              <div className="flex items-center text-sm text-muted-foreground mb-3">
                <Users className="h-4 w-4 mr-1" />
                {current.members} members
              </div>
              <div className="flex items-center text-sm mb-4">
                <div 
                  className={`w-2 h-2 rounded-full mr-2 ${
                    current.activity === 'High' ? 'bg-green-500' :
                    current.activity === 'Medium' ? 'bg-amber-500' :
                    'bg-gray-400'
                  }`}
                ></div>
                <span className="text-muted-foreground">
                  {current.activity} activity
                </span>
              </div>
              <Button 
                variant={current.id % 2 === 0 ? "outline" : "default"} 
                className={`w-full ${
                  current.id % 2 !== 0 ? "bg-iqube-primary hover:bg-iqube-primary/90" : ""
                }`}
              >
                {current.id % 2 === 0 ? "Leave Group" : "Join Group"}
              </Button>
            </div>
          )}
          
          {isEvent(current) && (
            <div>
              <div className="h-32 bg-gradient-to-r from-iqube-primary/30 to-iqube-accent/30 flex items-center justify-center">
                <Calendar className="h-12 w-12 text-iqube-primary" />
              </div>
              <div className="mt-4">
                <h3 className="font-semibold mb-1">{current.title}</h3>
                <div className="flex items-center text-sm text-muted-foreground mb-3">
                  <Calendar className="h-4 w-4 mr-1" />
                  {formatDate(current.date)}
                </div>
                <div className="flex justify-between items-center">
                  <div className="flex items-center text-sm text-muted-foreground">
                    <MapPin className="h-4 w-4 mr-1" />
                    {current.location}
                  </div>
                  <div className="flex items-center text-sm text-muted-foreground">
                    <Users className="h-4 w-4 mr-1" />
                    {current.attendees}
                  </div>
                </div>
                <Button className="w-full mt-4 bg-iqube-primary hover:bg-iqube-primary/90">
                  RSVP
                </Button>
              </div>
            </div>
          )}
          
          {isMessage(current) && (
            <div>
              <div className="flex items-center mb-4">
                <Avatar className="h-12 w-12 mr-3">
                  <AvatarFallback className={getRandomColorClass(current.id)}>
                    {getInitials(current.sender)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <h3 className="font-medium flex items-center">
                    {current.sender}
                    {current.unread && <Badge className="ml-2 px-1 py-0 h-4 bg-iqube-accent text-[10px]">New</Badge>}
                  </h3>
                  <p className="text-xs text-muted-foreground">{formatDate(current.timestamp)}</p>
                </div>
              </div>
              <Card className="p-3 bg-muted/30 mb-4">
                <p className="text-sm">{current.content}</p>
              </Card>
              <div className="flex justify-between mt-auto pt-4">
                <Button size="sm" variant="outline" className="flex-1 mr-2">
                  Mark {current.unread ? 'Read' : 'Unread'}
                </Button>
                <Button size="sm" className="flex-1 bg-iqube-primary hover:bg-iqube-primary/90">
                  Reply
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    );
  };

  const renderDashboard = () => {
    return (
      <Card className="h-full">
        <CardHeader>
          <CardTitle className="text-lg flex items-center">
            <Activity className="mr-2 h-5 w-5 text-iqube-accent" />
            Connect Dashboard
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-3 mt-2">
            <Card className="p-3">
              <div className="text-xl font-bold">{communityMetrics.totalConnections}</div>
              <div className="text-xs text-muted-foreground">Total Connections</div>
            </Card>
            <Card className="p-3">
              <div className="text-xl font-bold">{communityMetrics.groupsJoined}</div>
              <div className="text-xs text-muted-foreground">Groups Joined</div>
            </Card>
            <Card className="p-3">
              <div className="text-xl font-bold">{communityMetrics.unreadMessages}</div>
              <div className="text-xs text-muted-foreground">Unread Messages</div>
            </Card>
            <Card className="p-3">
              <div className="text-xl font-bold">{communityMetrics.totalMembers}</div>
              <div className="text-xs text-muted-foreground">Community Members</div>
            </Card>
          </div>

          <div className="pt-2">
            <h3 className="font-medium mb-3">Suggested Connections</h3>
            <div className="space-y-3">
              {members.slice(0, 2).map((member) => (
                <div key={member.id} className="flex items-center p-2 border rounded-md">
                  <Avatar className="h-8 w-8 mr-3">
                    <AvatarImage src={member.avatar} />
                    <AvatarFallback className={getRandomColorClass(member.id)}>
                      {getInitials(member.name)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="text-sm font-medium">{member.name}</div>
                    <div className="text-xs text-muted-foreground">{member.role}</div>
                  </div>
                  <Button size="sm" className="h-8">
                    <UserPlus className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    );
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
        <Card>
          <CardHeader className="pb-0">
            <CardTitle className="text-lg">MetaQube</CardTitle>
          </CardHeader>
          <CardContent>
            <MetaQubeDisplay metaQube={metaQube} compact={true} />
          </CardContent>
        </Card>

        <div className="flex-grow">
          {selectedTab ? renderDetailPanel() : renderDashboard()}
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
