
import React from 'react';
import { Play, Pause, Volume2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface AudioPlaybackProps {
  isPlaying: boolean;
  messageId: string;
  onPlayAudio: (messageId: string) => void;
}

const AudioPlayback = ({ isPlaying, messageId, onPlayAudio }: AudioPlaybackProps) => {
  return (
    <>
      <Button
        variant="ghost"
        size="sm"
        className="h-6 w-6 p-0"
        onClick={() => onPlayAudio(messageId)}
      >
        {isPlaying ? (
          <Pause className="h-3 w-3" />
        ) : (
          <Play className="h-3 w-3" />
        )}
      </Button>
      
      {isPlaying && (
        <div className="flex items-center gap-2 mt-1">
          <div className="flex-1">
            <div className="relative h-1.5 bg-muted rounded-full overflow-hidden">
              <div className="absolute inset-y-0 left-0 bg-iqube-primary rounded-full animate-pulse" style={{ width: '50%' }}></div>
            </div>
            <div className="flex justify-between mt-1">
              <span className="text-[10px] text-muted-foreground">0:02</span>
              <span className="text-[10px] text-muted-foreground">0:05</span>
            </div>
          </div>
          <Volume2 className="h-3 w-3 text-muted-foreground" />
        </div>
      )}
    </>
  );
};

export default AudioPlayback;
