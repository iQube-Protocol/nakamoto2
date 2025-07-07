
import { BlakQube, KNYTPersona, QryptoPersona } from '@/lib/types';
import {
  ConnectionData,
  LinkedInConnectionData,
  WalletConnectionData,
  ThirdWebConnectionData,
  TwitterConnectionData,
  SocialConnectionData
} from './types';

type PersonaType = Partial<BlakQube> | Partial<KNYTPersona> | Partial<QryptoPersona>;

export const processLinkedInConnection = (
  connection: ConnectionData,
  persona: PersonaType
): void => {
  const connectionData = connection.connection_data as LinkedInConnectionData;
  if (!connectionData?.profile) return;

  const profile = connectionData.profile;
  const email = connectionData.email;

  console.log('Processing LinkedIn connection data:', profile);

  // Extract first name and last name
  if (profile.firstName) {
    persona["First-Name"] = profile.firstName;
    console.log('Set First-Name from LinkedIn:', profile.firstName);
  }

  if (profile.lastName) {
    persona["Last-Name"] = profile.lastName;
    console.log('Set Last-Name from LinkedIn:', profile.lastName);
  }

  // Extract LinkedIn ID
  if (profile.id) {
    persona["LinkedIn-ID"] = profile.id;
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
    persona["LinkedIn-Profile-URL"] = profileUrl;
    console.log('Set LinkedIn Profile URL:', profileUrl);
  }

  // Use email from LinkedIn if available
  if (email && (!persona["Email"] || persona["Email"] === '')) {
    persona["Email"] = email;
    console.log('Set Email from LinkedIn:', email);
  }

  // Set profession from headline
  if (profile.headline && !persona["Profession"]) {
    persona["Profession"] = profile.headline;
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

  if (locationName && !persona["Local-City"]) {
    persona["Local-City"] = locationName;
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
      const currentInterests = persona["Web3-Interests"] || [];
      if (!currentInterests.includes(industryName)) {
        persona["Web3-Interests"] = [...currentInterests, industryName];
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
      const currentInterests = persona["Web3-Interests"] || [];
      const uniqueInterests = [...new Set([...currentInterests, ...web3Skills])];
      persona["Web3-Interests"] = uniqueInterests;
      console.log('Added Web3 interests from LinkedIn skills:', web3Skills);
    }
  }
};

export const processWalletConnection = (
  connection: ConnectionData,
  persona: PersonaType
): void => {
  const connectionData = connection.connection_data as WalletConnectionData;
  if (!connectionData?.address) return;

  console.log('=== PROCESSING WALLET CONNECTION ===');
  console.log('Wallet address:', connectionData.address);
  console.log('Current persona EVM key:', persona["EVM-Public-Key"]);
  
  // Set EVM public key
  persona["EVM-Public-Key"] = connectionData.address;
  console.log('✅ Set EVM-Public-Key:', connectionData.address);

  // Process KNYT token balance if available - ONLY for KNYT personas
  if (connectionData.knytTokenBalance) {
    const tokenBalance = connectionData.knytTokenBalance;
    console.log('💰 Processing KNYT token balance:', tokenBalance);
    
    // Check if this is a KNYT persona by looking for KNYT-specific fields
    const isKNYTPersona = 'KNYT-COYN-Owned' in persona || 'KNYT-ID' in persona || 'OM-Member-Since' in persona;
    
    if (isKNYTPersona) {
      console.log('Current KNYT-COYN-Owned:', persona["KNYT-COYN-Owned"]);
      
      // Update KNYT balance for KNYT personas only
      (persona as any)["KNYT-COYN-Owned"] = tokenBalance.formatted;
      console.log('✅ Updated KNYT-COYN-Owned to:', tokenBalance.formatted);
      
      // Add audit metadata for balance updates
      const auditInfo = {
        lastBalanceUpdate: new Date(tokenBalance.lastUpdated).toISOString(),
        balanceSource: 'wallet_connection',
        transactionHash: tokenBalance.transactionHash || null,
        rawBalance: tokenBalance.balance
      };
      
      console.log('📋 KNYT balance audit info:', auditInfo);
    } else {
      console.log('⚠️ Skipping KNYT-COYN-Owned field for non-KNYT persona');
      console.log('💡 KNYT balance available but not applicable to this persona type');
    }
  } else {
    console.log('⚠️ No KNYT token balance found in wallet connection data');
  }

  // Add MetaMask to wallets of interest
  if (!persona["Wallets-of-Interest"]?.includes("MetaMask")) {
    persona["Wallets-of-Interest"] = [
      ...(persona["Wallets-of-Interest"] || []),
      "MetaMask"
    ];
    console.log('✅ Added MetaMask to wallets of interest');
  }

  // Add common tokens of interest including KNYT
  const commonTokens = ["ETH", "BTC", "USDC", "USDT", "KNYT"];
  const currentTokens = persona["Tokens-of-Interest"] || [];
  const newTokens = commonTokens.filter(token => !currentTokens.includes(token));
  if (newTokens.length > 0) {
    persona["Tokens-of-Interest"] = [...currentTokens, ...newTokens];
    console.log('✅ Added common tokens of interest:', newTokens);
  }
  
  console.log('=== WALLET CONNECTION PROCESSING COMPLETE ===');
};

export const processThirdWebConnection = (
  connection: ConnectionData,
  persona: PersonaType
): void => {
  const connectionData = connection.connection_data as ThirdWebConnectionData;
  if (!connectionData?.address) return;

  console.log('Setting ThirdWeb public key:', connectionData.address);
  persona["ThirdWeb-Public-Key"] = connectionData.address;

  // Add ThirdWeb to wallets of interest
  if (!persona["Wallets-of-Interest"]?.includes("ThirdWeb")) {
    persona["Wallets-of-Interest"] = [
      ...(persona["Wallets-of-Interest"] || []),
      "ThirdWeb"
    ];
  }
};

export const processTwitterConnection = (
  connection: ConnectionData,
  persona: PersonaType
): void => {
  const connectionData = connection.connection_data as TwitterConnectionData;
  if (!connectionData?.profile) return;

  // Extract Twitter handle
  if (connectionData.profile.username) {
    persona["Twitter-Handle"] = `@${connectionData.profile.username}`;
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
    persona["Web3-Interests"] = [
      ...(persona["Web3-Interests"] || []),
      ...web3Interests
    ];
    // Remove duplicates
    persona["Web3-Interests"] = [...new Set(persona["Web3-Interests"])];
  }
};

export const processSocialConnection = (
  service: string,
  connection: ConnectionData,
  persona: PersonaType
): void => {
  const connectionData = connection.connection_data as SocialConnectionData;
  if (!connectionData?.profile) return;

  switch (service) {
    case 'telegram':
      if (connectionData.profile.username) {
        persona["Telegram-Handle"] = `@${connectionData.profile.username}`;
      }
      break;
    case 'discord':
      if (connectionData.profile.username) {
        persona["Discord-Handle"] = connectionData.profile.username;
      }
      break;
    case 'facebook':
      if (connectionData.profile.id) {
        persona["Facebook-ID"] = connectionData.profile.id;
      }
      break;
    case 'youtube':
      if (connectionData.profile.id) {
        persona["YouTube-ID"] = connectionData.profile.id;
      }
      break;
    case 'tiktok':
      if (connectionData.profile.username) {
        persona["TikTok-Handle"] = `@${connectionData.profile.username}`;
      }
      break;
  }
};
