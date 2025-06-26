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
import { loadStripe } from '@stripe/stripe-js';

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
  
  // Custom value states
  const [customWordCount, setCustomWordCount] = useState('');
  const [customTimePeriod, setCustomTimePeriod] = useState('');
  const [customDuration, setCustomDuration] = useState('');
  
  // Payment status states
  const [paymentStatus, setPaymentStatus] = useState<'pending' | 'authorized' | 'cancelled' | 'completed'>('pending');
  const [isPaymentProcessing, setIsPaymentProcessing] = useState(false);
  
  // Stripe Elements states
  const [stripe, setStripe] = useState<any>(null);
  const [elements, setElements] = useState<any>(null);
  const [cardElement, setCardElement] = useState<any>(null);
  const [showStripeForm, setShowStripeForm] = useState(false);
  const [paymentIntentId, setPaymentIntentId] = useState('');
  const [isAuthorizing, setIsAuthorizing] = useState(false);
  const [cardComplete, setCardComplete] = useState(false);
  const [cardError, setCardError] = useState<string>('');
  
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
      parameter: eventParameter,
      customWordCount: eventParameter === 'custom' && eventType === 'length' ? customWordCount : null,
      customTimePeriod: eventTimePeriod === 'custom' ? customTimePeriod : null,
      customDuration: eventParameter === 'custom' && eventType === 'time' ? customDuration : null,
      timePeriod: eventType === 'length' ? eventTimePeriod : null
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
    ((eventParameter && eventParameter !== 'custom') || 
     (eventParameter === 'custom' && 
      ((eventType === 'length' && customWordCount) || 
       (eventType === 'time' && customDuration)))) &&
    (eventType !== 'length' || 
     (eventTimePeriod && 
      (eventTimePeriod !== 'custom' || (eventTimePeriod === 'custom' && customTimePeriod)))) &&
    paymentStatus === 'authorized';

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
      if (!stripe || !cardElement) {
        toast.error('Payment system not ready. Please try again.');
        return;
      }

      setIsAuthorizing(true);
      
      try {
        // Simulate creating a payment intent (in real implementation, this would be done on your backend)
        const paymentIntent = {
          client_secret: 'pi_test_secret_' + Math.random().toString(36).substr(2, 9)
        };
        
        // Confirm the card payment
        const { error, paymentIntent: confirmedIntent } = await stripe.confirmCardPayment(
          paymentIntent.client_secret,
          {
            payment_method: {
              card: cardElement,
              billing_details: {
                name: 'Test User', // In real app, get from form
              },
            },
          }
        );

        if (error) {
          setPaymentStatus('cancelled');
          setCardError(error.message || 'Payment failed');
          toast.error('Payment authorization failed: ' + error.message);
        } else {
          setPaymentStatus('authorized');
          setPaymentIntentId(confirmedIntent?.id || '');
          setCardError('');
          toast.success('Payment authorized! Amount will be charged after event completion.');
        }
      } catch (err) {
        setPaymentStatus('cancelled');
        setCardError('Payment authorization failed');
        toast.error('Payment authorization failed. Please try again.');
      } finally {
        setIsAuthorizing(false);
      }
    } else {
      setIsPaymentProcessing(true);
      
      // Simulate other payment processing
      setTimeout(() => {
        setPaymentStatus('authorized');
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
    if (showEventSection && isEventSectionComplete) {
      setShowEventSection(false);
    }
  };

  // Auto-collapse event section when complete
  useEffect(() => {
    if (isEventSectionComplete && showEventSection) {
      // Add a small delay to allow the user to see the completion
      const timer = setTimeout(() => {
        setShowEventSection(false);
      }, 1000); // 1 second delay
      
      return () => clearTimeout(timer);
    }
  }, [isEventSectionComplete]); // Only trigger when completion status changes

  // Initialize Stripe
  useEffect(() => {
    const initializeStripe = async () => {
      // For now, using a placeholder key - replace with your actual publishable key
      const stripeInstance = await loadStripe('pk_test_placeholder_key');
      setStripe(stripeInstance);
    };
    
    initializeStripe();
  }, []);

  // Mount Stripe Elements when form is shown
  useEffect(() => {
    if (stripe && showStripeForm && !elements) {
      const elementsInstance = stripe.elements();
      setElements(elementsInstance);
      
      const cardElementInstance = elementsInstance.create('card', {
        style: {
          base: {
            fontSize: '14px',
            color: 'var(--foreground)',
            '::placeholder': {
              color: 'var(--muted-foreground)',
            },
            backgroundColor: 'transparent',
          },
        },
      });
      
      setCardElement(cardElementInstance);
      cardElementInstance.mount('#card-element');
      
      // Add validation listeners
      cardElementInstance.on('change', (event: any) => {
        setCardComplete(event.complete);
        setCardError(event.error ? event.error.message : '');
      });
    }

    // Cleanup when form is closed
    return () => {
      if (cardElement && !showStripeForm) {
        cardElement.destroy();
        setCardElement(null);
        setElements(null);
        setCardComplete(false);
        setCardError('');
      }
    };
  }, [stripe, showStripeForm, elements, cardElement]);

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
                <div className="space-y-2">
                  <div className="flex items-center space-x-4">
                    <Label className="text-sm font-medium min-w-[120px]">Discussion Topics</Label>
                    <div className="flex space-x-2 flex-1">
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
                      {eventParameter && eventType && (
                        <Badge variant="secondary" className="text-xs">
                          {getEventDisplayText()}
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
                      {/* Event Type Selection - Radio buttons instead of dropdown */}
                      <div className="space-y-3">
                        <Label className="text-sm font-medium">Event Type</Label>
                        <div className="grid grid-cols-2 gap-3">
                          <button
                            onClick={() => {
                              setEventType('length');
                              resetEventValues();
                            }}
                            className={cn(
                              "flex flex-col items-center gap-3 p-4 rounded-lg border transition-all duration-200",
                              eventType === 'length' 
                                ? "border-blue-500 bg-blue-50 dark:bg-blue-950/20" 
                                : "border-border hover:border-border/60 hover:bg-muted/30"
                            )}
                          >
                            <div className="p-2 rounded-full bg-blue-100 dark:bg-blue-900/30">
                              <FileText className="h-5 w-5 text-blue-600" />
                            </div>
                            <div className="text-center">
                              <span className="text-sm font-medium">Length-based</span>
                              <p className="text-xs text-muted-foreground mt-1">Word count target</p>
                            </div>
                          </button>
                          
                          <button
                            onClick={() => {
                              setEventType('time');
                              resetEventValues();
                            }}
                            className={cn(
                              "flex flex-col items-center gap-3 p-4 rounded-lg border transition-all duration-200",
                              eventType === 'time' 
                                ? "border-orange-500 bg-orange-50 dark:bg-orange-950/20" 
                                : "border-border hover:border-border/60 hover:bg-muted/30"
                            )}
                          >
                            <div className="p-2 rounded-full bg-orange-100 dark:bg-orange-900/30">
                              <Clock className="h-5 w-5 text-orange-600" />
                            </div>
                            <div className="text-center">
                              <span className="text-sm font-medium">Time-based</span>
                              <p className="text-xs text-muted-foreground mt-1">Live discussion</p>
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
                                  onClick={() => setEventParameter(count)}
                                  className={cn(
                                    "p-3 rounded-lg border text-sm transition-all duration-200",
                                    eventParameter === count 
                                      ? "border-blue-500 bg-blue-50 dark:bg-blue-950/20" 
                                      : "border-border hover:border-border/60 hover:bg-muted/30"
                                  )}
                                >
                                  {count} words
                                </button>
                              ))}
                              <button
                                onClick={() => setEventParameter('custom')}
                                className={cn(
                                  "p-3 rounded-lg border text-sm transition-all duration-200",
                                  eventParameter === 'custom' 
                                    ? "border-blue-500 bg-blue-50 dark:bg-blue-950/20" 
                                    : "border-border hover:border-border/60 hover:bg-muted/30"
                                )}
                              >
                                Custom
                              </button>
                            </div>
                          </div>

                          {eventParameter === 'custom' && (
                            <div className="space-y-2">
                              <Label className="text-sm font-medium">Custom Word Count</Label>
                              <Input
                                type="number"
                                placeholder="Enter word count"
                                value={customWordCount}
                                onChange={(e) => setCustomWordCount(e.target.value)}
                                className="w-full"
                                min="1"
                              />
                            </div>
                          )}

                          {/* Time Period - only show if word count is selected */}
                          {shouldShowTimePeriod() && (
                            <div className="space-y-2">
                              <Label className="text-sm font-medium">Time Period</Label>
                              <div className="grid grid-cols-3 gap-2">
                                {['1', '2', '3', '4', '7', '14'].map((days) => (
                                  <button
                                    key={days}
                                    onClick={() => setEventTimePeriod(days)}
                                    className={cn(
                                      "p-2 rounded-lg border text-sm transition-all duration-200",
                                      eventTimePeriod === days 
                                        ? "border-blue-500 bg-blue-50 dark:bg-blue-950/20" 
                                        : "border-border hover:border-border/60 hover:bg-muted/30"
                                    )}
                                  >
                                    {days} {parseInt(days) === 1 ? 'day' : 'days'}
                                  </button>
                                ))}
                                <button
                                  onClick={() => setEventTimePeriod('custom')}
                                  className={cn(
                                    "p-2 rounded-lg border text-sm transition-all duration-200",
                                    eventTimePeriod === 'custom' 
                                      ? "border-blue-500 bg-blue-50 dark:bg-blue-950/20" 
                                      : "border-border hover:border-border/60 hover:bg-muted/30"
                                  )}
                                >
                                  Custom
                                </button>
                              </div>
                            </div>
                          )}

                          {eventTimePeriod === 'custom' && (
                            <div className="space-y-2">
                              <Label className="text-sm font-medium">Custom Time Period (days)</Label>
                              <Input
                                type="number"
                                placeholder="Enter number of days"
                                value={customTimePeriod}
                                onChange={(e) => setCustomTimePeriod(e.target.value)}
                                className="w-full"
                                min="1"
                              />
                            </div>
                          )}
                        </div>
                      )}

                      {/* Time-based Event Configuration */}
                      {eventType === 'time' && (
                        <div className="space-y-3 pl-4 border-l-2 border-orange-200 dark:border-orange-800">
                          <div className="space-y-2">
                            <Label className="text-sm font-medium">Duration</Label>
                            <div className="grid grid-cols-2 gap-2">
                              {['15', '30', '45', '60'].map((minutes) => (
                                <button
                                  key={minutes}
                                  onClick={() => setEventParameter(minutes)}
                                  className={cn(
                                    "p-3 rounded-lg border text-sm transition-all duration-200",
                                    eventParameter === minutes 
                                      ? "border-orange-500 bg-orange-50 dark:bg-orange-950/20" 
                                      : "border-border hover:border-border/60 hover:bg-muted/30"
                                  )}
                                >
                                  {minutes} minutes
                                </button>
                              ))}
                              <button
                                onClick={() => setEventParameter('custom')}
                                className={cn(
                                  "p-3 rounded-lg border text-sm transition-all duration-200",
                                  eventParameter === 'custom' 
                                    ? "border-orange-500 bg-orange-50 dark:bg-orange-950/20" 
                                    : "border-border hover:border-border/60 hover:bg-muted/30"
                                )}
                              >
                                Custom
                              </button>
                            </div>
                          </div>

                          {eventParameter === 'custom' && (
                            <div className="space-y-2">
                              <Label className="text-sm font-medium">Custom Duration (minutes)</Label>
                              <Input
                                type="number"
                                placeholder="Enter duration in minutes"
                                value={customDuration}
                                onChange={(e) => setCustomDuration(e.target.value)}
                                className="w-full"
                                min="1"
                              />
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Payment Section */}
                <div className="space-y-2">
                  <button
                    onClick={() => {
                      setShowPaymentSection(!showPaymentSection);
                      handleOtherSectionInteraction();
                    }}
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
                      {/* Payment Method Selection - Show First */}
                      {!paymentMethod && (
                        <div className="space-y-3">
                          <div className="space-y-2">
                            <Label className="text-sm font-medium">Choose Payment Method</Label>
                            <p className="text-xs text-muted-foreground">Select how you'd like to make your payment</p>
                          </div>
                          
                          <div className="grid grid-cols-2 gap-3">
                            <button
                              onClick={() => {
                                setPaymentMethod('stripe');
                                setShowStripeForm(true);
                              }}
                              className="flex flex-col items-center gap-3 p-4 rounded-lg border border-border hover:border-primary/50 hover:bg-primary/5 transition-all duration-200 group"
                            >
                              <div className="w-12 h-8 bg-gradient-to-r from-blue-600 to-blue-700 rounded flex items-center justify-center">
                                <CreditCard className="w-6 h-4 text-white" />
                              </div>
                              <div className="text-center">
                                <span className="text-sm font-medium">Credit Card</span>
                                <p className="text-xs text-muted-foreground mt-1">Powered by Stripe</p>
                              </div>
                            </button>
                            
                            <button
                              onClick={() => {
                                setPaymentMethod('paypal');
                                setShowPayPalOption(true);
                              }}
                              className="flex flex-col items-center gap-3 p-4 rounded-lg border border-border hover:border-primary/50 hover:bg-primary/5 transition-all duration-200 group"
                            >
                              <div className="w-12 h-8 bg-blue-500 rounded flex items-center justify-center">
                                <span className="text-white text-xs font-bold">P</span>
                              </div>
                              <div className="text-center">
                                <span className="text-sm font-medium">PayPal</span>
                                <p className="text-xs text-muted-foreground mt-1">Coming soon</p>
                              </div>
                            </button>
                          </div>
                        </div>
                      )}

                      {/* Stripe Elements Form - Show when Stripe is selected */}
                      {paymentMethod === 'stripe' && showStripeForm && (
                        <div className="space-y-4">
                          <div className="space-y-2">
                            <div className="flex items-center justify-between">
                              <Label className="text-sm font-medium">Card Details</Label>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                  setPaymentMethod('');
                                  setShowStripeForm(false);
                                  setPaymentStatus('pending');
                                  setPaymentIntentId('');
                                }}
                                className="text-xs text-muted-foreground hover:text-foreground"
                              >
                                ← Back
                              </Button>
                            </div>
                            <p className="text-xs text-muted-foreground">
                              Payment will be authorized now and charged after event completion
                            </p>
                          </div>
                          
                          <div className="space-y-3 p-4 bg-muted/30 rounded-lg border">
                            {/* Stripe Card Element will be mounted here */}
                            <div className="space-y-1">
                              <Label className="text-xs font-medium text-muted-foreground">Card Information</Label>
                              <div 
                                id="card-element"
                                className="p-3 border border-input rounded-md bg-background min-h-[40px] flex items-center"
                              >
                                {!cardElement && (
                                  <div className="text-sm text-muted-foreground">
                                    Loading secure payment form...
                                  </div>
                                )}
                              </div>
                              {cardElement && (
                                <p className="text-xs text-muted-foreground mt-1">
                                  Enter your card details securely. Payment will be authorized now and charged after event completion.
                                </p>
                              )}
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

                      {/* Offer Amount - Show after payment method is selected */}
                      {paymentMethod && (
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
                      )}

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

                      {/* Security & Trust Indicators */}
                      <div className="space-y-2 p-3 bg-green-50 dark:bg-green-950/20 rounded-lg border border-green-200 dark:border-green-800/30">
                        <h4 className="text-sm font-medium text-green-800 dark:text-green-200 flex items-center gap-2">
                          <Shield className="h-4 w-4" />
                          Secure Payment Protection
                        </h4>
                        <div className="space-y-1 text-xs text-green-700 dark:text-green-300">
                          <div className="flex items-center gap-2">
                            <Check className="h-3 w-3" />
                            <span>Payment authorized now, charged after event completion</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Check className="h-3 w-3" />
                            <span>No charge if event doesn't happen</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Check className="h-3 w-3" />
                            <span>Automatic payment processing when event completes</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Check className="h-3 w-3" />
                            <span>Bank-level security by Stripe</span>
                          </div>
                        </div>
                      </div>

                      {/* Upload Payment Button */}
                      {paymentAmount && parseFloat(paymentAmount) > 0 && paymentMethod && paymentStatus === 'pending' && (
                        <Button 
                          className="w-full bg-green-600 hover:bg-green-700 text-white"
                          size="lg"
                          onClick={handlePaymentUpload}
                          disabled={isPaymentProcessing || isAuthorizing || (paymentMethod === 'stripe' && !cardComplete)}
                        >
                          {isPaymentProcessing || isAuthorizing ? (
                            <>
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                              {isAuthorizing ? 'Authorizing Payment...' : 'Processing Payment...'}
                            </>
                          ) : (
                            <>
                              <Shield className="h-4 w-4 mr-2" />
                              Authorize ${(parseFloat(paymentAmount) * 1.1).toFixed(2)} Payment
                            </>
                          )}
                        </Button>
                      )}

                      {/* Card Error Display */}
                      {cardError && (
                        <div className="p-2 bg-red-50 dark:bg-red-950/20 rounded-lg border border-red-200 dark:border-red-800/30">
                          <p className="text-xs text-red-600 dark:text-red-400">{cardError}</p>
                        </div>
                      )}

                      {/* Payment Success Message */}
                      {paymentStatus === 'authorized' && (
                        <div className="p-3 bg-green-50 dark:bg-green-950/20 rounded-lg border border-green-200 dark:border-green-800/30">
                          <div className="flex items-center gap-2 text-green-700 dark:text-green-300">
                            <Check className="h-4 w-4" />
                            <span className="text-sm font-medium">Payment Authorized Successfully!</span>
                          </div>
                          <p className="text-xs text-green-600 dark:text-green-400 mt-1">
                            Your payment is now held securely by Stripe and will be charged after event completion.
                          </p>
                        </div>
                      )}

                      {/* Payment Cancelled Message */}
                      {paymentStatus === 'cancelled' && (
                        <div className="p-3 bg-red-50 dark:bg-red-950/20 rounded-lg border border-red-200 dark:border-red-800/30">
                          <div className="flex items-center gap-2 text-red-700 dark:text-red-300">
                            <X className="h-4 w-4" />
                            <span className="text-sm font-medium">Payment Cancelled</span>
                          </div>
                          <p className="text-xs text-red-600 dark:text-red-400 mt-1">
                            No charge will be made. You can try again or choose a different payment method.
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
                  {eventParameter && eventType && (
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
                            {getEventDisplayText()}
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
