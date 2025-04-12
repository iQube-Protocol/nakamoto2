import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { BookOpen, FileText, Video, Award, ArrowRight, ChevronLeft, ChevronRight, EllipsisVertical, BarChart } from 'lucide-react';
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
  const [activeTab, setActiveTab] = useState<string | null>(null);
  
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

  const renderRightPanel = () => {
    if (!activeTab) {
      return (
        <Card className="h-full">
          <CardHeader>
            <CardTitle className="flex items-center text-lg">
              <BarChart className="h-5 w-5 mr-2 text-blue-400" />
              Learning Dashboard
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h3 className="font-medium text-sm mb-1">Your Progress</h3>
                <div className="flex justify-between text-sm mb-1">
                  <span>Overall completion</span>
                  <span>65%</span>
                </div>
                <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                  <div className="h-full bg-blue-500 rounded-full" style={{ width: '65%' }}></div>
                </div>
              </div>
              
              <div>
                <h3 className="font-medium text-sm mb-1">Recent Activity</h3>
                <ul className="space-y-2">
                  <li className="text-sm flex items-start">
                    <div className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-1.5 mr-2"></div>
                    <span>Completed Web3 Fundamentals Lesson 8</span>
                  </li>
                  <li className="text-sm flex items-start">
                    <div className="w-1.5 h-1.5 rounded-full bg-green-500 mt-1.5 mr-2"></div>
                    <span>Earned "Knowledge Seeker" achievement</span>
                  </li>
                  <li className="text-sm flex items-start">
                    <div className="w-1.5 h-1.5 rounded-full bg-purple-500 mt-1.5 mr-2"></div>
                    <span>Started iQube Protocol course</span>
                  </li>
                </ul>
              </div>
              
              <div>
                <h3 className="font-medium text-sm mb-1">Recommended Next</h3>
                <Card className="p-2 hover:bg-muted/50 transition-colors cursor-pointer">
                  <div className="flex items-center">
                    <BookOpen className="h-6 w-6 mr-3 text-blue-400" />
                    <div>
                      <p className="font-medium text-sm">Web3 Fundamentals</p>
                      <p className="text-xs text-muted-foreground">Continue Lesson 9: Smart Contracts</p>
                    </div>
                  </div>
                </Card>
              </div>
            </div>
          </CardContent>
        </Card>
      );
    }

    const current = currentItems[currentItemIndex];
    
    if (!current) return null;
    
    return (
      <Card className="h-full flex flex-col">
        <CardHeader className="pb-0">
          <div className="flex justify-between items-center">
            <CardTitle className="text-lg">
              {activeTab === 'courses' && 'Course Details'}
              {activeTab === 'certifications' && 'Certification Details'}
              {activeTab === 'achievements' && 'Achievement Details'}
            </CardTitle>
            <div className="flex space-x-1">
              <Button variant="ghost" size="icon" onClick={goToPrev} disabled={currentItems.length <= 1}>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="icon" className="text-sm">
                {currentItemIndex + 1}/{currentItems.length}
              </Button>
              <Button variant="ghost" size="icon" onClick={goToNext} disabled={currentItems.length <= 1}>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="flex-grow">
          {activeTab === 'courses' ? (
            <CourseCard course={current as typeof courses[0]} />
          ) : activeTab === 'certifications' ? (
            <div className="h-full">
              <div className="p-6 h-full flex flex-col">
                {(current as typeof certifications[0]).icon}
                <h3 className="font-semibold mb-1 mt-4">{(current as typeof certifications[0]).title}</h3>
                <p className="text-sm text-muted-foreground mb-4">{(current as typeof certifications[0]).description}</p>
                <div className="text-xs text-muted-foreground mt-auto">
                  {(current as typeof certifications[0]).status}
                </div>
              </div>
            </div>
          ) : activeTab === 'achievements' ? (
            <div className="h-full">
              <div className="p-6 h-full flex flex-col items-center justify-center text-center">
                <div className={`mx-auto rounded-full w-12 h-12 flex items-center justify-center mb-4 ${
                  (current as typeof achievements[0]).unlocked ? "bg-gradient-to-r from-iqube-primary to-iqube-accent" : "bg-gray-200"
                }`}>
                  {(current as typeof achievements[0]).unlocked ? (
                    <Award className="h-6 w-6 text-white" />
                  ) : (
                    <Award className="h-6 w-6 text-gray-400" />
                  )}
                </div>
                <h3 className="text-lg font-medium mb-2">{(current as typeof achievements[0]).title}</h3>
                <p className="text-sm text-muted-foreground">{(current as typeof achievements[0]).status}</p>
              </div>
            </div>
          ) : null}
        </CardContent>
      </Card>
    );
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
        <Card>
          <CardContent>
            <MetaQubeDisplay metaQube={metaQube} compact={true} />
          </CardContent>
        </Card>

        <div className="flex-grow">
          {renderRightPanel()}
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
