
import React, { useState, useEffect, useRef } from 'react';
import { processCode, setupRenderTimeout } from './utils/mermaidUtils';
import DiagramErrorHandler from './DiagramErrorHandler';

// Use dynamic import to avoid SSR issues
let mermaidModule: any;

// Initialize mermaid with configuration once it's available
const initializeMermaid = async () => {
  if (typeof window === 'undefined') return null;
  
  try {
    // Import mermaid dynamically
    const m = await import('mermaid');
    mermaidModule = m.default;
    
    // Initialize with configuration
    mermaidModule.initialize({
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
    
    return mermaidModule;
  } catch (err) {
    console.error("Failed to load mermaid:", err);
    return null;
  }
};

interface MermaidDiagramProps {
  code: string;
  id: string;
}

const MermaidDiagram = ({ code, id }: MermaidDiagramProps) => {
  const [error, setError] = useState<Error | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [currentCode, setCurrentCode] = useState(code);
  const [showCodeView, setShowCodeView] = useState(false);
  const [renderKey, setRenderKey] = useState(0); // Used to trigger re-renders
  const [mermaidLoaded, setMermaidLoaded] = useState(false);
  
  // Load mermaid on component mount
  useEffect(() => {
    let isMounted = true;
    
    const loadMermaid = async () => {
      const mermaid = await initializeMermaid();
      if (isMounted && mermaid) {
        setMermaidLoaded(true);
      }
    };
    
    loadMermaid();
    
    return () => {
      isMounted = false;
    };
  }, []);
  
  // Reset state when code input changes
  useEffect(() => {
    if (code !== currentCode && !code.startsWith("SHOW_CODE_")) {
      setCurrentCode(code);
      setError(null);
      setIsLoading(true);
      setShowCodeView(false);
      setRenderKey(prev => prev + 1); // Force re-render with new key
    } else if (code.startsWith("SHOW_CODE_")) {
      setCurrentCode(code);
      setShowCodeView(true);
      setIsLoading(false);
    }
  }, [code, currentCode]);

  // Handle code view toggle
  useEffect(() => {
    if (currentCode.startsWith("SHOW_CODE_")) {
      setShowCodeView(true);
      setIsLoading(false);
    }
  }, [currentCode]);

  // Safe rendering function
  const renderDiagram = async () => {
    if (showCodeView || !mermaidLoaded) return null;

    try {
      setIsLoading(true);
      setError(null);
      
      // Process the code
      const cleanCode = processCode(currentCode);
      
      // Create a unique ID for this render
      const uniqueId = `mermaid-${id}-${renderKey}`;
      
      // Setup timeout to prevent hanging
      const cancelTimeout = setupRenderTimeout();
      
      // Wait a moment to ensure DOM is ready
      await new Promise(resolve => setTimeout(resolve, 50));
      
      // Render using mermaid API
      const { svg } = await mermaidModule.render(uniqueId, cleanCode);
      
      // Clear timeout as rendering completed
      cancelTimeout();
      
      return svg;
    } catch (err) {
      console.error("Error rendering diagram:", err);
      setError(err instanceof Error ? err : new Error(String(err)));
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const handleRetry = (codeToRender: string) => {
    if (codeToRender.startsWith("SHOW_CODE_")) {
      setShowCodeView(true);
      setCurrentCode(codeToRender);
    } else {
      setShowCodeView(false);
      setCurrentCode(codeToRender);
      setRenderKey(prev => prev + 1); // Force re-render
      setError(null);
      setIsLoading(true);
    }
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

  if (!mermaidLoaded) {
    return (
      <div className="flex justify-center items-center p-4 bg-gray-50 rounded min-h-[100px]">
        <div className="text-sm text-gray-500 flex items-center">
          Loading mermaid renderer... 
          <div className="ml-2 flex space-x-1">
            <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse"></div>
            <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
            <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="my-4" data-testid="mermaid-container">
      <DiagramRenderer 
        renderDiagram={renderDiagram} 
        isLoading={isLoading} 
        error={error}
        code={currentCode}
        id={id}
        onRetry={handleRetry}
      />
    </div>
  );
};

// Separate component for rendering to isolate errors
const DiagramRenderer = ({ 
  renderDiagram, 
  isLoading, 
  error,
  code,
  id,
  onRetry
}: { 
  renderDiagram: () => Promise<string | null>;
  isLoading: boolean;
  error: Error | null;
  code: string;
  id: string;
  onRetry: (code: string) => void;
}) => {
  const [svg, setSvg] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let isMounted = true;
    
    const render = async () => {
      try {
        const renderedSvg = await renderDiagram();
        if (isMounted && renderedSvg) {
          setSvg(renderedSvg);
        }
      } catch (err) {
        console.error("Error in render function:", err);
      }
    };
    
    render();
    
    return () => {
      isMounted = false;
    };
  }, [renderDiagram]);

  useEffect(() => {
    if (!isLoading && svg && containerRef.current) {
      try {
        // Safely insert the SVG 
        containerRef.current.innerHTML = svg;
        
        // Add pan and zoom behavior for large diagrams
        const svgElement = containerRef.current.querySelector('svg');
        if (svgElement) {
          // Make SVG responsive
          svgElement.setAttribute('width', '100%');
          svgElement.setAttribute('height', 'auto');
          svgElement.style.maxWidth = '100%';
        }
      } catch (err) {
        console.error("Error inserting SVG:", err);
      }
    }
  }, [svg, isLoading]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center p-4 bg-gray-50 rounded min-h-[100px]">
        <div className="text-sm text-gray-500 flex items-center">
          Generating diagram... 
          <div className="ml-2 flex space-x-1">
            <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse"></div>
            <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
            <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <DiagramErrorHandler 
        error={error}
        code={code.replace("SHOW_CODE_", "")}
        id={id}
        onRetry={onRetry}
      />
    );
  }

  return (
    <div 
      ref={containerRef}
      className="flex justify-center overflow-x-auto p-2 bg-gray-50 rounded-md min-h-[100px]"
    />
  );
};

export default MermaidDiagram;
