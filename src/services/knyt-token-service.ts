
import { toast } from 'sonner';

// KNYT Token contract details
export const KNYT_TOKEN_CONFIG = {
  address: '0xe53dad36cd0A8EdC656448CE7912bba72beBECb4',
  symbol: 'KNYT',
  decimals: 18,
  network: 'ethereum'
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
   * Get KNYT token balance for a wallet address
   */
  getTokenBalance: async (walletAddress: string): Promise<TokenBalanceResult | null> => {
    try {
      console.log('Fetching KNYT token balance for address:', walletAddress);
      
      if (!window.ethereum) {
        console.error('No Web3 provider found');
        return null;
      }

      // Request access to the user's accounts
      await window.ethereum.request({ method: 'eth_requestAccounts' });

      // Create contract instance
      const web3 = window.ethereum;
      
      // Get the balance using eth_call
      const data = `0x70a08231000000000000000000000000${walletAddress.slice(2).padStart(64, '0')}`;
      
      const result = await web3.request({
        method: 'eth_call',
        params: [{
          to: KNYT_TOKEN_CONFIG.address,
          data: data
        }, 'latest']
      });

      if (!result || result === '0x') {
        console.log('No balance found or invalid response');
        return {
          balance: '0',
          formatted: '0 $KNYT',
          timestamp: Date.now()
        };
      }

      // Convert hex result to decimal
      const balanceWei = parseInt(result, 16);
      const balanceEther = balanceWei / Math.pow(10, KNYT_TOKEN_CONFIG.decimals);
      
      console.log('KNYT balance retrieved:', balanceEther);

      return {
        balance: balanceEther.toString(),
        formatted: `${balanceEther.toLocaleString()} $KNYT`,
        timestamp: Date.now()
      };

    } catch (error) {
      console.error('Error fetching KNYT token balance:', error);
      return null;
    }
  },

  /**
   * Format token balance for display
   */
  formatBalance: (balance: string | number): string => {
    const numBalance = typeof balance === 'string' ? parseFloat(balance) : balance;
    if (isNaN(numBalance)) return '0 $KNYT';
    return `${numBalance.toLocaleString()} $KNYT`;
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

    // Listen for new blocks to check for transactions
    window.ethereum.on('blockNumber', () => {
      // This is a simplified approach - in production you'd want more sophisticated monitoring
      console.log('New block detected, checking for balance changes...');
    });

    return () => {
      if (window.ethereum.removeAllListeners) {
        window.ethereum.removeAllListeners('blockNumber');
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
