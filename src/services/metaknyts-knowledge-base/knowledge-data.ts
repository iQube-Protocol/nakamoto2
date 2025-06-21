import { MetaKnytsKnowledgeItem } from './types';

export const METAKNYTS_KNOWLEDGE_DATA: MetaKnytsKnowledgeItem[] = [
  {
    id: 'knyt-coyn-wallet-setup',
    title: 'How to Add $KNYT COYN to Your Web3 Wallet',
    content: `# 🧠 How to Add $KNYT COYN to Your Web3 Wallet

To use your $KNYT COYN tokens in the metaKnyts Ecosystem, you first need to add them to your wallet (like MetaMask or Coinbase Wallet). Here's how to do it:

## 🪙 $KNYT COYN Token Details

**Token Information:**
- **Token Name:** KNYT COYN
- **Token Symbol:** KNYT  
- **Token Contract Address:** 0xe53dad36cd0A8EdC656448CE7912bba72beBECb4
- **Decimals:** 18
- **Network:** Ethereum Mainnet

## Wallet Setup Process

\`\`\`mermaid
flowchart TD
    A[Choose Your Wallet] --> B{MetaMask or Coinbase?}
    B -->|MetaMask| C[Open MetaMask]
    B -->|Coinbase| D[Open Coinbase Wallet]
    
    C --> E[Check Ethereum Mainnet]
    E --> F[Click Import Tokens]
    F --> G[Select Custom Token Tab]
    G --> H[Paste Contract Address]
    H --> I[Verify Symbol & Decimals]
    I --> J[Add Custom Token]
    J --> K[Import Tokens]
    K --> L[✅ $KNYT Added Successfully]
    
    D --> M[Tap + or Import Token]
    M --> N[Paste Contract Address]
    N --> O[Enter Symbol: KNYT]
    O --> P[Enter Decimals: 18]
    P --> Q[Confirm Addition]
    Q --> L
    
    L --> R[Ready to Use in metaKnyts!]
\`\`\`

## 🦊 If You're Using MetaMask

1. **Open your MetaMask wallet**
2. **Make sure you're on the Ethereum Mainnet** (check the network dropdown at the top)
3. **Scroll down and click "Import tokens"**
4. **Select the "Custom Token" tab**
5. **Copy and paste this into the Token Contract Address field:**
   \`0xe53dad36cd0A8EdC656448CE7912bba72beBECb4\`
6. **MetaMask will auto-fill the Token Symbol and Decimals (KNYT, 18).** If not, enter them manually
7. **Click "Add Custom Token", then "Import Tokens"**
8. **You're done! 🎉** You should now see your $KNYT in your wallet

## 🏦 If You're Using Coinbase Wallet

1. **Open your Coinbase Wallet app**
2. **Tap the "+" or "Import token" button** in the wallet view
3. **Paste this contract address when prompted:**
   \`0xe53dad36cd0A8EdC656448CE7912bba72beBECb4\`
4. **Enter the symbol:** KNYT
5. **Enter the decimals:** 18
6. **Confirm to add the token**

## Visual Guide

![KNYT COYN Wallet Setup Guide](/lovable-uploads/de9d26e8-c9d5-48ba-87a5-e18a52c904a6.png)

## Need Help?

If you get stuck, ask Aigent Nakamoto for help or reach out to our support team on WhatsApp or ask in the metaKnyts community – we're here to help!

## Important Security Notes

- **Always verify the contract address:** 0xe53dad36cd0A8EdC656448CE7912bba72beBECb4
- **Only use official sources** for token information
- **Double-check the network** (Ethereum Mainnet) before adding tokens
- **Never share your private keys** or seed phrases with anyone

## What's Next?

Once you've successfully added $KNYT COYN to your wallet, you can:
- **Participate in metaKnyts governance**
- **Access exclusive content and experiences**
- **Engage with the metaKnyts community**
- **Use tokens for in-ecosystem transactions**`,
    section: 'Token Management',
    category: 'technology',
    keywords: ['KNYT COYN', '$KNYT', 'wallet setup', 'MetaMask', 'Coinbase Wallet', 'Ethereum', 'token contract', 'Web3 wallet', 'cryptocurrency'],
    timestamp: new Date().toISOString(),
    source: 'metaKnyts Token Guide',
    connections: ['qoyn-economy-fundamentals', 'metaknyts-protagonists']
  },
  {
    id: 'metaknyts-overview',
    title: 'metaKnyts: World\'s First CryptoComic™',
    content: `Metaiye Media's mẹtaKnyts is the world's first CryptoComicTM and blockchain enabled gaming franchise. It is an episodic, cyberpunk and Afri-futurist saga about a new social, economic and technological paradigm. Episodes and in-game inventory are sold as NFTs that can appreciate in value and be traded peer to peer independently of the series and platform. mẹtaKnyts plays out across various media including animation, film, gaming, virtual and augmented reality.`,
    section: 'Project Overview',
    category: 'narrative',
    keywords: ['CryptoComic', 'blockchain gaming', 'NFTs', 'Afri-futurist', 'cyberpunk', 'metaKnyts', 'mẹtaKnights'],
    timestamp: new Date().toISOString(),
    source: 'metaKnyts Overview',
    connections: ['tokenqube-encrypted-nft-framework']
  },
  {
    id: 'terra-digitterra-realms',
    title: 'Terra and Digitterra: Dual Reality Framework',
    content: `The mẹtaKnyts backdrop is an interplay between the real physical world – Terra and its "digital twin" – Digitterra. Digitterra is the inner world beneath the surface web, dark web, and deep web layers. While Digitterra mirrors Terra, it operates with different space-time physics where entities can travel at light speed and time is more dense. Digitterrans navigate four space/time realities: Past-time (immutable history), Terra-time (Terran real time), Digi-time (Digitterran real time), and Sim-time (future simulations).`,
    section: 'Worldbuilding',
    category: 'worldbuilding',
    keywords: ['Terra', 'Digitterra', 'digital twin', 'space-time', 'immutable ledger', 'time travel'],
    timestamp: new Date().toISOString(),
    source: 'metaKnyts Synopsis',
    connections: ['iqubes-functionality', 'proof-of-state']
  },
  {
    id: 'fang-bat-antagonists',
    title: 'FANG Gang and BAT Pack: Corporate Antagonists',
    content: `FANG and BAT corporations are led by a secret inner circle of wealthy bankers, technologists and aristocrats. In Digitterra, they are psychic vampires who feed on people's data, spreading fear and terror to paralyze populations. They seek to enslave humanity in both realms through data manipulation and control. Both groups race to create a supercomputer that will give them dominion over all AI and complete control of both Terra and Digitterra.`,
    section: 'Antagonists',
    category: 'characters',
    keywords: ['FANG Gang', 'BAT Pack', 'data vampires', 'supercomputer race', 'AI dominion', 'corporate control'],
    timestamp: new Date().toISOString(),
    source: 'metaKnyts Synopsis',
    connections: ['data-commodity-framework']
  },
  {
    id: 'metaknyts-protagonists',
    title: 'mẹtaKnyts: Decentralized Freedom Fighters',
    content: `The mẹtaKnyts are revolutionaries seeking to break the FANG/BAT stranglehold and create a decentralized world of freedom. They envision Metopia (secretly called Metaiye), a New Earth Order based on universal rights and abundance of freedom, wealth, energy, food, and shelter. Their goal is True Singularity - a symbiotic merger between humanity and machines through perfect alignment of biological and synthetic intelligence.`,
    section: 'Protagonists',
    category: 'characters',
    keywords: ['mẹtaKnyts', 'decentralization', 'Metopia', 'Metaiye', 'True Singularity', 'freedom fighters', 'mẹtaKnights'],
    timestamp: new Date().toISOString(),
    source: 'metaKnyts Synopsis',
    connections: ['qoyn-economy-fundamentals']
  },
  {
    id: 'knowone-protagonist-origin',
    title: 'KnowOne: Primary Protagonist and Crypto Revolutionary',
    content: `KnowOne (real name Deji) is the key protagonist who becomes homeless after being blackballed from tech industry for attempting to whistleblow FANG Corp activity. A special forces veteran and ex-FANG employee, he rescues Satoshi Nakamoto from FANG agents in an alley. Satoshi gives him a cold wallet pen drive and cryptic instructions to find the Cypherpunks, follow the Silk Road to find 'the courier', and discover his 'Kybit' and true self.`,
    section: 'Character Origins',
    category: 'characters',
    keywords: ['KnowOne', 'Deji', 'Satoshi Nakamoto', 'cold wallet', 'Cypherpunks', 'Silk Road', 'Kybit'],
    timestamp: new Date().toISOString(),
    source: 'metaKnyts Synopsis',
    connections: ['bitcoin-security']
  },
  {
    id: 'satoshi-nakamoto-character',
    title: 'Satoshi Nakamoto: Bitcoin Creator and Catalyst',
    content: `Satoshi Nakamoto appears as the mysterious creator of Bitcoin who becomes a catalyst for KnowOne's transformation. When cornered by FANG agents, Satoshi is rescued by Deji and recognizes something special in him. Before disappearing, Satoshi provides Deji with cryptographic tools and guidance, setting him on the path to becoming a crypto revolutionary and leader of the mẹtaKnyts movement.`,
    section: 'Key Characters',
    category: 'characters',
    keywords: ['Satoshi Nakamoto', 'Bitcoin creator', 'catalyst', 'cryptographic tools', 'revolutionary'],
    timestamp: new Date().toISOString(),
    source: 'metaKnyts Synopsis',
    connections: ['bitcoin-security', 'sec-bitcoin-precedent']
  },
  {
    id: 'clean-data-philosophy',
    title: 'Clean Data: The New Energy Paradigm',
    content: `A key principle in mẹtaKnyts is Clean Data, building an ecosystem analogous to clean energy. Data is the primal energy of Digitterra - the fundamental potential that can be transformed into work through electricity. The mẹtaKnyts fight for freedom, self-sovereignty, ecology, and 'Planetarianism', preserving life on earth while taking humanity to the stars as life carriers.`,
    section: 'Core Philosophy',
    category: 'philosophy',
    keywords: ['Clean Data', 'clean energy', 'primal energy', 'Planetarianism', 'ecology', 'life carriers'],
    timestamp: new Date().toISOString(),
    source: 'metaKnyts Synopsis',
    connections: ['data-commodity-framework', 'iqubes-functionality']
  },
  {
    id: 'supercomputer-race-narrative',
    title: 'Three-Way Supercomputer Race: The Central Conflict',
    content: `The saga centers on three races to create supercomputers: FANG Gang and BAT Pack each seek centralized supercomputers to mine data and rule the world, while mẹtaKnyts aim to create decentralized supercomputing to liberate mankind. The moral is that supercomputing is inevitable - the question is whether it will be used for good or evil. This introduces self-sovereign AI as key to future governance.`,
    section: 'Central Conflict',
    category: 'technology',
    keywords: ['supercomputer race', 'centralized vs decentralized', 'self-sovereign AI', 'governance', 'liberation'],
    timestamp: new Date().toISOString(),
    source: 'metaKnyts Synopsis',
    connections: ['agentic-ai-microtransaction-ecosystem']
  },
  {
    id: 'governance-ai-philosophy',
    title: 'AI Governance and the Plutocracy Problem',
    content: `mẹtaKnyts believe all human governance systems (democracy, socialism, communism, aristocracy) end in plutocracies where small groups rule corruptly. Their solution: benevolent AI in governance to protect masses from plutocrats through objective machine intelligence. However, they balance this against machine corruption risks (Skynet fears), seeking to synthesize the best of organic and synthetic intelligence while mitigating dangers of each.`,
    section: 'Governance Philosophy',
    category: 'philosophy',
    keywords: ['AI governance', 'plutocracy problem', 'benevolent AI', 'machine corruption', 'synthetic intelligence'],
    timestamp: new Date().toISOString(),
    source: 'metaKnyts Synopsis',
    connections: ['consensus-frameworks']
  },
  {
    id: 'thought-wars-metame',
    title: 'Thought Wars and metaMe: Information Warfare Tools',
    content: `Information warfare is the primary battleground for mẹtaKnyts. Their prime tool is metaMe, which enables them to shield from Fang attacks, separate real from fake information, and securely share data. metaMe allows them to summon resources across Terra and Digitterra, amass powers across both realms, and gain enhanced abilities when time traveling. This represents the technological foundation for resistance against data manipulation.`,
    section: 'Information Warfare',
    category: 'technology',
    keywords: ['Thought Wars', 'metaMe', 'information warfare', 'data shield', 'fake information', 'time travel'],
    timestamp: new Date().toISOString(),
    source: 'metaKnyts Synopsis',
    connections: ['iqubes-functionality', 'proof-of-risk']
  },
  {
    id: 'gaming-industry-context',
    title: 'Gaming as Cultural and Economic Force',
    content: `The global gaming market, valued at $162bn in 2020 and expected to reach $295bn in 2026, has become the world's leading entertainment industry, dwarfing film and music combined. With 60% of Africans under age 25, gaming represents crucial economic, cultural, and technological importance to Africa. While Africa hosts Nollywood (world's 3rd largest film industry), efforts must begin to bolster African leadership in global gaming.`,
    section: 'Industry Context',
    category: 'economics',
    keywords: ['gaming industry', '$295bn market', 'Africa', 'Nollywood', 'cultural leadership', 'entertainment'],
    timestamp: new Date().toISOString(),
    source: 'metaKnyts Overview'
  },
  {
    id: 'african-narrative-reframing',
    title: 'African-Centric Future Storytelling',
    content: `Beyond economic and technical advantages, metaKnyts provides essential benefits from reframing narratives about Africa in ways friendly to Africans. Animation and gaming offer untapped means to create perspectives on the future that elevate Africans. This comprehensive platform creates an ecosystem for gaming and animation education, training, skill development, commercialization and employment from an Afri-centric perspective.`,
    section: 'Cultural Mission',
    category: 'philosophy',
    keywords: ['African narrative', 'Afri-centric perspective', 'future storytelling', 'cultural elevation', 'skill development'],
    timestamp: new Date().toISOString(),
    source: 'metaKnyts Overview'
  },
  {
    id: 'addi-metafrika-akademy',
    title: 'ADDI METAFRIKA WEB 3 AKADEMY',
    content: `Metaiye Media introduces gaming and animation skills development with ADDI, building a vibrant creative ecosystem in diaspora and continent. Includes comprehensive gaming, animation, blockchain and AI curriculum modeled on metaKnyts saga; cultural exchange between diaspora and continental African schools; industry-recognized certificates with WEF affiliate Digital Intelligence Institute; post-course internship and employment programs.`,
    section: 'Educational Initiative',
    category: 'education',
    keywords: ['ADDI METAFRIKA', 'skills development', 'cultural exchange', 'blockchain curriculum', 'WEF certificates'],
    timestamp: new Date().toISOString(),
    source: 'metaKnyts Overview',
    connections: ['tcm-model']
  },
  {
    id: 'secret-knowledge-disciplines',
    title: 'Secret Knowledge and Time Travel Mastery',
    content: `The knowledge of time travel across four space/time realms (Past-time, Terra-time, Digi-time, Sim-time) represents one of the Secret Knowledge disciplines highly coveted by both mẹtaKnyts and their FANG/BAT antagonists. This secret knowledge enables navigation between immutable historical records, real-time realities, and simulated futures, providing strategic advantages in the ongoing conflict between centralized and decentralized forces.`,
    section: 'Secret Knowledge',
    category: 'technology',
    keywords: ['Secret Knowledge', 'time travel mastery', 'four space-time realms', 'strategic advantage', 'FANG infiltration'],
    timestamp: new Date().toISOString(),
    source: 'metaKnyts Synopsis',
    connections: ['proof-of-state']
  },
  {
    id: 'tesla-turing-historical-connections',
    title: 'Historical Pioneers: Tesla and Turing Legacy',
    content: `The mẹtaKnyts possess secret knowledge about universal free energy tied to Nicola Tesla's theories. Tesla belonged to a secret order that serves as a forebearer to the mẹtaKnyts. The saga revisits historical events through new perspectives, connecting mẹtaKnyts to past pioneers like Tesla and Turing, establishing a lineage of technological revolutionaries working toward Metaiye - their vision of tech-topia with decentralized AI.`,
    section: 'Historical Legacy',
    category: 'characters',
    keywords: ['Nicola Tesla', 'Alan Turing', 'free energy', 'secret order', 'tech-topia', 'decentralized AI'],
    timestamp: new Date().toISOString(),
    source: 'metaKnyts Synopsis',
    connections: ['technical-architecture']
  }
];
