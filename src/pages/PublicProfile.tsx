import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { UserIcon, Linkedin, Facebook, Instagram, Youtube, Check } from "lucide-react";
import Logo from "@/components/Logo";
import { useParams } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";
import TransitionWrapper from "@/components/TransitionWrapper";
import type { ExtendedUser, VerificationStatus } from "@/context/AuthContext";

interface SocialLinks {
  [key: string]: string;
}

interface ProfileUser {
  name: string;
  username: string;
  bio: string;
  photoURL: string;
  verificationStatus?: {
    [key: string]: VerificationStatus;
  };
  socialLinks?: SocialLinks;
}

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

export default function PublicProfile() {
  const { username } = useParams();
  const { findUserByUsername } = useAuth();
  const [profileUser, setProfileUser] = useState<ExtendedUser | null>(null);
  const [loading, setLoading] = useState(true);

  // Helper function to check if user has any verified accounts
  const hasVerifiedAccounts = (user: ExtendedUser) => {
    return Object.values(user.verificationStatus || {}).some(
      (status): status is VerificationStatus => 
        status && typeof status === 'object' && status.status === 'verified'
    );
  };

  useEffect(() => {
    const loadUser = async () => {
      if (username) {
        const user = await findUserByUsername(username);
        setProfileUser(user);
        setLoading(false);
      }
    };
    loadUser();
  }, [username, findUserByUsername]);

  // If loading, show a loading state
  if (loading) {
    return (
      <>
        <Navbar />
        <TransitionWrapper animation="fade" className="min-h-screen pt-24 pb-10">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h1 className="text-2xl font-semibold mb-4">Loading profile...</h1>
          </div>
        </TransitionWrapper>
      </>
    );
  }

  // If no user is found, show a message
  if (!profileUser) {
    return (
      <>
        <Navbar />
        <TransitionWrapper animation="fade" className="min-h-screen pt-24 pb-10">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h1 className="text-2xl font-semibold mb-4">Profile Not Found</h1>
            <p>The user you're looking for doesn't exist.</p>
          </div>
        </TransitionWrapper>
      </>
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

        {/* Profile Card */}
        <Card className="rounded-xl border bg-card">
          <CardHeader className="pb-4">
            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
              <div className="relative">
                <Avatar className="h-20 w-20">
                  <AvatarImage 
                    src={profileUser.photoURL || undefined} 
                    alt={profileUser.name}
                    className="object-cover"
                  />
                  <AvatarFallback>
                    {profileUser.name ? profileUser.name.charAt(0).toUpperCase() : <UserIcon className="h-12 w-12" />}
                  </AvatarFallback>
                </Avatar>
              </div>
              
              <div className="text-center sm:text-left">
                <div className="flex items-center gap-2">
                  <CardTitle className="text-2xl font-medium">{profileUser.name}</CardTitle>
                  {profileUser && hasVerifiedAccounts(profileUser) && (
                    <Badge variant="outline" className="bg-green-50 text-green-600 border-green-200">
                      <Check className="h-3 w-3 mr-1" />
                      Verified
                    </Badge>
                  )}
                </div>
                <CardDescription>@{profileUser.username}</CardDescription>
                <p className="mt-3 text-muted-foreground">
                  {profileUser.bio || 'Tell us about yourself...'}
                </p>
              </div>
            </div>
          </CardHeader>
          
          <CardContent>
            <div className="space-y-4">
              {/* Social Verification Section */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <Label className="text-sm font-medium">Verified Accounts</Label>
                  </div>
                </div>
                
                <div className="grid grid-cols-6 gap-3">
                  {Object.entries(profileUser.socialLinks || {}).map(([name, value]) => {
                    const Icon = name === 'twitter' ? XIcon : name === 'tiktok' ? TikTokIcon : 
                      name === 'linkedin' ? Linkedin : 
                      name === 'facebook' ? Facebook : 
                      name === 'instagram' ? Instagram : 
                      name === 'youtube' ? Youtube : UserIcon;
                    
                    const status = profileUser?.verificationStatus?.[name]?.status;
                    
                    // Only show verified accounts
                    if (status !== 'verified') return null;
                    
                    return (
                      <div key={name} className="flex flex-col items-center gap-2">
                        <a
                          href={value}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="block"
                        >
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-12 w-12 rounded-full relative hover:bg-gray-100 transition-colors"
                          >
                            <Icon className="h-5 w-5" />
                            <div className="absolute -top-0.5 -right-0.5">
                              <Check className="h-3.5 w-3.5 text-black stroke-[2.5px]" />
                            </div>
                          </Button>
                        </a>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tagline and CTA */}
        <div className="flex flex-col items-center gap-6">
          <p className="text-base text-muted-foreground">
            Every text does not have to be private
          </p>
          <Button 
            size="lg" 
            className="w-full sm:w-auto px-8"
            onClick={() => window.location.href = "/register"}
          >
            Join Arena
          </Button>
        </div>
      </div>
    </div>
  );
} 