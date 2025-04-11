
import React from 'react';
import ConnectInterface from '@/components/connect/ConnectInterface';
import { MetaQube, CommunityMetrics } from '@/lib/types';
import { useIsMobile } from '@/hooks/use-mobile';

// Sample metaQube data
const metaQubeData: MetaQube = {
  "iQube-Identifier": "MonDAI iQube",
  "iQube-Type": "DataQube",
  "iQube-Designer": "Aigent MonDAI",
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
  const isMobile = useIsMobile();
  
  return (
    <div className="container p-2 h-[calc(100vh-100px)]">
      <div className="flex justify-between items-center mb-3">
        <h1 className="text-2xl font-bold tracking-tight">Connect</h1>
      </div>

      <ConnectInterface metaQube={metaQubeData} communityMetrics={communityMetrics} isMobile={isMobile} />
    </div>
  );
};

export default Connect;
