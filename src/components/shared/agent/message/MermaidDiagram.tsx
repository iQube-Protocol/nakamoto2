
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
  // Use ref to track if component is mounted
  const containerRef = useRef<HTMLDivElement>(null);
  const renderAttempted = useRef(false);

  useEffect(() => {
    if (!containerRef.current || renderAttempted.current) return;
    
    renderAttempted.current = true;
    
    const renderDiagram = async () => {
      try {
        // Make sure container exists
        if (!containerRef.current) return;
        
        // Generate a truly unique ID to avoid conflicts
        const uniqueId = `mermaid-${id}-${Math.random().toString(36).substring(2, 11)}`;
        
        // Clean up the mermaid code - ensure proper formatting
        const cleanCode = code.trim();
        console.log(`Attempting to render mermaid diagram with ID ${uniqueId}:`, cleanCode);
        
        // Insert a loading placeholder
        containerRef.current.innerHTML = '<div class="text-sm text-gray-500">Rendering diagram...</div>';
        
        try {
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
            containerRef.current.innerHTML = `
              <div class="p-3 text-red-500 border border-red-300 rounded">
                Error rendering diagram: ${error instanceof Error ? error.message : 'Unknown error'}
              </div>
            `;
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

  // Retry button to manually trigger rendering
  const handleRetry = () => {
    renderAttempted.current = false;
    if (containerRef.current) {
      containerRef.current.innerHTML = '<div class="text-sm text-gray-500">Retrying...</div>';
      setTimeout(() => {
        renderAttempted.current = true;
        renderDiagram();
      }, 100);
    }
  };

  const renderDiagram = async () => {
    if (!containerRef.current) return;
    
    try {
      const uniqueId = `mermaid-${id}-${Math.random().toString(36).substring(2, 11)}`;
      const cleanCode = code.trim();
      
      // Parse and render
      await mermaid.parse(cleanCode);
      const { svg } = await mermaid.render(uniqueId, cleanCode);
      
      if (containerRef.current) {
        containerRef.current.innerHTML = svg;
      }
    } catch (error) {
      console.error('Retry error:', error);
      if (containerRef.current) {
        containerRef.current.innerHTML = `
          <div class="p-3 text-red-500 border border-red-300 rounded">
            Error rendering diagram: ${error instanceof Error ? error.message : 'Unknown error'}
            <button class="ml-2 text-blue-500 underline text-sm" id="retry-${id}">Retry</button>
          </div>
        `;
        
        // Add event listener to retry button
        setTimeout(() => {
          const retryButton = document.getElementById(`retry-${id}`);
          if (retryButton) {
            retryButton.addEventListener('click', handleRetry);
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
