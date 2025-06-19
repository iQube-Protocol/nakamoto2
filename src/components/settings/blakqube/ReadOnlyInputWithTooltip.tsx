
import React from 'react';
import { Input } from '@/components/ui/input';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Lock } from 'lucide-react';

interface ReadOnlyInputWithTooltipProps {
  value: string;
  className?: string;
}

const ReadOnlyInputWithTooltip = ({ value, className }: ReadOnlyInputWithTooltipProps) => {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="relative">
            <Input
              value={value}
              readOnly
              className={`${className} bg-gray-700 text-gray-100 cursor-not-allowed pr-8 border-gray-600`}
            />
            <Lock className="absolute right-2 top-1/2 transform -translate-y-1/2 h-3 w-3 text-gray-400" />
          </div>
        </TooltipTrigger>
        <TooltipContent>
          <p>This field is read-only</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

export default ReadOnlyInputWithTooltip;
