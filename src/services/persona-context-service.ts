
import { QryptoPersona, KNYTPersona } from '@/lib/types';
import { blakQubeService } from '@/services/blakqube-service';
import { useQryptoPersona } from '@/hooks/use-qrypto-persona';
import { useKNYTPersona } from '@/hooks/use-knyt-persona';

export interface PersonaContext {
  isActive: boolean;
  displayName?: string;
  identityContext?: string;
  investmentContext?: string;
  cryptoContext?: string;
  socialContext?: string;
  experienceLevel?: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  fullPersonaData?: QryptoPersona | KNYTPersona;
}

export interface ConversationContext {
  qryptoContext?: PersonaContext;
  knytContext?: PersonaContext;
  preferredName?: string;
  isAnonymous: boolean;
}

/**
 * Service for extracting and formatting persona context for AI conversations
 */
export class PersonaContextService {
  /**
   * Get comprehensive conversation context from active personas
   */
  static async getConversationContext(): Promise<ConversationContext> {
    // Check if personas are activated (client-side state)
    const qryptoActivated = localStorage.getItem('qrypto-persona-activated') === 'true';
    const knytActivated = localStorage.getItem('knyt-persona-activated') === 'true';

    let qryptoContext: PersonaContext | undefined;
    let knytContext: PersonaContext | undefined;

    // Get Qrypto context if activated
    if (qryptoActivated) {
      const qryptoPersona = await blakQubeService.getPersonaData('qrypto') as QryptoPersona;
      if (qryptoPersona) {
        qryptoContext = this.buildQryptoContext(qryptoPersona);
      }
    }

    // Get KNYT context if activated
    if (knytActivated) {
      const knytPersona = await blakQubeService.getPersonaData('knyt') as KNYTPersona;
      if (knytPersona) {
        knytContext = this.buildKNYTContext(knytPersona);
      }
    }

    // Determine preferred name and overall context
    const preferredName = this.determinePreferredName(qryptoContext, knytContext);
    const isAnonymous = !qryptoContext?.isActive && !knytContext?.isActive;

    return {
      qryptoContext,
      knytContext,
      preferredName,
      isAnonymous
    };
  }

  /**
   * Build rich context from Qrypto persona data
   */
  private static buildQryptoContext(persona: QryptoPersona): PersonaContext {
    const firstName = persona['First-Name'] || '';
    const profession = persona['Profession'] || '';
    const location = persona['Local-City'] || '';
    const web3Interests = persona['Web3-Interests'] || [];
    const tokensOfInterest = persona['Tokens-of-Interest'] || [];
    const chainIds = persona['Chain-IDs'] || [];
    const walletsOfInterest = persona['Wallets-of-Interest'] || [];

    // Build identity context
    const identityParts = [firstName, profession, location].filter(Boolean);
    const identityContext = identityParts.length > 0 
      ? `User: ${identityParts.join(', ')}`
      : undefined;

    // Build crypto context
    const cryptoParts = [];
    if (chainIds.length > 0) cryptoParts.push(`Active on: ${chainIds.join(', ')}`);
    if (tokensOfInterest.length > 0) cryptoParts.push(`Interested in: ${tokensOfInterest.join(', ')}`);
    if (walletsOfInterest.length > 0) cryptoParts.push(`Uses: ${walletsOfInterest.join(', ')}`);
    if (web3Interests.length > 0) cryptoParts.push(`Web3 focus: ${web3Interests.join(', ')}`);
    
    const cryptoContext = cryptoParts.length > 0 ? cryptoParts.join('. ') : undefined;

    // Build social context
    const socialHandles = [
      persona['LinkedIn-Profile-URL'] && 'LinkedIn',
      persona['Twitter-Handle'] && 'Twitter',
      persona['GitHub-Handle'] && 'GitHub',
      persona['Telegram-Handle'] && 'Telegram',
      persona['Discord-Handle'] && 'Discord'
    ].filter(Boolean);
    
    const socialContext = socialHandles.length > 0 
      ? `Active on: ${socialHandles.join(', ')}`
      : undefined;

    // Determine experience level
    const experienceLevel = this.determineQryptoExperienceLevel(persona);

    return {
      isActive: true,
      displayName: firstName || persona['Qrypto-ID'],
      identityContext,
      cryptoContext,
      socialContext,
      experienceLevel,
      fullPersonaData: persona
    };
  }

  /**
   * Build rich context from KNYT persona data
   */
  private static buildKNYTContext(persona: KNYTPersona): PersonaContext {
    const firstName = persona['First-Name'] || '';
    const knytId = persona['KNYT-ID'] || '';
    const profession = persona['Profession'] || '';
    const location = persona['Local-City'] || '';
    const memberSince = persona['OM-Member-Since'] || '';
    const tierStatus = persona['OM-Tier-Status'] || '';
    const totalInvested = persona['Total-Invested'] || '';
    const knytCoynOwned = persona['KNYT-COYN-Owned'] || '';

    // Build identity context
    const identityParts = [firstName, profession, location].filter(Boolean);
    if (knytId) {
      const knytPrefix = knytId.split('@')[0];
      identityParts.unshift(`KNYT: ${knytPrefix}`);
    }
    
    const identityContext = identityParts.length > 0 
      ? `User: ${identityParts.join(', ')}`
      : undefined;

    // Build investment context
    const investmentParts = [];
    if (memberSince) investmentParts.push(`Member since: ${memberSince}`);
    if (tierStatus) investmentParts.push(`Tier: ${tierStatus}`);
    if (totalInvested) investmentParts.push(`Invested: ${totalInvested}`);
    if (knytCoynOwned) investmentParts.push(`KNYT COYN: ${knytCoynOwned}`);
    
    const investmentContext = investmentParts.length > 0 ? investmentParts.join(', ') : undefined;

    // Build crypto context (similar to Qrypto but with KNYT-specific data)
    const web3Interests = persona['Web3-Interests'] || [];
    const tokensOfInterest = persona['Tokens-of-Interest'] || [];
    const chainIds = persona['Chain-IDs'] || [];
    
    const cryptoParts = [];
    if (chainIds.length > 0) cryptoParts.push(`Active on: ${chainIds.join(', ')}`);
    if (tokensOfInterest.length > 0) cryptoParts.push(`Interested in: ${tokensOfInterest.join(', ')}`);
    if (web3Interests.length > 0) cryptoParts.push(`Web3 focus: ${web3Interests.join(', ')}`);
    
    const cryptoContext = cryptoParts.length > 0 ? cryptoParts.join('. ') : undefined;

    // Build digital assets context
    const digitalAssets = [];
    if (persona['Motion-Comics-Owned']) digitalAssets.push(`Motion Comics: ${persona['Motion-Comics-Owned']}`);
    if (persona['Digital-Comics-Owned']) digitalAssets.push(`Digital Comics: ${persona['Digital-Comics-Owned']}`);
    if (persona['KNYT-Cards-Owned']) digitalAssets.push(`KNYT Cards: ${persona['KNYT-Cards-Owned']}`);
    if (persona['Characters-Owned']) digitalAssets.push(`Characters: ${persona['Characters-Owned']}`);
    
    // Build social context
    const socialHandles = [
      persona['LinkedIn-Profile-URL'] && 'LinkedIn',
      persona['Twitter-Handle'] && 'Twitter',
      persona['Telegram-Handle'] && 'Telegram',
      persona['Discord-Handle'] && 'Discord'
    ].filter(Boolean);
    
    const socialContext = socialHandles.length > 0 
      ? `Active on: ${socialHandles.join(', ')}`
      : undefined;

    // Determine experience level
    const experienceLevel = this.determineKNYTExperienceLevel(persona);

    return {
      isActive: true,
      displayName: firstName || knytId.split('@')[0],
      identityContext,
      investmentContext,
      cryptoContext,
      socialContext,
      experienceLevel,
      fullPersonaData: persona
    };
  }

  /**
   * Determine preferred name for addressing the user
   */
  private static determinePreferredName(
    qryptoContext?: PersonaContext,
    knytContext?: PersonaContext
  ): string | undefined {
    // Prefer KNYT ID prefix if available and active
    if (knytContext?.isActive && knytContext.fullPersonaData) {
      const knytId = (knytContext.fullPersonaData as KNYTPersona)['KNYT-ID'];
      if (knytId) {
        return knytId.split('@')[0];
      }
    }

    // Fall back to first name from either persona
    if (knytContext?.isActive && knytContext.fullPersonaData) {
      const firstName = (knytContext.fullPersonaData as KNYTPersona)['First-Name'];
      if (firstName) return firstName;
    }

    if (qryptoContext?.isActive && qryptoContext.fullPersonaData) {
      const firstName = (qryptoContext.fullPersonaData as QryptoPersona)['First-Name'];
      if (firstName) return firstName;
    }

    return undefined;
  }

  /**
   * Determine experience level from Qrypto persona data
   */
  private static determineQryptoExperienceLevel(persona: QryptoPersona): 'beginner' | 'intermediate' | 'advanced' | 'expert' {
    const web3Interests = persona['Web3-Interests'] || [];
    const tokensOfInterest = persona['Tokens-of-Interest'] || [];
    const chainIds = persona['Chain-IDs'] || [];
    const hasWallets = persona['EVM-Public-Key'] || persona['BTC-Public-Key'];

    if (chainIds.length >= 3 && tokensOfInterest.length >= 5 && web3Interests.length >= 3) {
      return 'expert';
    } else if (chainIds.length >= 2 && tokensOfInterest.length >= 3 && hasWallets) {
      return 'advanced';
    } else if (chainIds.length >= 1 && tokensOfInterest.length >= 1) {
      return 'intermediate';
    } else {
      return 'beginner';
    }
  }

  /**
   * Determine experience level from KNYT persona data
   */
  private static determineKNYTExperienceLevel(persona: KNYTPersona): 'beginner' | 'intermediate' | 'advanced' | 'expert' {
    const memberSince = persona['OM-Member-Since'];
    const tierStatus = persona['OM-Tier-Status'];
    const totalInvested = persona['Total-Invested'];
    const digitalAssets = [
      persona['Motion-Comics-Owned'],
      persona['Digital-Comics-Owned'],
      persona['KNYT-Cards-Owned'],
      persona['Characters-Owned']
    ].filter(Boolean).length;

    // Determine based on tier status and investment history
    if (tierStatus?.includes('ZeroJ') || digitalAssets >= 3) {
      return 'expert';
    } else if (tierStatus?.includes('First') || digitalAssets >= 2) {
      return 'advanced';
    } else if (memberSince || digitalAssets >= 1) {
      return 'intermediate';
    } else {
      return 'beginner';
    }
  }

  /**
   * Generate contextual system prompt addition based on conversation context
   */
  static generateContextualPrompt(
    context: ConversationContext,
    conversationTopic?: string
  ): string {
    if (context.isAnonymous) {
      return "The user is interacting anonymously. Do not make assumptions about their background, preferences, or experience level.";
    }

    const promptParts = [];

    // Add preferred name
    if (context.preferredName) {
      promptParts.push(`Address the user as "${context.preferredName}".`);
    }

    // Add relevant context based on conversation topic
    if (conversationTopic) {
      const relevantContext = this.selectRelevantContext(context, conversationTopic);
      if (relevantContext) {
        promptParts.push(relevantContext);
      }
    } else {
      // General context
      if (context.qryptoContext?.identityContext) {
        promptParts.push(context.qryptoContext.identityContext);
      }
      if (context.knytContext?.identityContext) {
        promptParts.push(context.knytContext.identityContext);
      }
    }

    // Add experience level guidance
    const experienceLevel = context.knytContext?.experienceLevel || context.qryptoContext?.experienceLevel;
    if (experienceLevel) {
      const levelGuidance = {
        beginner: "Explain concepts clearly with examples. Avoid jargon.",
        intermediate: "Provide balanced detail. Use some technical terms with brief explanations.",
        advanced: "Use technical language appropriately. Focus on nuanced insights.",
        expert: "Engage at a high technical level. Reference advanced concepts directly."
      };
      promptParts.push(`User experience level: ${experienceLevel}. ${levelGuidance[experienceLevel]}`);
    }

    promptParts.push("Tailor your response naturally to their context without explicitly mentioning that you're using their profile information.");

    return promptParts.join(' ');
  }

  /**
   * Select relevant context based on conversation topic
   */
  private static selectRelevantContext(
    context: ConversationContext,
    topic: string
  ): string | null {
    const topicLower = topic.toLowerCase();
    const contextParts = [];

    // Investment-related topics
    if (topicLower.includes('invest') || topicLower.includes('stake') || topicLower.includes('yield')) {
      if (context.knytContext?.investmentContext) {
        contextParts.push(context.knytContext.investmentContext);
      }
    }

    // NFT/Digital asset topics
    if (topicLower.includes('nft') || topicLower.includes('comic') || topicLower.includes('digital asset')) {
      if (context.knytContext?.fullPersonaData) {
        const knytPersona = context.knytContext.fullPersonaData as KNYTPersona;
        const assets = [
          knytPersona['Motion-Comics-Owned'] && `Motion Comics: ${knytPersona['Motion-Comics-Owned']}`,
          knytPersona['Digital-Comics-Owned'] && `Digital Comics: ${knytPersona['Digital-Comics-Owned']}`,
          knytPersona['KNYT-Cards-Owned'] && `KNYT Cards: ${knytPersona['KNYT-Cards-Owned']}`
        ].filter(Boolean);
        if (assets.length > 0) {
          contextParts.push(`User owns: ${assets.join(', ')}`);
        }
      }
    }

    // Crypto/DeFi topics
    if (topicLower.includes('crypto') || topicLower.includes('defi') || topicLower.includes('blockchain')) {
      if (context.qryptoContext?.cryptoContext) {
        contextParts.push(context.qryptoContext.cryptoContext);
      }
      if (context.knytContext?.cryptoContext) {
        contextParts.push(context.knytContext.cryptoContext);
      }
    }

    // Social/Community topics
    if (topicLower.includes('community') || topicLower.includes('connect') || topicLower.includes('network')) {
      if (context.qryptoContext?.socialContext) {
        contextParts.push(context.qryptoContext.socialContext);
      }
      if (context.knytContext?.socialContext) {
        contextParts.push(context.knytContext.socialContext);
      }
    }

    return contextParts.length > 0 ? contextParts.join('. ') : null;
  }
}
