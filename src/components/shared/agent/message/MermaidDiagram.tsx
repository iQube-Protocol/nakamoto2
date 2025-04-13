
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

  useEffect(() => {
    // Reset state when code changes from parent
    if (code !== currentCode && !currentCode.startsWith("SHOW_CODE_")) {
      setCurrentCode(code);
      setError(null);
      setIsLoading(true);
      setRenderAttempts(0);
      setShowCodeView(false);
    }
  }, [code]);

  useEffect(() => {
    let isMounted = true;
    
    const renderDiagram = async () => {
      // Check if we're showing code view instead of diagram
      if (currentCode.startsWith("SHOW_CODE_")) {
        setShowCodeView(true);
        setIsLoading(false);
        return;
      } else {
        setShowCodeView(false);
      }
      
      if (!containerRef.current) return;
      
      setIsLoading(true);
      setError(null);

      try {
        const uniqueId = `mermaid-${id}-${renderAttempts}`;
        const cleanCode = processCode(currentCode);
        
        console.log(`Attempting to render mermaid diagram with ID ${uniqueId}:`, cleanCode);
        
        const svg = await renderMermaidDiagram(cleanCode, uniqueId);
        
        // Important: Check if component is still mounted before updating state
        if (isMounted && containerRef.current) {
          // Use React state instead of direct DOM manipulation
          containerRef.current.innerHTML = svg;
          console.log('Diagram rendered successfully');
        }
      } catch (err) {
        console.error('Mermaid error:', err);
        
        if (isMounted) {
          // If first attempt fails, try an auto-fix
          if (renderAttempts === 0) {
            setRenderAttempts(1);
            // Try a simple fix
            const fixedCode = processCode(currentCode);
            if (fixedCode !== currentCode) {
              console.log('Attempting auto-fix on first failure...');
              setCurrentCode(fixedCode);
              return;
            }
          }
          
          setError(err as Error);
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    // Add a delay to ensure DOM is fully ready
    const timer = setTimeout(() => {
      renderDiagram();
    }, 300);
    
    return () => {
      isMounted = false;
      clearTimeout(timer);
      // Clean up to prevent memory leaks
    };
  }, [currentCode, id, renderAttempts]);

  const handleRetry = (codeToRender: string) => {
    setRenderAttempts(prev => prev + 1);
    setCurrentCode(codeToRender);
  };

  return (
    <div className="my-4">
      {showCodeView ? (
        <div className="p-3 bg-gray-50 rounded border border-gray-300">
          <p className="text-xs font-medium mb-1">Diagram code:</p>
          <pre className="text-xs overflow-auto p-2 bg-gray-100 rounded">{currentCode.replace("SHOW_CODE_", "")}</pre>
          <button 
            className="mt-2 text-xs border border-blue-300 rounded px-2 py-1 hover:bg-blue-50"
            onClick={() => handleRetry(currentCode.replace("SHOW_CODE_", ""))}
          >
            Try rendering again
          </button>
        </div>
      ) : (
        <>
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
          
          {/* Error handler rendered conditionally */}
          {!isLoading && error && (
            <DiagramErrorHandler 
              error={error}
              code={currentCode.replace("SHOW_CODE_", "")}
              id={id}
              onRetry={handleRetry}
            />
          )}
        </>
      )}
    </div>
  );
};

export default MermaidDiagram;
