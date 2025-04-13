
import mermaid from 'mermaid';

// Initialize mermaid with safer configuration
mermaid.initialize({
  startOnLoad: false,
  theme: 'neutral',
  securityLevel: 'loose',
  fontFamily: 'inherit',
  flowchart: {
    htmlLabels: true,
    curve: 'cardinal',
  },
  themeVariables: {
    primaryColor: '#4f46e5',
    primaryTextColor: '#ffffff',
    primaryBorderColor: '#3730a3',
    lineColor: '#6366f1',
    secondaryColor: '#818cf8',
    tertiaryColor: '#e0e7ff'
  }
});

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
            // Sanitize node labels to remove problematic characters
            let processedLine = line
              .replace(/\[([^\]]*)\]/g, (match, content) => {
                // Replace spaces, parentheses with safe characters
                const safeContent = content
                  .replace(/\s+/g, '_')
                  .replace(/\(/g, '〈')
                  .replace(/\)/g, '〉')
                  .replace(/,/g, '،');
                return `[${safeContent}]`;
              });
              
            result += '    ' + processedLine + '\n';
          }
        }
      }
    }
    // Handle other diagram types or create a default flowchart
    else if (!result.match(/^(sequenceDiagram|classDiagram|stateDiagram|erDiagram|journey|gantt|pie|gitGraph)/i)) {
      // Default to simple flowchart if no recognized directive
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
      
    // If we detect it's a complete mess, provide a simple working diagram
    if (result.length > 500 || result.split('\n').length > 20) {
      console.log('Diagram too complex, simplifying...');
      result = `graph TD
    A[Start] --> B[Process]
    B --> C[End]`;
    }
    
    return result;
  } catch (err) {
    console.error('Error processing mermaid code:', err);
    // Return a minimal valid diagram
    return 'graph TD\n    A[Error] --> B[Try Again]';
  }
};

// Render mermaid diagram with error handling
export const renderMermaidDiagram = async (code: string, uniqueId: string): Promise<string> => {
  try {
    // Process the code to fix common issues
    const processedCode = processCode(code);
    
    // Parse the diagram to check for errors
    await mermaid.parse(processedCode);
    
    // If parsing succeeds, render the diagram
    const { svg } = await mermaid.render(uniqueId, processedCode);
    
    // After rendering, clean up the result
    const finalSvg = svg
      .replace(/〈/g, '(')
      .replace(/〉/g, ')')
      .replace(/،/g, ',');
    
    return finalSvg;
  } catch (error) {
    console.error('Mermaid rendering error:', error);
    throw error;
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
      fixedCode = `graph TD
    A[Start] --> B[Middle] --> C[End]`;
    }
    
    console.log('Auto-fixed code:', fixedCode);
    return fixedCode;
  } catch (error) {
    console.error('Error during auto-fix:', error);
    return `graph TD
    A[Auto-Fix] --> B[Failed]
    B --> C[Basic Graph]`;
  }
};
