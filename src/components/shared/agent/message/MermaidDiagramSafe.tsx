import React, { useEffect, useRef, useCallback, useMemo, useState } from 'react';
import MermaidCleanupManager from '@/utils/MermaidCleanupManager';
import NavigationGuard from '@/utils/NavigationGuard';

// Global Mermaid instance management with enhanced cleanup
let mermaidInstance: any = null;
let mermaidPromise: Promise<any> | null = null;

const initializeMermaid = async () => {
  if (mermaidInstance) {
    console.log('MermaidDiagramSafe: Using cached instance');
    return mermaidInstance;
  }
  
  if (mermaidPromise) {
    console.log('MermaidDiagramSafe: Waiting for existing promise');
    return mermaidPromise;
  }
  
  console.log('MermaidDiagramSafe: Creating new instance');
  
  mermaidPromise = (async () => {
    const mermaid = await import('mermaid');
    mermaidInstance = mermaid.default;
    
    // Let CSS handle text colors via --mermaid-text variable
    console.log('MermaidDiagramSafe: Letting CSS handle text colors via --mermaid-text variable');

    mermaidInstance.initialize({
      startOnLoad: false,
      htmlLabels: true, // Changed to true - might fix missing text elements
      theme: 'base',
      themeVariables: {
        primaryColor: '#374151',
        primaryBorderColor: '#6b46c1',
        lineColor: '#6b46c1',
        background: 'transparent',
        mainBkg: '#374151',
        secondBkg: '#4b5563'
        // Text colors removed - handled by CSS --mermaid-text variable
      },
      securityLevel: 'strict',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
    });
    
    console.log('MermaidDiagramSafe: Initialization complete');
    
    return mermaidInstance;
  })();
  
  return mermaidPromise;
};

interface MermaidDiagramSafeProps {
  code: string;
  id: string;
  showCodeView?: boolean;
  theme?: 'light' | 'dark';
}

const MermaidDiagramSafe: React.FC<MermaidDiagramSafeProps> = ({ 
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

  // Initialize cleanup manager
  useEffect(() => {
    MermaidCleanupManager.init();
    NavigationGuard.init();
    
    // Force Mermaid instance reset to apply new color configuration
    mermaidInstance = null;
    mermaidPromise = null;
    console.log('MermaidDiagramSafe: Forced instance reset for color updates');
  }, []);

  // Memoize validation function
  const validateAndCleanInput = useCallback((input: string): { isValid: boolean; cleaned: string; error?: string } => {
    if (!input || typeof input !== 'string') {
      return { isValid: false, cleaned: '', error: 'Invalid input' };
    }

    const trimmed = input.trim();
    if (!trimmed) {
      return { isValid: false, cleaned: '', error: 'Empty diagram' };
    }

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

  const validatedCode = useMemo(() => {
    return validateAndCleanInput(code);
  }, [code, validateAndCleanInput]);

  // Enhanced render function with cleanup management
  const renderDiagram = useCallback(async (diagramCode: string, containerId: string) => {
    // Skip rendering during navigation
    if (NavigationGuard.isNavigationInProgress()) {
      console.log('MermaidDiagramSafe: Skipping render during navigation');
      return;
    }

    const renderFunction = async () => {
      try {
        const mermaid = await initializeMermaid();
        const container = containerRef.current;
        
        if (!container) throw new Error('Container not found');

        // Force cleanup before rendering
        MermaidCleanupManager.removeDataProcessedAttributes(containerId);
        
        // Clear previous content
        container.innerHTML = '';
        
        // Generate unique ID for this render
        const renderKey = `${containerId}_${Date.now()}_${renderAttemptRef.current}`;
        currentRenderRef.current = renderKey;

        console.log(`MermaidDiagramSafe: Rendering ${renderKey}`);

        // Render with Mermaid
        const { svg } = await mermaid.render(renderKey, diagramCode);
        
        // Check if this render is still current
        if (currentRenderRef.current === renderKey && container) {
          container.innerHTML = svg;
          
          // DEBUG: Comprehensive text element analysis
          console.log('MermaidDiagramSafe: SVG inserted, analyzing text elements...');
          
          const allTextElements = container.querySelectorAll('text, tspan');
          console.log(`MermaidDiagramSafe: Found ${allTextElements.length} text elements`);
          
          allTextElements.forEach((el, index) => {
            const rect = el.getBoundingClientRect();
            const computedStyle = window.getComputedStyle(el);
            console.log(`MermaidDiagramSafe: Text element ${index}:`, {
              content: el.textContent,
              fill: el.getAttribute('fill'),
              style: el.getAttribute('style'),
              computedFill: computedStyle.fill,
              computedColor: computedStyle.color,
              opacity: computedStyle.opacity,
              visibility: computedStyle.visibility,
              fontSize: computedStyle.fontSize,
              rect: { width: rect.width, height: rect.height },
              hasSize: rect.width > 0 && rect.height > 0
            });
          });
          
          // Check CSS variable values
          const rootStyle = getComputedStyle(document.documentElement);
          const mermaidTextValue = rootStyle.getPropertyValue('--mermaid-text').trim();
          console.log('MermaidDiagramSafe: Theme analysis:', {
            isDark: document.documentElement.classList.contains('dark'),
            mermaidTextVar: mermaidTextValue,
            mermaidTextComputed: mermaidTextValue ? `hsl(${mermaidTextValue})` : 'not set',
            foreground: rootStyle.getPropertyValue('--foreground').trim(),
            background: rootStyle.getPropertyValue('--background').trim()
          });
          
          // Remove any lingering data-processed attributes
          setTimeout(() => {
            MermaidCleanupManager.removeDataProcessedAttributes(containerId);
          }, 100);
          
          setError(null);
          setIsLoading(false);
        }
        
      } catch (err) {
        console.error('MermaidDiagramSafe render error:', err);
        
        // Force cleanup on error
        MermaidCleanupManager.forceCleanupRender(containerId);
        
        setError(err instanceof Error ? err.message : 'Rendering failed');
        setIsLoading(false);
      }
    };

    // Register with cleanup manager for sequential processing
    await MermaidCleanupManager.registerRender(containerId, renderFunction);
  }, []);

  // Main effect with enhanced navigation awareness
  useEffect(() => {
    setIsLoading(true);
    setError(null);
    renderAttemptRef.current += 1;

    if (!validatedCode.isValid) {
      setError(validatedCode.error || 'Invalid diagram');
      setIsLoading(false);
      return;
    }

    // Longer debounce for complex diagrams
    const timeoutId = setTimeout(() => {
      renderDiagram(validatedCode.cleaned, id);
    }, 150);

    return () => {
      clearTimeout(timeoutId);
      currentRenderRef.current = '';
      // Force cleanup on component unmount
      MermaidCleanupManager.forceCleanupRender(id);
    };
  }, [validatedCode.cleaned, validatedCode.isValid, id, renderDiagram]);

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

export default MermaidDiagramSafe;