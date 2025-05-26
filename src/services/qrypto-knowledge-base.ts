export interface QryptoKnowledgeItem {
  id: string;
  title: string;
  content: string;
  section: string;
  category: 'tokenomics' | 'protocols' | 'consensus' | 'economics' | 'mechanics' | 'technical' | 'legal' | 'implementation';
  keywords: string[];
  timestamp: string;
  source: string;
}

export class QryptoKnowledgeBase {
  private static instance: QryptoKnowledgeBase;
  private knowledgeItems: QryptoKnowledgeItem[] = [];

  private constructor() {
    this.initializeKnowledgeBase();
  }

  public static getInstance(): QryptoKnowledgeBase {
    if (!QryptoKnowledgeBase.instance) {
      QryptoKnowledgeBase.instance = new QryptoKnowledgeBase();
    }
    return QryptoKnowledgeBase.instance;
  }

  private initializeKnowledgeBase() {
    // Initialize with all content
    this.addKnowledgeItems([
      {
        id: 'qoyn-economy-fundamentals',
        title: '$QOYN Economy Fundamentals',
        content: `The $QOYN economy is underpinned by three protocols:
        1. iQube Protocol - containerised information management protocol where information primitives and intelligence assets are dynamically curated, quantified and accessed by the level of risk associated with using them in specific contexts.
        2. Aigent Protocol - iQube compliant AI agents from different platforms with verifiable metrics matched with curated precise datasets (iQubes) that accelerate time to value.
        3. COYN Protocol - a data-as-an asset backed digital currency framework where currencies are accurately priced based on data risk and utility.`,
        section: 'Ecosystem Fundamentals',
        category: 'protocols',
        keywords: ['iQube Protocol', 'Aigent Protocol', 'COYN Protocol', 'data-as-asset', 'risk'],
        timestamp: new Date().toISOString(),
        source: 'Qrypto COYN Tokenomics'
      },
      {
        id: 'consensus-frameworks',
        title: 'Three Consensus Frameworks',
        content: `Three Consensus Frameworks underpin the three protocols:
        1. Proof of Risk - Quantifies the risk associated with using a particular dataset in a particular context.
        2. Proof of Price - Prices data based on cost to underwrite the risk associated with using it per Proof-of-risk; and from assessing the value anticipated by the buyer to be generated from it.
        3. Proof of State - enables the state of iQubes and agents that use them to be immutably verified.`,
        section: 'Consensus Frameworks',
        category: 'consensus',
        keywords: ['Proof of Risk', 'Proof of Price', 'Proof of State', 'PoR', 'PoP'],
        timestamp: new Date().toISOString(),
        source: 'Qrypto COYN Tokenomics'
      },
      {
        id: 'iqubes-functionality',
        title: 'iQubes Functionality',
        content: `iQubes accurately quantify the risk and value associated with using specific datasets, content, tools, models and AI agents, in specific contexts with high levels of precision and granularity. They bring relevant and precise data to AI agents and vice versa. iQubes also bring precise and contextually relevant AI agents to datasets. E.g. a health care iQube can corral a swarm of health agents as a financial information iQube can coral TradFi and DeFi agents.`,
        section: 'iQubes Core Functionality',
        category: 'protocols',
        keywords: ['iQubes', 'risk quantification', 'AI agents', 'datasets', 'contextual intelligence'],
        timestamp: new Date().toISOString(),
        source: 'Qrypto COYN Tokenomics'
      },
      {
        id: 'tcm-model',
        title: 'Techno Capital Machine (TCM) Model',
        content: `The protocol uses the Techno Capital Machine Model (TCM) to reward users for staking three types of assets:
        1. Capital - Capital providers are able to stake Ethereum or Bitcoin and earn yield from that stake in the form of Qrypto COYNs that are emitted on a daily basis pro rata
        2. Compute - Compute providers are able to earn Qrypto COYN from contributing software and hardware to the iQube ecosystem for use by the ecosystem.
        3. Content - Content providers are rewarded for staking data and content (i.e. rich media, IP etc) to the ecosystem for use by third parties.`,
        section: 'Commercial Mechanics',
        category: 'mechanics',
        keywords: ['TCM', 'Techno Capital Machine', 'staking', 'Capital', 'Compute', 'Content'],
        timestamp: new Date().toISOString(),
        source: 'Qrypto COYN Tokenomics'
      },
      {
        id: 'token-economics',
        title: '$QOYN Token Economics',
        content: `100M Qrypto COYN tokens will be minted and dispersed over a 10 year period at a rate of 10M Qrypto COYN tokens per year. 30% of emissions will be assigned to each of the three pillars everyday at a rate of 8,219 tokens per pillar per day. The remaining 10% will go to a Treasury pool that will be used to provide liquidity, buy back tokens and manage the network.`,
        section: 'Inflationary Emission Schedule',
        category: 'tokenomics',
        keywords: ['$QOYN', 'token distribution', 'emissions', 'Treasury pool', '100M tokens'],
        timestamp: new Date().toISOString(),
        source: 'Qrypto COYN Tokenomics'
      },
      {
        id: 'deflationary-mechanics',
        title: 'Deflationary Mechanics',
        content: `The 10% pool will be used also to acquire 10% of Qrypto COYN and convert 5% of emissions on a daily basis creating a deflationary mechanic intrinsic to the protocol. Marketplace Commissions (up to 30% fees) will generate revenue that will fund burns and staking. Dynamic Burns (e.g., 60–80% of fees) will offset inflation. Up to 30% APY Staking will lock supply.`,
        section: 'Deflationary Mechanics',
        category: 'tokenomics',
        keywords: ['deflationary', 'burns', 'staking', 'APY', 'marketplace commissions'],
        timestamp: new Date().toISOString(),
        source: 'Qrypto COYN Tokenomics'
      },
      {
        id: 'bitcoin-security',
        title: 'Bitcoin-Secured iQubes',
        content: `The $COYN and iQube protocols leverage Bitcoin's security by technically anchoring each iQube and $COYN to a Satoshi (1/100,000,000 BTC), providing both with Bitcoin's world-leading data security. However, though each iQube and $COYN is technically entangled with a Satoshi they are not economically pegged to it, giving both Bitcoin grade security without pegging their market value to BTC.`,
        section: 'Bitcoin Security',
        category: 'technical',
        keywords: ['Bitcoin security', 'Satoshi', 'entanglement', 'TokenQube', 'security'],
        timestamp: new Date().toISOString(),
        source: 'Qrypto COYN Tokenomics'
      },
      {
        id: 'proof-of-price-models',
        title: 'Proof of Price Models',
        content: `Data can be intrinsically priced from two perspectives:
        1. Obtaining new data (Negative risk – Opportunity for a Gain): This implies that acquiring new data introduces an opportunity.
        2. Losing existing data (Positive risk – Risk of a Loss): This perspective frames data loss as a risk with potentially adverse consequences.
        Three models are being evaluated: Risk Model, Z-Score approach (Opportunity for Gain), and Z-Score approach (Risk of a Loss).`,
        section: 'Proof of Price Framework',
        category: 'economics',
        keywords: ['Proof of Price', 'data pricing', 'risk models', 'Z-Score', 'opportunity cost'],
        timestamp: new Date().toISOString(),
        source: 'Qrypto COYN Tokenomics'
      },
      {
        id: 'technical-architecture',
        title: 'Technical Architecture',
        content: `ICP Chain Fusion will be used to enable trust-minimized, decentralized interaction with Bitcoin, allowing ICP smart contracts to natively manage Bitcoin UTXOs. LayerZero will be used to enable secure and reliable cross-chain message passing between ICP, Bitcoin, and EVM blockchains.`,
        section: 'Technical Implementation',
        category: 'technical',
        keywords: ['ICP Chain Fusion', 'LayerZero', 'cross-chain', 'Bitcoin UTXOs', 'EVM'],
        timestamp: new Date().toISOString(),
        source: 'COYN Requirements'
      },
      {
        id: 'sec-bitcoin-precedent',
        title: 'SEC Bitcoin Precedent & Non-Security Status',
        content: `The SEC has repeatedly acknowledged that Bitcoin (BTC) is not a security, most notably in its 2018 report and 2020 dismissal of the Howey Test for BTC. The COYN protocol's technical underpinning of 1 Satoshi per iQube ties $QOYN to Bitcoin's non-security status. $QOYN's value derives from its utility in the ecosystem (accessing iQubes, staking, governance), not from expectations of profit tied to third-party efforts.`,
        section: 'Bitcoin Satoshi Underpinning',
        category: 'legal',
        keywords: ['SEC', 'Bitcoin', 'non-security', 'Howey Test', 'Satoshi underpinning', 'utility token'],
        timestamp: new Date().toISOString(),
        source: '$QOYN Legal Strategy'
      },
      {
        id: 'data-commodity-framework',
        title: 'Data as Quantifiable Commodity',
        content: `The COYN protocol positions data as a quantifiable, tradable commodity, with $QOYN acting as a medium for pricing and transacting this data. By framing $QOYN as a utility token for accessing and pricing data (not an investment), COYN avoids triggering the Howey Test. Data underpinned by iQubes is treated as a fungible or non-fungible commodity, similar to real-world assets like gold or oil.`,
        section: 'Data Commodity Classification',
        category: 'legal',
        keywords: ['data commodity', 'Howey Test', 'utility token', 'fungible assets', 'data valuation'],
        timestamp: new Date().toISOString(),
        source: '$QOYN Legal Strategy'
      },
      {
        id: 'regulatory-compliance-strategy',
        title: 'Regulatory Strategy & Utility Focus',
        content: `$QOYN's primary use cases include: Access to iQubes (required for all data transactions), Staking (earn rewards tied to protocol fees, not inflation), and Governance (token holders vote on technical parameters, not profit distribution). This utility-first model mirrors non-security tokens like Filecoin and Chainlink. Wyoming's blockchain-friendly laws provide a defensible jurisdictional framework.`,
        section: 'Utility Focus & Compliance',
        category: 'legal',
        keywords: ['utility focus', 'Wyoming laws', 'protocol fees', 'governance', 'regulatory compliance'],
        timestamp: new Date().toISOString(),
        source: '$QOYN Legal Strategy'
      },
      {
        id: 'legal-risk-mitigations',
        title: 'Legal Risks & Mitigations',
        content: `Potential SEC scrutiny of hybrid tokens is mitigated through clear documentation emphasizing $QOYN's utility over speculative gains, ensuring no revenue sharing (rewards tied to protocol fees, not enterprise profits), and transparency in Satoshi reserves through monthly audits. Third-party audits verify data's quantifiable value via iQube metadata and risk scores.`,
        section: 'Risk Management',
        category: 'legal',
        keywords: ['SEC scrutiny', 'hybrid tokens', 'documentation', 'Satoshi reserves', 'third-party audits'],
        timestamp: new Date().toISOString(),
        source: '$QOYN Legal Strategy'
      },
      {
        id: 'tcm-bucket-allocation',
        title: 'TCM Bucket Allocation Structure',
        content: `The Techno Capital Machine allocates emissions as follows: 30% to Capital Bucket (Bitcoin and Ethereum stakers), 30% to Compute Bucket (software and hardware providers), 30% to Content Bucket (data and content creators), and 10% to Pool (for micro stable coin pegged to $0.01). This structure ensures balanced incentives across all three pillars of the ecosystem.`,
        section: 'TCM Distribution Model',
        category: 'implementation',
        keywords: ['TCM buckets', 'Capital bucket', 'Compute bucket', 'Content bucket', 'micro stable coin'],
        timestamp: new Date().toISOString(),
        source: '$QOYN TCM Specification'
      },
      {
        id: 'cross-chain-integration',
        title: 'Cross-Chain Integration Architecture',
        content: `ICP Chain Fusion enables secure interaction with Bitcoin, allowing ICP smart contracts to manage Bitcoin UTXOs directly. LayerZero provides safe and reliable communication between ICP, Bitcoin, and EVM blockchains. This architecture ensures interoperability while maintaining security and decentralization across multiple blockchain networks.`,
        section: 'Technical Integration',
        category: 'technical',
        keywords: ['ICP Chain Fusion', 'LayerZero', 'cross-chain', 'Bitcoin UTXOs', 'EVM integration', 'interoperability'],
        timestamp: new Date().toISOString(),
        source: '$QOYN TCM Specification'
      },
      {
        id: 'implementation-roadmap',
        title: 'Implementation Roadmap',
        content: `Pre-Launch: Secure enterprise iQube partnerships and create dashboard for real-time burn/APY tracking. Launch: Enforce mandatory Qrypto COYN usage for iQubes and implement governance voting for parameter adjustments. Post-Launch: Monitor and adjust tokenomics and staking mechanisms as needed. The roadmap ensures systematic deployment and continuous optimization.`,
        section: 'Development Timeline',
        category: 'implementation',
        keywords: ['implementation roadmap', 'enterprise partnerships', 'governance voting', 'tokenomics adjustment'],
        timestamp: new Date().toISOString(),
        source: '$QOYN TCM Specification'
      },
      {
        id: 'micro-stablecoin-framework',
        title: 'Micro Stable Coin Framework',
        content: `The micro stable coin is pegged 1:1 to $0.01 and funded by 10% of Qrypto COYN emissions allocated to the Pool. This micro stable coin facilitates transactions within the ecosystem, providing price stability for day-to-day operations while the main $QOYN token captures value appreciation. It serves as the transactional currency for iQube access and data pricing.`,
        section: 'Stable Coin Mechanics',
        category: 'tokenomics',
        keywords: ['micro stable coin', '$0.01 peg', 'transactional currency', 'price stability', 'iQube transactions'],
        timestamp: new Date().toISOString(),
        source: '$QOYN TCM Specification'
      },
      {
        id: 'smart-contract-requirements',
        title: 'Smart Contract Technical Requirements',
        content: `Smart Contract Requirements: Token Issuance (issues Qrypto COYN tokens to Bitcoin and Ethereum stakers), Staking Mechanism (allows contributors to stake Bitcoin and Ethereum for Qrypto COYN), Token Distribution (distributes based on staking), Capital/Compute/Content Buckets (allocates tokens per TCM model), and Pool (allocates 10% for micro stable coin). Built on Internet Computer Protocol (ICP) using Rust or Motoko with ICP Chain Fusion and LayerZero integration.`,
        section: 'Smart Contract Specifications',
        category: 'technical',
        keywords: ['smart contracts', 'ICP', 'Rust', 'Motoko', 'token issuance', 'staking mechanism'],
        timestamp: new Date().toISOString(),
        source: '$QOYN TCM Requirements'
      },
      {
        id: 'security-scalability-requirements',
        title: 'Security & Scalability Requirements',
        content: `Non-Functional Requirements include Security (ensures integrity of tokens and staking process), Scalability (handles large numbers of transactions and users), and Usability (designed for ease of interaction). Testing includes Unit Testing (thoroughly tests individual components), Integration Testing (verifies interaction with ecosystem components), and Security Auditing (undergoes review by security firm for vulnerabilities).`,
        section: 'System Requirements',
        category: 'technical',
        keywords: ['security', 'scalability', 'unit testing', 'integration testing', 'security auditing'],
        timestamp: new Date().toISOString(),
        source: '$QOYN TCM Requirements'
      },
      {
        id: 'por-rug-pull-mitigation',
        title: 'Proof of Risk Rug Pull Mitigation',
        content: `Dynamic Risk Scoring assigns risk scores to all participants based on iQube compliance and historical behavior. High-risk actors are excluded from governance or face higher staking requirements. Collateralized Participation requires developers to stake $QOYN proportional to their DataQube/AgentQube risk score (e.g., high-risk healthcare agentQube requires 10K $QOYN collateral, slashed if fraud occurs). Decentralized Audits compute risk scores via validator network, stored on-chain via Proof of State.`,
        section: 'Risk Mitigation Framework',
        category: 'consensus',
        keywords: ['dynamic risk scoring', 'collateralized participation', 'decentralized audits', 'rug pull prevention'],
        timestamp: new Date().toISOString(),
        source: '$QOYN Price Risk Mitigation'
      },
      {
        id: 'pop-market-integrity',
        title: 'Proof of Price Market Integrity',
        content: `Positive Risk-Based Pricing automatically adjusts prices downward if iQube risk score increases (e.g., data breaches, regulatory non-compliance). Auction-Based Price Discovery uses Dutch auctions for fair value discovery, preventing pump schemes by capping speculative bids. Liquidity Safeguards include 5% of protocol fees funding liquidity pool that stabilizes $QOYN during volatility, with slippage limits (≤5%) preventing flash crashes from whale dumps.`,
        section: 'Market Integrity Framework',
        category: 'economics',
        keywords: ['price discovery', 'Dutch auctions', 'liquidity safeguards', 'market integrity', 'anti-manipulation'],
        timestamp: new Date().toISOString(),
        source: '$QOYN Price Risk Mitigation'
      },
      {
        id: 'systemic-safeguards',
        title: 'Combined PoR/PoP Systemic Safeguards',
        content: `Early Warning System triggers alerts when iQube risk score spikes, freezing suspicious transactions (e.g., if dataset accuracy drops <30%, its iQube is quarantined). Insurance Fund uses 2% of fees to reimburse users affected by iQube failures, backed by PoR risk scores. Reputation Scores issue non-transferable Reputation Tokens to participants with low risk and high-trust scores, unlocking rewards. Governance allows $QOYN holders to vote on PoR collateral ratios or PoP auction rules.`,
        section: 'Systemic Protection',
        category: 'consensus',
        keywords: ['early warning system', 'insurance fund', 'reputation scores', 'governance voting'],
        timestamp: new Date().toISOString(),
        source: '$QOYN Price Risk Mitigation'
      },
      {
        id: 'intent-analysis-framework',
        title: 'iQube Intent Analysis & Curation Framework',
        content: `Automated Intent Analysis system developed by Edson Bope and Dele Atanda via Lehigh University processes text instructions, documents, audio, and video inputs using NLP/LLMs (GPT, LangChain). Intent Classification categorizes intents into predefined use cases (risk analysis, investment research). Data Collection uses SQL database querying and external API integration (CoinGecko, PubMed). Machine Learning Filtering trains classifiers to select records matching original intent, compiling into encrypted iQubes.`,
        section: 'Data Curation Process',
        category: 'technical',
        keywords: ['intent analysis', 'NLP', 'LangChain', 'data curation', 'machine learning', 'automated processing'],
        timestamp: new Date().toISOString(),
        source: 'Declaration of Intent'
      },
      {
        id: 'risk-scoring-framework',
        title: 'iQube Information Risk Scoring Framework',
        content: `Comprehensive risk evaluation framework by Amit Rajendra Patil and Dele Atanda evaluates risks for iQube combinations using risk_matrix mapping data attributes to risk levels (High/Medium/Low) across confidentiality, identifiability, sensitivity. Weighted Scoring applies weights to key risk types (Identifiability: 1.5, Security: 1.4). Dynamic Thresholding computes thresholds based on maximum achievable score (High Risk >65%, Medium Risk >35%). Regulatory Compliance maps attributes to legal frameworks (GDPR, HIPAA, CCPA).`,
        section: 'Risk Assessment Framework',
        category: 'consensus',
        keywords: ['risk scoring', 'weighted scoring', 'dynamic thresholding', 'regulatory compliance', 'GDPR', 'HIPAA'],
        timestamp: new Date().toISOString(),
        source: 'Proof of Risk'
      },
      {
        id: 'data-pricing-models',
        title: 'Data Pricing Models & Components',
        content: `Three pricing models evaluated by Toluope Shoaga and Dele Atanda: Model 1 (Risk Model): Price = Risk * 1/Expected Return. Model 2a (Z-Score Opportunity): Price = Risk * Expected Revenue + Time Value + Market Value. Model 2b (Z-Score Loss): Price = Risk * Expected Revenue + Compliance - Time Value. Price Components include Data Replication cost, Compliance (GDPR breach impact), Time Value (opportunity cost), and Market Risk (competitor data loss cost). All models use discount rates and probability adjustments.`,
        section: 'Data Pricing Framework',
        category: 'economics',
        keywords: ['data pricing models', 'Z-Score approach', 'risk-based pricing', 'compliance costs', 'time value', 'market risk'],
        timestamp: new Date().toISOString(),
        source: 'Proof of Price'
      },
      {
        id: 'tcm-deployment-architecture',
        title: 'TCM Deployment & Maintenance Framework',
        content: `Deployment Plan includes deployment on ICP blockchain according to specific plan and timeline. Maintenance & Updates ensure regular maintenance for security and functionality with update mechanisms for new features and fixes. Implementation Timeline: Weeks 1-3 (Intent Understanding), 4-6 (Intent Clarification), 7-9 (Data Collection), 10-11 (Record Selection). Technical Requirements include AI/ML tools (PyTorch, LangChain, scikit-learn), Data Processing (Pandas, NumPy, SQL), APIs/Scraping (RESTful APIs, Scrapy), and Security (encryption libraries).`,
        section: 'Deployment Framework',
        category: 'implementation',
        keywords: ['deployment plan', 'maintenance updates', 'implementation timeline', 'technical requirements', 'AI/ML tools'],
        timestamp: new Date().toISOString(),
        source: 'Raw TCM Specification'
      }
    ]);
  }

  public addKnowledgeItems(items: QryptoKnowledgeItem[]) {
    this.knowledgeItems.push(...items);
  }

  public searchKnowledge(query: string): QryptoKnowledgeItem[] {
    const queryLower = query.toLowerCase();
    const searchTerms = queryLower.split(' ');
    
    return this.knowledgeItems.filter(item => {
      const searchableText = `${item.title} ${item.content} ${item.keywords.join(' ')}`.toLowerCase();
      return searchTerms.some(term => 
        searchableText.includes(term) ||
        item.keywords.some(keyword => keyword.toLowerCase().includes(term))
      );
    }).sort((a, b) => {
      // Sort by relevance - items with more keyword matches first
      const aMatches = searchTerms.filter(term => 
        `${a.title} ${a.content} ${a.keywords.join(' ')}`.toLowerCase().includes(term)
      ).length;
      const bMatches = searchTerms.filter(term => 
        `${b.title} ${b.content} ${b.keywords.join(' ')}`.toLowerCase().includes(term)
      ).length;
      return bMatches - aMatches;
    });
  }

  public getAllKnowledge(): QryptoKnowledgeItem[] {
    return this.knowledgeItems;
  }

  public getKnowledgeByCategory(category: QryptoKnowledgeItem['category']): QryptoKnowledgeItem[] {
    return this.knowledgeItems.filter(item => item.category === category);
  }
}

export const qryptoKB = QryptoKnowledgeBase.getInstance();
