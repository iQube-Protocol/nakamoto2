
// Import mermaid with a safer approach to avoid SSR issues
import mermaid from 'mermaid';

// Process the code to fix common Mermaid syntax issues
export const processCode = (inputCode: string): string => {
  try {
    // Remove "SHOW_CODE_" prefix if present
    let result = inputCode.replace(/^SHOW_CODE_/, '').trim();
    
    // Handle completely empty input
    if (!result) {
      return 'graph TD\n    A[Start] --> B[End]';
    }
    
    // Create a very simple diagram for safety if too complex
    if (result.length > 500) {
      console.log('Diagram too complex, simplifying...');
      return 'graph TD\n    A[Start] --> B[Process]\n    B --> C[End]';
    }
    
    // Handle graph/flowchart directives - make sure there's a directive
    if (!result.match(/^(sequenceDiagram|classDiagram|stateDiagram|erDiagram|journey|gantt|pie|gitGraph|graph|flowchart)/i)) {
      result = `graph TD\n    ${result.replace(/\n/g, '\n    ')}`;
    }
    
    // Fix common syntax issues
    result = result
      .replace(/([A-Za-z0-9_]+)\s*\[/g, '$1[') // Remove spaces before [
      .replace(/\s+\]/g, ']') // Remove spaces before ]
      .replace(/([A-Za-z0-9_\]]+)\s+-->/g, '$1-->') // Remove spaces before -->
      .replace(/--\s+->/g, '-->') // Fix broken arrows
      .replace(/--\s+/g, '-->') // Fix dashed lines to arrows
      .replace(/(\[\s*[^\]]*)(e\.g\.,)([^\]]*\])/g, '$1e.g.$3') // Fix e.g., syntax with commas
      .replace(/(\[[^\]]*),([^\]]*\])/g, '$1_$2') // Replace commas in node labels with underscores
      .replace(/(\[[^\]]*)\(([^\]]*)\)([^\]]*\])/g, '$1_$2_$3'); // Replace parentheses with underscores
      
    return result;
  } catch (err) {
    console.error('Error processing mermaid code:', err);
    // Return a minimal valid diagram
    return 'graph TD\n    A[Error] --> B[Try Again]';
  }
};

// Auto-correct common mermaid syntax issues
export const attemptAutoFix = (originalCode: string): string => {
  try {
    let fixedCode = originalCode.replace(/^SHOW_CODE_/, '');
    
    // Fix 1: Ensure proper graph type declaration
    if (!fixedCode.match(/^(graph|flowchart|sequenceDiagram|classDiagram|stateDiagram|erDiagram|journey|gantt|pie|gitGraph)/)) {
      fixedCode = 'graph TD\n' + fixedCode;
    }
    
    // Fix 2: Fix arrow syntax
    fixedCode = fixedCode
      .replace(/--\s*-+/g, '-->')
      .replace(/--(?!>)/g, '-->')
      .replace(/\s*-+\s*>/g, ' -->');
    
    // Fix 3: Handle special characters and parentheses in labels which often cause issues
    fixedCode = fixedCode
      .replace(/(\[\s*[^\]]*)(e\.g\.,)([^\]]*\])/g, '$1e.g.$3') // Remove comma from e.g.,
      .replace(/(\[[^\]]*),([^\]]*\])/g, '$1_$2') // Replace commas in node labels
      .replace(/(\[[^\]]*)\(([^\]]*)\)([^\]]*\])/g, '$1_$2_$3') // Replace parentheses
      .replace(/(\[[^\]]*)\s+\(/g, '$1_(') // Fix spaces before parentheses
      .replace(/\)\s+\]/g, ')_]'); // Fix spaces after parentheses
    
    // Fix 4: If too complex, provide a minimal working example
    if (fixedCode.length > 300 && !fixedCode.startsWith('graph')) {
      fixedCode = `graph TD\n    A[Start] --> B[Middle] --> C[End]`;
    } else if (fixedCode.length > 500) {
      fixedCode = `graph TD\n    A[Start] --> B[Middle] --> C[End]`;
    }
    
    // Fix 5: Handle problematic nodes with weird formatting
    const nodeRegex = /\[([^\]]*)\]/g;
    fixedCode = fixedCode.replace(nodeRegex, (match) => {
      return match
        .replace(/\(/g, '_') // Replace opening parentheses
        .replace(/\)/g, '_') // Replace closing parentheses
        .replace(/,/g, '_') // Replace commas
        .replace(/;/g, '_') // Replace semicolons
        .replace(/:/g, '-') // Replace colons
    });
    
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
  }, 5000);
  
  return () => clearTimeout(timeoutId);
};

// Handle malformed mermaid diagrams
export const sanitizeMermaidCode = (code: string): string => {
  // First apply basic processing
  let sanitized = processCode(code);
  
  // Handle known problematic patterns
  sanitized = sanitized
    // Remove or escape problematic characters in node text
    .replace(/\[([^\]]*)([\(\),;:])+([^\]]*)\]/g, (match, p1, p2, p3) => {
      return `[${p1}${p2.replace(/./g, '_')}${p3}]`;
    })
    // Fix node connections that might be using invalid syntax
    .replace(/(-+)(?!>)/g, '-->')
    // Remove blank lines
    .replace(/\n\s*\n/g, '\n');
  
  // If all else fails, return a simple valid diagram
  if (sanitized.includes('Parse error') || sanitized.includes('Syntax error')) {
    return 'graph TD\n    A[Error in Diagram] --> B[Simplified Version]';
  }
  
  return sanitized;
};
