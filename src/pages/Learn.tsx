
import React, { useState, useEffect } from 'react';
import LearnInterface from '@/components/learn/LearnInterface';
import { MetaQube, BlakQube } from '@/lib/types';
import { TooltipProvider } from '@/components/ui/tooltip';
import { ErrorBoundary } from '@/components/shared/ErrorBoundary';
import { useMCP } from '@/hooks/use-mcp';
import { toast } from 'sonner';
import { Loader2, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

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
  const { isApiLoading, driveConnected, resetConnection } = useMCP();
  const [apiLoadAttempted, setApiLoadAttempted] = useState(false);
  const [apiLoadError, setApiLoadError] = useState(false);
  const [apiLoadTimeout, setApiLoadTimeout] = useState<NodeJS.Timeout | null>(null);
  
  // Track API loading state and display appropriate notifications
  useEffect(() => {
    if (isApiLoading) {
      setApiLoadAttempted(true);
      
      // Clean up any stale connection state
      if (localStorage.getItem('gdrive-connected') === 'true' && !driveConnected) {
        console.log('Inconsistent connection state detected - resetting');
        localStorage.removeItem('gdrive-connected');
        localStorage.removeItem('gdrive-auth-token');
      }
      
      // Set a timeout to detect stuck API loading
      if (apiLoadTimeout) clearTimeout(apiLoadTimeout);
      
      const timeout = setTimeout(() => {
        console.warn('Google API loading taking too long');
        setApiLoadError(true);
      }, 10000); // 10 seconds
      
      setApiLoadTimeout(timeout);
    } else if (apiLoadAttempted) {
      // API loading finished after being attempted
      if (apiLoadTimeout) {
        clearTimeout(apiLoadTimeout);
        setApiLoadTimeout(null);
      }
      
      if (!apiLoadError) {
        toast.success('Learn page loaded', {
          description: 'Document features are now available'
        });
      }
    }
    
    return () => {
      if (apiLoadTimeout) {
        clearTimeout(apiLoadTimeout);
      }
    };
  }, [isApiLoading, apiLoadAttempted, driveConnected]);

  const handleResetConnection = () => {
    resetConnection();
    setApiLoadError(false);
    toast.success('Connection state reset', {
      description: 'You can now try connecting again'
    });
    
    // Force reload after a short delay
    setTimeout(() => {
      window.location.reload();
    }, 1000);
  };
  
  // Display loading state when API is loading
  if (isApiLoading && !apiLoadError) {
    return (
      <div className="flex flex-col items-center justify-center h-[calc(100vh-100px)]">
        <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
        <h2 className="text-2xl font-semibold mb-2">Loading Google API</h2>
        <p className="text-gray-600 mb-4">Please wait while we initialize document features...</p>
      </div>
    );
  }
  
  // Display error state if API loading took too long or failed
  if (apiLoadError) {
    return (
      <div className="flex flex-col items-center justify-center h-[calc(100vh-100px)] p-4">
        <AlertCircle className="h-12 w-12 text-red-500 mb-4" />
        <h2 className="text-2xl font-semibold mb-2">Google API Connection Issue</h2>
        <p className="text-gray-600 mb-4 text-center max-w-md">
          There was an issue connecting to Google API. The Learn page will still work, but document features may be limited.
        </p>
        <div className="flex space-x-4">
          <Button 
            onClick={() => window.location.reload()} 
            className="mt-2"
          >
            Retry Connection
          </Button>
          <Button 
            onClick={handleResetConnection} 
            className="mt-2"
            variant="outline"
          >
            Reset Connection
          </Button>
        </div>
      </div>
    );
  }
  
  return (
    <ErrorBoundary fallback={
      <div className="p-4 border border-red-300 bg-red-50 rounded">
        <h2 className="text-lg font-semibold text-red-700 mb-2">Error in Learn Page</h2>
        <p className="mb-2">There was a problem loading the Learn page. This might be due to Google API connectivity issues.</p>
        <p className="text-sm text-gray-600">Try refreshing the page or checking your internet connection.</p>
        <div className="flex space-x-4 mt-4">
          <Button 
            onClick={() => window.location.reload()} 
            className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
          >
            Reload Page
          </Button>
          <Button 
            onClick={handleResetConnection} 
            variant="outline"
          >
            Reset Connection
          </Button>
        </div>
      </div>
    }>
      <TooltipProvider>
        <div className="container p-2 h-[calc(100vh-100px)]">
          <div className="flex justify-between items-center mb-3">
            <h1 className="text-2xl font-bold tracking-tight">Learn</h1>
            {!driveConnected && (
              <div className="text-sm text-amber-600 bg-amber-50 px-2 py-1 rounded-md border border-amber-200 flex items-center">
                <AlertCircle className="h-4 w-4 mr-1" />
                Not connected to Google Drive
              </div>
            )}
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
