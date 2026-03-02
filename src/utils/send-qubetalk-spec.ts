/**
 * Utility to send persona-memory-system spec via QubeTalk
 * to Windsurf and Aigent Z agents on the metame-runtime-thinclient channel.
 */

const QUBETALK_ENDPOINT = 'https://bsjhfvctmduxhohtllly.supabase.co/functions/v1/send-qubetalk';
const CHANNEL = 'metame-runtime-thinclient';
const ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJzamhmdmN0bWR1eGhvaHRsbGx5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDYxMjY5MDQsImV4cCI6MjA2MTcwMjkwNH0.GBrcUk3ufpFr0WoP2VqL7Bm8C3V7T6IKnJx-Svjhbjc';
const FROM_AGENT_ID = 'lovable-aigent-nakamoto';

export interface QubeTalkMessage {
  channel: string;
  thread: string;
  from_agent: {
    id: string;
    role: string;
  };
  to_agents?: string[];
  payload: {
    type: string;
    title: string;
    body: string;
    metadata?: Record<string, any>;
  };
}

export async function sendQubeTalkMessage(message: QubeTalkMessage): Promise<any> {
  const response = await fetch(QUBETALK_ENDPOINT, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'apikey': ANON_KEY,
    },
    body: JSON.stringify(message),
  });
  
  const data = await response.json();
  console.log(`QubeTalk response (${message.thread}):`, data);
  return data;
}

export async function broadcastPersonaMemorySpec(specContent: string): Promise<void> {
  const baseMessage: Omit<QubeTalkMessage, 'to_agents'> = {
    channel: CHANNEL,
    thread: 'spec',
    from_agent: {
      id: FROM_AGENT_ID,
      role: 'builder',
    },
    payload: {
      type: 'spec-share',
      title: 'Persona & Memory System Specification',
      body: specContent,
      metadata: {
        specId: 'aigent-nakamoto-persona-memory-spec',
        version: '1.0.0',
        sharedAt: new Date().toISOString(),
        purpose: 'Replication of persona identity management and conversation memory system for AS-API integration',
        sourceProject: 'aigent-nakamoto',
        keyComponents: [
          'knyt_personas table schema',
          'qripto_personas table schema', 
          'PersonaContextService pipeline',
          'AigentConversationService memory system',
          'user_interactions storage',
          'conversation_summaries long-term memory',
          'experience level determination',
          'prompt injection patterns'
        ]
      }
    }
  };

  // Send to Windsurf
  console.log('📡 Sending persona-memory spec to Windsurf...');
  await sendQubeTalkMessage({
    ...baseMessage,
    to_agents: ['windsurf'],
  });

  // Send to Aigent Z
  console.log('📡 Sending persona-memory spec to Aigent Z...');
  await sendQubeTalkMessage({
    ...baseMessage,
    to_agents: ['aigent-z'],
  });

  console.log('✅ Persona-memory spec shared with Windsurf and Aigent Z via QubeTalk');
}
