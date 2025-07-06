
import { BlakQube } from '@/lib/types';
import {
  ConnectionData,
  LinkedInConnectionData,
  WalletConnectionData,
  ThirdWebConnectionData,
  TwitterConnectionData,
  SocialConnectionData
} from './types';

export const processLinkedInConnection = (
  connection: ConnectionData,
  blakQube: Partial<BlakQube>
): void => {
  const connectionData = connection.connection_data as LinkedInConnectionData;
  if (!connectionData?.profile) return;

  const profile = connectionData.profile;
  const email = connectionData.email;

  console.log('Processing LinkedIn connection data:', profile);

  // Extract first name and last name
  if (profile.firstName) {
    blakQube["First-Name"] = profile.firstName;
    console.log('Set First-Name from LinkedIn:', profile.firstName);
  }

  if (profile.lastName) {
    blakQube["Last-Name"] = profile.lastName;
    console.log('Set Last-Name from LinkedIn:', profile.lastName);
  }

  // Extract LinkedIn ID
  if (profile.id) {
    blakQube["LinkedIn-ID"] = profile.id;
    console.log('Set LinkedIn ID:', profile.id);
  }

  // Extract LinkedIn profile URL
  let profileUrl = null;
  if (profile.publicProfileUrl) {
    profileUrl = profile.publicProfileUrl;
    console.log('Using publicProfileUrl:', profileUrl);
  } else if (profile.profileUrl) {
    profileUrl = profile.profileUrl;
    console.log('Using profileUrl:', profileUrl);
  } else if (profile.vanityName) {
    profileUrl = `https://www.linkedin.com/in/${profile.vanityName}`;
    console.log('Constructed URL from vanityName:', profileUrl);
  } else if (profile.id) {
    profileUrl = `https://www.linkedin.com/in/${profile.id}`;
    console.log('Constructed URL from ID:', profileUrl);
  }

  if (profileUrl) {
    blakQube["LinkedIn-Profile-URL"] = profileUrl;
    console.log('Set LinkedIn Profile URL:', profileUrl);
  }

  // Use email from LinkedIn if available
  if (email && (!blakQube["Email"] || blakQube["Email"] === '')) {
    blakQube["Email"] = email;
    console.log('Set Email from LinkedIn:', email);
  }

  // Set profession from headline
  if (profile.headline && !blakQube["Profession"]) {
    blakQube["Profession"] = profile.headline;
    console.log('Set Profession from LinkedIn headline:', profile.headline);
  }

  // Extract location
  let locationName = null;
  if (profile.locationName) {
    locationName = profile.locationName;
  } else if (profile.location?.name) {
    locationName = profile.location.name;
  } else if (profile.location?.preferredGeoPlace?.name) {
    locationName = profile.location.preferredGeoPlace.name;
  }

  if (locationName && !blakQube["Local-City"]) {
    blakQube["Local-City"] = locationName;
    console.log('Set Local City from LinkedIn:', locationName);
  }

  // Process Web3 interests from industry
  const industryName = profile.industryName || profile.industry;
  if (industryName) {
    const industry = industryName.toLowerCase();
    const web3Keywords = [
      'blockchain', 'crypto', 'cryptocurrency', 'web3', 'defi', 'decentralized finance',
      'nft', 'non-fungible token', 'bitcoin', 'ethereum', 'fintech', 'financial technology',
      'digital assets', 'smart contracts', 'dapp', 'decentralized', 'tokenization'
    ];

    if (web3Keywords.some(keyword => industry.includes(keyword))) {
      const currentInterests = blakQube["Web3-Interests"] || [];
      if (!currentInterests.includes(industryName)) {
        blakQube["Web3-Interests"] = [...currentInterests, industryName];
        console.log('Added Web3 interest from LinkedIn industry:', industryName);
      }
    }
  }

  // Process Web3 skills
  if (profile.skills && Array.isArray(profile.skills)) {
    const web3Skills = profile.skills.filter((skill: string) => {
      const skillLower = skill.toLowerCase();
      return skillLower.includes('blockchain') || skillLower.includes('crypto') ||
             skillLower.includes('web3') || skillLower.includes('smart contract') ||
             skillLower.includes('solidity') || skillLower.includes('defi') ||
             skillLower.includes('nft') || skillLower.includes('ethereum') ||
             skillLower.includes('bitcoin');
    });

    if (web3Skills.length > 0) {
      const currentInterests = blakQube["Web3-Interests"] || [];
      const uniqueInterests = [...new Set([...currentInterests, ...web3Skills])];
      blakQube["Web3-Interests"] = uniqueInterests;
      console.log('Added Web3 interests from LinkedIn skills:', web3Skills);
    }
  }
};

export const processWalletConnection = (
  connection: ConnectionData,
  blakQube: Partial<BlakQube>
): void => {
  const connectionData = connection.connection_data as WalletConnectionData;
  if (!connectionData?.address) return;

  console.log('Setting EVM public key:', connectionData.address);
  blakQube["EVM-Public-Key"] = connectionData.address;

  // Process KNYT token balance if available
  if (connectionData.knytTokenBalance) {
    const tokenBalance = connectionData.knytTokenBalance;
    console.log('Setting KNYT-COYN-Owned from wallet balance:', tokenBalance.formatted);
    blakQube["KNYT-COYN-Owned"] = tokenBalance.formatted;
    
    // Add audit metadata for balance updates
    const auditInfo = {
      lastBalanceUpdate: new Date(tokenBalance.lastUpdated).toISOString(),
      balanceSource: 'wallet_connection',
      transactionHash: tokenBalance.transactionHash || null,
      rawBalance: tokenBalance.balance
    };
    
    console.log('Adding KNYT balance audit info:', auditInfo);
  }

  // Add MetaMask to wallets of interest
  if (!blakQube["Wallets-of-Interest"]?.includes("MetaMask")) {
    blakQube["Wallets-of-Interest"] = [
      ...(blakQube["Wallets-of-Interest"] || []),
      "MetaMask"
    ];
  }

  // Add common tokens of interest including KNYT
  const commonTokens = ["ETH", "BTC", "USDC", "USDT", "KNYT"];
  const currentTokens = blakQube["Tokens-of-Interest"] || [];
  const newTokens = commonTokens.filter(token => !currentTokens.includes(token));
  if (newTokens.length > 0) {
    blakQube["Tokens-of-Interest"] = [...currentTokens, ...newTokens];
    console.log('Added common tokens of interest:', newTokens);
  }
};

export const processThirdWebConnection = (
  connection: ConnectionData,
  blakQube: Partial<BlakQube>
): void => {
  const connectionData = connection.connection_data as ThirdWebConnectionData;
  if (!connectionData?.address) return;

  console.log('Setting ThirdWeb public key:', connectionData.address);
  blakQube["ThirdWeb-Public-Key"] = connectionData.address;

  // Add ThirdWeb to wallets of interest
  if (!blakQube["Wallets-of-Interest"]?.includes("ThirdWeb")) {
    blakQube["Wallets-of-Interest"] = [
      ...(blakQube["Wallets-of-Interest"] || []),
      "ThirdWeb"
    ];
  }
};

export const processTwitterConnection = (
  connection: ConnectionData,
  blakQube: Partial<BlakQube>
): void => {
  const connectionData = connection.connection_data as TwitterConnectionData;
  if (!connectionData?.profile) return;

  // Extract Twitter handle
  if (connectionData.profile.username) {
    blakQube["Twitter-Handle"] = `@${connectionData.profile.username}`;
  }

  // Extract Web3 interests from Twitter
  const twitterInterests = connectionData.interests || [];
  const web3Interests = twitterInterests
    .filter((interest: string) => 
      interest.toLowerCase().includes('blockchain') ||
      interest.toLowerCase().includes('crypto') ||
      interest.toLowerCase().includes('web3') ||
      interest.toLowerCase().includes('nft')
    );

  if (web3Interests.length > 0) {
    blakQube["Web3-Interests"] = [
      ...(blakQube["Web3-Interests"] || []),
      ...web3Interests
    ];
    // Remove duplicates
    blakQube["Web3-Interests"] = [...new Set(blakQube["Web3-Interests"])];
  }
};

export const processSocialConnection = (
  service: string,
  connection: ConnectionData,
  blakQube: Partial<BlakQube>
): void => {
  const connectionData = connection.connection_data as SocialConnectionData;
  if (!connectionData?.profile) return;

  switch (service) {
    case 'telegram':
      if (connectionData.profile.username) {
        blakQube["Telegram-Handle"] = `@${connectionData.profile.username}`;
      }
      break;
    case 'discord':
      if (connectionData.profile.username) {
        blakQube["Discord-Handle"] = connectionData.profile.username;
      }
      break;
    case 'facebook':
      if (connectionData.profile.id) {
        blakQube["Facebook-ID"] = connectionData.profile.id;
      }
      break;
    case 'youtube':
      if (connectionData.profile.id) {
        blakQube["YouTube-ID"] = connectionData.profile.id;
      }
      break;
    case 'tiktok':
      if (connectionData.profile.username) {
        blakQube["TikTok-Handle"] = `@${connectionData.profile.username}`;
      }
      break;
  }
};
