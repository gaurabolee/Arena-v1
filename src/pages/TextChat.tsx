import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import Navbar from '@/components/Navbar';
import TransitionWrapper from '@/components/TransitionWrapper';
import ChatInterface from '@/components/ChatInterface';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { User, ArrowLeft, MoreHorizontal, Info, Phone, Video, MessageSquare, ThumbsUp, Share2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';

const MOCK_CONVERSATIONS = {
  '1': {
    id: '1',
    title: 'Chat with Jack Wilson',
    isPublic: true,
    views: 124,
    likes: 18,
    shares: 5,
    participant: { id: '123', name: 'Jack Wilson', username: 'jackw', avatar: null, status: 'online' },
    messages: [
      { id: '1', sender: { id: '123', name: 'Jack Wilson', avatar: undefined }, content: 'What do you think about the rapid advancement of AI technology?', timestamp: new Date('2023-06-10T10:30:00Z'), isCurrentUser: false },
      { id: '2', sender: { id: 'current-user', name: 'You', avatar: undefined }, content: 'I believe it has enormous potential, but we need proper regulations to ensure it benefits humanity.', timestamp: new Date('2023-06-10T10:32:00Z'), isCurrentUser: true },
      { id: '3', sender: { id: '123', name: 'Jack Wilson', avatar: undefined }, content: 'Do you think we\'re moving too fast without considering the implications?', timestamp: new Date('2023-06-10T10:35:00Z'), isCurrentUser: false },
      { id: '4', sender: { id: 'current-user', name: 'You', avatar: undefined }, content: 'In some areas, yes. Especially when it comes to autonomous decision-making systems that could impact human lives.', timestamp: new Date('2023-06-10T10:38:00Z'), isCurrentUser: true }
    ],
    comments: [
      { id: '1', user: { name: 'Sara Kim', username: 'sarak', avatar: null }, content: 'Great points about AI regulation!', timestamp: new Date('2023-06-10T11:30:00Z'), likes: 3 },
      { id: '2', user: { name: 'Michael Johnson', username: 'michaelj', avatar: null }, content: 'I think we need global standards for AI ethics.', timestamp: new Date('2023-06-10T12:45:00Z'), likes: 5 },
    ]
  },
  // ... keep existing code (other conversation entries)
};

const TextChat: React.FC = () => {
  const { id } = useParams<{ id?: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [showInfo, setShowInfo] = useState(false);
  const [showComments, setShowComments] = useState(true);
  const [newMessage, setNewMessage] = useState('');
  const [newComment, setNewComment] = useState('');
  const { toast } = useToast();
  
  // In a real app, we would fetch the conversation data based on the ID
  const conversation = id && MOCK_CONVERSATIONS[id as keyof typeof MOCK_CONVERSATIONS];

  const [comments, setComments] = useState(conversation?.comments || []);
  
  useEffect(() => {
    if (id && !conversation) {
      // If the conversation ID doesn't exist, redirect to messages
      navigate('/messages');
    }
  }, [id, conversation, navigate]);

  const handleAddComment = () => {
    if (!newComment.trim() || !user) {
      return;
    }
    
    const comment = {
      id: Date.now().toString(),
      user: {
        name: user.name || 'Anonymous User',
        username: user.username || 'anonymous',
        avatar: null
      },
      content: newComment,
      timestamp: new Date(),
      likes: 0
    };
    
    setComments([...comments, comment]);
    setNewComment('');
    toast({
      title: "Comment added",
      description: "Your comment has been added to the conversation."
    });
  };

  const handleLikeComment = (commentId: string) => {
    setComments(prevComments => 
      prevComments.map(comment => 
        comment.id === commentId 
          ? { ...comment, likes: comment.likes + 1 } 
          : comment
      )
    );
  };

  const formatDateTime = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  };

  if (!user) {
    return (
      <>
        <Navbar />
        <TransitionWrapper animation="fade" className="min-h-screen pt-24 pb-10">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h1 className="text-2xl font-semibold mb-4">Please Log In</h1>
            <p className="mb-6">You need to be logged in to view conversations</p>
            <Button asChild>
              <Link to="/login">Log In</Link>
            </Button>
          </div>
        </TransitionWrapper>
      </>
    );
  }

  if (!conversation) {
    return (
      <>
        <Navbar />
        <TransitionWrapper animation="fade" className="min-h-screen pt-24 pb-10">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h1 className="text-2xl font-semibold mb-4">Conversation Not Found</h1>
            <p className="mb-6">The conversation you're looking for doesn't exist</p>
            <Button asChild>
              <Link to="/messages">Back to Messages</Link>
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
        <div className="max-w-6xl mx-auto px-4 flex flex-col h-[calc(100vh-150px)]">
          {/* Chat header */}
          <div className="flex justify-between items-center mb-4 p-3 border-b">
            <div className="flex items-center gap-3">
              <Button variant="ghost" size="icon" asChild className="md:flex">
                <Link to="/messages">
                  <ArrowLeft className="h-5 w-5" />
                </Link>
              </Button>

              <div className="flex items-center gap-3">
                <Avatar className="h-10 w-10">
                  {conversation.participant.avatar ? (
                    <AvatarImage src={conversation.participant.avatar} alt={conversation.participant.name} />
                  ) : null}
                  <AvatarFallback>
                    {conversation.participant.name.split(' ').map(n => n[0]).join('')}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="font-semibold">{conversation.participant.name}</h2>
                    {conversation.isPublic && (
                      <Badge variant="outline" className="text-xs">Public</Badge>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {conversation.participant.status === 'online' ? 'Online' : 'Offline'}
                  </p>
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1 text-xs text-muted-foreground mr-2">
                <span className="flex items-center"><MessageSquare className="h-3 w-3 mr-1" />{comments.length}</span>
                <span className="flex items-center ml-2"><ThumbsUp className="h-3 w-3 mr-1" />{conversation.likes}</span>
                <span className="flex items-center ml-2"><Share2 className="h-3 w-3 mr-1" />{conversation.shares}</span>
              </div>
              
              <Button variant="ghost" size="icon">
                <Phone className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="icon">
                <Video className="h-4 w-4" />
              </Button>
              <Button 
                variant="ghost" 
                size="icon"
                onClick={() => setShowInfo(!showInfo)}
              >
                <Info className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="icon">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </div>
          </div>
          
          <div className="flex flex-1 gap-4 overflow-hidden">
            {/* Chat conversation */}
            <div className={`${showInfo ? 'w-3/4' : 'w-full'} flex flex-col`}>
              <div className="flex-1 overflow-auto mb-4 border rounded-md bg-background">
                <ChatInterface 
                  messages={conversation.messages}
                  onSendMessage={(content) => {
                    console.log("Message sent:", content);
                    // In a real app, we would call an API to send the message
                  }}
                />
              </div>
              
              {/* Comment section */}
              <div className="border rounded-md bg-background">
                <div className="p-3 border-b flex items-center justify-between">
                  <h3 className="text-sm font-semibold">
                    Comments ({comments.length})
                  </h3>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => setShowComments(!showComments)}
                  >
                    {showComments ? 'Hide' : 'Show'}
                  </Button>
                </div>
                
                {showComments && (
                  <div className="p-3">
                    <div className="space-y-4 max-h-48 overflow-y-auto mb-3">
                      {comments.map((comment) => (
                        <div key={comment.id} className="flex gap-3">
                          <Avatar className="h-8 w-8">
                            <AvatarFallback>
                              {comment.user.name.split(' ').map(n => n[0]).join('')}
                            </AvatarFallback>
                          </Avatar>
                          
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-medium">{comment.user.name}</span>
                              <span className="text-xs text-muted-foreground">@{comment.user.username}</span>
                              <span className="text-xs text-muted-foreground ml-auto">
                                {formatDateTime(comment.timestamp)}
                              </span>
                            </div>
                            
                            <p className="text-sm my-1">{comment.content}</p>
                            
                            <div className="flex items-center">
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                className="h-7 px-2 text-xs gap-1"
                                onClick={() => handleLikeComment(comment.id)}
                              >
                                <ThumbsUp className="h-3 w-3" />
                                <span>{comment.likes}</span>
                              </Button>
                              <Button variant="ghost" size="sm" className="h-7 px-2 text-xs">
                                <MessageSquare className="h-3 w-3 mr-1" />
                                Reply
                              </Button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                    
                    <div className="flex gap-2 items-center">
                      <Avatar className="h-8 w-8">
                        <AvatarFallback>
                          {user.name?.split(' ').map(n => n[0]).join('') || 'U'}
                        </AvatarFallback>
                      </Avatar>
                      <Input
                        className="text-sm"
                        placeholder="Add a comment..."
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleAddComment()}
                      />
                      <Button 
                        size="sm"
                        onClick={handleAddComment}
                        disabled={!newComment.trim()}
                      >
                        Post
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Info sidebar */}
            {showInfo && (
              <Card className="w-1/4 overflow-auto">
                <CardHeader>
                  <CardTitle>Conversation Info</CardTitle>
                </CardHeader>
                
                <CardContent>
                  <div className="space-y-6">
                    <div className="flex flex-col items-center">
                      <Avatar className="h-20 w-20 mb-3">
                        {conversation.participant.avatar ? (
                          <AvatarImage src={conversation.participant.avatar} alt={conversation.participant.name} />
                        ) : null}
                        <AvatarFallback className="text-lg">
                          {conversation.participant.name.split(' ').map(n => n[0]).join('')}
                        </AvatarFallback>
                      </Avatar>
                      <h3 className="font-semibold text-lg">{conversation.participant.name}</h3>
                      <p className="text-sm text-muted-foreground">@{conversation.participant.username}</p>
                      
                      <div className="flex gap-3 mt-4">
                        <Button variant="outline" size="sm">View Profile</Button>
                        <Button variant="outline" size="sm">Block</Button>
                      </div>
                    </div>
                    
                    <div>
                      <h4 className="font-medium mb-2 text-sm">Shared Debates</h4>
                      <p className="text-sm text-muted-foreground">
                        No shared debates yet
                      </p>
                    </div>
                    
                    <div>
                      <h4 className="font-medium mb-2 text-sm">Files & Media</h4>
                      <p className="text-sm text-muted-foreground">
                        No shared files or media
                      </p>
                    </div>
                    
                    <div>
                      <h4 className="font-medium mb-2 text-sm">Message Stats</h4>
                      <div className="text-sm text-muted-foreground">
                        <p>First message: {conversation.messages[0]?.timestamp.toLocaleDateString()}</p>
                        <p>Total messages: {conversation.messages.length}</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </TransitionWrapper>
    </>
  );
};

export default TextChat;
