
import React from 'react';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { 
  GraduationCap, 
  Wallet, 
  Users, 
  Shield, 
  TrendingUp,
  ArrowRight,
  AlertCircle
} from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { DashboardMetrics } from '@/lib/types';
import { Button } from '@/components/ui/button';
import MetaQubeDisplay from '@/components/shared/MetaQubeDisplay';
import { MetaQube } from '@/lib/types';

interface DashboardOverviewProps {
  metrics: DashboardMetrics;
  metaQube: MetaQube;
}

const DashboardOverview = ({ metrics, metaQube }: DashboardOverviewProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {/* Learn Progress */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium flex items-center">
            <GraduationCap className="h-4 w-4 mr-2 text-blue-400" />
            Learn Progress
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{metrics.learnProgress}%</div>
          <Progress value={metrics.learnProgress} className="h-2 mt-2" />
          <div className="text-xs text-muted-foreground mt-2">
            Web3 fundamentals course
          </div>
        </CardContent>
      </Card>

      {/* Earn Tokens */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium flex items-center">
            <Wallet className="h-4 w-4 mr-2 text-green-400" />
            Earned Tokens
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{metrics.earnedTokens}</div>
          <div className="flex items-center mt-2">
            <TrendingUp className="h-4 w-4 mr-1 text-green-500" />
            <span className="text-xs text-green-500">+2.4%</span>
            <span className="text-xs text-muted-foreground ml-2">from last week</span>
          </div>
        </CardContent>
      </Card>

      {/* Connections */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium flex items-center">
            <Users className="h-4 w-4 mr-2 text-purple-400" />
            Connections
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{metrics.connections}</div>
          <div className="text-xs text-muted-foreground mt-2">
            12 active conversations
          </div>
          <div className="mt-2 flex -space-x-2">
            {[...Array(5)].map((_, i) => (
              <div 
                key={i}
                className="h-6 w-6 rounded-full bg-gradient-to-r from-purple-400 to-pink-400 flex items-center justify-center text-white text-xs ring-2 ring-background"
              >
                {String.fromCharCode(65 + i)}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* iQube Health */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium flex items-center">
            <Shield className="h-4 w-4 mr-2 text-iqube-accent" />
            iQube Health
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{metrics.qubeHealth}%</div>
          <Progress 
            value={metrics.qubeHealth} 
            className="h-2 mt-2"
            // Different colors based on health
            indicatorClassName={
              metrics.qubeHealth > 70 
                ? "bg-green-500" 
                : metrics.qubeHealth > 40 
                ? "bg-yellow-500" 
                : "bg-red-500"
            }
          />
          <div className="text-xs text-muted-foreground mt-2">
            Privacy score: {Math.round(metrics.qubeHealth * 0.8)}%
          </div>
        </CardContent>
      </Card>

      {/* MetaQube Info Card */}
      <div className="md:col-span-2">
        <MetaQubeDisplay metaQube={metaQube} />
      </div>

      {/* Recent Activity */}
      <Card className="md:col-span-2">
        <CardHeader>
          <CardTitle className="text-lg">Recent Activity</CardTitle>
          <CardDescription>Latest actions in your iQube ecosystem</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {metrics.recentActivity.map((activity, i) => (
              <div key={i} className="flex items-start pb-4 last:pb-0 border-b last:border-0">
                <div className={`w-2 h-2 mt-2 rounded-full mr-3 ${
                  i % 3 === 0 ? 'bg-blue-400' : i % 3 === 1 ? 'bg-green-400' : 'bg-purple-400'
                }`}></div>
                <div>
                  <p className="text-sm">{activity}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {new Date(Date.now() - i * 3600000).toLocaleString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Call to Action */}
      <Card className="bg-gradient-to-br from-iqube-primary/30 via-iqube-primary/20 to-iqube-accent/20 border-iqube-primary/30">
        <CardHeader>
          <CardTitle className="text-lg">Complete Your iQube</CardTitle>
          <CardDescription>Enhance your experience</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-start">
              <AlertCircle className="h-5 w-5 mr-2 text-amber-500 mt-0.5" />
              <div>
                <p className="text-sm font-medium">Your iQube needs attention</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Connect more services or provide additional data to improve your iQube's performance.
                </p>
              </div>
            </div>
            <Button className="w-full bg-iqube-primary hover:bg-iqube-primary/90">
              Go to Settings
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default DashboardOverview;
