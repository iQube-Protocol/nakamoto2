
import React from 'react';
import EarnInterface from '@/components/earn/EarnInterface';
import { TokenMetrics, MetaQube, BlakQube } from '@/lib/types';

// Sample data
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

const metaQubeData: MetaQube = {
  "iQube-Identifier": "MonDAI iQube",
  "iQube-Type": "DataQube",
  "iQube-Designer": "Aigent MonDAI",
  "iQube-Use": "For learning, earning and networking in web3 communities",
  "Owner-Type": "Person",
  "Owner-Identifiability": "Semi-Identifiable",
  "Date-Minted": new Date().toISOString(),
  "Related-iQubes": ["DeFiQube", "NFTMarketQube", "TokenomicsQube"],
  "X-of-Y": "5 of 20",
  "Sensitivity-Score": 4,
  "Verifiability-Score": 5,
  "Accuracy-Score": 5,
  "Risk-Score": 4
};

const blakQubeData: BlakQube = {
  "Profession": "Financial Analyst",
  "Web3-Interests": ["DeFi", "Tokenomics", "DAOs"],
  "Local-City": "Singapore",
  "Email": "user@example.com",
  "EVM-Public-Key": "0x71C7656EC7ab88b098defB751B7401B5f6d8976F",
  "BTC-Public-Key": "bc1qar0srrr7xfkvy5l643lydnw9re59gtzzwf5mdq",
  "Tokens-of-Interest": ["USDC", "ETH", "AVAX", "MATIC"],
  "Chain-IDs": ["1", "137", "43114"],
  "Wallets-of-Interest": ["MetaMask", "Phantom", "Ledger"]
};

const Earn = () => {
  return (
    <div className="container p-2 h-[calc(100vh-100px)]">
      <div className="flex justify-between items-center mb-3">
        <h1 className="text-2xl font-bold tracking-tight">Earn</h1>
      </div>

      <EarnInterface 
        tokenMetrics={tokenMetrics} 
        metaQube={metaQubeData}
        blakQube={blakQubeData}
      />
    </div>
  );
};

export default Earn;
