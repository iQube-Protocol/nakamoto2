export interface AgentMessage {
  id: string;
  sender: 'user' | 'agent';
  message: string;
  timestamp: string;
  metadata?: any;
}

export type InteractionType = 'learn' | 'earn' | 'connect' | 'mondai';
