import React, { useEffect, useRef, useState } from 'react';
import { cn } from '@/lib/utils';
import { iframeSessionManager } from '@/services/iframe-session-manager';
import { useIsMobile } from '@/hooks/use-mobile';

interface GlobalMediaIframeProps {
  isVisible: boolean;
}

const GlobalMediaIframe: React.FC<GlobalMediaIframeProps> = ({ isVisible }) => {
  const isMobile = useIsMobile();
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [sessionRecovering, setSessionRecovering] = useState(false);

  // Setup iframe ref with session manager
  useEffect(() => {
    if (iframeRef.current) {
      iframeSessionManager.setIframeRef(iframeRef.current);
      
      // Request auth state if we think we have session
      if (iframeSessionManager.hasAuthState() && isVisible) {
        setSessionRecovering(true);
        setTimeout(() => {
          iframeSessionManager.requestAuthState();
          setSessionRecovering(false);
        }, 2000);
      }
    }
  }, [isVisible]);

  // Only render if media has been initialized
  if (!iframeSessionManager.isMediaInitialized()) {
    return null;
  }

  return (
    <div 
      className={cn(
        "fixed inset-0 z-50 bg-background",
        isVisible ? 'block' : 'hidden'
      )}
      style={{ 
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        padding: isMobile ? '0' : '1rem'
      }}
    >
      <div className="h-full w-full relative">
        {sessionRecovering && (
          <div className="absolute inset-0 bg-background/80 flex items-center justify-center z-20">
            <div className="text-sm text-muted-foreground">Restoring session...</div>
          </div>
        )}
        <iframe 
          ref={iframeRef}
          src="https://www.sizzleperks.com/embed/hqusgMObjXJ9" 
          width="100%" 
          height="100%" 
          allow="camera; microphone; display-capture; fullscreen"
          allowFullScreen
          style={{
            height: isMobile ? '120vh' : '100vh',
            maxHeight: '100%',
            width: '100%',
            maxWidth: '100%',
            border: 'none',
            outline: 'none'
          }}
          className="border-0"
        />
      </div>
    </div>
  );
};

export default GlobalMediaIframe;