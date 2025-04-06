import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import TransitionWrapper from '@/components/TransitionWrapper';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { toast } from 'sonner';
import { Copy, X, Plus, User, CheckCircle, Linkedin, Facebook, Instagram, Youtube } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { cn } from '@/lib/utils';

const TikTokIcon = ({ className = "h-4 w-4" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/>
  </svg>
);

const XIcon = ({ className = "h-4 w-4" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
  </svg>
);

const InviteUsers: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [recipientName, setRecipientName] = useState('');
  const [currentTopic, setCurrentTopic] = useState('');
  const [topics, setTopics] = useState<string[]>([]);
  const [showPreview, setShowPreview] = useState(false);
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>(['linkedin']);
  
  if (!user) {
    return (
      <>
        <Navbar />
        <TransitionWrapper animation="fade" className="min-h-screen pt-24 pb-10">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h1 className="text-2xl font-semibold mb-4">Please Log In</h1>
            <p className="mb-6">You need to be logged in to create invites</p>
            <Button asChild>
              <Link to="/login">Log In</Link>
            </Button>
          </div>
        </TransitionWrapper>
      </>
    );
  }

  const handleAddTopic = () => {
    if (currentTopic.trim() && !topics.includes(currentTopic.trim())) {
      setTopics([...topics, currentTopic.trim()]);
      setCurrentTopic('');
    }
  };

  const handleRemoveTopic = (topicToRemove: string) => {
    setTopics(topics.filter(topic => topic !== topicToRemove));
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddTopic();
    }
  };

  const generateInviteLink = () => {
    const baseUrl = window.location.origin;
    const encodedName = encodeURIComponent(recipientName);
    const encodedTopics = encodeURIComponent(topics.join(','));
    const encodedPlatforms = encodeURIComponent(selectedPlatforms.join(','));
    const inviteLink = `${baseUrl}/invite/${user.username}?name=${encodedName}&topics=${encodedTopics}&verify=${encodedPlatforms}`;
    navigator.clipboard.writeText(inviteLink);
    toast.success('Invite link copied to clipboard');
  };

  const handlePreview = () => {
    if (!recipientName) {
      toast.error('Please enter recipient name');
      return;
    }
    
    // If there's a current topic but not added yet, add it automatically
    if (currentTopic.trim() && !topics.includes(currentTopic.trim())) {
      setTopics([...topics, currentTopic.trim()]);
    }
    
    // Check if we have either topics in the array or a current topic
    if (topics.length === 0 && !currentTopic.trim()) {
      toast.error('Please add at least one topic');
      return;
    }
    
    // Toggle preview state
    setShowPreview(!showPreview);
  };

  const handleAccept = () => {
    // TODO: Implement accept logic
    toast.success('Invitation accepted');
    navigate('/text');
  };

  const handleDecline = () => {
    setShowPreview(false);
    toast.info('Invitation declined');
  };

  const handleModifyTopics = () => {
    setShowPreview(false);
  };

  const platforms = [
    { id: 'linkedin', name: 'LinkedIn', icon: Linkedin, color: 'bg-[#0A66C2]' },
    { id: 'twitter', name: 'X', icon: XIcon, color: 'bg-black' },
    { id: 'facebook', name: 'Facebook', icon: Facebook, color: 'bg-[#1877F2]' },
    { id: 'instagram', name: 'Instagram', icon: Instagram, color: 'bg-gradient-to-tr from-yellow-400 via-red-500 to-purple-500' },
    { id: 'youtube', name: 'YouTube', icon: Youtube, color: 'bg-[#FF0000]' },
    { id: 'tiktok', name: 'TikTok', icon: TikTokIcon, color: 'bg-black' }
  ];

  const togglePlatform = (platformId: string) => {
    setSelectedPlatforms(prev => 
      prev.includes(platformId) 
        ? prev.filter(id => id !== platformId) 
        : [...prev, platformId]
    );
  };

  return (
    <>
      <Navbar />
      <TransitionWrapper animation="fade" className="min-h-screen pt-24 pb-10">
        <div className="max-w-3xl mx-auto px-4">
          {/* Create Invite Card */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Create Invite Link</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {/* Name Input */}
                <div className="flex items-center space-x-4">
                  <span className="text-sm font-medium min-w-[60px]">Name</span>
                  <Input
                    placeholder="Enter recipient's name"
                    value={recipientName}
                    onChange={(e) => setRecipientName(e.target.value)}
                    className="flex-1"
                  />
                </div>

                {/* Topics Input */}
                <div className="space-y-3">
                  <div className="flex items-center space-x-4">
                    <span className="text-sm font-medium min-w-[60px]">Topics</span>
                    <div className="flex-1 flex space-x-2">
                      <Input
                        placeholder="Add a topic for discussion"
                        value={currentTopic}
                        onChange={(e) => setCurrentTopic(e.target.value)}
                        onKeyPress={handleKeyPress}
                      />
                      <Button 
                        size="icon"
                        onClick={handleAddTopic}
                        disabled={!currentTopic.trim()}
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  {/* Topics Tags */}
                  {topics.length > 0 && (
                    <div className="flex flex-wrap gap-2 pl-[76px]">
                      {topics.map((topic, index) => (
                        <Badge 
                          key={index} 
                          variant="secondary"
                          className="px-3 py-1 flex items-center space-x-1"
                        >
                          <span>{topic}</span>
                          <button
                            onClick={() => handleRemoveTopic(topic)}
                            className="ml-2 hover:text-destructive"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>

                {/* Verification Platform Selector */}
                <div className="flex items-start space-x-4">
                  <span className="text-sm font-medium min-w-[60px] pt-2">Verification Request</span>
                  <div className="flex-1">
                    <div className="flex flex-wrap gap-3">
                      {platforms.map((platform) => {
                        const Icon = platform.icon;
                        const isSelected = selectedPlatforms.includes(platform.id);
                        return (
                          <button
                            key={platform.id}
                            onClick={() => togglePlatform(platform.id)}
                            className={cn(
                              "relative h-9 w-9 rounded-full flex items-center justify-center transition-all duration-200",
                              "border focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary",
                              isSelected 
                                ? "border-primary bg-primary/5 text-primary" 
                                : "border-border hover:border-primary/50 text-muted-foreground hover:text-foreground hover:bg-muted/50"
                            )}
                            title={platform.name}
                          >
                            <Icon className={cn(
                              "h-4 w-4 transition-all duration-200",
                              isSelected ? "scale-105" : ""
                            )} />
                            {isSelected && (
                              <div className="absolute -top-1 -right-1 h-3 w-3 rounded-full bg-primary flex items-center justify-center">
                                <CheckCircle className="h-2 w-2 text-white" />
                              </div>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Preview Card */}
          {showPreview && (
            <Card>
              <CardContent className="pt-6">
                <div className="space-y-6">
                  <div className="space-y-4">
                    <h2 className="text-xl">Hi {recipientName},</h2>
                    <p>You have been invited to text in Public with:</p>
                  </div>

                  {/* Profile Card */}
                  <Card className="mb-6">
                    <CardHeader className="pb-4">
                      <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
                        <div className="relative">
                          <Avatar className="h-20 w-20">
                            <AvatarImage 
                              src={user?.photoURL || undefined} 
                              alt={user?.name}
                              className="object-cover"
                            />
                            <AvatarFallback>
                              {user?.name ? user.name.charAt(0).toUpperCase() : <User className="h-12 w-12" />}
                            </AvatarFallback>
                          </Avatar>
                        </div>
                        
                        <div className="text-center sm:text-left">
                          <CardTitle className="text-2xl font-medium mb-1">{user?.name}</CardTitle>
                          <CardDescription>@{user?.username}</CardDescription>
                          <p className="mt-3 text-muted-foreground">
                            {user?.bio || 'Tell us about yourself...'}
                          </p>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {/* Verified Social Accounts */}
                        <div className="space-y-2">
                          <h3 className="font-medium">Verified Accounts</h3>
                          <div className="flex flex-wrap gap-3">
                            {Object.entries(user?.socialLinks || {}).map(([platform, url]) => {
                              if (!url) return null;
                              
                              const platformInfo = platforms.find(p => p.id === platform);
                              if (!platformInfo) return null;
                              
                              const Icon = platformInfo.icon;
                              return (
                                <div key={platform} className="flex items-center space-x-1">
                                  <div className="h-5 w-5 rounded-full flex items-center justify-center text-primary bg-primary/5">
                                    <Icon className="h-3 w-3" />
                                  </div>
                                  <span className="text-sm">{platformInfo.name}</span>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Topics Section */}
                  <div className="space-y-2">
                    <h3 className="font-medium">On topics:</h3>
                    <div className="flex flex-wrap gap-2">
                      {topics.map((topic, index) => (
                        <Badge key={index} variant="secondary" className="px-3 py-1">
                          {topic}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  {/* Verification Display */}
                  <div className="flex flex-wrap gap-2 text-sm bg-muted/30 px-3 py-2 rounded-md">
                    <span className="font-medium mr-1">Verification requested</span>
                    {selectedPlatforms.map(platformId => {
                      const platform = platforms.find(p => p.id === platformId);
                      if (!platform) return null;
                      
                      const Icon = platform.icon;
                      return (
                        <div key={platformId} className="flex items-center space-x-1">
                          <div className="h-5 w-5 rounded-full flex items-center justify-center text-primary bg-primary/5">
                            <Icon className="h-3 w-3" />
                          </div>
                          <span>{platform.name}</span>
                        </div>
                      );
                    })}
                  </div>

                  {/* Action Buttons */}
                  <div className="flex justify-between items-center pt-4">
                    <Button 
                      onClick={handleAccept} 
                      variant="outline"
                      className="w-28"
                    >
                      Accept
                    </Button>
                    <Button 
                      variant="outline" 
                      onClick={handleModifyTopics}
                      className="w-28"
                    >
                      Edit Topics
                    </Button>
                    <Button 
                      variant="outline" 
                      onClick={handleDecline}
                      className="w-28"
                    >
                      Decline
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Action Buttons */}
          <div className="flex justify-center gap-4 mt-6">
            <Button 
              onClick={handlePreview}
              disabled={!recipientName || (topics.length === 0 && !currentTopic.trim())}
              variant="outline"
              className="w-40 h-11 text-base font-medium"
            >
              {showPreview ? "Hide Preview" : "Preview"}
            </Button>
            <Button 
              onClick={generateInviteLink}
              disabled={!recipientName || (topics.length === 0 && !currentTopic.trim())}
              variant="outline"
              className="w-40 h-11 text-base font-medium"
            >
              <Copy className="mr-2 h-4 w-4" />
              Copy Invite Link
            </Button>
          </div>
        </div>
      </TransitionWrapper>
    </>
  );
};

export default InviteUsers;
