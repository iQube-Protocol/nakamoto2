import { LucideIcon, Database, Settings, FolderGit2, Bot, User } from 'lucide-react';
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
    href: '/mondai',
    icon: Bot,
  },
  {
    name: 'Profile',
    href: '/profile',
    icon: User,
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
    id: 'dataqube',
    name: 'Qrypto Persona',
    type: 'DataQube',
    icon: Database,
    href: '/settings',
    description: 'Cryptocurrency AI agent',
  },
  {
    id: 'venice',
    name: 'Venice',
    type: 'AgentQube',
    icon: Bot,
    href: '/settings',
    description: 'AI service that protects privacy and prevents censorship',
  },
  {
    id: 'agentqube',
    name: 'Metis',
    type: 'AgentQube',
    icon: Bot,
    href: '/settings',
    description: 'Your AI assistant for learning',
  },
];

export const nakamotoQubeData = {
  id: 'nakamoto',
  name: 'Qrypto Persona iQube',
  type: 'Personal Data',
  href: '/settings',
  active: true
};

export const metisQubeData = {
  id: 'metis',
  name: 'Metis AI',
  type: 'Assistant',
  href: '/settings',
};

export const veniceQubeData = {
  id: 'venice',
  name: 'Venice AI',
  type: 'Privacy Agent',
  href: '/settings',
};

export const metaQubesData = [
  {
    id: "Qrypto Persona",
    name: "Qrypto Persona",
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
    id: "Metis",
    name: "Metis",
    type: "AgentQube" as const, 
    description: "Risk evaluation algorithm for wallets and tokens",
    color: "text-orange-400",
    bgColor: "bg-orange-500/10",
    borderColor: "border-orange-500/20"
  },
  {
    id: "GDrive",
    name: "GDrive",
    type: "DataQube" as const,
    description: "Google Drive document integration", 
    color: "text-indigo-400",
    bgColor: "bg-indigo-500/10",
    borderColor: "border-indigo-500/20"
  }
];
