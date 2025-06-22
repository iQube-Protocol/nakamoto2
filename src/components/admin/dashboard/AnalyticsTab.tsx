
import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { BarChart3 } from 'lucide-react';
import type { UnifiedInvitationStats, EmailBatch } from '@/services/unified-invitation';

interface AnalyticsTabProps {
  stats: UnifiedInvitationStats | null;
  batches: EmailBatch[];
}

const AnalyticsTab: React.FC<AnalyticsTabProps> = ({ stats, batches }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <BarChart3 className="h-5 w-5 mr-2" />
          Analytics Summary
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="font-medium mb-2">Email Pipeline Status</h3>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span>Total Created:</span>
                <span className="font-medium">{stats?.totalCreated || 0}</span>
              </div>
              <div className="flex justify-between">
                <span>Emails Sent:</span>
                <span className="font-medium text-green-600">{stats?.emailsSent || 0}</span>
              </div>
              <div className="flex justify-between">
                <span>Pending Send:</span>
                <span className="font-medium text-orange-600">{stats?.emailsPending || 0}</span>
              </div>
              <div className="flex justify-between">
                <span>Awaiting Signup:</span>
                <span className="font-medium text-yellow-600">{stats?.awaitingSignup || 0}</span>
              </div>
              <div className="flex justify-between">
                <span>Completed:</span>
                <span className="font-medium text-green-600">{stats?.signupsCompleted || 0}</span>
              </div>
            </div>
          </div>
          <div>
            <h3 className="font-medium mb-2">Conversion Metrics</h3>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span>Email Send Rate:</span>
                <span className="font-medium">
                  {stats?.totalCreated ? ((stats.emailsSent / stats.totalCreated) * 100).toFixed(1) : 0}%
                </span>
              </div>
              <div className="flex justify-between">
                <span>Signup Conversion:</span>
                <span className="font-medium">
                  {stats?.conversionRate?.toFixed(1) || 0}%
                </span>
              </div>
              <div className="flex justify-between">
                <span>Total Batches:</span>
                <span className="font-medium">{batches.length}</span>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default AnalyticsTab;
