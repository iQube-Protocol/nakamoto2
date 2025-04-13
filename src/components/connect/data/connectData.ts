
import { Member, Group, Event, Message } from '../types';

export const members: Member[] = [
  { id: 1, name: 'Alex Chen', role: 'Developer', avatar: '', interests: ['DeFi', 'Smart Contracts'], type: 'member' },
  { id: 2, name: 'Mia Wong', role: 'Designer', avatar: '', interests: ['NFTs', 'DAO'], type: 'member' },
  { id: 3, name: 'Sam Johnson', role: 'Product', avatar: '', interests: ['DeFi', 'Governance'], type: 'member' },
  { id: 4, name: 'Jamie Smith', role: 'Researcher', avatar: '', interests: ['Privacy', 'Zero Knowledge'], type: 'member' },
  { id: 5, name: 'Taylor Kim', role: 'Educator', avatar: '', interests: ['Education', 'Onboarding'], type: 'member' },
];

export const events: Event[] = [
  { 
    id: 1, 
    title: 'Web3 Community Meetup', 
    date: '2025-04-15T18:00:00', 
    location: 'Virtual',
    attendees: 42,
    type: 'event'
  },
  { 
    id: 2, 
    title: 'NFT Showcase', 
    date: '2025-04-20T15:00:00', 
    location: 'New York',
    attendees: 75,
    type: 'event'
  },
  { 
    id: 3, 
    title: 'DeFi Workshop', 
    date: '2025-04-25T10:00:00', 
    location: 'London',
    attendees: 28,
    type: 'event'
  },
];

export const groups: Group[] = [
  { id: 1, name: 'DeFi Enthusiasts', members: 120, activity: 'High', type: 'group' },
  { id: 2, name: 'NFT Creators', members: 85, activity: 'Medium', type: 'group' },
  { id: 3, name: 'DAO Governance', members: 64, activity: 'High', type: 'group' },
  { id: 4, name: 'Privacy Advocates', members: 42, activity: 'Low', type: 'group' },
];

export const messages: Message[] = [
  { id: 1, sender: 'Alex Chen', content: 'Hey! Saw your post about DeFi protocols. Would love to chat.', timestamp: '2025-04-10T14:30:00', unread: true, type: 'message' },
  { id: 2, sender: 'DAO Governance', content: 'New proposal available for voting. Check it out!', timestamp: '2025-04-09T09:15:00', unread: true, type: 'message' },
  { id: 3, sender: 'Mia Wong', content: 'Thanks for connecting! Looking forward to collaborating.', timestamp: '2025-04-08T16:45:00', unread: false, type: 'message' },
  { id: 4, sender: 'DeFi Enthusiasts', content: 'Welcome to the group! Introduce yourself.', timestamp: '2025-04-07T11:20:00', unread: false, type: 'message' },
];
