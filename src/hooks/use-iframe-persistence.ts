import { useEffect, useRef, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import { iframeRegistry } from '@/services/iframe-registry';
import { iframeSessionManager } from '@/services/iframe-session-manager';

interface UseIframePersistenceOptions {
  iframeId: string;
  src: string;
  onIframeReady?: (iframe: HTMLIFrameElement) => void;
}

export function useIframePersistence({ iframeId, src, onIframeReady }: UseIframePersistenceOptions) {
  const containerRef = useRef<HTMLDivElement>(null);
  const iframeRef = useRef<HTMLIFrameElement | null>(null);
  const location = useLocation();
  const isInitializedRef = useRef(false);

  // Create or restore iframe
  const initializeIframe = useCallback(() => {
    if (!containerRef.current) return;

    // Try to restore existing iframe first
    const existingIframe = iframeRegistry.getIframe(iframeId);
    
    if (existingIframe) {
      console.log(`useIframePersistence: Restoring existing iframe ${iframeId}`);
      const restored = iframeRegistry.restoreIframe(iframeId, containerRef.current);
      if (restored) {
        iframeRef.current = restored;
        iframeSessionManager.setIframeRef(restored);
        onIframeReady?.(restored);
        return;
      }
    }

    // Create new iframe if none exists
    console.log(`useIframePersistence: Creating new iframe ${iframeId}`);
    const iframe = document.createElement('iframe');
    iframe.src = src;
    iframe.className = 'w-full h-full border-0';
    iframe.allow = 'camera; microphone; clipboard-read; clipboard-write; web-share';
    iframe.setAttribute('sandbox', 'allow-same-origin allow-scripts allow-forms allow-popups allow-popups-to-escape-sandbox allow-presentation');

    // Handle iframe load
    iframe.onload = () => {
      console.log(`useIframePersistence: Iframe ${iframeId} loaded`);
      iframeSessionManager.setIframeRef(iframe);
      onIframeReady?.(iframe);
    };

    containerRef.current.appendChild(iframe);
    iframeRef.current = iframe;
  }, [iframeId, src, onIframeReady]);

  // Preserve iframe before component unmounts
  const preserveIframe = useCallback(() => {
    if (iframeRef.current) {
      console.log(`useIframePersistence: Preserving iframe ${iframeId} before unmount`);
      iframeRegistry.preserveIframe(iframeId, iframeRef.current);
    }
  }, [iframeId]);

  // Initialize iframe when component mounts
  useEffect(() => {
    if (!isInitializedRef.current) {
      initializeIframe();
      isInitializedRef.current = true;
    }
  }, [initializeIframe]);

  // Preserve iframe before route changes
  useEffect(() => {
    return () => {
      preserveIframe();
    };
  }, [location.pathname, preserveIframe]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (iframeRef.current && !iframeRegistry.hasIframe(iframeId)) {
        // Only remove if not preserved
        iframeSessionManager.setIframeRef(null);
      }
    };
  }, [iframeId]);

  return {
    containerRef,
    iframe: iframeRef.current,
    isRestored: iframeRegistry.hasIframe(iframeId)
  };
}