import React from 'react';
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Linkedin, Facebook, Instagram, CheckCircle } from 'lucide-react';

// Custom X icon
const XIcon = ({ className = "h-4 w-4" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
  </svg>
);

interface UnifiedProfileCardProps {
  user: {
    name: string;
    username: string;
    photoURL?: string;
    bio?: string;
    verificationStatus?: {
      linkedin?: { status: string };
      twitter?: { status: string };
      facebook?: { status: string };
      instagram?: { status: string };
    };
  };
  className?: string;
}

const UnifiedProfileCard: React.FC<UnifiedProfileCardProps> = ({ user, className = '' }) => (
  <Card className={`mb-8 border overflow-hidden transition-all duration-300 hover:shadow-md max-w-xl mx-auto ${className}`}>
    <CardHeader className="pb-4">
      <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
        <div className="relative">
          <Avatar className="h-20 w-20">
            <AvatarImage 
              src={user.photoURL || undefined} 
              alt={user.name}
              className="object-cover"
            />
            <AvatarFallback>
              {user.name ? user.name.charAt(0).toUpperCase() : '?'}
            </AvatarFallback>
          </Avatar>
        </div>
        <div className="text-center sm:text-left w-full">
          <div className="flex mb-1">
            <div className="relative inline-block">
              <CardTitle className="text-2xl font-medium">{user.name}</CardTitle>
            </div>
          </div>
          <CardDescription>@{user.username}</CardDescription>
          <p className="mt-3 text-muted-foreground">
            {user.bio || 'Tell us about yourself...'}
          </p>
          {/* Verified Accounts Section */}
          <div className="mt-6">
            <h3 className="text-sm font-semibold mb-2">Verified Accounts</h3>
            <div className="flex flex-row gap-4 justify-center sm:justify-start">
              {/* LinkedIn */}
              <div className="relative flex items-center justify-center">
                <span className="h-10 w-10 rounded-full bg-muted flex items-center justify-center border border-border">
                  <Linkedin className="h-5 w-5 text-foreground" />
                </span>
                {user.verificationStatus?.linkedin?.status === 'verified' && (
                  <span className="absolute -top-1 -right-1 h-4 w-4 bg-white rounded-full flex items-center justify-center border border-border shadow">
                    <CheckCircle className="h-3 w-3 text-primary" />
                  </span>
                )}
              </div>
              {/* X (Twitter) */}
              <div className="relative flex items-center justify-center">
                <span className="h-10 w-10 rounded-full bg-muted flex items-center justify-center border border-border">
                  <XIcon className="h-5 w-5 text-foreground" />
                </span>
                {user.verificationStatus?.twitter?.status === 'verified' && (
                  <span className="absolute -top-1 -right-1 h-4 w-4 bg-white rounded-full flex items-center justify-center border border-border shadow">
                    <CheckCircle className="h-3 w-3 text-primary" />
                  </span>
                )}
              </div>
              {/* Facebook */}
              <div className="relative flex items-center justify-center">
                <span className="h-10 w-10 rounded-full bg-muted flex items-center justify-center border border-border">
                  <Facebook className="h-5 w-5 text-foreground" />
                </span>
                {user.verificationStatus?.facebook?.status === 'verified' && (
                  <span className="absolute -top-1 -right-1 h-4 w-4 bg-white rounded-full flex items-center justify-center border border-border shadow">
                    <CheckCircle className="h-3 w-3 text-primary" />
                  </span>
                )}
              </div>
              {/* Instagram */}
              <div className="relative flex items-center justify-center">
                <span className="h-10 w-10 rounded-full bg-muted flex items-center justify-center border border-border">
                  <Instagram className="h-5 w-5 text-foreground" />
                </span>
                {user.verificationStatus?.instagram?.status === 'verified' && (
                  <span className="absolute -top-1 -right-1 h-4 w-4 bg-white rounded-full flex items-center justify-center border border-border shadow">
                    <CheckCircle className="h-3 w-3 text-primary" />
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </CardHeader>
  </Card>
);

export default UnifiedProfileCard; 