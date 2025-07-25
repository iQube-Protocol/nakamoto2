
import React, { useState, useEffect, useRef } from 'react';
import DOMPurify from 'dompurify';
import DiagramErrorHandler from './DiagramErrorHandler';
import { useTheme } from '@/contexts/ThemeContext';

// Store mermaid instance globally to avoid reinitialization
let mermaidInstance: any = null;
let mermaidPromise: Promise<any> | null = null;

// Initialize mermaid once and reuse
const getMermaid = async () => {
  if (mermaidInstance) return mermaidInstance;
  
  if (!mermaidPromise) {
    mermaidPromise = import('mermaid').then(m => {
      const instance = m.default;
      
        // Configure mermaid with stable, proven settings
        instance.initialize({
          startOnLoad: false,
          theme: 'neutral',
          securityLevel: 'loose', // Essential for compatibility
          fontFamily: 'Arial, sans-serif',
          fontSize: 14,
          flowchart: {
            htmlLabels: false, // Disable HTML labels to prevent parsing issues
            useMaxWidth: true,
            curve: 'basis'
          },
          sequence: {
            useMaxWidth: true
          },
          journey: {
            useMaxWidth: true
          },
          themeVariables: {
            fontFamily: 'Arial, sans-serif',
            fontSize: '14px'
          },
          logLevel: 'error'
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
  const { theme } = useTheme();
  
  // Render diagram when code changes or component mounts
  useEffect(() => {
    if (!currentCode || currentCode.trim() === '') {
      setError(new Error("Empty diagram code"));
      setIsLoading(false);
      return;
    }

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
      }, 8000); // Reduced timeout for better UX
      
      try {
        console.log(`Rendering diagram (ID: ${id}) with code:`, currentCode);
        
        // Process and validate the code
        const processedCode = await import('./utils/mermaidUtils').then(m => m.processCode(currentCode));
        
        // Get mermaid instance
        const mermaid = await getMermaid();
        
        // Create a unique ID for this render
        const uniqueId = `mermaid-${id}-${Date.now()}`;
        
        // Render to SVG string using processed code
        const { svg } = await mermaid.render(uniqueId, processedCode);
        
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
      // Sanitize SVG content to prevent XSS attacks
      const sanitizedSvg = DOMPurify.sanitize(svg, {
        USE_PROFILES: { svg: true },
        ALLOWED_TAGS: ['svg', 'g', 'path', 'rect', 'circle', 'ellipse', 'polygon', 'text', 'tspan', 'defs', 'marker', 'foreignObject', 'div', 'span'],
        ALLOWED_ATTR: ['width', 'height', 'viewBox', 'fill', 'stroke', 'stroke-width', 'transform', 'd', 'x', 'y', 'cx', 'cy', 'r', 'rx', 'ry', 'points', 'class', 'id', 'style'],
        ALLOW_DATA_ATTR: false
      });
      containerRef.current.innerHTML = sanitizedSvg;
      
      // Make SVG responsive and apply refined styling
      const svgElement = containerRef.current.querySelector('svg');
      if (svgElement) {
        // Set responsive size constraints
        svgElement.setAttribute('width', '100%');
        svgElement.setAttribute('height', 'auto');
        svgElement.style.maxWidth = '100%';
        svgElement.style.maxHeight = '500px';
        svgElement.style.fontFamily = 'Inter, system-ui, sans-serif';
        
        // Apply clean background styling
        svgElement.style.backgroundColor = '#ffffff';
        svgElement.style.borderRadius = '8px';
        svgElement.style.padding = '16px';
        svgElement.style.border = '1px solid #e5e7eb';
        
        // Ensure text visibility with proper styling
        const textElements = svgElement.querySelectorAll('text, tspan');
        textElements.forEach((text: Element) => {
          if (text instanceof SVGElement) {
            text.style.fill = '#1f2937'; // Dark text for visibility
            text.style.fontSize = '14px';
            text.style.fontFamily = 'Inter, system-ui, sans-serif';
            text.style.fontWeight = '500';
          }
        });
        
        // Style nodes for consistency
        const nodes = svgElement.querySelectorAll('.node rect, .node circle, .node ellipse, .node polygon');
        nodes.forEach((node: Element) => {
          if (node instanceof SVGElement) {
            node.style.fill = '#ffffff';
            node.style.stroke = '#6b7280';
            node.style.strokeWidth = '2px';
            node.style.rx = '6';
            node.style.ry = '6';
          }
        });
        
        // Style edges for clarity
        const edges = svgElement.querySelectorAll('.edgePath path');
        edges.forEach((edge: Element) => {
          if (edge instanceof SVGElement) {
            edge.style.stroke = '#6b7280';
            edge.style.strokeWidth = '2px';
          }
        });
        
        // Style arrow markers
        const markers = svgElement.querySelectorAll('marker');
        markers.forEach((marker: Element) => {
          if (marker instanceof SVGElement) {
            const paths = marker.querySelectorAll('path');
            paths.forEach((path: Element) => {
              if (path instanceof SVGElement) {
                path.style.fill = '#6b7280';
                path.style.stroke = '#6b7280';
              }
            });
          }
        });
      }
    } catch (err) {
      console.error("Error inserting SVG:", err);
      setError(err instanceof Error ? err : new Error(String(err)));
    }
  }, [svg, isLoading, theme]);
  
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
  
  // Display error state with fallback content
  if (error) {
    return (
      <div className="my-4">
        <DiagramErrorHandler 
          error={error}
          code={currentCode}
          id={id}
          onRetry={handleRetry}
        />
        {/* Fallback content to prevent complete failure */}
        <div className="mt-2 p-2 bg-yellow-50 border border-yellow-200 rounded text-sm text-yellow-700">
          <strong>Diagram Preview Unavailable:</strong> The content contains a diagram that couldn't be rendered. Please use the error handler above to troubleshoot.
        </div>
      </div>
    );
  }
  
  // Display code view
  if (showCodeView) {
    return (
      <div className="my-4 p-3 bg-gray-50 rounded border border-gray-300">
        <p className="text-xs font-medium mb-1">Diagram code:</p>
        <pre className="text-xs overflow-auto p-2 bg-gray-100 rounded max-h-40">{currentCode}</pre>
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
      className="flex justify-center overflow-x-auto p-4 rounded-lg min-h-[100px] bg-white border border-gray-200 shadow-sm"
    />
  );
};

export default MermaidDiagram;
