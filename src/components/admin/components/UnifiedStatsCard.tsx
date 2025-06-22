
import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Shield, RefreshCw } from 'lucide-react';
import { UnifiedInvitationStats } from '@/services/unified-invitation';

interface UnifiedStatsCardProps {
  stats: UnifiedInvitationStats;
  duplicatesCount: number;
  isRefreshing: boolean;
}

const UnifiedStatsCard: React.FC<UnifiedStatsCardProps> = ({ 
  stats, 
  duplicatesCount, 
  isRefreshing 
}) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center">
            <Shield className="h-5 w-5 mr-2" />
            Unified Data Status (Authoritative Source)
          </div>
          {isRefreshing && (
            <RefreshCw className="h-4 w-4 animate-spin text-blue-600" />
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">{stats.totalCreated}</div>
            <div className="text-sm text-gray-600">Total Invitations</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">{stats.emailsSent}</div>
            <div className="text-sm text-gray-600">Emails Sent</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600">{stats.signupsCompleted}</div>
            <div className="text-sm text-gray-600">Signups Completed</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-orange-600">{stats.emailsPending}</div>
            <div className="text-sm text-gray-600">Pending Emails</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-yellow-600">{stats.awaitingSignup}</div>
            <div className="text-sm text-gray-600">Awaiting Signup</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-red-600">{duplicatesCount}</div>
            <div className="text-sm text-gray-600">Duplicate Emails</div>
          </div>
        </div>
        <div className="mt-4 text-center">
          <div className="text-sm text-gray-500">
            Conversion Rate: <span className="font-medium">{stats.conversionRate.toFixed(1)}%</span>
          </div>
          <div className="text-xs text-gray-400">
            Last Updated: {new Date(stats.lastUpdated).toLocaleString()}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default UnifiedStatsCard;
