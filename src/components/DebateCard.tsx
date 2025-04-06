
import React from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { MessageCircle, Users } from 'lucide-react';

export interface DebateCardProps {
  id: string;
  title: string;
  description: string;
  participants: number;
  messages: number;
  status: 'active' | 'scheduled' | 'completed';
  category: string;
  className?: string;
}

const DebateCard: React.FC<DebateCardProps> = ({
  id,
  title,
  description,
  participants,
  messages,
  status,
  category,
  className,
}) => {
  const getStatusColor = () => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'scheduled':
        return 'bg-blue-100 text-blue-800';
      case 'completed':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <Card className={cn("border overflow-hidden transition-all duration-300 hover:shadow-md", className)}>
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between">
          <Badge variant="outline" className="mb-2">
            {category}
          </Badge>
          <Badge className={cn("capitalize", getStatusColor())}>
            {status}
          </Badge>
        </div>
        <CardTitle className="line-clamp-1 text-xl">
          {title}
        </CardTitle>
        <CardDescription className="line-clamp-2">
          {description}
        </CardDescription>
      </CardHeader>
      
      <CardContent className="pb-2">
        <div className="flex justify-between text-sm text-muted-foreground">
          <div className="flex items-center">
            <Users className="mr-1 h-4 w-4" />
            <span>{participants} participants</span>
          </div>
          
          <div className="flex items-center">
            <MessageCircle className="mr-1 h-4 w-4" />
            <span>{messages} messages</span>
          </div>
        </div>
      </CardContent>
      
      <CardFooter className="pt-2">
        <Link to={`/debates/${id}`} className="w-full">
          <Button 
            variant="default" 
            className="w-full button-effect"
          >
            {status === 'active' ? 'Join Debate' : status === 'scheduled' ? 'Set Reminder' : 'View Summary'}
          </Button>
        </Link>
      </CardFooter>
    </Card>
  );
};

export default DebateCard;
