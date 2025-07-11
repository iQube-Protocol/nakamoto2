import { toast } from 'sonner';

// KNYT Token contract details
export const KNYT_TOKEN_CONFIG = {
  address: '0xe53dad36cd0A8EdC656448CE7912bba72beBECb4',
  symbol: 'KNYT',
  decimals: 18,
  network: 'ethereum',
  chainId: '0x1' // Ethereum Mainnet
};

// Balance cache to prevent redundant calls
interface BalanceCache {
  balance: string;
  formatted: string;
  timestamp: number;
  transactionHash?: string;
}

let balanceCache: { [address: string]: BalanceCache } = {};
let pendingBalanceFetches: { [address: string]: Promise<any> } = {};
const CACHE_DURATION = 30000; // 30 seconds cache
const BALANCE_FETCH_TIMEOUT = 15000; // 15 seconds timeout

// Fixed ERC-20 ABI for balance checking
const ERC20_ABI = [
  {
    constant: true,
    inputs: [{ name: '_owner', type: 'address' }],
    name: 'balanceOf',
    outputs: [{ name: 'balance', type: 'uint256' }],
    type: 'function'
  }
];

interface TokenBalanceResult {
  balance: string;
  formatted: string;
  timestamp: number;
  transactionHash?: string;
}

export const knytTokenService = {
  /**
   * Validate that the user is connected to Ethereum Mainnet
   */
  validateNetwork: async (): Promise<boolean> => {
    try {
      if (!window.ethereum) {
        console.error('No Web3 provider found');
        toast.error('No Web3 provider found. Please install MetaMask.');
        return false;
      }

      const chainId = await window.ethereum.request({ method: 'eth_chainId' });
      console.log('Current network chainId:', chainId);
      console.log('Expected chainId:', KNYT_TOKEN_CONFIG.chainId);
      
      if (chainId !== KNYT_TOKEN_CONFIG.chainId) {
        console.error(`Wrong network. Expected ${KNYT_TOKEN_CONFIG.chainId}, got ${chainId}`);
        toast.error(`Please switch to Ethereum Mainnet to view KNYT balance`);
        return false;
      }

      console.log('Network validation successful - connected to Ethereum Mainnet');
      return true;
    } catch (error) {
      console.error('Error validating network:', error);
      toast.error('Failed to validate network connection');
      return false;
    }
  },

  /**
   * Switch to Ethereum Mainnet
   */
  switchToMainnet: async (): Promise<boolean> => {
    try {
      if (!window.ethereum) {
        toast.error('MetaMask not found');
        return false;
      }

      console.log('Attempting to switch to Ethereum Mainnet...');
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: KNYT_TOKEN_CONFIG.chainId }],
      });

      toast.success('Switched to Ethereum Mainnet');
      console.log('Successfully switched to Ethereum Mainnet');
      return true;
    } catch (error: any) {
      console.error('Error switching network:', error);
      if (error.code === 4902) {
        toast.error('Ethereum Mainnet not found in wallet');
      } else if (error.code === 4001) {
        toast.error('Network switch cancelled by user');
      } else {
        toast.error('Failed to switch to Ethereum Mainnet');
      }
      return false;
    }
  },

  /**
   * Check if cached balance is still valid
   */
  getCachedBalance: (walletAddress: string): TokenBalanceResult | null => {
    const cached = balanceCache[walletAddress.toLowerCase()];
    if (cached && (Date.now() - cached.timestamp) < CACHE_DURATION) {
      console.log('📦 Using cached balance for:', walletAddress, cached.formatted);
      return cached;
    }
    return null;
  },

  /**
   * Get KNYT token balance with caching and debouncing
   */
  getTokenBalance: async (walletAddress: string): Promise<TokenBalanceResult | null> => {
    const normalizedAddress = walletAddress.toLowerCase();
    
    // Check cache first
    const cachedBalance = knytTokenService.getCachedBalance(walletAddress);
    if (cachedBalance) {
      return cachedBalance;
    }

    // Check if there's already a pending fetch for this address
    if (pendingBalanceFetches[normalizedAddress]) {
      console.log('⏳ Waiting for existing balance fetch for:', walletAddress);
      try {
        return await pendingBalanceFetches[normalizedAddress];
      } catch (error) {
        console.error('Existing fetch failed:', error);
        delete pendingBalanceFetches[normalizedAddress];
        // Continue with new fetch
      }
    }

    // Create new fetch promise
    const balanceFetchPromise = knytTokenService.fetchBalanceFromBlockchain(walletAddress);
    pendingBalanceFetches[normalizedAddress] = balanceFetchPromise;

    try {
      const result = await balanceFetchPromise;
      
      // Cache the result if successful
      if (result) {
        balanceCache[normalizedAddress] = result;
        console.log('💾 Cached balance for:', walletAddress, result.formatted);
      }
      
      return result;
    } catch (error) {
      console.error('Balance fetch failed:', error);
      
      // If we have a recent cached balance (even if expired), return it as fallback
      const fallbackCached = balanceCache[normalizedAddress];
      if (fallbackCached && (Date.now() - fallbackCached.timestamp) < (CACHE_DURATION * 3)) {
        console.log('🔄 Using fallback cached balance due to fetch error');
        return fallbackCached;
      }
      
      return null;
    } finally {
      // Clean up pending fetch
      delete pendingBalanceFetches[normalizedAddress];
    }
  },

  /**
   * Fetch balance directly from blockchain (internal method)
   */
  fetchBalanceFromBlockchain: async (walletAddress: string): Promise<TokenBalanceResult | null> => {
    return new Promise(async (resolve, reject) => {
      const timeoutId = setTimeout(() => {
        reject(new Error('Balance fetch timeout'));
      }, BALANCE_FETCH_TIMEOUT);

      try {
        console.log('=== KNYT Balance Fetch START ===');
        console.log('Wallet address:', walletAddress);
        console.log('Contract address:', KNYT_TOKEN_CONFIG.address);
        
        if (!window.ethereum) {
          clearTimeout(timeoutId);
          console.error('❌ No Web3 provider found');
          reject(new Error('No Web3 provider found'));
          return;
        }

        // Step 1: Validate network
        console.log('📡 Step 1: Validating network...');
        const currentChainId = await window.ethereum.request({ method: 'eth_chainId' });
        console.log('Current chainId:', currentChainId);
        
        if (currentChainId !== KNYT_TOKEN_CONFIG.chainId) {
          clearTimeout(timeoutId);
          console.error('❌ Wrong network detected');
          reject(new Error('Wrong network - please switch to Ethereum Mainnet'));
          return;
        }
        console.log('✅ Network validation passed');

        // Step 2: Prepare contract call
        console.log('📋 Step 2: Preparing contract call...');
        const functionSignature = '0x70a08231'; // balanceOf function selector
        const paddedAddress = walletAddress.slice(2).toLowerCase().padStart(64, '0');
        const callData = functionSignature + paddedAddress;
        
        console.log('Function signature:', functionSignature);
        console.log('Call data:', callData);

        // Step 3: Make the contract call
        console.log('📞 Step 3: Making contract call...');
        const callParams = {
          to: KNYT_TOKEN_CONFIG.address,
          data: callData
        };

        const result = await window.ethereum.request({
          method: 'eth_call',
          params: [callParams, 'latest']
        });

        console.log('📋 Raw contract response:', result);

        // Step 4: Parse the result
        console.log('🔧 Step 4: Parsing result...');
        
        if (!result || result === '0x' || result === '0x0') {
          console.log('⚠️ Contract returned empty response - balance is 0');
          const zeroBalance = {
            balance: '0',
            formatted: '0 KNYT',
            timestamp: Date.now()
          };
          clearTimeout(timeoutId);
          resolve(zeroBalance);
          return;
        }

        // Convert hex to decimal using BigInt for precision
        const hexValue = result.startsWith('0x') ? result.slice(2) : result;
        console.log('Hex value (without 0x):', hexValue);
        
        if (hexValue.length === 0) {
          console.log('⚠️ Empty hex value - balance is 0');
          const zeroBalance = {
            balance: '0',
            formatted: '0 KNYT',
            timestamp: Date.now()
          };
          clearTimeout(timeoutId);
          resolve(zeroBalance);
          return;
        }

        const balanceWei = BigInt('0x' + hexValue);
        console.log('Balance in Wei (BigInt):', balanceWei.toString());

        // Convert to KNYT tokens (18 decimals)
        const decimals = BigInt(KNYT_TOKEN_CONFIG.decimals);
        const divisor = BigInt(10) ** decimals;
        
        // Use Number conversion for display (should be safe for most token amounts)
        const balanceInTokens = Number(balanceWei) / Number(divisor);
        
        console.log('Balance in KNYT tokens:', balanceInTokens);

        const finalResult = {
          balance: balanceInTokens.toString(),
          formatted: `${balanceInTokens.toLocaleString()} KNYT`,
          timestamp: Date.now()
        };

        console.log('✅ Final balance result:', finalResult);
        console.log('=== KNYT Balance Fetch SUCCESS ===');
        
        clearTimeout(timeoutId);
        resolve(finalResult);

      } catch (error) {
        clearTimeout(timeoutId);
        console.error('=== KNYT Balance Fetch ERROR ===');
        console.error('Error details:', error);
        reject(error);
      }
    });
  },

  /**
   * Add KNYT token to MetaMask - FIXED params structure
   */
  addTokenToWallet: async (): Promise<boolean> => {
    try {
      if (!window.ethereum) {
        toast.error('MetaMask not found');
        return false;
      }

      console.log('Adding KNYT token to wallet with config:', KNYT_TOKEN_CONFIG);

      const wasAdded = await window.ethereum.request({
        method: 'wallet_watchAsset',
        params: [{
          type: 'ERC20',
          options: {
            address: KNYT_TOKEN_CONFIG.address,
            symbol: KNYT_TOKEN_CONFIG.symbol,
            decimals: KNYT_TOKEN_CONFIG.decimals,
          },
        }],
      });

      if (wasAdded) {
        toast.success('KNYT token added to MetaMask');
        console.log('KNYT token successfully added to wallet');
      } else {
        console.log('User declined to add KNYT token');
      }
      return wasAdded;
    } catch (error) {
      console.error('Error adding token to wallet:', error);
      toast.error('Failed to add KNYT token to wallet');
      return false;
    }
  },

  /**
   * Clear balance cache for specific address or all addresses
   */
  clearBalanceCache: (walletAddress?: string): void => {
    if (walletAddress) {
      const normalizedAddress = walletAddress.toLowerCase();
      delete balanceCache[normalizedAddress];
      delete pendingBalanceFetches[normalizedAddress];
      console.log('🗑️ Cleared cache for:', walletAddress);
    } else {
      balanceCache = {};
      pendingBalanceFetches = {};
      console.log('🗑️ Cleared all balance caches');
    }
  },

  /**
   * Format token balance for display
   */
  formatBalance: (balance: string | number): string => {
    const numBalance = typeof balance === 'string' ? parseFloat(balance) : balance;
    if (isNaN(numBalance)) return '0 KNYT';
    return `${numBalance.toLocaleString()} KNYT`;
  },

  /**
   * Monitor for transaction events that might affect KNYT balance
   */
  monitorTransactions: (walletAddress: string, onBalanceChange: (newBalance: TokenBalanceResult) => void) => {
    if (!window.ethereum) return;

    console.log('Setting up KNYT balance monitoring for:', walletAddress);

    const handleAccountsChanged = async (accounts: string[]) => {
      console.log('Accounts changed:', accounts);
      if (accounts.length > 0 && accounts[0] === walletAddress) {
        // Clear cache when account changes
        knytTokenService.clearBalanceCache(walletAddress);
        const newBalance = await knytTokenService.getTokenBalance(walletAddress);
        if (newBalance) {
          onBalanceChange(newBalance);
        }
      }
    };

    const handleChainChanged = async (chainId: string) => {
      console.log('Chain changed to:', chainId);
      if (chainId === KNYT_TOKEN_CONFIG.chainId) {
        // Clear cache when network changes
        knytTokenService.clearBalanceCache(walletAddress);
        const newBalance = await knytTokenService.getTokenBalance(walletAddress);
        if (newBalance) {
          onBalanceChange(newBalance);
        }
      }
    };

    window.ethereum.on('accountsChanged', handleAccountsChanged);
    window.ethereum.on('chainChanged', handleChainChanged);

    return () => {
      if (window.ethereum.removeAllListeners) {
        window.ethereum.removeAllListeners('accountsChanged');
        window.ethereum.removeAllListeners('chainChanged');
      }
    };
  }
};

// Extend window type for ethereum
declare global {
  interface Window {
    ethereum?: {
      request: (options: { method: string; params?: any[] }) => Promise<any>;
      on: (event: string, callback: (...args: any[]) => void) => void;
      removeAllListeners?: (event: string) => void;
    };
  }
}
