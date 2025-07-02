import { KNYTPersona, QryptoPersona, BlakQube } from '@/lib/types';
import { PrivateData } from './types';

// Function to calculate OM Tier Status based on investment amount
const calculateOMTierStatus = (totalInvested: string): string => {
  if (!totalInvested) return '';
  
  // Extract numeric value from string (remove $ and commas)
  const numericValue = parseFloat(totalInvested.replace(/[$,]/g, ''));
  
  if (isNaN(numericValue)) return '';
  
  if (numericValue >= 999) return 'ZeroJ+KNYT';
  if (numericValue >= 499) return 'FirstKNYT';
  if (numericValue >= 299) return 'KejiKNYT';
  if (numericValue >= 100) return 'KetaKNYT';
  
  return '';
};

// KNYT Persona transformers
export const knytPersonaToPrivateData = (persona: KNYTPersona): PrivateData => {
  // Calculate tier status based on investment
  const calculatedTier = calculateOMTierStatus(persona["Total-Invested"] || "");
  
  return {
    "First-Name": persona["First-Name"] || "",
    "Last-Name": persona["Last-Name"] || "",
    "KNYT-ID": persona["KNYT-ID"] || "",
    "Profession": persona["Profession"] || "",
    "Local-City": persona["Local-City"] || "",
    "Email": persona["Email"] || "",
    "Phone-Number": persona["Phone-Number"] || "",
    "Age": persona["Age"] || "",
    "Address": persona["Address"] || "",
    "EVM-Public-Key": persona["EVM-Public-Key"] || "",
    "BTC-Public-Key": persona["BTC-Public-Key"] || "",
    "ThirdWeb-Public-Key": persona["ThirdWeb-Public-Key"] || "",
    "MetaKeep-Public-Key": persona["MetaKeep-Public-Key"] || "",
    "Chain-IDs": persona["Chain-IDs"] || [],
    "Web3-Interests": persona["Web3-Interests"] || [],
    "Tokens-of-Interest": persona["Tokens-of-Interest"] || [],
    "LinkedIn-ID": persona["LinkedIn-ID"] || "",
    "LinkedIn-Profile-URL": persona["LinkedIn-Profile-URL"] || "",
    "Twitter-Handle": persona["Twitter-Handle"] || "",
    "Telegram-Handle": persona["Telegram-Handle"] || "",
    "Discord-Handle": persona["Discord-Handle"] || "",
    "Instagram-Handle": persona["Instagram-Handle"] || "",
    "YouTube-ID": persona["YouTube-ID"] || "",
    "Facebook-ID": persona["Facebook-ID"] || "",
    "TikTok-Handle": persona["TikTok-Handle"] || "",
    "OM-Member-Since": persona["OM-Member-Since"] || "",
    "OM-Tier-Status": calculatedTier || persona["OM-Tier-Status"] || "",
    "Metaiye-Shares-Owned": persona["Metaiye-Shares-Owned"] || "",
    "Total-Invested": persona["Total-Invested"] || "",
    "KNYT-COYN-Owned": persona["KNYT-COYN-Owned"] || "",
    "Motion-Comics-Owned": persona["Motion-Comics-Owned"] || "",
    "Paper-Comics-Owned": persona["Paper-Comics-Owned"] || "",
    "Digital-Comics-Owned": persona["Digital-Comics-Owned"] || "",
    "KNYT-Posters-Owned": persona["KNYT-Posters-Owned"] || "",
    "KNYT-Cards-Owned": persona["KNYT-Cards-Owned"] || "",
    "Characters-Owned": persona["Characters-Owned"] || ""
  };
};

export const privateDataToKNYTPersona = (data: PrivateData): Partial<KNYTPersona> => {
  // Calculate tier status based on investment when converting from private data
  const calculatedTier = calculateOMTierStatus((data["Total-Invested"] as string) || "");
  
  return {
    "First-Name": (data["First-Name"] as string) || "",
    "Last-Name": (data["Last-Name"] as string) || "",
    "KNYT-ID": (data["KNYT-ID"] as string) || "",
    "Profession": (data["Profession"] as string) || "",
    "Local-City": (data["Local-City"] as string) || "",
    "Email": (data["Email"] as string) || "",
    "Phone-Number": (data["Phone-Number"] as string) || "",
    "Age": (data["Age"] as string) || "",
    "Address": (data["Address"] as string) || "",
    "EVM-Public-Key": (data["EVM-Public-Key"] as string) || "",
    "BTC-Public-Key": (data["BTC-Public-Key"] as string) || "",
    "ThirdWeb-Public-Key": (data["ThirdWeb-Public-Key"] as string) || "",
    "MetaKeep-Public-Key": (data["MetaKeep-Public-Key"] as string) || "",
    "Chain-IDs": Array.isArray(data["Chain-IDs"]) ? data["Chain-IDs"] as string[] : [],
    "Web3-Interests": Array.isArray(data["Web3-Interests"]) ? data["Web3-Interests"] as string[] : [],
    "Tokens-of-Interest": Array.isArray(data["Tokens-of-Interest"]) ? data["Tokens-of-Interest"] as string[] : [],
    "LinkedIn-ID": (data["LinkedIn-ID"] as string) || "",
    "LinkedIn-Profile-URL": (data["LinkedIn-Profile-URL"] as string) || "",
    "Twitter-Handle": (data["Twitter-Handle"] as string) || "",
    "Telegram-Handle": (data["Telegram-Handle"] as string) || "",
    "Discord-Handle": (data["Discord-Handle"] as string) || "",
    "Instagram-Handle": (data["Instagram-Handle"] as string) || "",
    "YouTube-ID": (data["YouTube-ID"] as string) || "",
    "Facebook-ID": (data["Facebook-ID"] as string) || "",
    "TikTok-Handle": (data["TikTok-Handle"] as string) || "",
    "OM-Member-Since": (data["OM-Member-Since"] as string) || "",
    "OM-Tier-Status": calculatedTier || (data["OM-Tier-Status"] as string) || "",
    "Metaiye-Shares-Owned": (data["Metaiye-Shares-Owned"] as string) || "",
    "Total-Invested": (data["Total-Invested"] as string) || "",
    "KNYT-COYN-Owned": (data["KNYT-COYN-Owned"] as string) || "",
    "Motion-Comics-Owned": (data["Motion-Comics-Owned"] as string) || "",
    "Paper-Comics-Owned": (data["Paper-Comics-Owned"] as string) || "",
    "Digital-Comics-Owned": (data["Digital-Comics-Owned"] as string) || "",
    "KNYT-Posters-Owned": (data["KNYT-Posters-Owned"] as string) || "",
    "KNYT-Cards-Owned": (data["KNYT-Cards-Owned"] as string) || "",
    "Characters-Owned": (data["Characters-Owned"] as string) || ""
  };
};

// Function to automatically update OM Tier Status when Total-Invested changes
export const updateOMTierStatus = (personaData: Partial<KNYTPersona>): Partial<KNYTPersona> => {
  if (personaData["Total-Invested"]) {
    const calculatedTier = calculateOMTierStatus(personaData["Total-Invested"]);
    if (calculatedTier) {
      personaData["OM-Tier-Status"] = calculatedTier;
    }
  }
  return personaData;
};

export const createDefaultKNYTPersona = (userEmail?: string | null): Partial<KNYTPersona> => {
  return {
    "First-Name": "",
    "Last-Name": "",
    "KNYT-ID": "",
    "Profession": "",
    "Local-City": "",
    "Email": userEmail || "",
    "Phone-Number": "",
    "Age": "",
    "Address": "",
    "EVM-Public-Key": "",
    "BTC-Public-Key": "",
    "ThirdWeb-Public-Key": "",
    "MetaKeep-Public-Key": "",
    "Chain-IDs": [],
    "Web3-Interests": [],
    "Tokens-of-Interest": [],
    "LinkedIn-ID": "",
    "LinkedIn-Profile-URL": "",
    "Twitter-Handle": "",
    "Telegram-Handle": "",
    "Discord-Handle": "",
    "Instagram-Handle": "",
    "YouTube-ID": "",
    "Facebook-ID": "",
    "TikTok-Handle": "",
    "OM-Member-Since": "",
    "OM-Tier-Status": "",
    "Metaiye-Shares-Owned": "",
    "Total-Invested": "",
    "KNYT-COYN-Owned": "",
    "Motion-Comics-Owned": "",
    "Paper-Comics-Owned": "",
    "Digital-Comics-Owned": "",
    "KNYT-Posters-Owned": "",
    "KNYT-Cards-Owned": "",
    "Characters-Owned": ""
  };
};

// ... keep existing code (privateDataToQryptoPersona, qryptoPersonaToPrivateData, createDefaultQryptoPersona, and legacy functions)

export const privateDataToQryptoPersona = (data: PrivateData): Partial<QryptoPersona> => {
  const getValue = (key: string): string => {
    const value = data[key];
    return Array.isArray(value) ? value.join(', ') : (value || "");
  };

  const getArrayValue = (key: string): string[] => {
    const value = data[key];
    if (Array.isArray(value)) return value;
    if (typeof value === 'string' && value.trim()) {
      return value.split(',').map(item => item.trim()).filter(Boolean);
    }
    return [];
  };

  return {
    "First-Name": getValue("First-Name"),
    "Last-Name": getValue("Last-Name"),
    "Qrypto-ID": getValue("Qrypto-ID"),
    "Profession": getValue("Profession"),
    "Local-City": getValue("Local-City"),
    "Email": getValue("Email"),
    "EVM-Public-Key": getValue("EVM-Public-Key"),
    "BTC-Public-Key": getValue("BTC-Public-Key"),
    "Chain-IDs": getArrayValue("Chain-IDs"),
    "Wallets-of-Interest": getArrayValue("Wallets-of-Interest"),
    "Web3-Interests": getArrayValue("Web3-Interests"),
    "Tokens-of-Interest": getArrayValue("Tokens-of-Interest"),
    "LinkedIn-ID": getValue("LinkedIn-ID"),
    "LinkedIn-Profile-URL": getValue("LinkedIn-Profile-URL"),
    "Twitter-Handle": getValue("Twitter-Handle"),
    "Telegram-Handle": getValue("Telegram-Handle"),
    "Discord-Handle": getValue("Discord-Handle"),
    "Instagram-Handle": getValue("Instagram-Handle"),
    "GitHub-Handle": getValue("GitHub-Handle"),
    "YouTube-ID": getValue("YouTube-ID"),
    "Facebook-ID": getValue("Facebook-ID"),
    "TikTok-Handle": getValue("TikTok-Handle")
  };
};

export const qryptoPersonaToPrivateData = (persona: QryptoPersona): PrivateData => {
  return {
    "First-Name": persona["First-Name"] || "",
    "Last-Name": persona["Last-Name"] || "",
    "Qrypto-ID": persona["Qrypto-ID"] || "",
    "Profession": persona["Profession"] || "",
    "Local-City": persona["Local-City"] || "",
    "Email": persona["Email"] || "",
    "EVM-Public-Key": persona["EVM-Public-Key"] || "",
    "BTC-Public-Key": persona["BTC-Public-Key"] || "",
    "Chain-IDs": persona["Chain-IDs"] || [],
    "Wallets-of-Interest": persona["Wallets-of-Interest"] || [],
    "Web3-Interests": persona["Web3-Interests"] || [],
    "Tokens-of-Interest": persona["Tokens-of-Interest"] || [],
    "LinkedIn-ID": persona["LinkedIn-ID"] || "",
    "LinkedIn-Profile-URL": persona["LinkedIn-Profile-URL"] || "",
    "Twitter-Handle": persona["Twitter-Handle"] || "",
    "Telegram-Handle": persona["Telegram-Handle"] || "",
    "Discord-Handle": persona["Discord-Handle"] || "",
    "Instagram-Handle": persona["Instagram-Handle"] || "",
    "GitHub-Handle": persona["GitHub-Handle"] || "",
    "YouTube-ID": persona["YouTube-ID"] || "",
    "Facebook-ID": persona["Facebook-ID"] || "",
    "TikTok-Handle": persona["TikTok-Handle"] || ""
  };
};

// Legacy functions for backward compatibility
export const privateDataToBlakQube = (data: PrivateData): Partial<BlakQube> => {
  console.warn('privateDataToBlakQube is deprecated. Use privateDataToKNYTPersona or privateDataToQryptoPersona instead.');
  
  // Determine which persona type based on the data
  if (data['KNYT-ID']) {
    return privateDataToKNYTPersona(data) as Partial<BlakQube>;
  } else {
    return privateDataToQryptoPersona(data) as Partial<BlakQube>;
  }
};

export const blakQubeToPrivateData = (blakQube: BlakQube): PrivateData => {
  console.warn('blakQubeToPrivateData is deprecated. Use knytPersonaToPrivateData or qryptoPersonaToPrivateData instead.');
  
  // Convert to private data format
  return {
    "Profession": blakQube["Profession"] || "",
    "Web3-Interests": blakQube["Web3-Interests"] || [],
    "Local-City": blakQube["Local-City"] || "",
    "Email": blakQube["Email"] || "",
    "EVM-Public-Key": blakQube["EVM-Public-Key"] || "",
    "BTC-Public-Key": blakQube["BTC-Public-Key"] || "",
    "Tokens-of-Interest": blakQube["Tokens-of-Interest"] || [],
    "Chain-IDs": blakQube["Chain-IDs"] || [],
    "Wallets-of-Interest": blakQube["Wallets-of-Interest"] || [],
    "LinkedIn-ID": blakQube["LinkedIn-ID"] || "",
    "LinkedIn-Profile-URL": blakQube["LinkedIn-Profile-URL"] || "",
    "Twitter-Handle": blakQube["Twitter-Handle"] || "",
    "Telegram-Handle": blakQube["Telegram-Handle"] || "",
    "Discord-Handle": blakQube["Discord-Handle"] || "",
    "Instagram-Handle": blakQube["Instagram-Handle"] || "",
    "GitHub-Handle": blakQube["GitHub-Handle"] || "",
    "First-Name": blakQube["First-Name"] || "",
    "Last-Name": blakQube["Last-Name"] || "",
    "KNYT-ID": blakQube["KNYT-ID"] || "",
    "Qrypto-ID": blakQube["Qrypto-ID"] || "",
    "ThirdWeb-Public-Key": blakQube["ThirdWeb-Public-Key"] || "",
    "YouTube-ID": blakQube["YouTube-ID"] || "",
    "Facebook-ID": blakQube["Facebook-ID"] || "",
    "TikTok-Handle": blakQube["TikTok-Handle"] || "",
    "Phone-Number": blakQube["Phone-Number"] || "",
    "Age": blakQube["Age"] || "",
    "Address": blakQube["Address"] || "",
    "OM-Member-Since": blakQube["OM-Member-Since"] || "",
    "OM-Tier-Status": blakQube["OM-Tier-Status"] || "",
    "Metaiye-Shares-Owned": blakQube["Metaiye-Shares-Owned"] || "",
    "KNYT-COYN-Owned": blakQube["KNYT-COYN-Owned"] || "",
    "MetaKeep-Public-Key": blakQube["MetaKeep-Public-Key"] || "",
    "Motion-Comics-Owned": blakQube["Motion-Comics-Owned"] || "",
    "Paper-Comics-Owned": blakQube["Paper-Comics-Owned"] || "",
    "Digital-Comics-Owned": blakQube["Digital-Comics-Owned"] || "",
    "KNYT-Posters-Owned": blakQube["KNYT-Posters-Owned"] || "",
    "KNYT-Cards-Owned": blakQube["KNYT-Cards-Owned"] || "",
    "Characters-Owned": blakQube["Characters-Owned"] || ""
  };
};

export const createDefaultQryptoPersona = (email?: string): Partial<QryptoPersona> => {
  return {
    "First-Name": "",
    "Last-Name": "",
    "Qrypto-ID": "",
    "Profession": "",
    "Local-City": "",
    "Email": email || "",
    "EVM-Public-Key": "",
    "BTC-Public-Key": "",
    "Chain-IDs": [],
    "Wallets-of-Interest": [],
    "Web3-Interests": [],
    "Tokens-of-Interest": [],
    "LinkedIn-ID": "",
    "LinkedIn-Profile-URL": "",
    "Twitter-Handle": "",
    "Telegram-Handle": "",
    "Discord-Handle": "",
    "Instagram-Handle": "",
    "GitHub-Handle": "",
    "YouTube-ID": "",
    "Facebook-ID": "",
    "TikTok-Handle": ""
  };
};

// Legacy function for backward compatibility
export const createDefaultBlakQube = (email?: string): Partial<BlakQube> => {
  console.warn('createDefaultBlakQube is deprecated. Use createDefaultKNYTPersona or createDefaultQryptoPersona instead.');
  
  return {
    "Profession": "",
    "Web3-Interests": [],
    "Local-City": "",
    "Email": email || "",
    "EVM-Public-Key": "",
    "BTC-Public-Key": "",
    "Tokens-of-Interest": [],
    "Chain-IDs": [],
    "Wallets-of-Interest": [],
    "LinkedIn-ID": "",
    "LinkedIn-Profile-URL": "",
    "Twitter-Handle": "",
    "Telegram-Handle": "",
    "Discord-Handle": "",
    "Instagram-Handle": "",
    "GitHub-Handle": "",
    "First-Name": "",
    "Last-Name": "",
    "KNYT-ID": "",
    "Qrypto-ID": "",
    "ThirdWeb-Public-Key": "",
    "YouTube-ID": "",
    "Facebook-ID": "",
    "TikTok-Handle": "",
    "Phone-Number": "",
    "Age": "",
    "Address": "",
    "OM-Member-Since": "",
    "OM-Tier-Status": "",
    "Metaiye-Shares-Owned": "",
    "KNYT-COYN-Owned": "",
    "MetaKeep-Public-Key": "",
    "Motion-Comics-Owned": "",
    "Paper-Comics-Owned": "",
    "Digital-Comics-Owned": "",
    "KNYT-Posters-Owned": "",
    "KNYT-Cards-Owned": "",
    "Characters-Owned": ""
  };
};
