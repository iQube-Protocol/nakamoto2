
import React from 'react';
import {
  CodeBlock,
  BulletList,
  NumberedList,
  Heading2,
  Heading3,
  Heading4,
  KeyConcept,
  Tip,
  Warning,
  Definition,
  extractMermaidDiagram
} from './ContentFormatters';

interface MessageContentProps {
  content: string;
  sender: 'user' | 'agent';
}

// Function to process message content and convert it to JSX with formatting
const MessageContent = ({ content, sender }: MessageContentProps) => {
  if (sender === 'user') {
    return <p>{content}</p>;
  }

  // Split content by double newlines to identify paragraphs
  const paragraphs = content.split(/\n\n+/);
  
  return (
    <>
      {paragraphs.map((paragraph, pIndex) => {
        // Mermaid diagram detection and extraction
        if (paragraph.includes('```mermaid')) {
          const mermaidDiagram = extractMermaidDiagram(paragraph, pIndex);
          if (mermaidDiagram) return mermaidDiagram;
        }
        
        // Handle bullet points
        else if (paragraph.trim().startsWith('- ') || paragraph.trim().startsWith('* ')) {
          const bulletItems = paragraph
            .split(/\n/)
            .filter(line => line.trim().startsWith('- ') || line.trim().startsWith('* '))
            .map(item => item.replace(/^[*-] /, ''));
            
          return <BulletList key={pIndex} items={bulletItems} />;
        }
        
        // Handle numbered lists
        else if (/^\d+\.\s/.test(paragraph.trim())) {
          const listItems = paragraph
            .split(/\n/)
            .filter(line => /^\d+\.\s/.test(line.trim()))
            .map(item => item.replace(/^\d+\.\s/, ''));
            
          return <NumberedList key={pIndex} items={listItems} />;
        }
        
        // Handle headings
        else if (paragraph.startsWith('# ')) {
          return <Heading2 key={pIndex} text={paragraph.substring(2)} />;
        }
        else if (paragraph.startsWith('## ')) {
          return <Heading3 key={pIndex} text={paragraph.substring(3)} />;
        }
        else if (paragraph.startsWith('### ')) {
          return <Heading4 key={pIndex} text={paragraph.substring(4)} />;
        }
        
        // Handle key concepts with an icon
        else if (paragraph.toLowerCase().includes('key concept') || paragraph.toLowerCase().includes('important:')) {
          return <KeyConcept key={pIndex}>{paragraph}</KeyConcept>;
        }
        
        // Handle tips with an icon
        else if (paragraph.toLowerCase().includes('tip:') || paragraph.toLowerCase().includes('hint:')) {
          return <Tip key={pIndex}>{paragraph}</Tip>;
        }
        
        // Handle warnings or notes
        else if (paragraph.toLowerCase().includes('note:') || paragraph.toLowerCase().includes('warning:')) {
          return <Warning key={pIndex}>{paragraph}</Warning>;
        }
        
        // Handle code examples
        else if (paragraph.includes('```') && !paragraph.includes('```mermaid')) {
          const parts = paragraph.split('```');
          return (
            <div key={pIndex} className="my-4">
              {parts.map((part, partIndex) => {
                if (partIndex % 2 === 1) { // This is a code block
                  // Extract language if specified
                  const codeLines = part.split('\n');
                  const language = codeLines[0].trim();
                  const code = codeLines.slice(language ? 1 : 0).join('\n');
                  
                  return <CodeBlock key={partIndex} code={code} language={language} />;
                } else if (part.trim()) { // Regular text before/after code block
                  return <p key={partIndex} className="my-2">{part}</p>;
                }
                return null;
              })}
            </div>
          );
        }
        
        // Handle definition lists or term explanations
        else if (paragraph.includes(':') && paragraph.split(':')[0].trim().length < 30) {
          const term = paragraph.split(':')[0].trim();
          const definition = paragraph.split(':').slice(1).join(':').trim();
          
          return <Definition key={pIndex} term={term} definition={definition} />;
        }
        
        // Regular paragraph
        else if (paragraph.trim()) {
          return <p key={pIndex} className="my-3">{paragraph}</p>;
        }
        
        return null;
      })}
    </>
  );
};

export default MessageContent;
