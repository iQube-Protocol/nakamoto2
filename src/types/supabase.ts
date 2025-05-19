
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
}
