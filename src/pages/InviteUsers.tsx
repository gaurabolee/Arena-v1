import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import TransitionWrapper from '@/components/TransitionWrapper';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { toast } from 'sonner';
import { Copy, X, Plus, User, Check, Linkedin, Facebook, Instagram, Youtube, ChevronDown, ChevronUp, DollarSign, Clock, FileText, Shield, Upload, CreditCard } from 'lucide-react';
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
  const [eventType, setEventType] = useState(''); // Empty string - no default selection
  const [eventParameter, setEventParameter] = useState('');
  const [eventTimePeriod, setEventTimePeriod] = useState(''); // days for length-based
  const [showPaymentSection, setShowPaymentSection] = useState(false);
  const [showEventSection, setShowEventSection] = useState(false);
  
  // Toggle state for incentivize mode
  const [incentivizeEnabled, setIncentivizeEnabled] = useState(true);
  
  // Custom value states
  const [customWordCount, setCustomWordCount] = useState('');
  const [customTimePeriod, setCustomTimePeriod] = useState('');
  const [customDuration, setCustomDuration] = useState('');
  
  // Custom input active states
  const [showCustomAmountInput, setShowCustomAmountInput] = useState(false);
  const [showCustomWordCountInput, setShowCustomWordCountInput] = useState(false);
  const [showCustomTimePeriodInput, setShowCustomTimePeriodInput] = useState(false);
  
  // Payment status states
  const [paymentStatus, setPaymentStatus] = useState<'pending' | 'authorized' | 'cancelled' | 'completed'>('pending');
  const [isPaymentProcessing, setIsPaymentProcessing] = useState(false);
  const [isAuthorizing, setIsAuthorizing] = useState(false);
  
  // Stripe-like payment states
  const [showPaymentMethodSelection, setShowPaymentMethodSelection] = useState(false);
  const [showCardForm, setShowCardForm] = useState(false);
  const [showPayPalOption, setShowPayPalOption] = useState(false);
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCVC, setCardCVC] = useState('');
  const [cardholderName, setCardholderName] = useState('');

  // Card validation states
  const [cardNumberValid, setCardNumberValid] = useState(false);
  const [cardExpiryValid, setCardExpiryValid] = useState(false);
  const [cardCVCValid, setCardCVCValid] = useState(false);
  const [cardholderNameValid, setCardholderNameValid] = useState(false);

  // New state for editing topics
  const [editingTopicIndex, setEditingTopicIndex] = useState<number | null>(null);
  const [editingTopicValue, setEditingTopicValue] = useState('');

  // Function to reset payment details
  const resetPaymentDetails = () => {
    setPaymentMethod('');
    setShowCardForm(false);
    setShowPayPalOption(false);
    setPaymentStatus('pending');
    setCardNumber('');
    setCardExpiry('');
    setCardCVC('');
    setCardholderName('');
    setCardNumberValid(false);
    setCardExpiryValid(false);
    setCardCVCValid(false);
    setCardholderNameValid(false);
  };

  // Card formatting helpers
  const formatCardNumber = (value: string) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    const matches = v.match(/\d{4,16}/g);
    const match = matches && matches[0] || '';
    const parts = [];
    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }
    if (parts.length) {
      return parts.join(' ');
    } else {
      return v;
    }
  };

  const formatExpiry = (value: string) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    if (v.length >= 2) {
      return v.substring(0, 2) + '/' + v.substring(2, 4);
    }
    return v;
  };

  // Event type helper functions
  const getEventDisplayText = () => {
    if (!eventParameter || !eventType) return '';
    
    if (eventType === 'length') {
      const wordCount = eventParameter === 'custom' ? customWordCount : eventParameter;
      if (!wordCount) return eventParameter === 'custom' ? 'Custom words' : '';
      
      const timeText = getTimePeriodText();
      return timeText ? `${wordCount} words over ${timeText}` : `${wordCount} words`;
    } else if (eventType === 'time') {
      const duration = eventParameter === 'custom' ? customDuration : eventParameter;
      return duration ? `${duration} min` : 'Custom min';
    }
    return '';
  };

  const getTimePeriodText = () => {
    if (eventTimePeriod === 'custom') {
      return customTimePeriod ? `${customTimePeriod} days` : '';
    }
    return eventTimePeriod ? `${eventTimePeriod} days` : '';
  };

  const shouldShowTimePeriod = () => {
    if (eventType !== 'length') return false;
    return (eventParameter && eventParameter !== 'custom') || 
           (eventParameter === 'custom' && customWordCount);
  };

  const resetEventValues = () => {
    setEventParameter('');
    setCustomWordCount('');
    setCustomTimePeriod('');
    setCustomDuration('');
  };

  // Tiered pricing helper functions
  const calculateServiceFee = (amount: number) => {
    return amount * 0.07; // Flat 7% fee
  };

  const getServiceFeePercentage = (amount: number) => {
    return 7; // Always 7%
  };

  const getTotalAmount = (amount: number) => {
    return amount + calculateServiceFee(amount);
  };
  
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
    const encodedPayment = incentivizeEnabled ? encodeURIComponent(JSON.stringify({
      amount: paymentAmount,
      method: paymentMethod
    })) : '';
    const encodedEvent = encodeURIComponent(JSON.stringify({
      type: eventType,
      parameter: eventParameter,
      customWordCount: eventParameter === 'custom' && eventType === 'length' ? customWordCount : null,
      customTimePeriod: eventTimePeriod === 'custom' ? customTimePeriod : null,
      customDuration: eventParameter === 'custom' && eventType === 'time' ? customDuration : null,
      timePeriod: eventType === 'length' ? eventTimePeriod : null
    }));
    
    const inviteLink = incentivizeEnabled 
      ? `${baseUrl}/invite/${currentUser.username}?name=${encodedName}&topics=${encodedTopics}&verify=${encodedPlatforms}&payment=${encodedPayment}&event=${encodedEvent}`
      : `${baseUrl}/invite/${currentUser.username}?name=${encodedName}&topics=${encodedTopics}&verify=${encodedPlatforms}&event=${encodedEvent}`;
    
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
    
    // If opening preview, scroll to top with smooth animation
    if (!showPreview) {
      setTimeout(() => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }, 100);
    }
  };

  // Check if form is complete for generating invite
  const isFormComplete = recipientName && 
    (topics.length > 0 || currentTopic.trim()) && 
    (incentivizeEnabled ? (
      paymentAmount && 
      paymentMethod && 
      paymentStatus === 'authorized'
    ) : true) &&
    ((eventParameter && eventParameter !== 'custom') || 
     (eventParameter === 'custom' && 
      ((eventType === 'length' && customWordCount) || 
       (eventType === 'time' && customDuration)))) &&
    (eventType !== 'length' || 
     (eventTimePeriod && 
      (eventTimePeriod !== 'custom' || (eventTimePeriod === 'custom' && customTimePeriod))));

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

    if (paymentMethod === 'stripe') {
      // Validate mock form fields
      if (!cardNumberValid || !cardExpiryValid || !cardCVCValid || !cardholderNameValid) {
        toast.error('Please fill in all card details correctly');
        return;
      }

      setIsPaymentProcessing(true);
      
      try {
        // Simulate payment authorization delay
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        setPaymentStatus('authorized');
        setShowPaymentSection(false); // Collapse payment section after successful authorization
        setIsPaymentProcessing(false);
        toast.success('Payment authorized! Amount will be charged after event completion.');
      } catch (err) {
        setPaymentStatus('cancelled');
        toast.error('Payment authorization failed. Please try again.');
      } finally {
        setIsPaymentProcessing(false);
      }
    } else {
      setIsPaymentProcessing(true);
      
      // Simulate other payment processing
      setTimeout(() => {
        setPaymentStatus('authorized');
        setShowPaymentSection(false); // Collapse payment section after successful authorization
        setIsPaymentProcessing(false);
        toast.success('Payment uploaded successfully! Money is now held securely by Arena.');
      }, 2000);
    }
  };

  // Check if event section is complete (for form validation)
  const isEventSectionComplete = eventType && 
    ((eventParameter && eventParameter !== 'custom') || 
     (eventParameter === 'custom' && 
      ((eventType === 'length' && customWordCount) || 
       (eventType === 'time' && customDuration)))) &&
    (eventType !== 'length' || 
     (eventTimePeriod && 
      (eventTimePeriod !== 'custom' || (eventTimePeriod === 'custom' && customTimePeriod))));

  // Auto-collapse event section when user interacts with other sections
  const handleOtherSectionInteraction = () => {
    // Removed auto-collapse - users now have manual control with Done button
  };

  const handleEditTopic = (index: number) => {
    setEditingTopicIndex(index);
    setEditingTopicValue(topics[index]);
  };

  const handleEditTopicChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEditingTopicValue(e.target.value);
  };

  const handleEditTopicSave = (index: number) => {
    const trimmed = editingTopicValue.trim();
    if (trimmed && !topics.includes(trimmed)) {
      const newTopics = [...topics];
      newTopics[index] = trimmed;
      setTopics(newTopics);
    }
    setEditingTopicIndex(null);
    setEditingTopicValue('');
  };

  const handleEditTopicCancel = () => {
    setEditingTopicIndex(null);
    setEditingTopicValue('');
  };

  const handleEditTopicKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, index: number) => {
    if (e.key === 'Enter') {
      handleEditTopicSave(index);
    } else if (e.key === 'Escape') {
      handleEditTopicCancel();
    }
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
                    onFocus={handleOtherSectionInteraction}
                    className="flex-1"
                  />
                </div>

                {/* Topics Input */}
                <div className="space-y-3">
                  <div className="flex items-center space-x-4">
                    <Label className="text-sm font-medium min-w-[120px]">Topics</Label>
                    <div className="flex-1 flex items-center space-x-2">
                      <Input
                        placeholder="Add a topic for discussion"
                        value={currentTopic}
                        onChange={(e) => setCurrentTopic(e.target.value)}
                        onKeyPress={handleKeyPress}
                        onFocus={handleOtherSectionInteraction}
                        className="flex-1"
                      />
                      <Button 
                        size="icon"
                        onClick={() => {
                          handleAddTopic();
                          handleOtherSectionInteraction();
                        }}
                        disabled={!currentTopic.trim()}
                        className="shrink-0"
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  {/* Topics Cards */}
                  {topics.length > 0 && (
                    <div className="ml-[136px]">
                      <div className="flex flex-wrap gap-2">
                        {topics.map((topic, index) => (
                          <div 
                            key={index} 
                            className="group relative bg-background border border-border rounded-lg px-3 py-1 flex items-center max-w-xs overflow-hidden"
                            title={topic}
                          >
                            {editingTopicIndex === index ? (
                              <input
                                type="text"
                                value={editingTopicValue}
                                onChange={handleEditTopicChange}
                                onBlur={() => handleEditTopicSave(index)}
                                onKeyDown={(e) => handleEditTopicKeyDown(e, index)}
                                className="text-sm font-medium text-foreground bg-transparent outline-none border-none w-full px-0 py-0"
                                autoFocus
                              />
                            ) : (
                              <span
                                className="text-sm font-medium text-foreground break-words w-full cursor-pointer"
                                onClick={() => handleEditTopic(index)}
                              >
                                {topic}
                              </span>
                            )}
                            <button
                              onClick={() => handleRemoveTopic(topic)}
                              className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 p-1 hover:bg-muted rounded-md ml-1"
                              title="Remove topic"
                            >
                              <X className="h-3 w-3 text-muted-foreground hover:text-foreground" />
                            </button>
                          </div>
                        ))}
                      </div>
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
                        {isEventSectionComplete ? (
                          <div className="flex items-center gap-2">
                            <p className="text-xs font-medium text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-950/30 px-2 py-1 rounded-md">
                              {getEventDisplayText()}
                            </p>
                          </div>
                        ) : (
                          <p className="text-xs text-muted-foreground">Choose length or time-based</p>
                        )}
                      </div>
                    </div>
                    {showEventSection ? (
                      <ChevronUp className="h-4 w-4 text-muted-foreground" />
                    ) : (
                      <ChevronDown className="h-4 w-4 text-muted-foreground" />
                    )}
                  </button>

                  {showEventSection && (
                    <div className="pl-6 space-y-3 pt-1">
                      {/* Event Type Selection - Radio buttons instead of dropdown */}
                      <div className="space-y-2">
                        <div className="grid grid-cols-2 gap-2">
                          <button
                            onClick={() => {
                              setEventType('length');
                              resetEventValues();
                            }}
                            className={cn(
                              "flex flex-col items-center gap-2 p-3 rounded-lg border transition-all duration-200",
                              eventType === 'length' 
                                ? "border-blue-500 bg-blue-50 dark:bg-blue-950/20" 
                                : "border-border hover:border-border/60 hover:bg-muted/30"
                            )}
                          >
                            <div className="p-1.5 rounded-full bg-blue-100 dark:bg-blue-900/30">
                              <FileText className="h-4 w-4 text-blue-600" />
                            </div>
                            <div className="text-center">
                              <span className="text-sm font-medium">Length-based</span>
                              <p className="text-xs text-muted-foreground">Word count target</p>
                            </div>
                          </button>
                          
                          <button
                            onClick={() => {
                              setEventType('time');
                              resetEventValues();
                            }}
                            className={cn(
                              "flex flex-col items-center gap-2 p-3 rounded-lg border transition-all duration-200",
                              eventType === 'time' 
                                ? "border-orange-500 bg-orange-50 dark:bg-orange-950/20" 
                                : "border-border hover:border-border/60 hover:bg-muted/30"
                            )}
                            disabled
                          >
                            <div className="p-1.5 rounded-full bg-orange-100 dark:bg-orange-900/30">
                              <Clock className="h-4 w-4 text-orange-600" />
                            </div>
                            <div className="text-center">
                              <span className="text-sm font-medium">Time-based</span>
                              <p className="text-xs text-muted-foreground">Coming soon (Live)</p>
                            </div>
                          </button>
                        </div>
                      </div>

                      {/* Length-based Event Configuration */}
                      {eventType === 'length' && (
                        <div className="space-y-3 pl-4 border-l-2 border-blue-200 dark:border-blue-800">
                          <div className="space-y-2">
                            <Label className="text-sm font-medium">Word Count</Label>
                            <div className="grid grid-cols-2 gap-2">
                              {['300', '500', '1000'].map((count) => (
                                <button
                                  key={count}
                                  onClick={() => {
                                    setEventParameter(count);
                                    setShowCustomWordCountInput(false);
                                    setCustomWordCount('');
                                  }}
                                  className={cn(
                                    "p-2 rounded-lg border text-sm transition-all duration-200",
                                    eventParameter === count 
                                      ? "border-blue-500 bg-blue-50 dark:bg-blue-950/20" 
                                      : "border-border hover:border-border/60 hover:bg-muted/30"
                                  )}
                                >
                                  {count} words
                                </button>
                              ))}
                              {showCustomWordCountInput ? (
                                <div className="flex items-center space-x-1 p-2 rounded-lg border border-blue-500 bg-blue-50 dark:bg-blue-950/20">
                                  <input
                                    type="number"
                                    placeholder="Enter word count"
                                    value={customWordCount}
                                    onChange={(e) => {
                                      setCustomWordCount(e.target.value);
                                      setEventParameter('custom');
                                    }}
                                    className="flex-1 bg-transparent text-sm outline-none"
                                    min="1"
                                    max="10000"
                                    autoFocus
                                  />
                                  <button
                                    onClick={() => {
                                      setShowCustomWordCountInput(false);
                                      setCustomWordCount('');
                                      setEventParameter('');
                                    }}
                                    className="text-muted-foreground hover:text-foreground"
                                  >
                                    <X className="h-3 w-3" />
                                  </button>
                                </div>
                              ) : (
                                <button
                                  onClick={() => {
                                    setShowCustomWordCountInput(true);
                                    setEventParameter('custom');
                                  }}
                                  className={cn(
                                    "p-2 rounded-lg border text-sm transition-all duration-200",
                                    eventParameter === 'custom' 
                                      ? "border-blue-500 bg-blue-50 dark:bg-blue-950/20" 
                                      : "border-border hover:border-border/60 hover:bg-muted/30"
                                  )}
                                >
                                  Custom
                                </button>
                              )}
                            </div>
                          </div>

                          {eventParameter === 'custom' && !showCustomWordCountInput && (
                            <div className="space-y-2">
                              <Label className="text-sm font-medium">Custom Word Count</Label>
                              <Input
                                type="number"
                                placeholder="Enter word count"
                                value={customWordCount}
                                onChange={(e) => setCustomWordCount(e.target.value)}
                                className="w-full"
                                min="1"
                                max="10000"
                              />
                            </div>
                          )}

                          {/* Time Period - only show if word count is selected */}
                          {shouldShowTimePeriod() && (
                            <div className="space-y-2">
                              <Label className="text-sm font-medium">Time Period</Label>
                              <div className="grid grid-cols-3 gap-2">
                                {['1', '2', '3', '4', '7'].map((days) => (
                                  <button
                                    key={days}
                                    onClick={() => {
                                      setEventTimePeriod(days);
                                      setShowCustomTimePeriodInput(false);
                                      setCustomTimePeriod('');
                                    }}
                                    className={cn(
                                      "p-1.5 rounded-lg border text-sm transition-all duration-200",
                                      eventTimePeriod === days 
                                        ? "border-blue-500 bg-blue-50 dark:bg-blue-950/20" 
                                        : "border-border hover:border-border/60 hover:bg-muted/30"
                                    )}
                                  >
                                    {days === '1' ? '24 hrs' : `over ${days} days`}
                                  </button>
                                ))}
                                {showCustomTimePeriodInput ? (
                                  <div className="flex items-center space-x-1 p-1.5 rounded-lg border border-blue-500 bg-blue-50 dark:bg-blue-950/20">
                                    <input
                                      type="number"
                                      placeholder="Enter number of days"
                                      value={customTimePeriod}
                                      onChange={(e) => {
                                        setCustomTimePeriod(e.target.value);
                                        setEventTimePeriod('custom');
                                      }}
                                      className="flex-1 bg-transparent text-sm outline-none"
                                      min="1"
                                      max="30"
                                    />
                                    <button
                                      onClick={() => {
                                        setShowCustomTimePeriodInput(false);
                                        setCustomTimePeriod('');
                                        setEventTimePeriod('');
                                      }}
                                      className="text-muted-foreground hover:text-foreground"
                                    >
                                      <X className="h-3 w-3" />
                                    </button>
                                  </div>
                                ) : (
                                  <button
                                    onClick={() => {
                                      setShowCustomTimePeriodInput(true);
                                      setEventTimePeriod('custom');
                                    }}
                                    className={cn(
                                      "p-1.5 rounded-lg border text-sm transition-all duration-200",
                                      eventTimePeriod === 'custom' 
                                        ? "border-blue-500 bg-blue-50 dark:bg-blue-950/20" 
                                        : "border-border hover:border-border/60 hover:bg-muted/30"
                                    )}
                                  >
                                    Custom
                                  </button>
                                )}
                              </div>
                            </div>
                          )}

                          {eventTimePeriod === 'custom' && !showCustomTimePeriodInput && (
                            <div className="space-y-2">
                              <Label className="text-sm font-medium">Custom Time Period (days)</Label>
                              <Input
                                type="number"
                                placeholder="Enter number of days"
                                value={customTimePeriod}
                                onChange={(e) => setCustomTimePeriod(e.target.value)}
                                className="w-full"
                                min="1"
                                max="30"
                              />
                            </div>
                          )}
                        </div>
                      )}

                      {/* Time-based Event Configuration */}
                      {eventType === 'time' && (
                        <div className="space-y-3 pl-4 border-l-2 border-orange-200 dark:border-orange-800">
                          <div className="p-4 bg-orange-50 dark:bg-orange-950/20 rounded-lg border border-orange-200 dark:border-orange-800 text-center">
                            <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900/30 rounded-full flex items-center justify-center mx-auto mb-3">
                              <Clock className="h-6 w-6 text-orange-600" />
                            </div>
                            <h3 className="text-sm font-medium text-orange-800 dark:text-orange-200 mb-1">
                              Live Discussion Coming Soon
                            </h3>
                            <p className="text-xs text-orange-600 dark:text-orange-400">
                              Real-time video discussions will be available soon. For now, please use length-based events.
                            </p>
                            <Button
                              onClick={() => {
                                setEventType('length');
                                resetEventValues();
                              }}
                              variant="outline"
                              size="sm"
                              className="mt-3 border-orange-300 text-orange-700 hover:bg-orange-100"
                            >
                              Switch to Length-based
                            </Button>
                          </div>
                        </div>
                      )}

                      {/* Done Button */}
                      {isEventSectionComplete && (
                        <div className="pt-2">
                          <Button
                            onClick={() => setShowEventSection(false)}
                            className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                            size="sm"
                          >
                            Done
                          </Button>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Payment Section */}
                <div className="space-y-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      if (!incentivizeEnabled) {
                        // If toggle is OFF, turn it ON and expand the section
                        setIncentivizeEnabled(true);
                        setShowPaymentSection(true);
                      } else {
                        // If toggle is ON, just toggle the section visibility
                        setShowPaymentSection(!showPaymentSection);
                      }
                      handleOtherSectionInteraction();
                    }}
                    className="flex items-center justify-between w-full p-3 rounded-lg border border-border hover:bg-muted/30 transition-all duration-200 hover:border-border/60"
                  >
                    <div className="flex items-center gap-3">
                      <div className={cn(
                        "p-1.5 rounded-full transition-all duration-200",
                        incentivizeEnabled 
                          ? "bg-green-100 dark:bg-green-900/20" 
                          : "bg-gray-100 dark:bg-gray-800"
                      )}>
                        <DollarSign className={cn(
                          "h-4 w-4 transition-all duration-200",
                          incentivizeEnabled 
                            ? "text-green-600" 
                            : "text-gray-400"
                        )} />
                      </div>
                      <div className="text-left">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium">Incentivize Recipient</span>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setIncentivizeEnabled(!incentivizeEnabled);
                              if (!incentivizeEnabled) {
                                setShowPaymentSection(false);
                              }
                            }}
                            className={cn(
                              "relative inline-flex h-4 w-7 items-center rounded-full transition-colors focus:outline-none focus:ring-1 focus:ring-primary/50",
                              incentivizeEnabled 
                                ? "bg-primary" 
                                : "bg-gray-300 dark:bg-gray-600"
                            )}
                          >
                            <span
                              className={cn(
                                "inline-block h-3 w-3 transform rounded-full bg-white transition-transform shadow-sm",
                                incentivizeEnabled ? "translate-x-4" : "translate-x-0.5"
                              )}
                            />
                          </button>
                        </div>
                        {incentivizeEnabled && paymentAmount ? (
                          <div className="flex items-center gap-2">
                            <p className="text-xs font-medium text-green-700 dark:text-green-300 bg-green-50 dark:bg-green-950/30 px-2 py-1 rounded-md">
                              ${paymentAmount} offered
                            </p>
                          </div>
                        ) : incentivizeEnabled ? (
                          <p className="text-xs text-muted-foreground">Show appreciation for their time with a secure payment</p>
                        ) : (
                          <p className="text-xs text-muted-foreground">No payment required for this discussion</p>
                        )}
                      </div>
                    </div>
                    {incentivizeEnabled && showPaymentSection ? (
                      <ChevronUp className="h-4 w-4 text-muted-foreground" />
                    ) : incentivizeEnabled ? (
                      <ChevronDown className="h-4 w-4 text-muted-foreground" />
                    ) : (
                      <ChevronDown className="h-4 w-4 text-muted-foreground" />
                    )}
                  </button>

                  {incentivizeEnabled && showPaymentSection && (
                    <div className="pl-6 space-y-4 pt-2">
                      {/* Offer Amount - Show First */}
                      <div className="space-y-1.5">
                        <Label className="text-sm font-medium">Offer Amount</Label>
                        <div className="grid grid-cols-3 gap-2">
                          {['20', '50', '100', '1000', '2000'].map((amount) => (
                            <button
                              key={amount}
                              onClick={() => {
                                setPaymentAmount(amount);
                                setShowCustomAmountInput(false);
                              }}
                              className={cn(
                                "p-2 rounded-lg border text-sm transition-all duration-200",
                                paymentAmount === amount 
                                  ? "border-green-500 bg-green-50 dark:bg-green-950/20" 
                                  : "border-border hover:border-border/60 hover:bg-muted/30"
                              )}
                            >
                              ${amount}
                            </button>
                          ))}
                          {showCustomAmountInput ? (
                            <div className="flex items-center space-x-1 p-2 rounded-lg border border-green-500 bg-green-50 dark:bg-green-950/20">
                              <span className="text-muted-foreground text-sm font-medium">$</span>
                              <input
                                type="number"
                                placeholder="0.00"
                                value={paymentAmount}
                                onChange={(e) => setPaymentAmount(e.target.value)}
                                className="flex-1 bg-transparent text-sm outline-none"
                                min="0"
                                step="0.01"
                                autoFocus
                              />
                              <button
                                onClick={() => {
                                  setShowCustomAmountInput(false);
                                  setPaymentAmount('');
                                }}
                                className="text-muted-foreground hover:text-foreground"
                              >
                                <X className="h-3 w-3" />
                              </button>
                            </div>
                          ) : (
                            <button
                              onClick={() => {
                                setShowCustomAmountInput(true);
                                setPaymentAmount('');
                              }}
                              className={cn(
                                "p-2 rounded-lg border text-sm transition-all duration-200",
                                paymentAmount && !['20', '50', '100', '1000', '2000'].includes(paymentAmount)
                                  ? "border-green-500 bg-green-50 dark:bg-green-950/20" 
                                  : "border-border hover:border-border/60 hover:bg-muted/30"
                              )}
                            >
                              Custom
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Payment Method Selection - Show after amount */}
                      {paymentAmount && parseFloat(paymentAmount) > 0 && (!paymentMethod || paymentStatus !== 'authorized') && (
                        <div className="space-y-3 pl-4 border-l-2 border-green-200 dark:border-green-800">
                          <div className="space-y-2">
                            <Label className="text-sm font-medium">Choose Payment Method</Label>
                            {paymentStatus === 'authorized' && (
                              <p className="text-xs text-orange-600 dark:text-orange-400">
                                Changing payment method will reset your current authorization
                              </p>
                            )}
                          </div>
                          
                          <div className="grid grid-cols-3 gap-3">
                            <button
                              onClick={() => {
                                resetPaymentDetails();
                                setPaymentMethod('stripe');
                                setShowCardForm(true);
                              }}
                              className="flex flex-col items-center gap-3 p-4 rounded-lg border border-border hover:border-primary/50 hover:bg-primary/5 transition-all duration-200 group"
                            >
                              <div className="w-12 h-8 bg-gradient-to-r from-blue-600 to-blue-700 rounded flex items-center justify-center">
                                <CreditCard className="w-6 h-4 text-white" />
                              </div>
                              <div className="text-center">
                                <span className="text-sm font-medium">Card</span>
                                <p className="text-xs text-muted-foreground mt-1">Powered by Stripe</p>
                              </div>
                            </button>
                            
                            <button
                              disabled
                              className="flex flex-col items-center gap-3 p-4 rounded-lg border border-border opacity-60 cursor-not-allowed"
                            >
                              <div className="w-12 h-8 bg-blue-500 rounded flex items-center justify-center">
                                <span className="text-white text-xs font-bold">P</span>
                              </div>
                              <div className="text-center">
                                <span className="text-sm font-medium">PayPal</span>
                                <p className="text-xs text-muted-foreground mt-1">Coming soon</p>
                              </div>
                            </button>

                            <button
                              disabled
                              className="flex flex-col items-center gap-3 p-4 rounded-lg border border-border opacity-60 cursor-not-allowed"
                            >
                              <div className="w-12 h-8 bg-orange-500 rounded flex items-center justify-center">
                                <span className="text-white text-xs font-bold">₿</span>
                              </div>
                              <div className="text-center">
                                <span className="text-sm font-medium">Crypto</span>
                                <p className="text-xs text-muted-foreground mt-1">Coming soon</p>
                              </div>
                            </button>
                          </div>
                        </div>
                      )}

                      {/* Stripe Elements Form - Show when Stripe is selected */}
                      {paymentMethod === 'stripe' && showCardForm && (
                        <div className="space-y-4">
                          {/* Security & Trust Info Section */}
                          <div className="p-4 bg-green-50 dark:bg-green-950/20 rounded-lg border border-green-200 dark:border-green-800/30">
                            <div className="flex items-start gap-3">
                              <div className="p-2 rounded-full bg-green-100 dark:bg-green-900/30">
                                <Shield className="h-5 w-5 text-green-600" />
                              </div>
                              <div className="flex-1 space-y-2">
                                <h4 className="text-sm font-semibold text-green-800 dark:text-green-200">
                                  Payment Protection
                                </h4>
                                <div className="space-y-1 text-xs text-green-700 dark:text-green-300">
                                  <p>• We process your card through Stripe with full encryption—your data is never stored.</p>
                                  <p>• Funds are authorized but only captured once the recipient accepts.</p>
                                  <p>• Your card is charged only after the event is completed.</p>
                                  <p>• If the event doesn't happen, you get a full refund—no questions asked.</p>
                                </div>
                              </div>
                            </div>
                          </div>

                          <div className="space-y-2">
                            <div className="flex items-center justify-between">
                              <Label className="text-sm font-medium">Card Details</Label>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={resetPaymentDetails}
                                className="text-xs text-muted-foreground hover:text-foreground"
                              >
                                ← Back
                              </Button>
                            </div>
                          </div>
                          
                          <div className="space-y-3 p-4 bg-muted/30 rounded-lg border">
                            {/* Mock Stripe Card Element */}
                            <div className="space-y-1">
                              <Label className="text-xs font-medium text-muted-foreground">Card Information</Label>
                              <div className="p-3 border border-input rounded-md bg-background min-h-[40px] flex items-center">
                                <input
                                  type="text"
                                  placeholder="1234 1234 1234 1234"
                                  value={cardNumber}
                                  onChange={(e) => {
                                    const value = e.target.value.replace(/\s/g, '').replace(/[^0-9]/g, '');
                                    const formatted = value.replace(/(\d{4})(?=\d)/g, '$1 ');
                                    setCardNumber(formatted.substring(0, 19));
                                    setCardNumberValid(value.length >= 13 && value.length <= 19);
                                  }}
                                  className="flex-1 bg-transparent text-sm outline-none"
                                  maxLength={19}
                                />
                                <div className="flex items-center space-x-1 ml-2">
                                  <div className="w-6 h-4 bg-gray-200 rounded-sm"></div>
                                  <div className="w-6 h-4 bg-gray-200 rounded-sm"></div>
                                </div>
                              </div>
                            </div>

                            {/* Mock Expiry and CVC */}
                            <div className="grid grid-cols-2 gap-3">
                              <div className="space-y-1">
                                <Label className="text-xs font-medium text-muted-foreground">Expiry Date</Label>
                                <input
                                  type="text"
                                  placeholder="MM/YY"
                                  value={cardExpiry}
                                  onChange={(e) => {
                                    const value = e.target.value.replace(/\s/g, '').replace(/[^0-9]/g, '');
                                    let formatted = value;
                                    if (value.length >= 2) {
                                      formatted = value.substring(0, 2) + '/' + value.substring(2, 4);
                                    }
                                    setCardExpiry(formatted.substring(0, 5));
                                    setCardExpiryValid(value.length === 4);
                                  }}
                                  className="w-full p-3 border border-input rounded-md bg-background text-sm outline-none"
                                  maxLength={5}
                                />
                              </div>
                              <div className="space-y-1">
                                <Label className="text-xs font-medium text-muted-foreground">CVC</Label>
                                <input
                                  type="text"
                                  placeholder="123"
                                  value={cardCVC}
                                  onChange={(e) => {
                                    const value = e.target.value.replace(/\s/g, '').replace(/[^0-9]/g, '');
                                    setCardCVC(value.substring(0, 4));
                                    setCardCVCValid(value.length >= 3);
                                  }}
                                  className="w-full p-3 border border-input rounded-md bg-background text-sm outline-none"
                                  maxLength={4}
                                />
                              </div>
                            </div>

                            {/* Mock Cardholder Name */}
                            <div className="space-y-1">
                              <Label className="text-xs font-medium text-muted-foreground">Cardholder Name</Label>
                              <input
                                type="text"
                                placeholder="Name on card"
                                value={cardholderName}
                                onChange={(e) => {
                                  setCardholderName(e.target.value);
                                  setCardholderNameValid(e.target.value.trim().length > 0);
                                }}
                                className="w-full p-3 border border-input rounded-md bg-background text-sm outline-none"
                              />
                            </div>
                            
                            {/* Security Badge */}
                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                              <Shield className="h-3 w-3" />
                              <span>Your card information is encrypted and secure</span>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* PayPal Option - Show when PayPal is selected */}
                      {paymentMethod === 'paypal' && showPayPalOption && (
                        <div className="space-y-4">
                          <div className="space-y-2">
                            <Label className="text-sm font-medium">PayPal Integration</Label>
                            <p className="text-xs text-muted-foreground">PayPal integration coming soon</p>
                          </div>
                          
                          <div className="p-4 bg-muted/30 rounded-lg border text-center">
                            <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center mx-auto mb-3">
                              <span className="text-white text-lg font-bold">P</span>
                            </div>
                            <p className="text-sm text-muted-foreground">PayPal integration will be available soon</p>
                            <Button 
                              variant="outline" 
                              className="mt-3"
                              onClick={() => {
                                setPaymentMethod('');
                                setShowPayPalOption(false);
                              }}
                            >
                              Choose Different Method
                            </Button>
                          </div>
                        </div>
                      )}

                      {/* Upload Payment Button */}
                      {paymentAmount && parseFloat(paymentAmount) > 0 && paymentMethod && (
                        <Button 
                          className="w-full bg-green-600 hover:bg-green-700 text-white"
                          size="lg"
                          onClick={handlePaymentUpload}
                          disabled={isPaymentProcessing || isAuthorizing || (paymentMethod === 'stripe' && (!cardNumberValid || !cardExpiryValid || !cardCVCValid || !cardholderNameValid))}
                        >
                          {isPaymentProcessing || isAuthorizing ? (
                            <>
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                              {isAuthorizing ? 'Authorizing Payment...' : 'Processing Payment...'}
                            </>
                          ) : (
                            <>
                              <Shield className="h-4 w-4 mr-2" />
                              Offer ${paymentAmount}
                            </>
                          )}
                        </Button>
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
                              onClick={() => {
                                togglePlatform(platform.id);
                                handleOtherSectionInteraction();
                              }}
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
                        Select platforms where you'd like the participant to verify
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Full Screen Preview Overlay */}
          {showPreview && (
            <div className="fixed inset-0 bg-background/95 backdrop-blur-sm z-50 overflow-y-auto">
              <div className="min-h-screen flex flex-col">
                {/* Preview Header */}
                <div className="sticky top-0 bg-background/80 backdrop-blur-md border-b border-border/50 z-10">
                  <div className="max-w-3xl mx-auto px-4 py-6">
                    <div className="text-center">
                      <p className="text-sm font-medium text-muted-foreground">This is how your invitation will appear to the recipient</p>
                    </div>
                  </div>
                </div>

                {/* Preview Content */}
                <div className="flex-1 flex items-center justify-center py-12">
                  <div className="max-w-2xl w-full mx-auto px-4">
                    <Card className="border-primary/20 shadow-2xl relative">
                      {/* Close button positioned on top right of card */}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setShowPreview(false)}
                        className="absolute top-4 right-4 text-muted-foreground hover:text-foreground p-2 h-8 w-8 z-10"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                      <CardContent className="p-8">
                        <div className="space-y-6">
                          <div className="space-y-3">
                            <h2 className="text-lg font-medium text-foreground">Hi {recipientName},</h2>
                            <p className="text-sm text-muted-foreground">You have been invited to text in public with:</p>
                  </div>

                  {/* Profile Card */}
                          <div className="border rounded-xl p-4 bg-gradient-to-br from-muted/30 to-muted/10 shadow-sm">
                            <div className="text-[11px] [&_.h-20]:h-10 [&_.w-20]:w-10 [&_.gap-6]:gap-2 [&_.text-2xl]:text-sm [&_.font-medium]:font-semibold [&_.mb-1]:mb-0.5 [&_.mt-3]:mt-1.5 [&_.text-muted-foreground]:text-[11px] [&_.CardDescription]:text-[11px] [&_.space-y-2]:space-y-0.5 [&_.h-4]:h-3.5 [&_.w-4]:w-3.5 [&_.h-2]:h-1.5 [&_.w-2]:w-1.5 [&_.h-3]:h-2.5 [&_.w-3]:w-2.5 [&_.CardContent]:hidden [&_.space-y-2]:space-y-0.5 [&_.font-medium]:font-semibold [&_.font-semibold]:font-semibold [&_.bg-background]:bg-transparent [&_.ring-1]:ring-0 [&_.border]:border-none [&_.p-0]:p-0 [&_.hover\\:bg-gray-100]:hover:bg-muted/40 [&_.text-black]:text-foreground [&_.bg-background]:bg-transparent [&_.h-4]:h-3.5 [&_.w-4]:w-3.5 [&_.h-3]:h-2.5 [&_.w-3]:w-2.5">
                                <ProfileCard
                                  user={{
                                    name: currentUser?.name || '',
                                    username: currentUser?.username || '',
                                    photoURL: currentUser?.photoURL || undefined,
                                    bio: currentUser?.bio,
                                    socialLinks: {},
                                    verificationStatus: {},
                                  }}
                                  showActions={false}
                                />
                                {/* Social Verification Badges */}
                                <div className="flex flex-wrap gap-2">
                                  {/* LinkedIn */}
                                  <div className="h-6 w-6 rounded-full flex items-center justify-center text-primary bg-primary/10">
                                    <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                                      <path d="M19 0h-14c-2.76 0-5 2.24-5 5v14c0 2.76 2.24 5 5 5h14c2.76 0 5-2.24 5-5v-14c0-2.76-2.24-5-5-5zm-11 19h-3v-9h3v9zm-1.5-10.28c-.97 0-1.75-.79-1.75-1.75s.78-1.75 1.75-1.75 1.75.79 1.75 1.75-.78 1.75-1.75 1.75zm15.5 10.28h-3v-4.5c0-1.08-.02-2.47-1.5-2.47-1.5 0-1.73 1.17-1.73 2.39v4.58h-3v-9h2.89v1.23h.04c.4-.75 1.38-1.54 2.84-1.54 3.04 0 3.6 2 3.6 4.59v4.72z"/>
                                    </svg>
                                  </div>
                                  {/* X/Twitter */}
                                  <div className="h-6 w-6 rounded-full flex items-center justify-center text-primary bg-primary/10">
                                    <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                                      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                                    </svg>
                                  </div>
                                  {/* Instagram */}
                                  <div className="h-6 w-6 rounded-full flex items-center justify-center text-primary bg-primary/10">
                                    <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                                      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 1.366.062 2.633.334 3.608 1.308.974.974 1.246 2.241 1.308 3.608.058 1.266.069 1.646.069 4.85s-.012 3.584-.07 4.85c-.062 1.366-.334 2.633-1.308 3.608-.974.974-2.241 1.246-3.608 1.308-1.266.058-1.646.069-4.85.069s-3.584-.012-4.85-.07c-1.366-.062-2.633-.334-3.608-1.308-.974-.974-1.246-2.241-1.308-3.608C2.175 15.647 2.163 15.267 2.163 12s.012-3.584.07-4.85c.062-1.366.334-2.633 1.308-3.608.974-.974 2.241-1.246 3.608-1.308C8.416 2.175 8.796 2.163 12 2.163zm0-2.163C8.741 0 8.332.013 7.052.072 5.771.131 4.659.414 3.678 1.395c-.98.98-1.263 2.092-1.322 3.373C2.013 5.668 2 6.077 2 12c0 5.923.013 6.332.072 7.612.059 1.281.342 2.393 1.322 3.373.98.98 2.092 1.263 3.373 1.322C8.332 23.987 8.741 24 12 24s3.668-.013 4.948-.072c1.281-.059 2.393-.342 3.373-1.322.98-.98 1.263-2.092 1.322-3.373.059-1.28.072-1.689.072-7.612 0-5.923-.013-6.332-.072-7.612-.059-1.281-.342-2.393-1.322-3.373-.98-.98-2.092-1.263-3.373-1.322C15.668.013 15.259 0 12 0zm0 5.838a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324zm0 10.162a3.999 3.999 0 1 1 0-7.998 3.999 3.999 0 0 1 0 7.998zm6.406-11.845a1.44 1.44 0 1 0 0 2.88 1.44 1.44 0 0 0 0-2.88z"/>
                                    </svg>
                                  </div>
                                </div>
                              </div>
                          </div>

                  {/* Topics Section */}
                          <div className="space-y-3">
                            <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wide">Topics</h3>
                            <div className="space-y-2">
                              {topics.map((topic, index) => (
                                <div key={index} className="flex items-center gap-3 py-2 border-b border-border/30 last:border-b-0">
                                  <div className="w-1.5 h-1.5 bg-muted-foreground/40 rounded-full flex-shrink-0"></div>
                                  <span className="text-sm text-foreground leading-relaxed">{topic}</span>
                                </div>
                              ))}
                            </div>
                          </div>

                          {/* Payment Section */}
                          {paymentAmount && (
                            <div className="space-y-3 p-4 bg-green-50 dark:bg-green-950/20 rounded-lg border border-green-200 dark:border-green-800/30">
                              <h3 className="text-sm font-medium text-green-800 dark:text-green-200 uppercase tracking-wide flex items-center gap-2">
                                <Shield className="h-4 w-4" />
                                Secure Payment Upload
                              </h3>
                              <div className="space-y-3">
                                <div className="flex items-center gap-3">
                                  <div className="p-1.5 rounded-full bg-green-100 dark:bg-green-900/30">
                                    <DollarSign className="h-4 w-4 text-green-600" />
                                  </div>
                                  <div className="flex-1">
                                    <div className="flex items-center gap-2 text-base font-medium text-green-700 dark:text-green-300">
                                      <span>${paymentAmount}</span>
                                      <Badge 
                                        variant="outline" 
                                        className={cn(
                                          "text-xs font-medium",
                                          paymentStatus === 'authorized' 
                                            ? "border-green-300 dark:border-green-700 text-green-700 dark:text-green-300"
                                            : paymentStatus === 'cancelled'
                                            ? "border-red-300 dark:border-red-700 text-red-700 dark:text-red-300"
                                            : "border-orange-300 dark:border-orange-700 text-orange-700 dark:text-orange-300"
                                        )}
                                      >
                                        {paymentStatus === 'pending' && 'Ready to Authorize'}
                                        {paymentStatus === 'authorized' && 'Payment Authorized'}
                                        {paymentStatus === 'cancelled' && 'Payment Cancelled'}
                                        {paymentStatus === 'completed' && 'Payment Completed'}
                                      </Badge>
                                    </div>
                                    <p className="text-sm text-green-600 dark:text-green-400">
                                      {paymentStatus === 'authorized' 
                                        ? 'Payment authorized and held securely until event completion'
                                        : paymentStatus === 'cancelled'
                                        ? 'Payment was cancelled - no charge will be made'
                                        : 'Payment will be authorized and held securely by Stripe'
                                      }
                                    </p>
                                  </div>
                                </div>
                              </div>
                            </div>
                          )}

                          {/* Event Type Section */}
                          {eventParameter && eventType && (
                            <div className="space-y-3 p-4 bg-blue-50 dark:bg-blue-950/20 rounded-lg border border-blue-200 dark:border-blue-800/30">
                              <h3 className="text-sm font-medium text-blue-800 dark:text-blue-200 uppercase tracking-wide">Event Details</h3>
                              <div className="flex items-center gap-3">
                                <div className="p-1.5 rounded-full bg-blue-100 dark:bg-blue-900/30">
                                  {eventType === 'length' ? (
                                    <FileText className="h-4 w-4 text-blue-600" />
                                  ) : (
                                    <Clock className="h-4 w-4 text-orange-600" />
                                  )}
                                </div>
                                <div>
                                  <span className="text-sm font-medium text-blue-700 dark:text-blue-300">
                                    {getEventDisplayText()}
                                  </span>
                                  <p className="text-xs text-blue-600 dark:text-blue-400">
                                    {eventType === 'length' ? 'Length-based discussion' : 'Time-based discussion'}
                                  </p>
                                </div>
                              </div>
                            </div>
                          )}

                  {/* Verification requested */}
                          {selectedPlatforms.length > 0 && (
                            <div className="space-y-3 p-4 bg-muted/30 rounded-lg border">
                              <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wide">Verification Requested</h3>
                    <div className="flex flex-wrap gap-2">
                      {selectedPlatforms.map(platformId => {
                        const platform = platforms.find(p => p.id === platformId);
                        if (!platform) return null;
                        const Icon = platform.icon;
                        return (
                                    <div key={platformId} className="flex items-center gap-2 px-3 py-1.5 bg-background rounded-full border text-sm">
                                      <div className="h-4 w-4 rounded-full flex items-center justify-center text-primary bg-primary/10">
                                        <Icon className="h-2.5 w-2.5" />
                            </div>
                                      <span className="font-medium">{platform.name}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                          )}

                  {/* Action Buttons */}
                          <div className="flex justify-between items-center pt-4 border-t">
                    <Button 
                      variant="outline"
                              size="sm"
                              className="w-28 h-9 text-sm font-medium"
                      disabled
                    >
                      Accept
                    </Button>
                    <Button 
                      variant="outline" 
                              size="sm"
                              className="w-28 h-9 text-sm font-medium"
                      disabled
                    >
                      Edit Topics
                    </Button>
                    <Button 
                      variant="outline" 
                              size="sm"
                              className="w-28 h-9 text-sm font-medium"
                      disabled
                    >
                      Decline
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex justify-center gap-4 mt-8">
            <Button 
              onClick={handlePreview}
              disabled={!recipientName || (topics.length === 0 && !currentTopic.trim())}
              className={cn(
                "h-11 px-6 font-medium transition-all duration-200",
                showPreview 
                  ? "bg-muted/50 text-muted-foreground hover:bg-muted border border-border" 
                  : "bg-primary text-primary-foreground hover:bg-primary/90"
              )}
            >
              {showPreview ? "Hide Preview" : "Preview"}
            </Button>
            <Button 
              onClick={generateInviteLink}
              disabled={!isFormComplete}
              variant="outline"
              className={cn(
                "h-11 px-6 font-medium border-2 transition-all duration-200",
                isFormComplete
                  ? "border-primary text-primary hover:bg-primary/5"
                  : "border-border text-muted-foreground"
              )}
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
