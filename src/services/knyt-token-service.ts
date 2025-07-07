
import { toast } from 'sonner';

// KNYT Token contract details
export const KNYT_TOKEN_CONFIG = {
  address: '0xe53dad36cd0A8EdC656448CE7912bba72beBECb4',
  symbol: 'KNYT',
  decimals: 18,
  network: 'ethereum',
  chainId: '0x1' // Ethereum Mainnet
};

// ERC-20 ABI for balance checking
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
        return false;
      }

      const chainId = await window.ethereum.request({ method: 'eth_chainId' });
      console.log('Current network chainId:', chainId);
      
      if (chainId !== KNYT_TOKEN_CONFIG.chainId) {
        console.error(`Wrong network. Expected ${KNYT_TOKEN_CONFIG.chainId}, got ${chainId}`);
        toast.error(`Please switch to Ethereum Mainnet to view KNYT balance`);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error validating network:', error);
      return false;
    }
  },

  /**
   * Switch to Ethereum Mainnet
   */
  switchToMainnet: async (): Promise<boolean> => {
    try {
      if (!window.ethereum) return false;

      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: KNYT_TOKEN_CONFIG.chainId }],
      });

      toast.success('Switched to Ethereum Mainnet');
      return true;
    } catch (error: any) {
      console.error('Error switching network:', error);
      if (error.code === 4902) {
        toast.error('Ethereum Mainnet not found in wallet');
      } else {
        toast.error('Failed to switch to Ethereum Mainnet');
      }
      return false;
    }
  },

  /**
   * Get KNYT token balance for a wallet address with enhanced debugging
   */
  getTokenBalance: async (walletAddress: string): Promise<TokenBalanceResult | null> => {
    try {
      console.log('Starting KNYT balance fetch for address:', walletAddress);
      console.log('Using contract address:', KNYT_TOKEN_CONFIG.address);
      
      if (!window.ethereum) {
        console.error('No Web3 provider found');
        toast.error('No Web3 provider found. Please install MetaMask.');
        return null;
      }

      // Validate network first
      const isValidNetwork = await knytTokenService.validateNetwork();
      if (!isValidNetwork) {
        console.error('Network validation failed');
        return null;
      }

      // Request access to the user's accounts
      const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
      console.log('Connected accounts:', accounts);

      // Construct the contract call data
      const paddedAddress = walletAddress.slice(2).padStart(64, '0');
      const data = `0x70a08231000000000000000000000000${paddedAddress}`;
      console.log('Contract call data:', data);

      // Make the contract call
      console.log('Making eth_call to contract...');
      const result = await window.ethereum.request({
        method: 'eth_call',
        params: [{
          to: KNYT_TOKEN_CONFIG.address,
          data: data
        }, 'latest']
      });

      console.log('Raw contract response:', result);

      if (!result || result === '0x' || result === '0x0') {
        console.log('No balance found or contract returned empty response');
        return {
          balance: '0',
          formatted: '0 KNYT',
          timestamp: Date.now()
        };
      }

      // Convert hex result to decimal
      let balanceWei;
      try {
        balanceWei = parseInt(result, 16);
        console.log('Balance in Wei (raw):', balanceWei);
      } catch (parseError) {
        console.error('Error parsing hex result:', parseError);
        toast.error('Error parsing balance data from blockchain');
        return null;
      }

      // Convert to token units (divide by 10^18 for 18 decimals)
      const balanceEther = balanceWei / Math.pow(10, KNYT_TOKEN_CONFIG.decimals);
      console.log('Balance in KNYT tokens:', balanceEther);

      const result_data = {
        balance: balanceEther.toString(),
        formatted: `${balanceEther.toLocaleString()} KNYT`,
        timestamp: Date.now()
      };

      console.log('Final balance result:', result_data);
      return result_data;

    } catch (error) {
      console.error('Error fetching KNYT token balance:', error);
      toast.error('Failed to fetch KNYT balance. Please try again.');
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

    const handleTransaction = async (txHash: string) => {
      console.log('Transaction detected:', txHash);
      
      // Wait a bit for transaction to be mined
      setTimeout(async () => {
        const newBalance = await knytTokenService.getTokenBalance(walletAddress);
        if (newBalance) {
          newBalance.transactionHash = txHash;
          onBalanceChange(newBalance);
        }
      }, 5000);
    };

    // Listen for account changes
    const handleAccountsChanged = async (accounts: string[]) => {
      console.log('Accounts changed:', accounts);
      if (accounts.length > 0 && accounts[0] === walletAddress) {
        const newBalance = await knytTokenService.getTokenBalance(walletAddress);
        if (newBalance) {
          onBalanceChange(newBalance);
        }
      }
    };

    // Listen for network changes
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
