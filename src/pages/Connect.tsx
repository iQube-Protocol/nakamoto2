
import React from 'react';
import ConnectInterface from '@/components/connect/ConnectInterface';
import { MetaQube, CommunityMetrics } from '@/lib/types';

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
  "Risk-Score": 4
};

// Sample community metrics
const communityMetrics: CommunityMetrics = {
  totalMembers: 1250,
  activeMembers: 420,
  upcomingEvents: 3,
  totalConnections: 28,
  groupsJoined: 4,
  unreadMessages: 7
};

const Connect = () => {
  return (
    <div className="container py-8">
      <div className="flex flex-col md:flex-row justify-between items-start mb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Connect</h1>
          <p className="text-muted-foreground">
            Find and connect with like-minded people in the web3 community
          </p>
        </div>
      </div>

      <ConnectInterface metaQube={metaQubeData} communityMetrics={communityMetrics} />
    </div>
  );
};

export default Connect;
