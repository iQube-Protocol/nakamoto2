
import React from 'react';
import EarnInterface from '@/components/earn/EarnInterface';
import { MetaQube, TokenMetrics } from '@/lib/types';

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
