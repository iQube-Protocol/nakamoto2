
import { Home, GraduationCap, TrendingUp, Users, User, Mic, Settings, Wrench, Database, Bot, FolderGit2 } from 'lucide-react';

export interface NavItem {
  id: string;
  label: string;
  href: string;
  icon: any;
  disabled?: boolean;
}

export interface QubeItem {
  id: string;
  name: string;
  type: 'DataQube' | 'AgentQube' | 'ToolQube';
  icon: any;
  disabled?: boolean;
}

export const mainNavItems: NavItem[] = [
  {
    id: 'dashboard',
    label: 'Dashboard',
    href: '/',
    icon: Home,
  },
  {
    id: 'learn',
    label: 'Learn',
    href: '/learn',
    icon: GraduationCap,
  },
  {
    id: 'earn',
    label: 'Earn',
    href: '/earn',
    icon: TrendingUp,
  },
  {
    id: 'connect',
    label: 'Connect',
    href: '/connect',
    icon: Users,
  },
  {
    id: 'mondai',
    label: 'MonDAI',
    href: '/mondai',
    icon: Mic,
  },
];

export const iQubeItems: QubeItem[] = [
  {
    id: 'qrypto-persona',
    name: 'Qrypto Persona',
    type: 'DataQube',
    icon: Database,
  },
  {
    id: 'metis',
    name: 'Metis',
    type: 'AgentQube',
    icon: Bot,
  },
  {
    id: 'gdrive',
    name: 'GDrive',
    type: 'ToolQube',
    icon: FolderGit2,
  },
];

export const settingsNavItem: NavItem = {
  id: 'settings',
  label: 'Settings',
  href: '/settings',
  icon: Settings,
};
