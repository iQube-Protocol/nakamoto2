export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      blak_qubes: {
        Row: {
          Address: string | null
          Age: string | null
          "BTC-Public-Key": string
          "Chain-IDs": string[]
          "Characters-Owned": string | null
          created_at: string
          "Digital-Comics-Owned": string | null
          "Discord-Handle": string | null
          Email: string
          "EVM-Public-Key": string
          "Facebook-ID": string | null
          "First-Name": string | null
          "GitHub-Handle": string | null
          id: string
          "Instagram-Handle": string | null
          "KNYT-Cards-Owned": string | null
          "KNYT-COYN-Owned": string | null
          "KNYT-ID": string | null
          "KNYT-Posters-Owned": string | null
          "Last-Name": string | null
          "LinkedIn-ID": string | null
          "LinkedIn-Profile-URL": string | null
          "Local-City": string
          "Metaiye-Shares-Owned": string | null
          "MetaKeep-Public-Key": string | null
          "Motion-Comics-Owned": string | null
          "OM-Member-Since": string | null
          "OM-Tier-Status": string | null
          "Paper-Comics-Owned": string | null
          "Phone-Number": string | null
          Profession: string
          "Qrypto-ID": string | null
          "Telegram-Handle": string | null
          "ThirdWeb-Public-Key": string | null
          "TikTok-Handle": string | null
          "Tokens-of-Interest": string[]
          "Twitter-Handle": string | null
          updated_at: string
          user_id: string
          "Wallets-of-Interest": string[]
          "Web3-Interests": string[]
          "YouTube-ID": string | null
        }
        Insert: {
          Address?: string | null
          Age?: string | null
          "BTC-Public-Key"?: string
          "Chain-IDs"?: string[]
          "Characters-Owned"?: string | null
          created_at?: string
          "Digital-Comics-Owned"?: string | null
          "Discord-Handle"?: string | null
          Email?: string
          "EVM-Public-Key"?: string
          "Facebook-ID"?: string | null
          "First-Name"?: string | null
          "GitHub-Handle"?: string | null
          id?: string
          "Instagram-Handle"?: string | null
          "KNYT-Cards-Owned"?: string | null
          "KNYT-COYN-Owned"?: string | null
          "KNYT-ID"?: string | null
          "KNYT-Posters-Owned"?: string | null
          "Last-Name"?: string | null
          "LinkedIn-ID"?: string | null
          "LinkedIn-Profile-URL"?: string | null
          "Local-City"?: string
          "Metaiye-Shares-Owned"?: string | null
          "MetaKeep-Public-Key"?: string | null
          "Motion-Comics-Owned"?: string | null
          "OM-Member-Since"?: string | null
          "OM-Tier-Status"?: string | null
          "Paper-Comics-Owned"?: string | null
          "Phone-Number"?: string | null
          Profession?: string
          "Qrypto-ID"?: string | null
          "Telegram-Handle"?: string | null
          "ThirdWeb-Public-Key"?: string | null
          "TikTok-Handle"?: string | null
          "Tokens-of-Interest"?: string[]
          "Twitter-Handle"?: string | null
          updated_at?: string
          user_id: string
          "Wallets-of-Interest"?: string[]
          "Web3-Interests"?: string[]
          "YouTube-ID"?: string | null
        }
        Update: {
          Address?: string | null
          Age?: string | null
          "BTC-Public-Key"?: string
          "Chain-IDs"?: string[]
          "Characters-Owned"?: string | null
          created_at?: string
          "Digital-Comics-Owned"?: string | null
          "Discord-Handle"?: string | null
          Email?: string
          "EVM-Public-Key"?: string
          "Facebook-ID"?: string | null
          "First-Name"?: string | null
          "GitHub-Handle"?: string | null
          id?: string
          "Instagram-Handle"?: string | null
          "KNYT-Cards-Owned"?: string | null
          "KNYT-COYN-Owned"?: string | null
          "KNYT-ID"?: string | null
          "KNYT-Posters-Owned"?: string | null
          "Last-Name"?: string | null
          "LinkedIn-ID"?: string | null
          "LinkedIn-Profile-URL"?: string | null
          "Local-City"?: string
          "Metaiye-Shares-Owned"?: string | null
          "MetaKeep-Public-Key"?: string | null
          "Motion-Comics-Owned"?: string | null
          "OM-Member-Since"?: string | null
          "OM-Tier-Status"?: string | null
          "Paper-Comics-Owned"?: string | null
          "Phone-Number"?: string | null
          Profession?: string
          "Qrypto-ID"?: string | null
          "Telegram-Handle"?: string | null
          "ThirdWeb-Public-Key"?: string | null
          "TikTok-Handle"?: string | null
          "Tokens-of-Interest"?: string[]
          "Twitter-Handle"?: string | null
          updated_at?: string
          user_id?: string
          "Wallets-of-Interest"?: string[]
          "Web3-Interests"?: string[]
          "YouTube-ID"?: string | null
        }
        Relationships: []
      }
      conversation_summaries: {
        Row: {
          conversation_type: string
          created_at: string
          id: string
          included_interaction_ids: string[]
          summary_text: string
          updated_at: string
          user_id: string
        }
        Insert: {
          conversation_type: string
          created_at?: string
          id?: string
          included_interaction_ids?: string[]
          summary_text: string
          updated_at?: string
          user_id: string
        }
        Update: {
          conversation_type?: string
          created_at?: string
          id?: string
          included_interaction_ids?: string[]
          summary_text?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      knyt_persona_rewards: {
        Row: {
          created_at: string
          data_completed: boolean | null
          id: string
          linkedin_connected: boolean | null
          metamask_connected: boolean | null
          reward_amount: number | null
          reward_claimed: boolean | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          data_completed?: boolean | null
          id?: string
          linkedin_connected?: boolean | null
          metamask_connected?: boolean | null
          reward_amount?: number | null
          reward_claimed?: boolean | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          data_completed?: boolean | null
          id?: string
          linkedin_connected?: boolean | null
          metamask_connected?: boolean | null
          reward_amount?: number | null
          reward_claimed?: boolean | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      knyt_personas: {
        Row: {
          Address: string | null
          Age: string | null
          "BTC-Public-Key": string | null
          "Chain-IDs": string[] | null
          "Characters-Owned": string | null
          created_at: string
          "Digital-Comics-Owned": string | null
          "Discord-Handle": string | null
          Email: string | null
          "EVM-Public-Key": string | null
          "Facebook-ID": string | null
          "First-Name": string | null
          id: string
          "Instagram-Handle": string | null
          "KNYT-Cards-Owned": string | null
          "KNYT-COYN-Owned": string | null
          "KNYT-ID": string | null
          "KNYT-Posters-Owned": string | null
          "Last-Name": string | null
          "LinkedIn-ID": string | null
          "LinkedIn-Profile-URL": string | null
          "Local-City": string | null
          "Metaiye-Shares-Owned": string | null
          "MetaKeep-Public-Key": string | null
          "Motion-Comics-Owned": string | null
          "OM-Member-Since": string | null
          "OM-Tier-Status": string | null
          "Paper-Comics-Owned": string | null
          "Phone-Number": string | null
          Profession: string | null
          "Telegram-Handle": string | null
          "ThirdWeb-Public-Key": string | null
          "TikTok-Handle": string | null
          "Tokens-of-Interest": string[] | null
          "Total-Invested": string | null
          "Twitter-Handle": string | null
          updated_at: string
          user_id: string
          "Web3-Interests": string[] | null
          "YouTube-ID": string | null
        }
        Insert: {
          Address?: string | null
          Age?: string | null
          "BTC-Public-Key"?: string | null
          "Chain-IDs"?: string[] | null
          "Characters-Owned"?: string | null
          created_at?: string
          "Digital-Comics-Owned"?: string | null
          "Discord-Handle"?: string | null
          Email?: string | null
          "EVM-Public-Key"?: string | null
          "Facebook-ID"?: string | null
          "First-Name"?: string | null
          id?: string
          "Instagram-Handle"?: string | null
          "KNYT-Cards-Owned"?: string | null
          "KNYT-COYN-Owned"?: string | null
          "KNYT-ID"?: string | null
          "KNYT-Posters-Owned"?: string | null
          "Last-Name"?: string | null
          "LinkedIn-ID"?: string | null
          "LinkedIn-Profile-URL"?: string | null
          "Local-City"?: string | null
          "Metaiye-Shares-Owned"?: string | null
          "MetaKeep-Public-Key"?: string | null
          "Motion-Comics-Owned"?: string | null
          "OM-Member-Since"?: string | null
          "OM-Tier-Status"?: string | null
          "Paper-Comics-Owned"?: string | null
          "Phone-Number"?: string | null
          Profession?: string | null
          "Telegram-Handle"?: string | null
          "ThirdWeb-Public-Key"?: string | null
          "TikTok-Handle"?: string | null
          "Tokens-of-Interest"?: string[] | null
          "Total-Invested"?: string | null
          "Twitter-Handle"?: string | null
          updated_at?: string
          user_id: string
          "Web3-Interests"?: string[] | null
          "YouTube-ID"?: string | null
        }
        Update: {
          Address?: string | null
          Age?: string | null
          "BTC-Public-Key"?: string | null
          "Chain-IDs"?: string[] | null
          "Characters-Owned"?: string | null
          created_at?: string
          "Digital-Comics-Owned"?: string | null
          "Discord-Handle"?: string | null
          Email?: string | null
          "EVM-Public-Key"?: string | null
          "Facebook-ID"?: string | null
          "First-Name"?: string | null
          id?: string
          "Instagram-Handle"?: string | null
          "KNYT-Cards-Owned"?: string | null
          "KNYT-COYN-Owned"?: string | null
          "KNYT-ID"?: string | null
          "KNYT-Posters-Owned"?: string | null
          "Last-Name"?: string | null
          "LinkedIn-ID"?: string | null
          "LinkedIn-Profile-URL"?: string | null
          "Local-City"?: string | null
          "Metaiye-Shares-Owned"?: string | null
          "MetaKeep-Public-Key"?: string | null
          "Motion-Comics-Owned"?: string | null
          "OM-Member-Since"?: string | null
          "OM-Tier-Status"?: string | null
          "Paper-Comics-Owned"?: string | null
          "Phone-Number"?: string | null
          Profession?: string | null
          "Telegram-Handle"?: string | null
          "ThirdWeb-Public-Key"?: string | null
          "TikTok-Handle"?: string | null
          "Tokens-of-Interest"?: string[] | null
          "Total-Invested"?: string | null
          "Twitter-Handle"?: string | null
          updated_at?: string
          user_id?: string
          "Web3-Interests"?: string[] | null
          "YouTube-ID"?: string | null
        }
        Relationships: []
      }
      qrypto_personas: {
        Row: {
          "BTC-Public-Key": string | null
          "Chain-IDs": string[] | null
          created_at: string
          "Discord-Handle": string | null
          Email: string | null
          "EVM-Public-Key": string | null
          "Facebook-ID": string | null
          "First-Name": string | null
          "GitHub-Handle": string | null
          id: string
          "Instagram-Handle": string | null
          "Last-Name": string | null
          "LinkedIn-ID": string | null
          "LinkedIn-Profile-URL": string | null
          "Local-City": string | null
          Profession: string | null
          "Qrypto-ID": string | null
          "Telegram-Handle": string | null
          "TikTok-Handle": string | null
          "Tokens-of-Interest": string[] | null
          "Twitter-Handle": string | null
          updated_at: string
          user_id: string
          "Wallets-of-Interest": string[] | null
          "Web3-Interests": string[] | null
          "YouTube-ID": string | null
        }
        Insert: {
          "BTC-Public-Key"?: string | null
          "Chain-IDs"?: string[] | null
          created_at?: string
          "Discord-Handle"?: string | null
          Email?: string | null
          "EVM-Public-Key"?: string | null
          "Facebook-ID"?: string | null
          "First-Name"?: string | null
          "GitHub-Handle"?: string | null
          id?: string
          "Instagram-Handle"?: string | null
          "Last-Name"?: string | null
          "LinkedIn-ID"?: string | null
          "LinkedIn-Profile-URL"?: string | null
          "Local-City"?: string | null
          Profession?: string | null
          "Qrypto-ID"?: string | null
          "Telegram-Handle"?: string | null
          "TikTok-Handle"?: string | null
          "Tokens-of-Interest"?: string[] | null
          "Twitter-Handle"?: string | null
          updated_at?: string
          user_id: string
          "Wallets-of-Interest"?: string[] | null
          "Web3-Interests"?: string[] | null
          "YouTube-ID"?: string | null
        }
        Update: {
          "BTC-Public-Key"?: string | null
          "Chain-IDs"?: string[] | null
          created_at?: string
          "Discord-Handle"?: string | null
          Email?: string | null
          "EVM-Public-Key"?: string | null
          "Facebook-ID"?: string | null
          "First-Name"?: string | null
          "GitHub-Handle"?: string | null
          id?: string
          "Instagram-Handle"?: string | null
          "Last-Name"?: string | null
          "LinkedIn-ID"?: string | null
          "LinkedIn-Profile-URL"?: string | null
          "Local-City"?: string | null
          Profession?: string | null
          "Qrypto-ID"?: string | null
          "Telegram-Handle"?: string | null
          "TikTok-Handle"?: string | null
          "Tokens-of-Interest"?: string[] | null
          "Twitter-Handle"?: string | null
          updated_at?: string
          user_id?: string
          "Wallets-of-Interest"?: string[] | null
          "Web3-Interests"?: string[] | null
          "YouTube-ID"?: string | null
        }
        Relationships: []
      }
      user_connections: {
        Row: {
          connected_at: string
          connection_data: Json | null
          created_at: string
          id: string
          service: string
          user_id: string
        }
        Insert: {
          connected_at?: string
          connection_data?: Json | null
          created_at?: string
          id?: string
          service: string
          user_id: string
        }
        Update: {
          connected_at?: string
          connection_data?: Json | null
          created_at?: string
          id?: string
          service?: string
          user_id?: string
        }
        Relationships: []
      }
      user_interactions: {
        Row: {
          created_at: string
          id: string
          interaction_type: string
          metadata: Json | null
          query: string
          response: string
          summarized: boolean
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          interaction_type: string
          metadata?: Json | null
          query: string
          response: string
          summarized?: boolean
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          interaction_type?: string
          metadata?: Json | null
          query?: string
          response?: string
          summarized?: boolean
          user_id?: string
        }
        Relationships: []
      }
      user_sessions: {
        Row: {
          active: boolean
          created_at: string
          device_info: Json | null
          id: string
          session_end: string | null
          user_id: string
        }
        Insert: {
          active?: boolean
          created_at?: string
          device_info?: Json | null
          id?: string
          session_end?: string | null
          user_id: string
        }
        Update: {
          active?: boolean
          created_at?: string
          device_info?: Json | null
          id?: string
          session_end?: string | null
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
