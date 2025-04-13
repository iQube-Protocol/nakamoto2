
// Import mermaid with a safer approach to avoid SSR issues
import mermaid from 'mermaid';

// Process the code to fix common Mermaid syntax issues
export const processCode = (inputCode: string): string => {
  try {
    console.log("Processing mermaid code:", inputCode);
    
    // Remove "SHOW_CODE_" prefix if present
    let result = inputCode.replace(/^SHOW_CODE_/, '').trim();
    
    // Handle completely empty input
    if (!result) {
      return 'graph TD\n    A[Start] --> B[End]';
    }
    
    // Add graph directive if missing
    if (!result.match(/^(sequenceDiagram|classDiagram|stateDiagram|erDiagram|journey|gantt|pie|gitGraph|graph|flowchart)/i)) {
      console.log("Adding graph TD directive to code");
      result = `graph TD\n    ${result.replace(/\n/g, '\n    ')}`;
    }
    
    // Fix common syntax issues - especially parentheses which cause most errors
    result = result
      .replace(/([A-Za-z0-9_]+)\s*\[/g, '$1[') // Remove spaces before [
      .replace(/\s+\]/g, ']') // Remove spaces before ]
      .replace(/([A-Za-z0-9_\]]+)\s+-->/g, '$1-->') // Remove spaces before -->
      .replace(/--\s+->/g, '-->') // Fix broken arrows
      .replace(/--\s+/g, '-->') // Fix dashed lines to arrows
      // Replace parentheses and commas in node labels - CRITICAL FIX
      .replace(/\[([^\]]*?)(\(|\))([^\]]*?)\]/g, (match, before, paren, after) => {
        return `[${before}${paren === '(' ? '_' : '_'}${after}]`;
      })
      .replace(/\[([^\]]*?)e\.g\.,([^\]]*?)\]/g, (match, before, after) => {
        return `[${before}e.g.${after}]`;
      })
      .replace(/\[([^\]]*?),([^\]]*?)\]/g, (match, before, after) => {
        return `[${before}_${after}]`;
      });
      
    console.log("Processed mermaid code:", result);
    return result;
  } catch (err) {
    console.error('Error processing mermaid code:', err);
    // Return a minimal valid diagram
    return 'graph TD\n    A[Error] --> B[Try Again]';
  }
};

// Auto-correct common mermaid syntax issues
export const attemptAutoFix = (originalCode: string): string => {
  console.log("Attempting to auto-fix mermaid code");
  
  try {
    let fixedCode = originalCode.replace(/^SHOW_CODE_/, '');
    
    // Fix 1: Ensure proper graph type declaration
    if (!fixedCode.match(/^(graph|flowchart|sequenceDiagram|classDiagram|stateDiagram|erDiagram|journey|gantt|pie|gitGraph)/i)) {
      fixedCode = 'graph TD\n' + fixedCode;
    }
    
    // Fix 2: Fix arrow syntax
    fixedCode = fixedCode
      .replace(/--\s*-+/g, '-->')
      .replace(/--(?!>)/g, '-->')
      .replace(/\s*-+\s*>/g, ' -->');
    
    // Fix 3: Handle special characters and parentheses in labels which often cause issues
    fixedCode = fixedCode
      // Remove ALL parentheses from node labels - they cause most parsing errors
      .replace(/\[([^\]]*?)\(([^\]]*?)\)([^\]]*?)\]/g, (match, before, inside, after) => {
        return `[${before}_${inside}_${after}]`;
      })
      // Fix "e.g.," notation which causes comma parsing issues
      .replace(/\[([^\]]*?)e\.g\.,([^\]]*?)\]/g, (match, before, after) => {
        return `[${before}e.g.${after}]`;
      })
      // Replace all commas in node labels
      .replace(/\[([^\]]*?),([^\]]*?)\]/g, (match, before, after) => {
        return `[${before}_${after}]`;
      })
      // Extra safety for parenthesis issues
      .replace(/\[\s*([^\]]*)\s*\(/, '[${1}_')
      .replace(/\)\s*([^\]]*)\s*\]/, '_$1]');
    
    console.log("Auto-fixed mermaid code:", fixedCode);
    return fixedCode;
  } catch (error) {
    console.error('Error during auto-fix:', error);
    return `graph TD\n    A[Auto-Fix] --> B[Failed]\n    B --> C[Basic Graph]`;
  }
};

// Add a timeout for mermaid rendering to prevent infinite loops
export const setupRenderTimeout = (): (() => void) => {
  const timeoutId = setTimeout(() => {
    console.error('Mermaid render timeout - operation took too long');
  }, 10000); // Extended timeout for complex diagrams
  
  return () => clearTimeout(timeoutId);
};

// Special sanitization for diagrams with PS parse errors (parenthesis issues)
export const sanitizeMermaidCode = (code: string): string => {
  console.log("Sanitizing problematic diagram code");
  
  try {
    // First strip any SHOW_CODE prefix
    let sanitized = code.replace(/^SHOW_CODE_/, '').trim();
    
    // Get the diagram type - preserve it for later
    const typeMatch = sanitized.match(/^(graph|flowchart|sequenceDiagram|classDiagram|stateDiagram|erDiagram|journey|gantt|pie|gitGraph)\s+([A-Z]{2})?/i);
    const diagramType = typeMatch ? typeMatch[0] : 'graph TD';
    
    // For PS errors specifically
    if (code.includes("e.g.,") || code.includes("(") || code.includes(")")) {
      // Replace all nodes with parentheses with safer versions
      sanitized = sanitized.replace(/\[([^\]]*)(\(|\))([^\]]*)\]/g, (match, before, paren, after) => {
        return `[${before}${after}]`;
      });
      
      // Replace all nodes with commas with safer versions
      sanitized = sanitized.replace(/\[([^\]]*),([^\]]*)\]/g, (match, before, after) => {
        return `[${before} and ${after}]`;
      });
      
      // Replace "e.g.," which often causes parse errors
      sanitized = sanitized.replace(/e\.g\.,/g, 'eg');
    }
    
    // If a parse error is still likely, create a very simple diagram
    if (sanitized.includes('Parse error') || sanitized.includes('Syntax error')) {
      console.log("Creating fallback simple diagram due to syntax errors");
      return `${diagramType}\n    A[Simplified Diagram] --> B[Due to Parse Error]`;
    }
    
    // Ensure we still have a valid diagram type
    if (!sanitized.match(/^(graph|flowchart|sequenceDiagram|classDiagram|stateDiagram|erDiagram|journey|gantt|pie|gitGraph)/i)) {
      sanitized = `${diagramType}\n${sanitized}`;
    }
    
    console.log("Sanitized mermaid code:", sanitized);
    return sanitized;
  } catch (err) {
    console.error('Error sanitizing mermaid code:', err);
    return 'graph TD\n    A[Error] --> B[Fixed Diagram]';
  }
};
