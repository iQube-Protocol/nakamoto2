
import React, { useEffect, useRef, useState } from 'react';
import { processCode, renderMermaidDiagram } from './utils/mermaidUtils';
import DiagramErrorHandler from './DiagramErrorHandler';

interface MermaidDiagramProps {
  code: string;
  id: string;
}

const MermaidDiagram = ({ code, id }: MermaidDiagramProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [error, setError] = useState<Error | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [currentCode, setCurrentCode] = useState(code);
  const [renderAttempts, setRenderAttempts] = useState(0);

  useEffect(() => {
    if (!containerRef.current) return;
    
    const renderDiagram = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const uniqueId = `mermaid-${id}-${Math.random().toString(36).substring(2, 11)}`;
        
        // Clean up the mermaid code - with enhanced processing
        const cleanCode = processCode(currentCode);
        
        console.log(`Attempting to render mermaid diagram with ID ${uniqueId}:`, cleanCode);
        
        const svg = await renderMermaidDiagram(cleanCode, uniqueId);
        
        // Important: Check if component is still mounted before updating DOM
        if (containerRef.current) {
          // Clear the container first
          containerRef.current.innerHTML = '';
          // Then set the new content
          containerRef.current.innerHTML = svg;
          console.log('Diagram rendered successfully');
        }
      } catch (err) {
        console.error('Mermaid error:', err);
        
        // If first attempt fails, try an auto-fix
        if (renderAttempts === 0) {
          setRenderAttempts(1);
          // Don't set new code if it's the same to avoid infinite loops
          const fixedCode = processCode(currentCode);
          if (fixedCode !== currentCode) {
            console.log('Attempting auto-fix on first failure...');
            setCurrentCode(fixedCode);
            return;
          }
        }
        
        setError(err as Error);
      } finally {
        setIsLoading(false);
      }
    };

    // Add a delay to ensure DOM is fully ready and to avoid race conditions
    const timer = setTimeout(() => {
      renderDiagram();
    }, 300);
    
    return () => {
      clearTimeout(timer);
      // Important: Clean up to prevent memory leaks and DOM conflicts
      if (containerRef.current) {
        containerRef.current.innerHTML = '';
      }
    };
  }, [currentCode, id, renderAttempts]);

  const handleRetry = (codeToRender: string) => {
    // Clear any existing content first to prevent DOM conflicts
    if (containerRef.current) {
      containerRef.current.innerHTML = '';
    }
    setRenderAttempts(0); // Reset attempts counter
    setCurrentCode(codeToRender);
  };

  return (
    <div className="my-4">
      <div 
        ref={containerRef}
        id={`diagram-container-${id}`}
        className="flex justify-center overflow-x-auto p-2 bg-gray-50 rounded-md min-h-[100px]"
      >
        {isLoading && (
          <div className="text-sm text-gray-500 flex items-center">
            Loading diagram... 
            <div className="ml-2 flex space-x-1">
              <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse"></div>
              <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
              <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
            </div>
          </div>
        )}
      </div>
      
      {/* Important: Error handler is now rendered outside the container to avoid conflicts */}
      {!isLoading && error && (
        <DiagramErrorHandler 
          error={error}
          code={currentCode}
          id={id}
          onRetry={handleRetry}
        />
      )}
    </div>
  );
};

export default MermaidDiagram;
