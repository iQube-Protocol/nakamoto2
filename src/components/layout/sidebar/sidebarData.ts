
import { LucideIcon, Database, Settings, FolderGit2, Bot, User, Brain } from 'lucide-react';
import CubeIcon from '../sidebar/CubeIcon';

export interface NavItem {
  name: string;
  href: string;
  icon: LucideIcon;
  active?: boolean;
}

export const navItems: NavItem[] = [
  {
    name: 'Nakamoto',
    href: '/aigent',
    icon: Bot,
  },
  {
    name: 'Settings',
    href: '/settings',
    icon: Settings,
  },
];

export interface QubeItem {
  id: string;
  name: string;
  type: string; 
  icon: LucideIcon;
  href: string;
  description: string;
  active?: boolean;
}

export const iQubeItems: QubeItem[] = [
  {
    id: 'openai',
    name: 'OpenAI',
    type: 'ModelQube',
    icon: Brain,
    href: '/settings',
    description: 'Advanced AI language models for sophisticated reasoning',
  },
  {
    id: 'venice',
    name: 'Venice',
    type: 'ModelQube',
    icon: Brain,
    href: '/settings',
    description: 'AI service that protects privacy and prevents censorship',
  },
  {
    id: 'chaingpt',
    name: 'ChainGPT',
    type: 'ModelQube',
    icon: Brain,
    href: '/settings',
    description: 'Crypto-native AI specialized for blockchain and DeFi',
  },
  // Metis temporarily hidden - uncomment to reactivate
  // {
  //   id: 'agentqube',
  //   name: 'Metis',
  //   type: 'AgentQube',
  //   icon: Bot,
  //   href: '/settings',
  //   description: 'Your AI assistant for learning',
  // },
];

export const personaItems: QubeItem[] = [
  {
    id: 'dataqube',
    name: 'Qripto Persona',
    type: 'DataQube',
    icon: Database,
    href: '/profile',
    description: 'Cryptocurrency AI agent',
  },
  {
    id: 'knytpersona',
    name: 'KNYT Persona',
    type: 'DataQube',
    icon: Database,
    href: '/profile',
    description: 'KNYT ecosystem profile with 2,800 Satoshi reward',
  },
];

export const nakamotoQubeData = {
  id: 'nakamoto',
  name: 'Qripto Persona iQube',
  type: 'Personal Data',
  href: '/settings',
  active: true
};


export const veniceQubeData = {
  id: 'venice',
  name: 'Venice AI',
  type: 'Privacy Agent',
  href: '/settings',
};

export const metaQubesData = [
  {
    id: "Qripto Persona",
    name: "Qripto Persona",
    type: "DataQube" as const,
    description: "Personal cryptocurrency profile and preferences data",
    color: "text-blue-400",
    bgColor: "bg-blue-500/10",
    borderColor: "border-blue-500/20"
  },
  {
    id: "KNYT Persona", 
    name: "KNYT Persona",
    type: "DataQube" as const,
    description: "KNYT ecosystem profile with 2,800 Satoshi reward",
    color: "text-purple-400",
    bgColor: "bg-purple-500/10", 
    borderColor: "border-purple-500/20"
  },
  {
    id: "Venice",
    name: "Venice", 
    type: "ModelQube" as const,
    description: "Privacy-preserving AI model service",
    color: "text-green-400",
    bgColor: "bg-green-500/10",
    borderColor: "border-green-500/20"
  },
  {
    id: "OpenAI",
    name: "OpenAI",
    type: "ModelQube" as const,
    description: "Advanced AI language models and reasoning",
    color: "text-emerald-400",
    bgColor: "bg-emerald-500/10",
    borderColor: "border-emerald-500/20"
  },
  {
    id: "ChainGPT",
    name: "ChainGPT",
    type: "ModelQube" as const,
    description: "Crypto-native AI specialized for blockchain and DeFi applications",
    color: "text-amber-400",
    bgColor: "bg-amber-500/10",
    borderColor: "border-amber-500/20"
  },
  // Metis temporarily hidden - uncomment to reactivate
  // {
  //   id: "Metis",
  //   name: "Metis",
  //   type: "AgentQube" as const, 
  //   description: "Risk evaluation algorithm for wallets and tokens",
  //   color: "text-orange-400",
  //   bgColor: "bg-orange-500/10",
  //   borderColor: "border-orange-500/20"
  // },
];
