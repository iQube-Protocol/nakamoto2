
import React, { useState } from 'react';
import { attemptAutoFix, sanitizeMermaidCode } from './utils/mermaidUtils';
import { AlertCircle } from 'lucide-react';

interface DiagramErrorHandlerProps {
  error: Error | string;
  code: string;
  id: string;
  onRetry: (code: string) => void;
}

const DiagramErrorHandler: React.FC<DiagramErrorHandlerProps> = ({ error, code, id, onRetry }) => {
  const [isFixing, setIsFixing] = useState(false);
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
    // Simple retry with current code
    onRetry(code);
  };
  
  const handleAutoFix = () => {
    setIsFixing(true);
    
    // Use a timeout to prevent UI freezing
    setTimeout(() => {
      try {
        // Choose fixing strategy based on error type
        if (errorMessage.includes("PS") || 
            errorMessage.includes("parentheses") || 
            errorMessage.includes("comma") ||
            errorMessage.includes("Expecting")) {
          console.log("Using deep sanitization for syntax error");
          // Use the sanitizeMermaidCode function for heavy error fixing
          const sanitized = sanitizeMermaidCode(code);
          onRetry(sanitized);
        } else if (errorMessage.includes("Parse error")) {
          // Generic parse errors - try standard autofix first
          console.log("Using auto fix for parse error");
          const fixedCode = attemptAutoFix(code);
          onRetry(fixedCode);
        } else {
          // For other errors, use a simplified flowchart
          console.log("Using simplified diagram for general error");
          // Create a simpler auto-generated diagram 
          const simplified = `graph TD
    A[Starting Point] --> B[Process]
    B --> C[Result]`;
          onRetry(simplified);
        }
      } catch (err) {
        console.error('Auto-fix failed:', err);
        // If auto-fix fails, try with minimal example
        onRetry("graph TD\n    A[Error] --> B[Try Again]");
      } finally {
        setIsFixing(false);
      }
    }, 100);
  };
  
  const handleShowCode = () => {
    // Send a signal to parent component to show code view
    onRetry("SHOW_CODE_" + code);
  };
  
  const handleUseSimple = () => {
    // Create a simple diagram that's guaranteed to work
    const simple = `graph TD
    A[Simple] --> B[Diagram]
    B --> C[Example]`;
    onRetry(simple);
  };
  
  return (
    <div className="p-3 rounded border border-red-300 bg-red-50 mt-2" data-testid="diagram-error">
      <div className="flex items-start">
        <AlertCircle className="h-5 w-5 mr-2 flex-shrink-0 text-red-500" />
        <div>
          <p className="text-red-600 text-sm font-medium">Error rendering diagram:</p>
          <p className="text-red-500 text-xs mt-1">{errorMessage}</p>
          {errorHint}
        </div>
      </div>
      
      <div className="mt-2 flex flex-wrap gap-2">
        <button 
          type="button"
          className="text-xs border border-blue-300 rounded px-2 py-1 hover:bg-blue-50"
          onClick={handleRetry}
          disabled={isFixing}
        >
          Try again
        </button>
        <button 
          type="button"
          className="text-xs border border-green-300 rounded px-2 py-1 hover:bg-green-50"
          onClick={handleAutoFix}
          disabled={isFixing}
        >
          {isFixing ? 'Fixing...' : 'Auto-fix & render'}
        </button>
        <button 
          type="button"
          className="text-xs border border-gray-300 rounded px-2 py-1 hover:bg-gray-50"
          onClick={handleShowCode}
          disabled={isFixing}
        >
          Show code
        </button>
        <button 
          type="button"
          className="text-xs border border-purple-300 rounded px-2 py-1 hover:bg-purple-50"
          onClick={handleUseSimple}
          disabled={isFixing}
        >
          Use simple diagram
        </button>
      </div>
    </div>
  );
};

export default DiagramErrorHandler;
