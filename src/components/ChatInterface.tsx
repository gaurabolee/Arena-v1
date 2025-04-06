
import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Send, User, Image, Smile, PaperclipIcon, ThumbsUp } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';

interface Message {
  id: string;
  sender: {
    id: string;
    name: string;
    avatar?: string;
  };
  content: string;
  timestamp: Date;
  isCurrentUser: boolean;
  likes?: number;
}

interface ChatInterfaceProps {
  messages: Message[];
  onSendMessage: (content: string) => void;
  isLoading?: boolean;
  className?: string;
}

const ChatInterface: React.FC<ChatInterfaceProps> = ({
  messages,
  onSendMessage,
  isLoading = false,
  className,
}) => {
  const [messageText, setMessageText] = useState('');
  const [likedMessages, setLikedMessages] = useState<Record<string, boolean>>({});
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSend = () => {
    if (messageText.trim() && !isLoading) {
      onSendMessage(messageText);
      setMessageText('');
      
      // Focus back on textarea after sending
      setTimeout(() => {
        textareaRef.current?.focus();
      }, 0);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleLikeMessage = (messageId: string) => {
    setLikedMessages(prev => ({
      ...prev,
      [messageId]: !prev[messageId]
    }));
  };

  // Format timestamp to readable time
  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const isSameDay = (date1: Date, date2: Date) => {
    return date1.toDateString() === date2.toDateString();
  };

  const renderDateDivider = (date: Date) => {
    // Format date as "Mon, Jan 1" or "Today" if it's today
    const today = new Date();
    if (isSameDay(date, today)) {
      return "Today";
    }
    
    return date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
  };

  // Group messages by date
  const groupedMessages = messages.reduce((groups: Record<string, Message[]>, message) => {
    const date = new Date(message.timestamp).toDateString();
    if (!groups[date]) {
      groups[date] = [];
    }
    groups[date].push(message);
    return groups;
  }, {});

  return (
    <div className={cn("flex flex-col h-full", className)}>
      {/* Messages area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {Object.entries(groupedMessages).map(([date, messagesGroup]) => (
          <div key={date} className="space-y-6">
            <div className="flex justify-center">
              <Badge variant="outline" className="bg-background px-2 py-1">
                {renderDateDivider(new Date(date))}
              </Badge>
            </div>
            
            {messagesGroup.map((message) => (
              <div
                key={message.id}
                className={cn(
                  "flex items-start gap-3 max-w-[80%] group",
                  message.isCurrentUser ? "ml-auto flex-row-reverse" : "mr-auto"
                )}
              >
                <Avatar className={cn(
                  "h-8 w-8 border",
                  message.isCurrentUser ? "border-primary/20" : "border-muted"
                )}>
                  {message.sender.avatar ? (
                    <AvatarImage src={message.sender.avatar} alt={message.sender.name} />
                  ) : (
                    <User className="h-5 w-5" />
                  )}
                </Avatar>
                
                <div className="space-y-1">
                  <div
                    className={cn(
                      "rounded-2xl px-4 py-3",
                      message.isCurrentUser
                        ? "bg-primary text-primary-foreground rounded-br-none"
                        : "bg-muted rounded-bl-none"
                    )}
                  >
                    <p className="whitespace-pre-wrap text-sm leading-relaxed">
                      {message.content}
                    </p>
                  </div>
                  
                  <div
                    className={cn(
                      "flex text-xs text-muted-foreground items-center",
                      message.isCurrentUser ? "justify-end" : "justify-start"
                    )}
                  >
                    <span className="inline-block">
                      {message.sender.name} • {formatTime(message.timestamp)}
                    </span>
                    <Button
                      variant="ghost"
                      size="sm"
                      className={cn(
                        "h-6 w-6 p-0 ml-2 opacity-0 group-hover:opacity-100 transition-opacity",
                        likedMessages[message.id] && "opacity-100 text-primary"
                      )}
                      onClick={() => handleLikeMessage(message.id)}
                    >
                      <ThumbsUp className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ))}
        
        {/* Auto-scroll anchor */}
        <div ref={messagesEndRef} />
      </div>
      
      {/* Message input */}
      <div className="border-t p-3">
        <div className="flex flex-col">
          <Textarea
            ref={textareaRef}
            value={messageText}
            onChange={(e) => setMessageText(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type your message..."
            className="min-h-[60px] resize-none rounded-xl border focus-visible:ring-1 focus-visible:ring-primary mb-2"
          />
          
          <div className="flex justify-between items-center">
            <div className="flex gap-1">
              <Button variant="ghost" size="icon" className="h-9 w-9 rounded-full">
                <Smile className="h-5 w-5 text-muted-foreground" />
              </Button>
              <Button variant="ghost" size="icon" className="h-9 w-9 rounded-full">
                <Image className="h-5 w-5 text-muted-foreground" />
              </Button>
              <Button variant="ghost" size="icon" className="h-9 w-9 rounded-full">
                <PaperclipIcon className="h-5 w-5 text-muted-foreground" />
              </Button>
            </div>
            
            <Button
              onClick={handleSend}
              className={cn(
                "rounded-full h-9 w-9 p-0",
                messageText.trim() ? "opacity-100" : "opacity-50"
              )}
              disabled={!messageText.trim() || isLoading}
            >
              <Send className="h-4 w-4" />
              <span className="sr-only">Send message</span>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatInterface;
