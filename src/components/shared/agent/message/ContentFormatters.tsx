
import React from 'react';
import { AlertCircle, CheckCircle, Lightbulb } from 'lucide-react';
import MermaidDiagram from './MermaidDiagram';

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

// Enhanced function to extract and format mermaid diagrams with improved error handling
export const extractMermaidDiagram = (paragraph: string, pIndex: number): JSX.Element | null => {
  try {
    // More robust regex to capture mermaid code blocks
    const mermaidRegex = /```(?:mermaid)?\s*(graph|flowchart|sequenceDiagram|classDiagram|stateDiagram|erDiagram|journey|gantt|pie|gitGraph|[\s\S]*?)```/i;
    const match = paragraph.match(mermaidRegex);
    
    if (match) {
      let mermaidCode = match[1].trim();
      
      // Ensure the code is not too complex or problematic
      if (mermaidCode.length > 1000) {
        mermaidCode = `graph TD
    A[Complex Diagram] --> B[Simplified for Display]`;
      }
      
      const diagramId = `mermaid-diagram-${pIndex}-${Math.random().toString(36).substring(2, 6)}`;
      
      return (
        <div key={diagramId} className="my-6">
          <MermaidDiagram code={mermaidCode} id={diagramId} />
        </div>
      );
    }
  } catch (error) {
    console.error('Error extracting mermaid diagram:', error);
  }
  
  return null;
};
