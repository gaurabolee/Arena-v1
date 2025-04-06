
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import TransitionWrapper from '@/components/TransitionWrapper';

interface Topic {
  id: string;
  title: string;
  description: string;
  category: string;
  debateCount: number;
}

interface TopicBrowserProps {
  topics: Topic[];
  onSelectTopic: (topic: Topic) => void;
  className?: string;
}

const TopicBrowser: React.FC<TopicBrowserProps> = ({
  topics,
  onSelectTopic,
  className,
}) => {
  return (
    <div className={cn("grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6", className)}>
      {topics.map((topic, index) => (
        <TransitionWrapper
          key={topic.id}
          animation="scale"
          duration={300 + (index * 50)}
        >
          <Card className="h-full border overflow-hidden transition-all duration-300 hover:shadow-md flex flex-col">
            <CardHeader className="pb-2">
              <Badge variant="outline" className="self-start mb-2">
                {topic.category}
              </Badge>
              <CardTitle className="line-clamp-1 text-xl">
                {topic.title}
              </CardTitle>
            </CardHeader>
            
            <CardContent className="pb-2 flex-1">
              <p className="text-muted-foreground line-clamp-3">{topic.description}</p>
            </CardContent>
            
            <CardFooter className="pt-2">
              <div className="w-full flex items-center justify-between">
                <span className="text-sm text-muted-foreground">
                  {topic.debateCount} {topic.debateCount === 1 ? 'debate' : 'debates'}
                </span>
                <Button 
                  variant="default" 
                  size="sm"
                  className="button-effect"
                  onClick={() => onSelectTopic(topic)}
                >
                  Start Debate
                </Button>
              </div>
            </CardFooter>
          </Card>
        </TransitionWrapper>
      ))}
    </div>
  );
};

export default TopicBrowser;
