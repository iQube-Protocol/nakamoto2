
import React, { useState, useEffect, useRef } from 'react';
import { processCode, setupRenderTimeout } from './utils/mermaidUtils';
import DiagramErrorHandler from './DiagramErrorHandler';

// Initialize mermaid on component mount
const initializeMermaid = async () => {
  try {
    // Dynamically import mermaid
    const mermaid = await import('mermaid');
    
    // Configure mermaid with settings
    mermaid.default.initialize({
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
    
    return mermaid.default;
  } catch (err) {
    console.error("Failed to initialize mermaid:", err);
    return null;
  }
};

interface MermaidDiagramProps {
  code: string;
  id: string;
}

const MermaidDiagram = ({ code, id }: MermaidDiagramProps) => {
  const [mermaid, setMermaid] = useState<any>(null);
  const [svg, setSvg] = useState<string | null>(null);
  const [error, setError] = useState<Error | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [currentCode, setCurrentCode] = useState(code);
  const [showCodeView, setShowCodeView] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Load mermaid library on component mount
  useEffect(() => {
    const loadMermaid = async () => {
      const mermaidInstance = await initializeMermaid();
      setMermaid(mermaidInstance);
    };
    
    loadMermaid();
    
    return () => {
      // Cleanup any pending operations
    };
  }, []);
  
  // Reset state and attempt rendering when code or mermaid library changes
  useEffect(() => {
    if (!mermaid) return;
    
    const renderDiagram = async () => {
      if (showCodeView) return;
      
      setIsLoading(true);
      setError(null);
      
      try {
        console.log("Trying to render diagram with code:", currentCode);
        
        // Process the code to fix common issues
        const processedCode = processCode(currentCode);
        
        // Setup timeout to prevent hanging
        const cancelTimeout = setupRenderTimeout();
        
        // Create a unique ID for this render
        const uniqueId = `mermaid-${id}-${Date.now()}`;
        
        // Render the diagram
        const { svg } = await mermaid.render(uniqueId, processedCode);
        setSvg(svg);
        
        // Clear timeout as rendering completed
        cancelTimeout();
      } catch (err) {
        console.error("Mermaid rendering error:", err);
        setError(err instanceof Error ? err : new Error(String(err)));
      } finally {
        setIsLoading(false);
      }
    };
    
    renderDiagram();
  }, [mermaid, currentCode, id, showCodeView]);
  
  // Insert SVG into the container when available
  useEffect(() => {
    if (!svg || !containerRef.current || isLoading) return;
    
    try {
      containerRef.current.innerHTML = svg;
      
      // Make SVG responsive
      const svgElement = containerRef.current.querySelector('svg');
      if (svgElement) {
        svgElement.setAttribute('width', '100%');
        svgElement.setAttribute('height', 'auto');
        svgElement.style.maxWidth = '100%';
      }
    } catch (err) {
      console.error("Error inserting SVG:", err);
    }
  }, [svg, isLoading]);
  
  const handleRetry = (codeToRender: string) => {
    if (codeToRender.startsWith("SHOW_CODE_")) {
      setShowCodeView(true);
      setCurrentCode(codeToRender);
    } else {
      setShowCodeView(false);
      setCurrentCode(codeToRender);
      setError(null);
      setIsLoading(true);
    }
  };
  
  // Display loading state
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
  
  // Display error state
  if (error) {
    return (
      <DiagramErrorHandler 
        error={error}
        code={currentCode}
        id={id}
        onRetry={handleRetry}
      />
    );
  }
  
  // Display code view
  if (showCodeView) {
    return (
      <div className="my-4 p-3 bg-gray-50 rounded border border-gray-300">
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
  
  // Display successful render
  return (
    <div 
      ref={containerRef}
      className="flex justify-center overflow-x-auto p-2 bg-gray-50 rounded-md min-h-[100px]"
    />
  );
};

export default MermaidDiagram;
