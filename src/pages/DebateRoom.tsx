
import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowLeft } from 'lucide-react';
import TransitionWrapper from '@/components/TransitionWrapper';
import Navbar from '@/components/Navbar';
import ChatInterface from '@/components/ChatInterface';

// Mock debate details
const MOCK_DEBATE = {
  id: '1',
  title: 'Is AI a threat to humanity?',
  description: 'Discussing the potential risks and benefits of artificial intelligence advances.',
  category: 'Technology',
  participants: 24,
  rules: [
    'Keep discussions respectful',
    'Provide sources for factual claims when possible',
    'Stay on topic',
    'Give others a chance to speak'
  ]
};

// Mock debate messages
const MOCK_MESSAGES = [
  {
    id: '1',
    sender: { id: 'user1', name: 'Alex Thompson' },
    content: 'I believe AI presents significant risks if not properly regulated. The rapid advancement could outpace our ability to control it.',
    timestamp: new Date(Date.now() - 3600000 * 2),
    isCurrentUser: false,
  },
  {
    id: '2',
    sender: { id: 'user2', name: 'Jordan Chen' },
    content: 'While I understand the concern, I think the benefits far outweigh the risks. AI can solve major global challenges in healthcare, climate, and poverty.',
    timestamp: new Date(Date.now() - 3600000 * 1.5),
    isCurrentUser: false,
  },
  {
    id: '3',
    sender: { id: 'current', name: 'You' },
    content: 'Both perspectives are valid. The key might be ensuring AI development includes strong ethical guidelines and transparent processes.',
    timestamp: new Date(Date.now() - 3600000),
    isCurrentUser: true,
  },
  {
    id: '4',
    sender: { id: 'user3', name: 'Riley Kim' },
    content: 'I agree with the need for ethical guidelines, but who decides those ethics? Different cultures and countries may have different values.',
    timestamp: new Date(Date.now() - 1800000),
    isCurrentUser: false,
  },
  {
    id: '5',
    sender: { id: 'user1', name: 'Alex Thompson' },
    content: 'That\'s an excellent point. Perhaps we need international cooperation, similar to how we handle nuclear technology or climate change.',
    timestamp: new Date(Date.now() - 900000),
    isCurrentUser: false,
  },
];

const DebateRoom: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [debate, setDebate] = useState(MOCK_DEBATE);
  const [messages, setMessages] = useState(MOCK_MESSAGES);
  const [isLoading, setIsLoading] = useState(false);
  const [showInfo, setShowInfo] = useState(false);

  // Simulate fetching debate data
  useEffect(() => {
    // In a real app, we would fetch the debate details and messages based on the ID
    setIsLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      setIsLoading(false);
    }, 1000);
  }, [id]);

  // Handle sending a new message
  const handleSendMessage = (content: string) => {
    const newMessage = {
      id: Date.now().toString(),
      sender: { id: 'current', name: 'You' },
      content,
      timestamp: new Date(),
      isCurrentUser: true,
    };
    
    setMessages((prev) => [...prev, newMessage]);
  };

  return (
    <>
      <Navbar />
      <TransitionWrapper animation="fade" className="min-h-screen pt-20 pb-6">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col h-[calc(100vh-112px)]">
          {/* Debate header */}
          <div className="pb-4 border-b">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-3">
                <Link to="/debates">
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <ArrowLeft className="h-4 w-4" />
                  </Button>
                </Link>
                <Badge variant="outline">{debate.category}</Badge>
              </div>
              
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => setShowInfo(!showInfo)}
              >
                {showInfo ? 'Hide Info' : 'Show Info'}
              </Button>
            </div>
            
            <h1 className="text-2xl font-medium mb-1">{debate.title}</h1>
            <p className="text-muted-foreground">{debate.description}</p>
          </div>
          
          <div className="flex-1 flex gap-4 pt-4 h-full">
            {/* Main chat area */}
            <div className="flex-1">
              <Card className="h-full border shadow-none">
                <CardContent className="p-0 h-full">
                  <ChatInterface
                    messages={messages}
                    onSendMessage={handleSendMessage}
                    isLoading={isLoading}
                    className="h-full"
                  />
                </CardContent>
              </Card>
            </div>
            
            {/* Debate info panel */}
            {showInfo && (
              <TransitionWrapper animation="slide-right" className="w-72">
                <Card className="h-full">
                  <CardContent className="p-4">
                    <h3 className="font-medium mb-4">Debate Information</h3>
                    
                    <div className="space-y-4">
                      <div>
                        <h4 className="text-sm font-medium mb-1">Participants</h4>
                        <p className="text-sm text-muted-foreground">
                          {debate.participants} people in this debate
                        </p>
                      </div>
                      
                      <div>
                        <h4 className="text-sm font-medium mb-1">Rules</h4>
                        <ul className="text-sm text-muted-foreground space-y-2">
                          {debate.rules.map((rule, index) => (
                            <li key={index} className="flex items-start">
                              <span className="mr-2">•</span>
                              <span>{rule}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                      
                      <div>
                        <h4 className="text-sm font-medium mb-1">Topic Resources</h4>
                        <div className="text-sm text-primary space-y-1">
                          <a href="#" className="block hover:underline">Understanding AI Ethics</a>
                          <a href="#" className="block hover:underline">The Future of AI Regulations</a>
                          <a href="#" className="block hover:underline">AI Safety Research Overview</a>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TransitionWrapper>
            )}
          </div>
        </div>
      </TransitionWrapper>
    </>
  );
};

export default DebateRoom;
