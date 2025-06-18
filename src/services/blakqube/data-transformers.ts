import { BlakQube } from '@/lib/types';
import { PrivateData } from './types';

export const privateDataToBlakQube = (data: PrivateData): Partial<BlakQube> => {
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
    "Profession": getValue("Profession"),
    "Web3-Interests": getArrayValue("Web3-Interests"),
    "Local-City": getValue("Local-City"),
    "Email": getValue("Email"),
    "EVM-Public-Key": getValue("EVM-Public-Key"),
    "BTC-Public-Key": getValue("BTC-Public-Key"),
    "Tokens-of-Interest": getArrayValue("Tokens-of-Interest"),
    "Chain-IDs": getArrayValue("Chain-IDs"),
    "Wallets-of-Interest": getArrayValue("Wallets-of-Interest"),
    "LinkedIn-ID": getValue("LinkedIn-ID"),
    "LinkedIn-Profile-URL": getValue("LinkedIn-Profile-URL"),
    "Twitter-Handle": getValue("Twitter-Handle"),
    "Telegram-Handle": getValue("Telegram-Handle"),
    "Discord-Handle": getValue("Discord-Handle"),
    "Instagram-Handle": getValue("Instagram-Handle"),
    "GitHub-Handle": getValue("GitHub-Handle"),
    "First-Name": getValue("First-Name"),
    "Last-Name": getValue("Last-Name"),
    "KNYT-ID": getValue("KNYT-ID"),
    "Qrypto-ID": getValue("Qrypto-ID"),
    "ThirdWeb-Public-Key": getValue("ThirdWeb-Public-Key"),
    "YouTube-ID": getValue("YouTube-ID"),
    "Facebook-ID": getValue("Facebook-ID"),
    "TikTok-Handle": getValue("TikTok-Handle"),
    "Phone-Number": getValue("Phone-Number"),
    "Age": getValue("Age"),
    "Address": getValue("Address"),
    "OM-Member-Since": getValue("OM-Member-Since"),
    "OM-Tier-Status": getValue("OM-Tier-Status"),
    "Metaiye-Shares-Owned": getValue("Metaiye-Shares-Owned"),
    "KNYT-COYN-Owned": getValue("KNYT-COYN-Owned"),
    "MetaKeep-Public-Key": getValue("MetaKeep-Public-Key"),
    "Motion-Comics-Owned": getValue("Motion-Comics-Owned"),
    "Paper-Comics-Owned": getValue("Paper-Comics-Owned"),
    "Digital-Comics-Owned": getValue("Digital-Comics-Owned"),
    "KNYT-Posters-Owned": getValue("KNYT-Posters-Owned"),
    "KNYT-Cards-Owned": getValue("KNYT-Cards-Owned"),
    "Characters-Owned": getValue("Characters-Owned")
  };
};

export const blakQubeToPrivateData = (blakQube: BlakQube): PrivateData => {
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

export const createDefaultBlakQube = (email?: string): Partial<BlakQube> => {
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
