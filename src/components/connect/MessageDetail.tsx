
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Message, DetailProps } from './types';
import DetailHeader from './DetailHeader';
import { getInitials, getRandomColorClass, formatDate } from './utils/connectUtils';

interface MessageDetailProps extends DetailProps {
  message: Message;
}

const MessageDetail: React.FC<MessageDetailProps> = ({
  message,
  currentIndex,
  totalItems,
  onNext,
  onPrev
}) => {
  return (
    <Card className="h-full">
      <DetailHeader 
        title="Message" 
        currentIndex={currentIndex}
        totalItems={totalItems}
        onNext={onNext}
        onPrev={onPrev}
      />
      <CardContent className="pt-4">
        <div>
          <div className="flex items-center mb-4">
            <Avatar className="h-12 w-12 mr-3">
              <AvatarFallback className={getRandomColorClass(message.id)}>
                {getInitials(message.sender)}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <h3 className="font-medium flex items-center">
                {message.sender}
                {message.unread && <Badge className="ml-2 px-1 py-0 h-4 bg-iqube-accent text-[10px]">New</Badge>}
              </h3>
              <p className="text-xs text-muted-foreground">{formatDate(message.timestamp)}</p>
            </div>
          </div>
          <Card className="p-3 bg-muted/30 mb-4">
            <p className="text-sm">{message.content}</p>
          </Card>
          <div className="flex justify-between mt-auto pt-4">
            <Button size="sm" variant="outline" className="flex-1 mr-2">
              Mark {message.unread ? 'Read' : 'Unread'}
            </Button>
            <Button size="sm" className="flex-1 bg-iqube-primary hover:bg-iqube-primary/90">
              Reply
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default MessageDetail;
