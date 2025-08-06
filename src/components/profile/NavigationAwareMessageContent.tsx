import React, { useState, useEffect, useRef } from 'react';
import MessageContent from '@/components/shared/agent/message/MessageContent';
import ProfileMermaidCoordinator from './ProfileMermaidCoordinator';
import NavigationGuard from '@/utils/NavigationGuard';

interface NavigationAwareMessageContentProps {
  content: string;
  sender: 'user' | 'agent';
  messageId?: string;
  maxLength?: number;
  showPreview?: boolean;
}

const NavigationAwareMessageContent: React.FC<NavigationAwareMessageContentProps> = ({
  content,
  sender,
  messageId = 'unknown',
  maxLength = 200,
  showPreview = true
}) => {
  const [shouldRenderMermaid, setShouldRenderMermaid] = useState(false);
  const [displayContent, setDisplayContent] = useState('');
  const mountedRef = useRef(true);

  useEffect(() => {
    NavigationGuard.init();
    
    return () => {
      mountedRef.current = false;
    };
  }, []);

  useEffect(() => {
    // Defer complex content rendering during navigation
    const renderContent = () => {
      if (!mountedRef.current) return;

      const isNavigating = NavigationGuard.isNavigationInProgress();
      const hasMermaid = content.includes('```mermaid');
      
      if (isNavigating && hasMermaid) {
        // During navigation, show simplified content without mermaid
        const simplifiedContent = content.replace(/```mermaid[\s\S]*?```/g, '[Diagram - Loading...]');
        setDisplayContent(showPreview && simplifiedContent.length > maxLength 
          ? simplifiedContent.substring(0, maxLength) + '...'
          : simplifiedContent
        );
        setShouldRenderMermaid(false);
      } else {
        // Normal rendering when navigation is complete
        setDisplayContent(showPreview && content.length > maxLength 
          ? content.substring(0, maxLength) + '...'
          : content
        );
        setShouldRenderMermaid(!isNavigating);
      }
    };

    // Initial render
    renderContent();

    // Re-render after navigation completes
    const navigationCheckInterval = setInterval(() => {
      if (!NavigationGuard.isNavigationInProgress() && !shouldRenderMermaid && content.includes('```mermaid')) {
        renderContent();
        clearInterval(navigationCheckInterval);
      }
    }, 100);

    return () => clearInterval(navigationCheckInterval);
  }, [content, maxLength, showPreview, shouldRenderMermaid]);

  // Check if content has Mermaid diagrams
  const hasMermaidDiagrams = content.includes('```mermaid');

  return (
    <div className="navigation-aware-content">
      {hasMermaidDiagrams ? (
        <ProfileMermaidCoordinator
          content={displayContent}
          messageId={messageId}
          sender={sender}
        />
      ) : (
        <MessageContent 
          content={displayContent} 
          sender={sender}
        />
      )}
    </div>
  );
};

export default NavigationAwareMessageContent;