
import React, { useState, useEffect } from 'react';
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
  const [hasAutoFixed, setHasAutoFixed] = useState(false);
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
            <code className="bg-gray-100 p-1 rounded ml-1">{lines[lineNumber - 1]}</code>
          </div>
        );
      }
    }
    return null;
  }, [errorMessage, code]);

  // Check if this is a syntax error that needs auto-fixing
  const isSyntaxError = errorMessage.includes('Syntax error') || errorMessage.includes('Parse error');
  
  // Auto-fix effect for syntax errors - only run once
  useEffect(() => {
    if (isSyntaxError && !hasAutoFixed) {
      console.log(`🔧 ERROR_HANDLER: Auto-fixing syntax error for diagram ${id}`);
      setHasAutoFixed(true);
      handleAutoFix();
    }
  }, [isSyntaxError, hasAutoFixed, id]);

  const handleRetry = () => {
    console.log(`🔧 ERROR_HANDLER: Manual retry requested for diagram ${id}`);
    // Simple retry with current code
    onRetry(code);
  };
  
  const handleAutoFix = () => {
    if (isFixing) return;
    
    setIsFixing(true);
    console.log(`🔧 ERROR_HANDLER: Starting auto-fix for diagram ${id}`);
    
    // Use a timeout to prevent UI freezing
    setTimeout(() => {
      try {
        // Choose fixing strategy based on error type
        if (errorMessage.includes("PS") || 
            errorMessage.includes("parentheses") || 
            errorMessage.includes("comma") ||
            errorMessage.includes("Expecting")) {
          console.log(`🔧 ERROR_HANDLER: Using deep sanitization for syntax error in diagram ${id}`);
          // Use the sanitizeMermaidCode function for heavy error fixing
          const sanitized = sanitizeMermaidCode(code);
          onRetry(sanitized);
        } else if (errorMessage.includes("Parse error")) {
          // Generic parse errors - try standard autofix first
          console.log(`🔧 ERROR_HANDLER: Using auto fix for parse error in diagram ${id}`);
          const fixedCode = attemptAutoFix(code);
          onRetry(fixedCode);
        } else {
          // For other errors, use a simplified flowchart
          console.log(`🔧 ERROR_HANDLER: Using simplified diagram for general error in diagram ${id}`);
          // Create a simpler auto-generated diagram 
          const simplified = `graph TD
    A[Starting Point] --> B[Process]
    B --> C[Result]`;
          onRetry(simplified);
        }
      } catch (err) {
        console.error(`🔧 ERROR_HANDLER: Auto-fix failed for diagram ${id}:`, err);
        // If auto-fix fails, try with minimal example
        onRetry("graph TD\n    A[Error] --> B[Try Again]");
      } finally {
        setIsFixing(false);
      }
    }, 100);
  };
  
  const handleShowCode = () => {
    console.log(`🔧 ERROR_HANDLER: Show code requested for diagram ${id}`);
    // Send a signal to parent component to show code view
    onRetry("SHOW_CODE_" + code);
  };
  
  const handleUseSimple = () => {
    console.log(`🔧 ERROR_HANDLER: Simple diagram requested for diagram ${id}`);
    // Create a simple diagram that's guaranteed to work
    const simple = `graph TD
    A[Simple] --> B[Diagram]
    B --> C[Example]`;
    onRetry(simple);
  };
  
  // Don't render error UI for syntax errors that are being auto-fixed
  if (isSyntaxError && !hasAutoFixed) {
    return (
      <div className="p-2 rounded border border-yellow-200 bg-yellow-50 mt-2 text-xs text-yellow-600">
        <span>🔧 Optimizing diagram...</span>
      </div>
    );
  }

  return (
    <div className="p-3 rounded border border-red-300 bg-red-50 mt-2" data-testid="diagram-error">
      <div className="flex items-start">
        <AlertCircle className="h-5 w-5 mr-2 flex-shrink-0 text-red-500" />
        <div>
          <p className="text-red-600 text-sm font-medium">Diagram Error:</p>
          <p className="text-red-500 text-xs mt-1">{errorMessage}</p>
          {errorHint}
        </div>
      </div>
      
      <div className="mt-2 flex flex-wrap gap-2">
        <button 
          type="button"
          className="text-xs border border-blue-300 rounded px-2 py-1 hover:bg-blue-50 transition-colors"
          onClick={handleRetry}
          disabled={isFixing}
        >
          Try again
        </button>
        <button 
          type="button"
          className="text-xs border border-green-300 rounded px-2 py-1 hover:bg-green-50 transition-colors"
          onClick={handleAutoFix}
          disabled={isFixing}
        >
          {isFixing ? 'Fixing...' : 'Auto-fix & render'}
        </button>
        <button 
          type="button"
          className="text-xs border border-gray-300 rounded px-2 py-1 hover:bg-gray-50 transition-colors"
          onClick={handleShowCode}
          disabled={isFixing}
        >
          Show code
        </button>
        <button 
          type="button"
          className="text-xs border border-purple-300 rounded px-2 py-1 hover:bg-purple-50 transition-colors"
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
