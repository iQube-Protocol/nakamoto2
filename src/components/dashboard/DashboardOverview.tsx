
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
  AlertCircle,
  Plus
} from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { DashboardMetrics } from '@/lib/types';
import { Button } from '@/components/ui/button';
import MetaQubeDisplay from '@/components/shared/MetaQubeDisplay';
import { MetaQube } from '@/lib/types';
import { Link } from 'react-router-dom';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';

interface DashboardOverviewProps {
  metrics: DashboardMetrics;
  metaQube: MetaQube;
}

const getScoreColor = (score: number, type: 'risk' | 'sensitivity' | 'accuracy' | 'verifiability') => {
  if (type === 'risk' || type === 'sensitivity') {
    // Risk and Sensitivity: 1-4 green, 5-7 amber, 8-10 red
    return score <= 4 
      ? "bg-green-500" 
      : score <= 7 
        ? "bg-yellow-500" 
        : "bg-red-500";
  } else {
    // Accuracy and Verifiability: 1-3 red, 4-6 amber, 7-10 green
    return score <= 3 
      ? "bg-red-500" 
      : score <= 6 
        ? "bg-yellow-500" 
        : "bg-green-500";
  }
};

const DashboardOverview = ({ metrics, metaQube }: DashboardOverviewProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 mb-3">
      {/* Learn Progress */}
      <Card className="shadow-sm">
        <CardHeader className="p-3 pb-0">
          <CardTitle className="text-sm font-medium flex items-center">
            <GraduationCap className="h-4 w-4 mr-2 text-blue-400" />
            Learn Progress
          </CardTitle>
        </CardHeader>
        <CardContent className="p-3 pt-2">
          <div className="text-2xl font-bold">{metrics.learnProgress}%</div>
          <Progress value={metrics.learnProgress} className="h-2 mt-1" />
          <div className="text-xs text-muted-foreground mt-1">
            Web3 fundamentals course
          </div>
        </CardContent>
      </Card>

      {/* Earn Tokens */}
      <Card className="shadow-sm">
        <CardHeader className="p-3 pb-0">
          <CardTitle className="text-sm font-medium flex items-center">
            <Wallet className="h-4 w-4 mr-2 text-green-400" />
            Earned Tokens
          </CardTitle>
        </CardHeader>
        <CardContent className="p-3 pt-2">
          <div className="text-2xl font-bold">{metrics.earnedTokens}</div>
          <div className="flex items-center mt-1">
            <TrendingUp className="h-4 w-4 mr-1 text-green-500" />
            <span className="text-xs text-green-500">+2.4%</span>
            <span className="text-xs text-muted-foreground ml-2">from last week</span>
          </div>
        </CardContent>
      </Card>

      {/* Connections */}
      <Card className="shadow-sm">
        <CardHeader className="p-3 pb-0">
          <CardTitle className="text-sm font-medium flex items-center">
            <Users className="h-4 w-4 mr-2 text-purple-400" />
            Connections
          </CardTitle>
        </CardHeader>
        <CardContent className="p-3 pt-2">
          <div className="text-2xl font-bold">{metrics.connections}</div>
          <div className="text-xs text-muted-foreground mt-1">
            12 active conversations
          </div>
          <div className="mt-1 flex -space-x-2">
            {[...Array(5)].map((_, i) => (
              <div 
                key={i}
                className="h-5 w-5 rounded-full bg-gradient-to-r from-purple-400 to-pink-400 flex items-center justify-center text-white text-xs ring-2 ring-background"
              >
                {String.fromCharCode(65 + i)}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Aigent Health */}
      <Card className="shadow-sm">
        <CardHeader className="p-3 pb-0">
          <CardTitle className="text-sm font-medium flex items-center">
            <Shield className="h-4 w-4 mr-2 text-iqube-accent" />
            Aigent Health
          </CardTitle>
        </CardHeader>
        <CardContent className="p-3 pt-2">
          <div className="text-2xl font-bold">{metrics.qubeHealth}%</div>
          <Progress 
            value={metrics.qubeHealth} 
            className="h-2 mt-1"
            indicatorClassName={
              metrics.qubeHealth > 70 
                ? "bg-green-500" 
                : metrics.qubeHealth > 40 
                ? "bg-yellow-500" 
                : "bg-red-500"
            }
          />
          <div className="text-xs text-muted-foreground mt-1">
            Privacy score: {Math.round(metrics.qubeHealth * 0.8)}%
          </div>
        </CardContent>
      </Card>

      {/* MetaQube Info Card - Using Collapsible */}
      <Card className="shadow-sm md:col-span-2">
        <CardHeader className="p-3 pb-2 flex flex-row items-center justify-between">
          <CardTitle className="text-sm">Aigent iQube</CardTitle>
          <Collapsible className="w-full">
            <CollapsibleTrigger className="text-xs text-iqube-accent hover:underline">
              View Details
            </CollapsibleTrigger>
            <CollapsibleContent className="mt-2">
              <div className="p-3 bg-muted/30 rounded-md border">
                {/* Removed the duplicate scores section here */}
                <MetaQubeDisplay metaQube={metaQube} className="mt-3" />
              </div>
            </CollapsibleContent>
          </Collapsible>
        </CardHeader>
      </Card>

      {/* Recent Activity - Using Collapsible */}
      <Card className="md:col-span-2 shadow-sm">
        <CardHeader className="p-3 pb-2 flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-sm">Recent Activity</CardTitle>
          </div>
          <Collapsible className="w-full">
            <CollapsibleTrigger className="text-xs text-iqube-accent hover:underline">
              View Latest Actions
            </CollapsibleTrigger>
            <CollapsibleContent className="mt-2">
              <div className="space-y-3 max-h-48 overflow-y-auto">
                {metrics.recentActivity.map((activity, i) => (
                  <div key={i} className="flex items-start pb-2 last:pb-0 border-b last:border-0">
                    <div className={`w-2 h-2 mt-2 rounded-full mr-3 ${
                      i % 3 === 0 ? 'bg-blue-400' : i % 3 === 1 ? 'bg-green-400' : 'bg-purple-400'
                    }`}></div>
                    <div>
                      <p className="text-xs">{activity}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {new Date(Date.now() - i * 3600000).toLocaleString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CollapsibleContent>
          </Collapsible>
        </CardHeader>
      </Card>

      {/* Call to Action - Simplified */}
      <Card className="bg-gradient-to-br from-iqube-primary/30 via-iqube-primary/20 to-iqube-accent/20 border-iqube-primary/30 shadow-sm">
        <CardContent className="p-3 flex flex-row items-center justify-between">
          <div className="flex items-center">
            <AlertCircle className="h-5 w-5 mr-2 text-amber-500" />
            <div>
              <p className="text-sm font-medium">Mint Aigent iQube</p>
              <p className="text-xs text-muted-foreground">Enhance security</p>
            </div>
          </div>
          <Link to="/settings">
            <Button size="sm" className="bg-iqube-primary hover:bg-iqube-primary/90">
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  );
};

export default DashboardOverview;
