
import { KNYTKnowledgeItem } from './types';

export const knytKnowledgeData: KNYTKnowledgeItem[] = [
  {
    id: 'knyt-1',
    title: 'KNYT Persona iQube Overview',
    content: 'The KNYT Persona iQube is a comprehensive data management system that stores your KNYT ecosystem profile information. This includes your KNYT ID, OM membership details, digital asset ownership, and personal preferences within the KNYT universe.',
    category: 'KNYT Basics',
    keywords: ['KNYT', 'Persona', 'iQube', 'Profile', 'Data'],
    source: 'KNYT Documentation',
    section: 'Getting Started',
    connections: ['Profile Management', 'Data Security'],
    type: 'overview'
  },
  {
    id: 'knyt-2',
    title: 'KNYT ID and Identification',
    content: 'Your KNYT ID is a unique identifier within the KNYT ecosystem. It links your profile to all your digital assets, OM membership status, and participation in the KNYT universe. This ID is essential for tracking ownership and engagement.',
    category: 'Identity',
    keywords: ['KNYT ID', 'Identity', 'Unique Identifier', 'Profile'],
    source: 'KNYT Identity Guide',
    section: 'User Identity',
    connections: ['Profile Setup', 'Asset Tracking'],
    type: 'guide'
  },
  {
    id: 'knyt-3',
    title: 'OM Membership and Tier System',
    content: 'The OM (Original Member) system recognizes early supporters and active participants in the KNYT community. Members have different tier statuses that provide various benefits and access levels within the ecosystem.',
    category: 'Membership',
    keywords: ['OM', 'Membership', 'Tier', 'Status', 'Benefits'],
    source: 'OM Membership Guide',
    section: 'Community',
    connections: ['Community Benefits', 'Tier Progression'],
    type: 'guide'
  },
  {
    id: 'knyt-4',
    title: 'Digital Asset Management',
    content: 'KNYT Persona iQube tracks your digital assets including Metaiye Shares, $KNYT COYN, Motion Comics, Paper Comics, Digital Comics, KNYT Posters, KNYT Cards, and Character ownership. This comprehensive tracking ensures proper asset management.',
    category: 'Assets',
    keywords: ['Digital Assets', 'Comics', 'Cards', 'Shares', 'COYN'],
    source: 'Asset Management Guide',
    section: 'Digital Ownership',
    connections: ['Asset Trading', 'Ownership Verification'],
    type: 'guide'
  },
  {
    id: 'knyt-5',
    title: 'MetaKeep Integration',
    content: 'MetaKeep provides secure wallet infrastructure for KNYT assets. Your MetaKeep Public Key enables seamless integration with the KNYT ecosystem while maintaining security and ease of use.',
    category: 'Security',
    keywords: ['MetaKeep', 'Wallet', 'Security', 'Integration'],
    source: 'MetaKeep Documentation',
    section: 'Wallet Integration',
    connections: ['Wallet Security', 'Asset Management'],
    type: 'technical'
  },
  {
    id: 'knyt-6',
    title: 'Reward System - 2,800 Satoshi',
    content: 'Complete your KNYT Persona iQube by connecting LinkedIn, MetaMask wallet, and filling all profile data to earn 2,800 Satoshi (equivalent to 2 $KNYT or $2.80). This reward incentivizes complete profile creation.',
    category: 'Rewards',
    keywords: ['Rewards', 'Satoshi', 'KNYT', 'Incentives', 'Profile'],
    source: 'Reward Program',
    section: 'Incentives',
    connections: ['Profile Completion', 'Earning Opportunities'],
    type: 'reward'
  }
];
