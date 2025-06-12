
import { MetaQube } from '@/lib/types';

// Agent Nakamoto without Venice activated
export const nakamotoBaseQubeData: MetaQube = {
  "iQube-Identifier": "Nakamoto Agent iQube",
  "iQube-Type": "AgentQube",
  "iQube-Designer": "Aigent Nakamoto",
  "iQube-Use": "AI agent for crypto analysis and trading insights",
  "Owner-Type": "Person",
  "Owner-Identifiability": "Semi-Identifiable",
  "Date-Minted": "2024-03-01",
  "Related-iQubes": ["VeniceQube"],
  "X-of-Y": "1 of 2",
  "Description": "AI agent for crypto analysis and trading insights",
  "Access-Control": "Private",
  "Encryption-Level": "AES-256",
  "Created": "2024-03-01",
  "Last-Updated": "2024-03-20",
  "Version": "1.0.0",
  "Size": "2.1 MB",
  "Status": "Active",
  "Network": "Ethereum",
  "Smart-Contract": "0xd08f70Jj2198G0087K93iI",
  "IPFS-Hash": "QmEuv0lW9WknFiJnKLwHCnL78vedxjQkDDP1mXWo2ajt",
  "Sensitivity-Score": 4,
  "Verifiability-Score": 5,
  "Accuracy-Score": 5,
  "Risk-Score": 5
};

// Agent Nakamoto with Venice activated
export const nakamotoWithVeniceQubeData: MetaQube = {
  "iQube-Identifier": "Nakamoto Agent iQube",
  "iQube-Type": "AgentQube",
  "iQube-Designer": "Aigent Nakamoto",
  "iQube-Use": "AI agent for crypto analysis and trading insights with Venice privacy protection",
  "Owner-Type": "Person",
  "Owner-Identifiability": "Semi-Identifiable",
  "Date-Minted": "2024-03-01",
  "Related-iQubes": ["VeniceQube"],
  "X-of-Y": "1 of 2",
  "Description": "AI agent for crypto analysis and trading insights with Venice privacy protection",
  "Access-Control": "Private",
  "Encryption-Level": "AES-256",
  "Created": "2024-03-01",
  "Last-Updated": "2024-03-20",
  "Version": "1.1.0",
  "Size": "2.3 MB",
  "Status": "Active",
  "Network": "Ethereum",
  "Smart-Contract": "0xd08f70Jj2198G0087K93iI",
  "IPFS-Hash": "QmEuv0lW9WknFiJnKLwHCnL78vedxjQkDDP1mXWo2ajt",
  "Sensitivity-Score": 2,
  "Verifiability-Score": 9,
  "Accuracy-Score": 5,
  "Risk-Score": 2
};

export const agentQubeData = {
  nakamotoBase: nakamotoBaseQubeData,
  nakamotoWithVenice: nakamotoWithVeniceQubeData
};
