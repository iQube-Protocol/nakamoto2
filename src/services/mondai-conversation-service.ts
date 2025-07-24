import { supabase } from '@/integrations/supabase/client';

export interface ConversationMemory {
  recentHistory: ConversationExchange[];
  sessionContext: SessionContext;
  longTermSummary?: string;
}

export interface ConversationExchange {
  id: string;
  userMessage: string;
  agentResponse: string;
  timestamp: string;
  metadata?: any;
}

export interface SessionContext {
  conversationId: string;
  themes: string[];
  userPreferences: Record<string, any>;
  sessionStarted: string;
  lastInteraction: string;
}

export class MonDAIConversationService {
  private static instance: MonDAIConversationService;
  private memoryCache = new Map<string, ConversationMemory>();
  private readonly MEMORY_WINDOW_SIZE = 8; // Last 8 exchanges (4 back-and-forth)
  private readonly MAX_CONTEXT_LENGTH = 3000; // Characters limit for context

  static getInstance(): MonDAIConversationService {
    if (!MonDAIConversationService.instance) {
      MonDAIConversationService.instance = new MonDAIConversationService();
    }
    return MonDAIConversationService.instance;
  }

  /**
   * Retrieve conversation memory for a given conversation ID
   */
  async getConversationMemory(conversationId: string): Promise<ConversationMemory> {
    console.log(`🧠 MonDAI Memory: Retrieving memory for conversation ${conversationId}`);
    
    // Check cache first
    if (this.memoryCache.has(conversationId)) {
      const cached = this.memoryCache.get(conversationId)!;
      // Return cached if recent (less than 5 minutes old)
      const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000).toISOString();
      if (cached.sessionContext.lastInteraction > fiveMinutesAgo) {
        console.log(`🧠 MonDAI Memory: Using cached memory with ${cached.recentHistory.length} exchanges`);
        return cached;
      }
    }

    const memory = await this.buildConversationMemory(conversationId);
    this.memoryCache.set(conversationId, memory);
    console.log(`🧠 MonDAI Memory: Built fresh memory with ${memory.recentHistory.length} exchanges`);
    return memory;
  }

  /**
   * Build comprehensive conversation memory from database
   */
  private async buildConversationMemory(conversationId: string): Promise<ConversationMemory> {
    console.log(`🧠 MonDAI Memory: Building memory for conversation ${conversationId}`);
    
    // Get recent interactions
    const recentHistory = await this.getRecentHistory(conversationId);
    console.log(`🧠 MonDAI Memory: Found ${recentHistory.length} recent interactions`);
    
    // Build session context
    const sessionContext = await this.buildSessionContext(conversationId, recentHistory);
    console.log(`🧠 MonDAI Memory: Session themes: ${sessionContext.themes.join(', ')}`);
    
    // Get long-term summary if available
    const longTermSummary = await this.getLongTermSummary(conversationId);
    if (longTermSummary) {
      console.log(`🧠 MonDAI Memory: Found long-term summary`);
    }

    return {
      recentHistory,
      sessionContext,
      longTermSummary
    };
  }

  /**
   * Get recent conversation history with improved query logic
   */
  private async getRecentHistory(conversationId: string): Promise<ConversationExchange[]> {
    try {
      console.log(`🧠 MonDAI Memory: Querying recent history for conversation ${conversationId}`);
      
      let interactions: any[] = [];
      
      // Strategy 1: Query MonDAI interactions first (new correct way)
      const { data: mondaiQuery, error: mondaiError } = await supabase
        .from('user_interactions')
        .select('id, query, response, created_at, metadata')
        .eq('interaction_type', 'mondai')
        .contains('metadata', { conversationId })
        .order('created_at', { ascending: false })
        .limit(this.MEMORY_WINDOW_SIZE);

      if (!mondaiError && mondaiQuery && mondaiQuery.length > 0) {
        interactions = mondaiQuery;
        console.log(`🧠 MonDAI Memory: Found ${interactions.length} MonDAI interactions`);
      } else {
        // Strategy 2: Fallback to learn interactions for backward compatibility
        const { data: learnQuery, error: learnError } = await supabase
          .from('user_interactions')
          .select('id, query, response, created_at, metadata')
          .eq('interaction_type', 'learn')
          .contains('metadata', { conversationId })
          .order('created_at', { ascending: false })
          .limit(this.MEMORY_WINDOW_SIZE);

        if (!learnError && learnQuery && learnQuery.length > 0) {
          // Filter for MonDAI agent interactions
          interactions = learnQuery.filter(interaction => {
            try {
              const metadata = typeof interaction.metadata === 'string' 
                ? JSON.parse(interaction.metadata) 
                : interaction.metadata;
              return metadata.agentType === 'mondai';
            } catch (e) {
              return false;
            }
          });
          console.log(`🧠 MonDAI Memory: Found ${interactions.length} legacy MonDAI interactions in learn type`);
        }
      }

      if (interactions.length === 0) {
        // Strategy 3: String search fallback
        const { data: fallbackQuery, error: fallbackError } = await supabase
          .from('user_interactions')
          .select('id, query, response, created_at, metadata')
          .or('interaction_type.eq.mondai,interaction_type.eq.learn')
          .like('metadata', `%${conversationId}%`)
          .order('created_at', { ascending: false })
          .limit(this.MEMORY_WINDOW_SIZE);

        if (!fallbackError && fallbackQuery) {
          interactions = fallbackQuery.filter(interaction => {
            if (!interaction.metadata) return false;
            
            try {
              const metadata = typeof interaction.metadata === 'string' 
                ? JSON.parse(interaction.metadata) 
                : interaction.metadata;
              
              return metadata.conversationId === conversationId ||
                     metadata.conversationId === `"${conversationId}"` ||
                     JSON.stringify(interaction.metadata).includes(conversationId);
            } catch (e) {
              return JSON.stringify(interaction.metadata).includes(conversationId);
            }
          });
          
          console.log(`🧠 MonDAI Memory: Found ${interactions.length} interactions via fallback filtering`);
        }
      }

      if (interactions.length > 0) {
        console.log(`🧠 MonDAI Memory: Sample metadata structure:`, interactions[0].metadata);
      }

      return interactions.reverse().map(interaction => ({
        id: interaction.id,
        userMessage: interaction.query,
        agentResponse: interaction.response,
        timestamp: interaction.created_at,
        metadata: interaction.metadata
      }));
    } catch (error) {
      console.error('🧠 MonDAI Memory: Error in getRecentHistory:', error);
      return [];
    }
  }

  /**
   * Build session context from recent interactions with improved topic detection
   */
  private async buildSessionContext(
    conversationId: string, 
    recentHistory: ConversationExchange[]
  ): Promise<SessionContext> {
    const themes = this.extractThemes(recentHistory);
    const userPreferences = this.extractUserPreferences(recentHistory);
    
    const sessionStarted = recentHistory.length > 0 
      ? recentHistory[0].timestamp 
      : new Date().toISOString();
    
    const lastInteraction = recentHistory.length > 0 
      ? recentHistory[recentHistory.length - 1].timestamp 
      : new Date().toISOString();

    console.log(`🧠 MonDAI Memory: Session context - Themes: [${themes.join(', ')}], Preferences: ${JSON.stringify(userPreferences)}`);

    return {
      conversationId,
      themes,
      userPreferences,
      sessionStarted,
      lastInteraction
    };
  }

  /**
   * Extract conversation themes with better topic isolation
   */
  private extractThemes(history: ConversationExchange[]): string[] {
    const themes = new Set<string>();
    
    history.forEach(exchange => {
      const text = (exchange.userMessage + ' ' + exchange.agentResponse).toLowerCase();
      
      // Detect specific topics more precisely
      if (text.includes('rune') || text.includes('bitcoin rune') || text.includes('btc rune')) {
        themes.add('Bitcoin Runes');
      }
      if (text.includes('knyt') && text.includes('coyn')) {
        themes.add('KNYT COYN');
      }
      if (text.includes('metaknyts') || text.includes('meta knyts')) {
        themes.add('metaKnyts');
      }
      if (text.includes('wallet') && (text.includes('metamask') || text.includes('setup'))) {
        themes.add('Wallet Setup');
      }
      if (text.includes('token') && text.includes('contract')) {
        themes.add('Smart Contracts');
      }
      if (text.includes('blockchain') || text.includes('ethereum')) {
        themes.add('Blockchain');
      }
      if (text.includes('defi') || text.includes('protocol')) {
        themes.add('DeFi');
      }
      if (text.includes('nft') && !text.includes('knyt')) {
        themes.add('NFTs');
      }
    });

    return Array.from(themes);
  }

  /**
   * Extract user preferences from conversation history
   */
  private extractUserPreferences(history: ConversationExchange[]): Record<string, any> {
    const preferences: Record<string, any> = {};
    
    history.forEach(exchange => {
      // Extract AI provider preference
      if (exchange.metadata?.aiProvider) {
        preferences.preferredAI = exchange.metadata.aiProvider;
      }
      
      // Extract persona context usage
      if (exchange.metadata?.personaContextUsed) {
        preferences.usePersonaContext = true;
        if (exchange.metadata?.preferredName) {
          preferences.preferredName = exchange.metadata.preferredName;
        }
      }
      
      // Extract visual content preference
      if (exchange.metadata?.visualsProvided || exchange.metadata?.mermaidDiagramIncluded) {
        preferences.likesVisualContent = true;
      }
    });

    return preferences;
  }

  /**
   * Get long-term conversation summary
   */
  private async getLongTermSummary(conversationId: string): Promise<string | undefined> {
    try {
      const { data: summaries, error } = await supabase
        .from('conversation_summaries')
        .select('summary_text')
        .eq('conversation_type', 'learn')
        .like('summary_text', `%${conversationId}%`)
        .order('created_at', { ascending: false })
        .limit(1);

      if (error || !summaries || summaries.length === 0) {
        return undefined;
      }

      return summaries[0].summary_text;
    } catch (error) {
      console.error('🧠 MonDAI Memory: Error fetching long-term summary:', error);
      return undefined;
    }
  }

  /**
   * Format memory for AI context with topic awareness
   */
  formatMemoryForContext(memory: ConversationMemory): string {
    let context = '';
    console.log(`🧠 MonDAI Memory: Formatting context with ${memory.recentHistory.length} exchanges`);

    // Add long-term summary if available
    if (memory.longTermSummary) {
      context += `\n### Previous Conversation Summary\n${memory.longTermSummary}\n`;
    }

    // Add session context with clear topic boundaries
    if (memory.sessionContext.themes.length > 0) {
      context += `\n### Current Session Topics\n`;
      context += `The user has been discussing: ${memory.sessionContext.themes.join(', ')}\n`;
      context += `Continue to focus on these topics unless the user explicitly changes the subject.\n`;
    }

    // Add user preferences
    if (Object.keys(memory.sessionContext.userPreferences).length > 0) {
      context += `\n### User Preferences\n`;
      Object.entries(memory.sessionContext.userPreferences).forEach(([key, value]) => {
        context += `- ${key}: ${value}\n`;
      });
    }

    // Add recent conversation history with topic context
    if (memory.recentHistory.length > 0) {
      context += `\n### Recent Conversation History\n`;
      context += `The following exchanges are from the same conversation session:\n`;
      
      memory.recentHistory.forEach((exchange, index) => {
        const timestamp = new Date(exchange.timestamp).toLocaleTimeString();
        context += `[${timestamp}] User: ${exchange.userMessage}\n`;
        context += `[${timestamp}] Assistant: ${this.truncateResponse(exchange.agentResponse)}\n\n`;
      });
      
      context += `Continue this conversation naturally, building on the established context.\n`;
    }

    // Truncate if too long
    if (context.length > this.MAX_CONTEXT_LENGTH) {
      context = context.substring(0, this.MAX_CONTEXT_LENGTH) + '...\n[Context truncated for length]';
    }

    console.log(`🧠 MonDAI Memory: Generated context with ${context.length} characters`);
    return context;
  }

  /**
   * Truncate long responses for context
   */
  private truncateResponse(response: string, maxLength: number = 200): string {
    if (response.length <= maxLength) return response;
    return response.substring(0, maxLength) + '...';
  }

  /**
   * Store conversation exchange with proper metadata - NOW USING MONDAI TYPE
   */
  async storeConversationExchange(
    conversationId: string,
    userMessage: string,
    agentResponse: string
  ): Promise<void> {
    try {
      console.log(`🧠 MonDAI Memory: Storing exchange for conversation ${conversationId}`);
      
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { error } = await supabase
        .from('user_interactions')
        .insert({
          user_id: user.id,
          interaction_type: 'mondai', // Changed from 'learn' to 'mondai'
          query: userMessage,
          response: agentResponse,
          metadata: {
            conversationId,
            timestamp: new Date().toISOString(),
            agentType: 'mondai'
          }
        });

      if (error) {
        console.error('🧠 MonDAI Memory: Error storing conversation exchange:', error);
      } else {
        console.log(`🧠 MonDAI Memory: Successfully stored exchange`);
        this.memoryCache.delete(conversationId);
      }
    } catch (error) {
      console.error('🧠 MonDAI Memory: Exception storing conversation exchange:', error);
    }
  }

  /**
   * Clear memory cache for a conversation
   */
  clearMemoryCache(conversationId: string): void {
    this.memoryCache.delete(conversationId);
  }

  /**
   * Clear all memory cache
   */
  clearAllMemoryCache(): void {
    this.memoryCache.clear();
  }
}