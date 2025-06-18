
import React from 'react';
import LearnInterface from '@/components/learn/LearnInterface';
import { MetaQube, BlakQube } from '@/lib/types';
import { TooltipProvider } from '@/components/ui/tooltip';

// Sample metaQube data
const metaQubeData: MetaQube = {
  "iQube-Identifier": "MonDAI iQube",
  "iQube-Type": "DataQube",
  "iQube-Designer": "Aigent MonDAI",
  "iQube-Use": "For learning, earning and networking in web3 communities",
  "Owner-Type": "Person",
  "Owner-Identifiability": "Semi-Identifiable",
  "Date-Minted": new Date().toISOString(),
  "Related-iQubes": ["EduQube", "Web3BasicsQube", "BlockchainQube"],
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
  "First-Name": "",
  "Last-Name": "",
  "KNYT-ID": "",
  "Qrypto-ID": "",
  "Profession": "Web Developer",
  "Web3-Interests": ["Smart Contracts", "Blockchain Fundamentals", "DApps"],
  "Local-City": "Austin",
  "Email": "user@example.com",
  "LinkedIn-ID": "",
  "LinkedIn-Profile-URL": "",
  "Twitter-Handle": "",
  "Telegram-Handle": "",
  "Discord-Handle": "",
  "Instagram-Handle": "",
  "GitHub-Handle": "",
  "YouTube-ID": "",
  "Facebook-ID": "",
  "TikTok-Handle": "",
  "EVM-Public-Key": "0x71C7656EC7ab88b098defB751B7401B5f6d8976F",
  "BTC-Public-Key": "bc1qar0srrr7xfkvy5l643lydnw9re59gtzzwf5mdq",
  "ThirdWeb-Public-Key": "",
  "Tokens-of-Interest": ["ETH", "SOL", "DOT", "LINK"],
  "Chain-IDs": ["1", "137", "1284"],
  "Wallets-of-Interest": ["MetaMask", "Phantom", "Trust"],
  "Phone-Number": "",
  "Age": "",
  "Address": "",
  "OM-Member-Since": "",
  "OM-Tier-Status": "",
  "Metaiye-Shares-Owned": "",
  "KNYT-COYN-Owned": "",
  "MetaKeep-Public-Key": "",
  "Motion-Comics-Owned": "",
  "Paper-Comics-Owned": "",
  "Digital-Comics-Owned": "",
  "KNYT-Posters-Owned": "",
  "KNYT-Cards-Owned": "",
  "Characters-Owned": ""
};

const Learn = () => {
  return (
    <TooltipProvider>
      <div className="container p-2 h-[calc(100vh-100px)]">
        <div className="flex justify-between items-center mb-3">
          <h1 className="text-2xl font-bold tracking-tight">Learn</h1>
        </div>

        <LearnInterface 
          metaQube={metaQubeData} 
          blakQube={blakQubeData}
        />
      </div>
    </TooltipProvider>
  );
};

export default Learn;
