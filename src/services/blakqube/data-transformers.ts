import { KNYTPersona, QryptoPersona, BlakQube } from '@/lib/types';
import { PrivateData } from './blakqube/types';

// Helper function to convert PrivateData to BlakQube format
export const privateDataToBlakQube = (data: PrivateData): Partial<BlakQube> => {
  return {
    "Profession": data["Profession"] as string || '',
    "Web3-Interests": (data["Web3-Interests"] as string[]) || [],
    "Local-City": data["Local-City"] as string || '',
    "Email": data["Email"] as string || '',
    "EVM-Public-Key": data["EVM-Public-Key"] as string || '',
    "BTC-Public-Key": data["BTC-Public-Key"] as string || '',
    "Tokens-of-Interest": (data["Tokens-of-Interest"] as string[]) || [],
    "Chain-IDs": (data["Chain-IDs"] as string[]) || [],
    "Wallets-of-Interest": (data["Wallets-of-Interest"] as string[]) || [],
    "LinkedIn-ID": data["LinkedIn-ID"] as string || '',
    "LinkedIn-Profile-URL": data["LinkedIn-Profile-URL"] as string || '',
    "Twitter-Handle": data["Twitter-Handle"] as string || '',
    "Telegram-Handle": data["Telegram-Handle"] as string || '',
    "Discord-Handle": data["Discord-Handle"] as string || '',
    "Instagram-Handle": data["Instagram-Handle"] as string || '',
    "GitHub-Handle": data["GitHub-Handle"] as string || '',
    "First-Name": data["First-Name"] as string || '',
    "Last-Name": data["Last-Name"] as string || '',
    "KNYT-ID": data["KNYT-ID"] as string || '',
    "Qrypto-ID": data["Qrypto-ID"] as string || '',
    "ThirdWeb-Public-Key": data["ThirdWeb-Public-Key"] as string || '',
    "YouTube-ID": data["YouTube-ID"] as string || '',
    "Facebook-ID": data["Facebook-ID"] as string || '',
    "TikTok-Handle": data["TikTok-Handle"] as string || '',
    "Phone-Number": data["Phone-Number"] as string || '',
    "Age": data["Age"] as string || '',
    "Address": data["Address"] as string || '',
    "OM-Member-Since": data["OM-Member-Since"] as string || '',
    "OM-Tier-Status": data["OM-Tier-Status"] as string || '',
    "Metaiye-Shares-Owned": data["Metaiye-Shares-Owned"] as string || '',
    "KNYT-COYN-Owned": data["KNYT-COYN-Owned"] as string || '',
    "MetaKeep-Public-Key": data["MetaKeep-Public-Key"] as string || '',
    "Motion-Comics-Owned": data["Motion-Comics-Owned"] as string || '',
    "Paper-Comics-Owned": data["Paper-Comics-Owned"] as string || '',
    "Digital-Comics-Owned": data["Digital-Comics-Owned"] as string || '',
    "KNYT-Posters-Owned": data["KNYT-Posters-Owned"] as string || '',
    "KNYT-Cards-Owned": data["KNYT-Cards-Owned"] as string || '',
    "Characters-Owned": data["Characters-Owned"] as string || ''
  };
};

// Helper function to convert BlakQube format to PrivateData
export const blakQubeToPrivateData = (blakQube: BlakQube): PrivateData => {
  return {
    "Profession": blakQube["Profession"] || '',
    "Web3-Interests": blakQube["Web3-Interests"] || [],
    "Local-City": blakQube["Local-City"] || '',
    "Email": blakQube["Email"] || '',
    "EVM-Public-Key": blakQube["EVM-Public-Key"] || '',
    "BTC-Public-Key": blakQube["BTC-Public-Key"] || '',
    "Tokens-of-Interest": blakQube["Tokens-of-Interest"] || [],
    "Chain-IDs": blakQube["Chain-IDs"] || [],
    "Wallets-of-Interest": blakQube["Wallets-of-Interest"] || [],
    "LinkedIn-ID": blakQube["LinkedIn-ID"] || '',
    "LinkedIn-Profile-URL": blakQube["LinkedIn-Profile-URL"] || '',
    "Twitter-Handle": blakQube["Twitter-Handle"] || '',
    "Telegram-Handle": blakQube["Telegram-Handle"] || '',
    "Discord-Handle": blakQube["Discord-Handle"] || '',
    "Instagram-Handle": blakQube["Instagram-Handle"] || '',
    "GitHub-Handle": blakQube["GitHub-Handle"] || '',
    "First-Name": blakQube["First-Name"] || '',
    "Last-Name": blakQube["Last-Name"] || '',
    "KNYT-ID": blakQube["KNYT-ID"] || '',
    "Qrypto-ID": blakQube["Qrypto-ID"] || '',
    "ThirdWeb-Public-Key": blakQube["ThirdWeb-Public-Key"] || '',
    "YouTube-ID": blakQube["YouTube-ID"] || '',
    "Facebook-ID": blakQube["Facebook-ID"] || '',
    "TikTok-Handle": blakQube["TikTok-Handle"] || '',
    "Phone-Number": blakQube["Phone-Number"] || '',
    "Age": blakQube["Age"] || '',
    "Address": blakQube["Address"] || '',
    "OM-Member-Since": blakQube["OM-Member-Since"] || '',
    "OM-Tier-Status": blakQube["OM-Tier-Status"] || '',
    "Metaiye-Shares-Owned": blakQube["Metaiye-Shares-Owned"] || '',
    "KNYT-COYN-Owned": blakQube["KNYT-COYN-Owned"] || '',
    "MetaKeep-Public-Key": blakQube["MetaKeep-Public-Key"] || '',
    "Motion-Comics-Owned": blakQube["Motion-Comics-Owned"] || '',
    "Paper-Comics-Owned": blakQube["Paper-Comics-Owned"] || '',
    "Digital-Comics-Owned": blakQube["Digital-Comics-Owned"] || '',
    "KNYT-Posters-Owned": blakQube["KNYT-Posters-Owned"] || '',
    "KNYT-Cards-Owned": blakQube["KNYT-Cards-Owned"] || '',
    "Characters-Owned": blakQube["Characters-Owned"] || ''
  };
};

// Helper function to create a default BlakQube object
export const createDefaultBlakQube = (email: string): BlakQube => {
  return {
    id: '',
    user_id: '',
    "Profession": '',
    "Web3-Interests": [],
    "Local-City": '',
    "Email": email,
    "EVM-Public-Key": '',
    "BTC-Public-Key": '',
    "Tokens-of-Interest": [],
    "Chain-IDs": [],
    "Wallets-of-Interest": [],
    "LinkedIn-ID": '',
    "LinkedIn-Profile-URL": '',
    "Twitter-Handle": '',
    "Telegram-Handle": '',
    "Discord-Handle": '',
    "Instagram-Handle": '',
    "GitHub-Handle": '',
    "First-Name": '',
    "Last-Name": '',
    "KNYT-ID": '',
    "Qrypto-ID": '',
    "ThirdWeb-Public-Key": '',
    "YouTube-ID": '',
    "Facebook-ID": '',
    "TikTok-Handle": '',
    "Phone-Number": '',
    "Age": '',
    "Address": '',
    "OM-Member-Since": '',
    "OM-Tier-Status": '',
    "Metaiye-Shares-Owned": '',
    "KNYT-COYN-Owned": '',
    "MetaKeep-Public-Key": '',
    "Motion-Comics-Owned": '',
    "Paper-Comics-Owned": '',
    "Digital-Comics-Owned": '',
    "KNYT-Posters-Owned": '',
    "KNYT-Cards-Owned": '',
    "Characters-Owned": '',
    created_at: '',
    updated_at: ''
  };
};

// Helper function to convert PrivateData to KNYTPersona format
// Helper function to calculate OM Tier Status based on investment amount
const calculateOMTierStatus = (totalInvested: string): string => {
  // Extract numeric value from string (remove $ and commas)
  const amount = parseFloat(totalInvested.replace(/[$,]/g, '')) || 0;
  
  if (amount >= 999) {
    return 'ZeroJ+KNYT';
  } else if (amount >= 499) {
    return 'FirstKNYT';
  } else if (amount >= 299) {
    return 'KejiKNYT';
  } else if (amount >= 100) {
    return 'KetaKNYT';
  } else {
    return 'KetaKNYT'; // Default for amounts under $100
  }
};

// Helper function to format currency
const formatCurrency = (value: string): string => {
  const numericValue = parseFloat(value.replace(/[$,]/g, '')) || 0;
  return `$${numericValue.toLocaleString()}`;
};

export const privateDataToKNYTPersona = (data: PrivateData): Partial<KNYTPersona> => {
  // Format Total-Invested as currency
  const formattedTotalInvested = data["Total-Invested"] ? 
    formatCurrency(data["Total-Invested"] as string) : '';
  
  // Calculate OM Tier Status based on Total-Invested
  const calculatedOMTierStatus = formattedTotalInvested ? 
    calculateOMTierStatus(formattedTotalInvested) : 
    (data["OM-Tier-Status"] as string || '');

  return {
    "First-Name": data["First-Name"] as string || '',
    "Last-Name": data["Last-Name"] as string || '',
    "KNYT-ID": data["KNYT-ID"] as string || '',
    "Profession": data["Profession"] as string || '',
    "Local-City": data["Local-City"] as string || '',
    "Email": data["Email"] as string || '',
    "Phone-Number": data["Phone-Number"] as string || '',
    "Age": data["Age"] as string || '',
    "Address": data["Address"] as string || '',
    "EVM-Public-Key": data["EVM-Public-Key"] as string || '',
    "BTC-Public-Key": data["BTC-Public-Key"] as string || '',
    "ThirdWeb-Public-Key": data["ThirdWeb-Public-Key"] as string || '',
    "MetaKeep-Public-Key": data["MetaKeep-Public-Key"] as string || '',
    "Chain-IDs": Array.isArray(data["Chain-IDs"]) ? data["Chain-IDs"] : [],
    "Web3-Interests": Array.isArray(data["Web3-Interests"]) ? data["Web3-Interests"] : [],
    "Tokens-of-Interest": Array.isArray(data["Tokens-of-Interest"]) ? data["Tokens-of-Interest"] : [],
    "LinkedIn-ID": data["LinkedIn-ID"] as string || '',
    "LinkedIn-Profile-URL": data["LinkedIn-Profile-URL"] as string || '',
    "Twitter-Handle": data["Twitter-Handle"] as string || '',
    "Telegram-Handle": data["Telegram-Handle"] as string || '',
    "Discord-Handle": data["Discord-Handle"] as string || '',
    "Instagram-Handle": data["Instagram-Handle"] as string || '',
    "YouTube-ID": data["YouTube-ID"] as string || '',
    "Facebook-ID": data["Facebook-ID"] as string || '',
    "TikTok-Handle": data["TikTok-Handle"] as string || '',
    "OM-Member-Since": data["OM-Member-Since"] as string || '',
    "OM-Tier-Status": calculatedOMTierStatus,
    "Metaiye-Shares-Owned": data["Metaiye-Shares-Owned"] as string || '',
    "Total-Invested": formattedTotalInvested,
    "KNYT-COYN-Owned": data["KNYT-COYN-Owned"] as string || '',
    "Motion-Comics-Owned": data["Motion-Comics-Owned"] as string || '',
    "Paper-Comics-Owned": data["Paper-Comics-Owned"] as string || '',
    "Digital-Comics-Owned": data["Digital-Comics-Owned"] as string || '',
    "KNYT-Posters-Owned": data["KNYT-Posters-Owned"] as string || '',
    "KNYT-Cards-Owned": data["KNYT-Cards-Owned"] as string || '',
    "Characters-Owned": data["Characters-Owned"] as string || ''
  };
};

// Helper function to convert KNYTPersona format to PrivateData
export const knytPersonaToPrivateData = (knytPersona: KNYTPersona): PrivateData => {
    return {
        "First-Name": knytPersona["First-Name"] || '',
        "Last-Name": knytPersona["Last-Name"] || '',
        "KNYT-ID": knytPersona["KNYT-ID"] || '',
        "Profession": knytPersona["Profession"] || '',
        "Local-City": knytPersona["Local-City"] || '',
        "Email": knytPersona["Email"] || '',
        "Phone-Number": knytPersona["Phone-Number"] || '',
        "Age": knytPersona["Age"] || '',
        "Address": knytPersona["Address"] || '',
        "EVM-Public-Key": knytPersona["EVM-Public-Key"] || '',
        "BTC-Public-Key": knytPersona["BTC-Public-Key"] || '',
        "ThirdWeb-Public-Key": knytPersona["ThirdWeb-Public-Key"] || '',
        "MetaKeep-Public-Key": knytPersona["MetaKeep-Public-Key"] || '',
        "Chain-IDs": knytPersona["Chain-IDs"] || [],
        "Web3-Interests": knytPersona["Web3-Interests"] || [],
        "Tokens-of-Interest": knytPersona["Tokens-of-Interest"] || [],
        "LinkedIn-ID": knytPersona["LinkedIn-ID"] || '',
        "LinkedIn-Profile-URL": knytPersona["LinkedIn-Profile-URL"] || '',
        "Twitter-Handle": knytPersona["Twitter-Handle"] || '',
        "Telegram-Handle": knytPersona["Telegram-Handle"] || '',
        "Discord-Handle": knytPersona["Discord-Handle"] || '',
        "Instagram-Handle": knytPersona["Instagram-Handle"] || '',
        "YouTube-ID": knytPersona["YouTube-ID"] || '',
        "Facebook-ID": knytPersona["Facebook-ID"] || '',
        "TikTok-Handle": knytPersona["TikTok-Handle"] || '',
        "OM-Member-Since": knytPersona["OM-Member-Since"] || '',
        "OM-Tier-Status": knytPersona["OM-Tier-Status"] || '',
        "Metaiye-Shares-Owned": knytPersona["Metaiye-Shares-Owned"] || '',
        "Total-Invested": knytPersona["Total-Invested"] || '',
        "KNYT-COYN-Owned": knytPersona["KNYT-COYN-Owned"] || '',
        "Motion-Comics-Owned": knytPersona["Motion-Comics-Owned"] || '',
        "Paper-Comics-Owned": knytPersona["Paper-Comics-Owned"] || '',
        "Digital-Comics-Owned": knytPersona["Digital-Comics-Owned"] || '',
        "KNYT-Posters-Owned": knytPersona["KNYT-Posters-Owned"] || '',
        "KNYT-Cards-Owned": knytPersona["KNYT-Cards-Owned"] || '',
        "Characters-Owned": knytPersona["Characters-Owned"] || ''
    };
};

// Helper function to create a default KNYTPersona object
export const createDefaultKNYTPersona = (email: string): KNYTPersona => {
    return {
        id: '',
        user_id: '',
        created_at: '',
        updated_at: '',
        "First-Name": '',
        "Last-Name": '',
        "KNYT-ID": '',
        "Profession": '',
        "Local-City": '',
        "Email": email,
        "Phone-Number": '',
        "Age": '',
        "Address": '',
        "EVM-Public-Key": '',
        "BTC-Public-Key": '',
        "ThirdWeb-Public-Key": '',
        "MetaKeep-Public-Key": '',
        "Chain-IDs": [],
        "Web3-Interests": [],
        "Tokens-of-Interest": [],
        "LinkedIn-ID": '',
        "LinkedIn-Profile-URL": '',
        "Twitter-Handle": '',
        "Telegram-Handle": '',
        "Discord-Handle": '',
        "Instagram-Handle": '',
        "YouTube-ID": '',
        "Facebook-ID": '',
        "TikTok-Handle": '',
        "OM-Member-Since": '',
        "OM-Tier-Status": '',
        "Metaiye-Shares-Owned": '',
        "Total-Invested": '',
        "KNYT-COYN-Owned": '',
        "Motion-Comics-Owned": '',
        "Paper-Comics-Owned": '',
        "Digital-Comics-Owned": '',
        "KNYT-Posters-Owned": '',
        "KNYT-Cards-Owned": '',
        "Characters-Owned": ''
    };
};

// Helper function to convert PrivateData to QryptoPersona format
export const privateDataToQryptoPersona = (data: PrivateData): Partial<QryptoPersona> => {
    return {
        "First-Name": data["First-Name"] as string || '',
        "Last-Name": data["Last-Name"] as string || '',
        "Qrypto-ID": data["Qrypto-ID"] as string || '',
        "Profession": data["Profession"] as string || '',
        "Local-City": data["Local-City"] as string || '',
        "Email": data["Email"] as string || '',
        "EVM-Public-Key": data["EVM-Public-Key"] as string || '',
        "BTC-Public-Key": data["BTC-Public-Key"] as string || '',
        "Chain-IDs": Array.isArray(data["Chain-IDs"]) ? data["Chain-IDs"] : [],
        "Wallets-of-Interest": Array.isArray(data["Wallets-of-Interest"]) ? data["Wallets-of-Interest"] : [],
        "Web3-Interests": Array.isArray(data["Web3-Interests"]) ? data["Web3-Interests"] : [],
        "Tokens-of-Interest": Array.isArray(data["Tokens-of-Interest"]) ? data["Tokens-of-Interest"] : [],
        "LinkedIn-ID": data["LinkedIn-ID"] as string || '',
        "LinkedIn-Profile-URL": data["LinkedIn-Profile-URL"] as string || '',
        "Twitter-Handle": data["Twitter-Handle"] as string || '',
        "Telegram-Handle": data["Telegram-Handle"] as string || '',
        "Discord-Handle": data["Discord-Handle"] as string || '',
        "Instagram-Handle": data["Instagram-Handle"] as string || '',
        "GitHub-Handle": data["GitHub-Handle"] as string || '',
        "YouTube-ID": data["YouTube-ID"] as string || '',
        "Facebook-ID": data["Facebook-ID"] as string || '',
        "TikTok-Handle": data["TikTok-Handle"] as string || ''
    };
};

// Helper function to convert QryptoPersona format to PrivateData
export const qryptoPersonaToPrivateData = (qryptoPersona: QryptoPersona): PrivateData => {
    return {
        "First-Name": qryptoPersona["First-Name"] || '',
        "Last-Name": qryptoPersona["Last-Name"] || '',
        "Qrypto-ID": qryptoPersona["Qrypto-ID"] || '',
        "Profession": qryptoPersona["Profession"] || '',
        "Local-City": qryptoPersona["Local-City"] || '',
        "Email": qryptoPersona["Email"] || '',
        "EVM-Public-Key": qryptoPersona["EVM-Public-Key"] || '',
        "BTC-Public-Key": qryptoPersona["BTC-Public-Key"] || '',
        "Chain-IDs": qryptoPersona["Chain-IDs"] || [],
        "Wallets-of-Interest": qryptoPersona["Wallets-of-Interest"] || [],
        "Web3-Interests": qryptoPersona["Web3-Interests"] || [],
        "Tokens-of-Interest": qryptoPersona["Tokens-of-Interest"] || [],
        "LinkedIn-ID": qryptoPersona["LinkedIn-ID"] || '',
        "LinkedIn-Profile-URL": qryptoPersona["LinkedIn-Profile-URL"] || '',
        "Twitter-Handle": qryptoPersona["Twitter-Handle"] || '',
        "Telegram-Handle": qryptoPersona["Telegram-Handle"] || '',
        "Discord-Handle": qryptoPersona["Discord-Handle"] || '',
        "Instagram-Handle": qryptoPersona["Instagram-Handle"] || '',
        "GitHub-Handle": qryptoPersona["GitHub-Handle"] || '',
        "YouTube-ID": qryptoPersona["YouTube-ID"] || '',
        "Facebook-ID": qryptoPersona["Facebook-ID"] || '',
        "TikTok-Handle": qryptoPersona["TikTok-Handle"] || ''
    };
};

// Helper function to create a default QryptoPersona object
export const createDefaultQryptoPersona = (email: string): QryptoPersona => {
    return {
        id: '',
        user_id: '',
        created_at: '',
        updated_at: '',
        "First-Name": '',
        "Last-Name": '',
        "Qrypto-ID": '',
        "Profession": '',
        "Local-City": '',
        "Email": email,
        "EVM-Public-Key": '',
        "BTC-Public-Key": '',
        "Chain-IDs": [],
        "Wallets-of-Interest": [],
        "Web3-Interests": [],
        "Tokens-of-Interest": [],
        "LinkedIn-ID": '',
        "LinkedIn-Profile-URL": '',
        "Twitter-Handle": '',
        "Telegram-Handle": '',
        "Discord-Handle": '',
        "Instagram-Handle": '',
        "GitHub-Handle": '',
        "YouTube-ID": '',
        "Facebook-ID": '',
        "TikTok-Handle": ''
    };
};
