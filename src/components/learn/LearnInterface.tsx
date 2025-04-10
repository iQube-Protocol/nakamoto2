
import React, { useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { BookOpen, FileText, Video, Award, ArrowRight } from 'lucide-react';
import AgentInterface from '@/components/shared/AgentInterface';
import MetaQubeDisplay from '@/components/shared/MetaQubeDisplay';
import { MetaQube } from '@/lib/types';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface LearnInterfaceProps {
  metaQube: MetaQube;
}

const LearnInterface = ({ metaQube }: LearnInterfaceProps) => {
  const { toast } = useToast();
  
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

  // Handle AI message submission
  const handleAIMessage = async (message: string) => {
    try {
      const { data, error } = await supabase.functions.invoke('learn-ai', {
        body: { message, metaQube }
      });
      
      if (error) {
        console.error('Error calling learn-ai function:', error);
        throw new Error(error.message);
      }
      
      return {
        id: Date.now().toString(),
        sender: 'agent' as const,
        message: data.message,
        timestamp: data.timestamp || new Date().toISOString(),
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
            }
          ]}
        />
      </div>

      <div className="space-y-6">
        <MetaQubeDisplay metaQube={metaQube} compact={true} />

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Learning Dashboard</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="flex justify-between mb-2">
                <span className="font-medium">Your Progress</span>
                <span className="text-sm text-muted-foreground">35%</span>
              </div>
              <Progress value={35} className="h-2" />
            </div>
            
            <div className="grid grid-cols-2 gap-3">
              <Card className="p-3">
                <div className="text-xl font-bold">3</div>
                <div className="text-xs text-muted-foreground">Courses in Progress</div>
              </Card>
              <Card className="p-3">
                <div className="text-xl font-bold">11</div>
                <div className="text-xs text-muted-foreground">Lessons Completed</div>
              </Card>
              <Card className="p-3">
                <div className="text-xl font-bold">4</div>
                <div className="text-xs text-muted-foreground">Certifications</div>
              </Card>
              <Card className="p-3">
                <div className="text-xl font-bold">2.5</div>
                <div className="text-xs text-muted-foreground">Hours This Week</div>
              </Card>
            </div>

            <div className="pt-2">
              <h3 className="font-medium mb-3">Recommended Path</h3>
              <div className="space-y-3">
                <div className="flex items-center p-2 border rounded-md bg-iqube-primary/5 border-iqube-primary/20">
                  <BookOpen className="h-5 w-5 text-iqube-primary mr-3" />
                  <div className="flex-1">
                    <div className="text-sm font-medium">Complete Web3 Fundamentals</div>
                    <div className="text-xs text-muted-foreground">4 lessons remaining</div>
                  </div>
                  <Button size="sm" className="h-8">
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </div>
                <div className="flex items-center p-2 border rounded-md">
                  <Award className="h-5 w-5 text-amber-500 mr-3" />
                  <div className="flex-1">
                    <div className="text-sm font-medium">Take Certification Exam</div>
                    <div className="text-xs text-muted-foreground">Unlock level 2 learning</div>
                  </div>
                  <Button size="sm" variant="ghost" className="h-8">
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
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
                <Card key={course.id}>
                  <CardContent className="pt-6">
                    <div className="mb-4">
                      {course.icon}
                    </div>
                    <h3 className="text-lg font-semibold mb-1">{course.title}</h3>
                    <p className="text-sm text-muted-foreground mb-4">{course.description}</p>
                    <div className="mb-4">
                      <div className="flex justify-between text-sm mb-1">
                        <span>Progress</span>
                        <span>{course.progress}%</span>
                      </div>
                      <Progress value={course.progress} className="h-2" />
                    </div>
                    <div className="flex justify-between text-sm text-muted-foreground">
                      <span>{course.completed}/{course.lessons} lessons</span>
                      <Button size="sm" className="h-8">
                        Continue
                      </Button>
                    </div>
                  </CardContent>
                </Card>
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
