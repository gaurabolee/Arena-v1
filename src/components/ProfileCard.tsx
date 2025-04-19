import React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from '@/components/ui/dropdown-menu';
import { Check, Linkedin, X as XIcon, Facebook, Instagram, Youtube, Settings, User as UserIcon } from 'lucide-react';
import { SocialLinks, VerificationStatus } from '@/context/AuthContext';

const TikTokIcon = ({ className = 'h-4 w-4' }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/>
  </svg>
);

const iconMap: Record<string, React.FC<{ className?: string }>> = {
  linkedin: Linkedin,
  twitter: XIcon,
  facebook: Facebook,
  instagram: Instagram,
  youtube: Youtube,
  tiktok: TikTokIcon,
};

interface ProfileCardProps {
  user: {
    name: string;
    username: string;
    photoURL?: string;
    bio?: string;
    socialLinks: SocialLinks;
    verificationStatus: { [key: string]: VerificationStatus };
  };
  showActions?: boolean;
}

const ProfileCard: React.FC<ProfileCardProps> = ({ user, showActions = true }) => {
  const verifiedCount = Object.values(user.verificationStatus || {})
    .filter(s => s.status === 'verified').length;
  let colorClass = '', ringClass = '';
  if (verifiedCount === 1) {
    colorClass = 'text-[#cd7f32]';
    ringClass = 'ring-[#cd7f32]';
  } else if (verifiedCount === 2) {
    colorClass = 'text-gray-400';
    ringClass = 'ring-gray-400';
  } else if (verifiedCount >= 3) {
    colorClass = 'text-yellow-400';
    ringClass = 'ring-yellow-400';
  }

  return (
    <Card className="mb-8">
      <CardHeader className="pb-4">
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
          <Avatar className="h-20 w-20">
            <AvatarImage src={user.photoURL} alt={user.name} />
            <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
          </Avatar>
          <div className="text-center sm:text-left">
            <div className="flex mb-1">
              <div className="relative inline-block">
                <CardTitle className="text-2xl font-medium">{user.name}</CardTitle>
                {verifiedCount > 0 && (
                  <span className={`absolute top-0 left-full ml-1 inline-flex items-center justify-center h-4 w-4 bg-background ring-1 ${ringClass} rounded-full`}>
                    <Check className={`h-2 w-2 ${colorClass}`} />
                  </span>
                )}
              </div>
            </div>
            <CardDescription>@{user.username}</CardDescription>
            {user.bio && <p className="mt-3 text-muted-foreground">{user.bio}</p>}
          </div>
          {showActions && (
            <div className="mt-4 sm:mt-0 sm:ml-auto flex gap-2">
              <Button variant="outline" size="sm">Edit Profile</Button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-9 w-9">
                    <Settings className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuItem>Change Password</DropdownMenuItem>
                  <DropdownMenuItem>Logout</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <h3 className="text-sm font-medium">Verified Accounts</h3>
          <div className="flex flex-wrap gap-3">
            {Object.entries(user.verificationStatus || {}).map(([platform, status]) => {
              if (status.status !== 'verified') return null;
              const Icon = iconMap[platform] || UserIcon;
              return (
                <a key={platform} href={user.socialLinks[platform] || ''} target="_blank" rel="noopener noreferrer">
                  <Button variant="ghost" size="icon" className="relative p-0 text-black hover:text-gray-800 hover:bg-gray-100">
                    <Icon className="h-4 w-4 text-black" />
                    <div className="absolute -top-1 -right-1">
                      <Check className="h-3 w-3 bg-background rounded-full p-0.5 text-black" />
                    </div>
                  </Button>
                </a>
              );
            })}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ProfileCard;
