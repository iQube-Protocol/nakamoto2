
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Users, Mail, Clock, CheckCircle, AlertCircle } from 'lucide-react';
import type { UnifiedInvitationStats } from '@/services/unified-invitation';

interface StatsOverviewProps {
  stats: UnifiedInvitationStats | null;
  onStatCardClick: (category: string, title: string, count: number) => void;
}

const StatsOverview: React.FC<StatsOverviewProps> = ({ stats, onStatCardClick }) => {
  // Use the direct signups from stats or fallback to 0
  const directSignups = stats?.directSignups || 0;
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
      <Card className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => onStatCardClick('totalCreated', 'Total Created', stats?.totalCreated || 0)}>
        <CardContent className="p-4">
          <div className="flex items-center space-x-2">
            <Users className="h-5 w-5 text-blue-600" />
            <div>
              <p className="text-sm font-medium text-gray-600">Total Created</p>
              <p className="text-2xl font-bold">{stats?.totalCreated || 0}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => onStatCardClick('emailsSent', 'Emails Sent', stats?.emailsSent || 0)}>
        <CardContent className="p-4">
          <div className="flex items-center space-x-2">
            <Mail className="h-5 w-5 text-green-600" />
            <div>
              <p className="text-sm font-medium text-gray-600">Emails Sent</p>
              <p className="text-2xl font-bold">{stats?.emailsSent || 0}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => onStatCardClick('emailsPending', 'Pending Send', stats?.emailsPending || 0)}>
        <CardContent className="p-4">
          <div className="flex items-center space-x-2">
            <Clock className="h-5 w-5 text-orange-600" />
            <div>
              <p className="text-sm font-medium text-gray-600">Pending Send</p>
              <p className="text-2xl font-bold">{stats?.emailsPending || 0}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => onStatCardClick('awaitingSignup', 'Awaiting Signup', stats?.awaitingSignup || 0)}>
        <CardContent className="p-4">
          <div className="flex items-center space-x-2">
            <AlertCircle className="h-5 w-5 text-yellow-600" />
            <div>
              <p className="text-sm font-medium text-gray-600">Awaiting Signup</p>
              <p className="text-2xl font-bold">{stats?.awaitingSignup || 0}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => onStatCardClick('signupsCompleted', 'Completed', stats?.signupsCompleted || 0)}>
        <CardContent className="p-4">
          <div className="flex items-center space-x-2">
            <CheckCircle className="h-5 w-5 text-green-600" />
            <div>
              <p className="text-sm font-medium text-gray-600">Completed</p>
              <p className="text-2xl font-bold">{stats?.signupsCompleted || 0}</p>
              <p className="text-xs text-gray-500">
                {stats?.conversionRate ? `${stats.conversionRate.toFixed(1)}% conversion` : ''}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => onStatCardClick('directSignups', 'Direct Signups', directSignups)}>
        <CardContent className="p-4">
          <div className="flex items-center space-x-2">
            <Users className="h-5 w-5 text-purple-600" />
            <div>
              <p className="text-sm font-medium text-gray-600">Direct Signups</p>
              <p className="text-2xl font-bold">{directSignups}</p>
              <p className="text-xs text-gray-500">No invitation</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default StatsOverview;
