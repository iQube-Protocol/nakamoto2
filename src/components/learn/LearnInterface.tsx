
import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import AgentInterface from '@/components/shared/AgentInterface';
import { MetaQube } from '@/lib/types';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';
import ContentDisplay from './ContentDisplay';
import { defaultCourses } from './CourseList';
import { defaultCertifications } from './CertificationsList';
import { defaultAchievements } from './AchievementsList';

interface LearnInterfaceProps {
  metaQube: MetaQube;
}

const LearnInterface = ({ metaQube }: LearnInterfaceProps) => {
  const { toast } = useToast();
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [currentItemIndex, setCurrentItemIndex] = useState<number>(0);
  const [activeTab, setActiveTab] = useState<string | null>(null);
  
  const courses = defaultCourses;
  const certifications = defaultCertifications;
  const achievements = defaultAchievements;

  const getCurrentItems = () => {
    switch(activeTab) {
      case 'courses':
        return courses;
      case 'certifications':
        return certifications;
      case 'achievements':
        return achievements;
      default:
        return [];
    }
  };

  const currentItems = getCurrentItems();
  
  const goToPrev = () => {
    setCurrentItemIndex((prevIndex) => 
      prevIndex === 0 ? currentItems.length - 1 : prevIndex - 1
    );
  };

  const goToNext = () => {
    setCurrentItemIndex((prevIndex) => 
      prevIndex === currentItems.length - 1 ? 0 : prevIndex + 1
    );
  };

  const handleTabClick = (value: string) => {
    setActiveTab(prevTab => prevTab === value ? null : value);
    setCurrentItemIndex(0);
  };

  const handleAIMessage = async (message: string) => {
    try {
      const { data, error } = await supabase.functions.invoke('learn-ai', {
        body: { 
          message, 
          metaQube,
          conversationId 
        }
      });
      
      if (error) {
        console.error('Error calling learn-ai function:', error);
        throw new Error(error.message);
      }
      
      if (data.conversationId) {
        setConversationId(data.conversationId);
        console.log(`MCP conversation established with ID: ${data.conversationId}`);
        
        if (data.mcp) {
          console.log('MCP metadata:', data.mcp);
        }
      }
      
      return {
        id: Date.now().toString(),
        sender: 'agent' as const,
        message: data.message,
        timestamp: data.timestamp || new Date().toISOString(),
        metadata: data.mcp || null
      };
    } catch (error) {
      console.error('Failed to get AI response:', error);
      toast({
        title: "AI Service Error",
        description: "Could not connect to the AI service. Please try again later.",
        variant: "destructive"
      });
      
      return {
        id: Date.now().toString(),
        sender: 'agent' as const,
        message: "I'm sorry, I couldn't process your request. Please try again later.",
        timestamp: new Date().toISOString(),
      };
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-full">
      <div className="lg:col-span-2 flex flex-col">
        <AgentInterface
          title="Learning Assistant"
          description="Personalized web3 education based on your iQube data"
          agentType="learn"
          onMessageSubmit={handleAIMessage}
          initialMessages={[
            {
              id: "1",
              sender: "agent",
              message: "Welcome to your learning journey! Based on your iQube profile, I see you're interested in Web3 topics. Would you like to continue with your Web3 Fundamentals course or explore something new?",
              timestamp: new Date().toISOString(),
              metadata: {
                version: "1.0",
                modelUsed: "gpt-4o-mini"
              }
            }
          ]}
        />
      </div>

      <div className="space-y-6 flex flex-col">
        <div className="flex-grow">
          <ContentDisplay
            activeTab={activeTab}
            currentItemIndex={currentItemIndex}
            courses={courses}
            certifications={certifications}
            achievements={achievements}
            goToPrev={goToPrev}
            goToNext={goToNext}
          />
        </div>
      </div>

      <div className="lg:col-span-3">
        <Tabs value={activeTab || ''}>
          <TabsList className="w-full grid grid-cols-3">
            <TabsTrigger 
              value="courses" 
              onClick={() => handleTabClick('courses')}
              data-state={activeTab === 'courses' ? 'active' : ''}
            >
              Courses
            </TabsTrigger>
            <TabsTrigger 
              value="certifications" 
              onClick={() => handleTabClick('certifications')}
              data-state={activeTab === 'certifications' ? 'active' : ''}
            >
              Certifications
            </TabsTrigger>
            <TabsTrigger 
              value="achievements" 
              onClick={() => handleTabClick('achievements')}
              data-state={activeTab === 'achievements' ? 'active' : ''}
            >
              Achievements
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>
    </div>
  );
};

export default LearnInterface;
