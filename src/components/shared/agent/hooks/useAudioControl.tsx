
import { useState } from 'react';

/**
 * Hook to handle audio playback control in the agent interface
 */
export const useAudioControl = () => {
  const [playing, setPlaying] = useState<string | null>(null);
  
  const handlePlayAudio = (messageId: string) => {
    if (playing === messageId) {
      setPlaying(null);
    } else {
      setPlaying(messageId);
      setTimeout(() => {
        if (playing === messageId) {
          setPlaying(null);
        }
      }, 5000);
    }
  };
  
  return {
    playing,
    setPlaying,
    handlePlayAudio
  };
};
