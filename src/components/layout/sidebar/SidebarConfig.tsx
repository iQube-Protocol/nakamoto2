
import React from 'react';
import { 
  Bot,
  BookOpen, 
  DollarSign, 
  Users, 
  Settings, 
  User,
  Cube,
  Wrench,
  Database
} from 'lucide-react';

export interface SidebarItem {
  id: string;
  label: string;
  icon: React.ComponentType<any>;
  href: string;
  description?: string;
}

export interface SidebarSection {
  id: string;
  label: string;
  items: SidebarItem[];
}

// Simplified sidebar configuration for MonDAI Lite
export const sidebarConfig: SidebarSection[] = [
  {
    id: 'main',
    label: 'Main',
    items: [
      {
        id: 'mondai',
        label: 'MonDAI',
        icon: Bot,
        href: '/mondai',
        description: 'AI Assistant'
      },
      {
        id: 'learn',
        label: 'Learn',
        icon: BookOpen,
        href: '/learn',
        description: 'Educational content and AI tutoring'
      },
      {
        id: 'earn',
        label: 'Earn',
        icon: DollarSign,
        href: '/earn',
        description: 'Token rewards and earning opportunities'
      },
      {
        id: 'connect',
        label: 'Connect',
        icon: Users,
        href: '/connect',
        description: 'Community networking and connections'
      }
    ]
  },
  {
    id: 'iqubes',
    label: 'iQubes',
    items: [
      {
        id: 'agent-qube',
        label: 'Agent Qube',
        icon: Cube,
        href: '/qubes/agent',
        description: 'Agent configuration and management'
      },
      {
        id: 'tool-qube',
        label: 'Tool Qube',
        icon: Wrench,
        href: '/qubes/tool',
        description: 'Tool integration and utilities'
      },
      {
        id: 'data-qube',
        label: 'Data Qube',
        icon: Database,
        href: '/qubes/data',
        description: 'Data management and storage'
      }
    ]
  },
  {
    id: 'account',
    label: 'Account',
    items: [
      {
        id: 'profile',
        label: 'Profile',
        icon: User,
        href: '/profile',
        description: 'User profile and preferences'
      },
      {
        id: 'settings',
        label: 'Settings',
        icon: Settings,
        href: '/settings',
        description: 'Application settings and configuration'
      }
    ]
  }
];

export const getSidebarItemById = (id: string): SidebarItem | undefined => {
  for (const section of sidebarConfig) {
    const item = section.items.find(item => item.id === id);
    if (item) return item;
  }
  return undefined;
};
