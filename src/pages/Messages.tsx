import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import Navbar from '@/components/Navbar';
import TransitionWrapper from '@/components/TransitionWrapper';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  Edit,
  ArrowRight,
  MessageSquare,
  Eye,
  Lock,
  CheckCircle
} from 'lucide-react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

const Messages: React.FC = () => {
  const { user } = useAuth();

  if (!user) {
    return (
      <>
        <Navbar />
        <TransitionWrapper animation="fade" className="min-h-screen pt-24 pb-10">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h1 className="text-2xl font-semibold mb-4">Please Log In</h1>
            <p className="mb-6">You need to be logged in to view your texts</p>
            <Button asChild>
              <Link to="/login">Log In</Link>
            </Button>
          </div>
        </TransitionWrapper>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <TransitionWrapper animation="fade" className="min-h-screen pt-20 pb-4">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-6">
            <h1 className="text-2xl font-bold">Texts</h1>
          </div>

          <Tabs defaultValue="open" className="w-full">
            <TabsList className="grid w-[200px] grid-cols-2 mb-6">
              <TabsTrigger value="open">Open</TabsTrigger>
              <TabsTrigger value="closed">Closed</TabsTrigger>
            </TabsList>

            <TabsContent value="open" className="space-y-4">
              <Link to="/text/1" className="block">
                <Card className="transition-all duration-200 hover:shadow-md hover:border-primary/50 cursor-pointer overflow-hidden">
                  <CardContent className="p-0">
                    <div className="flex flex-col sm:flex-row">
                      <div className="sm:w-1/3 bg-muted/30 p-4 flex flex-col justify-center">
                        <div className="flex items-center gap-3">
                          <Avatar className="h-12 w-12">
                            <AvatarFallback>SC</AvatarFallback>
                          </Avatar>
                          <div>
                            <h3 className="font-medium">Sam Chen</h3>
                            <p className="text-sm text-muted-foreground">@samc</p>
                          </div>
                        </div>
                      </div>
                      <div className="sm:w-2/3 p-4 border-t sm:border-t-0 sm:border-l">
                        <div className="flex items-center mb-3">
                          <Badge variant="secondary" className="text-xs">Introduction</Badge>
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4 text-xs text-muted-foreground">
                            <div className="flex items-center">
                              <Eye className="h-3 w-3 mr-1" />
                              <span>1.2k views</span>
                            </div>
                            <span>Last replied: 2h ago</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            </TabsContent>

            <TabsContent value="closed" className="space-y-4">
              <div className="text-sm text-muted-foreground text-center py-8">
                No closed conversations yet
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </TransitionWrapper>
    </>
  );
};

export default Messages;
