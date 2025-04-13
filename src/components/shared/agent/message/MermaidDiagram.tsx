
import React, { useEffect, useRef } from 'react';
import mermaid from 'mermaid';

// Initialize mermaid with better configuration for rendering
mermaid.initialize({
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
  }
});

interface MermaidDiagramProps {
  code: string;
  id: string;
}

const MermaidDiagram = ({ code, id }: MermaidDiagramProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const renderAttempted = useRef(false);

  useEffect(() => {
    if (!containerRef.current || renderAttempted.current) return;
    
    renderAttempted.current = true;
    
    const renderDiagram = async () => {
      try {
        if (!containerRef.current) return;
        
        const uniqueId = `mermaid-${id}-${Math.random().toString(36).substring(2, 11)}`;
        
        // Clean up the mermaid code - ensure proper formatting
        // Preprocess the code to sanitize common errors
        let cleanCode = code.trim()
          .replace(/--\s*-+/g, '-->')  // Replace incorrect arrows like "-- ----" with "-->"
          .replace(/--+/g, '--')       // Replace multiple hyphens with double hyphen
          .replace(/\|\|+/g, '||')     // Fix multiple vertical bars
          .replace(/\s{2,}/g, ' ');    // Replace multiple spaces with single space
        
        console.log(`Attempting to render mermaid diagram with ID ${uniqueId}:`, cleanCode);
        
        // Insert a loading placeholder
        containerRef.current.innerHTML = '<div class="text-sm text-gray-500">Rendering diagram...</div>';
        
        try {
          // Check if the code starts with a valid mermaid directive
          if (!cleanCode.match(/^(graph|flowchart|sequenceDiagram|classDiagram|stateDiagram|erDiagram|journey|gantt|pie|gitGraph)/)) {
            // Try to add flowchart directive if missing
            if (!cleanCode.startsWith('graph')) {
              cleanCode = 'graph TD\n' + cleanCode;
            }
          }
          
          // Manually parse the diagram first to check for errors
          await mermaid.parse(cleanCode);
          
          // If parsing succeeds, render the diagram
          const { svg } = await mermaid.render(uniqueId, cleanCode);
          
          // Only update if component is still mounted
          if (containerRef.current) {
            containerRef.current.innerHTML = svg;
            console.log('Diagram rendered successfully');
          }
        } catch (error) {
          console.error('Mermaid error:', error);
          if (containerRef.current) {
            // Provide more user-friendly error message with a hint about the syntax issue
            let errorMessage = error instanceof Error ? error.message : 'Unknown error';
            let errorHint = '';
            
            // Extract line number from error message if available
            const lineMatch = errorMessage.match(/line\s+(\d+)/i);
            if (lineMatch && lineMatch[1]) {
              const lineNumber = parseInt(lineMatch[1], 10);
              const lines = cleanCode.split('\n');
              if (lineNumber > 0 && lineNumber <= lines.length) {
                errorHint = `<div class="text-xs mt-1">Issue might be in this line: <code class="bg-gray-100 p-1 rounded">${lines[lineNumber - 1]}</code></div>`;
              }
            }
            
            containerRef.current.innerHTML = `
              <div class="p-3 rounded border border-red-300 bg-red-50">
                <p class="text-red-600 text-sm font-medium">Error rendering diagram:</p>
                <p class="text-red-500 text-xs mt-1">${errorMessage}</p>
                ${errorHint}
                <button class="mt-2 text-blue-500 text-xs border border-blue-300 rounded px-2 py-1 hover:bg-blue-50" id="retry-${id}">Try to fix and render</button>
              </div>
            `;
            
            // Add event listener to retry button
            setTimeout(() => {
              const retryButton = document.getElementById(`retry-${id}`);
              if (retryButton) {
                retryButton.addEventListener('click', () => handleRetry(cleanCode));
              }
            }, 0);
          }
        }
      } catch (outerError) {
        console.error('Outer error in mermaid component:', outerError);
      }
    };

    // Add a delay to ensure DOM is fully ready and to avoid race conditions
    const timer = setTimeout(() => {
      renderDiagram();
    }, 300);
    
    return () => {
      clearTimeout(timer);
    };
  }, [code, id]);

  // Enhanced retry function with auto-correction attempts
  const handleRetry = (originalCode: string) => {
    renderAttempted.current = false;
    if (containerRef.current) {
      containerRef.current.innerHTML = '<div class="text-sm text-gray-500">Attempting to fix and render...</div>';
      
      // Try to automatically fix common issues
      let fixedCode = originalCode;
      
      // Fix 1: Ensure proper graph type declaration
      if (!fixedCode.match(/^(graph|flowchart|sequenceDiagram|classDiagram|stateDiagram|erDiagram|journey|gantt|pie|gitGraph)/)) {
        fixedCode = 'graph TD\n' + fixedCode;
      }
      
      // Fix 2: Fix arrow syntax
      fixedCode = fixedCode
        .replace(/--\s*-+/g, '-->')
        .replace(/--(?!>)/g, '-->')
        .replace(/\s*-+\s*>/g, ' -->');
      
      // Fix 3: Ensure nodes have brackets
      const lines = fixedCode.split('\n');
      const fixedLines = lines.map(line => {
        // Skip comments and directives
        if (line.trim().startsWith('%') || line.match(/^(graph|flowchart|sequenceDiagram|classDiagram)/)) {
          return line;
        }
        
        // Add brackets to node references if missing
        return line.replace(/([A-Za-z0-9_]+)(?!\[|\()(\s*-->|\s*--|\s*-.-|\s*==)/g, '[$1]$2');
      });
      
      fixedCode = fixedLines.join('\n');
      console.log('Attempting fix with:', fixedCode);
      
      setTimeout(() => {
        renderAttempted.current = true;
        renderDiagram(fixedCode);
      }, 100);
    }
  };

  const renderDiagram = async (codeToRender: string = code.trim()) => {
    if (!containerRef.current) return;
    
    try {
      const uniqueId = `mermaid-${id}-${Math.random().toString(36).substring(2, 11)}`;
      
      // Parse and render
      await mermaid.parse(codeToRender);
      const { svg } = await mermaid.render(uniqueId, codeToRender);
      
      if (containerRef.current) {
        containerRef.current.innerHTML = svg;
      }
    } catch (error) {
      console.error('Retry error:', error);
      if (containerRef.current) {
        containerRef.current.innerHTML = `
          <div class="p-3 text-red-500 border border-red-300 bg-red-50 rounded">
            <p class="font-medium">Error rendering diagram:</p>
            <p class="text-xs mt-1">${error instanceof Error ? error.message : 'Unknown error'}</p>
            <div class="mt-2 flex gap-2">
              <button class="text-xs border border-blue-300 rounded px-2 py-1 hover:bg-blue-50" id="retry-${id}">Try again</button>
              <button class="text-xs border border-gray-300 rounded px-2 py-1 hover:bg-gray-50" id="show-code-${id}">Show code</button>
            </div>
          </div>
        `;
        
        // Add event listeners to buttons
        setTimeout(() => {
          const retryButton = document.getElementById(`retry-${id}`);
          const showCodeButton = document.getElementById(`show-code-${id}`);
          
          if (retryButton) {
            retryButton.addEventListener('click', () => handleRetry(codeToRender));
          }
          
          if (showCodeButton) {
            showCodeButton.addEventListener('click', () => {
              if (containerRef.current) {
                containerRef.current.innerHTML = `
                  <div class="p-3 bg-gray-50 rounded border border-gray-300">
                    <p class="text-xs font-medium mb-1">Diagram code:</p>
                    <pre class="text-xs overflow-auto p-2 bg-gray-100 rounded">${codeToRender.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</pre>
                    <button class="mt-2 text-xs border border-blue-300 rounded px-2 py-1 hover:bg-blue-50" id="retry-again-${id}">Try rendering again</button>
                  </div>
                `;
                
                const retryAgainButton = document.getElementById(`retry-again-${id}`);
                if (retryAgainButton) {
                  retryAgainButton.addEventListener('click', () => handleRetry(codeToRender));
                }
              }
            });
          }
        }, 0);
      }
    }
  };

  return (
    <div className="my-4">
      <div 
        ref={containerRef}
        className="flex justify-center overflow-x-auto p-2 bg-gray-50 rounded-md min-h-[100px]"
      >
        <div className="text-sm text-gray-500 flex items-center">
          Loading diagram... 
          <div className="ml-2 flex space-x-1">
            <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse"></div>
            <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
            <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MermaidDiagram;
