
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Member, DetailProps } from './types';
import DetailHeader from './DetailHeader';
import { getInitials, getRandomColorClass } from './utils/connectUtils';

interface MemberDetailProps extends DetailProps {
  member: Member;
}

const MemberDetail: React.FC<MemberDetailProps> = ({
  member,
  currentIndex,
  totalItems,
  onNext,
  onPrev
}) => {
  return (
    <Card className="h-full">
      <DetailHeader 
        title="Community Member" 
        currentIndex={currentIndex}
        totalItems={totalItems}
        onNext={onNext}
        onPrev={onPrev}
      />
      <CardContent className="pt-4">
        <div className="flex flex-col">
          <div className="flex items-center mb-4">
            <Avatar className="h-12 w-12 mr-3">
              <AvatarImage src={member.avatar} />
              <AvatarFallback className={getRandomColorClass(member.id)}>
                {getInitials(member.name)}
              </AvatarFallback>
            </Avatar>
            <div>
              <h3 className="font-medium">{member.name}</h3>
              <p className="text-sm text-muted-foreground">{member.role}</p>
            </div>
          </div>
          <div className="mb-4">
            <h4 className="text-sm font-medium mb-2">Interests</h4>
            <div className="flex flex-wrap gap-2">
              {member.interests.map((interest, i) => (
                <Badge key={i} variant="outline" className="bg-iqube-primary/5">
                  {interest}
                </Badge>
              ))}
            </div>
          </div>
          <div className="flex space-x-2 mt-auto pt-4">
            <Button size="sm" className="flex-1 bg-iqube-primary hover:bg-iqube-primary/90">
              Connect
            </Button>
            <Button size="sm" variant="outline" className="flex-1">
              Message
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default MemberDetail;
