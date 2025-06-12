import React from 'react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import MermaidDiagram from './MermaidDiagram';

interface MessageContentProps {
  content: string;
  sender: 'user' | 'agent' | 'system';
}

const MessageContent = ({ content, sender }: MessageContentProps) => {
  // Process the content to make it more user-friendly
  const processUserFriendlyContent = (text: string) => {
    return text
      // Convert technical headers to friendly emphasized text
      .replace(/^### (.+)$/gm, '\n**$1**\n')
      .replace(/^## (.+)$/gm, '\n**$1**\n')
      .replace(/^# (.+)$/gm, '\n**$1**\n')
      
      // Add friendly spacing around key concepts
      .replace(/\*\*([^*]+)\*\*/g, ' **$1** ')
      
      // Convert technical bullet points to friendlier format
      .replace(/^\* /gm, '• ')
      .replace(/^- /gm, '• ')
      
      // Add breathing room around paragraphs
      .replace(/\n\n/g, '\n\n\n')
      
      // Make numbered lists more friendly
      .replace(/^(\d+)\. /gm, '$1. ')
      
      // Add friendly transitions
      .replace(/^(Here's|Here are|Let me)/gm, '\n$1')
      .replace(/^(To|For|When|If)/gm, '\n$1')
      
      // Clean up extra spaces
      .replace(/ {2,}/g, ' ')
      .trim();
  };

  // Process code blocks
  const processedContent = content.split('```').map((part, i) => {
    // Even indices are regular text, odd indices are code blocks
    if (i % 2 === 0) {
      return processUserFriendlyContent(part);
    } else {
      // Extract the language and code
      const firstLineBreak = part.indexOf('\n');
      const language = firstLineBreak > 0 ? part.substring(0, firstLineBreak).trim() : '';
      const code = firstLineBreak > 0 ? part.substring(firstLineBreak + 1) : part;
      
      // Handle Mermaid diagrams
      if (language === 'mermaid') {
        return (
          <MermaidDiagram 
            key={i} 
            code={code} 
            id={`mermaid-${i}-${Date.now()}`}
          />
        );
      }
      
      // Handle regular code
      return (
        <SyntaxHighlighter 
          key={i}
          language={language || 'javascript'} 
          style={vscDarkPlus}
          className="rounded-md my-4"
        >
          {code}
        </SyntaxHighlighter>
      );
    }
  });

  // Create React elements for the processed content
  const elements = processedContent.map((part, i) => {
    if (typeof part === 'string') {
      // Process text parts for user-friendly formatting
      return (
        <div key={i} className="leading-relaxed">
          {part.split('\n').map((line, j) => {
            const trimmedLine = line.trim();
            
            // Skip empty lines but preserve spacing
            if (!trimmedLine) {
              return <div key={j} className="h-2" />;
            }
            
            // Handle friendly bullet points
            if (trimmedLine.startsWith('• ')) {
              return (
                <div key={j} className="flex items-start mt-2 mb-1">
                  <span className="text-iqube-accent mr-2 mt-0.5 flex-shrink-0">•</span>
                  <span className="flex-1">{trimmedLine.substring(2)}</span>
                </div>
              );
            }
            
            // Handle numbered lists
            if (trimmedLine.match(/^\d+\. /)) {
              const match = trimmedLine.match(/^(\d+)\. (.+)$/);
              if (match) {
                return (
                  <div key={j} className="flex items-start mt-2 mb-1">
                    <span className="text-iqube-accent font-medium mr-2 mt-0.5 flex-shrink-0">{match[1]}.</span>
                    <span className="flex-1">{match[2]}</span>
                  </div>
                );
              }
            }
            
            // Handle blockquotes (keep these for important callouts)
            if (trimmedLine.startsWith('> ')) {
              return (
                <div key={j} className="border-l-3 border-iqube-accent/50 pl-4 my-3 bg-iqube-primary/5 py-2 rounded-r-md">
                  <span className="text-iqube-accent/90 italic">{trimmedLine.substring(2)}</span>
                </div>
              );
            }
            
            // Process inline formatting
            const processInlineFormatting = (text: string) => {
              // Split by bold markers and process
              const parts = text.split(/(\*\*[^*]+\*\*)/);
              return parts.map((part, idx) => {
                if (part.startsWith('**') && part.endsWith('**')) {
                  return (
                    <strong key={idx} className="font-semibold text-iqube-accent">
                      {part.slice(2, -2)}
                    </strong>
                  );
                }
                return part;
              });
            };
            
            // Regular paragraph with better spacing
            return (
              <p key={j} className="mb-3 last:mb-0">
                {processInlineFormatting(trimmedLine)}
              </p>
            );
          })}
        </div>
      );
    } else {
      // Return already processed React elements (syntax highlighted code or diagrams)
      return part;
    }
  });

  return (
    <div className="prose prose-sm max-w-none user-friendly-content">
      {elements}
    </div>
  );
};

export default MessageContent;
