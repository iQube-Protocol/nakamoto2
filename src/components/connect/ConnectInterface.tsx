
import React from 'react';
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
  MapPin
} from 'lucide-react';
import AgentInterface from '@/components/shared/AgentInterface';
import MetaQubeDisplay from '@/components/shared/MetaQubeDisplay';
import { MetaQube, CommunityMetrics } from '@/lib/types';

interface ConnectInterfaceProps {
  metaQube: MetaQube;
  communityMetrics: CommunityMetrics;
}

const ConnectInterface = ({ metaQube, communityMetrics }: ConnectInterfaceProps) => {
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

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
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

      <div className="space-y-6">
        <MetaQubeDisplay metaQube={metaQube} compact={true} />

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Connection Summary</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
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
          </CardContent>
        </Card>
      </div>

      <Card className="lg:col-span-3">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center">
              <Calendar className="mr-2 h-5 w-5 text-iqube-accent" />
              Upcoming Events
            </CardTitle>
            <Button size="sm" variant="outline">
              View All
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {events.map((event) => (
              <Card key={event.id} className="overflow-hidden">
                <div className="h-32 bg-gradient-to-r from-iqube-primary/30 to-iqube-accent/30 flex items-center justify-center">
                  <Calendar className="h-12 w-12 text-iqube-primary" />
                </div>
                <CardContent className="pt-4">
                  <h3 className="font-semibold mb-1">{event.title}</h3>
                  <div className="flex items-center text-sm text-muted-foreground mb-3">
                    <Calendar className="h-4 w-4 mr-1" />
                    {formatDate(event.date)}
                  </div>
                  <div className="flex justify-between items-center">
                    <div className="flex items-center text-sm text-muted-foreground">
                      <MapPin className="h-4 w-4 mr-1" />
                      {event.location}
                    </div>
                    <div className="flex items-center text-sm text-muted-foreground">
                      <Users className="h-4 w-4 mr-1" />
                      {event.attendees}
                    </div>
                  </div>
                  <Button className="w-full mt-4 bg-iqube-primary hover:bg-iqube-primary/90">
                    RSVP
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="lg:col-span-3">
        <Tabs defaultValue="members">
          <TabsList className="w-full grid grid-cols-3">
            <TabsTrigger value="members">Community Members</TabsTrigger>
            <TabsTrigger value="groups">Groups</TabsTrigger>
            <TabsTrigger value="messages">Messages</TabsTrigger>
          </TabsList>
          <TabsContent value="members" className="mt-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {members.map((member) => (
                <Card key={member.id} className="flex flex-col">
                  <CardContent className="pt-6 flex-1">
                    <div className="flex items-center mb-4">
                      <Avatar className="h-12 w-12 mr-3">
                        <AvatarImage src={member.avatar} />
                        <AvatarFallback className={getRandomColorClass(member.id)}>
                          {getInitials(member.name)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <h3 className="font-medium">{member.name}</h3>
                        <p className="text-sm text-muted-foreground">{member.role}</p>
                      </div>
                    </div>
                    <div className="mb-4">
                      <h4 className="text-sm font-medium mb-2">Interests</h4>
                      <div className="flex flex-wrap gap-2">
                        {member.interests.map((interest, i) => (
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
              ))}
              <Card className="flex flex-col items-center justify-center p-6 border-dashed">
                <Users className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="font-medium mb-1">Discover More Members</h3>
                <p className="text-sm text-muted-foreground text-center mb-4">
                  Find more community members that match your interests
                </p>
                <Button className="bg-iqube-primary hover:bg-iqube-primary/90">
                  Browse Directory
                </Button>
              </Card>
            </div>
          </TabsContent>
          
          <TabsContent value="groups" className="mt-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {groups.map((group) => (
                <Card key={group.id}>
                  <CardContent className="pt-6">
                    <div className="bg-iqube-primary/20 w-12 h-12 rounded-full flex items-center justify-center mb-4">
                      <Users className="h-6 w-6 text-iqube-primary" />
                    </div>
                    <h3 className="font-semibold mb-1">{group.name}</h3>
                    <div className="flex items-center text-sm text-muted-foreground mb-3">
                      <Users className="h-4 w-4 mr-1" />
                      {group.members} members
                    </div>
                    <div className="flex items-center text-sm mb-4">
                      <div 
                        className={`w-2 h-2 rounded-full mr-2 ${
                          group.activity === 'High' ? 'bg-green-500' :
                          group.activity === 'Medium' ? 'bg-amber-500' :
                          'bg-gray-400'
                        }`}
                      ></div>
                      <span className="text-muted-foreground">
                        {group.activity} activity
                      </span>
                    </div>
                    <Button 
                      variant={group.id % 2 === 0 ? "outline" : "default"} 
                      className={`w-full ${
                        group.id % 2 !== 0 ? "bg-iqube-primary hover:bg-iqube-primary/90" : ""
                      }`}
                    >
                      {group.id % 2 === 0 ? "Leave Group" : "Join Group"}
                    </Button>
                  </CardContent>
                </Card>
              ))}
              <Card className="flex flex-col items-center justify-center p-6 border-dashed">
                <Users className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="font-medium mb-1">Create New Group</h3>
                <p className="text-sm text-muted-foreground text-center mb-4">
                  Start a group based on your interests
                </p>
                <Button className="bg-iqube-primary hover:bg-iqube-primary/90">
                  Create Group
                </Button>
              </Card>
            </div>
          </TabsContent>
          
          <TabsContent value="messages" className="mt-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="md:col-span-1">
                <CardHeader>
                  <CardTitle className="text-base flex items-center">
                    <MessageSquare className="h-4 w-4 mr-2" />
                    Recent Chats
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="space-y-1">
                    {members.map((member, i) => (
                      <div 
                        key={member.id}
                        className={`flex items-center p-3 hover:bg-muted/50 cursor-pointer ${
                          i === 0 ? "bg-muted" : ""
                        }`}
                      >
                        <div className="relative">
                          <Avatar className="h-9 w-9">
                            <AvatarImage src={member.avatar} />
                            <AvatarFallback className={getRandomColorClass(member.id)}>
                              {getInitials(member.name)}
                            </AvatarFallback>
                          </Avatar>
                          {i === 0 && (
                            <div className="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full bg-green-500 border-2 border-background"></div>
                          )}
                        </div>
                        <div className="ml-3 flex-1">
                          <div className="flex justify-between">
                            <span className="font-medium text-sm">{member.name}</span>
                            <span className="text-xs text-muted-foreground">
                              {i === 0 ? "Now" : `${i}h ago`}
                            </span>
                          </div>
                          <div className="text-xs truncate text-muted-foreground">
                            {i === 0 ? (
                              <span className="flex items-center">
                                <CheckCheck className="h-3 w-3 mr-1 text-iqube-accent" />
                                Thanks for the information...
                              </span>
                            ) : (
                              "Hey there! I was wondering..."
                            )}
                          </div>
                        </div>
                        {i === 1 && (
                          <Badge className="ml-2 bg-iqube-primary">2</Badge>
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
              
              <Card className="md:col-span-2">
                <CardHeader className="border-b">
                  <div className="flex items-center">
                    <Avatar className="h-10 w-10 mr-3">
                      <AvatarImage src={members[0].avatar} />
                      <AvatarFallback className={getRandomColorClass(members[0].id)}>
                        {getInitials(members[0].name)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <h3 className="font-semibold">{members[0].name}</h3>
                      <p className="text-xs text-muted-foreground">
                        Online now
                      </p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="h-80 overflow-y-auto p-4 space-y-4">
                    <div className="flex">
                      <Avatar className="h-8 w-8 mr-2 mt-1">
                        <AvatarImage src={members[0].avatar} />
                        <AvatarFallback className={getRandomColorClass(members[0].id)}>
                          {getInitials(members[0].name)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="bg-muted p-3 rounded-lg max-w-[80%]">
                        <p className="text-sm">
                          Hi there! I noticed from your iQube data that you're also interested in DeFi. 
                          I'm working on a project related to decentralized lending.
                        </p>
                        <span className="text-xs text-muted-foreground">
                          12:30 PM
                        </span>
                      </div>
                    </div>
                    
                    <div className="flex justify-end">
                      <div className="bg-iqube-primary/20 p-3 rounded-lg max-w-[80%]">
                        <p className="text-sm">
                          Hey Alex! Yes, I'm very interested in DeFi projects. Would love to hear more about what you're working on.
                        </p>
                        <span className="text-xs text-muted-foreground">
                          12:35 PM
                        </span>
                      </div>
                    </div>
                    
                    <div className="flex">
                      <Avatar className="h-8 w-8 mr-2 mt-1">
                        <AvatarImage src={members[0].avatar} />
                        <AvatarFallback className={getRandomColorClass(members[0].id)}>
                          {getInitials(members[0].name)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="bg-muted p-3 rounded-lg max-w-[80%]">
                        <p className="text-sm">
                          Great! I'm developing a protocol that enables decentralized lending using the iQube protocol for privacy-preserving credit scoring. Would you be interested in testing it?
                        </p>
                        <span className="text-xs text-muted-foreground">
                          12:38 PM
                        </span>
                      </div>
                    </div>
                    
                    <div className="flex justify-end">
                      <div className="bg-iqube-primary/20 p-3 rounded-lg max-w-[80%]">
                        <p className="text-sm">
                          That sounds fascinating! I've been exploring privacy solutions in DeFi recently, so this is perfect timing. I'd be happy to test it and provide feedback.
                        </p>
                        <span className="text-xs text-muted-foreground">
                          12:40 PM
                        </span>
                      </div>
                    </div>
                    
                    <div className="flex">
                      <Avatar className="h-8 w-8 mr-2 mt-1">
                        <AvatarImage src={members[0].avatar} />
                        <AvatarFallback className={getRandomColorClass(members[0].id)}>
                          {getInitials(members[0].name)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="bg-muted p-3 rounded-lg max-w-[80%]">
                        <p className="text-sm">
                          Thanks for the information! I'll send you more details soon.
                        </p>
                        <span className="text-xs text-muted-foreground flex items-center">
                          12:42 PM
                          <CheckCheck className="h-3 w-3 ml-1 text-iqube-accent" />
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="p-4 border-t">
                    <div className="flex items-center">
                      <textarea 
                        className="flex-1 resize-none border rounded-lg p-2 text-sm focus:outline-none focus:ring-1 focus:ring-iqube-primary"
                        placeholder="Type a message..."
                        rows={1}
                      ></textarea>
                      <Button 
                        size="icon" 
                        className="ml-2 bg-iqube-primary hover:bg-iqube-primary/90"
                      >
                        <ArrowUpRight className="h-5 w-5" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default ConnectInterface;
