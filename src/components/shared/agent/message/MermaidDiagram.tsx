import React, { useEffect, useRef, useCallback, useMemo, useState } from 'react';

// Global Mermaid instance management - moved outside component
let mermaidInstance: any = null;
let mermaidPromise: Promise<any> | null = null;

const initializeMermaid = async () => {
  if (mermaidInstance) return mermaidInstance;
  
  if (mermaidPromise) return mermaidPromise;
  
  mermaidPromise = (async () => {
    const mermaid = await import('mermaid');
    mermaidInstance = mermaid.default;
    
    mermaidInstance.initialize({
      startOnLoad: false,
      htmlLabels: false, // CRITICAL: Force SVG text instead of HTML
      theme: 'base', // Minimal theme to avoid conflicts
      themeVariables: {
        primaryTextColor: '#1f2937',
        primaryColor: '#ffffff',
        primaryBorderColor: '#6b46c1',
        lineColor: '#6b46c1'
      },
      securityLevel: 'strict',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
    });
    
    return mermaidInstance;
  })();
  
  return mermaidPromise;
};

interface MermaidDiagramProps {
  code: string;
  id: string;
  showCodeView?: boolean;
  theme?: 'light' | 'dark';
}

const MermaidDiagram: React.FC<MermaidDiagramProps> = ({ 
  code, 
  id, 
  showCodeView = false, 
  theme = 'light' 
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const renderAttemptRef = useRef(0);
  const currentRenderRef = useRef<string>('');

  // Memoize validation function to prevent recreation
  const validateAndCleanInput = useCallback((input: string): { isValid: boolean; cleaned: string; error?: string } => {
    if (!input || typeof input !== 'string') {
      return { isValid: false, cleaned: '', error: 'Invalid input' };
    }

    const trimmed = input.trim();
    if (!trimmed) {
      return { isValid: false, cleaned: '', error: 'Empty diagram' };
    }

    // Basic Mermaid syntax validation
    const validStartPatterns = [
      'graph', 'flowchart', 'sequenceDiagram', 'classDiagram', 
      'stateDiagram', 'erDiagram', 'gantt', 'pie', 'journey'
    ];
    
    const hasValidStart = validStartPatterns.some(pattern => 
      trimmed.toLowerCase().startsWith(pattern.toLowerCase())
    );

    if (!hasValidStart) {
      return { 
        isValid: false, 
        cleaned: trimmed, 
        error: 'Invalid Mermaid diagram syntax' 
      };
    }

    return { isValid: true, cleaned: trimmed };
  }, []);

  // Memoize the validated code to prevent unnecessary re-renders
  const validatedCode = useMemo(() => {
    return validateAndCleanInput(code);
  }, [code, validateAndCleanInput]);

  // Surgical text fix function with direct attribute setting
  const applySurgicalTextFix = useCallback((svgElement: SVGElement) => {
    // Method 1: Remove conflicting attributes
    const textElements = svgElement.querySelectorAll('text, tspan');
    textElements.forEach((element: any) => {
      element.removeAttribute('fill');
      element.removeAttribute('style');
      element.removeAttribute('color');
      
      // Method 2: Set attributes directly (most reliable)
      element.setAttribute('fill', '#1f2937');
      element.style.fill = '#1f2937';
      element.style.color = '#1f2937';
      element.style.visibility = 'visible';
      element.style.opacity = '1';
    });
    
    // Method 3: Inject CSS directly into SVG
    const styleElement = document.createElementNS('http://www.w3.org/2000/svg', 'style');
    styleElement.textContent = `
      text, tspan, .label text, .node text, .edgeLabel text { 
        fill: #1f2937 !important; 
        color: #1f2937 !important;
        font-size: 14px !important; 
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif !important;
        font-weight: 500 !important; 
        opacity: 1 !important;
        visibility: visible !important;
      }
      .node-label, .edge-label, .cluster-label {
        fill: #1f2937 !important;
        color: #1f2937 !important;
      }
    `;
    svgElement.insertBefore(styleElement, svgElement.firstChild);
    
    // Method 4: Force reflow
    svgElement.style.display = 'none';
    (svgElement as any).offsetHeight;
    svgElement.style.display = '';
  }, []);

  // Simplified render function
  const renderDiagram = useCallback(async (diagramCode: string, containerId: string) => {
    let observer: MutationObserver | null = null;
    
    try {
      const mermaid = await initializeMermaid();
      const container = containerRef.current;
      
      if (!container) throw new Error('Container not found');

      // Clear previous content
      container.innerHTML = '';
      
      // Generate unique ID for this render
      const renderKey = `${containerId}_${Date.now()}_${renderAttemptRef.current}`;
      currentRenderRef.current = renderKey;

      // Render with Mermaid
      const { svg } = await mermaid.render(renderKey, diagramCode);
      
      // Check if this render is still current
      if (currentRenderRef.current === renderKey) {
        container.innerHTML = svg;
        
        // Apply surgical text fix
        const svgElement = container.querySelector('svg');
        if (svgElement) {
          applySurgicalTextFix(svgElement);
          
          // MutationObserver to prevent external interference
          observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
              if (mutation.type === 'attributes' && 
                  (mutation.attributeName === 'fill' || mutation.attributeName === 'style')) {
                const target = mutation.target as Element;
                if (target.tagName === 'text' || target.tagName === 'tspan') {
                  (target as any).setAttribute('fill', '#1f2937');
                  (target as any).style.fill = '#1f2937';
                  (target as any).style.color = '#1f2937';
                }
              }
            });
          });
          
          observer.observe(svgElement, {
            attributes: true,
            subtree: true,
            attributeFilter: ['fill', 'style', 'color']
          });
        }
        
        setError(null);
        setIsLoading(false);
      }
      
    } catch (err) {
      console.error('Mermaid render error:', err);
      
      if (observer) {
        observer.disconnect();
      }
      
      setError(err instanceof Error ? err.message : 'Rendering failed');
      setIsLoading(false);
    }
    
    // Return cleanup function
    return () => {
      if (observer) {
        observer.disconnect();
      }
    };
  }, [applySurgicalTextFix]);

  // Main effect - only depends on essential props
  useEffect(() => {
    // Reset state for new render
    setIsLoading(true);
    setError(null);
    renderAttemptRef.current += 1;

    if (!validatedCode.isValid) {
      setError(validatedCode.error || 'Invalid diagram');
      setIsLoading(false);
      return;
    }

    // Debounce rapid changes
    const timeoutId = setTimeout(() => {
      renderDiagram(validatedCode.cleaned, id);
    }, 100);

    return () => {
      clearTimeout(timeoutId);
      // Cancel current render if component unmounts or code changes
      currentRenderRef.current = '';
    };
  }, [validatedCode.cleaned, validatedCode.isValid, id, renderDiagram]);

  // Removed theme effect to prevent configuration conflicts

  if (showCodeView) {
    return (
      <div className="mermaid-code-view">
        <pre><code>{code}</code></pre>
      </div>
    );
  }

  return (
    <div className="mermaid-container">
      {isLoading && (
        <div className="mermaid-loading">
          <div>Loading diagram...</div>
        </div>
      )}
      
      {error && (
        <div className="mermaid-error">
          <div>Error: {error}</div>
          <details>
            <summary>Show code</summary>
            <pre><code>{code}</code></pre>
          </details>
        </div>
      )}
      
      <div 
        ref={containerRef}
        className="mermaid-diagram"
        style={{ 
          display: isLoading || error ? 'none' : 'block',
          minHeight: error ? 0 : '100px'
        }}
      />
    </div>
  );
};

export default MermaidDiagram;