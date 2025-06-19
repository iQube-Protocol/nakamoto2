
import { supabase } from '@/integrations/supabase/client';
import { PersonaContextService } from '@/services/persona-context-service';

export interface MonDAIResponse {
  conversationId: string;
  message: string;
  timestamp: string;
  metadata: {
    version: string;
    modelUsed: string;
    knowledgeSource: string;
    itemsFound: number;
    aiProvider?: string;
    [key: string]: any;
  };
}

export const generateAigentNakamotoResponse = async (
  message: string,
  conversationId: string | null,
  useVenice: boolean = false
): Promise<MonDAIResponse> => {
  try {
    console.log(`🔄 MonDAI Service: Processing message with Venice ${useVenice ? 'ENABLED' : 'DISABLED'}`);
    
    // Get persona context for personalization
    const personaContext = await PersonaContextService.getConversationContext();
    const contextualPrompt = PersonaContextService.generateContextualPrompt(personaContext, message);
    
    console.log('🧠 MonDAI Service: Persona context applied:', {
      isAnonymous: personaContext.isAnonymous,
      preferredName: personaContext.preferredName,
      hasQryptoContext: !!personaContext.qryptoContext?.isActive,
      hasKNYTContext: !!personaContext.knytContext?.isActive
    });

    // Call the MonDAI edge function with persona context
    const { data, error } = await supabase.functions.invoke('mondai-ai', {
      body: {
        message,
        conversationId,
        useVenice,
        personaContext: personaContext,
        contextualPrompt: contextualPrompt
      }
    });

    if (error) {
      console.error('MonDAI Edge Function Error:', error);
      throw new Error(`MonDAI service error: ${error.message}`);
    }

    if (!data || !data.message) {
      console.error('Invalid MonDAI response:', data);
      throw new Error('Invalid response from MonDAI service');
    }

    console.log(`✅ MonDAI Service: Response received from ${data.metadata?.aiProvider || (useVenice ? 'Venice AI' : 'OpenAI')}`);

    return {
      conversationId: data.conversationId,
      message: data.message,
      timestamp: data.timestamp,
      metadata: {
        ...data.metadata,
        personaContextUsed: !personaContext.isAnonymous,
        preferredName: personaContext.preferredName
      }
    };
  } catch (error) {
    console.error('Error in generateAigentNakamotoResponse:', error);
    throw error;
  }
};
