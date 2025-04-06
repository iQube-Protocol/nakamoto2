
import React from 'react';
import EarnInterface from '@/components/earn/EarnInterface';
import { MetaQube, TokenMetrics } from '@/lib/types';

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

// Sample token metrics
const tokenMetrics: TokenMetrics = {
  price: 0.5,
  marketCap: 5000000,
  volume24h: 750000,
  circulatingSupply: 10000000,
  totalSupply: 20000000,
  allTimeHigh: 0.75,
  holders: 2500,
  priceChange24h: 3.5
};

const Earn = () => {
  return (
    <div className="container py-8">
      <div className="flex flex-col md:flex-row justify-between items-start mb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Earn</h1>
          <p className="text-muted-foreground">
            Manage your MonDAI tokens and explore earning opportunities
          </p>
        </div>
      </div>

      <EarnInterface metaQube={metaQubeData} tokenMetrics={tokenMetrics} />
    </div>
  );
};

export default Earn;
