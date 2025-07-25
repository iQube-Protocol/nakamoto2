
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
  if (!inputCode || typeof inputCode !== 'string') {
    return 'graph TD\n    A[Start] --> B[End]';
  }

  let cleanedCode = inputCode.trim();

  // Basic security check for obvious threats
  if (cleanedCode.includes('<script') || cleanedCode.includes('javascript:') || cleanedCode.includes('onclick')) {
    console.warn('Potential security issue detected in diagram code');
    return 'graph TD\n    A[Security Error] --> B[Please check diagram]';
  }

  // Add directive if missing
  if (!cleanedCode.match(/^(graph|flowchart|sequenceDiagram|classDiagram|stateDiagram|erDiagram|journey|gantt|pie|gitGraph)/)) {
    cleanedCode = 'graph TD\n' + cleanedCode;
  }

  // Light cleanup only - preserve valid Mermaid syntax
  cleanedCode = cleanedCode
    .replace(/\s+/g, ' ') // Normalize whitespace only
    .trim();

  return cleanedCode;
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
  if (!code || typeof code !== 'string') {
    return 'graph TD\n    A[Start] --> B[End]';
  }

  let sanitized = code.trim();

  // Basic security check only for actual threats
  if (sanitized.includes('<script') || sanitized.includes('javascript:') || sanitized.includes('onclick')) {
    console.warn('Security threat detected in Mermaid code');
    return 'graph TD\n    A[Security Error] --> B[Contact Support]';
  }

  // Length check
  if (sanitized.length > 10000) {
    console.warn('Mermaid code too long, truncating');
    sanitized = sanitized.substring(0, 10000);
  }

  // Minimal cleaning - preserve valid syntax
  sanitized = sanitized
    .replace(/\r\n/g, '\n') // Normalize line endings
    .replace(/\r/g, '\n') // Convert remaining \r to \n
    .replace(/\u00A0/g, ' ') // Replace non-breaking spaces
    .trim();

  // Add missing directive
  if (!sanitized.match(/^(graph|flowchart|sequenceDiagram|classDiagram|stateDiagram|erDiagram|journey|gantt|pie|gitGraph)/)) {
    sanitized = 'graph TD\n' + sanitized;
  }

  return sanitized;
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
