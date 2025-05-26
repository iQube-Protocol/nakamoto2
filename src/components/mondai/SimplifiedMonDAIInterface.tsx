
import React from 'react';
import { SimplifiedAgentInterface } from '@/components/shared/agent';
import { useMondAI } from '@/hooks/use-mondai';

const SimplifiedMonDAIInterface: React.FC = () => {
  const {
    conversationId,
    handleAIMessage,
  } = useMondAI();

  // Enhanced initial message that mentions both knowledge bases
  const initialMessage = `Hello! I'm Aigent Nakamoto, your crypto-agentic AI assistant with access to both the **Qrypto COYN technical knowledge base** and the **mẹtaKnyts narrative universe**.

I can help you with:
• **Technical concepts**: iQubes, VFTs, COYN Protocol, tokenomics, smart contracts
• **Narrative elements**: mẹtaKnyts characters (KnowOne, Satoshi Nakamoto, FANG Gang, BAT Pack)
• **Worldbuilding**: Terra/Digitterra dual reality framework
• **Philosophy**: Clean Data principles, decentralized AI governance

Try asking about "metaKnyts", "KnowOne", "Terra and Digitterra", or any crypto/Web3 concept. I'll provide insights from both technical and narrative perspectives with proper citations.

What would you like to explore today?`;

  return (
    <div className="h-screen flex flex-col">
      <SimplifiedAgentInterface
        title="Aigent Nakamoto"
        description="Crypto-Agentic AI for Qrypto COYN + mẹtaKnyts"
        agentType="mondai" 
        onMessageSubmit={handleAIMessage}
        conversationId={conversationId}
        initialMessages={[
          {
            id: "1",
            sender: "agent",
            message: initialMessage,
            timestamp: new Date().toISOString(),
            metadata: {
              version: "1.0",
              modelUsed: "gpt-4o-mini",
              knowledgeSource: "Qrypto COYN + mẹtaKnyts Knowledge Bases",
              qryptoItemsFound: 0,
              metaKnytsItemsFound: 0,
              citations: []
            }
          }
        ]}
      />
    </div>
  );
};

export default SimplifiedMonDAIInterface;
