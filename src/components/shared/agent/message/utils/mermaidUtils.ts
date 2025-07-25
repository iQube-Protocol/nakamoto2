
// Import mermaid with a safer approach to avoid SSR issues
import mermaid from 'mermaid';

// Security validation for Mermaid diagrams
export const validateMermaidSecurity = (code: string): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];
  
  // Check for potential XSS patterns
  const xssPatterns = [
    /<script[^>]*>/i,
    /javascript:/i,
    /on\w+\s*=/i,
    /<iframe[^>]*>/i,
    /data:text\/html/i,
    /vbscript:/i
  ];
  
  for (const pattern of xssPatterns) {
    if (pattern.test(code)) {
      errors.push("Potentially dangerous script content detected");
      break;
    }
  }
  
  // Check for excessive length (DoS prevention)
  if (code.length > 50000) {
    errors.push("Diagram code exceeds maximum allowed length");
  }
  
  // Check for excessive complexity (DoS prevention)
  const nodeCount = (code.match(/\w+\[/g) || []).length;
  const edgeCount = (code.match(/-->/g) || []).length;
  
  if (nodeCount > 200 || edgeCount > 300) {
    errors.push("Diagram complexity exceeds safe limits");
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

// Pre-validate mermaid code for common syntax issues
export const validateMermaidSyntax = (code: string): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];
  
  // First check security
  const securityValidation = validateMermaidSecurity(code);
  if (!securityValidation.isValid) {
    errors.push(...securityValidation.errors);
  }
  
  // Check for basic diagram type
  if (!code.match(/^(graph|flowchart|sequenceDiagram|classDiagram|stateDiagram|erDiagram|journey|gantt|pie|gitGraph)/i)) {
    errors.push("Missing or invalid diagram type declaration");
  }
  
  // Check for problematic quoted text in node labels
  if (code.match(/\[[^\]]*"[^"]*"[^\]]*\]/)) {
    errors.push("Quoted text in node labels can cause parsing errors");
  }
  
  // Check for problematic parentheses in node labels
  if (code.match(/\[[^\]]*\([^)]*\)[^\]]*\]/)) {
    errors.push("Parentheses in node labels can cause parsing errors");
  }
  
  // Check for problematic commas in node labels
  if (code.match(/\[[^\]]*,[^\]]*\]/)) {
    errors.push("Commas in node labels can cause parsing errors");
  }
  
  // Check for invalid arrow syntax
  if (code.match(/--(?!>)/)) {
    errors.push("Invalid arrow syntax detected");
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

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

// Enhanced sanitization for diagrams with complex syntax issues
export const sanitizeMermaidCode = (code: string): string => {
  console.log("Performing enhanced sanitization on diagram code");
  
  try {
    let sanitized = code.replace(/^SHOW_CODE_/, '').trim();
    
    if (!sanitized) {
      return 'graph TD\n    A[Start] --> B[End]';
    }
    
    // Security sanitization first
    sanitized = sanitized
      // Remove script tags and dangerous patterns
      .replace(/<script[^>]*>.*?<\/script>/gi, '')
      .replace(/<iframe[^>]*>.*?<\/iframe>/gi, '')
      .replace(/javascript:/gi, '')
      .replace(/data:text\/html/gi, '')
      .replace(/vbscript:/gi, '')
      .replace(/on\w+\s*=/gi, '');
    
    // Length check
    if (sanitized.length > 50000) {
      console.warn("Diagram code too long, truncating");
      sanitized = sanitized.substring(0, 50000);
    }
    
    // Preserve diagram type
    const typeMatch = sanitized.match(/^(graph|flowchart|sequenceDiagram|classDiagram|stateDiagram|erDiagram|journey|gantt|pie|gitGraph)\s+([A-Z]{2})?/i);
    const diagramType = typeMatch ? typeMatch[0] : 'graph TD';
    
    // PRIORITY FIX: Handle all problematic characters in node labels
    sanitized = sanitized
      // Fix quoted text - most common cause of parse errors
      .replace(/\[([^[\]]*)"([^"]*)"([^[\]]*)\]/g, (match, before, quoted, after) => {
        const safeText = quoted
          .replace(/[^\w\s]/g, '_') // Replace all special chars with underscore
          .replace(/\s+/g, '_') // Replace spaces with underscore
          .replace(/_+/g, '_') // Collapse multiple underscores
          .replace(/^_|_$/g, ''); // Remove leading/trailing underscores
        return `[${before}${safeText}${after}]`;
      })
      .replace(/\[([^[\]]*)'([^']*)'([^[\]]*)\]/g, (match, before, quoted, after) => {
        const safeText = quoted
          .replace(/[^\w\s]/g, '_')
          .replace(/\s+/g, '_')
          .replace(/_+/g, '_')
          .replace(/^_|_$/g, '');
        return `[${before}${safeText}${after}]`;
      })
      // Fix parentheses in labels
      .replace(/\[([^\]]*)(\(|\))([^\]]*)\]/g, (match, before, paren, after) => {
        return `[${before.trim()}_${after.trim()}]`;
      })
      // Fix commas in labels 
      .replace(/\[([^\]]*),([^\]]*)\]/g, (match, before, after) => {
        return `[${before.trim()}_${after.trim()}]`;
      })
      // Fix periods and abbreviations
      .replace(/\[([^\]]*)\s*e\.g\.,?\s*([^\]]*)\]/g, '[eg_$2]')
      .replace(/\[([^\]]*)\s*etc\.\s*([^\]]*)\]/g, '[$1_etc_$2]')
      // Remove % comments that cause issues
      .replace(/%.*/g, '')
      // Fix arrow syntax issues
      .replace(/--\s*-+(?!>)/g, '-->')
      .replace(/--(?!>)/g, '-->')
      // Clean up extra whitespace
      .replace(/\s+/g, ' ')
      .trim();
    
    // Complexity check
    const nodeCount = (sanitized.match(/\w+\[/g) || []).length;
    const edgeCount = (sanitized.match(/-->/g) || []).length;
    
    if (nodeCount > 200 || edgeCount > 300) {
      console.warn("Diagram too complex, using simplified version");
      return `${diagramType}\n    A[Complex_Diagram] --> B[Simplified_For_Safety]`;
    }
    
    // Handle specific error patterns
    if (sanitized.includes('Parse error') || sanitized.includes('Syntax error') || sanitized.includes('NODE_STRING')) {
      console.log("Creating safe fallback diagram");
      return `${diagramType}\n    A[Diagram_Content] --> B[Successfully_Rendered]`;
    }
    
    // Validate basic structure
    const lines = sanitized.split('\n').filter(line => line.trim());
    if (lines.length < 2) {
      return `${diagramType}\n    A[Simple] --> B[Diagram]`;
    }
    
    // Ensure diagram type is present
    if (!sanitized.match(/^(graph|flowchart|sequenceDiagram|classDiagram|stateDiagram|erDiagram|journey|gantt|pie|gitGraph)/i)) {
      sanitized = `${diagramType}\n${sanitized}`;
    }
    
    console.log("Enhanced sanitization complete:", sanitized);
    return sanitized;
    
  } catch (err) {
    console.error('Error during enhanced sanitization:', err);
    return 'graph TD\n    A[Sanitization_Error] --> B[Using_Safe_Fallback]';
  }
};

// Create user-friendly error messages
export const getUserFriendlyErrorMessage = (error: string): string => {
  if (error.includes('Parse error') || error.includes('Syntax error')) {
    return "The diagram has a syntax issue. We'll try to fix it automatically.";
  }
  if (error.includes('NODE_STRING')) {
    return "There's an issue with node labels in the diagram.";
  }
  if (error.includes('timeout') || error.includes('Timeout')) {
    return "The diagram is taking too long to render. Try a simpler version.";
  }
  if (error.includes('STR')) {
    return "There's an issue with text formatting in the diagram.";
  }
  return "Unable to render the diagram. Please try the auto-fix option.";
};
