import React, { useState, useEffect } from 'react';
import { useAuth, ExtendedUser } from '@/context/AuthContext';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import TransitionWrapper from '@/components/TransitionWrapper';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { toast } from 'sonner';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { User, Linkedin, Facebook, Instagram, Youtube, CheckCircle, Check, X, Plus } from 'lucide-react';
import Logo from '@/components/Logo';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';

// Custom TikTok icon
const TikTokIcon = ({ className = "h-4 w-4" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/>
  </svg>
);

// Custom X icon
const XIcon = ({ className = "h-4 w-4" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
  </svg>
);

const InvitePreview: React.FC = () => {
  const { findUserByUsername } = useAuth();
  const navigate = useNavigate();
  const { username } = useParams();
  const [searchParams] = useSearchParams();
  const recipientName = searchParams.get('name');
  const topics = searchParams.get('topics')?.split(',') || [];
  const [verificationPlatforms, setVerificationPlatforms] = useState<string[]>([]);
  const [profileUserData, setProfileUserData] = useState<ExtendedUser | null>(null);
  const [loadingUser, setLoadingUser] = useState(true);
  const [paymentAmount, setPaymentAmount] = useState<string>('');
  const [eventType, setEventType] = useState<string>('');
  const [eventParameter, setEventParameter] = useState<string>('');
  const [eventTimePeriod, setEventTimePeriod] = useState<string>('');

  // Negotiation modal state
  const [showNegotiation, setShowNegotiation] = useState(false);
  const [negotiationTopics, setNegotiationTopics] = useState<string[]>([]);
  const [newTopic, setNewTopic] = useState('');
  const [negotiationEventParameter, setNegotiationEventParameter] = useState('');
  const [negotiationTimePeriod, setNegotiationTimePeriod] = useState('');
  const [negotiationPaymentAmount, setNegotiationPaymentAmount] = useState('');
  const [negotiationMessage, setNegotiationMessage] = useState('');

  useEffect(() => {
    (async () => {
      if (!username) {
        setLoadingUser(false);
        return;
      }
      const user = await findUserByUsername(username);
      setProfileUserData(user);
      setLoadingUser(false);
    })();
  }, [username]);

  // Define platforms with their icons
  const platforms = [
    { id: 'linkedin', name: 'LinkedIn', icon: Linkedin },
    { id: 'twitter', name: 'X', icon: XIcon },
    { id: 'facebook', name: 'Facebook', icon: Facebook },
    { id: 'instagram', name: 'Instagram', icon: Instagram },
    { id: 'youtube', name: 'YouTube', icon: Youtube },
    { id: 'tiktok', name: 'TikTok', icon: TikTokIcon }
  ];

  // Parse URL parameters
  useEffect(() => {
    const verifyParam = searchParams.get('verify');
    const paymentParam = searchParams.get('payment');
    const eventParam = searchParams.get('event');

    if (verifyParam) {
      setVerificationPlatforms(verifyParam.split(','));
    }

    if (paymentParam) {
      try {
        const paymentData = JSON.parse(decodeURIComponent(paymentParam));
        setPaymentAmount(paymentData.amount || '0');
        setNegotiationPaymentAmount(paymentData.amount || '0');
      } catch (e) {
        setPaymentAmount('0');
        setNegotiationPaymentAmount('0');
      }
    }

    if (eventParam) {
      try {
        const eventData = JSON.parse(decodeURIComponent(eventParam));
        setEventType(eventData.type || '');
        setEventParameter(eventData.parameter || '');
        setEventTimePeriod(eventData.timePeriod || '');
        
        // Set negotiation defaults
        setNegotiationEventParameter(eventData.parameter || '');
        setNegotiationTimePeriod(eventData.timePeriod || '');
      } catch (e) {
        setEventType('');
        setEventParameter('');
        setEventTimePeriod('');
      }
    }

    // Set negotiation topics
    setNegotiationTopics(topics);
  }, [searchParams, topics]);

  const getEventDisplayText = () => {
    let eventText = '';
    
    if (eventType === 'length') {
      if (eventParameter === 'custom') {
        eventText = 'Custom word count discussion';
      } else {
        eventText = `${eventParameter} word discussion`;
      }
      
      // Add time period if available
      if (eventTimePeriod) {
        if (eventTimePeriod === '1') {
          eventText += ' over 1 day';
        } else if (eventTimePeriod === '3') {
          eventText += ' over 3 days';
        } else if (eventTimePeriod === '7') {
          eventText += ' over 7 days';
        } else if (eventTimePeriod === 'custom') {
          eventText += ' over custom period';
        }
      }
    } else if (eventType === 'time') {
      if (eventParameter === 'custom') {
        eventText = 'Custom duration discussion';
      } else {
        eventText = `${eventParameter} minute discussion`;
      }
    }
    
    return eventText || 'Discussion';
  };

  const handleAccept = () => {
    // Create the registration URL with query parameters
    const searchParams = new URLSearchParams(window.location.search);
    const name = searchParams.get('name');
    const topicsParam = searchParams.get('topics');
    const verifyParam = searchParams.get('verify');
    
    const registrationURL = new URL('/register', window.location.origin);
    if (name) registrationURL.searchParams.set('name', name);
    if (topicsParam) registrationURL.searchParams.set('topics', topicsParam);
    if (verifyParam) registrationURL.searchParams.set('verify', verifyParam);
    registrationURL.searchParams.set('invitedBy', username || '');
    registrationURL.searchParams.set('isInvitation', 'true');
    
    // Open registration page in new tab
    window.open(registrationURL.toString(), '_blank');
  };

  const handleDecline = () => {
    toast.info('Invitation declined');
    navigate('/');
  };

  const handleModifyTopics = () => {
    setShowNegotiation(true);
  };

  // Negotiation functions
  const handleAddTopic = () => {
    if (newTopic.trim() && !negotiationTopics.includes(newTopic.trim())) {
      setNegotiationTopics([...negotiationTopics, newTopic.trim()]);
      setNewTopic('');
    }
  };

  const handleRemoveTopic = (topicToRemove: string) => {
    setNegotiationTopics(negotiationTopics.filter(topic => topic !== topicToRemove));
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleAddTopic();
    }
  };

  const handleSubmitNegotiation = () => {
    if (negotiationTopics.length === 0) {
      toast.error('Please add at least one topic');
      return;
    }
    
    toast.success('Counter-proposal submitted successfully!');
    setShowNegotiation(false);
  };

  const handleCancelNegotiation = () => {
    setShowNegotiation(false);
    // Reset to original values
    setNegotiationTopics(topics);
    setNegotiationEventParameter(eventParameter);
    setNegotiationTimePeriod(eventTimePeriod);
    setNegotiationPaymentAmount(paymentAmount);
    setNegotiationMessage('');
  };

  if (loadingUser) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        Loading...
      </div>
    );
  }

  if (!profileUserData) {
    return (
      <div className="min-h-screen bg-background">
        {/* Arena Logo and Sign Up */}
        <div className="fixed top-4 left-4 z-50">
          <div className="flex items-center gap-2.5">
            <Logo size={32} angle={135} />
            <span className="text-xl font-medium">Arena</span>
          </div>
        </div>
        
        {/* Sign Up Button - Top Right */}
        <div className="fixed top-4 right-4 z-50">
          <div className="flex items-center gap-3">
            <Button 
              variant="ghost"
              className="text-sm font-medium hover:text-primary"
              onClick={() => window.open('/login', '_blank')}
            >
              Login
            </Button>
            <Button 
              className="bg-black text-white hover:bg-black/90 text-sm font-medium"
              onClick={() => window.open('/register', '_blank')}
            >
              Sign up
            </Button>
          </div>
        </div>

        <TransitionWrapper animation="fade" className="min-h-screen pt-24 pb-10">
          <div className="max-w-3xl mx-auto px-4">
            <Card>
              <CardContent className="pt-6">
                <div className="text-center py-8">
                  <h2 className="text-xl font-medium mb-2">Profile Not Found</h2>
                  <p className="text-muted-foreground mb-4">The profile you're looking for doesn't exist or has been removed.</p>
                  <Button onClick={() => window.location.href = "/"}>Go Home</Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </TransitionWrapper>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Arena Logo and Sign Up */}
      <div className="fixed top-4 left-4 z-50">
        <div className="flex items-center gap-2.5">
          <Logo size={32} angle={135} />
          <span className="text-xl font-medium">Arena</span>
        </div>
      </div>
      
      {/* Sign Up Button - Top Right */}
      <div className="fixed top-4 right-4 z-50">
        <div className="flex items-center gap-3">
          <Button 
            variant="ghost"
            className="text-sm font-medium hover:text-primary"
            onClick={() => window.open('/login', '_blank')}
          >
            Login
          </Button>
          <Button 
            className="bg-black text-white hover:bg-black/90 text-sm font-medium"
            onClick={() => window.open('/register', '_blank')}
          >
            Sign up
          </Button>
        </div>
      </div>

      <TransitionWrapper animation="fade" className="min-h-screen pt-24 pb-10">
        <div className="max-w-3xl mx-auto px-4">
          <Card className="border-primary/20 shadow-2xl relative">
            <CardContent className="p-8">
              <div className="space-y-6">
                <div className="space-y-3">
                  <h2 className="text-xl font-medium text-foreground">Hi {recipientName},</h2>
                  <p className="text-sm text-muted-foreground">You have been invited to text in public with:</p>
                </div>

                {/* Profile Card */}
                <div className="bg-background border border-border rounded-lg p-6 shadow-sm mb-4 transition-all duration-200 hover:shadow-md hover:border-primary/40 cursor-pointer flex flex-col gap-4">
                  <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4">
                    <div className="relative">
                      <Avatar className="h-16 w-16">
                        <AvatarImage 
                          src={profileUserData?.photoURL || undefined} 
                          alt={profileUserData?.name}
                          className="object-cover"
                        />
                        <AvatarFallback>
                          {profileUserData?.name ? profileUserData.name.charAt(0).toUpperCase() : <User className="h-10 w-10" />}
                        </AvatarFallback>
                      </Avatar>
                    </div>
                    <div className="flex-1 text-center sm:text-left">
                      <div className="flex flex-col gap-0.5 items-center sm:items-start">
                        <span className="text-xl font-medium text-card-foreground">{profileUserData?.name}</span>
                        <span className="text-sm text-muted-foreground">@{profileUserData?.username}</span>
                      </div>
                      <p className="mt-2 text-sm text-muted-foreground">
                        {profileUserData?.bio || 'Tell us about yourself...'}
                      </p>
                    </div>
                  </div>
                  {/* Verified Accounts Section */}
                  <div>
                    <h3 className="text-xs font-medium text-muted-foreground tracking-wide mb-1">Verified Accounts</h3>
                    <div className="flex flex-row gap-3 justify-center sm:justify-start">
                      {/* LinkedIn */}
                      <div className="relative flex items-center justify-center">
                        <span className="h-8 w-8 rounded-full bg-muted flex items-center justify-center border border-border">
                          <Linkedin className="h-4 w-4 text-muted-foreground" />
                        </span>
                        {profileUserData?.verificationStatus?.linkedin?.status === 'verified' && (
                          <span className="absolute -top-1 -right-1 h-3 w-3 bg-card rounded-full flex items-center justify-center border border-border shadow">
                            <Check className="h-2 w-2 text-primary" />
                          </span>
                        )}
                      </div>
                      {/* X (Twitter) */}
                      <div className="relative flex items-center justify-center">
                        <span className="h-8 w-8 rounded-full bg-muted flex items-center justify-center border border-border">
                          <XIcon className="h-4 w-4 text-muted-foreground" />
                        </span>
                        {profileUserData?.verificationStatus?.twitter?.status === 'verified' && (
                          <span className="absolute -top-1 -right-1 h-3 w-3 bg-card rounded-full flex items-center justify-center border border-border shadow">
                            <Check className="h-2 w-2 text-primary" />
                          </span>
                        )}
                      </div>
                      {/* Facebook */}
                      <div className="relative flex items-center justify-center">
                        <span className="h-8 w-8 rounded-full bg-muted flex items-center justify-center border border-border">
                          <Facebook className="h-4 w-4 text-muted-foreground" />
                        </span>
                        {profileUserData?.verificationStatus?.facebook?.status === 'verified' && (
                          <span className="absolute -top-1 -right-1 h-3 w-3 bg-card rounded-full flex items-center justify-center border border-border shadow">
                            <Check className="h-2 w-2 text-primary" />
                          </span>
                        )}
                      </div>
                      {/* Instagram */}
                      <div className="relative flex items-center justify-center">
                        <span className="h-8 w-8 rounded-full bg-muted flex items-center justify-center border border-border">
                          <Instagram className="h-4 w-4 text-muted-foreground" />
                        </span>
                        {profileUserData?.verificationStatus?.instagram?.status === 'verified' && (
                          <span className="absolute -top-1 -right-1 h-3 w-3 bg-card rounded-full flex items-center justify-center border border-border shadow">
                            <Check className="h-2 w-2 text-primary" />
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Topics Section */}
                <div className="space-y-3 mb-4">
                  <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wide">Topics</h3>
                  <div className="space-y-0.5">
                    {topics.map((topic, index) => (
                      <div key={index} className="flex items-center gap-2 py-1 border-b border-border/30 last:border-b-0">
                        <div className="w-1.5 h-1.5 bg-muted-foreground/40 rounded-full flex-shrink-0"></div>
                        <span className="text-sm text-foreground leading-relaxed">{topic}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Event Details Section */}
                <div className="space-y-3 mb-2">
                  <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wide">Event Details</h3>
                  <div className="flex items-center gap-2 py-1">
                    <span className="text-sm text-foreground leading-relaxed">{getEventDisplayText()}</span>
                  </div>
                </div>

                {/* Payment Section */}
                <div className="space-y-3 mb-2">
                  <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wide">Offer Amount</h3>
                  <div className="flex flex-col gap-1 py-1">
                    <span className="text-sm text-foreground leading-relaxed">${paymentAmount || '0'}</span>
                    <span className="text-xs text-muted-foreground">Subject to 5% platform fee. Amount will be held by Arena immediately after acceptance and will be deposited after successful event completion.</span>
                  </div>
                </div>

                {/* Verification requested */}
                {verificationPlatforms.length > 0 && (
                  <div className="space-y-3 mb-2">
                    <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wide">Verification Requested</h3>
                    <div className="flex items-center gap-2 py-1">
                      {verificationPlatforms.map(platformId => {
                        const platform = platforms.find(p => p.id === platformId);
                        if (!platform) return null;
                        const Icon = platform.icon;
                        return (
                          <span key={platformId} className="h-8 w-8 rounded-full flex items-center justify-center bg-muted text-muted-foreground">
                            <Icon className="h-4 w-4" />
                          </span>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex justify-between items-center pt-4 border-t">
                  <Button 
                    onClick={handleAccept}
                    variant="outline"
                    size="sm"
                    className="w-28 h-9 text-sm font-medium border-border hover:border-primary/40 hover:bg-primary/5 transition-all duration-200"
                  >
                    Accept
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    className="w-28 h-9 text-sm font-medium border-border hover:border-primary/40 hover:bg-primary/5 transition-all duration-200"
                    onClick={handleModifyTopics}
                  >
                    Negotiate
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    className="w-28 h-9 text-sm font-medium border-border hover:border-primary/40 hover:bg-primary/5 transition-all duration-200"
                    onClick={handleDecline}
                  >
                    Decline
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </TransitionWrapper>

      {/* Simple Negotiation Modal */}
      {showNegotiation && (
        <div className="fixed inset-0 bg-background/95 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <Card className="max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border-primary/20">
            <CardHeader className="pb-4">
              <div className="flex justify-between items-center">
                <CardTitle className="text-xl font-medium">Negotiate Invitation</CardTitle>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleCancelNegotiation}
                  className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Current Proposal */}
              <div className="space-y-3">
                <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wide">Current Proposal</h3>
                <div className="bg-muted/30 border border-border/50 rounded-lg p-4 space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-foreground">Topics:</span>
                    <span className="text-sm text-muted-foreground">{topics.join(', ')}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-foreground">Event:</span>
                    <span className="text-sm text-muted-foreground">{getEventDisplayText()}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-foreground">Payment:</span>
                    <span className="text-sm text-muted-foreground">${paymentAmount || '0'}</span>
                  </div>
                </div>
              </div>

              {/* Your Counter-Proposal */}
              <div className="space-y-4">
                <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wide">Your Counter-Proposal</h3>

                {/* Topics */}
                <div className="space-y-3">
                  <Label className="text-sm font-medium text-foreground">Topics</Label>
                  <div className="space-y-2">
                    {negotiationTopics.map((topic, index) => (
                      <div key={index} className="flex items-center gap-2 p-3 bg-muted/30 rounded-md border border-border/50">
                        <span className="text-sm text-foreground flex-1">{topic}</span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRemoveTopic(topic)}
                          className="h-6 w-6 p-0 text-muted-foreground hover:text-destructive"
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                    ))}
                    <div className="flex gap-2">
                      <Input
                        placeholder="Add new topic..."
                        value={newTopic}
                        onChange={(e) => setNewTopic(e.target.value)}
                        onKeyPress={handleKeyPress}
                        className="flex-1"
                      />
                      <Button
                        size="sm"
                        onClick={handleAddTopic}
                        disabled={!newTopic.trim()}
                        className="shrink-0"
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Event Length */}
                <div className="space-y-3">
                  <Label className="text-sm font-medium text-foreground">Event Length</Label>
                  <div className="grid grid-cols-3 gap-3">
                    {['500', '1000', '2000'].map((words) => (
                      <Button
                        key={words}
                        variant={negotiationEventParameter === words ? "default" : "outline"}
                        size="sm"
                        onClick={() => setNegotiationEventParameter(words)}
                        className="text-sm"
                      >
                        {words} words
                      </Button>
                    ))}
                  </div>
                </div>

                {/* Time Period */}
                <div className="space-y-3">
                  <Label className="text-sm font-medium text-foreground">Time Period</Label>
                  <div className="grid grid-cols-3 gap-3">
                    {['1', '3', '7'].map((days) => (
                      <Button
                        key={days}
                        variant={negotiationTimePeriod === days ? "default" : "outline"}
                        size="sm"
                        onClick={() => setNegotiationTimePeriod(days)}
                        className="text-sm"
                      >
                        {days} day{days !== '1' ? 's' : ''}
                      </Button>
                    ))}
                  </div>
                </div>

                {/* Payment */}
                <div className="space-y-3">
                  <Label className="text-sm font-medium text-foreground">Payment Amount</Label>
                  <div className="grid grid-cols-2 gap-3">
                    {['20', '50', '100', '1000'].map((amount) => (
                      <Button
                        key={amount}
                        variant={negotiationPaymentAmount === amount ? "default" : "outline"}
                        size="sm"
                        onClick={() => setNegotiationPaymentAmount(amount)}
                        className="text-sm"
                      >
                        ${amount}
                      </Button>
                    ))}
                  </div>
                </div>

                {/* Message */}
                <div className="space-y-3">
                  <Label className="text-sm font-medium text-foreground">Message to {profileUserData?.name}</Label>
                  <Textarea
                    placeholder="Optional message explaining your changes..."
                    value={negotiationMessage}
                    onChange={(e) => setNegotiationMessage(e.target.value)}
                    className="min-h-[80px] resize-none"
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end gap-3 pt-4 border-t border-border">
                <Button
                  variant="outline"
                  onClick={handleCancelNegotiation}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleSubmitNegotiation}
                  disabled={negotiationTopics.length === 0}
                >
                  Submit Proposal
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default InvitePreview;