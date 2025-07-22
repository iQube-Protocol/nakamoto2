
import { supabase } from '@/integrations/supabase/client';

export interface ConversationContext {
  isAnonymous: boolean;
  preferredName?: string;
  qryptoContext?: {
    qryptoId: string;
    profession: string;
    location: string;
    interests: string[];
    firstName: string;
    lastName: string;
  };
  knytContext?: {
    knytId: string;
    profession: string;
    location: string;
    interests: string[];
    firstName: string;
    lastName: string;
    omTierStatus: string;
    knytCoynOwned: string;
  };
}

export class PersonaContextService {
  /**
   * Get the current conversation context based on activated personas
   */
  static async getConversationContext(): Promise<ConversationContext> {
    try {
      console.log('👤 PersonaContextService: Getting conversation context...');
      
      // Check localStorage for activation status first (most reliable)
      const qryptoActivated = localStorage.getItem('qrypto-persona-activated') === 'true';
      const knytActivated = localStorage.getItem('knyt-persona-activated') === 'true';
      
      console.log('👤 PersonaContextService: Activation states:', {
        qryptoActivated,
        knytActivated
      });

      // If no personas are activated, return anonymous context
      if (!qryptoActivated && !knytActivated) {
        console.log('👤 PersonaContextService: No personas activated, returning anonymous context');
        return { isAnonymous: true };
      }

      // Get current user
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      
      if (userError || !user) {
        console.log('👤 PersonaContextService: No authenticated user, returning anonymous context');
        return { isAnonymous: true };
      }

      const context: ConversationContext = { isAnonymous: false };

      // Get Qrypto persona data if activated
      if (qryptoActivated) {
        console.log('👤 PersonaContextService: Fetching Qrypto persona data...');
        const { data: qryptoData, error: qryptoError } = await supabase
          .from('qrypto_personas')
          .select('*')
          .eq('user_id', user.id)
          .single();

        if (!qryptoError && qryptoData) {
          const firstName = qryptoData['First-Name'] || '';
          const lastName = qryptoData['Last-Name'] || '';
          
          context.qryptoContext = {
            qryptoId: qryptoData['Qrypto-ID'] || '',
            profession: qryptoData['Profession'] || '',
            location: qryptoData['Local-City'] || '',
            interests: qryptoData['Web3-Interests'] || [],
            firstName,
            lastName
          };
          
          // Set preferred name from Qrypto context
          if (firstName) {
            context.preferredName = firstName;
          }
          
          console.log('👤 PersonaContextService: Qrypto context loaded:', {
            hasQryptoId: !!context.qryptoContext.qryptoId,
            hasFirstName: !!firstName,
            preferredName: context.preferredName
          });
        } else {
          console.warn('👤 PersonaContextService: Qrypto persona activated but no data found');
        }
      }

      // Get KNYT persona data if activated
      if (knytActivated) {
        console.log('👤 PersonaContextService: Fetching KNYT persona data...');
        const { data: knytData, error: knytError } = await supabase
          .from('knyt_personas')
          .select('*')
          .eq('user_id', user.id)
          .single();

        if (!knytError && knytData) {
          const firstName = knytData['First-Name'] || '';
          const lastName = knytData['Last-Name'] || '';
          
          context.knytContext = {
            knytId: knytData['KNYT-ID'] || '',
            profession: knytData['Profession'] || '',
            location: knytData['Local-City'] || '',
            interests: knytData['Web3-Interests'] || [],
            firstName,
            lastName,
            omTierStatus: knytData['OM-Tier-Status'] || '',
            knytCoynOwned: knytData['KNYT-COYN-Owned'] || ''
          };
          
          // Prefer KNYT name if available and no Qrypto name set
          if (firstName && !context.preferredName) {
            context.preferredName = firstName;
          }
          
          console.log('👤 PersonaContextService: KNYT context loaded:', {
            hasKnytId: !!context.knytContext.knytId,
            hasFirstName: !!firstName,
            preferredName: context.preferredName
          });
        } else {
          console.warn('👤 PersonaContextService: KNYT persona activated but no data found');
        }
      }

      // Final check: if no valid persona data found despite activation flags, return anonymous
      if (!context.qryptoContext && !context.knytContext) {
        console.log('👤 PersonaContextService: No valid persona data found, forcing anonymous mode');
        return { isAnonymous: true };
      }

      console.log('👤 PersonaContextService: Final context:', {
        isAnonymous: context.isAnonymous,
        preferredName: context.preferredName,
        hasQryptoContext: !!context.qryptoContext,
        hasKnytContext: !!context.knytContext
      });

      return context;
    } catch (error) {
      console.error('👤 PersonaContextService: Error getting conversation context:', error);
      return { isAnonymous: true };
    }
  }

  /**
   * Generate a contextual prompt based on the conversation context
   */
  static generateContextualPrompt(context: ConversationContext, userMessage?: string): string {
    if (context.isAnonymous) {
      console.log('👤 PersonaContextService: Generating anonymous prompt');
      return `
**User Context**: Anonymous user - address them generically without using any personal names or information.

**Important**: Do not assume any persona information. Keep responses general and do not reference any personal data.
`;
    }

    console.log('👤 PersonaContextService: Generating personalized prompt for:', context.preferredName);
    
    let prompt = `**User Context**: `;
    
    if (context.preferredName) {
      prompt += `User's preferred name is ${context.preferredName}. `;
    }
    
    if (context.qryptoContext) {
      prompt += `Qrypto Persona activated - User ID: ${context.qryptoContext.qryptoId}, `;
      if (context.qryptoContext.profession) {
        prompt += `Profession: ${context.qryptoContext.profession}, `;
      }
      if (context.qryptoContext.location) {
        prompt += `Location: ${context.qryptoContext.location}, `;
      }
      if (context.qryptoContext.interests.length > 0) {
        prompt += `Web3 Interests: ${context.qryptoContext.interests.join(', ')}, `;
      }
    }
    
    if (context.knytContext) {
      prompt += `KNYT Persona activated - KNYT ID: ${context.knytContext.knytId}, `;
      if (context.knytContext.profession) {
        prompt += `Profession: ${context.knytContext.profession}, `;
      }
      if (context.knytContext.location) {
        prompt += `Location: ${context.knytContext.location}, `;
      }
      if (context.knytContext.omTierStatus) {
        prompt += `OM Tier: ${context.knytContext.omTierStatus}, `;
      }
      if (context.knytContext.knytCoynOwned) {
        prompt += `KNYT COYN Owned: ${context.knytContext.knytCoynOwned}, `;
      }
    }
    
    prompt += `\n\n**Important**: Use this persona information to personalize responses appropriately. Address the user by their preferred name when natural.`;
    
    return prompt;
  }
}
