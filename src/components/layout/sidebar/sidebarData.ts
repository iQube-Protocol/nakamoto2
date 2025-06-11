
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
