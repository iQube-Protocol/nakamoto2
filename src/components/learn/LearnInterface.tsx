import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { BookOpen, FileText, Video, Award, ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react';
import AgentInterface from '@/components/shared/AgentInterface';
import MetaQubeDisplay from '@/components/shared/MetaQubeDisplay';
import { MetaQube } from '@/lib/types';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';
import CourseCard from '@/components/learn/CourseCard';

interface LearnInterfaceProps {
  metaQube: MetaQube;
}

const LearnInterface = ({ metaQube }: LearnInterfaceProps) => {
  const { toast } = useToast();
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [currentCourseIndex, setCurrentCourseIndex] = useState(0);
  
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

  const handleNextCourse = () => {
    setCurrentCourseIndex((prev) => 
      prev === courses.length - 1 ? 0 : prev + 1
    );
  };

  const handlePrevCourse = () => {
    setCurrentCourseIndex((prev) => 
      prev === 0 ? courses.length - 1 : prev - 1
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

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div>
        <div className="space-y-6">
          <MetaQubeDisplay metaQube={metaQube} compact={true} />

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-lg">Course Navigation</CardTitle>
              <div className="flex items-center space-x-1">
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-8 w-8" 
                  onClick={handlePrevCourse}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <span className="text-sm text-muted-foreground">
                  {currentCourseIndex + 1}/{courses.length}
                </span>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-8 w-8" 
                  onClick={handleNextCourse}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <CourseCard course={courses[currentCourseIndex]} />
            </CardContent>
          </Card>
        </div>
      </div>

      <div className="lg:col-span-2">
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

      <div className="lg:col-span-3">
        <Tabs defaultValue="courses">
          <TabsList className="w-full grid grid-cols-3">
            <TabsTrigger value="courses">Courses</TabsTrigger>
            <TabsTrigger value="certifications">Certifications</TabsTrigger>
            <TabsTrigger value="achievements">Achievements</TabsTrigger>
          </TabsList>
          <TabsContent value="courses" className="mt-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {courses.map((course) => (
                <CourseCard key={course.id} course={course} />
              ))}
            </div>
          </TabsContent>
          <TabsContent value="certifications">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <Card className="p-6">
                <Award className="h-12 w-12 text-amber-500 mb-4" />
                <h3 className="font-semibold mb-1">Web3 Fundamentals</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Blockchain basics and smart contract fundamentals
                </p>
                <div className="text-xs text-muted-foreground">
                  In progress - 65% complete
                </div>
              </Card>
              <Card className="p-6 border border-dashed border-muted">
                <Award className="h-12 w-12 text-gray-300 mb-4" />
                <h3 className="font-semibold mb-1">iQube Protocol Expert</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Master the iQube protocol architecture and implementation
                </p>
                <div className="text-xs text-muted-foreground">
                  Locked - Complete prerequisites first
                </div>
              </Card>
              <Card className="p-6 border border-dashed border-muted">
                <Award className="h-12 w-12 text-gray-300 mb-4" />
                <h3 className="font-semibold mb-1">Advanced dApp Development</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Building complex decentralized applications with advanced features
                </p>
                <div className="text-xs text-muted-foreground">
                  Locked - Complete prerequisites first
                </div>
              </Card>
            </div>
          </TabsContent>
          <TabsContent value="achievements">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {[...Array(8)].map((_, i) => (
                <Card key={i} className={`p-4 text-center ${i < 3 ? "" : "opacity-50"}`}>
                  <div className={`mx-auto rounded-full w-12 h-12 flex items-center justify-center mb-2 ${
                    i < 3 ? "bg-gradient-to-r from-iqube-primary to-iqube-accent" : "bg-gray-200"
                  }`}>
                    {i < 3 ? (
                      <Award className="h-6 w-6 text-white" />
                    ) : (
                      <Award className="h-6 w-6 text-gray-400" />
                    )}
                  </div>
                  <h3 className="text-sm font-medium">
                    {i === 0 && "First Steps"}
                    {i === 1 && "Knowledge Seeker"}
                    {i === 2 && "Quiz Master"}
                    {i === 3 && "Web3 Explorer"}
                    {i === 4 && "Token Sage"}
                    {i === 5 && "Community Leader"}
                    {i === 6 && "Developer"}
                    {i === 7 && "iQube Master"}
                  </h3>
                  <p className="text-xs text-muted-foreground mt-1">
                    {i < 3 ? "Unlocked" : "Locked"}
                  </p>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default LearnInterface;
