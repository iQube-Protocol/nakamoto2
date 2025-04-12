
export interface Member {
  id: number;
  name: string;
  role: string;
  avatar: string;
  interests: string[];
  type: 'member';
}

export interface Group {
  id: number;
  name: string;
  members: number;
  activity: string;
  type: 'group';
}

export interface Event {
  id: number;
  title: string;
  date: string;
  location: string;
  attendees: number;
  type: 'event';
}

export interface Message {
  id: number;
  sender: string;
  content: string;
  timestamp: string;
  unread: boolean;
  type: 'message';
}

export type ConnectItem = Member | Group | Event | Message;

export interface DetailProps {
  currentIndex: number;
  totalItems: number;
  onNext: () => void;
  onPrev: () => void;
}
