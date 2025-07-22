
import React from 'react';
import { AgentMessage } from '@/lib/types';
import MessageItemMemo from './message/MessageItemMemo';

interface MessageItemProps {
  message: AgentMessage;
  isPlaying?: boolean;
  onPlayAudio?: (messageId: string) => void;
}

const MessageItem: React.FC<MessageItemProps> = (props) => {
  return <MessageItemMemo {...props} />;
};

export default MessageItem;
