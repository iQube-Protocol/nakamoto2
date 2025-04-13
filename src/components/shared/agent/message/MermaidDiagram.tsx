
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
    let timer: ReturnType<typeof setTimeout>;
    
    const renderDiagram = async () => {
      // Handle code view toggle
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
        
        console.log(`Rendering mermaid diagram with ID ${uniqueId}:`, cleanCode);
        
        // Wait for diagram rendering
        const svg = await renderMermaidDiagram(cleanCode, uniqueId);
        
        // Check if component is still mounted
        if (isMounted && containerRef.current) {
          // Use innerHTML to insert the SVG - this is safe for SVGs from our own code
          containerRef.current.innerHTML = svg;
          console.log('Diagram rendered successfully');
        }
      } catch (err) {
        console.error('Mermaid rendering error:', err);
        
        if (isMounted) {
          // Only auto-fix on first failure
          if (renderAttempts === 0) {
            setRenderAttempts(1);
            // Try a simple fix if code changed
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
        // Only update state if component is still mounted
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    // Add a delay to ensure DOM is ready
    timer = setTimeout(() => {
      renderDiagram();
    }, 300);
    
    return () => {
      isMounted = false;
      clearTimeout(timer);
      // Clean container to prevent memory leaks
      if (containerRef.current) {
        containerRef.current.innerHTML = '';
      }
    };
  }, [currentCode, id, renderAttempts]);

  const handleRetry = (codeToRender: string) => {
    // Increment render attempts to force re-render with new ID
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
          
          {/* Error handler */}
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
