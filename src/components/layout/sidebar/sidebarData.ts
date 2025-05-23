
import { LucideIcon, LayoutDashboard, Database, Settings, FolderGit2, Bot, User } from 'lucide-react';
import CubeIcon from '../sidebar/CubeIcon';

export interface NavItem {
  name: string;
  href: string;
  icon: LucideIcon;
  active?: boolean;
}

export const navItems: NavItem[] = [
  {
    name: 'Dashboard',
    href: '/dashboard',
    icon: LayoutDashboard,
  },
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
    href: '/mondai',
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
  {
    id: 'toolqube',
    name: 'GDrive',
    type: 'ToolQube',
    icon: FolderGit2,
    href: '/settings',
    description: 'Connect your tools and resources',
  },
];

export const monDaiQubeData = {
  id: 'mondai',
  name: 'MonDAI iQube',
  type: 'Personal Data',
  href: '/mondai',
  active: true
};

export const metisQubeData = {
  id: 'metis',
  name: 'Metis AI',
  type: 'Assistant',
  href: '/settings',
};

