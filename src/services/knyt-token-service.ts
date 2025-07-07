import { toast } from 'sonner';

// KNYT Token contract details
export const KNYT_TOKEN_CONFIG = {
  address: '0xe53dad36cd0A8EdC656448CE7912bba72beBECb4',
  symbol: 'KNYT',
  decimals: 18,
  network: 'ethereum',
  chainId: '0x1' // Ethereum Mainnet
};

// Fixed ERC-20 ABI for balance checking
const ERC20_ABI = [
  {
    constant: true,
    inputs: [{ name: '_owner', type: 'address' }],
    name: 'balanceOf',
    outputs: [{ name: 'balance', type: 'uint256' }]
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
   * Get KNYT token balance for a wallet address with enhanced debugging and improved logic
   */
  getTokenBalance: async (walletAddress: string): Promise<TokenBalanceResult | null> => {
    try {
      console.log('=== KNYT Balance Fetch Debug ===');
      console.log('Starting KNYT balance fetch for address:', walletAddress);
      console.log('Using contract address:', KNYT_TOKEN_CONFIG.address);
      console.log('Target network:', KNYT_TOKEN_CONFIG.network);
      console.log('Expected chainId:', KNYT_TOKEN_CONFIG.chainId);
      
      if (!window.ethereum) {
        console.error('No Web3 provider found');
        toast.error('No Web3 provider found. Please install MetaMask.');
        return null;
      }

      // Validate network first
      console.log('Step 1: Validating network...');
      const isValidNetwork = await knytTokenService.validateNetwork();
      if (!isValidNetwork) {
        console.error('Network validation failed - stopping balance fetch');
        return null;
      }

      // Request access to the user's accounts
      console.log('Step 2: Requesting account access...');
      const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
      console.log('Connected accounts:', accounts);

      if (!accounts || accounts.length === 0) {
        console.error('No accounts found');
        toast.error('No wallet accounts found. Please unlock your wallet.');
        return null;
      }

      // Construct the contract call data for balanceOf(address) - FIXED METHOD
      console.log('Step 3: Constructing contract call...');
      
      // Remove 0x prefix from address and pad to 32 bytes (64 hex chars)
      const cleanAddress = walletAddress.replace('0x', '').toLowerCase();
      const paddedAddress = cleanAddress.padStart(64, '0');
      
      // balanceOf function signature: 0x70a08231
      const functionSelector = '0x70a08231';
      const data = functionSelector + paddedAddress;
      
      console.log('Function selector (balanceOf):', functionSelector);
      console.log('Clean address:', cleanAddress);
      console.log('Padded address:', paddedAddress);
      console.log('Final contract call data:', data);

      // Make the contract call with improved parameters
      console.log('Step 4: Making eth_call to contract...');
      const callParams = {
        to: KNYT_TOKEN_CONFIG.address.toLowerCase(),
        data: data
      };
      console.log('Call parameters:', callParams);

      const result = await window.ethereum.request({
        method: 'eth_call',
        params: [callParams, 'latest']
      });

      console.log('Raw contract response:', result);

      if (!result || result === '0x' || result === '0x0') {
        console.log('Contract returned empty response - balance is 0');
        return {
          balance: '0',
          formatted: '0 KNYT',
          timestamp: Date.now()
        };
      }

      // Convert hex result to decimal with improved parsing
      console.log('Step 5: Converting hex to decimal...');
      let balanceWei: bigint;
      try {
        // Remove 0x prefix if present and convert
        const hexValue = result.startsWith('0x') ? result.slice(2) : result;
        console.log('Hex value (without 0x):', hexValue);
        
        // Use BigInt for large numbers to avoid precision loss
        balanceWei = BigInt('0x' + hexValue);
        console.log('Balance in Wei (BigInt):', balanceWei.toString());
      } catch (parseError) {
        console.error('Error parsing hex result:', parseError);
        toast.error('Error parsing balance data from blockchain');
        return null;
      }

      // Convert to token units (divide by 10^18 for 18 decimals) - IMPROVED CALCULATION
      console.log('Step 6: Converting to token units...');
      const decimals = KNYT_TOKEN_CONFIG.decimals;
      const divisor = BigInt(10) ** BigInt(decimals);
      console.log('Decimals:', decimals);
      console.log('Divisor (BigInt):', divisor.toString());
      
      // Calculate balance with proper decimal handling
      const balanceInTokens = Number(balanceWei) / Number(divisor);
      
      console.log('Balance in KNYT tokens:', balanceInTokens);

      const result_data = {
        balance: balanceInTokens.toString(),
        formatted: `${balanceInTokens.toLocaleString()} KNYT`,
        timestamp: Date.now()
      };

      console.log('Final balance result:', result_data);
      console.log('=== KNYT Balance Fetch Complete ===');
      
      return result_data;

    } catch (error) {
      console.error('=== KNYT Balance Fetch Error ===');
      console.error('Error fetching KNYT token balance:', error);
      console.error('Error details:', {
        message: error instanceof Error ? error.message : 'Unknown error',
        code: (error as any)?.code,
        data: (error as any)?.data
      });
      
      // More specific error messages
      if ((error as any)?.code === 4001) {
        toast.error('User cancelled the balance request');
      } else if ((error as any)?.code === -32002) {
        toast.error('Please unlock your MetaMask wallet');
      } else if ((error as any)?.message?.includes('network')) {
        toast.error('Network error - please check your connection');
      } else {
        toast.error('Failed to fetch KNYT balance. Please try refreshing.');
      }
      
      return null;
    }
  },

  /**
   * Add KNYT token to MetaMask
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
        params: {
          type: 'ERC20',
          options: {
            address: KNYT_TOKEN_CONFIG.address,
            symbol: KNYT_TOKEN_CONFIG.symbol,
            decimals: KNYT_TOKEN_CONFIG.decimals,
          },
        },
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
        const newBalance = await knytTokenService.getTokenBalance(walletAddress);
        if (newBalance) {
          onBalanceChange(newBalance);
        }
      }
    };

    const handleChainChanged = async (chainId: string) => {
      console.log('Chain changed to:', chainId);
      if (chainId === KNYT_TOKEN_CONFIG.chainId) {
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
