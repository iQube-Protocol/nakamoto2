
import { iQubesKnowledgeItem } from './types';

export const IQUBES_KNOWLEDGE_DATA: iQubesKnowledgeItem[] = [
  {
    id: 'iqube-whitepaper-executive-summary',
    title: 'iQube Protocol Executive Summary',
    content: `The emergence of agentic AI—a new class of autonomous, goal-oriented systems—has created an urgent need for reliable, verifiable, and secure information assets. Current data systems are too centralized, too opaque, and too rigid to handle the complexity of AI systems that must act independently, adaptively, and ethically.

The iQube Protocol is a groundbreaking solution designed to containerize data and intelligence into decentralized, cryptographically entangled primitives. By combining metaQubes (on-chain metadata), blakQubes (encrypted payloads), and tokenQubes (access and decryption keys), the protocol creates a trustless and verifiable information environment that meets the demands of agentic AI.

The protocol bridges the trust gap in agentic AI by providing a cryptographically verifiable information container system that addresses the fundamental limitations of centralized and opaque data infrastructures. The dual-network architecture consists of an open permissionless network that hosts metaQubes and a private permissioned network that manages blakQubes, cryptographically entangled using hash functions and zero-knowledge proofs.

By enabling data-as-an-asset valuation, integrating with AI orchestration via the Aigent Protocol, and leveraging the COYN economy's micro-stable coins for value exchange, the iQube Protocol provides the technical and economic foundation for a resilient, scalable, and ethical agentic AI economy.`,
    section: 'Protocol Overview',
    category: 'protocols',
    keywords: ['iQube Protocol', 'agentic AI', 'metaQubes', 'blakQubes', 'tokenQubes', 'dual-network architecture', 'cryptographic entanglement'],
    timestamp: new Date().toISOString(),
    source: 'iQube Whitepaper v0.1'
  },
  {
    id: 'iqube-problem-space',
    title: 'iQube Protocol Problem Space',
    content: `The iQube Protocol is designed to tackle four core problem spaces that limit the effectiveness of agentic AI systems:

1. **Data Lockout:** Traditional data systems are fragmented, with critical data locked within corporate silos or private repositories. This fragmentation prevents AI agents from accessing complete, reliable datasets necessary for accurate reasoning and decision-making.

2. **Unpredictable AI Outputs:** AI models trained on fragmented or unverified data often produce outputs of inconsistent quality, leading to unreliable recommendations and decisions. The iQube Protocol introduces metaQubes that embed provenance, quality metrics, and usage rights directly into the information container.

3. **Intellectual Property Leakage:** In centralized systems, data assets are vulnerable to unauthorized access, copying, or misuse. The iQube Protocol uses cryptographically entangled primitives to enforce data integrity and control.

4. **Systemic Risk:** Centralized architectures are prone to single points of failure and adversarial attacks. The iQube Protocol mitigates these risks through its dual-network design and cryptographic entanglement.

By addressing these problem spaces, the iQube Protocol provides a secure, verifiable, and dynamic foundation for the agentic AI economy.`,
    section: 'Problem Analysis',
    category: 'technical',
    keywords: ['data lockout', 'AI outputs', 'IP leakage', 'systemic risk', 'centralized systems', 'data fragmentation'],
    timestamp: new Date().toISOString(),
    source: 'iQube Whitepaper v0.1'
  },
  {
    id: 'iqube-design-philosophy',
    title: 'iQube Protocol Design Philosophy',
    content: `The iQube Protocol's design philosophy is anchored on three foundational principles:

1. **Intent-Based Curation:** The protocol acknowledges that information is not uniformly valuable across all contexts. Data relevance, risk, and intended use vary depending on the AI service or decision-making process. The iQube Protocol incorporates a dynamic tagging and curation system embedded in metaQubes.

2. **Context-Aware Risk Management:** Traditional encryption and access control systems treat data as static, applying uniform security measures regardless of context. The iQube Protocol integrates dynamic risk scoring mechanisms that evaluate both intrinsic risk and contextual risk.

3. **Dual-Network Architecture:** To balance transparency with confidentiality, the iQube Protocol uses a dual-network design. The open permissionless network manages metaQubes, while the private permissioned network manages blakQubes. Cryptographic entanglement mechanisms bind the two networks together.

By synthesizing these principles, the iQube Protocol creates a secure, composable, and risk-managed information environment, enabling AI agents to operate autonomously and responsibly in decentralized ecosystems.`,
    section: 'Design Principles',
    category: 'architecture',
    keywords: ['intent-based curation', 'context-aware risk', 'dual-network architecture', 'dynamic tagging', 'cryptographic entanglement'],
    timestamp: new Date().toISOString(),
    source: 'iQube Whitepaper v0.1'
  },
  {
    id: 'iqube-three-primitives',
    title: 'iQube Three Cryptographic Primitives',
    content: `At the core of the iQube Protocol lies a modular and composable container system built from three cryptographic primitives:

**metaQubes:** These are transparent, on-chain metadata containers that store information about data provenance, quality, usage rights, risk profiles, and compliance states. Each metaQube serves as a discovery and verification point for AI agents, providing them with a snapshot of the data asset's lineage and risk status before accessing the underlying content.

**blakQubes:** These containers hold the encrypted payloads—raw or structured data—that represent the private, sensitive information asset. blakQubes are stored on a private permissioned network, ensuring confidentiality. They are cryptographically entangled with their corresponding metaQubes and tokenQubes.

**tokenQubes:** These smart contract-enabled primitives govern access and decryption rights to blakQubes. They enforce dynamic, risk-aware key releases based on real-time risk scoring and identity states. The tokenQube design ensures that data consumers can only decrypt data if they meet the risk and identity conditions specified in the metaQube.

This modular and entangled design allows iQubes to be transferred across networks, embedded in AI services, and integrated into composable workflows while maintaining verifiable risk, provenance, and usage rights.`,
    section: 'Core Architecture',
    category: 'technical',
    keywords: ['metaQubes', 'blakQubes', 'tokenQubes', 'cryptographic primitives', 'entanglement', 'access control', 'risk scoring'],
    timestamp: new Date().toISOString(),
    source: 'iQube Whitepaper v0.1'
  },
  {
    id: 'iqube-information-intelligence-primitives',
    title: 'iQube Information & Intelligence Primitives',
    content: `The iQube Protocol structures its information architecture through five core primitives:

**DataQubes:** Structured data containers for tabular, relational, and highly organized information. Each DataQube includes metadata that captures data schema, quality metrics, and risk assessments, ensuring that AI agents can assess data trustworthiness and provenance before use.

**ContentQubes:** Encrypted containers for unstructured data such as text documents, images, and multimedia. ContentQubes leverage cryptographic entanglement to tie their metadata and access controls into the same trustless framework.

**ToolQubes:** Self-contained functional modules, such as AI pipelines, data transformation scripts, or analytics workflows. ToolQubes integrate with the Aigent Protocol to support dynamic AI service orchestration and compliance verification.

**ModelQubes:** Containers for AI models, algorithms, and neural networks. ModelQubes include risk metadata detailing training data provenance, model sensitivity, and explainability factors. TokenQubes manage access to these models, enabling risk-based model sharing.

**AgentQubes (Aigents):** Autonomous agents that operate in compliance with iQube standards. Each Aigent interacts with iQubes through the Aigent Protocol's Orchestration Agent, using the Context, Service, and State Layers.

The entanglement of these primitives ensures that information assets are secure, auditable, with dynamic risk management and usage rights embedded directly into each container.`,
    section: 'Data Primitives',
    category: 'technical',
    keywords: ['DataQubes', 'ContentQubes', 'ToolQubes', 'ModelQubes', 'AgentQubes', 'Aigents', 'data containers', 'AI orchestration'],
    timestamp: new Date().toISOString(),
    source: 'iQube Whitepaper v0.1'
  },
  {
    id: 'iqube-identity-privacy',
    title: 'iQube Identity & Privacy Framework',
    content: `Identity and privacy are core components of the iQube Protocol's approach to secure, trustless data sharing. The protocol leverages DiDQubes (Dynamic Decentralized Identifier Qubes) to manage identities dynamically across different states—anonymous, semi-anonymous, semi-identifiable, and fully identifiable—depending on contextual risk, regulatory requirements, and user preferences.

**DiDQube Functionality:** DiDQubes act as decentralized identity containers that embed cryptographic proofs of identity state, risk level, and usage permissions. When AI agents or data consumers interact with an iQube, they use the DiDQube to verify the identity state of the data provider or owner.

**Anonymization-On-Chain vs. Identifiability-In-App:** The protocol separates identity management into two domains:
- **Anonymization-On-Chain:** Identity metadata stored in the permissionless network is anonymized using cryptographic techniques such as zero-knowledge proofs and threshold cryptography.
- **Identifiability-In-App:** When AI agents or applications need to interact with data owners, the iQube Protocol uses secure connectors to reveal identity states on a contextual, permissioned basis.

**Escrow Mechanisms:** For semi-anonymous or semi-identifiable states, the protocol uses smart contract-based escrow systems to temporarily hold identity information until risk and compliance checks are satisfied.

By embedding dynamic identity management into the protocol's architecture, iQubes can maintain data integrity and privacy while supporting regulatory compliance and trustless interactions.`,
    section: 'Identity Management',
    category: 'security',
    keywords: ['DiDQubes', 'dynamic identity', 'anonymization', 'zero-knowledge proofs', 'identity states', 'escrow mechanisms'],
    timestamp: new Date().toISOString(),
    source: 'iQube Whitepaper v0.1'
  },
  {
    id: 'iqube-risk-quantification',
    title: 'iQube Risk Quantification Pipeline',
    content: `Risk management within the iQube Protocol is a dynamic process that integrates both static and contextual elements to produce real-time risk assessments for each iQube.

**Static (Intrinsic) Risk:** Static risk refers to the inherent sensitivity of a data asset, such as the presence of personally identifiable information (PII), trade secrets, or regulatory classification. Each iQube includes a static risk score embedded in its metaQube.

**Dynamic (Contextual) Risk:** Dynamic risk factors are determined by the context in which data is accessed or requested. This includes the identity state of the requesting Aigent, the intended use case, current threat vectors, and real-time network conditions.

**Proof-of-Risk Mechanism:** The Proof-of-Risk mechanism continuously evaluates and recalculates the dynamic risk score of an iQube based on real-time context. This risk score directly informs the tokenQube's smart contract logic, adjusting decryption thresholds, access permissions, and logging requirements in real time.

**Risk Quantification Formula:**
Risk = (Static Sensitivity Score × Weight A) + (Dynamic Contextual Score × Weight B)

Weights A and B are configurable by protocol governance, allowing system operators to fine-tune the balance between intrinsic data risk and real-time usage risk. This dynamic risk quantification pipeline ensures that data is never accessed or processed without a comprehensive, context-sensitive risk evaluation.`,
    section: 'Risk Management',
    category: 'technical',
    keywords: ['Proof-of-Risk', 'static risk', 'dynamic risk', 'risk scoring', 'contextual assessment', 'smart contracts'],
    timestamp: new Date().toISOString(),
    source: 'iQube Whitepaper v0.1'
  },
  {
    id: 'iqube-access-encryption-automation',
    title: 'iQube Access & Encryption Automation',
    content: `Access control in the iQube Protocol is managed through a highly dynamic, smart contract-driven system that leverages tokenQubes to enforce encryption key releases based on real-time risk scores.

**Smart Contract Enforcement:** Each tokenQube is governed by a smart contract that encodes the access conditions for its corresponding blakQube. These conditions include risk thresholds, identity verification states, and usage rights as defined in the metaQube.

**Risk Score Tiers:** Access permissions are divided into risk score tiers:
- **Low Risk Tier:** Direct decryption key release to verified agents with compliant identity states.
- **Medium Risk Tier:** Conditional key release with additional verifiable proof-of-purpose or proof-of-compliance.
- **High Risk Tier:** Requires multi-signature approvals from designated compliance nodes or protocol governance entities.

**Dynamic Encryption Layers:** The protocol supports dynamic encryption, where the encryption strength can be adjusted based on the risk score. For higher-risk data, tokenQubes can trigger on-the-fly re-encryption with stronger algorithms or longer key lengths.

**Access Logging and Auditability:** Every key release and decryption event is logged immutably on-chain via the metaQube, ensuring full traceability and auditability.

Through this dynamic, risk-aware encryption automation, the iQube Protocol creates a self-regulating data environment that adapts to real-time risk and identity states.`,
    section: 'Access Control',
    category: 'security',
    keywords: ['access control', 'smart contracts', 'dynamic encryption', 'risk tiers', 'audit trails', 'key management'],
    timestamp: new Date().toISOString(),
    source: 'iQube Whitepaper v0.1'
  },
  {
    id: 'iqube-aigent-protocol-stack',
    title: 'iQube Aigent Protocol Stack',
    content: `The Aigent Protocol Stack orchestrates AI agent interactions with iQubes, ensuring that AI systems remain compliant, auditable, and risk-aware. It consists of three main layers managed by the Orchestration Agent:

**Context Layer:** This layer manages dynamic context injection, allowing AI agents to understand the environment in which data is requested and processed. It uses metadata from metaQubes, identity state from DiDQubes, and risk scores from the risk quantification pipeline to adapt agent behavior dynamically.

**Service Layer:** This layer manages AI service execution, including data transformations, analytics, and decision-making processes. The Service Layer integrates with ToolQubes and ModelQubes to provision AI models and workflows, ensuring they operate within the security and risk parameters defined by the protocol.

**State Layer:** The State Layer manages immutable records of AI agent interactions with iQubes, ensuring that all transactions, state changes, and service executions are logged on-chain. This guarantees full auditability and accountability.

**Orchestration Agent:** At the heart of the stack, the Orchestration Agent manages these three layers, ensuring that AI agents (Aigents) adhere to protocol standards at every step of data interaction. It enforces risk-based access, dynamic encryption, identity state compliance, and usage rights enforcement.

Through the Aigent Protocol Stack, the iQube Protocol enables a robust, secure, and auditable agentic AI environment that aligns with the complex demands of modern data ecosystems.`,
    section: 'AI Orchestration',
    category: 'architecture',
    keywords: ['Aigent Protocol', 'Context Layer', 'Service Layer', 'State Layer', 'Orchestration Agent', 'AI compliance'],
    timestamp: new Date().toISOString(),
    source: 'iQube Whitepaper v0.1'
  },
  {
    id: 'iqube-consensus-trio',
    title: 'iQube Consensus Trio Framework',
    content: `The iQube Protocol introduces a layered consensus framework to enforce trustless verification and coordination across its decentralized information ecosystem. This consensus framework comprises three interconnected mechanisms:

**Proof-of-Risk:** This mechanism ensures that each iQube's risk profile is verifiable and audit-friendly. It uses a combination of static sensitivity scores and dynamic contextual risk assessments to produce a risk score that is cryptographically verifiable. AI agents and data consumers can verify that data they consume or process meets the protocol's risk standards.

**Proof-of-Price:** This mechanism links risk profiles to the data's economic value, enforcing that higher-risk data is appropriately priced based on its sensitivity and usage context. Smart contracts compute a dynamic price for each iQube, taking into account risk, usage rights, and data quality as defined in the metaQube.

**Proof-of-State:** This mechanism verifies the lifecycle states of iQubes and their interactions with AI agents. Every state transition—whether it's a change in risk profile, identity state, or usage status—is recorded immutably and cryptographically entangled with the data's provenance.

Together, these three consensus mechanisms reinforce the iQube Protocol's commitment to risk-aware, fair, and transparent data exchange. They form the backbone of a trustless, agentic AI-ready data economy.`,
    section: 'Consensus Framework',
    category: 'consensus',
    keywords: ['Proof-of-Risk', 'Proof-of-Price', 'Proof-of-State', 'consensus mechanisms', 'risk verification', 'economic value'],
    timestamp: new Date().toISOString(),
    source: 'iQube Whitepaper v0.1'
  },
  {
    id: 'iqube-security-model',
    title: 'iQube Security Model',
    content: `The iQube Protocol's security model is built on a foundation of Bitcoin-grade data integrity and advanced cryptographic entanglement.

**Satoshi Entanglement:** Each iQube's metaQube includes cryptographic hashes that are periodically committed to the Bitcoin blockchain, establishing a tamper-proof record of data provenance, quality, and usage rights. This process ensures that any attempt to alter the data or its associated metadata will be immediately detectable.

**Bitcoin-Grade Data Integrity:** By leveraging the Bitcoin blockchain's immutability, the protocol ensures that all data interactions—including risk assessments, state transitions, and identity management—are anchored in a globally recognized, secure, and decentralized ledger.

**Dynamic Encryption and Threshold Cryptography:** The protocol employs dynamic encryption algorithms and threshold cryptography to enforce granular access control. Risk-based encryption tiers adjust encryption strength in real-time based on data sensitivity, identity state, and threat environment.

**Zero-Knowledge Proofs and Secure Multi-Party Computation:** The protocol integrates zero-knowledge proofs to allow AI agents and data consumers to verify data provenance, risk scores, and usage rights without revealing underlying private data. Secure multi-party computation enables distributed AI processing while maintaining data privacy and security.

Through this multi-layered security model—anchored in Bitcoin's proof-of-work, enhanced by cryptographic entanglement, and dynamically enforced through advanced encryption—the iQube Protocol ensures that data remains secure, private, and verifiable across decentralized AI ecosystems.`,
    section: 'Security Framework',
    category: 'security',
    keywords: ['Satoshi entanglement', 'Bitcoin-grade security', 'dynamic encryption', 'zero-knowledge proofs', 'threshold cryptography', 'secure multi-party computation'],
    timestamp: new Date().toISOString(),
    source: 'iQube Whitepaper v0.1'
  },
  {
    id: 'iqube-standards-interoperability',
    title: 'iQube Standards & Interoperability',
    content: `The iQube Protocol is designed for seamless integration into existing technology stacks and emerging decentralized ecosystems by adhering to open standards and ensuring broad interoperability.

**W3C DID/VC Compliance:** The protocol uses Decentralized Identifiers (DIDs) and Verifiable Credentials (VCs) as defined by the W3C standards. These frameworks enable dynamic identity management, credential exchange, and proof-of-ownership in a verifiable and privacy-preserving manner.

**LayerZero Omnichain Relays:** To facilitate cross-chain interoperability, the protocol integrates LayerZero's omnichain communication infrastructure. This allows iQubes to interact with other blockchains and decentralized systems, enabling AI agents and data assets to flow seamlessly across Layer1 and Layer2 networks.

**EVM Compatibility:** The protocol is fully EVM-compatible, allowing smart contracts written for Ethereum and other EVM chains to execute iQube functions without modification. This ensures that AI agents, dApps, and DeFi protocols can leverage iQube's risk-aware data management and dynamic identity features.

**Data Portability and API Integration:** The protocol's open API layer enables integration with traditional Web2 systems, facilitating data migration and hybrid deployments. AI agents from Web2 ecosystems can leverage iQubes through tokenQube-controlled access and risk-based encryption.

By adhering to these standards and interoperability frameworks, the iQube Protocol ensures that data assets remain portable, secure, and usable across diverse technology stacks, fostering a more connected and agentic AI ecosystem.`,
    section: 'Standards Compliance',
    category: 'technical',
    keywords: ['W3C DID/VC', 'LayerZero', 'EVM compatibility', 'interoperability', 'API integration', 'data portability'],
    timestamp: new Date().toISOString(),
    source: 'iQube Whitepaper v0.1'
  },
  {
    id: 'iqube-comparative-edge-use-cases',
    title: 'iQube Comparative Edge & Use Cases',
    content: `The iQube Protocol stands out in the decentralized AI and data ecosystem by offering advanced risk quantification, dynamic encryption, composable identity management, and Bitcoin-native information primitives with satoshi-backed token-gated access.

**Comparative Edge:** Unlike traditional data tokens that focus solely on static asset ownership or provenance, iQubes integrate dynamic risk scoring, Proof-of-Risk, and Proof-of-Price frameworks, ensuring that data quality, usage context, and risk factors are continuously evaluated. iQubes also incorporate Bitcoin-native information primitives entangled with satoshi-backed tokenQubes.

**Compliance and Standards:** The iQube Protocol is compatible with key decentralized frameworks including the Model Context Protocol (MCP), Agent Context Protocol (ACP), and Agent-to-Agent (A2A) frameworks. It also supports FIPS 203 quantum resistance standards, ensuring future-proof encryption and secure data sharing.

**Healthcare AI:** In healthcare, iQubes containerize medical records with dynamic risk scoring and token-gated access using satoshi-backed tokenQubes. This ensures that sensitive health data is protected by Bitcoin-grade security and regulatory compliance, enabling AI agents to analyze patient data while preserving privacy.

**DeFi Risk Oracles:** DeFi protocols leverage iQubes to provide real-time, risk-adjusted, and cryptographically verifiable data feeds. Satoshi entanglement ensures tamper-resistance, while tokenQubes manage access to sensitive financial data based on dynamic risk scoring.

**Spatial Agents:** In spatial computing, iQubes manage user-generated content and digital twins with Bitcoin-native security primitives. AI agents can retrieve data with verified provenance and dynamic risk profiles, ensuring secure and auditable spatial experiences.

By supporting Bitcoin-native primitives, satoshi-backed token gating, and full regulatory compliance, the iQube Protocol empowers the next generation of agentic AI applications.`,
    section: 'Use Cases',
    category: 'implementation',
    keywords: ['competitive advantage', 'healthcare AI', 'DeFi oracles', 'spatial agents', 'MCP compatibility', 'FIPS 203', 'regulatory compliance'],
    timestamp: new Date().toISOString(),
    source: 'iQube Whitepaper v0.1'
  },
  {
    id: 'iqube-roadmap-governance',
    title: 'iQube Roadmap & Governance Framework',
    content: `The iQube Protocol's development roadmap is structured to ensure iterative growth, community participation, and compliance with regulatory frameworks, while maintaining the protocol's decentralized ethos.

**Development Milestones:**
- **Phase 1 (Completed):** Core protocol design, cryptographic primitives implementation (metaQubes, blakQubes, tokenQubes), dual-network architecture, and risk quantification pipeline.
- **Phase 2 (In Progress):** Integration of Proof-of-Risk, Proof-of-Price, and Proof-of-State consensus mechanisms, and COYN economic layer including QryptoCOYN and QryptoCENT micro-stable coin systems.
- **Phase 3:** MCP, ACP, and A2A framework integration, enhanced regulatory compliance, and support for quantum-resistant encryption standards.
- **Phase 4:** Full AI agent orchestration with Aigent Protocol stack, developer SDKs, and expanded EVM compatibility.

**Open-Source Cadence:** The protocol follows a transparent, open-source development approach. Key updates, smart contract libraries, and tooling are released on public repositories, ensuring that the community can audit, contribute, and innovate on top of the protocol.

**Treasury Allocation and Governance:** A decentralized governance structure oversees the allocation of funds from the COYN and QryptoCENT reserves. The treasury funds protocol upgrades, risk audits, regulatory compliance initiatives, and community-driven improvements.

**Compliance Roadmap:** Ongoing updates to align with global regulatory standards (GDPR, HIPAA, CCPA, ISO, IEEE) and support for future compliance frameworks. Regular third-party audits verify adherence to security, privacy, and risk management best practices.`,
    section: 'Development Timeline',
    category: 'implementation',
    keywords: ['development roadmap', 'governance framework', 'open-source', 'treasury allocation', 'regulatory compliance', 'third-party audits'],
    timestamp: new Date().toISOString(),
    source: 'iQube Whitepaper v0.1'
  }
];
