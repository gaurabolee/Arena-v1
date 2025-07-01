import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import Navbar from '@/components/Navbar';
import TransitionWrapper from '@/components/TransitionWrapper';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Heart, MessageSquare, Eye, ArrowUp, ImagePlus, Mic, MicOff, ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

// Add Web Speech API types
interface Window {
  SpeechRecognition: any;
  webkitSpeechRecognition: any;
}

interface Message {
  id: string;
  content: string;
  subject?: string;
  sender: {
    name: string;
    username: string;
  };
  timestamp: string;
  topicId: number;
  engagement: {
    loves: number;
    comments: number;
    views: number;
  };
  images?: string[];
}

interface Topic {
  id: number;
  title: string;
}

const topics: Topic[] = [
  { id: 1, title: "Introduction" },
  { id: 2, title: "Future of Text" },
  { id: 3, title: "How will Arena disrupt text podcast and social media" }
];

const topicMessages: Record<number, Message[]> = {
  1: [
    {
      id: '1',
      content: "Hi Sam, excited to start this conversation. Let's begin with our Introduction.",
      sender: {
        name: 'Gaurab',
        username: 'gaurab'
      },
      timestamp: new Date().toISOString(),
      topicId: 1,
      engagement: { loves: 24, comments: 12, views: 1234 }
    },
    {
      id: '2',
      content: "Hi Gaurab, great to be here. Looking forward to sharing our backgrounds and ideas.",
      sender: {
        name: 'Sam',
        username: 'samc'
      },
      timestamp: new Date().toISOString(),
      topicId: 1,
      engagement: { loves: 18, comments: 8, views: 856 }
    }
  ],
  2: [
    {
      id: '3',
      content: "Let's discuss how text is evolving in the digital age. What role do you see AI playing in this transformation?",
      sender: {
        name: 'Gaurab',
        username: 'gaurab'
      },
      timestamp: new Date().toISOString(),
      topicId: 2,
      engagement: { loves: 15, comments: 7, views: 654 }
    }
  ],
  3: [
    {
      id: '4',
      content: "Arena represents a new paradigm in digital communication. How do you see it changing the landscape of content creation?",
      sender: {
        name: 'Gaurab',
        username: 'gaurab'
      },
      timestamp: new Date().toISOString(),
      topicId: 3,
      engagement: { loves: 20, comments: 10, views: 789 }
    }
  ]
};

const Conversation: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [currentTopicId, setCurrentTopicId] = useState(1);
  const [messages, setMessages] = useState<Message[]>(topicMessages[1]);

  const [inputValue, setInputValue] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [recognition, setRecognition] = useState<any>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [selectedImages, setSelectedImages] = useState<{ url: string; file: File }[]>([]);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const adjustTextareaHeight = () => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      textarea.style.height = `${textarea.scrollHeight}px`;
    }
  };

  useEffect(() => {
    adjustTextareaHeight();
  }, [inputValue]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        const recognitionInstance = new SpeechRecognition();
        recognitionInstance.continuous = true;
        recognitionInstance.interimResults = true;

        recognitionInstance.onresult = (event: any) => {
          const transcript = Array.from(event.results)
            .map((result: any) => result[0].transcript)
            .join('');
          setInputValue(transcript);
        };

        recognitionInstance.onend = () => {
          setIsRecording(false);
        };

        setRecognition(recognitionInstance);
      }
    }
  }, []);

  const toggleRecording = () => {
    if (!recognition) return;

    if (isRecording) {
      recognition.stop();
      setIsRecording(false);
    } else {
      recognition.start();
      setIsRecording(true);
    }
  };

  const getWordCount = (text: string) => {
    return text.trim() ? text.trim().split(/\s+/).length : 0;
  };

  const handleTopicChange = (topicId: number) => {
    setCurrentTopicId(topicId);
    // Update messages for the new topic
    setMessages(prev => {
      // Get existing user messages for this topic
      const existingMessages = prev.filter(m => m.topicId === topicId);
      // Combine with preset topic messages
      return [...topicMessages[topicId], ...existingMessages.filter(m => !topicMessages[topicId].find(tm => tm.id === m.id))];
    });
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      const newImages = Array.from(files).map(file => ({
        url: URL.createObjectURL(file),
        file
      }));
      setSelectedImages(prev => [...prev, ...newImages]);
    }
    // Reset input value to allow selecting the same file again
    e.target.value = '';
  };

  const removeImage = (indexToRemove: number) => {
    setSelectedImages(prev => {
      // Revoke the URL to prevent memory leaks
      URL.revokeObjectURL(prev[indexToRemove].url);
      return prev.filter((_, index) => index !== indexToRemove);
    });
  };

  const handleSendMessage = () => {
    if ((!inputValue.trim() && selectedImages.length === 0) || !user) return;

    // Create copies of the image URLs to persist them
    const persistedImages = selectedImages.map(img => {
      const response = fetch(img.url)
        .then(res => res.blob())
        .then(blob => URL.createObjectURL(blob));
      return img.url;
    });

    const newMessage: Message = {
      id: Date.now().toString(),
      content: inputValue,
      sender: {
        name: user.name || 'User',
        username: user.username || 'user'
      },
      timestamp: new Date().toISOString(),
      topicId: currentTopicId,
      engagement: { loves: 0, comments: 0, views: 0 },
      images: persistedImages
    };

    setMessages(prev => [...prev, newMessage]);
    setInputValue('');
    setSelectedImages([]);
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleString([], { 
      month: 'short',
      day: 'numeric',
      hour: 'numeric', 
      minute: '2-digit',
      hour12: true 
    });
  };

  return (
    <>
      <Navbar />
      <TransitionWrapper animation="fade" className="min-h-screen bg-background pt-24 pb-24">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <Card className="border shadow-sm">
            {/* Header */}
            <div className="border-b bg-muted/30 p-4">
              <div className="flex flex-col items-center justify-center relative">
                <button
                  type="button"
                  className="absolute left-0 top-1/2 -translate-y-1/2 h-8 w-8 p-0 flex items-center justify-center"
                  onClick={() => navigate('/messages')}
                >
                  <ArrowLeft className="h-4 w-4" />
                </button>
                <p className="text-sm font-medium">
                  {topics.find(t => t.id === currentTopicId)?.title}
                </p>
                {topics.find(t => t.id === currentTopicId)?.title === 'Introduction' && (
                  <span className="text-xs text-muted-foreground mt-1">
                    Word count will start from the next topic
                  </span>
                )}
              </div>
            </div>

            <div className="flex">
              {sidebarOpen ? (
                <div className="w-56 p-2 space-y-2 border-r relative">
                  <button
                    className="absolute top-2 right-2 p-1 rounded hover:bg-muted transition-colors"
                    onClick={() => setSidebarOpen(false)}
                    aria-label="Collapse topics sidebar"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </button>
                  <h3 className="font-medium mb-2">Topics</h3>
                  <div className="space-y-1">
                    {topics.map((topic) => (
                      <button
                        key={topic.id}
                        onClick={() => handleTopicChange(topic.id)}
                        className={cn(
                          "w-full text-left px-3 py-2 rounded-lg text-sm transition-colors",
                          currentTopicId === topic.id
                            ? "bg-primary text-primary-foreground"
                            : "hover:bg-muted"
                        )}
                      >
                        {topic.title}
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                <button
                  className="w-6 h-10 flex items-center justify-center border-r bg-background hover:bg-muted transition-colors"
                  onClick={() => setSidebarOpen(true)}
                  aria-label="Expand topics sidebar"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              )}

              {/* Messages Area */}
              <div className="flex-1 flex flex-col h-[calc(100vh-16rem)]">
                <CardContent className="flex-1 p-4 overflow-y-auto">
                  <div className="space-y-6">
                    {messages
                      .filter(m => m.topicId === currentTopicId)
                      .map((message, idx, arr) => (
                        idx === 0 ? (
                          <div key={message.id} className="mb-4">
                            <div className="flex items-center gap-2 text-xs mb-1">
                              <span className="font-medium text-foreground">{message.sender.name}</span>
                              <span className="text-muted-foreground">{formatTimestamp(message.timestamp)}</span>
                            </div>
                            <div className="text-sm leading-relaxed mb-2 whitespace-pre-wrap">{message.content}</div>
                            <div className="flex items-center gap-4 mt-2">
                              <button className="flex items-center gap-1 text-xs text-muted-foreground hover:text-primary transition-colors">
                                <Heart className="h-3.5 w-3.5" />
                                <span>{message.engagement.loves}</span>
                              </button>
                              <button className="flex items-center gap-1 text-xs text-muted-foreground hover:text-primary transition-colors">
                                <MessageSquare className="h-3.5 w-3.5" />
                                <span>{message.engagement.comments}</span>
                              </button>
                              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                <Eye className="h-3.5 w-3.5" />
                                <span>{message.engagement.views}</span>
                              </div>
                            </div>
                          </div>
                        ) : idx === 1 ? (
                          <div key={message.id} className="mb-4">
                            <div className="flex items-center gap-2 text-xs mb-1">
                              <span className="font-medium text-foreground">{message.sender.name}</span>
                              <span className="text-muted-foreground">{formatTimestamp(message.timestamp)}</span>
                            </div>
                            <div className="text-sm leading-relaxed mb-2 whitespace-pre-wrap">{message.content}</div>
                            <div className="flex items-center gap-4 mt-2">
                              <button className="flex items-center gap-1 text-xs text-muted-foreground hover:text-primary transition-colors">
                                <Heart className="h-3.5 w-3.5" />
                                <span>{message.engagement.loves}</span>
                              </button>
                              <button className="flex items-center gap-1 text-xs text-muted-foreground hover:text-primary transition-colors">
                                <MessageSquare className="h-3.5 w-3.5" />
                                <span>{message.engagement.comments}</span>
                              </button>
                              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                <Eye className="h-3.5 w-3.5" />
                                <span>{message.engagement.views}</span>
                              </div>
                            </div>
                          </div>
                        ) : (
                          <div key={message.id} className="mb-4">
                            <div className="flex items-center gap-2">
                              <span className="font-medium">{message.sender.name}:</span>
                              <span className="text-sm whitespace-pre-wrap leading-relaxed">{message.content}</span>
                            </div>
                            <div className="flex items-center gap-4 text-xs text-muted-foreground mt-1">
                              <button className="flex items-center gap-1 hover:text-primary transition-colors">
                                <Heart className="h-3.5 w-3.5" />
                                <span>{message.engagement.loves}</span>
                              </button>
                              <button className="flex items-center gap-1 hover:text-primary transition-colors">
                                <MessageSquare className="h-3.5 w-3.5" />
                                <span>{message.engagement.comments}</span>
                              </button>
                              <div className="flex items-center gap-1">
                                <Eye className="h-3.5 w-3.5" />
                                <span>{message.engagement.views}</span>
                              </div>
                              <span className="ml-auto">{formatTimestamp(message.timestamp)}</span>
                            </div>
                          </div>
                        )
                      ))}
                  </div>
                </CardContent>

                {/* Input Area */}
                <div className="border-t p-4 bg-muted/30">
                  <div className="space-y-3">
                    <div className="bg-background rounded-lg p-3 space-y-2 border border-input hover:border-primary/50 transition-colors">
                      <textarea
                        ref={textareaRef}
                        value={inputValue}
                        onChange={(e) => {
                          setInputValue(e.target.value);
                          // Always expand to fit content
                          const textarea = e.target;
                          textarea.style.height = 'auto';
                          textarea.style.height = textarea.scrollHeight + 'px';
                        }}
                        onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSendMessage()}
                        placeholder="Share your thoughts..."
                        className="w-full bg-transparent text-sm focus:outline-none resize-none min-h-[40px]"
                      />

                      {selectedImages.length > 0 && (
                        <div className="grid grid-cols-2 gap-2 pt-2 max-h-[200px] overflow-y-auto">
                          {selectedImages.map((img, index) => (
                            <div key={index} className="relative group">
                              <img
                                src={img.url}
                                alt="Preview"
                                className="w-full h-32 object-cover rounded-md"
                              />
                              <button
                                onClick={() => removeImage(index)}
                                className="absolute top-1 right-1 bg-black/50 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                              >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                  <line x1="18" y1="6" x2="6" y2="18"></line>
                                  <line x1="6" y1="6" x2="18" y2="18"></line>
                                </svg>
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                      
                      <div className="flex items-center justify-between pt-2 border-t">
                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-7 w-7 p-0"
                            onClick={() => document.getElementById('photo-upload')?.click()}
                          >
                            <ImagePlus className="h-4 w-4 text-muted-foreground hover:text-primary transition-colors" />
                          </Button>
                          <input 
                            type="file" 
                            id="photo-upload" 
                            accept="image/*"
                            multiple
                            className="hidden"
                            onChange={handleImageSelect}
                          />
                          {recognition && (
                            <Button
                              variant="ghost"
                              size="sm"
                              className={cn(
                                "h-7 w-7 p-0",
                                isRecording && "text-red-500 hover:text-red-600"
                              )}
                              onClick={toggleRecording}
                            >
                              {isRecording ? (
                                <MicOff className="h-4 w-4" />
                              ) : (
                                <Mic className="h-4 w-4 text-muted-foreground hover:text-primary transition-colors" />
                              )}
                            </Button>
                          )}
                        </div>
                        <Button
                          size="sm"
                          onClick={handleSendMessage}
                          className="h-7 w-7 rounded-full p-0"
                          disabled={!inputValue.trim() && selectedImages.length === 0}
                        >
                          <ArrowUp className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </TransitionWrapper>
    </>
  );
};

export default Conversation; 