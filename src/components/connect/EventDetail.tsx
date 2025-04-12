
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar, MapPin, Users } from 'lucide-react';
import { Event, DetailProps } from './types';
import DetailHeader from './DetailHeader';
import { formatDate } from './utils/connectUtils';

interface EventDetailProps extends DetailProps {
  event: Event;
}

const EventDetail: React.FC<EventDetailProps> = ({
  event,
  currentIndex,
  totalItems,
  onNext,
  onPrev
}) => {
  return (
    <Card className="h-full">
      <DetailHeader 
        title="Event" 
        currentIndex={currentIndex}
        totalItems={totalItems}
        onNext={onNext}
        onPrev={onPrev}
      />
      <CardContent className="pt-4">
        <div>
          <div className="h-32 bg-gradient-to-r from-iqube-primary/30 to-iqube-accent/30 flex items-center justify-center">
            <Calendar className="h-12 w-12 text-iqube-primary" />
          </div>
          <div className="mt-4">
            <h3 className="font-semibold mb-1">{event.title}</h3>
            <div className="flex items-center text-sm text-muted-foreground mb-3">
              <Calendar className="h-4 w-4 mr-1" />
              {formatDate(event.date)}
            </div>
            <div className="flex justify-between items-center">
              <div className="flex items-center text-sm text-muted-foreground">
                <MapPin className="h-4 w-4 mr-1" />
                {event.location}
              </div>
              <div className="flex items-center text-sm text-muted-foreground">
                <Users className="h-4 w-4 mr-1" />
                {event.attendees}
              </div>
            </div>
            <Button className="w-full mt-4 bg-iqube-primary hover:bg-iqube-primary/90">
              RSVP
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default EventDetail;
