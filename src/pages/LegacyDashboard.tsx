import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import DashboardOverview from '@/components/dashboard/DashboardOverview';
import { MetaQube, DashboardMetrics } from '@/lib/types';

// Helper function to calculate Trust Score
const calculateTrustScore = (accuracyScore: number, verifiabilityScore: number): number => {
  return Math.round((accuracyScore + verifiabilityScore) / 2);
};

// Helper function to calculate Reliability Index
const calculateReliabilityIndex = (sensitivityScore: number, riskScore: number): number => {
  return Math.round((sensitivityScore + (100 - riskScore)) / 2);
};

// Sample metaQube data
const metaQubeData: MetaQube = {
  "iQube-Identifier": "DataQube1",
  "iQube-Type": "DataQube",
  "iQube-Designer": "Aigent Z",
  "iQube-Use": "For learning, earning and networking in web3 communities",
  "Owner-Type": "Person",
  "Owner-Identifiability": "Semi-Identifiable",
  "Date-Minted": new Date().toISOString(),
  "Related-iQubes": ["ContentQube1", "AgentQube1"],
  "X-of-Y": "5 of 20",
  "Sensitivity-Score": 4,
  "Verifiability-Score": 5,
  "Accuracy-Score": 5,
  "Risk-Score": 4,
  get "Trust-Score"() { return calculateTrustScore(this["Accuracy-Score"], this["Verifiability-Score"]); },
  get "Reliability-Index"() { return calculateReliabilityIndex(this["Sensitivity-Score"], this["Risk-Score"]); }
};

// Sample dashboard metrics
const dashboardMetrics: DashboardMetrics = {
  learnProgress: 65,
  earnedTokens: 250,
  connections: 28,
  qubeHealth: 82,
  recentActivity: [
    "Connected with Alex Chen in DeFi Group",
    "Earned 25 MonDAI tokens from staking rewards",
    "Completed Web3 Fundamentals lesson 8",
    "Updated iQube privacy settings",
    "Joined NFT Collectors community"
  ]
};

const Index = () => {
  return (
    <div className="container py-8">
      <div className="flex flex-col md:flex-row justify-between items-start mb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">
            Welcome to your iQube-powered community hub
          </p>
        </div>
      </div>

      <DashboardOverview 
        metrics={dashboardMetrics} 
        metaQube={metaQubeData} 
      />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center">
              <span className="h-6 w-6 rounded-full mr-2 flex items-center justify-center bg-blue-500/20 text-blue-500">L</span>
              Learn
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              Continue your learning journey and access Web3 knowledge through AI-powered assistance.
            </p>
            <div className="bg-blue-500/10 text-blue-600 p-3 rounded-md text-sm mb-2">
              New content available: Web3 Fundamentals Module 9
            </div>
            <a 
              href="/learn"
              className="block w-full bg-blue-500 text-white text-center py-2 rounded-md hover:bg-blue-600 transition-colors"
            >
              Go to Learn
            </a>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center">
              <span className="h-6 w-6 rounded-full mr-2 flex items-center justify-center bg-green-500/20 text-green-500">E</span>
              Earn
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              Manage your MonDAI tokens and explore earning opportunities in the web3 ecosystem.
            </p>
            <div className="bg-green-500/10 text-green-600 p-3 rounded-md text-sm mb-2">
              New staking pool available with 8.5% APY
            </div>
            <a 
              href="/earn"
              className="block w-full bg-green-500 text-white text-center py-2 rounded-md hover:bg-green-600 transition-colors"
            >
              Go to Earn
            </a>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center">
              <span className="h-6 w-6 rounded-full mr-2 flex items-center justify-center bg-purple-500/20 text-purple-500">C</span>
              Connect
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              Find and connect with like-minded individuals in the web3 community.
            </p>
            <div className="bg-purple-500/10 text-purple-600 p-3 rounded-md text-sm mb-2">
              3 new connection requests waiting for you
            </div>
            <a 
              href="/connect"
              className="block w-full bg-purple-500 text-white text-center py-2 rounded-md hover:bg-purple-600 transition-colors"
            >
              Go to Connect
            </a>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Index;
