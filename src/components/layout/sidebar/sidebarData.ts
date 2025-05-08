
import { LucideIcon, LayoutDashboard, Database, Cube, Settings, FolderGit2 } from 'lucide-react';

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
    icon: Database,
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
    href: '/qubes/dataqube',
    description: 'Explore your personal data insights',
  },
  {
    id: 'agentqube',
    name: 'Metis',
    type: 'AgentQube',
    icon: Cube,
    href: '/qubes/agentqube',
    description: 'Your AI assistant for learning',
  },
  {
    id: 'toolqube',
    name: 'GDrive',
    type: 'ToolQube',
    icon: FolderGit2,
    href: '/qubes/toolqube',
    description: 'Connect your tools and resources',
  },
];

export const monDaiQubeData = {
  id: 'mondai',
  name: 'MonDAI iQube',
  type: 'Personal Data',
  href: '/iqubes/mondai',
  active: true
};

export const metisQubeData = {
  id: 'metis',
  name: 'Metis AI',
  type: 'Assistant',
  href: '/iqubes/metis',
};
