import React, { useEffect, useRef, useCallback, useMemo, useState } from 'react';

// Global Mermaid instance management - moved outside component
let mermaidInstance: any = null;
let mermaidPromise: Promise<any> | null = null;

const getThemeVariables = () => {
  // Get computed style from document to read CSS variables
  const computedStyle = getComputedStyle(document.documentElement);
  const textColor = computedStyle.getPropertyValue('--mermaid-text').trim();
  const bgColor = computedStyle.getPropertyValue('--mermaid-bg').trim();
  const primaryColor = computedStyle.getPropertyValue('--mermaid-primary').trim();
  
  // Fallback colors if CSS variables aren't available
  const fallbackText = document.documentElement.classList.contains('dark') ? '#e5e7eb' : '#1f2937';
  const fallbackBg = document.documentElement.classList.contains('dark') ? '#1e293b' : '#ffffff';
  const fallbackPrimary = '#6b46c1';
  
  const finalTextColor = textColor || fallbackText;
  const finalBgColor = bgColor || fallbackBg;
  const finalPrimaryColor = primaryColor || fallbackPrimary;
  
  return {
    primaryColor: finalPrimaryColor,
    primaryBorderColor: finalPrimaryColor,
    lineColor: finalPrimaryColor,
    background: 'transparent',
    mainBkg: finalBgColor,
    secondBkg: finalBgColor,
    primaryTextColor: finalTextColor,
    secondaryTextColor: finalTextColor,
    tertiaryTextColor: finalTextColor,
    textColor: finalTextColor,
    labelTextColor: finalTextColor,
    nodeTextColor: finalTextColor,
    edgeLabelText: finalTextColor,
    actorTextColor: finalTextColor,
    signalTextColor: finalTextColor,
    labelBoxBkgColor: finalBgColor,
    labelBoxBorderColor: finalPrimaryColor,
    classTitleColor: finalTextColor
  };
};

const initializeMermaid = async () => {
  if (mermaidInstance) {
    // Reconfigure with current theme
    mermaidInstance.initialize({
      startOnLoad: false,
      htmlLabels: false,
      theme: 'base',
      themeVariables: getThemeVariables(),
      securityLevel: 'strict',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
    });
    return mermaidInstance;
  }
  
  if (mermaidPromise) return mermaidPromise;
  
  mermaidPromise = (async () => {
    const mermaid = await import('mermaid');
    mermaidInstance = mermaid.default;
    
    mermaidInstance.initialize({
      startOnLoad: false,
      htmlLabels: false,
      theme: 'base',
      themeVariables: getThemeVariables(),
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

  // Simple validation for text visibility
  const ensureTextVisibility = useCallback((svgElement: SVGElement) => {
    // The CSS will handle all styling, just ensure text elements exist
    const textElements = svgElement.querySelectorAll('text, tspan');
    if (textElements.length === 0) {
      console.warn('No text elements found in Mermaid diagram');
    }
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
        
        // Simple validation check
        const svgElement = container.querySelector('svg');
        if (svgElement) {
          ensureTextVisibility(svgElement);
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
  }, [ensureTextVisibility]);

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