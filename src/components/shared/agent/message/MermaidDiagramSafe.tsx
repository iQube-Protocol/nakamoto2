import React, { useEffect, useRef, useCallback, useMemo, useState } from 'react';
import MermaidCleanupManager from '@/utils/MermaidCleanupManager';
import NavigationGuard from '@/utils/NavigationGuard';

// Global Mermaid instance management with enhanced cleanup
let mermaidInstance: any = null;
let mermaidPromise: Promise<any> | null = null;

const initializeMermaid = async () => {
  if (mermaidInstance) return mermaidInstance;
  
  if (mermaidPromise) return mermaidPromise;
  
  mermaidPromise = (async () => {
    const mermaid = await import('mermaid');
    mermaidInstance = mermaid.default;
    
    // Get computed styles to read CSS variables
    const computedStyle = getComputedStyle(document.documentElement);
    const foregroundColor = computedStyle.getPropertyValue('--foreground').trim() || '222.2 84% 4.9%';
    const mutedForegroundColor = computedStyle.getPropertyValue('--muted-foreground').trim() || '215.4 16.3% 46.9%';
    
    console.log('MermaidDiagramSafe: CSS Variables Debug:', {
      foregroundColor,
      mutedForegroundColor,
      allCSSVariables: {
        foreground: computedStyle.getPropertyValue('--foreground'),
        mutedForeground: computedStyle.getPropertyValue('--muted-foreground'),
        background: computedStyle.getPropertyValue('--background'),
        primary: computedStyle.getPropertyValue('--primary')
      }
    });
    
    // Convert HSL values to hex for Mermaid
    const hslToHex = (hsl: string) => {
      if (!hsl) {
        console.log('MermaidDiagramSafe: Empty HSL, using fallback');
        return '#1f2937';
      }
      
      // Extract h, s, l from the CSS variable format like "222.2 84% 4.9%"
      const matches = hsl.match(/(\d+\.?\d*)\s+(\d+\.?\d*)%\s+(\d+\.?\d*)%/);
      if (!matches) {
        console.log('MermaidDiagramSafe: HSL format not matched, using fallback for:', hsl);
        return '#1f2937';
      }
      
      const h = parseFloat(matches[1]) / 360;
      const s = parseFloat(matches[2]) / 100;
      const l = parseFloat(matches[3]) / 100;
      
      console.log('MermaidDiagramSafe: HSL parsed:', { h, s, l, original: hsl });
      
      const hue2rgb = (p: number, q: number, t: number) => {
        if (t < 0) t += 1;
        if (t > 1) t -= 1;
        if (t < 1/6) return p + (q - p) * 6 * t;
        if (t < 1/2) return q;
        if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
        return p;
      };
      
      const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
      const p = 2 * l - q;
      const r = Math.round(hue2rgb(p, q, h + 1/3) * 255);
      const g = Math.round(hue2rgb(p, q, h) * 255);
      const b = Math.round(hue2rgb(p, q, h - 1/3) * 255);
      
      const hex = `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`;
      console.log('MermaidDiagramSafe: Converted to hex:', { original: hsl, hex, rgb: { r, g, b } });
      
      return hex;
    };
    
    const textColor = hslToHex(foregroundColor);
    const mutedTextColor = hslToHex(mutedForegroundColor);
    
    console.log('MermaidDiagramSafe: Final text colors:', {
      textColor,
      mutedTextColor,
      willUseInMermaid: {
        primaryTextColor: textColor,
        secondaryTextColor: mutedTextColor,
        textColor: textColor,
        labelTextColor: textColor,
        nodeTextColor: textColor
      }
    });
    
    mermaidInstance.initialize({
      startOnLoad: false,
      htmlLabels: false,
      theme: 'base',
      themeVariables: {
        primaryColor: '#374151',
        primaryBorderColor: '#6b46c1',
        lineColor: '#6b46c1',
        background: 'transparent',
        mainBkg: '#374151',
        secondBkg: '#4b5563',
        primaryTextColor: textColor,
        secondaryTextColor: mutedTextColor,
        tertiaryTextColor: mutedTextColor,
        textColor: textColor,
        labelTextColor: textColor,
        nodeTextColor: textColor
      },
      securityLevel: 'strict',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
    });
    
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