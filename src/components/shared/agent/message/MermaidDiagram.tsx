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
      theme: 'base',
      themeVariables: {
        primaryColor: '#f8f6f0',
        primaryTextColor: '#000000',
        primaryBorderColor: '#6b46c1',
        lineColor: '#6b46c1',
        sectionBkgColor: '#f8f6f0',
        altSectionBkgColor: '#ffffff',
        gridColor: '#6b46c1',
        secondaryColor: '#ffffff',
        tertiaryColor: '#f8f6f0',
        background: '#ffffff',
        mainBkg: '#f8f6f0',
        secondBkg: '#ffffff',
        tertiaryBkg: '#f8f6f0'
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

  // Render function with proper error handling
  const renderDiagram = useCallback(async (diagramCode: string, containerId: string) => {
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
      
      // Check if this render is still current (prevent race conditions)
      if (currentRenderRef.current === renderKey) {
        container.innerHTML = svg;
        
        // SURGICAL text-only visibility fix
        setTimeout(() => {
          const svgElement = container.querySelector('svg');
          if (svgElement) {
            // Target ONLY text and tspan elements - preserve all other styling
            const textElements = svgElement.querySelectorAll('text, tspan');
            textElements.forEach((element: any) => {
              // Only set text visibility attributes, nothing else
              element.setAttribute('fill', '#000000');
              element.setAttribute('opacity', '1');
              element.style.setProperty('fill', '#000000', 'important');
              element.style.setProperty('opacity', '1', 'important');
            });
          }
        }, 10);
        
        setError(null);
        setIsLoading(false);
      }
      
    } catch (err) {
      console.error('Mermaid render error:', err);
      
      // Only update error if this is still the current render
      if (currentRenderRef.current === `${containerId}_${Date.now()}_${renderAttemptRef.current}`) {
        setError(err instanceof Error ? err.message : 'Rendering failed');
        setIsLoading(false);
      }
    }
  }, []);

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

  // Theme effect - separate from main rendering logic
  useEffect(() => {
    if (mermaidInstance && !isLoading && !error) {
      mermaidInstance.initialize({
        theme: theme === 'dark' ? 'dark' : 'default'
      });
      
      // Re-render with new theme
      if (validatedCode.isValid) {
        renderDiagram(validatedCode.cleaned, id);
      }
    }
  }, [theme, isLoading, error, validatedCode.cleaned, validatedCode.isValid, id, renderDiagram]);

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