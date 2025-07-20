
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
    // Check cache first
    if (this.memoryCache.has(conversationId)) {
      const cached = this.memoryCache.get(conversationId)!;
      // Return cached if recent (less than 5 minutes old)
      const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000).toISOString();
      if (cached.sessionContext.lastInteraction > fiveMinutesAgo) {
        return cached;
      }
    }

    const memory = await this.buildConversationMemory(conversationId);
    this.memoryCache.set(conversationId, memory);
    return memory;
  }

  /**
   * Build comprehensive conversation memory from database
   */
  private async buildConversationMemory(conversationId: string): Promise<ConversationMemory> {
    // Get recent interactions
    const recentHistory = await this.getRecentHistory(conversationId);
    
    // Build session context
    const sessionContext = await this.buildSessionContext(conversationId, recentHistory);
    
    // Get long-term summary if available
    const longTermSummary = await this.getLongTermSummary(conversationId);

    return {
      recentHistory,
      sessionContext,
      longTermSummary
    };
  }

  /**
   * Get recent conversation history (sliding window)
   */
  private async getRecentHistory(conversationId: string): Promise<ConversationExchange[]> {
    try {
      const { data: interactions, error } = await supabase
        .from('user_interactions')
        .select('id, query, response, created_at, metadata')
        .eq('interaction_type', 'learn') // MonDAI uses 'learn' type
        .or(`metadata->conversationId.eq."${conversationId}",metadata->>conversationId.eq.${conversationId}`)
        .order('created_at', { ascending: false })
        .limit(this.MEMORY_WINDOW_SIZE);

      if (error) {
        console.error('Error fetching recent history:', error);
        return [];
      }

      return (interactions || []).reverse().map(interaction => ({
        id: interaction.id,
        userMessage: interaction.query,
        agentResponse: interaction.response,
        timestamp: interaction.created_at,
        metadata: interaction.metadata
      }));
    } catch (error) {
      console.error('Error in getRecentHistory:', error);
      return [];
    }
  }

  /**
   * Build session context from recent interactions
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

    return {
      conversationId,
      themes,
      userPreferences,
      sessionStarted,
      lastInteraction
    };
  }

  /**
   * Extract conversation themes from recent history
   */
  private extractThemes(history: ConversationExchange[]): string[] {
    const themes = new Set<string>();
    
    history.forEach(exchange => {
      const text = (exchange.userMessage + ' ' + exchange.agentResponse).toLowerCase();
      
      // Detect common crypto/Web3 themes
      if (text.includes('knyt') || text.includes('coyn')) themes.add('KNYT COYN');
      if (text.includes('metaknyts') || text.includes('comic')) themes.add('metaKnyts');
      if (text.includes('wallet') || text.includes('metamask')) themes.add('Wallet Setup');
      if (text.includes('token') || text.includes('contract')) themes.add('Tokenomics');
      if (text.includes('blockchain') || text.includes('ethereum')) themes.add('Blockchain');
      if (text.includes('defi') || text.includes('protocol')) themes.add('DeFi');
      if (text.includes('nft') || text.includes('character')) themes.add('NFTs');
      if (text.includes('crypto') || text.includes('bitcoin')) themes.add('Cryptocurrency');
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
        .order('created_at', { ascending: false })
        .limit(1);

      if (error || !summaries || summaries.length === 0) {
        return undefined;
      }

      return summaries[0].summary_text;
    } catch (error) {
      console.error('Error fetching long-term summary:', error);
      return undefined;
    }
  }

  /**
   * Format memory for AI context (with length limits)
   */
  formatMemoryForContext(memory: ConversationMemory): string {
    let context = '';

    // Add long-term summary if available
    if (memory.longTermSummary) {
      context += `\n### Previous Conversation Summary\n${memory.longTermSummary}\n`;
    }

    // Add session context
    if (memory.sessionContext.themes.length > 0) {
      context += `\n### Current Session Themes\n${memory.sessionContext.themes.join(', ')}\n`;
    }

    // Add user preferences
    if (Object.keys(memory.sessionContext.userPreferences).length > 0) {
      context += `\n### User Preferences\n`;
      Object.entries(memory.sessionContext.userPreferences).forEach(([key, value]) => {
        context += `- ${key}: ${value}\n`;
      });
    }

    // Add recent conversation history
    if (memory.recentHistory.length > 0) {
      context += `\n### Recent Conversation History\n`;
      memory.recentHistory.forEach((exchange, index) => {
        const timestamp = new Date(exchange.timestamp).toLocaleTimeString();
        context += `[${timestamp}] User: ${exchange.userMessage}\n`;
        context += `[${timestamp}] Assistant: ${this.truncateResponse(exchange.agentResponse)}\n\n`;
      });
    }

    // Truncate if too long
    if (context.length > this.MAX_CONTEXT_LENGTH) {
      context = context.substring(0, this.MAX_CONTEXT_LENGTH) + '...\n[Context truncated for length]';
    }

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
   * Clear memory cache (useful for testing or memory cleanup)
   */
  clearCache(): void {
    this.memoryCache.clear();
  }

  /**
   * Update session context after new interaction
   */
  async updateSessionContext(conversationId: string, userMessage: string, agentResponse: string): Promise<void> {
    // Remove from cache to force refresh on next request
    this.memoryCache.delete(conversationId);
  }
}

export const mondaiConversationService = MonDAIConversationService.getInstance();
