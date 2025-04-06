import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Search, Filter, CheckCircle } from 'lucide-react';
import TransitionWrapper from '@/components/TransitionWrapper';
import Navbar from '@/components/Navbar';
import TopicBrowser from '@/components/TopicBrowser';
import { Card, CardContent } from '@/components/ui/card';
import { Linkedin, Facebook, Instagram, Youtube } from 'lucide-react';

// Mock topics data
const MOCK_TOPICS = [
  {
    id: '1',
    title: 'The Ethics of Artificial Intelligence',
    description: 'Discuss the ethical implications of AI development, including bias, job displacement, privacy, and existential risks.',
    category: 'Technology',
    debateCount: 12,
  },
  {
    id: '2',
    title: 'Universal Basic Income',
    description: 'Is UBI a viable solution to economic inequality and technological unemployment? Discuss the pros and cons.',
    category: 'Economics',
    debateCount: 8,
  },
  {
    id: '3',
    title: 'Climate Change Solutions',
    description: 'Debate the most effective approaches to addressing climate change, including policy, technology, and lifestyle changes.',
    category: 'Environment',
    debateCount: 15,
  },
  {
    id: '4',
    title: 'Social Media and Democracy',
    description: 'How is social media impacting democratic processes, polarization, and public discourse?',
    category: 'Politics',
    debateCount: 7,
  },
  {
    id: '5',
    title: 'Future of Education',
    description: 'Discuss how education should evolve to meet the needs of the 21st century.',
    category: 'Education',
    debateCount: 5,
  },
  {
    id: '6',
    title: 'Privacy in the Digital Age',
    description: 'Debate the balance between privacy, security, and convenience in our increasingly connected world.',
    category: 'Technology',
    debateCount: 9,
  },
];

// Categories for filtering
const CATEGORIES = [
  'All',
  'Technology',
  'Economics',
  'Environment',
  'Politics',
  'Education',
  'Health',
  'Work',
];

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

const Topics: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [topics, setTopics] = useState(MOCK_TOPICS);
  const [filteredTopics, setFilteredTopics] = useState(MOCK_TOPICS);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [isLoading, setIsLoading] = useState(true);
  const [selectedTopic, setSelectedTopic] = useState<typeof MOCK_TOPICS[0] | null>(null);
  const [showDialog, setShowDialog] = useState(false);
  const [showWelcomeMessage, setShowWelcomeMessage] = useState(false);
  
  // Check if user came from an invitation
  const invitationData = location.state || {};
  const { invitedBy, topics: invitationTopics, verificationPlatforms, isInvitation } = invitationData;
  
  // Define platforms with their icons
  const platforms = [
    { id: 'linkedin', name: 'LinkedIn', icon: Linkedin },
    { id: 'twitter', name: 'X', icon: XIcon },
    { id: 'facebook', name: 'Facebook', icon: Facebook },
    { id: 'instagram', name: 'Instagram', icon: Instagram },
    { id: 'youtube', name: 'YouTube', icon: Youtube },
    { id: 'tiktok', name: 'TikTok', icon: TikTokIcon }
  ];

  // Simulate data fetching
  useEffect(() => {
    const fetchTopics = async () => {
      setIsLoading(true);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setTopics(MOCK_TOPICS);
      setFilteredTopics(MOCK_TOPICS);
      setIsLoading(false);
    };
    
    // Show welcome message if user came from an invitation
    if (isInvitation) {
      setShowWelcomeMessage(true);
    }
    
    fetchTopics();
  }, []);
  
  // Filter topics based on search and category
  useEffect(() => {
    let results = topics;
    
    // Apply search filter
    if (searchTerm) {
      results = results.filter(topic => 
        topic.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        topic.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    // Apply category filter
    if (selectedCategory !== 'All') {
      results = results.filter(topic => topic.category === selectedCategory);
    }
    
    setFilteredTopics(results);
  }, [searchTerm, selectedCategory, topics]);
  
  // Handle search input change
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };
  
  // Handle category selection
  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category);
  };

  // Handle topic selection
  const handleSelectTopic = (topic: typeof MOCK_TOPICS[0]) => {
    setSelectedTopic(topic);
    setShowDialog(true);
  };

  // Handle starting a debate
  const handleStartDebate = () => {
    if (selectedTopic) {
      toast.success(`Debate created on "${selectedTopic.title}"`);
      setShowDialog(false);
      // In a real app, we would create the debate and then navigate to it
      navigate(`/debates/1`);
    }
  };

  const popularTopics = MOCK_TOPICS.slice(0, 3);
  const newTopics = [...MOCK_TOPICS].sort(() => Math.random() - 0.5).slice(0, 3);

  return (
    <>
      <Navbar />
      <TransitionWrapper animation="fade" className="min-h-screen pt-24 pb-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <TransitionWrapper animation="slide-down" className="mb-8">
            <h1 className="text-3xl font-medium">Browse Topics</h1>
            <p className="text-muted-foreground mt-2">
              Explore interesting topics or start a debate on something you care about
            </p>
          </TransitionWrapper>
          
          {/* Welcome Message for Invited Users */}
          {showWelcomeMessage && (
            <Card className="mb-6 border-primary/20">
              <CardContent className="pt-6">
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-5 w-5 text-primary" />
                    <h2 className="text-xl font-medium">Welcome to Arena!</h2>
                  </div>
                  
                  <p className="text-muted-foreground">
                    You've been invited by <span className="font-medium text-foreground">@{invitedBy}</span> to join Arena.
                  </p>
                  
                  <div className="pt-2">
                    <Button onClick={() => setShowWelcomeMessage(false)}>
                      Got it
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
          
          <Tabs defaultValue="browse" className="mb-8">
            <TabsList className="mb-6">
              <TabsTrigger value="browse">Browse All</TabsTrigger>
              <TabsTrigger value="popular">Popular</TabsTrigger>
              <TabsTrigger value="new">New</TabsTrigger>
            </TabsList>
            
            <TabsContent value="browse">
              {/* Filters section */}
              <div className="mb-8 space-y-4">
                {/* Search */}
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    placeholder="Search topics..."
                    className="pl-10 input-effect"
                    value={searchTerm}
                    onChange={handleSearchChange}
                  />
                </div>
                
                {/* Category filters */}
                <div className="flex flex-wrap gap-2 items-center">
                  <div className="flex items-center mr-2">
                    <Filter className="h-4 w-4 mr-1" />
                    <span className="text-sm font-medium">Categories:</span>
                  </div>
                  
                  {CATEGORIES.map(category => (
                    <Badge 
                      key={category} 
                      variant={selectedCategory === category ? "default" : "outline"}
                      className="cursor-pointer"
                      onClick={() => handleCategoryChange(category)}
                    >
                      {category}
                    </Badge>
                  ))}
                </div>
              </div>
              
              {/* Topics grid */}
              {isLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {[1, 2, 3, 4, 5, 6].map((_, index) => (
                    <div 
                      key={index} 
                      className="h-48 rounded-lg bg-muted animate-pulse"
                    />
                  ))}
                </div>
              ) : filteredTopics.length > 0 ? (
                <TopicBrowser 
                  topics={filteredTopics}
                  onSelectTopic={handleSelectTopic}
                />
              ) : (
                <div className="text-center py-12">
                  <h3 className="text-lg font-medium mb-2">No topics found</h3>
                  <p className="text-muted-foreground">
                    Try adjusting your filters or search terms
                  </p>
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="popular">
              <TopicBrowser 
                topics={popularTopics}
                onSelectTopic={handleSelectTopic}
              />
            </TabsContent>
            
            <TabsContent value="new">
              <TopicBrowser 
                topics={newTopics}
                onSelectTopic={handleSelectTopic}
              />
            </TabsContent>
          </Tabs>
        </div>
      </TransitionWrapper>
      
      {/* Confirmation dialog */}
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Start a New Debate</DialogTitle>
            <DialogDescription>
              You're about to create a debate on this topic. Other users will be able to join and participate.
            </DialogDescription>
          </DialogHeader>
          
          {selectedTopic && (
            <div className="py-4">
              <h3 className="font-medium">{selectedTopic.title}</h3>
              <p className="text-sm text-muted-foreground mt-1">{selectedTopic.description}</p>
            </div>
          )}
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleStartDebate}>
              Start Debate
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default Topics;
