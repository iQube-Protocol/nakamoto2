
import React from 'react';
import { attemptAutoFix } from './utils/mermaidUtils';

interface DiagramErrorHandlerProps {
  error: Error | string;
  code: string;
  id: string;
  onRetry: (code: string) => void;
}

const DiagramErrorHandler: React.FC<DiagramErrorHandlerProps> = ({ error, code, id, onRetry }) => {
  const errorMessage = error instanceof Error ? error.message : String(error);
  
  // Extract line number from error message if available
  const lineMatch = errorMessage.match(/line\s+(\d+)/i);
  let errorHint = '';
  
  if (lineMatch && lineMatch[1]) {
    const lineNumber = parseInt(lineMatch[1], 10);
    const lines = code.split('\n');
    if (lineNumber > 0 && lineNumber <= lines.length) {
      errorHint = `<div class="text-xs mt-1">Issue might be in this line: <code class="bg-gray-100 p-1 rounded">${lines[lineNumber - 1]}</code></div>`;
    }
  }

  const handleRetry = () => {
    onRetry(code);
  };
  
  const handleAutoFix = () => {
    const fixedCode = attemptAutoFix(code);
    console.log('Attempting fix with:', fixedCode);
    onRetry(fixedCode);
  };
  
  const handleShowCode = () => {
    const container = document.getElementById(`diagram-container-${id}`);
    if (container) {
      // Clear the container first
      container.innerHTML = '';
      // Then set the new content
      container.innerHTML = `
        <div class="p-3 bg-gray-50 rounded border border-gray-300">
          <p class="text-xs font-medium mb-1">Diagram code:</p>
          <pre class="text-xs overflow-auto p-2 bg-gray-100 rounded">${code.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</pre>
          <button class="mt-2 text-xs border border-blue-300 rounded px-2 py-1 hover:bg-blue-50" id="retry-again-${id}">Try rendering again</button>
        </div>
      `;
      
      setTimeout(() => {
        const retryAgainButton = document.getElementById(`retry-again-${id}`);
        if (retryAgainButton) {
          retryAgainButton.addEventListener('click', () => onRetry(code));
        }
      }, 0);
    }
  };
  
  return (
    <div className="p-3 rounded border border-red-300 bg-red-50 mt-2">
      <p className="text-red-600 text-sm font-medium">Error rendering diagram:</p>
      <p className="text-red-500 text-xs mt-1">{errorMessage}</p>
      <div dangerouslySetInnerHTML={{ __html: errorHint }} />
      <div className="mt-2 flex gap-2">
        <button 
          className="text-xs border border-blue-300 rounded px-2 py-1 hover:bg-blue-50"
          onClick={handleRetry}
        >
          Try again
        </button>
        <button 
          className="text-xs border border-green-300 rounded px-2 py-1 hover:bg-green-50"
          onClick={handleAutoFix}
        >
          Auto-fix & render
        </button>
        <button 
          className="text-xs border border-gray-300 rounded px-2 py-1 hover:bg-gray-50"
          onClick={handleShowCode}
        >
          Show code
        </button>
      </div>
    </div>
  );
};

export default DiagramErrorHandler;
