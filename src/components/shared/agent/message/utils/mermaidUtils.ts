
import mermaid from 'mermaid';

// Initialize mermaid with better configuration for rendering
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
  // Ensure the code starts with proper directive
  let result = inputCode.trim();
  
  // Handle graph/flowchart directives
  if (result.startsWith('graph') || result.startsWith('flowchart')) {
    // Split the first line from the rest to process separately
    const firstLineEnd = result.indexOf('\n');
    const firstLine = firstLineEnd > -1 ? result.substring(0, firstLineEnd).trim() : result;
    const restOfCode = firstLineEnd > -1 ? result.substring(firstLineEnd + 1) : '';
    
    // Ensure there's a line break after the directive
    result = firstLine + '\n';
    
    // Process the rest line by line
    if (restOfCode) {
      const lines = restOfCode.split('\n');
      lines.forEach(line => {
        if (line.trim()) {
          // Escape parentheses in node labels to prevent parsing errors
          let processedLine = line.trim();
          
          // Replace spaces in node labels with underscores to prevent parsing issues
          processedLine = processedLine.replace(/\[([^\]]*)\]/g, (match, content) => {
            // Replace spaces with underscores in node labels
            const safeContent = content.replace(/\s+/g, '_');
            // Also replace parentheses with safer characters
            return `[${safeContent}]`;
          });
          
          result += '    ' + processedLine + '\n';
        }
      });
    }
  }
  // Other diagram types
  else if (!result.match(/^(sequenceDiagram|classDiagram|stateDiagram|erDiagram|journey|gantt|pie|gitGraph)/i)) {
    // Default to flowchart if no recognized directive
    result = `graph TD\n    ${result.replace(/\n/g, '\n    ')}`;
  }
  
  // Fix common syntax issues
  result = result
    .replace(/([A-Za-z0-9_]+)\s*\[/g, '$1[') // Remove spaces before [
    .replace(/\[\s+/g, '[') // Remove spaces after [
    .replace(/\s+\]/g, ']') // Remove spaces before ]
    .replace(/([A-Za-z0-9_\]]+)\s+-->/g, '$1-->') // Remove spaces before -->
    .replace(/--\s+->/g, '-->') // Fix broken arrows like "-- ->"
    .replace(/--\s+/g, '-->'); // Fix other broken arrows
    
  // Special processing for parentheses in node text which cause parsing errors
  result = result.replace(/\[([^\]]*\([^\]]*\)[^\]]*)\]/g, (match, content) => {
    // Replace parentheses with brackets or similar to avoid parsing issues
    const safeContent = content
      .replace(/\(/g, '〈')
      .replace(/\)/g, '〉')
      .replace(/,/g, '،') // Replace commas with a similar character
      .replace(/;/g, '؛'); // Replace semicolons
    return `[${safeContent}]`;
  });
  
  // Handle nodes with complex names containing problematic characters
  result = result.replace(/\[([^\]]+)\]/g, (match, content) => {
    // Make node names safe by replacing problematic characters
    let safeContent = content
      .replace(/\s+/g, '_')        // Replace spaces with underscores
      .replace(/[.,;:]/g, '_')     // Replace punctuation with underscores
      .replace(/[()]/g, '_')       // Replace parentheses with underscores
      .replace(/["']/g, '')        // Remove quotes
      .replace(/-+/g, '_')         // Replace hyphens with underscores
      .replace(/[^a-zA-Z0-9_]/g, ''); // Remove any other problematic characters
    
    // Ensure we have some content after all the replacements
    if (!safeContent.trim()) {
      safeContent = 'node_' + Math.random().toString(36).substring(2, 7);
    }
    
    return `[${safeContent}]`;
  });
  
  return result;
};

// Parse and render mermaid diagram
export const renderMermaidDiagram = async (code: string, uniqueId: string): Promise<string> => {
  try {
    // Process the code to fix common issues
    const processedCode = processCode(code);
    
    // Log the processed code for debugging
    console.log('Processed mermaid code:', processedCode);
    
    // Parse the diagram to check for errors
    await mermaid.parse(processedCode);
    
    // If parsing succeeds, render the diagram
    const { svg } = await mermaid.render(uniqueId, processedCode);
    
    // After rendering, replace back any special characters we substituted
    const finalSvg = svg
      .replace(/〈/g, '(')
      .replace(/〉/g, ')')
      .replace(/،/g, ',')
      .replace(/؛/g, ';');
    
    return finalSvg;
  } catch (error) {
    console.error('Mermaid rendering error:', error);
    throw error;
  }
};

// Auto-correct common mermaid syntax issues
export const attemptAutoFix = (originalCode: string): string => {
  console.log('Attempting to fix code:', originalCode);
  let fixedCode = originalCode;
  
  // Fix 1: Ensure proper graph type declaration
  if (!fixedCode.match(/^(graph|flowchart|sequenceDiagram|classDiagram|stateDiagram|erDiagram|journey|gantt|pie|gitGraph)/)) {
    fixedCode = 'graph TD\n' + fixedCode;
  }
  
  // Fix 2: Fix arrow syntax
  fixedCode = fixedCode
    .replace(/--\s*-+/g, '-->')
    .replace(/--(?!>)/g, '-->')
    .replace(/\s*-+\s*>/g, ' -->');
  
  // Fix 3: Ensure nodes have brackets
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
  
  // Fix 4: Convert complex diagrams to simpler syntax
  if (fixedCode.includes('--') || fixedCode.includes('->')) {
    // If the diagram has complex relationship syntax, convert to a simpler TD flowchart
    const nodeMatches = fixedCode.match(/([A-Za-z0-9_]+)(\[[^\]]+\])?/g);
    if (nodeMatches && nodeMatches.length > 1) {
      // Create a simple top-down flowchart with the extracted nodes
      let simpleGraph = 'graph TD\n';
      for (let i = 0; i < nodeMatches.length - 1; i++) {
        const uniqueId = `node${i}_${Math.random().toString(36).substring(2, 5)}`;
        simpleGraph += `    ${uniqueId}[Node ${i+1}] --> `;
        
        const nextUniqueId = `node${i+1}_${Math.random().toString(36).substring(2, 5)}`;
        simpleGraph += `${nextUniqueId}[Node ${i+2}]\n`;
      }
      fixedCode = simpleGraph;
    }
  }
  
  // If all else fails, provide a minimal working example
  if (fixedCode.split('\n').length <= 2) {
    fixedCode = `graph TD
    A[Start] --> B[End]`;
  }
  
  console.log('Auto-fixed code:', fixedCode);
  return fixedCode;
};
