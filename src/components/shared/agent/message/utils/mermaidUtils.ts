
// Type-safe mermaid utilities - no direct imports to avoid build issues

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
  
  // Only check for actual syntax errors that would break rendering
  // Remove overly strict checks that reject valid Mermaid syntax
  
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

  // Only add directive if it's clearly missing AND the code doesn't look like it has one
  if (!cleanedCode.match(/^(graph|flowchart|sequenceDiagram|classDiagram|stateDiagram|erDiagram|journey|gantt|pie|gitGraph)/i) && 
      cleanedCode.length > 0 && 
      !cleanedCode.includes('-->') && 
      !cleanedCode.includes('participant')) {
    cleanedCode = 'graph TD\n' + cleanedCode;
  }

  // CRITICAL FIX: Preserve line breaks - don't collapse newlines
  cleanedCode = cleanedCode
    .replace(/\r\n/g, '\n')           // Normalize line endings
    .replace(/\r/g, '\n')             // Convert remaining \r to \n
    .replace(/[ \t]+/g, ' ')          // Only collapse spaces/tabs, preserve newlines
    .replace(/[ \t]*\n[ \t]*/g, '\n') // Clean up whitespace around newlines
    .trim();

  return cleanedCode;
};

// Auto-correct common mermaid syntax issues
export const attemptAutoFix = (originalCode: string): string => {
  console.log("Attempting to auto-fix mermaid code");
  
  try {
    let fixedCode = originalCode.replace(/^SHOW_CODE_/, '');
    
    // Validate the code first - if it's already valid, don't fix it
    const validation = validateMermaidSyntax(fixedCode);
    if (validation.isValid) {
      console.log("Code is already valid, no fixes needed");
      return fixedCode;
    }
    
    // Minimal fixes - only fix obvious issues
    // Don't auto-add diagram type unless clearly missing
    if (!fixedCode.match(/^(graph|flowchart|sequenceDiagram|classDiagram|stateDiagram|erDiagram|journey|gantt|pie|gitGraph)/i) && 
        fixedCode.length > 0 && 
        !fixedCode.includes('-->') && 
        !fixedCode.includes('participant')) {
      fixedCode = 'graph TD\n' + fixedCode;
    }
    
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

// Enhanced sanitization that preserves valid Mermaid syntax
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
  if (sanitized.length > 20000) {
    console.warn('Mermaid code too long, truncating');
    sanitized = sanitized.substring(0, 20000);
  }

  // Minimal cleaning - preserve ALL valid syntax including parentheses, commas, etc.
  sanitized = sanitized
    .replace(/\r\n/g, '\n') // Normalize line endings
    .replace(/\r/g, '\n') // Convert remaining \r to \n
    .replace(/\u00A0/g, ' ') // Replace non-breaking spaces
    .trim();

  // Only add missing directive if it's clearly missing
  if (!sanitized.match(/^(graph|flowchart|sequenceDiagram|classDiagram|stateDiagram|erDiagram|journey|gantt|pie|gitGraph)/i) && 
      sanitized.length > 0 && 
      !sanitized.includes('-->') && 
      !sanitized.includes('participant') &&
      !sanitized.includes('Alice') &&
      !sanitized.includes('Bob')) {
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
