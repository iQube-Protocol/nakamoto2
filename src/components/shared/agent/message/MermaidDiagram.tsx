
import React, { useState, useEffect, useRef } from 'react';
import { processCode } from './utils/mermaidUtils';
import DiagramErrorHandler from './DiagramErrorHandler';
import mermaid from 'mermaid';

// Initialize mermaid with safe configuration
if (typeof window !== 'undefined') {
  mermaid.initialize({
    startOnLoad: false,
    theme: 'neutral',
    securityLevel: 'loose',
    fontFamily: 'inherit',
    flowchart: {
      htmlLabels: true,
      curve: 'cardinal',
    },
    themeVariables: {
      primaryColor: '#4f46e5',
      primaryTextColor: '#ffffff',
      primaryBorderColor: '#3730a3',
      lineColor: '#6366f1',
      secondaryColor: '#818cf8',
      tertiaryColor: '#e0e7ff'
    },
    logLevel: 'error'
  });
}

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
    // Check for code view toggle first
    if (currentCode.startsWith("SHOW_CODE_")) {
      setShowCodeView(true);
      setIsLoading(false);
      return;
    } else {
      setShowCodeView(false);
    }

    let isMounted = true;
    setIsLoading(true);
    setError(null);

    // Generate a truly unique ID for this render attempt
    const uniqueId = `mermaid-${id}-${renderAttempts}-${Math.random().toString(36).substring(2, 8)}`;
    
    const renderDiagram = async () => {
      try {
        if (!containerRef.current || !isMounted) return;
        
        // Clear previous content safely
        while (containerRef.current.firstChild) {
          containerRef.current.removeChild(containerRef.current.firstChild);
        }
        
        const cleanCode = processCode(currentCode);
        console.log(`Rendering mermaid diagram with ID ${uniqueId}:`, cleanCode);
        
        try {
          // Create a new temporary container for mermaid rendering
          const tempContainer = document.createElement('div');
          tempContainer.id = uniqueId;
          tempContainer.style.width = '100%';
          
          // Render to the temporary container first
          const { svg } = await mermaid.render(uniqueId, cleanCode, tempContainer);
          
          if (!isMounted || !containerRef.current) return;
          
          // Add the rendered SVG to the actual container
          containerRef.current.innerHTML = svg;
          console.log('Diagram rendered successfully');
        } catch (mermaidError) {
          console.error('Mermaid rendering error:', mermaidError);
          if (isMounted) {
            setError(mermaidError instanceof Error ? mermaidError : new Error(String(mermaidError)));
          }
        }
      } catch (err) {
        console.error('Error during diagram preparation:', err);
        if (isMounted) {
          setError(err instanceof Error ? err : new Error(String(err)));
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    // Add a small delay to ensure DOM is ready
    const timer = setTimeout(renderDiagram, 50);
    
    return () => {
      isMounted = false;
      clearTimeout(timer);
      // Ensure we clean up any DOM elements when unmounting
      if (containerRef.current) {
        containerRef.current.innerHTML = '';
      }
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
