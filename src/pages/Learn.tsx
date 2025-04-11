
import React from 'react';
import LearnInterface from '@/components/learn/LearnInterface';
import { MetaQube } from '@/lib/types';
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

const Learn = () => {
  const isMobile = useIsMobile();
  
  return (
    <div className="container p-2 h-[calc(100vh-100px)]">
      <div className="flex justify-between items-center mb-3">
        <h1 className="text-2xl font-bold tracking-tight">Learn</h1>
      </div>

      <LearnInterface metaQube={metaQubeData} isMobile={isMobile} />
    </div>
  );
};

export default Learn;
