
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

  useEffect(() => {
    if (!containerRef.current) return;
    
    const renderDiagram = async () => {
      setIsLoading(true);
      setError(null);

      try {
        if (!containerRef.current) return;
        
        const uniqueId = `mermaid-${id}-${Math.random().toString(36).substring(2, 11)}`;
        
        // Clean up the mermaid code
        const cleanCode = processCode(currentCode);
        
        console.log(`Attempting to render mermaid diagram with ID ${uniqueId}:`, cleanCode);
        
        const svg = await renderMermaidDiagram(cleanCode, uniqueId);
        
        // Only update if component is still mounted
        if (containerRef.current) {
          containerRef.current.innerHTML = svg;
          console.log('Diagram rendered successfully');
        }
      } catch (err) {
        console.error('Mermaid error:', err);
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
    };
  }, [currentCode, id]);

  const handleRetry = (codeToRender: string) => {
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
        
        {!isLoading && error && (
          <DiagramErrorHandler 
            error={error}
            code={currentCode}
            id={id}
            onRetry={handleRetry}
          />
        )}
      </div>
    </div>
  );
};

export default MermaidDiagram;
