
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { BookOpen, FileText, Video, Award, ArrowRight, ChevronLeft, ChevronRight, EllipsisVertical } from 'lucide-react';
import AgentInterface from '@/components/shared/AgentInterface';
import MetaQubeDisplay from '@/components/shared/MetaQubeDisplay';
import { MetaQube } from '@/lib/types';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';
import CourseCard from './CourseCard';

interface LearnInterfaceProps {
  metaQube: MetaQube;
}

const LearnInterface = ({ metaQube }: LearnInterfaceProps) => {
  const { toast } = useToast();
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [currentItemIndex, setCurrentItemIndex] = useState<number>(0);
  const [activeTab, setActiveTab] = useState<string>('courses');
  
  const courses = [
    {
      id: 1,
      title: "Web3 Fundamentals",
      description: "Learn the basics of blockchain, smart contracts, and web3 applications.",
      progress: 65,
      lessons: 12,
      completed: 8,
      icon: <BookOpen className="h-10 w-10 text-blue-400" />,
    },
    {
      id: 2,
      title: "iQube Protocol",
      description: "Understand the iQube protocol architecture and its layers.",
      progress: 30,
      lessons: 8,
      completed: 2,
      icon: <FileText className="h-10 w-10 text-purple-400" />,
    },
    {
      id: 3,
      title: "Decentralized Applications",
      description: "Build and deploy your own dApps using modern frameworks.",
      progress: 10,
      lessons: 15,
      completed: 1,
      icon: <Video className="h-10 w-10 text-green-400" />,
    },
  ];

  const certifications = [
    {
      id: 1,
      title: "Web3 Fundamentals",
      description: "Blockchain basics and smart contract fundamentals",
      status: "In progress - 65% complete",
      icon: <Award className="h-12 w-12 text-amber-500" />,
      unlocked: true,
    },
    {
      id: 2,
      title: "iQube Protocol Expert",
      description: "Master the iQube protocol architecture and implementation",
      status: "Locked - Complete prerequisites first",
      icon: <Award className="h-12 w-12 text-gray-300" />,
      unlocked: false,
    },
    {
      id: 3,
      title: "Advanced dApp Development",
      description: "Building complex decentralized applications with advanced features",
      status: "Locked - Complete prerequisites first",
      icon: <Award className="h-12 w-12 text-gray-300" />,
      unlocked: false,
    },
  ];
  
  const achievements = [
    { id: 1, title: "First Steps", status: "Unlocked", unlocked: true },
    { id: 2, title: "Knowledge Seeker", status: "Unlocked", unlocked: true },
    { id: 3, title: "Quiz Master", status: "Unlocked", unlocked: true },
    { id: 4, title: "Web3 Explorer", status: "Locked", unlocked: false },
    { id: 5, title: "Token Sage", status: "Locked", unlocked: false },
    { id: 6, title: "Community Leader", status: "Locked", unlocked: false },
    { id: 7, title: "Developer", status: "Locked", unlocked: false },
    { id: 8, title: "iQube Master", status: "Locked", unlocked: false },
  ];

  // Determine which items to show based on active tab
  const getCurrentItems = () => {
    switch(activeTab) {
      case 'courses':
        return courses;
      case 'certifications':
        return certifications;
      case 'achievements':
        return achievements;
      default:
        return courses;
    }
  };

  const currentItems = getCurrentItems();
  
  // Navigation functions
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

  // Handle AI message submission with MCP support
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
      
      // Store the conversation ID for future messages
      if (data.conversationId) {
        setConversationId(data.conversationId);
        console.log(`MCP conversation established with ID: ${data.conversationId}`);
        
        // Log MCP metadata if available
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

  // Render different card content based on tab
  const renderCurrentItemCard = () => {
    const current = currentItems[currentItemIndex];
    
    if (!current) return null;
    
    if (activeTab === 'courses') {
      return <CourseCard course={current as typeof courses[0]} />;
    } else if (activeTab === 'certifications') {
      const cert = current as typeof certifications[0];
      return (
        <Card className="h-full">
          <CardContent className="p-6 h-full flex flex-col">
            {cert.icon}
            <h3 className="font-semibold mb-1 mt-4">{cert.title}</h3>
            <p className="text-sm text-muted-foreground mb-4">{cert.description}</p>
            <div className="text-xs text-muted-foreground mt-auto">
              {cert.status}
            </div>
          </CardContent>
        </Card>
      );
    } else if (activeTab === 'achievements') {
      const achievement = current as typeof achievements[0];
      return (
        <Card className="h-full">
          <CardContent className="p-6 h-full flex flex-col items-center justify-center text-center">
            <div className={`mx-auto rounded-full w-12 h-12 flex items-center justify-center mb-4 ${
              achievement.unlocked ? "bg-gradient-to-r from-iqube-primary to-iqube-accent" : "bg-gray-200"
            }`}>
              {achievement.unlocked ? (
                <Award className="h-6 w-6 text-white" />
              ) : (
                <Award className="h-6 w-6 text-gray-400" />
              )}
            </div>
            <h3 className="text-lg font-medium mb-2">{achievement.title}</h3>
            <p className="text-sm text-muted-foreground">{achievement.status}</p>
          </CardContent>
        </Card>
      );
    }
    
    return null;
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
          <Card className="h-full flex flex-col">
            <CardHeader className="pb-0">
              <div className="flex justify-between items-center">
                <CardTitle className="text-lg">
                  {activeTab === 'courses' && 'Course Details'}
                  {activeTab === 'certifications' && 'Certification Details'}
                  {activeTab === 'achievements' && 'Achievement Details'}
                </CardTitle>
                <div className="flex space-x-1">
                  <Button variant="ghost" size="icon" onClick={goToPrev}>
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" className="text-sm">
                    {currentItemIndex + 1}/{currentItems.length}
                  </Button>
                  <Button variant="ghost" size="icon" onClick={goToNext}>
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="flex-grow">
              {renderCurrentItemCard()}
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader className="pb-0">
            <CardTitle className="text-lg">MetaQube</CardTitle>
          </CardHeader>
          <CardContent>
            <MetaQubeDisplay metaQube={metaQube} compact={true} />
          </CardContent>
        </Card>
      </div>

      <div className="lg:col-span-3">
        <Tabs defaultValue="courses" value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="w-full grid grid-cols-3">
            <TabsTrigger value="courses">Courses</TabsTrigger>
            <TabsTrigger value="certifications">Certifications</TabsTrigger>
            <TabsTrigger value="achievements">Achievements</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>
    </div>
  );
};

export default LearnInterface;
