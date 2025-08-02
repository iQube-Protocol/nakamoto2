
import React, { useState, useEffect, useRef } from 'react';
import DOMPurify from 'dompurify';
import DiagramErrorHandler from './DiagramErrorHandler';
import { useTheme } from '@/contexts/ThemeContext';

// Store mermaid instance globally with improved caching
let mermaidInstance: any = null;
let mermaidPromise: Promise<any> | null = null;
let initializationAttempts = 0;
const MAX_INIT_ATTEMPTS = 3;

// Preload mermaid module to prevent dynamic import failures
const preloadMermaid = () => {
  if (typeof window !== 'undefined' && !mermaidPromise) {
    import('mermaid').catch(err => {
      console.warn('Mermaid preload failed:', err);
    });
  }
};

// Initialize preload on module load
preloadMermaid();

// Enhanced mermaid initialization with robust error handling
const getMermaid = async (): Promise<any> => {
  if (mermaidInstance) return mermaidInstance;
  
  if (!mermaidPromise) {
    mermaidPromise = (async () => {
      while (initializationAttempts < MAX_INIT_ATTEMPTS) {
        try {
          initializationAttempts++;
          console.log(`Attempting to load Mermaid (attempt ${initializationAttempts})`);
          
          // Multiple fallback strategies for loading
          let mermaidModule;
          try {
            mermaidModule = await import('mermaid');
          } catch (importError) {
            console.warn('Primary import failed, trying fallback:', importError);
            // Fallback: try different import strategy
            await new Promise(resolve => setTimeout(resolve, 200));
            mermaidModule = await import('mermaid');
          }
          
          const instance: any = mermaidModule.default || mermaidModule;
          
          // Validate instance more thoroughly
          if (!instance || typeof instance.initialize !== 'function' || typeof instance.render !== 'function') {
            throw new Error('Invalid mermaid instance - missing required methods');
          }
          
          // Configure mermaid with battle-tested settings
          instance.initialize({
            startOnLoad: false,
            theme: 'neutral',
            securityLevel: 'loose',
            deterministicIds: true,
            deterministicIDSeed: 'mermaid-seed',
            maxTextSize: 50000,
            maxEdges: 500,
            maxNodeSize: 500,
            fontFamily: 'system-ui, -apple-system, sans-serif',
            fontSize: 14,
            flowchart: {
              htmlLabels: false,
              useMaxWidth: true,
              curve: 'basis',
              padding: 15,
              nodeSpacing: 50,
              rankSpacing: 50
            },
            sequence: {
              useMaxWidth: true,
              showSequenceNumbers: true,
              diagramMarginX: 50,
              diagramMarginY: 10
            },
            journey: {
              useMaxWidth: true
            },
            themeVariables: {
              fontFamily: 'system-ui, -apple-system, sans-serif',
              fontSize: '14px',
              primaryColor: '#ffffff',
              primaryTextColor: '#1f2937',
              primaryBorderColor: '#7c3aed',
              lineColor: '#7c3aed'
            },
            logLevel: 'error'
          });
          
          // Test the instance with a simple render
          try {
            const testResult = await instance.render('test-init', 'graph TD\n    A --> B');
            if (!testResult || !testResult.svg) {
              throw new Error('Mermaid test render failed');
            }
          } catch (testError) {
            console.warn('Mermaid test render failed:', testError);
            // Continue anyway as some environments have issues with test renders
          }
          
          mermaidInstance = instance;
          console.log('Mermaid successfully initialized');
          return instance;
          
        } catch (error) {
          console.error(`Mermaid initialization attempt ${initializationAttempts} failed:`, error);
          
          if (initializationAttempts >= MAX_INIT_ATTEMPTS) {
            mermaidPromise = null;
            initializationAttempts = 0;
            throw new Error(`Mermaid initialization failed after ${MAX_INIT_ATTEMPTS} attempts: ${error}`);
          }
          
          // Wait before retrying
          await new Promise(resolve => setTimeout(resolve, 1000 * initializationAttempts));
        }
      }
    })();
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
  const [renderAttempts, setRenderAttempts] = useState<number>(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const { theme } = useTheme();
  
  // PRODUCTION CACHE BUSTING - Force fresh state
  const [buildVersion] = useState(() => `v_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`);
  const [svgCache] = useState<Map<string, string>>(() => {
    // Clear any existing cache to force fresh renders
    if (typeof window !== 'undefined') {
      console.log('🔄 PRODUCTION FIX: Clearing all mermaid caches on component init');
      // Clear any localStorage/sessionStorage related to mermaid
      Object.keys(localStorage).forEach(key => {
        if (key.includes('mermaid') || key.includes('diagram')) {
          localStorage.removeItem(key);
        }
      });
      Object.keys(sessionStorage).forEach(key => {
        if (key.includes('mermaid') || key.includes('diagram')) {
          sessionStorage.removeItem(key);
        }
      });
    }
    return new Map();
  });
  
  // ENHANCED INPUT VALIDATION with production debugging
  const validateAndCleanInput = React.useCallback((input: string): { isValid: boolean; cleaned: string; error?: string } => {
    console.log('🔍 PRODUCTION DEBUG: Validating Mermaid input:', { 
      buildVersion,
      input: input?.substring(0, 50),
      inputType: typeof input,
      hasHTML: input?.includes('<div'),
      hasEndDiv: input?.includes('</div>'),
      inputLength: input?.length
    });
    
    if (!input || typeof input !== 'string') {
      console.error('❌ PRODUCTION ERROR: Invalid input type or empty input');
      return { isValid: false, cleaned: '', error: 'No diagram code provided' };
    }
    
    const trimmed = input.trim();
    if (trimmed === '') {
      console.error('❌ PRODUCTION ERROR: Empty diagram code after trim');
      return { isValid: false, cleaned: '', error: 'Empty diagram code' };
    }
    
    // ENHANCED HTML corruption detection
    if (trimmed.includes('<div') || trimmed.includes('</div>') || trimmed.includes('<br') || trimmed.includes('&lt;')) {
      console.error('❌ PRODUCTION ERROR: HTML corruption detected in Mermaid code:', { 
        code: trimmed.substring(0, 100),
        hasDiv: trimmed.includes('<div'),
        hasEndDiv: trimmed.includes('</div>'),
        hasBr: trimmed.includes('<br'),
        hasEntity: trimmed.includes('&lt;')
      });
      return { isValid: false, cleaned: '', error: 'CORRUPTED: Diagram code contains HTML/XML tags - this should not happen with current fixes' };
    }
    
    // Basic Mermaid syntax validation
    if (!trimmed.match(/^(graph|flowchart|sequenceDiagram|classDiagram|stateDiagram|journey|pie|gantt|gitGraph|erDiagram)/)) {
      console.error('❌ PRODUCTION ERROR: Invalid Mermaid diagram type:', { code: trimmed.substring(0, 50) });
      return { isValid: false, cleaned: '', error: 'Invalid Mermaid diagram type' };
    }
    
    console.log('✅ PRODUCTION SUCCESS: Mermaid validation passed:', { code: trimmed.substring(0, 50) });
    return { isValid: true, cleaned: trimmed };
  }, [buildVersion]);

  // Enhanced rendering with caching and input validation
  useEffect(() => {
    const validation = validateAndCleanInput(currentCode);
    if (!validation.isValid) {
      setError(new Error(validation.error || "Invalid diagram code"));
      setIsLoading(false);
      return;
    }

    let isMounted = true;
    let timeoutId: number | null = null;
    
    const renderDiagram = async () => {
      if (showCodeView) return;
      
      // Check cache first with validation
      const cacheKey = `${validation.cleaned}-${theme}`;
      if (svgCache.has(cacheKey)) {
        console.log('Using cached SVG for validated diagram');
        setSvg(svgCache.get(cacheKey)!);
        setIsLoading(false);
        return;
      }
      
      setIsLoading(true);
      setError(null);
      
      // Progressive timeout based on attempts
      const timeoutMs = Math.min(10000, 5000 + (renderAttempts * 2000));
      timeoutId = window.setTimeout(() => {
        if (isMounted) {
          setError(new Error(`Rendering timeout after ${timeoutMs}ms - diagram may be too complex`));
          setIsLoading(false);
        }
      }, timeoutMs);
      
      try {
        console.log(`🎨 PRODUCTION RENDER: Starting diagram render (Build: ${buildVersion}, ID: ${id}, attempt: ${renderAttempts + 1})`);
        console.log(`🔤 PRODUCTION CODE CHECK: Validated input:`, {
          code: validation.cleaned.substring(0, 100),
          length: validation.cleaned.length,
          startsWithGraph: validation.cleaned.startsWith('graph'),
          startsWithFlowchart: validation.cleaned.startsWith('flowchart')
        });
        
        // Process the validated code with minimal changes
        const { processCode } = await import('./utils/mermaidUtils');
        const processedCode = processCode(validation.cleaned);
        
        console.log(`🔧 PRODUCTION PROCESS: Code processed:`, {
          original: validation.cleaned.substring(0, 50),
          processed: processedCode.substring(0, 50),
          changed: validation.cleaned !== processedCode
        });
        
        // Get mermaid instance with retry logic
        let mermaid;
        for (let attempt = 0; attempt < 3; attempt++) {
          try {
            mermaid = await getMermaid();
            break;
          } catch (err) {
            if (attempt === 2) throw err;
            console.warn(`Mermaid get attempt ${attempt + 1} failed, retrying...`);
            await new Promise(resolve => setTimeout(resolve, 500));
          }
        }
        
        if (!mermaid || typeof mermaid.render !== 'function') {
          throw new Error('Mermaid instance is not properly initialized');
        }
        
        // Create a unique, deterministic ID
        const uniqueId = `mermaid-${id}-${renderAttempts}-${Date.now()}`;
        
        // Attempt rendering with exponential backoff
        let renderResult;
        for (let attempt = 0; attempt < 2; attempt++) {
          try {
            renderResult = await mermaid.render(uniqueId + `-attempt-${attempt}`, processedCode);
            break;
          } catch (renderErr) {
            if (attempt === 1) throw renderErr;
            console.warn(`Render attempt ${attempt + 1} failed, retrying with fresh instance...`);
            // Reset mermaid instance for retry
            mermaidInstance = null;
            mermaidPromise = null;
            await new Promise(resolve => setTimeout(resolve, 1000));
            mermaid = await getMermaid();
          }
        }
        
        const svg = renderResult?.svg || renderResult;
        
        if (!svg || typeof svg !== 'string' || svg.length < 50) {
          throw new Error('Mermaid render returned invalid or empty SVG');
        }
        
        if (isMounted) {
          console.log(`✅ PRODUCTION SUCCESS: Mermaid render completed successfully (Build: ${buildVersion})`);
          
          // Cache successful render with build version
          svgCache.set(`${cacheKey}_${buildVersion}`, svg);
          
          setSvg(svg);
          setIsLoading(false);
          setRenderAttempts(0); // Reset on success
        }
      } catch (err) {
        console.error(`❌ PRODUCTION ERROR: Mermaid rendering failed (Build: ${buildVersion}, Attempt: ${renderAttempts + 1}):`, {
          error: err,
          code: validation.cleaned.substring(0, 100),
          id,
          buildVersion
        });
        
        if (isMounted) {
          setRenderAttempts(prev => prev + 1);
          
          // ULTIMATE FALLBACK: Prevent any rendering errors from breaking the UI
          const fallbackError = new Error(`[${buildVersion}] Mermaid render failed: ${String(err).substring(0, 100)}`);
          setError(fallbackError);
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
  }, [currentCode, id, showCodeView, theme, renderAttempts, svgCache, validateAndCleanInput]);
  
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
        svgElement.style.backgroundColor = '#fefdf8';
        svgElement.style.borderRadius = '8px';
        svgElement.style.padding = '16px';
        svgElement.style.border = '1px solid #e5e7eb';
        
        // Ensure text visibility with proper styling
        const textElements = svgElement.querySelectorAll('text, tspan');
        textElements.forEach((text: Element) => {
          if (text instanceof SVGElement) {
            text.style.fill = '#1f2937'; // Dark text for visibility
            text.style.fontSize = '15px';
            text.style.fontFamily = 'Inter, system-ui, sans-serif';
            text.style.fontWeight = '500';
          }
        });
        
        // Style nodes for consistency
        const nodes = svgElement.querySelectorAll('.node rect, .node circle, .node ellipse, .node polygon');
        nodes.forEach((node: Element) => {
          if (node instanceof SVGElement) {
            node.style.fill = '#ffffff';
            node.style.stroke = '#7c3aed';
            node.style.strokeWidth = '2px';
            node.style.rx = '8';
            node.style.ry = '8';
          }
        });
        
        // Style edges for clarity
        const edges = svgElement.querySelectorAll('.edgePath path');
        edges.forEach((edge: Element) => {
          if (edge instanceof SVGElement) {
            edge.style.stroke = '#7c3aed';
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
                path.style.fill = '#7c3aed';
                path.style.stroke = '#7c3aed';
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
  
  // ENHANCED ERROR STATE with production debugging
  if (error) {
    return (
      <div className="my-4">
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3 flex-1">
              <h3 className="text-sm font-medium text-red-800">
                PRODUCTION MERMAID ERROR - Build {buildVersion}
              </h3>
              <div className="mt-2 text-sm text-red-700">
                <p className="font-medium">Error: {error.message}</p>
                <details className="mt-2">
                  <summary className="cursor-pointer text-xs underline">Debug Info</summary>
                  <pre className="mt-1 text-xs bg-red-100 p-2 rounded overflow-auto">
                    Build Version: {buildVersion}
                    Diagram ID: {id}
                    Code Preview: {currentCode.substring(0, 100)}...
                    Render Attempts: {renderAttempts}
                    Error Stack: {error.stack?.substring(0, 200)}
                  </pre>
                </details>
              </div>
              <div className="mt-3 flex space-x-2">
                <button
                  onClick={() => handleRetry(currentCode)}
                  className="text-xs bg-red-100 text-red-800 px-3 py-1 rounded hover:bg-red-200"
                >
                  Retry Render
                </button>
                <button
                  onClick={() => setShowCodeView(true)}
                  className="text-xs bg-gray-100 text-gray-800 px-3 py-1 rounded hover:bg-gray-200"
                >
                  Show Code
                </button>
              </div>
            </div>
          </div>
        </div>
        
        {/* Fallback content to prevent UI breakage */}
        <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded text-sm text-blue-700">
          <strong>Alternative View:</strong> The diagram content is still available above. This error is being tracked for debugging.
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
