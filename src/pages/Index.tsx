import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowRight, ChevronDown, LogIn, UserPlus, Heart, MessageSquare, Eye, Share2 } from 'lucide-react';
import TransitionWrapper from '@/components/TransitionWrapper';
import Navbar from '@/components/Navbar';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface Participant {
  name: string;
  username: string;
  avatar?: string;
  bio: string;
}

interface Conversation {
  id: string;
  mainTopic: string;
  otherTopics: string[];
  participants: [Participant, Participant];
  engagement: {
    views: number;
    loves: number;
    comments: number;
  };
}

const sampleConversations: Conversation[] = [
  {
    id: '1',
    mainTopic: "The Future of Digital Communication",
    otherTopics: ["AI in Text", "Social Media Evolution", "Content Creation"],
    participants: [
      {
        name: "Gaurab Boli",
        username: "gaurab",
        bio: "Building Arena • Exploring the future of communication",
      },
      {
        name: "Sam Chen",
        username: "samc",
        bio: "Tech enthusiast • Writer • Building in public",
      }
    ],
    engagement: {
      views: 1234,
      loves: 89,
      comments: 23
    }
  },
  {
    id: '2',
    mainTopic: "Reimagining Social Platforms",
    otherTopics: ["Community Building", "Creator Economy", "Digital Identity"],
    participants: [
      {
        name: "Alex Rivera",
        username: "alexr",
        bio: "Product Designer • Web3 Explorer",
      },
      {
        name: "Sarah Kim",
        username: "sarahk",
        bio: "Community Lead • Digital Anthropologist",
      }
    ],
    engagement: {
      views: 856,
      loves: 67,
      comments: 15
    }
  }
];

const Index: React.FC = () => {
  const scrollToDiscussions = () => {
    window.scrollTo({
      top: window.innerHeight,
      behavior: 'smooth'
    });
  };

  const formatNumber = (num: number): string => {
    if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'k';
    }
    return num.toString();
  };

  const handleShare = async (conversationId: string) => {
    try {
      await navigator.share({
        title: 'Check out this conversation on Arena',
        text: 'Join the discussion about the future of communication',
        url: `${window.location.origin}/conversation/${conversationId}`,
      });
    } catch (error) {
      // Fallback to copying to clipboard
      const url = `${window.location.origin}/conversation/${conversationId}`;
      navigator.clipboard.writeText(url);
    }
  };

  return <>
      <Navbar />
      <TransitionWrapper animation="fade" className="min-h-screen">
        {/* Hero Section */}
        <section className="relative flex min-h-screen items-center justify-center pt-0 -mt-16">
          <div className="w-full max-w-6xl px-4 py-12 text-center sm:px-6 mx-px lg:px-[34px] my-[7px]">
            <TransitionWrapper animation="slide-up" className="space-y-6">
              <div className="inline-flex items-center rounded-full border bg-background px-3 py-1 text-sm">
                <span className="mr-2 rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
                  New
                </span>
                <span className="text-muted-foreground">The world's first public text event</span>
              </div>
              
              <h1 className="font-display text-balance text-4xl font-medium tracking-tight sm:text-5xl md:text-6xl lg:text-7xl">
                <span>Discuss or Debate</span> <span className="text-primary">in Public</span>
                <br />
                <span></span>
              </h1>
              
              <p className="mx-auto max-w-2xl text-balance text-lg text-muted-foreground sm:text-xl">Create topics, Invite guests, exchange ideas, challenge perspectives, and grow through thoughtful discussions.</p>
              
              <div className="flex flex-col items-center justify-center space-y-4 pt-6 sm:flex-row sm:space-x-4 sm:space-y-0">
                <Link to="/register">
                  <Button size="lg" className="group relative overflow-hidden rounded-full px-8 py-6 transition-all duration-300 hover:shadow-md">
                    Get Started
                    <ArrowRight className="ml-2 h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
                  </Button>
                </Link>
              </div>
            </TransitionWrapper>
          </div>

          {/* Scroll Down Indicator */}
          <div className="absolute bottom-8 left-0 right-0 mx-auto flex justify-center cursor-pointer animate-bounce" onClick={scrollToDiscussions} aria-label="Scroll to past discussions">
            <div className="flex flex-col items-center space-y-2">
              <span className="text-sm font-medium text-muted-foreground">Past Discussions</span>
              <ChevronDown className="h-6 w-6 text-primary" />
            </div>
          </div>
        </section>

        {/* Past Discussions Section */}
        <section id="past-discussions" className="py-16 flex flex-col items-center justify-center min-h-screen bg-muted/5 dark:bg-background">
          <div className="w-full px-4 max-w-4xl mx-auto">
            <TransitionWrapper animation="fade" className="w-full">
              <div className="space-y-8">
                <div className="space-y-8">
                  {sampleConversations.map((conversation) => (
                    <Card key={conversation.id} className="transition-all duration-200 hover:shadow-md hover:border-primary/50">
                      <CardContent className="p-0">
                        {/* Main Topic as Header */}
                        <div className="bg-muted/5 px-6 py-4 border-b">
                          <h2 className="text-lg font-medium tracking-tight text-foreground/80">{conversation.mainTopic}</h2>
                        </div>

                        <div className="px-6 pt-8 pb-6">
                          {/* Participants with larger avatars */}
                          <div className="grid grid-cols-2 gap-10 mb-8">
                            {conversation.participants.map((participant, index) => (
                              <div key={participant.username} className="flex items-start space-x-4">
                                <Avatar className="h-24 w-24 rounded-xl">
                                  {participant.avatar ? (
                                    <AvatarImage src={participant.avatar} alt={participant.name} className="rounded-xl" />
                                  ) : (
                                    <AvatarFallback className="rounded-xl text-xl font-medium bg-primary/5">{participant.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                                  )}
                                </Avatar>
                                <div className="flex-1">
                                  <h3 className="text-base font-semibold tracking-tight mb-0.5">{participant.name}</h3>
                                  <p className="text-xs font-medium text-muted-foreground mb-2">@{participant.username}</p>
                                  <p className="text-sm text-muted-foreground/80 leading-relaxed">{participant.bio}</p>
                                </div>
                              </div>
                            ))}
                          </div>

                          {/* Other Topics with refined badges */}
                          <div className="flex flex-wrap gap-1.5 mb-6">
                            {conversation.otherTopics.map((topic) => (
                              <Badge key={topic} variant="secondary" className="px-2.5 py-0.5 text-xs font-medium">
                                {topic}
                              </Badge>
                            ))}
                          </div>

                          {/* Engagement & Share with refined metrics */}
                          <div className="flex items-center justify-between pt-4 border-t border-muted/15">
                            <div className="flex items-center gap-8">
                              <div className="flex items-center gap-2 group cursor-pointer hover:opacity-70 transition-opacity">
                                <Eye className="h-4 w-4 text-muted-foreground/50" />
                                <span className="text-xs font-medium text-muted-foreground tracking-tight">
                                  {formatNumber(conversation.engagement.views)}
                                </span>
                              </div>
                              <div className="flex items-center gap-2 group cursor-pointer hover:opacity-70 transition-opacity">
                                <Heart className="h-4 w-4 text-rose-400" />
                                <span className="text-xs font-medium text-rose-500/90 tracking-tight">
                                  {formatNumber(conversation.engagement.loves)}
                                </span>
                              </div>
                              <div className="flex items-center gap-2 group cursor-pointer hover:opacity-70 transition-opacity">
                                <MessageSquare className="h-4 w-4 text-blue-400" />
                                <span className="text-xs font-medium text-blue-500/90 tracking-tight">
                                  {formatNumber(conversation.engagement.comments)}
                                </span>
                              </div>
                            </div>
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors h-7 px-2.5"
                                    onClick={() => handleShare(conversation.id)}
                                  >
                                    <Share2 className="h-4 w-4" />
                                    Share
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p className="text-xs">Share conversation</p>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            </TransitionWrapper>
          </div>
        </section>
      </TransitionWrapper>
    </>;
};

export default Index;
