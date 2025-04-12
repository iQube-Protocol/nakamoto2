
import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Activity, Users, UserPlus } from 'lucide-react';
import { CommunityMetrics } from '@/lib/types';
import { Member } from './types';
import { getInitials, getRandomColorClass } from './utils/connectUtils';

interface ConnectDashboardProps {
  communityMetrics: CommunityMetrics;
  members: Member[];
}

const ConnectDashboard: React.FC<ConnectDashboardProps> = ({ 
  communityMetrics, 
  members 
}) => {
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
            {members.map((member) => (
              <div key={member.id} className="flex items-center p-2 border rounded-md">
                <Avatar className="h-8 w-8 mr-3">
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

export default ConnectDashboard;
