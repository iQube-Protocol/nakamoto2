import React, { useState, useEffect, useRef, useCallback } from 'react';
import MermaidDiagramSafe from '@/components/shared/agent/message/MermaidDiagramSafe';
import NavigationGuard from '@/utils/NavigationGuard';

interface ProfileMermaidCoordinatorProps {
  content: string;
  messageId: string;
  sender: 'user' | 'agent';
}

/**
 * Coordinates Mermaid diagram rendering for Profile page
 * Implements sequential rendering and intersection observer for performance
 */
const ProfileMermaidCoordinator: React.FC<ProfileMermaidCoordinatorProps> = ({
  content,
  messageId,
  sender
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [shouldRender, setShouldRender] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);

  // Extract Mermaid diagrams from content
  const mermaidDiagrams = React.useMemo(() => {
    const mermaidRegex = /```mermaid\n([\s\S]*?)\n```/g;
    const diagrams: Array<{ code: string; index: number }> = [];
    let match;
    
    while ((match = mermaidRegex.exec(content)) !== null) {
      diagrams.push({
        code: match[1].trim(),
        index: match.index
      });
    }
    
    return diagrams;
  }, [content]);

  // Initialize intersection observer for lazy loading
  useEffect(() => {
    if (!containerRef.current) return;

    observerRef.current = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsVisible(true);
            observerRef.current?.disconnect();
          }
        });
      },
      {
        rootMargin: '100px', // Start loading 100px before visible
        threshold: 0.1
      }
    );

    observerRef.current.observe(containerRef.current);

    return () => {
      observerRef.current?.disconnect();
    };
  }, []);

  // Control rendering based on navigation state and visibility
  useEffect(() => {
    if (!isVisible) return;

    const checkRenderConditions = () => {
      const isNavigating = NavigationGuard.isNavigationInProgress();
      
      if (!isNavigating && isVisible) {
        setShouldRender(true);
      } else if (isNavigating) {
        setShouldRender(false);
      }
    };

    // Initial check
    checkRenderConditions();

    // Recheck periodically during navigation
    const interval = setInterval(checkRenderConditions, 100);

    return () => clearInterval(interval);
  }, [isVisible]);

  // Process content with diagrams
  const processContentWithDiagrams = useCallback(() => {
    if (!shouldRender || mermaidDiagrams.length === 0) {
      // Return content with placeholder for diagrams
      return content.replace(/```mermaid\n[\s\S]*?\n```/g, '[Diagram - Loading...]');
    }

    let processedContent = content;
    let offset = 0;

    mermaidDiagrams.forEach((diagram, index) => {
      const diagramId = `${messageId}_diagram_${index}`;
      const placeholder = `<div class="mermaid-placeholder" data-diagram-id="${diagramId}"></div>`;
      
      const mermaidBlock = `\`\`\`mermaid\n${diagram.code}\n\`\`\``;
      const startIndex = diagram.index + offset;
      const endIndex = startIndex + mermaidBlock.length;
      
      processedContent = 
        processedContent.slice(0, startIndex) +
        placeholder +
        processedContent.slice(endIndex);
      
      offset += placeholder.length - mermaidBlock.length;
    });

    return processedContent;
  }, [content, mermaidDiagrams, messageId, shouldRender]);

  // Render diagrams separately for better control
  const renderDiagrams = () => {
    if (!shouldRender) return null;

    return mermaidDiagrams.map((diagram, index) => {
      const diagramId = `${messageId}_diagram_${index}`;
      
      return (
        <div key={diagramId} className="profile-mermaid-wrapper mb-4">
          <MermaidDiagramSafe
            code={diagram.code}
            id={diagramId}
          />
        </div>
      );
    });
  };

  return (
    <div ref={containerRef} className="profile-mermaid-coordinator">
      {/* Render processed content */}
      <div 
        className="message-content"
        dangerouslySetInnerHTML={{ 
          __html: processContentWithDiagrams()
            .replace(/\n/g, '<br/>')
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
        }}
      />
      
      {/* Render diagrams separately */}
      {renderDiagrams()}
      
      {/* Loading indicator */}
      {isVisible && !shouldRender && mermaidDiagrams.length > 0 && (
        <div className="profile-mermaid-loading">
          <div className="text-sm text-muted-foreground">
            Loading {mermaidDiagrams.length} diagram{mermaidDiagrams.length !== 1 ? 's' : ''}...
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfileMermaidCoordinator;