
import React, { useState, useEffect, useRef } from 'react';
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
  const [showCodeView, setShowCodeView] = useState(false);

  // Clean up function to prevent memory leaks
  useEffect(() => {
    return () => {
      if (containerRef.current) {
        containerRef.current.innerHTML = '';
      }
    };
  }, []);

  // Reset state when code input changes
  useEffect(() => {
    if (code !== currentCode && !code.startsWith("SHOW_CODE_")) {
      setCurrentCode(code);
      setError(null);
      setIsLoading(true);
      setRenderAttempts(0);
      setShowCodeView(false);
    }
  }, [code, currentCode]);

  // Handle diagram rendering
  useEffect(() => {
    let isMounted = true;
    const timer = setTimeout(() => {
      // Check for code view toggle first
      if (currentCode.startsWith("SHOW_CODE_")) {
        if (isMounted) {
          setShowCodeView(true);
          setIsLoading(false);
        }
        return;
      } else {
        if (isMounted) {
          setShowCodeView(false);
        }
      }
      
      if (!containerRef.current || !isMounted) return;
      
      // Reset container to prevent issues with previous renders
      containerRef.current.innerHTML = '';
      
      if (isMounted) {
        setIsLoading(true);
        setError(null);
      }

      try {
        const uniqueId = `mermaid-${id}-${renderAttempts}`;
        const cleanCode = processCode(currentCode);
        
        console.log(`Rendering mermaid diagram with ID ${uniqueId}:`, cleanCode);
        
        renderMermaidDiagram(cleanCode, uniqueId)
          .then(svg => {
            // Only proceed if component is still mounted
            if (!isMounted || !containerRef.current) return;
            
            // Safely update the DOM
            try {
              containerRef.current.innerHTML = svg;
              console.log('Diagram rendered successfully');
            } catch (domError) {
              console.error('DOM insertion error:', domError);
              if (isMounted) {
                setError(new Error('Failed to insert diagram into DOM'));
              }
            }
          })
          .catch(err => {
            console.error('Mermaid rendering error:', err);
            if (isMounted) {
              setError(err);
            }
          })
          .finally(() => {
            if (isMounted) {
              setIsLoading(false);
            }
          });
      } catch (err) {
        console.error('Error during diagram preparation:', err);
        if (isMounted) {
          setError(err instanceof Error ? err : new Error(String(err)));
          setIsLoading(false);
        }
      }
    }, 100); // Shorter delay for faster rendering
    
    return () => {
      isMounted = false;
      clearTimeout(timer);
    };
  }, [currentCode, id, renderAttempts]);

  const handleRetry = (codeToRender: string) => {
    setRenderAttempts(prev => prev + 1);
    setCurrentCode(codeToRender);
  };

  if (showCodeView) {
    return (
      <div className="my-4 p-3 bg-gray-50 rounded border border-gray-300" data-testid="mermaid-code-view">
        <p className="text-xs font-medium mb-1">Diagram code:</p>
        <pre className="text-xs overflow-auto p-2 bg-gray-100 rounded">{currentCode.replace("SHOW_CODE_", "")}</pre>
        <button 
          type="button"
          className="mt-2 text-xs border border-blue-300 rounded px-2 py-1 hover:bg-blue-50"
          onClick={() => handleRetry(currentCode.replace("SHOW_CODE_", ""))}
        >
          Try rendering again
        </button>
      </div>
    );
  }

  return (
    <div className="my-4" data-testid="mermaid-container">
      <div 
        ref={containerRef}
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
      
      {!isLoading && error && (
        <DiagramErrorHandler 
          error={error}
          code={currentCode.replace("SHOW_CODE_", "")}
          id={id}
          onRetry={handleRetry}
        />
      )}
    </div>
  );
};

export default MermaidDiagram;
