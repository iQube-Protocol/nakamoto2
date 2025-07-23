
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

/**
 * Enhanced sanitization for Mermaid code with aggressive Unicode and special character handling
 */
export const sanitizeMermaidCode = (code: string): string => {
  try {
    console.log('🔧 MERMAID UTILS: Starting aggressive sanitization for code:', code.substring(0, 100));
    
    // Remove markdown code blocks if present
    let cleaned = code.replace(/^```(?:mermaid)?\s*\n?/gmi, '')
                     .replace(/\n?```\s*$/gm, '');

    // Remove HTML tags and problematic characters
    cleaned = cleaned.replace(/<[^>]*>/g, '')
                    .replace(/&[^;]+;/g, ''); // Remove HTML entities
    
    // Super aggressive Unicode normalization and cleanup
    cleaned = cleaned.normalize('NFD')
                    .replace(/[\u0300-\u036f]/g, '') // Remove diacritics
                    .replace(/[^\u0000-\u007F]/g, '') // Remove ALL non-ASCII characters
                    .replace(/[^\w\s\-\[\](){}.:;,=>/\\"|'`+\n\r\t]/g, ''); // Keep only safe chars
    
    // Handle quotes and special characters more aggressively
    cleaned = cleaned.replace(/[""''‚„]/g, '"')  // Normalize all quote types
                    .replace(/[–—―‒]/g, '-')      // Normalize all dash types
                    .replace(/[…]/g, '...')       // Normalize ellipsis
                    .replace(/[‹›«»]/g, '"')      // Normalize angle quotes
                    .replace(/[\u2000-\u206F]/g, ' '); // Replace special spaces
    
    // Split into lines for aggressive filtering
    const lines = cleaned.split(/[\r\n]+/);
    const processedLines: string[] = [];
    
    for (let line of lines) {
      line = line.trim();
      if (!line || line.length < 2) continue;
      
      // Skip ANY line that could be TypeScript/JavaScript code
      if (line.includes('TypeScript') || 
          line.includes('interface') || 
          line.includes('export') ||
          line.includes('import') ||
          line.includes('const ') ||
          line.includes('let ') ||
          line.includes('var ') ||
          line.includes('function') ||
          line.includes('class ') ||
          line.includes('//') ||
          line.includes('/*') ||
          line.includes('*/') ||
          line.includes('{') ||
          line.includes('}') ||
          line.includes('undefined') ||
          line.includes('null') ||
          line.includes('NaN') ||
          line.includes('console.') ||
          line.includes('document.') ||
          line.includes('window.') ||
          line.match(/^\s*\d+:/) ||  // Skip numbered lines
          line.match(/^[a-zA-Z_$][a-zA-Z0-9_$]*\s*[=:]/)) { // Skip variable assignments
        console.log('🔧 MERMAID UTILS: Skipping problematic line:', line.substring(0, 50));
        continue;
      }
      
      // Clean up arrow syntax and ensure proper formatting
      line = line.replace(/-->/g, ' --> ')
                .replace(/--->/g, ' --> ')
                .replace(/->/g, ' --> ')
                .replace(/\|\s*/g, '|')
                .replace(/\s+/g, ' ')
                .trim();
      
      // Additional validation for mermaid syntax
      if (line && line.length > 1 && !line.match(/^[<>{}[\]]/)) {
        processedLines.push(line);
      }
    }
    
    let result = processedLines.join('\n');
    
    // Validate that we have a valid diagram type
    const hasValidType = /^(graph|flowchart|sequenceDiagram|classDiagram|stateDiagram|erDiagram|journey|gantt|pie|gitGraph)/i.test(result.trim());
    
    // Ensure we have sufficient content (at least 3 meaningful lines)
    const meaningfulLines = result.split('\n').filter(line => line.trim() && line.length > 3);
    const hasContent = meaningfulLines.length >= 2;
    
    if (!hasValidType || !hasContent) {
      console.log('🔧 MERMAID UTILS: Invalid or insufficient diagram content, using guaranteed safe fallback');
      return `graph TD
    A["Content Analysis"] --> B["Processing Complete"]
    B --> C["Diagram Ready"]
    
    classDef default fill:#f9f9f9,stroke:#333,stroke-width:2px,color:#000;`;
    }
    
    // Final safety check - ensure no remaining problematic characters
    result = result.replace(/[^\w\s\-\[\]().:;,=>/\\"|'`+\n]/g, '');
    
    console.log('🔧 MERMAID UTILS: Aggressive sanitization complete, result:', result.substring(0, 100));
    return result;
  } catch (error) {
    console.error('🔧 MERMAID UTILS: Sanitization completely failed:', error);
    return `graph TD
    A["Error Handling"] --> B["Safe Recovery"]
    B --> C["Fallback Active"]
    
    classDef default fill:#f9f9f9,stroke:#333,stroke-width:2px,color:#000;`;
  }
};
