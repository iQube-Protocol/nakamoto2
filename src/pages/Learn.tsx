
import React, { useState, useEffect } from 'react';
import LearnInterface from '@/components/learn/LearnInterface';
import { MetaQube, BlakQube } from '@/lib/types';
import { TooltipProvider } from '@/components/ui/tooltip';
import { ErrorBoundary } from '@/components/shared/ErrorBoundary';
import { useMCP } from '@/hooks/use-mcp';
import { toast } from 'sonner';

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
  "Profession": "Web Developer",
  "Web3-Interests": ["Smart Contracts", "Blockchain Fundamentals", "DApps"],
  "Local-City": "Austin",
  "Email": "user@example.com",
  "EVM-Public-Key": "0x71C7656EC7ab88b098defB751B7401B5f6d8976F",
  "BTC-Public-Key": "bc1qar0srrr7xfkvy5l643lydnw9re59gtzzwf5mdq",
  "Tokens-of-Interest": ["ETH", "SOL", "DOT", "LINK"],
  "Chain-IDs": ["1", "137", "1284"],
  "Wallets-of-Interest": ["MetaMask", "Phantom", "Trust"]
};

const Learn = () => {
  const { isApiLoading } = useMCP();
  const [apiLoadAttempted, setApiLoadAttempted] = useState(false);
  
  // Track if Google API loading has been attempted
  useEffect(() => {
    if (isApiLoading) {
      setApiLoadAttempted(true);
    } else if (apiLoadAttempted) {
      // API loading finished after being attempted
      toast.success('Learn page loaded', {
        description: 'Document features are now available'
      });
    }
  }, [isApiLoading, apiLoadAttempted]);
  
  return (
    <ErrorBoundary fallback={
      <div className="p-4 border border-red-300 bg-red-50 rounded">
        <h2 className="text-lg font-semibold text-red-700 mb-2">Error in Learn Page</h2>
        <p className="mb-2">There was a problem loading the Learn page. This might be due to Google API connectivity issues.</p>
        <p className="text-sm text-gray-600">Try refreshing the page or checking your internet connection.</p>
        <button 
          onClick={() => window.location.reload()} 
          className="mt-4 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
        >
          Reload Page
        </button>
      </div>
    }>
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
    </ErrorBoundary>
  );
};

export default Learn;
