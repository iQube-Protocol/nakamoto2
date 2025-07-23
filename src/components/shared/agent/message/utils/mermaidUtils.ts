
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

// Enhanced sanitization function that's comprehensive and robust
export const sanitizeMermaidCode = (code: string): string => {
  try {
    console.log("🔧 SANITIZE: Starting sanitization of:", code.substring(0, 50));
    
    // Remove any markdown formatting remnants
    let cleanCode = code.replace(/^```(?:mermaid)?\s*/i, '').replace(/```\s*$/, '').trim();
    
    // Remove any XML/HTML tags that might be present
    cleanCode = cleanCode.replace(/<[^>]*>/g, '');
    
    // Extract the diagram type (if present) and preserve it
    const typeMatch = cleanCode.match(/^(graph|flowchart|sequenceDiagram|classDiagram|stateDiagram|erDiagram|journey|gantt|pie|gitGraph)\s/i);
    const diagramType = typeMatch ? typeMatch[1] : null;
    
    // If no type is found, assume it's a graph
    if (!diagramType && !cleanCode.startsWith('graph') && !cleanCode.startsWith('flowchart')) {
      cleanCode = `graph TD\n${cleanCode}`;
    }
    
    // Apply comprehensive text sanitization
    cleanCode = sanitizeMermaidText(cleanCode);
    
    // Additional validation: ensure we don't have problematic patterns
    const problematicPatterns = [
      /[<>]/g,  // Remove any remaining angle brackets
      /["']{3,}/g,  // Remove triple quotes or more
      /\n{3,}/g,  // Collapse multiple newlines
    ];
    
    problematicPatterns.forEach(pattern => {
      if (pattern.source.includes('<>')) {
        cleanCode = cleanCode.replace(pattern, '');
      } else if (pattern.source.includes('{"\'"}')) {
        cleanCode = cleanCode.replace(pattern, '"');
      } else if (pattern.source.includes('\\n')) {
        cleanCode = cleanCode.replace(pattern, '\n\n');
      }
    });
    
    // Validate that we have a valid diagram type
    const validTypes = ['graph', 'flowchart', 'sequenceDiagram', 'classDiagram', 'stateDiagram', 'erDiagram', 'journey', 'gantt', 'pie', 'gitGraph'];
    const hasValidType = validTypes.some(type => cleanCode.toLowerCase().startsWith(type.toLowerCase()));
    
    if (!hasValidType) {
      console.log("🔧 SANITIZE: No valid type found, creating simple graph");
      return `graph TD
    A[Start] --> B[Process]
    B --> C[End]
    
    classDef default fill:#f9f9f9,stroke:#333,stroke-width:2px;`;
    }
    
    // Final validation: ensure minimum content
    if (cleanCode.length < 10) {
      console.log("🔧 SANITIZE: Code too short, using fallback");
      return `graph TD
    A[Content] --> B[Processed]
    
    classDef default fill:#f9f9f9,stroke:#333,stroke-width:2px;`;
    }
    
    console.log("🔧 SANITIZE: Sanitization complete:", cleanCode.substring(0, 100));
    return cleanCode;
  } catch (error) {
    console.error("🔧 SANITIZE: Error during sanitization:", error);
    // Return a guaranteed-to-work simple diagram
    return `graph TD
    A[Start] --> B[End]
    
    classDef default fill:#f9f9f9,stroke:#333,stroke-width:2px;`;
  }
};
