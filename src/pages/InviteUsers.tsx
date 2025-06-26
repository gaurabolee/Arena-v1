import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import TransitionWrapper from '@/components/TransitionWrapper';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { toast } from 'sonner';
import { Copy, X, Plus, User, Check, Linkedin, Facebook, Instagram, Youtube, ChevronDown, ChevronUp, DollarSign, Clock, FileText, Shield, Upload } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { cn } from '@/lib/utils';
import ProfileCard from '@/components/ProfileCard';

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
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [recipientName, setRecipientName] = useState('');
  const [currentTopic, setCurrentTopic] = useState('');
  const [topics, setTopics] = useState<string[]>([]);
  const [showPreview, setShowPreview] = useState(false);
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>([]);
  
  // New state for payment and event features
  const [paymentAmount, setPaymentAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('');
  const [eventType, setEventType] = useState('length'); // 'length' or 'time'
  const [eventParameter, setEventParameter] = useState('');
  const [showPaymentSection, setShowPaymentSection] = useState(false);
  const [showEventSection, setShowEventSection] = useState(false);
  
  // Payment status states
  const [paymentStatus, setPaymentStatus] = useState<'pending' | 'uploaded' | 'held' | 'released' | 'refunded'>('pending');
  const [isPaymentProcessing, setIsPaymentProcessing] = useState(false);

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
    if (!currentUser?.username) {
      toast.error('User not found');
      return;
    }
    
    const baseUrl = window.location.origin;
    const encodedName = encodeURIComponent(recipientName);
    const encodedTopics = encodeURIComponent(topics.join(','));
    const encodedPlatforms = encodeURIComponent(selectedPlatforms.join(','));
    const encodedPayment = encodeURIComponent(JSON.stringify({
      amount: paymentAmount,
      method: paymentMethod
    }));
    const encodedEvent = encodeURIComponent(JSON.stringify({
      type: eventType,
      parameter: eventParameter
    }));
    
    const inviteLink = `${baseUrl}/invite/${currentUser.username}?name=${encodedName}&topics=${encodedTopics}&verify=${encodedPlatforms}&payment=${encodedPayment}&event=${encodedEvent}`;
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

  // Check if form is complete for generating invite
  const isFormComplete = recipientName && 
    (topics.length > 0 || currentTopic.trim()) && 
    paymentAmount && 
    paymentMethod && 
    eventParameter &&
    paymentStatus === 'uploaded';

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

  const handlePaymentUpload = async () => {
    if (!paymentAmount || !paymentMethod) {
      toast.error('Please enter payment amount and select payment method');
      return;
    }

    setIsPaymentProcessing(true);
    
    // Simulate payment processing
    setTimeout(() => {
      setPaymentStatus('uploaded');
      setIsPaymentProcessing(false);
      toast.success('Payment uploaded successfully! Money is now held securely by Arena.');
    }, 2000);
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
                  <Label className="text-sm font-medium min-w-[120px]">Recipient Name</Label>
                  <Input
                    placeholder="Enter recipient's name"
                    value={recipientName}
                    onChange={(e) => setRecipientName(e.target.value)}
                    className="flex-1"
                  />
                </div>

                {/* Topics Input */}
                <div className="space-y-2">
                  <div className="flex items-center space-x-4">
                    <Label className="text-sm font-medium min-w-[120px]">Discussion Topics</Label>
                    <div className="flex space-x-2 flex-1">
                      <Input
                        placeholder="Add a topic for discussion"
                        value={currentTopic}
                        onChange={(e) => setCurrentTopic(e.target.value)}
                        onKeyPress={handleKeyPress}
                        className="flex-1"
                      />
                      <Button 
                        size="icon"
                        onClick={handleAddTopic}
                        disabled={!currentTopic.trim()}
                        className="shrink-0"
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  {/* Topics Tags */}
                  {topics.length > 0 && (
                    <div className="flex flex-wrap gap-2 ml-[136px]">
                      {topics.map((topic, index) => (
                        <Badge 
                          key={index} 
                          variant="secondary"
                          className="px-3 py-1 flex items-center space-x-1"
                        >
                          <span>{topic}</span>
                          <button
                            onClick={() => handleRemoveTopic(topic)}
                            className="ml-2 hover:text-destructive transition-colors"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>

                {/* Event Type Section */}
                <div className="space-y-2">
                  <button
                    onClick={() => setShowEventSection(!showEventSection)}
                    className="flex items-center justify-between w-full p-3 rounded-lg border border-border hover:bg-muted/30 transition-all duration-200 hover:border-border/60"
                  >
                    <div className="flex items-center gap-3">
                      <div className={cn(
                        "p-1.5 rounded-full",
                        eventType === 'length' ? "bg-blue-100 dark:bg-blue-900/20" : "bg-orange-100 dark:bg-orange-900/20"
                      )}>
                        {eventType === 'length' ? (
                          <FileText className="h-4 w-4 text-blue-600" />
                        ) : (
                          <Clock className="h-4 w-4 text-orange-600" />
                        )}
                      </div>
                      <div className="text-left">
                        <span className="text-sm font-medium">Event Type</span>
                        <p className="text-xs text-muted-foreground">Choose length or time-based</p>
                      </div>
                      {eventParameter && (
                        <Badge variant="secondary" className="text-xs">
                          {eventType === 'length' ? `${eventParameter} words` : `${eventParameter} min`}
                        </Badge>
                      )}
                    </div>
                    {showEventSection ? (
                      <ChevronUp className="h-4 w-4 text-muted-foreground" />
                    ) : (
                      <ChevronDown className="h-4 w-4 text-muted-foreground" />
                    )}
                  </button>

                  {showEventSection && (
                    <div className="pl-6 space-y-3 pt-1">
                      <div className="space-y-1.5">
                        <Label className="text-sm font-medium">Event Type</Label>
                        <div className="flex space-x-2">
                          <Button
                            type="button"
                            variant={eventType === 'length' ? 'default' : 'outline'}
                            size="sm"
                            onClick={() => setEventType('length')}
                            className="flex-1"
                          >
                            <FileText className="h-4 w-4 mr-2" />
                            Length-based
                          </Button>
                          <Button
                            type="button"
                            variant={eventType === 'time' ? 'default' : 'outline'}
                            size="sm"
                            onClick={() => setEventType('time')}
                            className="flex-1"
                          >
                            <Clock className="h-4 w-4 mr-2" />
                            Time-based
                          </Button>
                        </div>
                      </div>

                      <div className="space-y-1.5">
                        <Label className="text-sm font-medium">
                          {eventType === 'length' ? 'Word Count' : 'Duration (minutes)'}
                        </Label>
                        <Input
                          type="number"
                          placeholder={eventType === 'length' ? '300' : '20'}
                          value={eventParameter}
                          onChange={(e) => setEventParameter(e.target.value)}
                          className="w-full"
                          min="1"
                        />
                      </div>
                    </div>
                  )}
                </div>

                {/* Payment Section */}
                <div className="space-y-2">
                  <button
                    onClick={() => setShowPaymentSection(!showPaymentSection)}
                    className="flex items-center justify-between w-full p-3 rounded-lg border border-border hover:bg-muted/30 transition-all duration-200 hover:border-border/60"
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-1.5 rounded-full bg-green-100 dark:bg-green-900/20">
                        <DollarSign className="h-4 w-4 text-green-600" />
                      </div>
                      <div className="text-left">
                        <span className="text-sm font-medium">Incentivize Recipient</span>
                        <p className="text-xs text-muted-foreground">Show appreciation for their time with a secure payment</p>
                      </div>
                      {paymentAmount && (
                        <Badge variant="secondary" className="text-xs">
                          ${paymentAmount} held
                        </Badge>
                      )}
                    </div>
                    {showPaymentSection ? (
                      <ChevronUp className="h-4 w-4 text-muted-foreground" />
                    ) : (
                      <ChevronDown className="h-4 w-4 text-muted-foreground" />
                    )}
                  </button>

                  {showPaymentSection && (
                    <div className="pl-6 space-y-4 pt-2">
                      {/* Payment Amount Input */}
                      <div className="space-y-2">
                        <Label className="text-sm font-medium">Offer Amount</Label>
                        <div className="flex items-center space-x-2">
                          <span className="text-muted-foreground text-lg font-medium">$</span>
                          <Input
                            type="number"
                            placeholder="0.00"
                            value={paymentAmount}
                            onChange={(e) => setPaymentAmount(e.target.value)}
                            className="flex-1"
                            min="0"
                            step="0.01"
                          />
                        </div>
                      </div>

                      {/* Service Fee Breakdown */}
                      {paymentAmount && parseFloat(paymentAmount) > 0 && (
                        <div className="space-y-2 p-3 bg-muted/30 rounded-lg border">
                          <h4 className="text-sm font-medium">Payment Breakdown</h4>
                          <div className="space-y-1 text-sm">
                            <div className="flex justify-between">
                              <span>Offer Amount:</span>
                              <span>${paymentAmount}</span>
                            </div>
                            <div className="flex justify-between text-muted-foreground">
                              <span>Arena Service Fee (10%):</span>
                              <span>${(parseFloat(paymentAmount) * 0.1).toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between font-medium border-t pt-1">
                              <span>Total to Pay:</span>
                              <span>${(parseFloat(paymentAmount) * 1.1).toFixed(2)}</span>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Payment Method Selection */}
                      <div className="space-y-2">
                        <Label className="text-sm font-medium">Payment Method</Label>
                        <div className="grid grid-cols-2 gap-2">
                          <button
                            onClick={() => setPaymentMethod('stripe')}
                            className={cn(
                              "flex items-center gap-2 p-3 rounded-lg border transition-all duration-200",
                              paymentMethod === 'stripe' 
                                ? "border-primary bg-primary/5" 
                                : "border-border hover:border-border/60 hover:bg-muted/30"
                            )}
                          >
                            <div className="w-8 h-5 bg-blue-600 rounded flex items-center justify-center">
                              <span className="text-white text-xs font-bold">S</span>
                            </div>
                            <span className="text-sm font-medium">Stripe</span>
                            {paymentMethod === 'stripe' && (
                              <Check className="h-4 w-4 text-primary ml-auto" />
                            )}
                          </button>
                          <button
                            onClick={() => setPaymentMethod('paypal')}
                            className={cn(
                              "flex items-center gap-2 p-3 rounded-lg border transition-all duration-200",
                              paymentMethod === 'paypal' 
                                ? "border-primary bg-primary/5" 
                                : "border-border hover:border-border/60 hover:bg-muted/30"
                            )}
                          >
                            <div className="w-8 h-5 bg-blue-500 rounded flex items-center justify-center">
                              <span className="text-white text-xs font-bold">P</span>
                            </div>
                            <span className="text-sm font-medium">PayPal</span>
                            {paymentMethod === 'paypal' && (
                              <Check className="h-4 w-4 text-primary ml-auto" />
                            )}
                          </button>
                        </div>
                      </div>

                      {/* Security & Trust Indicators */}
                      <div className="space-y-2 p-3 bg-green-50 dark:bg-green-950/20 rounded-lg border border-green-200 dark:border-green-800/30">
                        <h4 className="text-sm font-medium text-green-800 dark:text-green-200 flex items-center gap-2">
                          <Shield className="h-4 w-4" />
                          Secure Payment Protection
                        </h4>
                        <div className="space-y-1 text-xs text-green-700 dark:text-green-300">
                          <div className="flex items-center gap-2">
                            <Check className="h-3 w-3" />
                            <span>Money held securely by Arena until event completion</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Check className="h-3 w-3" />
                            <span>Full refund if event doesn't start</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Check className="h-3 w-3" />
                            <span>Payment released only after successful event</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Check className="h-3 w-3" />
                            <span>Bank-level security encryption</span>
                          </div>
                        </div>
                      </div>

                      {/* Payment Status (if payment exists) */}
                      {paymentAmount && parseFloat(paymentAmount) > 0 && (
                        <div className="space-y-2 p-3 bg-blue-50 dark:bg-blue-950/20 rounded-lg border border-blue-200 dark:border-blue-800/30">
                          <h4 className="text-sm font-medium text-blue-800 dark:text-blue-200 flex items-center gap-2">
                            <Clock className="h-4 w-4" />
                            Payment Status
                          </h4>
                          <div className="space-y-2">
                            <div className="flex items-center justify-between text-sm">
                              <span className="text-blue-700 dark:text-blue-300">Status:</span>
                              <Badge 
                                variant="outline" 
                                className={cn(
                                  "text-xs",
                                  paymentStatus === 'uploaded' 
                                    ? "border-green-300 dark:border-green-700 text-green-700 dark:text-green-300"
                                    : "border-blue-300 dark:border-blue-700"
                                )}
                              >
                                {paymentStatus === 'pending' && 'Ready to Upload'}
                                {paymentStatus === 'uploaded' && 'Uploaded & Held'}
                                {paymentStatus === 'held' && 'Securely Held'}
                                {paymentStatus === 'released' && 'Released'}
                                {paymentStatus === 'refunded' && 'Refunded'}
                              </Badge>
                            </div>
                            <div className="flex items-center justify-between text-sm">
                              <span className="text-blue-700 dark:text-blue-300">Offer Amount:</span>
                              <span className="font-medium">${paymentAmount}</span>
                            </div>
                            <div className="flex items-center justify-between text-sm">
                              <span className="text-blue-700 dark:text-blue-300">Service Fee:</span>
                              <span className="font-medium">${(parseFloat(paymentAmount) * 0.1).toFixed(2)}</span>
                            </div>
                            <div className="flex items-center justify-between text-sm font-medium border-t pt-1">
                              <span>Total:</span>
                              <span>${(parseFloat(paymentAmount) * 1.1).toFixed(2)}</span>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Upload Payment Button */}
                      {paymentAmount && parseFloat(paymentAmount) > 0 && paymentMethod && paymentStatus === 'pending' && (
                        <Button 
                          className="w-full bg-green-600 hover:bg-green-700 text-white"
                          size="lg"
                          onClick={handlePaymentUpload}
                          disabled={isPaymentProcessing}
                        >
                          {isPaymentProcessing ? (
                            <>
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                              Processing Payment...
                            </>
                          ) : (
                            <>
                              <Upload className="h-4 w-4 mr-2" />
                              Secure ${(parseFloat(paymentAmount) * 1.1).toFixed(2)} Payment
                            </>
                          )}
                        </Button>
                      )}

                      {/* Payment Success Message */}
                      {paymentStatus === 'uploaded' && (
                        <div className="p-3 bg-green-50 dark:bg-green-950/20 rounded-lg border border-green-200 dark:border-green-800/30">
                          <div className="flex items-center gap-2 text-green-700 dark:text-green-300">
                            <Check className="h-4 w-4" />
                            <span className="text-sm font-medium">Payment Uploaded Successfully!</span>
                          </div>
                          <p className="text-xs text-green-600 dark:text-green-400 mt-1">
                            Your payment is now securely held by Arena and will be released after event completion.
                          </p>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Verification Platform Selector */}
                <div className="space-y-2">
                  <div className="flex items-start space-x-4">
                    <Label className="text-sm font-medium min-w-[120px] pt-2">Verification Request</Label>
                    <div className="flex-1">
                      <div className="flex flex-wrap gap-2">
                        {platforms.map((platform) => {
                          const Icon = platform.icon;
                          const isSelected = selectedPlatforms.includes(platform.id);
                          return (
                            <button
                              key={platform.id}
                              onClick={() => togglePlatform(platform.id)}
                              title={platform.name}
                              className={cn(
                                "relative flex items-center justify-center h-10 w-10 rounded-full transition-all duration-200 hover:scale-105",
                                isSelected 
                                  ? "bg-primary/10 border-2 border-primary/20" 
                                  : "bg-muted/50 border-2 border-transparent hover:bg-muted/70"
                              )}
                            >
                              <Icon className={cn(
                                "h-5 w-5",
                                isSelected ? "text-primary" : "text-muted-foreground"
                              )} />
                              {isSelected && (
                                <div className="absolute -top-1 -right-1 h-3.5 w-3.5 bg-primary rounded-full flex items-center justify-center">
                                  <Check className="h-2 w-2 text-primary-foreground" />
                                </div>
                              )}
                            </button>
                          );
                        })}
                      </div>
                      <p className="text-xs text-muted-foreground mt-2">
                        Select platforms where you'd like the recipient to verify their profile
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Preview Card */}
          {showPreview && (
            <Card className="border-primary/20">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">Invitation Preview</CardTitle>
                <CardDescription>
                  This is how your invitation will appear to the recipient
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <h2 className="text-xl font-semibold">Hi {recipientName},</h2>
                    <p className="text-muted-foreground">You have been invited to text in Public with:</p>
                  </div>

                  {/* Profile Card */}
                  <div className="border rounded-lg p-3 bg-muted/20">
                    <ProfileCard
                      user={{
                        name: currentUser?.name || '',
                        username: currentUser?.username || '',
                        photoURL: currentUser?.photoURL || undefined,
                        bio: currentUser?.bio,
                        socialLinks: currentUser?.socialLinks || {},
                        verificationStatus: currentUser?.verificationStatus || {},
                      }}
                      showActions={false}
                    />
                  </div>

                  {/* Topics Section */}
                  <div className="space-y-2">
                    <h3 className="font-medium text-sm text-muted-foreground uppercase tracking-wide">Discussion Topics</h3>
                    <div className="flex flex-wrap gap-2">
                      {topics.map((topic, index) => (
                        <Badge key={index} variant="secondary" className="px-3 py-1">
                          {topic}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  {/* Payment Section */}
                  {paymentAmount && (
                    <div className="space-y-2 p-3 bg-green-50 dark:bg-green-950/20 rounded-lg border border-green-200 dark:border-green-800/30">
                      <h3 className="font-medium text-sm text-green-800 dark:text-green-200 uppercase tracking-wide flex items-center gap-2">
                        <Shield className="h-4 w-4" />
                        Secure Payment Upload
                      </h3>
                      <div className="space-y-3">
                        <div className="flex items-center gap-3">
                          <div className="p-1.5 rounded-full bg-green-100 dark:bg-green-900/30">
                            <DollarSign className="h-4 w-4 text-green-600" />
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2 text-lg font-semibold text-green-700 dark:text-green-300">
                              <span>${paymentAmount}</span>
                              <Badge 
                                variant="outline" 
                                className={cn(
                                  "text-xs",
                                  paymentStatus === 'uploaded' 
                                    ? "border-green-300 dark:border-green-700 text-green-700 dark:text-green-300"
                                    : "border-orange-300 dark:border-orange-700 text-orange-700 dark:text-orange-300"
                                )}
                              >
                                {paymentStatus === 'pending' && 'Ready to Upload'}
                                {paymentStatus === 'uploaded' && 'Held by Arena'}
                                {paymentStatus === 'held' && 'Securely Held'}
                                {paymentStatus === 'released' && 'Released'}
                                {paymentStatus === 'refunded' && 'Refunded'}
                              </Badge>
                            </div>
                            <p className="text-sm text-green-600 dark:text-green-400">
                              {paymentStatus === 'uploaded' 
                                ? 'Payment securely held and will be released after event completion'
                                : 'Payment will be uploaded and held securely by Arena'
                              }
                            </p>
                          </div>
                        </div>
                        
                        {/* Payment Breakdown */}
                        <div className="bg-white dark:bg-gray-900/50 rounded-lg p-2 space-y-1 text-sm">
                          <div className="flex justify-between">
                            <span className="text-green-700 dark:text-green-300">Offer Amount:</span>
                            <span className="font-medium">${paymentAmount}</span>
                          </div>
                          <div className="flex justify-between text-muted-foreground">
                            <span>Arena Service Fee (10%):</span>
                            <span>${(parseFloat(paymentAmount) * 0.1).toFixed(2)}</span>
                          </div>
                          <div className="flex justify-between font-medium border-t pt-1 text-green-700 dark:text-green-300">
                            <span>Total Paid:</span>
                            <span>${(parseFloat(paymentAmount) * 1.1).toFixed(2)}</span>
                          </div>
                        </div>

                        {/* Security Features */}
                        <div className="grid grid-cols-2 gap-2 text-xs">
                          <div className="flex items-center gap-1 text-green-600 dark:text-green-400">
                            <Check className="h-3 w-3" />
                            <span>Secure Escrow</span>
                          </div>
                          <div className="flex items-center gap-1 text-green-600 dark:text-green-400">
                            <Check className="h-3 w-3" />
                            <span>Full Refund</span>
                          </div>
                          <div className="flex items-center gap-1 text-green-600 dark:text-green-400">
                            <Check className="h-3 w-3" />
                            <span>Bank Security</span>
                          </div>
                          <div className="flex items-center gap-1 text-green-600 dark:text-green-400">
                            <Check className="h-3 w-3" />
                            <span>Auto Release</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Event Type Section */}
                  {eventParameter && (
                    <div className="space-y-2 p-3 bg-blue-50 dark:bg-blue-950/20 rounded-lg border border-blue-200 dark:border-blue-800/30">
                      <h3 className="font-medium text-sm text-blue-800 dark:text-blue-200 uppercase tracking-wide">Event Details</h3>
                      <div className="flex items-center gap-3">
                        <div className="p-1.5 rounded-full bg-blue-100 dark:bg-blue-900/30">
                          {eventType === 'length' ? (
                            <FileText className="h-4 w-4 text-blue-600" />
                          ) : (
                            <Clock className="h-4 w-4 text-orange-600" />
                          )}
                        </div>
                        <div>
                          <span className="font-medium text-blue-700 dark:text-blue-300">
                            {eventType === 'length' ? `${eventParameter} words` : `${eventParameter} minutes`}
                          </span>
                          <p className="text-sm text-blue-600 dark:text-blue-400">
                            {eventType === 'length' ? 'Length-based discussion' : 'Time-based discussion'}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Verification requested */}
                  {selectedPlatforms.length > 0 && (
                    <div className="space-y-2 p-3 bg-muted/30 rounded-lg border">
                      <h3 className="font-medium text-sm text-muted-foreground uppercase tracking-wide">Verification Requested</h3>
                      <div className="flex flex-wrap gap-2">
                        {selectedPlatforms.map(platformId => {
                          const platform = platforms.find(p => p.id === platformId);
                          if (!platform) return null;
                          const Icon = platform.icon;
                          return (
                            <div key={platformId} className="flex items-center gap-2 px-2 py-1 bg-background rounded-full border">
                              <div className="h-4 w-4 rounded-full flex items-center justify-center text-primary bg-primary/10">
                                <Icon className="h-2.5 w-2.5" />
                              </div>
                              <span className="text-sm font-medium">{platform.name}</span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="flex justify-between items-center pt-3 border-t">
                    <Button 
                      variant="outline"
                      className="w-28"
                      disabled
                    >
                      Accept
                    </Button>
                    <Button 
                      variant="outline" 
                      className="w-28"
                      disabled
                    >
                      Edit Topics
                    </Button>
                    <Button 
                      variant="outline" 
                      className="w-28"
                      disabled
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
              disabled={!isFormComplete}
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
