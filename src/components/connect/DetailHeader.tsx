
import React from 'react';
import { Button } from '@/components/ui/button';
import { CardHeader, CardTitle } from '@/components/ui/card';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { DetailProps } from './types';

interface DetailHeaderProps extends DetailProps {
  title: string;
}

const DetailHeader: React.FC<DetailHeaderProps> = ({ 
  title, 
  currentIndex, 
  totalItems, 
  onPrev, 
  onNext 
}) => {
  return (
    <CardHeader className="pb-2 flex flex-row items-center justify-between">
      <CardTitle className="text-lg">{title}</CardTitle>
      <div className="flex items-center space-x-2">
        <Button 
          variant="outline" 
          size="icon" 
          className="h-8 w-8" 
          onClick={onPrev}
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <span className="text-sm font-medium">{currentIndex + 1}/{totalItems}</span>
        <Button 
          variant="outline" 
          size="icon" 
          className="h-8 w-8" 
          onClick={onNext}
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </CardHeader>
  );
};

export default DetailHeader;
