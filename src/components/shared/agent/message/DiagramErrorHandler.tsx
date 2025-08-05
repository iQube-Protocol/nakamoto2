
import React, { useState } from 'react';
import { attemptAutoFix, sanitizeMermaidCode, getUserFriendlyErrorMessage, validateMermaidSyntax } from './utils/mermaidUtils';
import { AlertCircle, RefreshCw } from 'lucide-react';

interface DiagramErrorHandlerProps {
  error: Error | string;
  code: string;
  id: string;
  onRetry: (code: string) => void;
}

const DiagramErrorHandler: React.FC<DiagramErrorHandlerProps> = ({ error, code, id, onRetry }) => {
  const [isFixing, setIsFixing] = useState(false);
  const errorMessage = error instanceof Error ? error.message : String(error);
  
  // Check if this is a TypeScript compilation error (disguised as Mermaid error)
  const isCompilationError = errorMessage.includes('mermaid version') || 
                           errorMessage.includes('TypeScript') ||
                           errorMessage.includes('compilation') ||
                           errorMessage.includes('module resolution') ||
                           (errorMessage.includes('Syntax error') && errorMessage.includes('text'));
  
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
        // Smart fixing strategy based on error type
        if (errorMessage.includes("Parse error") || 
            errorMessage.includes("Syntax error") ||
            errorMessage.includes("NODE_STRING") ||
            errorMessage.includes("Expecting")) {
          console.log("Using intelligent auto-fix for syntax error");
          
          // Try the built-in auto-fix first (minimal changes)
          const autoFixed = attemptAutoFix(code);
          
          // If auto-fix didn't change much, try sanitization
          if (autoFixed === code || autoFixed.length < 20) {
            console.log("Auto-fix insufficient, using sanitization");
            const sanitized = sanitizeMermaidCode(code);
            onRetry(sanitized);
          } else {
            onRetry(autoFixed);
          }
        } else if (errorMessage.includes("timeout") || errorMessage.includes("Timeout")) {
          // For timeout errors, create a simpler version
          console.log("Creating simplified diagram for timeout error");
          const simplified = `graph TD
    A[Original diagram was too complex] --> B[Simplified version]
    B --> C[Try the 'Show code' option for full diagram]`;
          onRetry(simplified);
        } else if (errorMessage.includes("initialization") || errorMessage.includes("Invalid mermaid")) {
          // For initialization errors, use a very basic diagram
          console.log("Using basic diagram for initialization error");
          onRetry("graph TD\n    A[Mermaid Loading Issue] --> B[Please refresh page]");
        } else {
          // For other errors, preserve as much of the original as possible
          console.log("Using fallback strategy for general error");
          const sanitized = sanitizeMermaidCode(code);
          onRetry(sanitized);
        }
      } catch (err) {
        console.error('Auto-fix failed:', err);
        // Final fallback - minimal working diagram
        onRetry("graph TD\n    A[Auto-fix Failed] --> B[Use Show Code option]");
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
  
  // Track auto-fix attempts per diagram ID to prevent loops
  const [autoFixAttempts, setAutoFixAttempts] = React.useState(() => new Map<string, number>());
  const maxAutoFixAttempts = 1;
  
  const currentAttempts = autoFixAttempts.get(id) || 0;
  
  React.useEffect(() => {
    if (currentAttempts < maxAutoFixAttempts && (
      errorMessage.includes('Syntax error') || 
      errorMessage.includes('Parse error') ||
      errorMessage.includes('NODE_STRING') ||
      errorMessage.includes('Expecting')
    )) {
      setAutoFixAttempts(prev => new Map(prev).set(id, currentAttempts + 1));
      console.log("Auto-fixing diagram with syntax error (attempt", currentAttempts + 1, "):", errorMessage);
      handleAutoFix();
    }
  }, [errorMessage, currentAttempts, id]);
  
  // Show auto-fixing indicator only if currently fixing
  if (isFixing && currentAttempts <= maxAutoFixAttempts) {
    return (
      <div className="p-3 rounded-lg border border-blue-200 bg-blue-50 mt-2 flex items-center gap-2">
        <RefreshCw className="h-4 w-4 text-blue-600 animate-spin" />
        <span className="text-sm text-blue-700">Auto-fixing diagram syntax...</span>
      </div>
    );
  }

  // Get user-friendly error message, with special handling for compilation errors
  const friendlyMessage = isCompilationError 
    ? "This appears to be a system compilation issue during navigation. Try refreshing the page or clearing browser cache."
    : getUserFriendlyErrorMessage(errorMessage);
  
  return (
    <div className="p-4 rounded-lg border border-red-200 bg-red-50 mt-2" data-testid="diagram-error">
      <div className="flex items-start">
        <AlertCircle className="h-5 w-5 mr-3 flex-shrink-0 text-red-500" />
        <div className="flex-1">
          <p className="text-red-700 text-sm font-medium">Diagram Rendering Issue</p>
          <p className="text-red-600 text-sm mt-1">{friendlyMessage}</p>
          <details className="mt-2">
            <summary className="text-xs text-red-500 cursor-pointer hover:text-red-700">
              Show technical details
            </summary>
            <p className="text-xs text-red-500 mt-1 font-mono bg-red-100 p-2 rounded">
              {errorMessage}
            </p>
            {errorHint}
          </details>
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
