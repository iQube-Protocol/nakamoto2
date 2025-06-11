
import React from 'react';
import ConnectInterface from '@/components/connect/ConnectInterface';
import { MetaQube, CommunityMetrics, BlakQube } from '@/lib/types';

// Sample metaQube data
const metaQubeData: MetaQube = {
  "iQube-Identifier": "MonDAI iQube",
  "iQube-Type": "DataQube",
  "iQube-Designer": "Aigent MonDAI",
  "iQube-Use": "For learning, earning and networking in web3 communities",
  "Owner-Type": "Person",
  "Owner-Identifiability": "Semi-Identifiable",
  "Date-Minted": new Date().toISOString(),
  "Related-iQubes": ["CommunityQube", "DeFiQube", "NFTMarketQube"],
  "X-of-Y": "5 of 20",
  "Sensitivity-Score": 4,
  "Verifiability-Score": 5,
  "Accuracy-Score": 5,
  "Risk-Score": 4
};

// Sample blakQube data
const blakQubeData: BlakQube = {
  id: "sample-id",
  user_id: "sample-user-id",
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
  "Profession": "Community Manager",
  "Web3-Interests": ["DAOs", "Social Tokens", "NFT Communities"],
  "Local-City": "Berlin",
  "Email": "user@example.com",
  "EVM-Public-Key": "0x71C7656EC7ab88b098defB751B7401B5f6d8976F",
  "BTC-Public-Key": "bc1qar0srrr7xfkvy5l643lydnw9re59gtzzwf5mdq",
  "Tokens-of-Interest": ["USDC", "ETH", "PEOPLE", "ENS"],
  "Chain-IDs": ["1", "137", "10"],
  "Wallets-of-Interest": ["MetaMask", "Rainbow", "Frame"],
  "LinkedIn-ID": "",
  "LinkedIn-Profile-URL": "",
  "Twitter-Handle": "",
  "Telegram-Handle": "",
  "Discord-Handle": "",
  "Instagram-Handle": "",
  "GitHub-Handle": "",
  "First-Name": "",
  "Last-Name": ""
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
    <div className="container p-2 h-[calc(100vh-100px)]">
      <div className="flex justify-between items-center mb-3">
        <h1 className="text-2xl font-bold tracking-tight">Connect</h1>
      </div>

      <ConnectInterface 
        communityMetrics={communityMetrics} 
        metaQube={metaQubeData}
        blakQube={blakQubeData}
      />
    </div>
  );
};

export default Connect;
