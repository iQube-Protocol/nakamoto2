
import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { 
  Pagination, 
  PaginationContent, 
  PaginationItem, 
  PaginationLink 
} from '@/components/ui/pagination';

interface KnowledgeBaseProps {
  agentType: 'learn' | 'earn' | 'connect';
}

// Knowledge base items by agent type
const knowledgeItems = {
  learn: [
    { title: "Web3 Learning Module 1", description: "Introduction to blockchain fundamentals and web3 applications." },
    { title: "Web3 Learning Module 2", description: "Smart contracts and decentralized applications (dApps)." },
    { title: "Web3 Learning Module 3", description: "Cryptocurrency wallets and security best practices." },
    { title: "Web3 Learning Module 4", description: "DeFi platforms and yield optimization strategies." },
    { title: "Web3 Learning Module 5", description: "NFTs and digital ownership in the web3 space." },
    { title: "Web3 Learning Module 6", description: "DAOs and decentralized governance models." },
  ],
  earn: [
    { title: "Token Economics Guide 1", description: "MonDAI tokenomics and distribution model." },
    { title: "Token Economics Guide 2", description: "Staking rewards and participation incentives." },
    { title: "Token Economics Guide 3", description: "Earning opportunities through liquidity provision." },
    { title: "Token Economics Guide 4", description: "Token utility and ecosystem value capture." },
    { title: "Token Economics Guide 5", description: "Governance participation rewards." },
    { title: "Token Economics Guide 6", description: "Long-term token value appreciation strategies." },
  ],
  connect: [
    { title: "Community Guide 1", description: "Getting started with the MonDAI community." },
    { title: "Community Guide 2", description: "Participating in governance and proposal voting." },
    { title: "Community Guide 3", description: "Contributing to the ecosystem as a developer." },
    { title: "Community Guide 4", description: "Community events and meetups calendar." },
    { title: "Community Guide 5", description: "Ambassador program and community leadership." },
    { title: "Community Guide 6", description: "Cross-chain partnerships and integrations." },
  ]
};

const ITEMS_PER_PAGE = 4;

const KnowledgeBase = ({ agentType }: KnowledgeBaseProps) => {
  const [currentPage, setCurrentPage] = useState(1);
  const items = knowledgeItems[agentType] || [];
  const totalPages = Math.ceil(items.length / ITEMS_PER_PAGE);
  
  // Calculate items for current page
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const currentItems = items.slice(startIndex, endIndex);
  
  // Page navigation handlers
  const goToNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };
  
  const goToPrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };
  
  const goToPage = (page: number) => {
    setCurrentPage(page);
  };

  return (
    <div className="flex flex-col">
      <div className="p-4 pb-2">
        <h3 className="text-lg font-medium">Knowledge Base</h3>
        <p className="text-sm text-muted-foreground mt-1">
          Access specialized information related to {agentType === 'learn' ? 'web3 education' : 
            agentType === 'earn' ? 'MonDAI tokens' : 'community connections'}.
        </p>
      </div>
      
      <ScrollArea className="h-[350px] px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pb-4">
          {currentItems.map((item, i) => (
            <Card key={i} className="p-4 hover:bg-card/90 transition-colors cursor-pointer">
              <h4 className="font-medium">{item.title}</h4>
              <p className="text-sm text-muted-foreground mt-1">
                {item.description}
              </p>
            </Card>
          ))}
        </div>
      </ScrollArea>
      
      {totalPages > 1 && (
        <div className="p-2 border-t">
          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={goToPrevPage}
                  disabled={currentPage === 1}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
              </PaginationItem>
              
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <PaginationItem key={page}>
                  <PaginationLink
                    onClick={() => goToPage(page)}
                    isActive={page === currentPage}
                  >
                    {page}
                  </PaginationLink>
                </PaginationItem>
              ))}
              
              <PaginationItem>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={goToNextPage}
                  disabled={currentPage === totalPages}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      )}
    </div>
  );
};

export default KnowledgeBase;
