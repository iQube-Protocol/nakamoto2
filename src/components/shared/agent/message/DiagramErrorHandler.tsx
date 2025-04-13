
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
  const errorHint = React.useMemo(() => {
    if (lineMatch && lineMatch[1]) {
      const lineNumber = parseInt(lineMatch[1], 10);
      const lines = code.split('\n');
      if (lineNumber > 0 && lineNumber <= lines.length) {
        return (
          <div className="text-xs mt-1">
            Issue might be in this line: 
            <code className="bg-gray-100 p-1 rounded">{lines[lineNumber - 1]}</code>
          </div>
        );
      }
    }
    return null;
  }, [errorMessage, code]);

  const handleRetry = () => {
    onRetry(code);
  };
  
  const handleAutoFix = () => {
    const fixedCode = attemptAutoFix(code);
    console.log('Attempting fix with:', fixedCode);
    onRetry(fixedCode);
  };
  
  const handleShowCode = () => {
    // Instead of using DOM manipulation, we'll return a flag to the parent component
    onRetry("SHOW_CODE_" + code);
  };
  
  return (
    <div className="p-3 rounded border border-red-300 bg-red-50 mt-2">
      <p className="text-red-600 text-sm font-medium">Error rendering diagram:</p>
      <p className="text-red-500 text-xs mt-1">{errorMessage}</p>
      {errorHint}
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
