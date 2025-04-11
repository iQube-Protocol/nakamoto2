
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  Users, 
  Calendar, 
  MessageSquare, 
  Bell, 
  UserPlus,
  CheckCheck,
  ArrowUpRight,
  MapPin,
  Activity,
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

const ConnectInterface = ({ metaQube, communityMetrics }: ConnectInterfaceProps) => {
  const [activeTab, setActiveTab] = useState<string | null>(null);
  const [currentItemIndex, setCurrentItemIndex] = useState(0);

  // Create some sample members
  const members = [
    { id: 1, name: 'Alex Chen', role: 'Developer', avatar: '', interests: ['DeFi', 'Smart Contracts'] },
    { id: 2, name: 'Mia Wong', role: 'Designer', avatar: '', interests: ['NFTs', 'DAO'] },
    { id: 3, name: 'Sam Johnson', role: 'Product', avatar: '', interests: ['DeFi', 'Governance'] },
    { id: 4, name: 'Jamie Smith', role: 'Researcher', avatar: '', interests: ['Privacy', 'Zero Knowledge'] },
    { id: 5, name: 'Taylor Kim', role: 'Educator', avatar: '', interests: ['Education', 'Onboarding'] },
  ];

  // Create some sample events
  const events = [
    { 
      id: 1, 
      title: 'Web3 Community Meetup', 
      date: '2025-04-15T18:00:00', 
      location: 'Virtual',
      attendees: 42
    },
    { 
      id: 2, 
      title: 'NFT Showcase', 
      date: '2025-04-20T15:00:00', 
      location: 'New York',
      attendees: 75
    },
    { 
      id: 3, 
      title: 'DeFi Workshop', 
      date: '2025-04-25T10:00:00', 
      location: 'London',
      attendees: 28
    },
  ];

  // Create some sample groups
  const groups = [
    { id: 1, name: 'DeFi Enthusiasts', members: 120, activity: 'High' },
    { id: 2, name: 'NFT Creators', members: 85, activity: 'Medium' },
    { id: 3, name: 'DAO Governance', members: 64, activity: 'High' },
    { id: 4, name: 'Privacy Advocates', members: 42, activity: 'Low' },
  ];

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

  const handleTabChange = (value: string) => {
    // If clicking the same tab, toggle it off
    if (activeTab === value) {
      setActiveTab(null);
    } else {
      setActiveTab(value);
      setCurrentItemIndex(0); // Reset to first item when changing tabs
    }
  };

  const handlePrevItem = () => {
    const items = activeTab === 'members' ? members : 
                 activeTab === 'groups' ? groups : 
                 events;
    setCurrentItemIndex(prev => 
      prev > 0 ? prev - 1 : items.length - 1
    );
  };

  const handleNextItem = () => {
    const items = activeTab === 'members' ? members : 
                 activeTab === 'groups' ? groups : 
                 events;
    setCurrentItemIndex(prev => 
      prev < items.length - 1 ? prev + 1 : 0
    );
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-full">
      <div className="lg:col-span-2">
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

      <div className="space-y-6 h-full max-h-full overflow-hidden flex flex-col">
        <div>
          <Tabs 
            defaultValue={activeTab || ""} 
            value={activeTab || ""}
            onValueChange={handleTabChange} 
            className="w-full"
          >
            <TabsList className="w-full grid grid-cols-3">
              <TabsTrigger value="members">Community</TabsTrigger>
              <TabsTrigger value="groups">Groups</TabsTrigger>
              <TabsTrigger value="events">Events</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        {!activeTab && (
          <Card className="flex-1 overflow-auto">
            <CardHeader>
              <CardTitle className="text-lg flex items-center">
                <Activity className="mr-2 h-5 w-5 text-iqube-accent" />
                Connect Dashboard
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <MetaQubeDisplay metaQube={metaQube} compact={true} />
              
              <div className="grid grid-cols-2 gap-3 mt-4">
                <Card className="p-3">
                  <div className="text-xl font-bold">{communityMetrics.totalConnections}</div>
                  <div className="text-xs text-muted-foreground">Total Connections</div>
                </Card>
                <Card className="p-3">
                  <div className="text-xl font-bold">{communityMetrics.groupsJoined}</div>
                  <div className="text-xs text-muted-foreground">Groups Joined</div>
                </Card>
                <Card className="p-3">
                  <div className="text-xl font-bold">{communityMetrics.upcomingEvents}</div>
                  <div className="text-xs text-muted-foreground">Upcoming Events</div>
                </Card>
                <Card className="p-3">
                  <div className="text-xl font-bold">{communityMetrics.unreadMessages}</div>
                  <div className="text-xs text-muted-foreground">Unread Messages</div>
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
              
              <div className="pt-2">
                <h3 className="font-medium mb-3">Upcoming Event</h3>
                <Card className="overflow-hidden">
                  <div className="h-20 bg-gradient-to-r from-iqube-primary/30 to-iqube-accent/30 flex items-center justify-center">
                    <Calendar className="h-10 w-10 text-iqube-primary" />
                  </div>
                  <CardContent className="pt-4">
                    <h3 className="font-semibold mb-1">{events[0].title}</h3>
                    <div className="flex items-center text-sm text-muted-foreground mb-2">
                      <Calendar className="h-4 w-4 mr-1" />
                      {formatDate(events[0].date)}
                    </div>
                    <Button className="w-full bg-iqube-primary hover:bg-iqube-primary/90 mt-2">
                      RSVP
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </CardContent>
          </Card>
        )}

        {activeTab === 'members' && (
          <Card className="flex-1 overflow-hidden">
            <CardHeader className="pb-0 flex flex-row items-center justify-between">
              <CardTitle className="text-lg">Community Members</CardTitle>
              <div className="flex items-center space-x-2">
                <Button 
                  variant="outline" 
                  size="icon" 
                  className="h-8 w-8" 
                  onClick={handlePrevItem}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <span className="text-sm font-medium">{currentItemIndex + 1}/{members.length}</span>
                <Button 
                  variant="outline" 
                  size="icon" 
                  className="h-8 w-8" 
                  onClick={handleNextItem}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="pt-4 overflow-auto h-full">
              {members[currentItemIndex] && (
                <Card key={members[currentItemIndex].id} className="flex flex-col">
                  <CardContent className="pt-6 flex-1">
                    <div className="flex items-center mb-4">
                      <Avatar className="h-12 w-12 mr-3">
                        <AvatarImage src={members[currentItemIndex].avatar} />
                        <AvatarFallback className={getRandomColorClass(members[currentItemIndex].id)}>
                          {getInitials(members[currentItemIndex].name)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <h3 className="font-medium">{members[currentItemIndex].name}</h3>
                        <p className="text-sm text-muted-foreground">{members[currentItemIndex].role}</p>
                      </div>
                    </div>
                    <div className="mb-4">
                      <h4 className="text-sm font-medium mb-2">Interests</h4>
                      <div className="flex flex-wrap gap-2">
                        {members[currentItemIndex].interests.map((interest, i) => (
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
                  </CardContent>
                </Card>
              )}
            </CardContent>
          </Card>
        )}

        {activeTab === 'groups' && (
          <Card className="flex-1 overflow-hidden">
            <CardHeader className="pb-0 flex flex-row items-center justify-between">
              <CardTitle className="text-lg">Groups</CardTitle>
              <div className="flex items-center space-x-2">
                <Button 
                  variant="outline" 
                  size="icon" 
                  className="h-8 w-8" 
                  onClick={handlePrevItem}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <span className="text-sm font-medium">{currentItemIndex + 1}/{groups.length}</span>
                <Button 
                  variant="outline" 
                  size="icon" 
                  className="h-8 w-8" 
                  onClick={handleNextItem}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="pt-4">
              {groups[currentItemIndex] && (
                <Card key={groups[currentItemIndex].id}>
                  <CardContent className="pt-6">
                    <div className="bg-iqube-primary/20 w-12 h-12 rounded-full flex items-center justify-center mb-4">
                      <Users className="h-6 w-6 text-iqube-primary" />
                    </div>
                    <h3 className="font-semibold mb-1">{groups[currentItemIndex].name}</h3>
                    <div className="flex items-center text-sm text-muted-foreground mb-3">
                      <Users className="h-4 w-4 mr-1" />
                      {groups[currentItemIndex].members} members
                    </div>
                    <div className="flex items-center text-sm mb-4">
                      <div 
                        className={`w-2 h-2 rounded-full mr-2 ${
                          groups[currentItemIndex].activity === 'High' ? 'bg-green-500' :
                          groups[currentItemIndex].activity === 'Medium' ? 'bg-amber-500' :
                          'bg-gray-400'
                        }`}
                      ></div>
                      <span className="text-muted-foreground">
                        {groups[currentItemIndex].activity} activity
                      </span>
                    </div>
                    <Button 
                      variant={groups[currentItemIndex].id % 2 === 0 ? "outline" : "default"} 
                      className={`w-full ${
                        groups[currentItemIndex].id % 2 !== 0 ? "bg-iqube-primary hover:bg-iqube-primary/90" : ""
                      }`}
                    >
                      {groups[currentItemIndex].id % 2 === 0 ? "Leave Group" : "Join Group"}
                    </Button>
                  </CardContent>
                </Card>
              )}
            </CardContent>
          </Card>
        )}

        {activeTab === 'events' && (
          <Card className="flex-1 overflow-hidden">
            <CardHeader className="pb-0 flex flex-row items-center justify-between">
              <CardTitle className="text-lg">Events</CardTitle>
              <div className="flex items-center space-x-2">
                <Button 
                  variant="outline" 
                  size="icon" 
                  className="h-8 w-8" 
                  onClick={handlePrevItem}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <span className="text-sm font-medium">{currentItemIndex + 1}/{events.length}</span>
                <Button 
                  variant="outline" 
                  size="icon" 
                  className="h-8 w-8" 
                  onClick={handleNextItem}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="pt-4">
              {events[currentItemIndex] && (
                <Card key={events[currentItemIndex].id} className="overflow-hidden">
                  <div className="h-32 bg-gradient-to-r from-iqube-primary/30 to-iqube-accent/30 flex items-center justify-center">
                    <Calendar className="h-12 w-12 text-iqube-primary" />
                  </div>
                  <CardContent className="pt-4">
                    <h3 className="font-semibold mb-1">{events[currentItemIndex].title}</h3>
                    <div className="flex items-center text-sm text-muted-foreground mb-3">
                      <Calendar className="h-4 w-4 mr-1" />
                      {formatDate(events[currentItemIndex].date)}
                    </div>
                    <div className="flex justify-between items-center">
                      <div className="flex items-center text-sm text-muted-foreground">
                        <MapPin className="h-4 w-4 mr-1" />
                        {events[currentItemIndex].location}
                      </div>
                      <div className="flex items-center text-sm text-muted-foreground">
                        <Users className="h-4 w-4 mr-1" />
                        {events[currentItemIndex].attendees}
                      </div>
                    </div>
                    <Button className="w-full mt-4 bg-iqube-primary hover:bg-iqube-primary/90">
                      RSVP
                    </Button>
                  </CardContent>
                </Card>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default ConnectInterface;
