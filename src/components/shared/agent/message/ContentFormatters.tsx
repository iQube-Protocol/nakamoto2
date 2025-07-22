
import React from 'react';
import { AlertCircle, CheckCircle, Lightbulb } from 'lucide-react';
import MermaidDiagram from './MermaidDiagram';
import { sanitizeMermaidCode } from './utils/mermaidUtils';

// Component to format a code block
export const CodeBlock = ({ code, language }: { code: string; language?: string }) => {
  return (
    <pre className="bg-gray-100 p-3 rounded-md overflow-x-auto my-2">
      <code>{code}</code>
    </pre>
  );
};

// Component to format a bulleted list
export const BulletList = ({ items }: { items: string[] }) => {
  return (
    <ul className="pl-5 my-4 space-y-2">
      {items.map((item, index) => (
        <li key={index} className="flex items-start">
          <span className="mr-2 mt-1 text-iqube-primary">•</span>
          <span>{item}</span>
        </li>
      ))}
    </ul>
  );
};

// Component to format a numbered list
export const NumberedList = ({ items }: { items: string[] }) => {
  return (
    <ol className="pl-5 my-4 space-y-2 list-decimal">
      {items.map((item, index) => (
        <li key={index} className="ml-4">{item}</li>
      ))}
    </ol>
  );
};

// Heading components
export const Heading2 = ({ text }: { text: string }) => (
  <h2 className="text-xl font-bold mt-4 mb-2">{text}</h2>
);

export const Heading3 = ({ text }: { text: string }) => (
  <h3 className="text-lg font-bold mt-3 mb-2">{text}</h3>
);

export const Heading4 = ({ text }: { text: string }) => (
  <h4 className="text-base font-bold mt-3 mb-2">{text}</h4>
);

// Special content boxes
export const KeyConcept = ({ children }: { children: React.ReactNode }) => (
  <div className="flex my-4 p-3 bg-iqube-primary/10 rounded-md">
    <Lightbulb className="h-5 w-5 mr-2 flex-shrink-0 text-iqube-primary" />
    <div>{children}</div>
  </div>
);

export const Tip = ({ children }: { children: React.ReactNode }) => (
  <div className="flex my-4 p-3 bg-green-100 rounded-md">
    <CheckCircle className="h-5 w-5 mr-2 flex-shrink-0 text-green-600" />
    <div>{children}</div>
  </div>
);

export const Warning = ({ children }: { children: React.ReactNode }) => (
  <div className="flex my-4 p-3 bg-amber-100 rounded-md">
    <AlertCircle className="h-5 w-5 mr-2 flex-shrink-0 text-amber-500" />
    <div>{children}</div>
  </div>
);

// Definition list item
export const Definition = ({ term, definition }: { term: string; definition: string }) => (
  <div className="my-4">
    <dt className="font-bold">{term}:</dt>
    <dd className="ml-4">{definition}</dd>
  </div>
);

// Create a refined simple diagram when all else fails
const createSimpleDiagram = (title: string = "Diagram"): string => {
  return `graph TD
    A[Start] --> B["${title}"]
    B --> C[End]
    
    %% Styling directives
    classDef default fill:#FFFFFF,stroke:#7E69AB,stroke-width:2px,color:#1A1F2C,font-size:84px;
    classDef primary fill:#9B87F5,stroke:#7E69AB,stroke-width:2px,color:#1A1F2C,font-size:84px;
    
    class B primary;`;
};

// Enhanced function to extract and format mermaid diagrams with comprehensive error handling
export const extractMermaidDiagram = (paragraph: string, pIndex: number): JSX.Element | null => {
  try {
    console.log(`🔧 EXTRACT: Processing paragraph ${pIndex}:`, paragraph.substring(0, 100));
    
    // Better regex to capture mermaid code blocks with various prefixes
    const mermaidRegex = /```(?:mermaid|graph|flowchart|sequenceDiagram|classDiagram|stateDiagram|erDiagram|journey|gantt|pie|gitGraph)?\s*([\s\S]*?)```/i;
    const match = paragraph.match(mermaidRegex);
    
    if (match && match[1]) {
      let mermaidCode = match[1].trim();
      console.log(`🔧 EXTRACT: Raw mermaid code found:`, mermaidCode);
      
      // Use the robust sanitization function from utils
      mermaidCode = sanitizeMermaidCode(mermaidCode);
      console.log(`🔧 EXTRACT: Sanitized code:`, mermaidCode);
      
      // If sanitization results in a very short code, create a simple fallback
      if (mermaidCode.length < 20 || mermaidCode.includes('Error_Fixed')) {
        console.log("🔧 EXTRACT: Creating simple fallback due to sanitization issues");
        mermaidCode = createSimpleDiagram("Simplified View");
      }
      
      // Create a unique ID for this diagram
      const diagramId = `mermaid-diagram-${pIndex}-${Math.random().toString(36).substring(2, 9)}`;
      
      console.log(`🔧 EXTRACT: Final mermaid code for rendering:`, mermaidCode);
      
      return (
        <div key={diagramId} className="my-6">
          <MermaidDiagram code={mermaidCode} id={diagramId} />
        </div>
      );
    }
    
    console.log(`🔧 EXTRACT: No mermaid code found in paragraph ${pIndex}`);
  } catch (error) {
    console.error('🔧 EXTRACT: Error extracting mermaid diagram:', error);
    
    // Fallback to a very simple diagram when extraction fails completely
    const diagramId = `fallback-diagram-${pIndex}-${Math.random().toString(36).substring(2, 9)}`;
    const simpleDiagram = createSimpleDiagram("Error Recovery");
    
    return (
      <div key={diagramId} className="my-6">
        <MermaidDiagram code={simpleDiagram} id={diagramId} />
      </div>
    );
  }
  
  return null;
};
