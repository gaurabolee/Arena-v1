import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { UserIcon, Linkedin, Facebook, Instagram, Youtube, Check, X } from "lucide-react";
import Logo from "@/components/Logo";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useState, useEffect } from "react";
import { useNavigate, useLocation, useParams } from "react-router-dom";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/context/AuthContext";

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

export default function InvitationProfile() {
  const [isModifyingTopics, setIsModifyingTopics] = useState(false);
  const [topics, setTopics] = useState<string[]>([]);
  const [newTopic, setNewTopic] = useState("");
  const [verificationPlatforms, setVerificationPlatforms] = useState<string[]>([]);
  const navigate = useNavigate();
  const location = useLocation();
  const { username } = useParams();
  const { findUserByUsername } = useAuth();
  const profileUser = username ? findUserByUsername(username) : null;

  // Define platforms with their icons
  const platforms = [
    { id: 'linkedin', name: 'LinkedIn', icon: Linkedin },
    { id: 'twitter', name: 'X', icon: XIcon },
    { id: 'facebook', name: 'Facebook', icon: Facebook },
    { id: 'instagram', name: 'Instagram', icon: Instagram },
    { id: 'youtube', name: 'YouTube', icon: Youtube },
    { id: 'tiktok', name: 'TikTok', icon: TikTokIcon }
  ];

  // Parse URL parameters to get verification platforms
  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const name = searchParams.get('name');
    const topicsParam = searchParams.get('topics');
    const verifyParam = searchParams.get('verify');

    if (topicsParam) {
      setTopics(topicsParam.split(','));
    }

    if (verifyParam) {
      const platforms = verifyParam.split(',');
      setVerificationPlatforms(platforms);
    }
  }, [location.search]);

  const handleCardClick = () => {
    window.open(`/profile/${username}`, '_blank');
  };

  const handleAccept = () => {
    // Navigate to sign up with the invitation data
    navigate("/register", {
      state: {
        invitedBy: username,
        topics: topics,
        verificationPlatforms: verificationPlatforms,
        isInvitation: true
      }
    });
  };

  const handleAddTopic = () => {
    if (newTopic.trim()) {
      setTopics([...topics, newTopic.trim()]);
      setNewTopic("");
    }
  };

  const handleRemoveTopic = (topicToRemove: string) => {
    setTopics(topics.filter(topic => topic !== topicToRemove));
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleAddTopic();
    }
  };

  // If no user is found, show a message
  if (!profileUser) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container max-w-2xl mx-auto py-8 space-y-8">
          {/* Arena Logo */}
          <div className="flex items-center gap-2.5">
            <Logo size={32} angle={135} />
            <span className="text-xl font-medium">Arena</span>
          </div>
          <Card className="rounded-xl border bg-card p-6">
            <div className="text-center py-8">
              <h2 className="text-xl font-medium mb-2">Profile Not Found</h2>
              <p className="text-muted-foreground mb-4">The profile you're looking for doesn't exist or has been removed.</p>
              <Button onClick={() => window.location.href = "/"}>Go Home</Button>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container max-w-2xl mx-auto py-8 space-y-8">
        {/* Arena Logo */}
        <div className="flex items-center gap-2.5">
          <Logo size={32} angle={135} />
          <span className="text-xl font-medium">Arena</span>
        </div>

        {/* Invitation Text */}
        <div className="space-y-4">
          <h1 className="text-2xl font-medium">Hi {new URLSearchParams(location.search).get('name')},</h1>
          <p className="text-lg text-muted-foreground">You have been invited to text in Public with:</p>
        </div>

        {/* Topics Section */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium">On topics:</h3>
          <div className="flex flex-wrap gap-2">
            {topics.map((topic, index) => (
              <Badge key={index} variant="secondary" className="px-3 py-1">
                {topic}
              </Badge>
            ))}
          </div>
        </div>

        {/* Verification Section */}
        {verificationPlatforms.length > 0 && (
          <div className="space-y-2">
            <div className="flex flex-wrap gap-3 text-sm bg-muted/30 px-3 py-2 rounded-md">
              <span className="font-medium mr-1">Verification requested</span>
              {verificationPlatforms.map(platformId => {
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
          </div>
        )}

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
            onClick={() => setIsModifyingTopics(true)}
            className="w-28"
          >
            Modify Topics
          </Button>
          <Button 
            variant="outline" 
            onClick={() => navigate('/')}
            className="w-28"
          >
            Decline
          </Button>
        </div>
      </div>

      {/* Modify Topics Dialog */}
      <Dialog open={isModifyingTopics} onOpenChange={setIsModifyingTopics}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Modify Topics</DialogTitle>
            <DialogDescription>
              Add or remove topics you'd like to discuss
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="flex gap-2">
              <Input
                placeholder="Add a topic"
                value={newTopic}
                onChange={(e) => setNewTopic(e.target.value)}
                onKeyPress={handleKeyPress}
              />
              <Button onClick={handleAddTopic}>Add</Button>
            </div>
            <div className="flex flex-wrap gap-2">
              {topics.map((topic, index) => (
                <div 
                  key={index}
                  className="inline-flex h-8 items-center gap-2 rounded-full border px-4 text-sm"
                >
                  {topic}
                  <button 
                    onClick={() => handleRemoveTopic(topic)}
                    className="text-muted-foreground hover:text-foreground"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
          <DialogFooter className="flex justify-between sm:justify-between">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsModifyingTopics(false)}
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={() => setIsModifyingTopics(false)}
            >
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
} 