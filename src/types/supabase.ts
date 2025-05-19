
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
