
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
    name: 'MonDAI',
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
    name: 'MonDAI',
    type: 'DataQube',
    icon: Database,
    href: '/settings',
    description: 'Community agent',
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

export const monDaiQubeData = {
  id: 'mondai',
  name: 'MonDAI iQube',
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
