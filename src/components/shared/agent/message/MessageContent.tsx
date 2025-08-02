

import React from 'react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import DOMPurify from 'dompurify';
import MermaidDiagram from './MermaidDiagram';

interface MessageContentProps {
  content: string;
  sender: 'user' | 'agent' | 'system';
  metadata?: {
    historicResponse?: boolean;
    agentTheme?: string;
    [key: string]: any;
  };
}

// Extract key terms to avoid recreating on each render
const KEY_TERMS = ['iQube', 'COYN', 'QryptoCOYN', 'blockchain', 'smart contract', 'token', 'wallet', 'DeFi', 'NFT', 'Web3', 'cryptocurrency', 'metaKnyts', 'mẹtaKnyts', 'VFT', 'BlakQube', 'MetaQube', 'TokenQube'];

const MessageContent = ({ content, sender, metadata }: MessageContentProps) => {
  // SINGLE-POINT SANITIZATION - All content processing happens here only
  const sanitizedContent = React.useMemo(() => {
    if (!content) return '';
    
    // Protect Mermaid code blocks from sanitization
    const mermaidBlocks: string[] = [];
    let tempContent = content;
    
    // Extract and protect Mermaid blocks
    tempContent = tempContent.replace(/```mermaid\n([\s\S]*?)\n```/g, (match, code) => {
      const index = mermaidBlocks.length;
      mermaidBlocks.push(code.trim());
      return `__MERMAID_BLOCK_${index}__`;
    });
    
    // Now safely remove HTML div wrappers
    let cleaned = tempContent
      .replace(/<div class="historic-response[^"]*">/g, '')
      .replace(/<\/div>/g, '')
      .replace(/<div[^>]*>/g, '')
      .replace(/\s*<br\s*\/?>\s*/g, '\n')
      .trim();
    
    // Restore protected Mermaid blocks
    mermaidBlocks.forEach((code, index) => {
      cleaned = cleaned.replace(`__MERMAID_BLOCK_${index}__`, `\`\`\`mermaid\n${code}\n\`\`\``);
    });
    
    console.log('MessageContent: SINGLE-POINT sanitization:', { 
      original: content.substring(0, 100), 
      cleaned: cleaned.substring(0, 100),
      hasHTML: content.includes('<div'),
      hasMermaid: content.includes('```mermaid'),
      mermaidBlocksFound: mermaidBlocks.length,
      metadata 
    });
    
    return cleaned;
  }, [content, metadata]);
  // Memoized content processing to reduce re-computation
  const processUserFriendlyContent = React.useMemo(() => {
    return (text: string) => {
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
  }, []);

  // Process images and code blocks with memoization
  const processedContent = React.useMemo(() => {
    // First, extract and process images
    const imageRegex = /!\[([^\]]*)\]\(([^)]+)\)/g;
    const parts: (string | React.ReactElement)[] = [];
    let lastIndex = 0;
    let match;

    // Split content by images first
    const contentWithImages = sanitizedContent.replace(imageRegex, (match, alt, src) => {
      return `\n\n__IMAGE__${alt}__${src}__\n\n`;
    });

    // Now process code blocks
    return contentWithImages.split('```').map((part, i) => {
      // Even indices are regular text, odd indices are code blocks
      if (i % 2 === 0) {
        // Process text parts that might contain images
        const textParts: (string | React.ReactElement)[] = [];
        const imageParts = part.split(/\n\n__IMAGE__([^_]*)__([^_]*)__\n\n/);
        
        imageParts.forEach((textPart, j) => {
          if (j % 3 === 0) {
            // Regular text
            if (textPart.trim()) {
              textParts.push(processUserFriendlyContent(textPart));
            }
          } else if (j % 3 === 1) {
            // Alt text
            const alt = textPart;
            const src = imageParts[j + 1];
            if (src) {
              textParts.push(
                <div key={`image-${i}-${j}`} className="my-4 w-full">
                  <div className="w-full max-w-4xl mx-auto">
                    <img 
                      src={src} 
                      alt={alt}
                      className="w-full h-auto rounded-lg shadow-md border border-gray-200 object-contain"
                      style={{ maxHeight: '80vh' }}
                      onError={(e) => {
                        console.error('Failed to load image:', src);
                        e.currentTarget.style.display = 'none';
                      }}
                    />
                    {alt && (
                      <p className="text-center text-sm text-muted-foreground mt-3 px-2 italic">
                        {alt}
                      </p>
                    )}
                  </div>
                </div>
              );
            }
          }
          // Skip j % 3 === 2 as it's the src which we handle above
        });
        
        return textParts;
      } else {
        // Extract the language and code
        const firstLineBreak = part.indexOf('\n');
        const language = firstLineBreak > 0 ? part.substring(0, firstLineBreak).trim() : '';
        const code = firstLineBreak > 0 ? part.substring(firstLineBreak + 1) : part;
        
        // Handle Mermaid diagrams
        if (language === 'mermaid') {
          console.log('MessageContent: Processing Mermaid code:', { code: code.substring(0, 50), metadata });
          return (
            <MermaidDiagram 
              key={`mermaid-${i}-${Date.now()}`} 
              code={code} 
              id={`mermaid-${i}-${Date.now()}`}
            />
          );
        }
        
        // Handle regular code
        return (
          <SyntaxHighlighter 
            key={`code-${i}`}
            language={language || 'javascript'} 
            style={vscDarkPlus}
            className="rounded-md my-4"
          >
            {code}
          </SyntaxHighlighter>
        );
      }
    }).flat();
  }, [sanitizedContent, processUserFriendlyContent]);

  // Enhanced inline formatting processor with persistent markdown-style rendering
  const processInlineFormatting = React.useCallback((text: string) => {
    // Input validation
    if (!text || typeof text !== 'string') {
      return <span key="empty"></span>;
    }
    
    // Process markdown-style formatting with stable keys
    const parts: (string | React.ReactElement)[] = [];
    
    // Handle **bold** formatting first
    const boldRegex = /\*\*([^*]+)\*\*/g;
    let lastIndex = 0;
    let match;
    const textHash = text.length + text.charCodeAt(0); // Simple hash for stable keys
    
    while ((match = boldRegex.exec(text)) !== null) {
      // Add text before the match
      if (match.index > lastIndex) {
        parts.push(text.substring(lastIndex, match.index));
      }
      // Add bold text with stable key
      parts.push(
        <strong key={`bold-${textHash}-${match.index}`} className="font-semibold">
          {match[1]}
        </strong>
      );
      lastIndex = match.index + match[0].length;
    }
    
    // Add remaining text
    if (lastIndex < text.length) {
      parts.push(text.substring(lastIndex));
    }
    
    // If no bold formatting was found, use the original text
    if (parts.length === 0) {
      parts.push(text);
    }
    
    // Process key terms highlighting on string parts only with stable rendering
    const finalParts = parts.map((part, partIndex) => {
      if (typeof part === 'string') {
        // Apply key term highlighting
        let highlightedText = part;
        KEY_TERMS.forEach(term => {
          const regex = new RegExp(`\\b${term}\\b`, 'gi');
          highlightedText = highlightedText.replace(regex, `**${term}**`);
        });
        
        // If highlighting was applied, re-process for bold formatting
        if (highlightedText !== part) {
          const innerParts: (string | React.ReactElement)[] = [];
          const innerBoldRegex = /\*\*([^*]+)\*\*/g;
          let innerLastIndex = 0;
          let innerMatch;
          
          while ((innerMatch = innerBoldRegex.exec(highlightedText)) !== null) {
            if (innerMatch.index > innerLastIndex) {
              innerParts.push(highlightedText.substring(innerLastIndex, innerMatch.index));
            }
            innerParts.push(
              <span 
                key={`term-${textHash}-${partIndex}-${innerMatch.index}`} 
                className="key-term font-medium text-iqube-accent bg-iqube-accent/10 px-1 rounded"
              >
                {innerMatch[1]}
              </span>
            );
            innerLastIndex = innerMatch.index + innerMatch[0].length;
          }
          
          if (innerLastIndex < highlightedText.length) {
            innerParts.push(highlightedText.substring(innerLastIndex));
          }
          
          return innerParts.length > 0 ? innerParts : part;
        }
        
        return part;
      }
      return part;
    }).flat();
    
    return <span key={`processed-${textHash}`}>{finalParts}</span>;
  }, []);

  // Create React elements for the processed content with memoization
  const elements = React.useMemo(() => {
    return processedContent.map((part, i) => {
      if (typeof part === 'string') {
        // Process text parts for user-friendly formatting
        return (
          <div key={`text-${i}`} className="leading-relaxed">
            {part.split('\n').map((line, j) => {
              const trimmedLine = line.trim();
              
              // Skip empty lines but preserve spacing
              if (!trimmedLine) {
                return <div key={`empty-${j}`} className="h-2" />;
              }
              
              // Handle friendly bullet points with icons
              if (trimmedLine.startsWith('• ')) {
                return (
                  <div key={`bullet-${j}`} className="flex items-start mt-2 mb-1">
                    <span className="text-iqube-accent mr-3 mt-0.5 flex-shrink-0 text-lg">•</span>
                    <span className="flex-1 text-foreground">{trimmedLine.substring(2)}</span>
                  </div>
                );
              }
              
              // Handle numbered lists with friendly styling
              const numberedMatch = trimmedLine.match(/^(\d+)\. (.+)$/);
              if (numberedMatch) {
                return (
                  <div key={`numbered-${j}`} className="flex items-start mt-2 mb-1">
                    <span className="text-iqube-accent font-medium mr-3 mt-0.5 flex-shrink-0 bg-iqube-accent/10 px-2 py-0.5 rounded-full text-sm">{numberedMatch[1]}</span>
                    <span className="flex-1 text-foreground">{numberedMatch[2]}</span>
                  </div>
                );
              }
              
              // Handle conversational intro phrases with friendly styling
              if (trimmedLine.startsWith('Here\'s what you need to know') || 
                  trimmedLine.startsWith('Let me explain') || 
                  trimmedLine.startsWith('The key thing about')) {
                return (
                  <div key={`intro-${j}`} className="my-4 p-3 bg-iqube-primary/5 border-l-4 border-iqube-accent rounded-r-lg">
                    <span className="text-iqube-accent font-medium text-base">{trimmedLine}</span>
                  </div>
                );
              }
              
              // Handle important callouts naturally
              if (trimmedLine.startsWith('Important:') || 
                  trimmedLine.startsWith('Remember:') || 
                  trimmedLine.startsWith('Note:')) {
                return (
                  <div key={`callout-${j}`} className="my-3 p-3 bg-amber-50 border-l-4 border-amber-400 rounded-r-lg">
                    <span className="text-amber-800 font-medium">{trimmedLine}</span>
                  </div>
                );
              }
              
              // Handle blockquotes (keep these for important callouts)
              if (trimmedLine.startsWith('> ')) {
                return (
                  <div key={`quote-${j}`} className="border-l-3 border-iqube-accent/50 pl-4 my-3 bg-iqube-primary/5 py-2 rounded-r-md">
                    <span className="text-iqube-accent/90 italic">{trimmedLine.substring(2)}</span>
                  </div>
                );
              }
              
              // Regular paragraph with conversational styling
              return (
                <p key={`para-${j}`} className="mb-3 last:mb-0 text-foreground leading-relaxed">
                  {processInlineFormatting(trimmedLine)}
                </p>
              );
            })}
          </div>
        );
      } else {
        // Return already processed React elements (syntax highlighted code, diagrams, or images)
        return part;
      }
    });
  }, [processedContent, processInlineFormatting]);

  // Apply historical styling if this is a historic response
  const containerClassName = React.useMemo(() => {
    let baseClasses = "prose prose-sm max-w-none conversational-content";
    
    if (metadata?.historicResponse) {
      baseClasses += ` historic-response ${metadata.agentTheme || 'default'}-theme opacity-80`;
    }
    
    return baseClasses;
  }, [metadata]);

  return (
    <div className={containerClassName}>
      {elements}
    </div>
  );
};

export default MessageContent;

