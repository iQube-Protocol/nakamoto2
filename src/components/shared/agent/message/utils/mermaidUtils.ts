
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
    
    // Fix quoted text in node labels - this is the main issue
    result = result
      // Replace quoted text in brackets with safe alternatives
      .replace(/\[([^[\]]*)"([^"]*)"([^[\]]*)\]/g, (match, before, quoted, after) => {
        const safeText = quoted.replace(/\s+/g, '_');
        return `[${before}${safeText}${after}]`;
      })
      // Handle single quotes as well
      .replace(/\[([^[\]]*)'([^']*)'([^[\]]*)\]/g, (match, before, quoted, after) => {
        const safeText = quoted.replace(/\s+/g, '_');
        return `[${before}${safeText}${after}]`;
      })
      // Remove extra spaces around arrows and brackets
      .replace(/([A-Za-z0-9_]+)\s*\[/g, '$1[')
      .replace(/\s+\]/g, ']')
      .replace(/([A-Za-z0-9_\]]+)\s+-->/g, '$1-->')
      .replace(/--\s+->/g, '-->')
      .replace(/--\s+/g, '-->')
      // Fix parentheses and commas in node labels
      .replace(/\[([^\]]*?)(\(|\))([^\]]*?)\]/g, (match, before, paren, after) => {
        return `[${before}_${after}]`;
      })
      .replace(/\[([^\]]*?)e\.g\.,([^\]]*?)\]/g, (match, before, after) => {
        return `[${before}_e.g._${after}]`;
      })
      .replace(/\[([^\]]*?),([^\]]*?)\]/g, (match, before, after) => {
        return `[${before}_${after}]`;
      })
      // Remove % characters and trailing comments which cause parse errors
      .replace(/(%.*?)($|\n)/g, '$2')
      // Fix invalid statements with NODE_STRING errors
      .replace(/\s+\w+\s*-->/g, ' -->');
      
    console.log("Processed mermaid code:", result);
    return result;
  } catch (err) {
    console.error('Error processing mermaid code:', err);
    // Return a minimal valid diagram
    return 'graph TD\n    A[Error] --> B[Try_Again]';
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
    
    // Fix 2: Handle quoted text in node labels - PRIMARY FIX
    fixedCode = fixedCode
      // Remove all quotes from node labels and replace spaces with underscores
      .replace(/\[([^[\]]*)"([^"]*)"([^[\]]*)\]/g, (match, before, quoted, after) => {
        const safeText = quoted.replace(/\s+/g, '_').replace(/[^\w\s]/g, '_');
        return `[${before}${safeText}${after}]`;
      })
      .replace(/\[([^[\]]*)'([^']*)'([^[\]]*)\]/g, (match, before, quoted, after) => {
        const safeText = quoted.replace(/\s+/g, '_').replace(/[^\w\s]/g, '_');
        return `[${before}${safeText}${after}]`;
      })
      // Fix arrow syntax
      .replace(/--\s*-+/g, '-->')
      .replace(/--(?!>)/g, '-->')
      .replace(/\s*-+\s*>/g, ' -->')
      // Handle special characters and parentheses in labels
      .replace(/\[([^\]]*?)\(([^\]]*?)\)([^\]]*?)\]/g, (match, before, inside, after) => {
        return `[${before}_${inside}_${after}]`;
      })
      // Fix "e.g.," notation which causes comma parsing issues
      .replace(/\[([^\]]*?)e\.g\.,([^\]]*?)\]/g, (match, before, after) => {
        return `[${before}e.g._${after}]`;
      })
      // Replace all commas in node labels
      .replace(/\[([^\]]*?),([^\]]*?)\]/g, (match, before, after) => {
        return `[${before}_${after}]`;
      })
      // Remove % characters and comments that cause parse errors
      .replace(/(%.*?)($|\n)/g, '$2')
      // Fix NODE_STRING errors by removing invalid node references
      .replace(/(\w+\s+)(\w+)(\s*-->)/g, '$1$3')
      .replace(/-->(\s*)(\w+)(\s*[^[])/g, '-->$1$3');
    
    console.log("Auto-fixed mermaid code:", fixedCode);
    return fixedCode;
  } catch (error) {
    console.error('Error during auto-fix:', error);
    return `graph TD\n    A[Auto_Fix_Failed] --> B[Using_Simple_Graph]`;
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
    
    // ENHANCED CRITICAL FIX: Handle all text within square brackets more aggressively
    console.log("Applying comprehensive text sanitization");
    
    // Remove all quotes and special characters from node labels
    sanitized = sanitized.replace(/\[([^\]]+)\]/g, (match, content) => {
      // Clean the content inside brackets completely
      const cleanContent = content
        .replace(/['"]/g, '') // Remove all quotes
        .replace(/[()]/g, '') // Remove parentheses
        .replace(/[,;]/g, '_') // Replace commas and semicolons
        .replace(/\s+/g, '_') // Replace spaces with underscores
        .replace(/[^\w_]/g, '_') // Replace any other special chars
        .replace(/_+/g, '_') // Collapse multiple underscores
        .replace(/^_|_$/g, '') // Remove leading/trailing underscores
        .substring(0, 30); // Limit length to avoid overflow
      
      return `[${cleanContent || 'Node'}]`; // Fallback to 'Node' if empty
    });
    
    // Fix arrow syntax issues
    sanitized = sanitized
      .replace(/--\s*-+/g, '-->')
      .replace(/--(?!>)/g, '-->')
      .replace(/\s*-+\s*>/g, ' -->');
    
    // Remove any remaining problematic characters outside of brackets
    sanitized = sanitized
      .replace(/['"]/g, '') // Remove stray quotes
      .replace(/%.*/g, '') // Remove comments
      .replace(/;/g, ''); // Remove semicolons
    
    // Clean up whitespace and ensure proper line structure
    const lines = sanitized.split('\n');
    const cleanLines = lines
      .map(line => line.trim())
      .filter(line => line.length > 0)
      .map(line => {
        // Ensure arrows are properly spaced
        return line.replace(/(\w+)(\s*-->?\s*)(\w+)/g, '$1 --> $3');
      });
    
    sanitized = cleanLines.join('\n');
    
    // Ensure we have a valid diagram type at the start
    if (!sanitized.match(/^(graph|flowchart|sequenceDiagram|classDiagram|stateDiagram|erDiagram|journey|gantt|pie|gitGraph)/i)) {
      sanitized = `${diagramType}\n${sanitized}`;
    }
    
    // Final validation - if still problematic, create fallback
    if (sanitized.length < 10 || !sanitized.includes('-->')) {
      console.log("Creating fallback diagram due to insufficient content");
      return `${diagramType}\n    A[Start] --> B[End]`;
    }
    
    console.log("Sanitized mermaid code:", sanitized);
    return sanitized;
  } catch (err) {
    console.error('Error sanitizing mermaid code:', err);
    return 'graph TD\n    A[Error_Fixed] --> B[Safe_Diagram]';
  }
};
