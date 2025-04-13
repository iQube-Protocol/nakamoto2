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
          result += '    ' + line.trim() + '\n';
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
  return result
    .replace(/([A-Za-z0-9_]+)\s*\[/g, '$1[') // Remove spaces before [
    .replace(/\[\s+/g, '[') // Remove spaces after [
    .replace(/\s+\]/g, ']') // Remove spaces before ]
    .replace(/([A-Za-z0-9_\]]+)\s+-->/g, '$1-->') // Remove spaces before -->
    .replace(/--\s+->/g, '-->') // Fix broken arrows like "-- ->"
    .replace(/--\s+/g, '-->'); // Fix other broken arrows
};

// Parse and render mermaid diagram
export const renderMermaidDiagram = async (code: string, uniqueId: string): Promise<string> => {
  try {
    // Process the code to fix common issues
    const processedCode = processCode(code);
    
    // Parse the diagram to check for errors
    await mermaid.parse(processedCode);
    
    // If parsing succeeds, render the diagram
    const { svg } = await mermaid.render(uniqueId, processedCode);
    return svg;
  } catch (error) {
    throw error;
  }
};

// Auto-correct common mermaid syntax issues
export const attemptAutoFix = (originalCode: string): string => {
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
  
  return fixedLines.join('\n');
};
