
import React from 'react';
import DashboardOverview from '@/components/dashboard/DashboardOverview';
import { DashboardMetrics, MetaQube } from '@/lib/types';

const Dashboard = () => {
  // Sample metrics data
  const metrics: DashboardMetrics = {
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

  // Sample MetaQube data
  const metaQube: MetaQube = {
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
    "Risk-Score": 4
  };

  return (
    <div className="container py-6 max-w-7xl mx-auto">
      <div className="flex flex-col">
        <h1 className="text-2xl font-bold mb-6">Dashboard</h1>
        <DashboardOverview metrics={metrics} metaQube={metaQube} />
      </div>
    </div>
  );
};

export default Dashboard;
