export interface AgentMessage {
  id: string;
  sender: 'user' | 'agent' | 'system';
  message: string;
  timestamp: string;
  metadata?: any;
}

export type InteractionType = 'learn' | 'earn' | 'connect' | 'mondai';

export interface MetaQube {
  id?: string;
  name?: string;
  type?: string;
  status?: string;
  data?: any;
  "iQube-Identifier"?: string;
  "iQube-Type"?: string;
  "iQube-Designer"?: string;
  "iQube-Use"?: string;
  "Owner-Type"?: string;
  "Owner-Identifiability"?: string;
  "Date-Minted"?: string;
  "Related-iQubes"?: string[];
  "Risk-Score"?: number;
  [key: string]: any;
}

export interface BlakQube {
  id?: string;
  name?: string;
  type?: string;
  status?: string;
  data?: any;
  user_id?: string;
  "Profession"?: string;
  [key: string]: any;
}

export interface TokenMetrics {
  currentPrice?: number;
  change24h?: number;
  volume24h?: number;
  marketCap?: number;
  circulatingSupply?: number;
  totalSupply?: number;
  price?: number;
  priceChange24h?: number;
  holders?: number;
  allTimeHigh?: number;
  [key: string]: any;
}

export interface CommunityMetrics {
  totalMembers?: number;
  activeMembers?: number;
  totalGroups?: number;
  totalEvents?: number;
  totalMessages?: number;
  totalConnections?: number;
  groupsJoined?: number;
  unreadMessages?: number;
  upcomingEvents?: number;
  [key: string]: any;
}

export interface DashboardMetrics {
  totalUsers?: number;
  activeUsers?: number;
  totalTransactions?: number;
  totalVolume?: number;
  learnProgress?: number;
  earnedTokens?: number;
  connections?: number;
  qubeHealth?: number;
  recentActivity?: any[];
  [key: string]: any;
}

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

export interface KNYTPersona {
  id?: string;
  name?: string;
  type?: string;
  status?: string;
  data?: any;
  "First-Name"?: string;
  [key: string]: any;
}

export interface QryptoPersona {
  id?: string;
  name?: string;
  type?: string;
  status?: string;
  data?: any;
  "First-Name"?: string;
  [key: string]: any;
}
