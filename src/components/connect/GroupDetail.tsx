
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Users } from 'lucide-react';
import { Group, DetailProps } from './types';
import DetailHeader from './DetailHeader';

interface GroupDetailProps extends DetailProps {
  group: Group;
}

const GroupDetail: React.FC<GroupDetailProps> = ({
  group,
  currentIndex,
  totalItems,
  onNext,
  onPrev
}) => {
  return (
    <Card className="h-full">
      <DetailHeader 
        title="Group" 
        currentIndex={currentIndex}
        totalItems={totalItems}
        onNext={onNext}
        onPrev={onPrev}
      />
      <CardContent className="pt-4">
        <div>
          <div className="bg-iqube-primary/20 w-12 h-12 rounded-full flex items-center justify-center mb-4">
            <Users className="h-6 w-6 text-iqube-primary" />
          </div>
          <h3 className="font-semibold mb-1">{group.name}</h3>
          <div className="flex items-center text-sm text-muted-foreground mb-3">
            <Users className="h-4 w-4 mr-1" />
            {group.members} members
          </div>
          <div className="flex items-center text-sm mb-4">
            <div 
              className={`w-2 h-2 rounded-full mr-2 ${
                group.activity === 'High' ? 'bg-green-500' :
                group.activity === 'Medium' ? 'bg-amber-500' :
                'bg-gray-400'
              }`}
            ></div>
            <span className="text-muted-foreground">
              {group.activity} activity
            </span>
          </div>
          <Button 
            variant={group.id % 2 === 0 ? "outline" : "default"} 
            className={`w-full ${
              group.id % 2 !== 0 ? "bg-iqube-primary hover:bg-iqube-primary/90" : ""
            }`}
          >
            {group.id % 2 === 0 ? "Leave Group" : "Join Group"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default GroupDetail;
