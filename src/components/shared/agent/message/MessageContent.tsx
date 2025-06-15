
import React from 'react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import MermaidDiagram from './MermaidDiagram';

interface MessageContentProps {
  content: string;
  sender: 'user' | 'agent' | 'system';
}

const MessageContent = ({ content, sender }: MessageContentProps) => {
  // Process the content to make it more user-friendly for all message types
  const processUserFriendlyContent = (text: string) => {
    return text
      // Convert technical headers to friendly introductory phrases
      .replace(/^### (.+)$/gm, '\nHere\'s what you need to know about $1:\n')
      .replace(/^## (.+)$/gm, '\nLet me explain $1:\n')
      .replace(/^# (.+)$/gm, '\nThe key thing about $1:\n')
      
      // Convert **bold** to more natural emphasis patterns
      .replace(/\*\*([^*]+)\*\*/g, '$1')
      
      // Convert technical bullet points to friendlier format
      .replace(/^\* /gm, '• ')
      .replace(/^- /gm, '• ')
      
      // Add breathing room around paragraphs
      .replace(/\n\n/g, '\n\n\n')
      
      // Make numbered lists more friendly
      .replace(/^(\d+)\. /gm, '$1. ')
      
      // Add friendly transitions and natural conversation starters
      .replace(/^(Here's|Here are|Let me)/gm, '\n$1')
      .replace(/^(To|For|When|If)/gm, '\n$1')
      .replace(/^(The key|Important|Remember)/gm, '\n$1')
      
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
            
            // Handle friendly bullet points with icons
            if (trimmedLine.startsWith('• ')) {
              return (
                <div key={j} className="flex items-start mt-2 mb-1">
                  <span className="text-iqube-accent mr-3 mt-0.5 flex-shrink-0 text-lg">•</span>
                  <span className="flex-1 text-foreground">{trimmedLine.substring(2)}</span>
                </div>
              );
            }
            
            // Handle numbered lists with friendly styling
            if (trimmedLine.match(/^\d+\. /)) {
              const match = trimmedLine.match(/^(\d+)\. (.+)$/);
              if (match) {
                return (
                  <div key={j} className="flex items-start mt-2 mb-1">
                    <span className="text-iqube-accent font-medium mr-3 mt-0.5 flex-shrink-0 bg-iqube-accent/10 px-2 py-0.5 rounded-full text-sm">{match[1]}</span>
                    <span className="flex-1 text-foreground">{match[2]}</span>
                  </div>
                );
              }
            }
            
            // Handle conversational intro phrases with friendly styling
            if (trimmedLine.startsWith('Here\'s what you need to know') || 
                trimmedLine.startsWith('Let me explain') || 
                trimmedLine.startsWith('The key thing about')) {
              return (
                <div key={j} className="my-4 p-3 bg-iqube-primary/5 border-l-4 border-iqube-accent rounded-r-lg">
                  <span className="text-iqube-accent font-medium text-base">{trimmedLine}</span>
                </div>
              );
            }
            
            // Handle important callouts naturally
            if (trimmedLine.startsWith('Important:') || 
                trimmedLine.startsWith('Remember:') || 
                trimmedLine.startsWith('Note:')) {
              return (
                <div key={j} className="my-3 p-3 bg-amber-50 border-l-4 border-amber-400 rounded-r-lg">
                  <span className="text-amber-800 font-medium">{trimmedLine}</span>
                </div>
              );
            }
            
            // Handle blockquotes (keep these for important callouts)
            if (trimmedLine.startsWith('> ')) {
              return (
                <div key={j} className="border-l-3 border-iqube-accent/50 pl-4 my-3 bg-iqube-primary/5 py-2 rounded-r-md">
                  <span className="text-iqube-accent/90 italic">{trimmedLine.substring(2)}</span>
                </div>
              );
            }
            
            // Process key terms and important words with subtle highlighting
            const processInlineFormatting = (text: string) => {
              // Look for key technical terms and add subtle emphasis
              const keyTerms = ['iQube', 'COYN', 'QryptoCOYN', 'blockchain', 'smart contract', 'token', 'wallet', 'DeFi', 'NFT', 'Web3', 'cryptocurrency', 'metaKnyts', 'mẹtaKnyts', 'VFT', 'BlakQube', 'MetaQube', 'TokenQube'];
              let processedText = text;
              
              keyTerms.forEach(term => {
                const regex = new RegExp(`\\b${term}\\b`, 'gi');
                processedText = processedText.replace(regex, `<span class="key-term">${term}</span>`);
              });
              
              return <span dangerouslySetInnerHTML={{ __html: processedText }} />;
            };
            
            // Regular paragraph with conversational styling
            return (
              <p key={j} className="mb-3 last:mb-0 text-foreground leading-relaxed">
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
    <div className="prose prose-sm max-w-none conversational-content">
      {elements}
    </div>
  );
};

export default MessageContent;
