
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { DashboardMetrics } from '@/lib/types';

interface DashboardOverviewProps {
  metrics: DashboardMetrics;
}

const DashboardOverview = ({ metrics }: DashboardOverviewProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
      <Card>
        <CardContent className="pt-6">
          <div className="space-y-6">
            <div>
              <div className="flex justify-between items-center mb-2">
                <h3 className="text-sm font-medium">Learning Progress</h3>
                <span className="text-lg font-semibold">{metrics.learnProgress}%</span>
              </div>
              <Progress value={metrics.learnProgress} className="h-2" />
            </div>

            <div>
              <div className="flex justify-between items-center mb-2">
                <h3 className="text-sm font-medium">iQube Health</h3>
                <span className="text-lg font-semibold">{metrics.qubeHealth}%</span>
              </div>
              <Progress 
                value={metrics.qubeHealth} 
                className="h-2"
                // Color based on health
                indicatorClassName={
                  metrics.qubeHealth > 80 
                    ? "bg-green-500" 
                    : metrics.qubeHealth > 50 
                      ? "bg-amber-500" 
                      : "bg-red-500"
                }
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="bg-background rounded-md p-4 border">
                <h4 className="text-xs text-muted-foreground mb-1">MonDAI Tokens</h4>
                <p className="text-2xl font-bold">{metrics.earnedTokens}</p>
              </div>
              <div className="bg-background rounded-md p-4 border">
                <h4 className="text-xs text-muted-foreground mb-1">Connections</h4>
                <p className="text-2xl font-bold">{metrics.connections}</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-6">
          <h3 className="text-sm font-medium mb-2">Recent Activity</h3>
          <div className="space-y-4">
            {metrics.recentActivity.map((activity, i) => (
              <div key={i} className="flex items-start space-x-3">
                <div className="w-2 h-2 rounded-full bg-primary mt-1.5"></div>
                <p className="text-sm">{activity}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default DashboardOverview;
