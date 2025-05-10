import { useState } from 'react';
import { toast } from 'sonner';
import { MetaQube } from '@/lib/types';

// Define the initial private data for each iQube type
const dataQubePrivateData = {
  "Profession": "Software Developer",
  "Web3-Interests": ["DeFi", "NFTs", "DAOs"],
  "Local-City": "San Francisco",
  "Email": "user@example.com",
  "EVM-Public-Key": "0x71C7656EC7ab88b098defB751B7401B5f6d8976F",
  "BTC-Public-Key": "bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh",
  "Tokens-of-Interest": ["ETH", "BTC", "MATIC"],
  "Chain-IDs": ["1", "137"],
  "Wallets-of-Interest": ["MetaMask", "Rainbow"],
  "LinkedIn-ID": "user-linkedin-profile",
  "Twitter-ID": "@usertwitter",
  "Discord-ID": "user#1234",
  "Telegram-ID": "@usertelegram",
  "Luma-ID": "user-luma"
};

const agentQubePrivateData = {
  "AI-Capabilities": ["Data Analysis", "NLP", "Blockchain Insights"],
  "Model Weights": "Transformer 12B",
  "Training Data": ["Web3 Data", "Financial Markets", "Public Data"],
  "Model-Version": "1.3.7",
  "API Key": "••••••••••••••••",
  "Access-Control": "Permissioned",
  "Data-Sources": ["On-chain", "User Input", "External APIs"],
  "Refresh-Interval": "24h",
  "Trustworthiness": "Verified"
};

const toolQubePrivateData = {
  "Storage-Quota": "15GB",
  "Connected-Email": "user@example.com",
  "Auto-Sync": "Enabled",
  "Sharing-Permissions": "Private",
  "Cached-Files": ["Doc1.pdf", "Presentation.ppt"],
  "API-Key": "••••••••••••••••",
  "Last-Sync": "2023-05-01T12:00:00Z",
  "Default-View": "List",
  "File-Count": "128"
};

const contentQubePrivateData = {
  "Content-Type": "Educational",
  "Creation-Date": "2023-05-15T10:30:00Z",
  "Author": "John Doe",
  "Keywords": ["Web3", "Blockchain", "DeFi"],
  "Version": "1.2.3",
  "License": "Creative Commons",
  "Distribution": "Public",
  "Related-Content": ["Intro to NFTs", "DeFi Basics"],
  "Analytics": "Enabled"
};

const modelQubePrivateData = {
  "Model-Type": "Transformer",
  "Parameters": "12B",
  "Training-Dataset": ["Web3 Data", "Market Analysis"],
  "Accuracy": "92.5%",
  "Version": "2.1.0",
  "Creator": "Aigent Research",
  "Use-Cases": ["Prediction", "Analysis", "Recommendation"],
  "Dependencies": ["TensorFlow", "PyTorch"],
  "Limitations": "Limited financial history"
};

export function usePrivateData(selectedIQube: MetaQube) {
  // State for private data of each iQube type
  const [mondaiPrivateData, setMondaiPrivateData] = useState(dataQubePrivateData);
  const [metisPrivateData, setMetisPrivateData] = useState(agentQubePrivateData);
  const [gdrivePrivateData, setGdrivePrivateData] = useState(toolQubePrivateData);
  const [contentPrivateData, setContentPrivateData] = useState(contentQubePrivateData);
  const [modelPrivateData, setModelPrivateData] = useState(modelQubePrivateData);
  
  // Function to get the appropriate private data based on selected iQube
  const getPrivateData = () => {
    if (selectedIQube["iQube-Identifier"] === "Metis iQube") {
      return metisPrivateData;
    } else if (selectedIQube["iQube-Identifier"] === "GDrive iQube") {
      return gdrivePrivateData;
    } else if (selectedIQube["iQube-Identifier"] === "Content iQube") {
      return contentPrivateData;
    } else if (selectedIQube["iQube-Identifier"] === "Model iQube") {
      return modelPrivateData;
    } else {
      return mondaiPrivateData;
    }
  };

  // Function to update the appropriate private data based on selected iQube
  const handleUpdatePrivateData = (newData: any) => {
    if (selectedIQube["iQube-Identifier"] === "Metis iQube") {
      setMetisPrivateData(newData);
    } else if (selectedIQube["iQube-Identifier"] === "GDrive iQube") {
      setGdrivePrivateData(newData);
    } else if (selectedIQube["iQube-Identifier"] === "Content iQube") {
      setContentPrivateData(newData);
    } else if (selectedIQube["iQube-Identifier"] === "Model iQube") {
      setModelPrivateData(newData);
    } else {
      setMondaiPrivateData(newData);
    }

    toast.success(`${selectedIQube["iQube-Identifier"]} Data Updated`);
  };

  return {
    privateData: getPrivateData(),
    handleUpdatePrivateData
  };
}

export const initialQubeData = {
  dataQubePrivateData,
  agentQubePrivateData,
  toolQubePrivateData,
  contentQubePrivateData,
  modelQubePrivateData
};
