
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ChevronLeft, ChevronRight, Users, Calendar, MapPin } from 'lucide-react';
import { ConnectItem, Member, Group, Event, Message } from '../types';

interface DetailPanelProps {
  selectedTab: string | undefined;
  currentItemIndex: number;
  currentItems: ConnectItem[];
  goToPrev: () => void;
  goToNext: () => void;
  togglePanelCollapse: () => void;
}

const DetailPanel: React.FC<DetailPanelProps> = ({
  selectedTab,
  currentItemIndex,
  currentItems,
  goToPrev,
  goToNext,
  togglePanelCollapse,
}) => {
  const current = currentItems[currentItemIndex];
  if (!current) return null;
  
  const isMember = (item: ConnectItem): item is Member => item.type === 'member';
  const isGroup = (item: ConnectItem): item is Group => item.type === 'group';
  const isEvent = (item: ConnectItem): item is Event => item.type === 'event';
  const isMessage = (item: ConnectItem): item is Message => item.type === 'message';

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

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

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
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-7 w-7 ml-2" 
            onClick={togglePanelCollapse}
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

export default DetailPanel;
