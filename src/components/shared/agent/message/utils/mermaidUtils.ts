
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
    
    // Handle graph/flowchart directives
    if (result.startsWith('graph') || result.startsWith('flowchart')) {
      // Split into lines and rebuild with proper spacing
      const lines = result.split('\n');
      
      // Process the first line (graph directive)
      result = lines[0].trim() + '\n';
      
      // Process remaining lines with proper indentation
      if (lines.length > 1) {
        for (let i = 1; i < lines.length; i++) {
          const line = lines[i].trim();
          if (line) {
            // Safe processing of line content
            let processedLine = line;
            result += '    ' + processedLine + '\n';
          }
        }
      }
    }
    // If no directive is found, add a default one
    else if (!result.match(/^(sequenceDiagram|classDiagram|stateDiagram|erDiagram|journey|gantt|pie|gitGraph|graph|flowchart)/i)) {
      result = `graph TD\n    ${result.replace(/\n/g, '\n    ')}`;
    }
    
    // Fix common syntax issues
    result = result
      .replace(/([A-Za-z0-9_]+)\s*\[/g, '$1[') // Remove spaces before [
      .replace(/\s+\]/g, ']') // Remove spaces before ]
      .replace(/([A-Za-z0-9_\]]+)\s+-->/g, '$1-->') // Remove spaces before -->
      .replace(/--\s+->/g, '-->') // Fix broken arrows
      .replace(/--\s+/g, '-->')
      .replace(/\[\s*\]/g, '[Empty]'); // Replace empty brackets
      
    // Provide a simpler diagram if too complex
    if (result.length > 500 || result.split('\n').length > 20) {
      console.log('Diagram too complex, simplifying...');
      result = `graph TD\n    A[Start] --> B[Process]\n    B --> C[End]`;
    }
    
    return result;
  } catch (err) {
    console.error('Error processing mermaid code:', err);
    // Return a minimal valid diagram
    return 'graph TD\n    A[Error] --> B[Try Again]';
  }
};

// Auto-correct common mermaid syntax issues
export const attemptAutoFix = (originalCode: string): string => {
  console.log('Attempting to fix code:', originalCode);
  let fixedCode = originalCode.replace(/^SHOW_CODE_/, '');
  
  try {
    // Fix 1: Ensure proper graph type declaration
    if (!fixedCode.match(/^(graph|flowchart|sequenceDiagram|classDiagram|stateDiagram|erDiagram|journey|gantt|pie|gitGraph)/)) {
      fixedCode = 'graph TD\n' + fixedCode;
    }
    
    // Fix 2: Fix arrow syntax
    fixedCode = fixedCode
      .replace(/--\s*-+/g, '-->')
      .replace(/--(?!>)/g, '-->')
      .replace(/\s*-+\s*>/g, ' -->');
    
    // Fix 3: Fix node definition syntax
    const lines = fixedCode.split('\n');
    const fixedLines = lines.map(line => {
      // Skip comments and directives
      if (line.trim().startsWith('%') || line.match(/^(graph|flowchart|sequenceDiagram|classDiagram)/)) {
        return line;
      }
      
      // Add brackets to node references if missing
      return line.replace(/([A-Za-z0-9_]+)(?!\[|\()(\s*-->|\s*--|\s*-.-|\s*==)/g, '[$1]$2');
    });
    
    fixedCode = fixedLines.join('\n');
    
    // Fix 4: Handle parentheses in labels which often cause issues
    fixedCode = fixedCode.replace(/\[([^\]]*)\]/g, (match, content) => {
      // Replace problematic characters
      return `[${content.replace(/[()/,;]/g, '_')}]`;
    });
    
    // Fix 5: If all else fails, provide a minimal working example
    if (fixedCode.split('\n').length <= 2) {
      fixedCode = `graph TD\n    A[Start] --> B[Middle] --> C[End]`;
    }
    
    console.log('Auto-fixed code:', fixedCode);
    return fixedCode;
  } catch (error) {
    console.error('Error during auto-fix:', error);
    return `graph TD\n    A[Auto-Fix] --> B[Failed]\n    B --> C[Basic Graph]`;
  }
};

// Render mermaid diagram with error handling - Note: this function is no longer used
// Instead, we render directly in the MermaidDiagram component
export const renderMermaidDiagram = async (code: string, uniqueId: string): Promise<string> => {
  return new Promise(async (resolve, reject) => {
    try {
      const processedCode = code.trim();
      
      // Create a timeout for rendering
      const renderTimeout = setTimeout(() => {
        reject(new Error('Diagram rendering timed out'));
      }, 5000);
      
      try {
        const { svg } = await mermaid.render(uniqueId, processedCode);
        clearTimeout(renderTimeout);
        resolve(svg || '<div>Failed to generate diagram</div>');
      } catch (renderError) {
        clearTimeout(renderTimeout);
        reject(renderError);
      }
    } catch (error) {
      reject(error instanceof Error ? error : new Error('Unknown error in mermaid rendering'));
    }
  });
};
