import { KBAIKnowledgeItem } from '../index';
import { MetaKnytsKnowledgeBase } from '@/services/metaknyts-knowledge-base/MetaKnytsKnowledgeBase';

// Get metaKnyts knowledge base instance
const metaKnytsKB = MetaKnytsKnowledgeBase.getInstance();

// Convert metaKnyts knowledge items to KBAI format
const convertMetaKnytsToKBAI = (): KBAIKnowledgeItem[] => {
  const metaKnytsItems = metaKnytsKB.getAllKnowledge();
  
  return metaKnytsItems.map(item => ({
    id: item.id,
    title: item.title,
    content: item.content,
    type: 'metaknyts-guide',
    source: item.source,
    relevance: 1.0,
    timestamp: item.timestamp
  }));
};

// Expanded set of fallback knowledge items
const fallbackKnowledgeItems: KBAIKnowledgeItem[] = [
  {
    id: 'kb-fallback-1',
    title: 'Introduction to Blockchain',
    content: 'Blockchain is a decentralized, distributed ledger technology that records transactions across many computers. It enables secure, transparent and tamper-proof record-keeping without needing a central authority.',
    type: 'concept',
    source: 'Aigent Knowledge Base',
    relevance: 1.0,
    timestamp: new Date().toISOString()
  },
  {
    id: 'kb-fallback-2',
    title: 'What is Web3?',
    content: 'Web3 represents the next evolution of the internet, built on blockchain technology. It emphasizes decentralization, user ownership of data and content, and trustless interactions without intermediaries.',
    type: 'concept',
    source: 'Aigent Knowledge Base',
    relevance: 0.95,
    timestamp: new Date().toISOString()
  },
  {
    id: 'kb-aigent-overview',
    title: 'Meet Aigent Nakamoto',
    content: 'Aigent Nakamoto is your guide to the world of crypto-agentic AI. A smart, friendly assistant built specifically for the CryptoMondays community to help you learn, earn, and connect in the Web3 and blockchain space. What makes Aigent truly special is that it\'s not just an AI — it\'s a crypto-agentic AI built to serve you, not harvest your data.',
    type: 'agent-info',
    source: 'Aigent Knowledge Base',
    relevance: 1.0,
    timestamp: new Date().toISOString()
  },
  {
    id: 'kb-aigent-details',
    title: 'How Aigent Works',
    content: 'Aigent uses iQubes — secure, smart building blocks that allow it to learn what matters most to you and deliver highly personalized, context-aware support. They let it protect your privacy, respect your choices, and give you meaningful insights and opportunities without ever selling your data or locking you into a walled garden. Aigent is built to empower you to understand, participate in, and shape the future of decentralized tech.',
    type: 'agent-info',
    source: 'Aigent Knowledge Base',
    relevance: 0.98,
    timestamp: new Date().toISOString()
  },
  {
    id: 'kb-iqubes-explained',
    title: 'Understanding iQubes',
    content: 'iQubes are secure, privacy-preserving data structures that power Aigent\'s personalized experiences. They allow Aigent to provide context-aware support while protecting your data sovereignty. iQubes enable Aigent to learn your preferences and provide relevant insights without compromising your privacy.',
    type: 'concept',
    source: 'Aigent Knowledge Base',
    relevance: 0.95,
    timestamp: new Date().toISOString()
  },
  {
    id: 'kb-fallback-3',
    title: 'Cryptocurrency Fundamentals',
    content: 'Cryptocurrencies are digital or virtual currencies secured by cryptography, making them nearly impossible to counterfeit. Many cryptocurrencies are decentralized networks based on blockchain technology.',
    type: 'concept',
    source: 'Aigent Knowledge Base',
    relevance: 0.9,
    timestamp: new Date().toISOString()
  },
  {
    id: 'kb-fallback-4',
    title: 'Smart Contracts Explained',
    content: 'Smart contracts are self-executing contracts with the terms directly written into code. They automatically execute when predefined conditions are met, eliminating the need for intermediaries.',
    type: 'concept',
    source: 'Aigent Knowledge Base',
    relevance: 0.85,
    timestamp: new Date().toISOString()
  },
  {
    id: 'kb-fallback-5',
    title: 'Decentralized Finance (DeFi)',
    content: 'DeFi refers to financial services built on blockchain technology that eliminate traditional financial intermediaries like banks or brokerages. DeFi applications provide lending, borrowing, trading, and other services.',
    type: 'concept',
    source: 'Aigent Knowledge Base',
    relevance: 0.8,
    timestamp: new Date().toISOString()
  },
  {
    id: 'kb-fallback-6',
    title: 'Non-Fungible Tokens (NFTs)',
    content: 'NFTs are cryptographic tokens that represent unique assets, both digital and physical. Unlike cryptocurrencies, they cannot be exchanged on a like-for-like basis, making each token one-of-a-kind.',
    type: 'concept',
    source: 'Aigent Knowledge Base',
    relevance: 0.75,
    timestamp: new Date().toISOString()
  },
  {
    id: 'kb-fallback-7',
    title: 'Consensus Mechanisms',
    content: 'Consensus mechanisms are protocols that ensure all nodes in a blockchain network agree on the validity of transactions. Common mechanisms include Proof of Work, Proof of Stake, and Delegated Proof of Stake.',
    type: 'concept',
    source: 'Aigent Knowledge Base',
    relevance: 0.7,
    timestamp: new Date().toISOString()
  },
  {
    id: 'kb-fallback-8',
    title: 'Decentralized Autonomous Organizations (DAOs)',
    content: 'DAOs are organizations represented by rules encoded as computer programs that are transparent and controlled by members rather than a central authority. They operate using smart contracts on blockchain networks.',
    type: 'concept',
    source: 'Aigent Knowledge Base',
    relevance: 0.65,
    timestamp: new Date().toISOString()
  },
  {
    id: 'kb-fallback-9',
    title: 'Layer 2 Scaling Solutions',
    content: 'Layer 2 refers to a set of off-chain solutions built on top of layer 1 blockchains that aim to improve transaction speed and reduce costs. Examples include rollups, sidechains, and state channels.',
    type: 'concept',
    source: 'Aigent Knowledge Base',
    relevance: 0.62,
    timestamp: new Date().toISOString()
  },
  {
    id: 'kb-fallback-10',
    title: 'Tokenomics',
    content: 'Tokenomics is the study of the economics of a token or cryptocurrency. It includes factors like token supply, distribution, utility, and mechanisms that affect its value and market behavior.',
    type: 'concept',
    source: 'Aigent Knowledge Base',
    relevance: 0.60,
    timestamp: new Date().toISOString()
  }
];

// Additional topic-specific items
const topicSpecificItems: Record<string, KBAIKnowledgeItem[]> = {
  'bitcoin': [
    {
      id: 'kb-bitcoin-1',
      title: 'Bitcoin Whitepaper',
      content: 'Bitcoin was introduced in a 2008 whitepaper by Satoshi Nakamoto, titled "Bitcoin: A Peer-to-Peer Electronic Cash System." This document outlined the fundamentals of blockchain technology and cryptocurrency.',
      type: 'resource',
      source: 'Aigent Knowledge Base',
      relevance: 1.0,
      timestamp: new Date().toISOString()
    },
    {
      id: 'kb-bitcoin-2',
      title: 'Bitcoin Mining',
      content: 'Bitcoin mining is the process of creating new bitcoins by solving complex computational puzzles. Miners validate transactions and add them to the blockchain, receiving bitcoin rewards in return.',
      type: 'concept',
      source: 'Aigent Knowledge Base',
      relevance: 0.9,
      timestamp: new Date().toISOString()
    }
  ],
  'ethereum': [
    {
      id: 'kb-ethereum-1',
      title: 'Ethereum Virtual Machine',
      content: 'The Ethereum Virtual Machine (EVM) is a computation engine that acts as a decentralized computer with millions of executable projects. It is the environment in which all Ethereum accounts and smart contracts live.',
      type: 'concept',
      source: 'Aigent Knowledge Base',
      relevance: 1.0,
      timestamp: new Date().toISOString()
    },
    {
      id: 'kb-ethereum-2',
      title: 'Ethereum 2.0',
      content: 'Ethereum 2.0 (now called "The Merge") was a major upgrade to the Ethereum network that transitioned from Proof of Work to Proof of Stake consensus, significantly reducing energy consumption and improving scalability.',
      type: 'news',
      source: 'Aigent Knowledge Base',
      relevance: 0.95,
      timestamp: new Date().toISOString()
    }
  ],
  'nft': [
    {
      id: 'kb-nft-1',
      title: 'NFT Marketplaces',
      content: 'NFT marketplaces are platforms where users can buy, sell, and mint NFTs. Popular marketplaces include OpenSea, Rarible, and Foundation, each with different features and artist communities.',
      type: 'resource',
      source: 'Aigent Knowledge Base',
      relevance: 1.0,
      timestamp: new Date().toISOString()
    }
  ],
  'defi': [
    {
      id: 'kb-defi-1',
      title: 'Yield Farming',
      content: 'Yield farming is a practice where cryptocurrency holders lend or stake their assets to earn returns. It involves providing liquidity to DeFi protocols in exchange for rewards, typically in the form of additional tokens.',
      type: 'concept',
      source: 'Aigent Knowledge Base',
      relevance: 1.0,
      timestamp: new Date().toISOString()
    }
  ],
  'knyt': [
    {
      id: 'kb-knyt-coyn-wallet-setup',
      title: 'How to Add KNYT COYN to Your Web3 Wallet',
      content: 'To use your $KNYT COYN tokens in the metaKnyts Ecosystem, you need to add them to your wallet. **Token Contract Address:** 0xe53dad36cd0A8EdC656448CE7912bba72beBECb4 **Network:** Ethereum Mainnet **Symbol:** KNYT **Decimals:** 18. For MetaMask: Open wallet → Check Ethereum Mainnet → Import tokens → Custom Token → Paste contract address → Add token. For Coinbase Wallet: Open app → Tap + → Paste contract address → Enter KNYT symbol → Enter 18 decimals → Confirm.',
      type: 'metaknyts-guide',
      source: 'metaKnyts Knowledge Base',
      relevance: 1.0,
      timestamp: new Date().toISOString()
    }
  ],
  'metaknyts': [
    {
      id: 'kb-metaknyts-overview',
      title: 'metaKnyts: World\'s First CryptoComic™',
      content: 'metaKnyts is the world\'s first CryptoComic™ and blockchain enabled gaming franchise. It is an episodic, cyberpunk and Afri-futurist saga about a new social, economic and technological paradigm. Episodes and in-game inventory are sold as NFTs that can appreciate in value and be traded peer to peer.',
      type: 'metaknyts-guide',
      source: 'metaKnyts Knowledge Base',
      relevance: 1.0,
      timestamp: new Date().toISOString()
    }
  ],
  'aigent': [
    {
      id: 'kb-aigent-full',
      title: 'Aigent Nakamoto: Your Guide to Crypto-Agentic AI',
      content: 'Aigent Nakamoto isn\'t just another AI assistant — it\'s your smart, friendly guide to everything Web3, blockchain, and decentralized AI, built specifically for the CryptoMondays community. Think of it as a digital co-pilot who helps you learn, earn, and connect — all while making sense of a fast-moving, often confusing crypto world.\n\nIt\'s here to answer your questions, introduce you to important conversations, point you to useful opportunities, and help you grow your knowledge and network — whether you\'re brand new to crypto or a seasoned Web3 explorer.\n\nWhat makes Aigent truly special is that it\'s not just an AI — it\'s a crypto-agentic AI. That means it\'s not powered by big tech or stuck in a centralized box. Instead, Aigent is built to serve you, not harvest your data. It\'s open, transparent, and aligned with the values of decentralization — where individuals own their data, shape their identity, and unlock real value from their participation.\n\nBehind the scenes, Aigent uses something called iQubes — don\'t worry, you don\'t need to be a tech expert to benefit from them. iQubes are secure, smart building blocks that allow Aigent to learn what matters most to you and deliver highly personalized, context-aware support. They let it protect your privacy, respect your choices, and give you meaningful insights and opportunities without ever selling your data or locking you into a walled garden.\n\nIn short, Aigent Nakamoto is built to empower you — to help you understand, participate in, and shape the future of decentralized tech. It\'s easy to talk to, always learning, and most importantly, it\'s on your side.',
      type: 'agent-info',
      source: 'Aigent Knowledge Base',
      relevance: 1.0,
      timestamp: new Date().toISOString()
    },
    {
      id: 'kb-aigent-purpose',
      title: 'The Purpose of Aigent',
      content: 'Aigent was created to help bridge the gap between complex Web3 technologies and everyday users. Its goal is to make blockchain concepts accessible, help users discover earning opportunities, and connect with like-minded individuals in the CryptoMondays community. It serves as both an educational resource and practical tool for navigating the decentralized technology landscape.',
      type: 'agent-info',
      source: 'Aigent Knowledge Base',
      relevance: 0.9,
      timestamp: new Date().toISOString()
    },
    {
      id: 'kb-aigent-features',
      title: 'Key Features of Aigent',
      content: 'Aigent offers personalized learning pathways based on your interests and knowledge level, identifies relevant earning opportunities in the crypto space, facilitates connections within the Web3 community, and provides real-time insights on market trends. All this while maintaining your data sovereignty through iQubes technology.',
      type: 'agent-info',
      source: 'Aigent Knowledge Base',
      relevance: 0.85,
      timestamp: new Date().toISOString()
    }
  ]
};

/**
 * Get fallback knowledge items, optionally filtered by query
 */
export const getFallbackItems = (query: string = ''): KBAIKnowledgeItem[] => {
  console.log('Getting fallback items for query:', query);
  
  // Get metaKnyts knowledge base items
  const metaKnytsItems = convertMetaKnytsToKBAI();
  
  // If we have specific items for this topic, use them first
  const lowerQuery = query.toLowerCase();
  let relevantItems: KBAIKnowledgeItem[] = [];
  
  // Check for metaKnyts-specific queries first
  if (lowerQuery.includes('knyt') || lowerQuery.includes('coyn') || 
      lowerQuery.includes('wallet') || lowerQuery.includes('metaknyts') ||
      lowerQuery.includes('add token') || lowerQuery.includes('contract address')) {
    
    // Find the KNYT COYN wallet setup guide specifically
    const knytWalletGuide = metaKnytsItems.find(item => 
      item.id === 'knyt-coyn-wallet-setup' || 
      item.title.toLowerCase().includes('knyt coyn') ||
      item.title.toLowerCase().includes('wallet')
    );
    
    if (knytWalletGuide) {
      relevantItems.push(knytWalletGuide);
      console.log('Found KNYT COYN wallet guide in metaKnyts knowledge base');
    }
    
    // Also include other relevant metaKnyts items
    const otherMetaKnytsItems = metaKnytsItems.filter(item => 
      item.id !== 'knyt-coyn-wallet-setup' &&
      (item.content.toLowerCase().includes(lowerQuery) || 
       item.title.toLowerCase().includes(lowerQuery))
    ).slice(0, 3);
    
    relevantItems = [...relevantItems, ...otherMetaKnytsItems];
  }
  
  // Check for topic-specific items
  Object.keys(topicSpecificItems).forEach(topic => {
    if (lowerQuery.includes(topic)) {
      relevantItems = [...relevantItems, ...topicSpecificItems[topic]];
    }
  });
  
  // If query contains "aigent" but we didn't match the exact topic, still show aigent items
  if (lowerQuery.includes('aigent') && !relevantItems.some(item => item.type === 'agent-info')) {
    relevantItems = [...relevantItems, ...topicSpecificItems['aigent']];
  }
  
  // If no topic-specific items or query is empty, return mix of metaKnyts and fallback items
  if (relevantItems.length === 0 || !query) {
    // Prioritize metaKnyts items for empty queries
    const priorityMetaKnytsItems = metaKnytsItems.slice(0, 4);
    return [...priorityMetaKnytsItems, ...fallbackKnowledgeItems.slice(0, 6)];
  }
  
  // Combine topic items with general items, up to 8 total
  const remainingCount = 8 - relevantItems.length;
  if (remainingCount > 0) {
    relevantItems = [...relevantItems, ...fallbackKnowledgeItems.slice(0, remainingCount)];
  }
  
  return relevantItems;
};
