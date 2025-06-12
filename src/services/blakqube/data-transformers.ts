
import { BlakQube } from '@/lib/types';
import { PrivateData } from './types';

export const privateDataToBlakQube = (data: PrivateData): Partial<BlakQube> => {
  return {
    "First-Name": data["First-Name"] as string || "",
    "Last-Name": data["Last-Name"] as string || "",
    "Qrypto-ID": data["Qrypto-ID"] as string || "",
    "Profession": data["Profession"] as string || "",
    "Local-City": data["Local-City"] as string || "",
    "Email": data["Email"] as string || "",
    "LinkedIn-ID": data["LinkedIn-ID"] as string || "",
    "LinkedIn-Profile-URL": data["LinkedIn-Profile-URL"] as string || "",
    "Twitter-Handle": data["Twitter-Handle"] as string || "",
    "Telegram-Handle": data["Telegram-Handle"] as string || "",
    "Discord-Handle": data["Discord-Handle"] as string || "",
    "Instagram-Handle": data["Instagram-Handle"] as string || "",
    "GitHub-Handle": data["GitHub-Handle"] as string || "",
    "YouTube-ID": data["YouTube-ID"] as string || "",
    "Facebook-ID": data["Facebook-ID"] as string || "",
    "TikTok-Handle": data["TikTok-Handle"] as string || "",
    "Web3-Interests": Array.isArray(data["Web3-Interests"]) ? data["Web3-Interests"] as string[] : [],
    "EVM-Public-Key": data["EVM-Public-Key"] as string || "",
    "BTC-Public-Key": data["BTC-Public-Key"] as string || "",
    "ThirdWeb-Public-Key": data["ThirdWeb-Public-Key"] as string || "",
    "Tokens-of-Interest": Array.isArray(data["Tokens-of-Interest"]) ? data["Tokens-of-Interest"] as string[] : [],
    "Chain-IDs": Array.isArray(data["Chain-IDs"]) ? data["Chain-IDs"] as string[] : [],
    "Wallets-of-Interest": Array.isArray(data["Wallets-of-Interest"]) ? data["Wallets-of-Interest"] as string[] : []
  };
};

export const blakQubeToPrivateData = (blakQubeData: BlakQube): PrivateData => {
  return {
    "First-Name": blakQubeData["First-Name"] || "",
    "Last-Name": blakQubeData["Last-Name"] || "",
    "Qrypto-ID": blakQubeData["Qrypto-ID"] || "",
    "Profession": blakQubeData["Profession"] || "",
    "Local-City": blakQubeData["Local-City"] || "",
    "Email": blakQubeData["Email"] || "",
    "LinkedIn-ID": blakQubeData["LinkedIn-ID"] || "",
    "LinkedIn-Profile-URL": blakQubeData["LinkedIn-Profile-URL"] || "",
    "Twitter-Handle": blakQubeData["Twitter-Handle"] || "",
    "Telegram-Handle": blakQubeData["Telegram-Handle"] || "",
    "Discord-Handle": blakQubeData["Discord-Handle"] || "",
    "Instagram-Handle": blakQubeData["Instagram-Handle"] || "",
    "GitHub-Handle": blakQubeData["GitHub-Handle"] || "",
    "YouTube-ID": blakQubeData["YouTube-ID"] || "",
    "Facebook-ID": blakQubeData["Facebook-ID"] || "",
    "TikTok-Handle": blakQubeData["TikTok-Handle"] || "",
    "Web3-Interests": blakQubeData["Web3-Interests"] || [],
    "EVM-Public-Key": blakQubeData["EVM-Public-Key"] || "",
    "BTC-Public-Key": blakQubeData["BTC-Public-Key"] || "",
    "ThirdWeb-Public-Key": blakQubeData["ThirdWeb-Public-Key"] || "",
    "Tokens-of-Interest": blakQubeData["Tokens-of-Interest"] || [],
    "Chain-IDs": blakQubeData["Chain-IDs"] || [],
    "Wallets-of-Interest": blakQubeData["Wallets-of-Interest"] || []
  };
};

export const createDefaultBlakQube = (userEmail?: string): Partial<BlakQube> => {
  return {
    "First-Name": "",
    "Last-Name": "",
    "Qrypto-ID": "",
    "Profession": "",
    "Web3-Interests": [],
    "Local-City": "",
    "Email": userEmail || "",
    "EVM-Public-Key": "",
    "BTC-Public-Key": "",
    "ThirdWeb-Public-Key": "",
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
    "YouTube-ID": "",
    "Facebook-ID": "",
    "TikTok-Handle": ""
  };
};
