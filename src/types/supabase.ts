
import { Database } from '@/integrations/supabase/types';

export type UserConnection = {
  id: string;
  user_id: string;
  service: string;
  connected_at: string;
  connection_data: any;
  created_at: string;
}

export type Tables = Database['public']['Tables'];

// Add these new types to represent our database tables
export type UserConnectionTable = {
  Row: UserConnection;
  Insert: Omit<UserConnection, 'id' | 'created_at'>;
  Update: Partial<Omit<UserConnection, 'id' | 'created_at'>>;
}

export type KNYTPersonaTable = {
  Row: {
    id: string;
    user_id: string;
    created_at: string;
    updated_at: string;
    "First-Name": string;
    "Last-Name": string;
    "KNYT-ID": string;
    "Profession": string;
    "Local-City": string;
    "Email": string;
    "Phone-Number": string;
    "Age": string;
    "Address": string;
    "EVM-Public-Key": string;
    "BTC-Public-Key": string;
    "ThirdWeb-Public-Key": string;
    "MetaKeep-Public-Key": string;
    "Chain-IDs": string[];
    "Web3-Interests": string[];
    "Tokens-of-Interest": string[];
    "LinkedIn-ID": string;
    "LinkedIn-Profile-URL": string;
    "Twitter-Handle": string;
    "Telegram-Handle": string;
    "Discord-Handle": string;
    "Instagram-Handle": string;
    "YouTube-ID": string;
    "Facebook-ID": string;
    "TikTok-Handle": string;
    "OM-Member-Since": string;
    "OM-Tier-Status": string;
    "Metaiye-Shares-Owned": string;
    "KNYT-COYN-Owned": string;
    "Motion-Comics-Owned": string;
    "Paper-Comics-Owned": string;
    "Digital-Comics-Owned": string;
    "KNYT-Posters-Owned": string;
    "KNYT-Cards-Owned": string;
    "Characters-Owned": string;
  };
  Insert: Omit<KNYTPersonaTable['Row'], 'id' | 'created_at' | 'updated_at'>;
  Update: Partial<Omit<KNYTPersonaTable['Row'], 'id' | 'created_at' | 'updated_at'>>;
}

export type QryptoPersonaTable = {
  Row: {
    id: string;
    user_id: string;
    created_at: string;
    updated_at: string;
    "First-Name": string;
    "Last-Name": string;
    "Qrypto-ID": string;
    "Profession": string;
    "Local-City": string;
    "Email": string;
    "EVM-Public-Key": string;
    "BTC-Public-Key": string;
    "Chain-IDs": string[];
    "Wallets-of-Interest": string[];
    "Web3-Interests": string[];
    "Tokens-of-Interest": string[];
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
  };
  Insert: Omit<QryptoPersonaTable['Row'], 'id' | 'created_at' | 'updated_at'>;
  Update: Partial<Omit<QryptoPersonaTable['Row'], 'id' | 'created_at' | 'updated_at'>>;
}

// Legacy BlakQube table (deprecated)
export type BlakQubeTable = {
  Row: {
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
    created_at: string;
    updated_at: string;
  };
  Insert: Omit<BlakQubeTable['Row'], 'id' | 'created_at' | 'updated_at'>;
  Update: Partial<Omit<BlakQubeTable['Row'], 'id' | 'created_at' | 'updated_at'>>;
}
