import React, { useState, useEffect } from 'react';
import { useAuth, ExtendedUser } from '@/context/AuthContext';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import TransitionWrapper from '@/components/TransitionWrapper';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { toast } from 'sonner';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { User, Linkedin, Facebook, Instagram, Youtube, CheckCircle } from 'lucide-react';
import Logo from '@/components/Logo';
import ProfileCard from '@/components/ProfileCard';

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

  // Parse verification platforms from URL
  useEffect(() => {
    const verifyParam = searchParams.get('verify');
    if (verifyParam) {
      setVerificationPlatforms(verifyParam.split(','));
    }
  }, [searchParams]);

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
    // TODO: Implement modify topics logic
    toast.info('Topics modification will be implemented soon');
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
        {/* Arena Logo */}
        <div className="fixed top-4 left-4">
          <div className="flex items-center gap-2.5">
            <Logo size={32} angle={135} />
            <span className="text-xl font-medium">Arena</span>
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
      {/* Arena Logo */}
      <div className="fixed top-4 left-4">
        <div className="flex items-center gap-2.5">
          <Logo size={32} angle={135} />
          <span className="text-xl font-medium">Arena</span>
        </div>
      </div>

      <TransitionWrapper animation="fade" className="min-h-screen pt-24 pb-10">
        <div className="max-w-3xl mx-auto px-4">
          <Card>
            <CardContent className="pt-6">
              <div className="space-y-6">
                <div className="space-y-4">
                  <h2 className="text-xl">Hi {recipientName},</h2>
                  <p>You have been invited to text in Public with:</p>
                </div>

                {/* Unified Profile Card */}
                <ProfileCard
                  user={{
                    name: profileUserData.name,
                    username: profileUserData.username,
                    photoURL: profileUserData.photoURL,
                    bio: profileUserData.bio,
                    socialLinks: profileUserData.socialLinks || {},
                    verificationStatus: profileUserData.verificationStatus || {},
                  }}
                  showActions={false}
                />

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
                    onClick={handleModifyTopics}
                    className="w-28"
                  >
                    Modify Topics
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
        </div>
      </TransitionWrapper>
    </div>
  );
};

export default InvitePreview;