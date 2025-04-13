
import React, { useState, useEffect, useRef } from 'react';
import DiagramErrorHandler from './DiagramErrorHandler';

// Store mermaid instance globally to avoid reinitialization
let mermaidInstance: any = null;
let mermaidPromise: Promise<any> | null = null;

// Initialize mermaid once and reuse
const getMermaid = async () => {
  if (mermaidInstance) return mermaidInstance;
  
  if (!mermaidPromise) {
    mermaidPromise = import('mermaid').then(m => {
      const instance = m.default;
      
      // Configure mermaid with improved styling settings
      instance.initialize({
        startOnLoad: false,
        theme: 'neutral',
        securityLevel: 'loose', // Allow all rendering
        fontFamily: 'inherit',
        fontSize: 14, // Control font size
        flowchart: {
          htmlLabels: true,
          curve: 'basis', // Smoother curves
          diagramPadding: 8, // Reduce padding
          nodeSpacing: 30, // Spacing between nodes
          rankSpacing: 40, // Spacing between ranks
          wrap: true, // Allow text wrapping in nodes
        },
        themeVariables: {
          primaryColor: '#6E56CF', // Match iqube-primary
          primaryTextColor: '#ffffff',
          primaryBorderColor: '#5842B5',
          lineColor: '#9B8AFB', // Match iqube-secondary
          secondaryColor: '#9B8AFB',
          tertiaryColor: '#e0e7ff',
          // Font sizes
          fontSize: '14px',
          fontFamily: 'inherit',
          // Node styling
          nodeBorder: '1px',
          mainBkg: '#6E56CF',
          nodeBkg: '#6E56CF',
          // Edge styling
          edgeLabelBackground: '#f7f7ff',
          // More elegant label styling
          labelBackground: '#f7f7ff',
          labelBorderRadius: '4px',
        },
        logLevel: 'fatal', // Only show fatal errors, reduce noise
      });
      
      mermaidInstance = instance;
      return instance;
    }).catch(err => {
      console.error("Failed to initialize mermaid:", err);
      mermaidPromise = null;
      throw err;
    });
  }
  
  return mermaidPromise;
};

interface MermaidDiagramProps {
  code: string;
  id: string;
}

const MermaidDiagram = ({ code, id }: MermaidDiagramProps) => {
  const [svg, setSvg] = useState<string | null>(null);
  const [error, setError] = useState<Error | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [currentCode, setCurrentCode] = useState<string>(code);
  const [showCodeView, setShowCodeView] = useState<boolean>(false);
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Render diagram when code changes or component mounts
  useEffect(() => {
    let isMounted = true;
    let timeoutId: number | null = null;
    
    const renderDiagram = async () => {
      if (showCodeView) return;
      
      setIsLoading(true);
      setError(null);
      
      // Set a timeout to prevent hanging
      timeoutId = window.setTimeout(() => {
        if (isMounted) {
          setError(new Error("Rendering timeout - diagram may be too complex"));
          setIsLoading(false);
        }
      }, 5000);
      
      try {
        console.log(`Rendering diagram (ID: ${id}) with code:`, currentCode);
        
        // Get mermaid instance
        const mermaid = await getMermaid();
        
        // Create a unique ID for this render
        const uniqueId = `mermaid-${id}-${Date.now()}`;
        
        // Render to SVG string
        const { svg } = await mermaid.render(uniqueId, currentCode);
        
        if (isMounted) {
          setSvg(svg);
          setIsLoading(false);
        }
      } catch (err) {
        console.error("Mermaid rendering error:", err);
        
        if (isMounted) {
          setError(err instanceof Error ? err : new Error(String(err)));
          setIsLoading(false);
        }
      } finally {
        if (timeoutId) {
          window.clearTimeout(timeoutId);
          timeoutId = null;
        }
      }
    };
    
    renderDiagram();
    
    return () => {
      isMounted = false;
      if (timeoutId) window.clearTimeout(timeoutId);
    };
  }, [currentCode, id, showCodeView]);
  
  // Insert SVG into the container when available
  useEffect(() => {
    if (!svg || !containerRef.current || isLoading) return;
    
    try {
      containerRef.current.innerHTML = svg;
      
      // Make SVG responsive and apply refined styling
      const svgElement = containerRef.current.querySelector('svg');
      if (svgElement) {
        // Set size constraints
        svgElement.setAttribute('width', '100%');
        svgElement.setAttribute('height', 'auto');
        svgElement.style.maxWidth = '100%';
        svgElement.style.maxHeight = '500px';
        
        // Improve font rendering
        svgElement.style.fontFamily = 'inherit';
        
        // Additional styling improvements
        const labels = svgElement.querySelectorAll('.nodeLabel, .edgeLabel');
        labels.forEach((label: Element) => {
          if (label instanceof HTMLElement) {
            label.style.fontSize = '14px';
            // Make labels wrap at a reasonable width
            if (label.classList.contains('nodeLabel')) {
              label.style.maxWidth = '120px';
              label.style.whiteSpace = 'normal';
              label.style.lineHeight = '1.3';
            }
          }
        });
        
        // Style node shapes
        const nodes = svgElement.querySelectorAll('.node rect, .node circle, .node ellipse, .node polygon');
        nodes.forEach((node: Element) => {
          if (node instanceof SVGElement) {
            node.style.rx = '4'; // Rounded corners
            node.style.ry = '4'; // Rounded corners
            node.style.filter = 'drop-shadow(0 1px 2px rgba(0, 0, 0, 0.1))'; // Subtle shadow
          }
        });
        
        // Make edges more elegant
        const edges = svgElement.querySelectorAll('.edgePath path');
        edges.forEach((edge: Element) => {
          if (edge instanceof SVGElement) {
            edge.style.strokeWidth = '1.5px';
          }
        });
      }
    } catch (err) {
      console.error("Error inserting SVG:", err);
      setError(err instanceof Error ? err : new Error(String(err)));
    }
  }, [svg, isLoading]);
  
  const handleRetry = (codeToRender: string) => {
    if (codeToRender.startsWith("SHOW_CODE_")) {
      setShowCodeView(true);
      setCurrentCode(codeToRender.replace("SHOW_CODE_", ""));
    } else {
      setShowCodeView(false);
      setCurrentCode(codeToRender);
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
        <pre className="text-xs overflow-auto p-2 bg-gray-100 rounded">{currentCode}</pre>
        <button 
          type="button"
          className="mt-2 text-xs border border-blue-300 rounded px-2 py-1 hover:bg-blue-50"
          onClick={() => handleRetry(currentCode)}
        >
          Try rendering again
        </button>
      </div>
    );
  }
  
  // Display successful render with refined container styling
  return (
    <div 
      ref={containerRef}
      className="flex justify-center overflow-x-auto p-4 bg-gray-50/50 rounded-md min-h-[100px] border border-gray-100 shadow-sm"
    />
  );
};

export default MermaidDiagram;
