
import React from 'react';
import LearnInterface from '@/components/learn/LearnInterface';
import { MetaQube } from '@/lib/types';

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

const Learn = () => {
  return (
    <div className="container py-8">
      <div className="flex flex-col md:flex-row justify-between items-start mb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Learn</h1>
          <p className="text-muted-foreground">
            Access personalized Web3 education and knowledge resources
          </p>
        </div>
      </div>

      <LearnInterface metaQube={metaQubeData} />
    </div>
  );
};

export default Learn;
