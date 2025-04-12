
import React from 'react';
import EarnInterface from '@/components/earn/EarnInterface';
import { MetaQube, TokenMetrics } from '@/lib/types';

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
    <div className="container p-2 h-[calc(100vh-100px)]">
      <div className="flex justify-between items-center mb-3">
        <h1 className="text-2xl font-bold tracking-tight">Earn</h1>
      </div>

      <EarnInterface tokenMetrics={tokenMetrics} />
    </div>
  );
};

export default Earn;
