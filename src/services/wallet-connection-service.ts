import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { knytTokenService } from './knyt-token-service';

// Track wallet connection state to prevent duplicates
let isWalletConnecting = false;
let connectionTimeout: NodeJS.Timeout | null = null;

export const walletConnectionService = {
  /**
   * Connect wallet with comprehensive debugging and data sync
   */
  connectWallet: async (): Promise<boolean> => {
    if (isWalletConnecting) {
      console.log('Wallet connection already in progress');
      toast.error('Wallet connection is already in progress. Please wait.');
      return false;
    }
    
    isWalletConnecting = true;
    
    try {
      console.log('=== WALLET CONNECTION START ===');
      
      // Check if Web3 provider exists
      if (typeof window.ethereum === 'undefined') {
        toast.error('No Web3 provider found. Please install MetaMask or another Web3 wallet.');
        return false;
      }
      
      // Validate network before connecting
      console.log('🌐 Validating network...');
      const isValidNetwork = await knytTokenService.validateNetwork();
      if (!isValidNetwork) {
        console.log('❌ Invalid network, attempting to switch...');
        const switched = await knytTokenService.switchToMainnet();
        if (!switched) {
          return false;
        }
      }
      console.log('✅ Network validation passed');
      
      // Set a timeout for the wallet connection
      const timeoutPromise = new Promise<never>((_, reject) => {
        connectionTimeout = setTimeout(() => {
          reject(new Error('Wallet connection timeout'));
        }, 30000);
      });
      
      // Request account access with timeout
      console.log('🔐 Requesting account access...');
      const accountsPromise = window.ethereum.request({ method: 'eth_requestAccounts' });
      
      let accounts;
      try {
        accounts = await Promise.race([accountsPromise, timeoutPromise]);
      } catch (error) {
        if (connectionTimeout) {
          clearTimeout(connectionTimeout);
          connectionTimeout = null;
        }
        
        if (error instanceof Error && error.message.includes('timeout')) {
          toast.error('Wallet connection timed out. Please try again.');
          return false;
        }
        throw error;
      }
      
      if (connectionTimeout) {
        clearTimeout(connectionTimeout);
        connectionTimeout = null;
      }
      
      if (!accounts || accounts.length === 0) {
        toast.error('No wallet accounts found. Please make sure your wallet is unlocked.');
        return false;
      }
      
      const walletAddress = accounts[0];
      console.log('✅ Wallet connected:', walletAddress);
      
      // Create a message for the user to sign
      const message = `Please sign this message to verify your wallet ownership.\n\nWallet: ${walletAddress}\nTimestamp: ${new Date().toISOString()}`;
      
      try {
        console.log('✍️ Requesting signature...');
        const signaturePromise = window.ethereum.request({
          method: 'personal_sign',
          params: [message, walletAddress],
        });
        
        const signatureTimeoutPromise = new Promise<never>((_, reject) => {
          connectionTimeout = setTimeout(() => {
            reject(new Error('Signature timeout'));
          }, 60000);
        });
        
        let signature;
        try {
          signature = await Promise.race([signaturePromise, signatureTimeoutPromise]);
        } catch (error) {
          if (connectionTimeout) {
            clearTimeout(connectionTimeout);
            connectionTimeout = null;
          }
          
          if (error instanceof Error && error.message.includes('timeout')) {
            toast.error('Signature request timed out. Please try again.');
            return false;
          }
          throw error;
        }
        
        if (connectionTimeout) {
          clearTimeout(connectionTimeout);
          connectionTimeout = null;
        }
        
        console.log('✅ Signature received');
        
        // Get KNYT token balance with comprehensive logging
        console.log('💰 Fetching KNYT token balance...');
        const tokenBalance = await knytTokenService.getTokenBalance(walletAddress);
        console.log('Token balance result:', tokenBalance);
        
        // Get user
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          toast.error('You must be logged in to connect a wallet.');
          return false;
        }

        // Save wallet connection to database with comprehensive data
        console.log('💾 Saving wallet connection to database...');
        const connectionData = { 
          address: walletAddress,
          signature: signature,
          message: message,
          signedAt: new Date().toISOString(),
          knytTokenBalance: tokenBalance ? {
            balance: tokenBalance.balance,
            formatted: tokenBalance.formatted,
            lastUpdated: tokenBalance.timestamp,
            transactionHash: tokenBalance.transactionHash
          } : null
        };

        const { error: connectionError } = await supabase
          .from('user_connections')
          .upsert({
            user_id: user.id,
            service: 'wallet',
            connected_at: new Date().toISOString(),
            connection_data: connectionData
          });
        
        if (connectionError) {
          console.error('❌ Error saving wallet connection:', connectionError);
          toast.error('Failed to save wallet connection.');
          return false;
        }

        console.log('✅ Wallet connection saved successfully');
        
        // Update persona data after successful wallet connection
        try {
          console.log('👤 Updating persona data...');
          const { blakQubeService } = await import('./blakqube-service');
          
          // Update both KNYT and Qrypto personas with comprehensive logging
          console.log('🔄 Updating KNYT persona...');
          const knytUpdateSuccess = await blakQubeService.updatePersonaFromConnections('knyt');
          console.log('KNYT persona update result:', knytUpdateSuccess);
          
          console.log('🔄 Updating Qrypto persona...');
          const qryptoUpdateSuccess = await blakQubeService.updatePersonaFromConnections('qrypto');
          console.log('Qrypto persona update result:', qryptoUpdateSuccess);
          
          if (knytUpdateSuccess || qryptoUpdateSuccess) {
            console.log('✅ Persona data updated successfully');
            
            // Dispatch comprehensive events to notify UI components
            const events = ['privateDataUpdated', 'personaDataUpdated', 'balanceUpdated', 'walletDataRefreshed'];
            events.forEach(eventName => {
              const event = new CustomEvent(eventName, {
                detail: {
                  balance: tokenBalance?.formatted || '0 KNYT',
                  address: walletAddress,
                  timestamp: tokenBalance?.timestamp || Date.now()
                }
              });
              console.log(`📡 Dispatching event: ${eventName}`);
              window.dispatchEvent(event);
            });
          }
        } catch (updateError) {
          console.error('❌ Error updating persona data:', updateError);
          // Don't fail the whole connection for this
        }
        
        // Show success message with balance information
        if (tokenBalance && parseFloat(tokenBalance.balance) > 0) {
          toast.success(`Wallet connected successfully! KNYT Balance: ${tokenBalance.formatted}`);
        } else {
          toast.success('Wallet connected and signature verified successfully!');
          if (tokenBalance && tokenBalance.balance === '0') {
            toast.info('KNYT balance is 0. Make sure you have KNYT tokens on Ethereum Mainnet.');
          }
        }
        
        console.log('=== WALLET CONNECTION SUCCESS ===');
        return true;
        
      } catch (signError: any) {
        console.error('❌ Error during signing process:', signError);
        if (signError.code === 4001) {
          toast.error('Wallet connection cancelled by user.');
        } else {
          toast.error('Failed to sign message. Wallet connection cancelled.');
        }
        return false;
      }
    } catch (error: any) {
      console.error('❌ Error connecting wallet:', error);
      if (error.code === 4001) {
        toast.error('Wallet connection cancelled by user.');
      } else {
        toast.error('Failed to connect wallet. Please try again.');
      }
      return false;
    } finally {
      isWalletConnecting = false;
      if (connectionTimeout) {
        clearTimeout(connectionTimeout);
        connectionTimeout = null;
      }
      console.log('=== WALLET CONNECTION END ===');
    }
  },

  /**
   * Update existing wallet connection with KNYT balance
   */
  updateWalletWithKnytBalance: async (): Promise<boolean> => {
    try {
      console.log('=== UPDATE WALLET WITH KNYT BALANCE START ===');
      
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        console.log('❌ No user found');
        return false;
      }

      // Get current wallet connection
      const { data: connections } = await supabase
        .from('user_connections')
        .select('*')
        .eq('user_id', user.id)
        .eq('service', 'wallet')
        .single();

      if (!connections || !connections.connection_data) {
        console.log('❌ No wallet connection found');
        return false;
      }

      const connectionData = connections.connection_data as Record<string, any>;
      const walletAddress = connectionData?.address;

      if (!walletAddress) {
        console.log('❌ No wallet address found in connection data');
        return false;
      }

      console.log('💰 Fetching updated KNYT balance for:', walletAddress);

      // Get updated token balance with comprehensive debugging
      const tokenBalance = await knytTokenService.getTokenBalance(walletAddress);
      if (!tokenBalance) {
        console.log('❌ Failed to fetch token balance');
        return false;
      }

      console.log('✅ Token balance fetched:', tokenBalance);

      // Update connection data with new balance
      const updatedConnectionData = {
        ...connectionData,
        knytTokenBalance: {
          balance: tokenBalance.balance,
          formatted: tokenBalance.formatted,
          lastUpdated: tokenBalance.timestamp,
          transactionHash: tokenBalance.transactionHash
        }
      };

      console.log('💾 Updating database with new balance...');
      const { error } = await supabase
        .from('user_connections')
        .update({ 
          connection_data: updatedConnectionData,
          connected_at: new Date().toISOString() 
        })
        .eq('id', connections.id);

      if (error) {
        console.error('❌ Error updating wallet connection:', error);
        return false;
      }

      console.log('✅ Database updated with KNYT balance:', tokenBalance.formatted);
      
      // Trigger persona data update after balance update
      try {
        console.log('👤 Updating persona data after balance refresh...');
        const { blakQubeService } = await import('./blakqube-service');
        
        const knytSuccess = await blakQubeService.updatePersonaFromConnections('knyt');
        const qryptoSuccess = await blakQubeService.updatePersonaFromConnections('qrypto');
        
        console.log('KNYT persona update success:', knytSuccess);
        console.log('Qrypto persona update success:', qryptoSuccess);
        
        if (knytSuccess || qryptoSuccess) {
          // Dispatch comprehensive events
          const events = ['privateDataUpdated', 'personaDataUpdated', 'balanceUpdated', 'walletDataRefreshed'];
          events.forEach(eventName => {
            const event = new CustomEvent(eventName, {
              detail: {
                balance: tokenBalance.formatted,
                address: walletAddress,
                timestamp: tokenBalance.timestamp
              }
            });
            console.log(`📡 Dispatching event: ${eventName}`);
            window.dispatchEvent(event);
          });
        }
      } catch (updateError) {
        console.error('❌ Error updating persona data:', updateError);
      }
      
      console.log('=== UPDATE WALLET WITH KNYT BALANCE SUCCESS ===');
      return true;
    } catch (error) {
      console.error('❌ Error updating wallet with KNYT balance:', error);
      return false;
    }
  },

  /**
   * Refresh KNYT token balance for connected wallet
   */
  refreshKnytBalance: async (): Promise<boolean> => {
    try {
      console.log('=== REFRESH KNYT BALANCE START ===');
      
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return false;

      // Get current wallet connection
      const { data: connections } = await supabase
        .from('user_connections')
        .select('*')
        .eq('user_id', user.id)
        .eq('service', 'wallet')
        .single();

      if (!connections || !connections.connection_data) {
        console.log('❌ No wallet connection found');
        return false;
      }

      const connectionData = connections.connection_data as Record<string, any>;
      const walletAddress = connectionData?.address;

      if (!walletAddress) {
        console.log('❌ No wallet address found');
        return false;
      }

      console.log('💰 Refreshing KNYT balance for:', walletAddress);

      // Get updated token balance
      const tokenBalance = await knytTokenService.getTokenBalance(walletAddress);
      if (!tokenBalance) return false;

      // Update connection data
      const updatedConnectionData = {
        ...connectionData,
        knytTokenBalance: {
          balance: tokenBalance.balance,
          formatted: tokenBalance.formatted,
          lastUpdated: tokenBalance.timestamp,
          transactionHash: tokenBalance.transactionHash
        }
      };

      const { error } = await supabase
        .from('user_connections')
        .update({ 
          connection_data: updatedConnectionData,
          connected_at: new Date().toISOString() 
        })
        .eq('id', connections.id);

      if (error) {
        console.error('❌ Error updating wallet connection:', error);
        return false;
      }

      console.log('✅ KNYT balance refreshed successfully:', tokenBalance.formatted);
      
      // Trigger comprehensive persona data update
      try {
        console.log('👤 Updating persona data after balance refresh...');
        const { blakQubeService } = await import('./blakqube-service');
        
        const knytSuccess = await blakQubeService.updatePersonaFromConnections('knyt');
        const qryptoSuccess = await blakQubeService.updatePersonaFromConnections('qrypto');
        
        console.log('KNYT persona update success:', knytSuccess);
        console.log('Qrypto persona update success:', qryptoSuccess);
        
        if (knytSuccess || qryptoSuccess) {
          // Dispatch comprehensive events
          const events = ['privateDataUpdated', 'personaDataUpdated', 'balanceUpdated', 'walletDataRefreshed'];
          events.forEach(eventName => {
            const event = new CustomEvent(eventName, { 
              detail: { 
                balance: tokenBalance.formatted,
                address: walletAddress,
                timestamp: tokenBalance.timestamp
              }
            });
            console.log(`📡 Dispatching event: ${eventName}`);
            window.dispatchEvent(event);
          });
          
          console.log('✅ Persona data updated and events dispatched');
        }
      } catch (updateError) {
        console.error('❌ Error updating persona data:', updateError);
      }
      
      toast.success(`KNYT balance updated: ${tokenBalance.formatted}`);
      
      console.log('=== REFRESH KNYT BALANCE SUCCESS ===');
      return true;
    } catch (error) {
      console.error('❌ Error refreshing KNYT balance:', error);
      return false;
    }
  },
  
  /**
   * Check if wallet is currently connecting
   */
  isConnecting: (): boolean => {
    return isWalletConnecting;
  },
  
  /**
   * Cancel any ongoing wallet connection
   */
  cancelConnection: (): void => {
    if (connectionTimeout) {
      clearTimeout(connectionTimeout);
      connectionTimeout = null;
    }
    isWalletConnecting = false;
  }
};

// Add TypeScript support for window.ethereum
declare global {
  interface Window {
    ethereum?: {
      request: (options: { method: string; params?: any[] }) => Promise<any>;
      on: (event: string, callback: (...args: any[]) => void) => void;
      removeAllListeners?: (event: string) => void;
    };
  }
}
