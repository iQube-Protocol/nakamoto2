
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
      .replace(/--\s+/g, '-->');
      
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
    
    // Fix 3: Handle parentheses in labels which often cause issues
    fixedCode = fixedCode.replace(/\[([^\]]*)\]/g, (match, content) => {
      // Replace problematic characters
      return `[${content.replace(/[()/,;]/g, '_')}]`;
    });
    
    // Fix 4: If too complex, provide a minimal working example
    if (fixedCode.length > 300) {
      fixedCode = `graph TD\n    A[Start] --> B[Middle] --> C[End]`;
    }
    
    return fixedCode;
  } catch (error) {
    console.error('Error during auto-fix:', error);
    return `graph TD\n    A[Auto-Fix] --> B[Failed]\n    B --> C[Basic Graph]`;
  }
};
