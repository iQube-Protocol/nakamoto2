
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
    
    // Enhanced text sanitization
    result = sanitizeMermaidText(result);
      
    console.log("Processed mermaid code:", result);
    return result;
  } catch (err) {
    console.error('Error processing mermaid code:', err);
    // Return a minimal valid diagram
    return 'graph TD\n    A[Error] --> B[Try_Again]';
  }
};

// Comprehensive text sanitization function
const sanitizeMermaidText = (code: string): string => {
  console.log("Sanitizing mermaid text comprehensively");
  
  try {
    let sanitized = code;
    
    // Step 1: Fix quoted text in node labels (primary issue)
    sanitized = sanitized.replace(/\[([^\]]*?["'].*?["'][^\]]*?)\]/g, (match, content) => {
      // Clean all quotes and special characters from node labels
      const cleanContent = content
        .replace(/["']/g, '') // Remove all quotes
        .replace(/[()]/g, '') // Remove parentheses
        .replace(/[,;:]/g, '_') // Replace punctuation with underscores
        .replace(/\s+/g, '_') // Replace spaces with underscores
        .replace(/[^\w_-]/g, '_') // Replace special chars with underscores
        .replace(/_+/g, '_') // Collapse multiple underscores
        .replace(/^_|_$/g, '') // Remove leading/trailing underscores
        .substring(0, 25); // Limit length
      
      return `[${cleanContent || 'Node'}]`;
    });
    
    // Step 2: Handle any remaining problematic brackets
    sanitized = sanitized.replace(/\[([^\]]*)\]/g, (match, content) => {
      if (content.includes('"') || content.includes("'") || content.includes(',') || content.includes('(') || content.includes(')')) {
        const cleanContent = content
          .replace(/["']/g, '')
          .replace(/[()]/g, '')
          .replace(/[,;:]/g, '_')
          .replace(/\s+/g, '_')
          .replace(/[^\w_-]/g, '_')
          .replace(/_+/g, '_')
          .replace(/^_|_$/g, '')
          .substring(0, 25);
        
        return `[${cleanContent || 'Node'}]`;
      }
      return match;
    });
    
    // Step 3: Fix arrow syntax
    sanitized = sanitized
      .replace(/--\s*-+/g, '-->')
      .replace(/--(?!>)/g, '-->')
      .replace(/\s*-+\s*>/g, ' -->');
    
    // Step 4: Remove problematic characters outside of brackets
    sanitized = sanitized
      .replace(/['"]/g, '') // Remove stray quotes
      .replace(/%.*/g, '') // Remove comments
      .replace(/;/g, ''); // Remove semicolons
    
    // Step 5: Clean up whitespace and ensure proper line structure
    const lines = sanitized.split('\n');
    const cleanLines = lines
      .map(line => line.trim())
      .filter(line => line.length > 0)
      .map(line => {
        // Ensure arrows are properly spaced and formatted
        return line.replace(/(\w+)(\s*-->?\s*)(\w+)/g, '$1 --> $3');
      });
    
    sanitized = cleanLines.join('\n');
    
    // Step 6: Final validation
    if (sanitized.length < 10 || !sanitized.includes('-->')) {
      console.log("Creating fallback diagram due to insufficient content");
      return 'graph TD\n    A[Start] --> B[End]';
    }
    
    console.log("Text sanitization complete:", sanitized);
    return sanitized;
  } catch (err) {
    console.error('Error in text sanitization:', err);
    return 'graph TD\n    A[Error_Fixed] --> B[Safe_Diagram]';
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
    
    // Fix 2: Apply comprehensive text sanitization
    fixedCode = sanitizeMermaidText(fixedCode);
    
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
    
    // Apply the comprehensive text sanitization
    sanitized = sanitizeMermaidText(sanitized);
    
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
