
import React, { useState } from 'react';
import { cn } from '@/lib/utils';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Button } from './ui/button';
import { ThumbsUp, MessageCircle, Share2 } from 'lucide-react';

interface MessageProps {
  content: string;
  sender: {
    name: string;
    username: string;
    avatar?: string;
  };
  timestamp: string;
  isCurrentUser: boolean;
  isSystemMessage?: boolean;
  likes?: number;
  comments?: number;
  shares?: number;
}

const Message: React.FC<MessageProps> = ({
  content,
  sender,
  timestamp,
  isCurrentUser,
  isSystemMessage,
  likes = 0,
  comments = 0,
  shares = 0
}) => {
  const [likeCount, setLikeCount] = useState(likes);
  const [hasLiked, setHasLiked] = useState(false);
  
  const handleLike = () => {
    if (hasLiked) {
      setLikeCount(prev => prev - 1);
    } else {
      setLikeCount(prev => prev + 1);
    }
    setHasLiked(!hasLiked);
  };

  if (isSystemMessage) {
    return (
      <div className="flex justify-center my-4">
        <div className="bg-muted/30 rounded-lg px-4 py-2 max-w-[80%]">
          <p className="text-sm text-center text-muted-foreground">{content}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="my-4">
      <div className={cn(
        "flex gap-3",
        isCurrentUser ? "flex-row-reverse" : "flex-row"
      )}>
        <Avatar className="h-8 w-8">
          {sender.avatar ? (
            <AvatarImage src={sender.avatar} alt={sender.name} />
          ) : (
            <AvatarFallback>
              {sender.name.split(' ').map(n => n[0]).join('')}
            </AvatarFallback>
          )}
        </Avatar>
        
        <div className={cn(
          "flex flex-col max-w-[80%]",
          isCurrentUser ? "items-end" : "items-start"
        )}>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-sm font-medium">{sender.name}</span>
            <span className="text-xs text-muted-foreground">@{sender.username}</span>
          </div>
          
          <div className={cn(
            "rounded-2xl px-4 py-3",
            isCurrentUser 
              ? "bg-primary text-primary-foreground rounded-br-none" 
              : "bg-muted rounded-bl-none"
          )}>
            <p className="text-sm whitespace-pre-wrap leading-relaxed">{content}</p>
          </div>
          
          <div className="flex items-center mt-1 gap-2 text-xs text-muted-foreground">
            <span>{timestamp}</span>
          </div>
          
          {/* Engagement buttons */}
          <div className={cn(
            "flex mt-1 gap-3",
            isCurrentUser ? "justify-end" : "justify-start"
          )}>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={handleLike}
              className={cn(
                "h-8 px-2 text-xs gap-1",
                hasLiked && "text-primary"
              )}
            >
              <ThumbsUp className="h-3 w-3" />
              <span>{likeCount}</span>
            </Button>
            
            <Button variant="ghost" size="sm" className="h-8 px-2 text-xs gap-1">
              <MessageCircle className="h-3 w-3" />
              <span>{comments}</span>
            </Button>
            
            <Button variant="ghost" size="sm" className="h-8 px-2 text-xs gap-1">
              <Share2 className="h-3 w-3" />
              <span>{shares}</span>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Message;
