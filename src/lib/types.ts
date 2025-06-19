// iQube types

export interface MetaQube {
  "iQube-Identifier": string;
  "iQube-Type": string;
  "iQube-Designer": string;
  "iQube-Use": string;
  "Owner-Type": string;
  "Owner-Identifiability": string;
  "Date-Minted": string;
  "Related-iQubes": string[];
  "X-of-Y": string;
  "Sensitivity-Score": number;
  "Verifiability-Score": number;
  "Accuracy-Score": number;
  "Risk-Score": number;
  // Optional extended properties for detailed QubeData
  "Description"?: string;
  "Access-Control"?: string;
  "Encryption-Level"?: string;
  "Created"?: string;
  "Last-Updated"?: string;
  "Version"?: string;
  "Size"?: string;
  "Status"?: string;
  "Network"?: string;
  "Smart-Contract"?: string;
  "IPFS-Hash"?: string;
  "Trust-Score"?: number;
  "Reliability-Index"?: number;
}

// KNYT Persona interface (replacing BlakQube for KNYT)
export interface KNYTPersona {
  id: string;
  user_id: string;
  created_at: string;
  updated_at: string;
  
  // Basic Info
  "First-Name": string;
  "Last-Name": string;
  "KNYT-ID": string;
  "Profession": string;
  "Local-City": string;
  "Email": string;
  "Phone-Number": string;
  "Age": string;
  "Address": string;
  
  // Crypto & Wallet Info
  "EVM-Public-Key": string;
  "BTC-Public-Key": string;
  "ThirdWeb-Public-Key": string;
  "MetaKeep-Public-Key": string;
  "Chain-IDs": string[];
  "Web3-Interests": string[];
  "Tokens-of-Interest": string[];
  
  // Social Media
  "LinkedIn-ID": string;
  "LinkedIn-Profile-URL": string;
  "Twitter-Handle": string;
  "Telegram-Handle": string;
  "Discord-Handle": string;
  "Instagram-Handle": string;
  "YouTube-ID": string;
  "Facebook-ID": string;
  "TikTok-Handle": string;
  
  // KNYT-specific fields
  "OM-Member-Since": string;
  "OM-Tier-Status": string;
  "Metaiye-Shares-Owned": string;
  "Total-Invested": string;
  "KNYT-COYN-Owned": string;
  "Motion-Comics-Owned": string;
  "Paper-Comics-Owned": string;
  "Digital-Comics-Owned": string;
  "KNYT-Posters-Owned": string;
  "KNYT-Cards-Owned": string;
  "Characters-Owned": string;
}

// Qrypto Persona interface
export interface QryptoPersona {
  id: string;
  user_id: string;
  created_at: string;
  updated_at: string;
  
  // Basic Info
  "First-Name": string;
  "Last-Name": string;
  "Qrypto-ID": string;
  "Profession": string;
  "Local-City": string;
  "Email": string;
  
  // Crypto & Wallet Info
  "EVM-Public-Key": string;
  "BTC-Public-Key": string;
  "Chain-IDs": string[];
  "Wallets-of-Interest": string[];
  "Web3-Interests": string[];
  "Tokens-of-Interest": string[];
  
  // Social Media
  "LinkedIn-ID": string;
  "LinkedIn-Profile-URL": string;
  "Twitter-Handle": string;
  "Telegram-Handle": string;
  "Discord-Handle": string;
  "Instagram-Handle": string;
  "GitHub-Handle": string;
  "YouTube-ID": string;
  "Facebook-ID": string;
  "TikTok-Handle": string;
}

// Legacy BlakQube interface (kept for backward compatibility, but deprecated)
export interface BlakQube {
  id: string;
  user_id: string;
  "Profession": string;
  "Web3-Interests": string[];
  "Local-City": string;
  "Email": string;
  "EVM-Public-Key": string;
  "BTC-Public-Key": string;
  "Tokens-of-Interest": string[];
  "Chain-IDs": string[];
  "Wallets-of-Interest": string[];
  "LinkedIn-ID": string;
  "LinkedIn-Profile-URL": string;
  "Twitter-Handle": string;
  "Telegram-Handle": string;
  "Discord-Handle": string;
  "Instagram-Handle": string;
  "GitHub-Handle": string;
  "First-Name": string;
  "Last-Name": string;
  "KNYT-ID": string;
  "Qrypto-ID": string;
  "ThirdWeb-Public-Key": string;
  "YouTube-ID": string;
  "Facebook-ID": string;
  "TikTok-Handle": string;
  "Phone-Number": string;
  "Age": string;
  "Address": string;
  "OM-Member-Since": string;
  "OM-Tier-Status": string;
  "Metaiye-Shares-Owned": string;
  "KNYT-COYN-Owned": string;
  "MetaKeep-Public-Key": string;
  "Motion-Comics-Owned": string;
  "Paper-Comics-Owned": string;
  "Digital-Comics-Owned": string;
  "KNYT-Posters-Owned": string;
  "KNYT-Cards-Owned": string;
  "Characters-Owned": string;
  created_at: string;
  updated_at: string;
}

export interface TokenQube {
  tokenId: string;
  owner: string;
  accessGrants: string[];
  contractAddress: string;
  network: string;
}

export interface DataQube {
  metaQube: MetaQube;
  blakQube?: BlakQube;
  tokenQube: TokenQube;
}

// Agent types
export interface AgentMessage {
  id: string;
  sender: 'user' | 'agent' | 'system';
  message: string;
  timestamp: string;
  attachments?: string[];
  metadata?: {
    version?: string;
    modelUsed?: string;
    contextRetained?: boolean;
    [key: string]: any;
  } | null;
}

export interface AgentConversation {
  messages: AgentMessage[];
  agentType: 'learn' | 'earn' | 'connect' | 'mondai';
}

// Dashboard metrics
export interface DashboardMetrics {
  learnProgress: number;
  earnedTokens: number;
  connections: number;
  qubeHealth: number;
  recentActivity: string[];
}

// Token metrics
export interface TokenMetrics {
  price: number;
  marketCap: number;
  volume24h: number;
  circulatingSupply: number;
  totalSupply: number;
  allTimeHigh: number;
  holders: number;
  priceChange24h: number;
}

// Community metrics
export interface CommunityMetrics {
  totalMembers: number;
  activeMembers: number;
  upcomingEvents: number;
  totalConnections: number;
  groupsJoined: number;
  unreadMessages: number;
}

// User settings
export interface UserSettings {
  connected: {
    linkedin: boolean;
    luma: boolean;
    telegram: boolean;
    twitter: boolean;
    discord: boolean;
    wallet: boolean;
    instagram: boolean;
  };
  dataSync: boolean;
  notifications: boolean;
  theme: 'dark' | 'light';
  language: string;
}
