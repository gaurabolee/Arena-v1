
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import TransitionWrapper from '@/components/TransitionWrapper';
import DebateCard, { DebateCardProps } from '@/components/DebateCard';
import Navbar from '@/components/Navbar';
import { Search, Filter } from 'lucide-react';

// Placeholder debate data
const MOCK_DEBATES: DebateCardProps[] = [
  {
    id: '1',
    title: 'Is AI a threat to humanity?',
    description: 'Discussing the potential risks and benefits of artificial intelligence advances.',
    participants: 24,
    messages: 158,
    status: 'active',
    category: 'Technology',
  },
  {
    id: '2',
    title: 'Should cryptocurrency be regulated?',
    description: 'Exploring the pros and cons of government regulation in the cryptocurrency market.',
    participants: 18,
    messages: 97,
    status: 'active',
    category: 'Finance',
  },
  {
    id: '3',
    title: 'Universal Basic Income: Solution or Problem?',
    description: 'Debating if UBI is a viable solution to economic inequality or if it creates new problems.',
    participants: 30,
    messages: 210,
    status: 'active',
    category: 'Economics',
  },
  {
    id: '4',
    title: 'Climate Change Solutions',
    description: 'Discussing the most effective approaches to addressing climate change.',
    participants: 42,
    messages: 315,
    status: 'active',
    category: 'Environment',
  },
  {
    id: '5',
    title: 'Future of Remote Work',
    description: 'Exploring how remote work will shape the future of employment and society.',
    participants: 15,
    messages: 78,
    status: 'scheduled',
    category: 'Work',
  },
  {
    id: '6',
    title: 'Social Media and Democracy',
    description: 'Examining the impact of social media on democratic processes and institutions.',
    participants: 36,
    messages: 242,
    status: 'completed',
    category: 'Politics',
  },
];

// Categories for filtering
const CATEGORIES = [
  'All',
  'Technology',
  'Finance',
  'Economics',
  'Environment',
  'Politics',
  'Education',
  'Health',
  'Work',
];

const Debates: React.FC = () => {
  const [debates, setDebates] = useState<DebateCardProps[]>([]);
  const [filteredDebates, setFilteredDebates] = useState<DebateCardProps[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'scheduled' | 'completed'>('all');
  const [isLoading, setIsLoading] = useState(true);

  // Simulate data fetching
  useEffect(() => {
    const fetchDebates = async () => {
      setIsLoading(true);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setDebates(MOCK_DEBATES);
      setFilteredDebates(MOCK_DEBATES);
      setIsLoading(false);
    };
    
    fetchDebates();
  }, []);
  
  // Filter debates based on search, category, and status
  useEffect(() => {
    let results = debates;
    
    // Apply search filter
    if (searchTerm) {
      results = results.filter(debate => 
        debate.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        debate.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    // Apply category filter
    if (selectedCategory !== 'All') {
      results = results.filter(debate => debate.category === selectedCategory);
    }
    
    // Apply status filter
    if (statusFilter !== 'all') {
      results = results.filter(debate => debate.status === statusFilter);
    }
    
    setFilteredDebates(results);
  }, [searchTerm, selectedCategory, statusFilter, debates]);
  
  // Handle search input change
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };
  
  // Handle category selection
  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category);
  };
  
  // Handle status filter change
  const handleStatusChange = (status: 'all' | 'active' | 'scheduled' | 'completed') => {
    setStatusFilter(status);
  };

  return (
    <>
      <Navbar />
      <TransitionWrapper animation="fade" className="min-h-screen pt-24 pb-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <TransitionWrapper animation="slide-down" className="mb-8">
            <h1 className="text-3xl font-medium">Explore Debates</h1>
            <p className="text-muted-foreground mt-2">
              Join ongoing debates or browse past discussions
            </p>
          </TransitionWrapper>
          
          {/* Filters section */}
          <div className="mb-8 space-y-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search debates..."
                className="pl-10 input-effect"
                value={searchTerm}
                onChange={handleSearchChange}
              />
            </div>
            
            {/* Category filters */}
            <div className="flex flex-wrap gap-2 items-center">
              <div className="flex items-center mr-2">
                <Filter className="h-4 w-4 mr-1" />
                <span className="text-sm font-medium">Filters:</span>
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
            
            {/* Status filters */}
            <div className="flex space-x-2">
              <Button 
                variant={statusFilter === 'all' ? "default" : "outline"} 
                size="sm"
                onClick={() => handleStatusChange('all')}
              >
                All
              </Button>
              <Button 
                variant={statusFilter === 'active' ? "default" : "outline"} 
                size="sm"
                onClick={() => handleStatusChange('active')}
              >
                Active
              </Button>
              <Button 
                variant={statusFilter === 'scheduled' ? "default" : "outline"} 
                size="sm"
                onClick={() => handleStatusChange('scheduled')}
              >
                Scheduled
              </Button>
              <Button 
                variant={statusFilter === 'completed' ? "default" : "outline"} 
                size="sm"
                onClick={() => handleStatusChange('completed')}
              >
                Completed
              </Button>
            </div>
          </div>
          
          {/* Debates grid */}
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map((_, index) => (
                <div 
                  key={index} 
                  className="h-64 rounded-lg bg-muted animate-pulse"
                />
              ))}
            </div>
          ) : filteredDebates.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredDebates.map((debate, index) => (
                <TransitionWrapper 
                  key={debate.id}
                  animation="scale"
                  duration={300 + (index * 50)}
                >
                  <DebateCard {...debate} />
                </TransitionWrapper>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <h3 className="text-lg font-medium mb-2">No debates found</h3>
              <p className="text-muted-foreground">
                Try adjusting your filters or search terms
              </p>
            </div>
          )}
        </div>
      </TransitionWrapper>
    </>
  );
};

export default Debates;
