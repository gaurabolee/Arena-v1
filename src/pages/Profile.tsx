import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useAuth } from '@/context/AuthContext';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { User as UserIcon, Linkedin, Twitter, Facebook, Instagram, Copy, Mail, Share, Youtube, Shield, Settings, Camera, CopyIcon, CheckIcon, Loader2, MoreVertical, ImagePlus, Edit3, Trash2 } from 'lucide-react';
import TransitionWrapper from '@/components/TransitionWrapper';
import Navbar from '@/components/Navbar';
import DebateCard from '@/components/DebateCard';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { cn } from '@/lib/utils';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import AvatarEditor from 'react-avatar-editor';
import { Slider } from "@/components/ui/slider";
import heic2any from 'heic2any';
import { createWorker, Worker } from 'tesseract.js';
import Logo from '@/components/Logo';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Badge } from "@/components/ui/badge";

interface SocialLinks {
  linkedin: string;
  twitter: string;
  facebook: string;
  instagram: string;
  youtube: string;
  tiktok: string;
}

interface VerificationStatus {
  status: 'unverified' | 'pending' | 'verified' | 'failed';
  code?: string;
  timestamp?: number;
}

interface SocialVerification {
  linkedin: VerificationStatus;
  twitter: VerificationStatus;
  facebook: VerificationStatus;
  instagram: VerificationStatus;
  youtube: VerificationStatus;
  tiktok: VerificationStatus;
}

interface ImageEditorState {
  scale: number;
  rotate: number;
  brightness: number;
  contrast: number;
  isOpen: boolean;
}

const MOCK_DEBATE_HISTORY = [
  {
    id: '1',
    title: 'Is AI a threat to humanity?',
    description: 'Discussing the potential risks and benefits of artificial intelligence advances.',
    participants: 24,
    messages: 158,
    status: 'active' as const,
    category: 'Technology',
  },
  {
    id: '6',
    title: 'Social Media and Democracy',
    description: 'Examining the impact of social media on democratic processes and institutions.',
    participants: 36,
    messages: 242,
    status: 'completed' as const,
    category: 'Politics',
  },
];

interface ProfileProps {}

// Function to generate random verification code
const generateVerificationCode = () => {
  const characters = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // Removed similar looking characters
  let code = '';
  for (let i = 0; i < 4; i++) {
    code += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return code;
};

const generateVerificationSymbol = () => {
  const letters = 'ABCDEFGHJKLMNPQRSTUVWXYZ'; // Removed similar looking letters I, O
  const randomIndex = Math.floor(Math.random() * letters.length);
  return letters[randomIndex];
};

const Profile: React.FC<ProfileProps> = () => {
  const { currentUser, logout, updateProfile, isEditing, setIsEditing, makeAdmin } = useAuth();
  const navigate = useNavigate();
  const { username } = useParams();
  const [formData, setFormData] = useState({
    name: '',
    username: '',
    bio: '',
  });
  const [showInviteDialog, setShowInviteDialog] = useState(false);
  const [showValidateDialog, setShowValidateDialog] = useState(false);
  const [socialLinks, setSocialLinks] = useState<SocialLinks>({
    linkedin: currentUser?.socialLinks?.linkedin ?? '',
    twitter: currentUser?.socialLinks?.twitter ?? '',
    facebook: currentUser?.socialLinks?.facebook ?? '',
    instagram: currentUser?.socialLinks?.instagram ?? '',
    youtube: currentUser?.socialLinks?.youtube ?? '',
    tiktok: currentUser?.socialLinks?.tiktok ?? ''
  });
  const [showSettings, setShowSettings] = useState(false);
  const settingsRef = useRef<HTMLDivElement>(null);
  const [photoURL, setPhotoURL] = useState<string>(currentUser?.photoURL || '');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const screenshotInputRef = useRef<HTMLInputElement>(null);
  const [selectedPlatform, setSelectedPlatform] = useState<keyof SocialLinks | null>(null);
  const [verificationStatus, setVerificationStatus] = useState<SocialVerification>({
    linkedin: { status: 'unverified' },
    twitter: { status: 'unverified' },
    facebook: { status: 'unverified' },
    instagram: { status: 'unverified' },
    youtube: { status: 'unverified' },
    tiktok: { status: 'unverified' }
  });
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationStep, setVerificationStep] = useState<'code' | 'profile'>('code');
  const [verificationScreenshots, setVerificationScreenshots] = useState<{
    code: File | null;
    profile: File | null;
  }>({
    code: null,
    profile: null
  });
  const [imageEditor, setImageEditor] = useState<ImageEditorState>({
    scale: 1,
    rotate: 0,
    brightness: 100,
    contrast: 100,
    isOpen: false
  });
  const [tempImage, setTempImage] = useState<File | null>(null);
  const editorRef = useRef<AvatarEditor>(null);

  // Determine if we're viewing our own profile or someone else's
  const isOwnProfile = !username || (currentUser && currentUser.username === username);

  useEffect(() => {
    console.log('Profile component loaded. Current user:', currentUser);
    console.log('Open edit mode:', isEditing);
    if (currentUser) {
      setFormData({
        name: currentUser.name,
        username: currentUser.username,
        bio: currentUser.bio || '',
      });
    }
  }, [currentUser]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (settingsRef.current && !settingsRef.current.contains(event.target as Node)) {
        setShowSettings(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  useEffect(() => {
    const savedStatus = localStorage.getItem('socialVerificationStatus');
    if (savedStatus) {
      setVerificationStatus(JSON.parse(savedStatus));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('socialVerificationStatus', JSON.stringify(verificationStatus));
  }, [verificationStatus]);

  useEffect(() => {
    if (currentUser?.photoURL) {
      setPhotoURL(currentUser.photoURL);
    }
  }, [currentUser?.photoURL]);

  useEffect(() => {
    if (isEditing) {
      setIsEditing(true);
    }
  }, [isEditing]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    try {
      await updateProfile({ 
        ...formData,
        photoURL // Include photoURL in profile update
      });
      toast.success('Profile updated successfully');
      setIsEditing(false);
    } catch (error) {
      toast.error('Failed to update profile');
      console.error(error);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const inviteSchema = z.object({
    email: z.string().email({ message: "Please enter a valid email address" }),
    message: z.string().optional(),
  });

  type InviteFormValues = z.infer<typeof inviteSchema>;

  const inviteForm = useForm<InviteFormValues>({
    resolver: zodResolver(inviteSchema),
    defaultValues: {
      email: '',
      message: "I'd like to invite you to join Arena, a platform for meaningful debates and discussions."
    },
  });

  const handleInvite = (data: InviteFormValues) => {
    toast.success(`Invitation sent to ${data.email}`);
    inviteForm.reset();
    setShowInviteDialog(false);
  };

  const copyInviteLink = () => {
    const inviteLink = `${window.location.origin}/register?referral=${currentUser?.username}`;
    navigator.clipboard.writeText(inviteLink);
    toast.success('Invite link copied to clipboard');
  };

  const handleSocialChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setSocialLinks((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageEdit = async (file: File) => {
    try {
      console.log('handleImageEdit called with file:', file);
      // Reset states
      setTempImage(null);
      setImageEditor(prev => ({ ...prev, isOpen: false }));

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Image size should be less than 5MB');
        return;
      }

      // Validate file type
      const validTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/heic'];
      if (!validTypes.includes(file.type)) {
        toast.error('Please upload a valid image file (JPEG, PNG, HEIC)');
        return;
      }

      let processedFile = file;
      
      // Convert HEIC to JPEG if needed
      if (file.type === 'image/heic') {
        try {
          console.log('Converting HEIC to JPEG');
          const blob = await heic2any({
            blob: file,
            toType: 'image/jpeg',
            quality: 0.8
          });
          // Handle both single blob and array of blobs
          const processedBlob = Array.isArray(blob) ? blob[0] : blob;
          processedFile = new File([processedBlob], file.name.replace('.heic', '.jpg'), { type: 'image/jpeg' });
        } catch (error) {
          console.error('Error converting HEIC:', error);
          toast.error('Failed to process HEIC image. Please try again.');
          return;
        }
      }

      // Validate processed file
      if (!processedFile || processedFile.size === 0) {
        toast.error('Invalid image file. Please try again.');
        return;
      }

      // Create object URL for preview
      const objectUrl = URL.createObjectURL(processedFile);
      
      // Set states in sequence
      console.log('Setting tempImage and opening image editor');
      setTempImage(processedFile);
      setImageEditor(prev => ({ 
        ...prev, 
        isOpen: true,
        scale: 1
      }));

      // Cleanup object URL when component unmounts or when new image is selected
      return () => URL.revokeObjectURL(objectUrl);
    } catch (error) {
      console.error('Error processing image:', error);
      toast.error('Failed to process image. Please try again.');
      // Reset states on error
      setTempImage(null);
      setImageEditor(prev => ({ ...prev, isOpen: false }));
    }
  };

  const handleImageDelete = async () => {
    try {
      // Show confirmation dialog
      if (!window.confirm('Are you sure you want to remove your profile photo?')) {
        return;
      }

      // Create updated user object with removed photo
      const updatedUser = {
        ...currentUser,
        photoURL: null
      };

      // Update profile through auth context
      await updateProfile(updatedUser);

      // Update local state
      setPhotoURL('');

      // Update localStorage directly to ensure persistence
      localStorage.setItem('user', JSON.stringify(updatedUser));

      // Force refresh of components
      window.dispatchEvent(new Event('storage'));

      toast.success('Profile photo removed');
    } catch (error) {
      console.error('Error removing photo:', error);
      toast.error('Failed to remove profile photo. Please try again.');
    }
  };

  const handleEditorSave = async () => {
    console.log('handleEditorSave called');
    if (!editorRef.current || !tempImage) {
      console.log('No editor ref or temp image');
      toast.error('No image to save. Please try again.');
      return;
    }

    try {
      const loadingToast = toast.loading('Saving your profile photo...');

      const canvas = editorRef.current.getImageScaledToCanvas();
      if (!canvas) {
        console.log('Failed to get canvas');
        toast.dismiss(loadingToast);
        toast.error('Failed to process image. Please try again.');
        return;
      }

      // Convert to blob with error handling and retry logic
      const blob = await new Promise<Blob | null>((resolve, reject) => {
        let attempts = 0;
        const maxAttempts = 3;

        const tryToBlob = () => {
          canvas.toBlob(
            (blob) => {
              if (blob) {
                resolve(blob);
              } else if (attempts < maxAttempts) {
                attempts++;
                setTimeout(tryToBlob, 100);
              } else {
                reject(new Error('Failed to create blob after multiple attempts'));
              }
            },
            'image/jpeg',
            0.95
          );
        };

        tryToBlob();
      });

      if (!blob) {
        console.log('Failed to create blob');
        toast.dismiss(loadingToast);
        toast.error('Failed to process image. Please try again.');
        return;
      }

      // Convert blob to base64 with error handling
      const base64 = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(blob);
      });

      // Update profile with error handling and retry logic
      let attempts = 0;
      const maxAttempts = 3;
      let success = false;

      while (!success && attempts < maxAttempts) {
        try {
          console.log('Updating profile with new photo');
          await updateProfile({
            ...currentUser,
            photoURL: base64
          });

          // Update local state
          setPhotoURL(base64);
          setImageEditor(prev => ({ ...prev, isOpen: false }));
          setTempImage(null);
          success = true;
          toast.dismiss(loadingToast);
          toast.success('Profile photo updated successfully');
        } catch (error) {
          attempts++;
          console.error(`Attempt ${attempts} failed:`, error);
          if (attempts === maxAttempts) {
            toast.dismiss(loadingToast);
            toast.error('Failed to update profile photo after multiple attempts. Please try again.');
          } else {
            // Wait before retrying
            await new Promise(resolve => setTimeout(resolve, 1000));
          }
        }
      }
    } catch (error) {
      console.error('Error saving image:', error);
      toast.error('Failed to save image. Please try again.');
      // Reset states on error
      setTempImage(null);
      setImageEditor(prev => ({ ...prev, isOpen: false }));
    }
  };

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

  const renderSocialButtons = () => {
    const socialIcons = [
      { name: 'linkedin', Icon: Linkedin, label: 'LinkedIn', url: socialLinks.linkedin },
      { name: 'twitter', Icon: XIcon, label: 'X', url: socialLinks.twitter },
      { name: 'facebook', Icon: Facebook, label: 'Facebook', url: socialLinks.facebook },
      { name: 'instagram', Icon: Instagram, label: 'Instagram', url: socialLinks.instagram },
      { name: 'youtube', Icon: Youtube, label: 'YouTube', url: socialLinks.youtube },
      { name: 'tiktok', Icon: TikTokIcon, label: 'TikTok', url: socialLinks.tiktok }
    ];

    return (
      <div className="flex flex-wrap gap-2 mt-3">
        {socialIcons.map(({ name, Icon, label, url }) => {
          const status = verificationStatus[name as keyof SocialLinks].status;
          return (
            <div key={name} className="flex items-center">
              <Button 
                variant="outline" 
                size="icon"
                className={cn(
                  "h-9 w-9 rounded-full",
                  status === 'verified' && "text-green-600 hover:text-green-700",
                  status === 'pending' && "text-yellow-500",
                  status === 'failed' && "text-red-500",
                  status === 'unverified' && "text-muted-foreground hover:text-foreground"
                )}
                onClick={() => handleVerificationStart(name as keyof SocialLinks)}
              >
                <Icon className="h-4 w-4" />
              </Button>
            </div>
          );
        })}
      </div>
    );
  };

  const toggleSettings = () => {
    setShowSettings(!showSettings);
  };

  const handleVerificationStart = (platform: keyof SocialLinks) => {
    const symbol = generateVerificationSymbol();
    setVerificationStatus(prev => ({
      ...prev,
      [platform]: { status: 'unverified', code: symbol, timestamp: Date.now() }
    }));
    setSelectedPlatform(platform);
    setShowValidateDialog(true);
  };

  const validateProfileUrl = (platform: keyof SocialLinks, url: string): boolean => {
    if (!url) return false;
    
    const urlPatterns = {
      twitter: /^https?:\/\/(www\.)?(twitter|x)\.com\/[a-zA-Z0-9_]+\/?$/,
      linkedin: /^https?:\/\/(www\.)?linkedin\.com\/(in|company)\/[a-zA-Z0-9_-]+\/?$/,
      facebook: /^https?:\/\/(www\.)?facebook\.com\/[a-zA-Z0-9_.]+\/?$/,
      instagram: /^https?:\/\/(www\.)?instagram\.com\/[a-zA-Z0-9_.]+\/?$/,
      youtube: /^https?:\/\/(www\.)?youtube\.com\/(c|channel|user)\/[a-zA-Z0-9_-]+\/?$/,
      tiktok: /^https?:\/\/(www\.)?tiktok\.com\/@[a-zA-Z0-9_.]+\/?$/
    };

    return urlPatterns[platform]?.test(url) || false;
  };

  const handleVerificationSubmit = async (platform: keyof SocialLinks, link: string) => {
    if (!link || !validateProfileUrl(platform, link)) {
      toast.error('Please enter a valid profile URL');
      return;
    }

    try {
      // Send verification request to admin
      await setDoc(doc(db, 'verificationRequests', `${currentUser.uid}_${platform}`), {
        userId: currentUser.uid,
        username: currentUser.username,
        platform,
        profileUrl: link,
        verificationCode: verificationStatus[platform].code,
        requestedAt: serverTimestamp(),
        status: 'pending'
      });

      // Update local verification status
      setVerificationStatus(prev => ({
        ...prev,
        [platform]: {
          status: 'pending',
          code: prev[platform].code,
          timestamp: Date.now()
        }
      }));

      // Close dialog and show success message
      setShowValidateDialog(false);
      toast.success('Verification request sent! We will notify you once verified.');

    } catch (error) {
      console.error('Error submitting verification:', error);
      toast.error('Failed to submit verification request. Please try again.');
    }
  };

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    toast.success('Verification code copied to clipboard');
  };

  const handleMakeAdmin = async () => {
    if (currentUser) {
      try {
        // Update user document in Firestore
        const userRef = doc(db, 'users', currentUser.uid);
        await setDoc(userRef, { isAdmin: true }, { merge: true });
        
        // Update local state
        setCurrentUser(prev => prev ? { ...prev, isAdmin: true } : null);
        
        toast.success('You are now an admin!');
      } catch (error) {
        console.error('Error making user admin:', error);
        toast.error('Failed to set admin status');
      }
    }
  };

  const makeAdminDirectly = async () => {
    if (!currentUser) return;
    
    try {
      const userRef = doc(db, 'users', currentUser.uid);
      await setDoc(userRef, { isAdmin: true }, { merge: true });
      
      // Update the current user object with admin status
      const updatedUser = {
        ...currentUser,
        isAdmin: true
      };
      
      // Update the auth context
      updateProfile(updatedUser);
      
      toast.success('You are now an admin!');
    } catch (error) {
      console.error('Error making admin:', error);
      toast.error('Failed to set admin status');
    }
  };

  if (!currentUser) {
    return (
      <>
        <Navbar />
        <TransitionWrapper animation="fade" className="min-h-screen pt-24 pb-10">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h1 className="text-2xl font-semibold mb-4">Profile Not Available</h1>
            <p className="mb-6">Please log in to view your profile</p>
            <Button asChild>
              <Link to="/login">Log In</Link>
            </Button>
          </div>
        </TransitionWrapper>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <TransitionWrapper animation="fade" className="min-h-screen pt-24 pb-10">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <Card className="mb-8">
            <CardHeader className="pb-4">
              <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
                <div className="relative">
                  <Avatar className="h-20 w-20">
                    <AvatarImage 
                      src={photoURL || undefined} 
                      alt={currentUser.name}
                      className="object-cover"
                    />
                    <AvatarFallback>
                      {currentUser.name ? currentUser.name.charAt(0).toUpperCase() : <UserIcon className="h-12 w-12" />}
                    </AvatarFallback>
                  </Avatar>
                </div>
                
                <div className="text-center sm:text-left">
                  <div className="flex items-center gap-2">
                    <CardTitle className="text-2xl font-medium mb-1">{formData.name}</CardTitle>
                    {Object.values(verificationStatus).some(status => status.status === 'verified') && (
                      <Badge variant="outline" className="bg-green-50 text-green-600 border-green-200">
                        <CheckIcon className="h-3 w-3 mr-1" />
                        Verified
                      </Badge>
                    )}
                  </div>
                  <CardDescription>@{formData.username}</CardDescription>
                  <p className="mt-3 text-muted-foreground">
                    {formData.bio || 'Tell us about yourself...'}
                  </p>
                </div>
                
                <div className="mt-4 sm:mt-0 sm:ml-auto flex gap-2">
                  <Button 
                    variant="outline"
                    size="sm"
                    onClick={() => setIsEditing(true)}
                  >
                    Edit Profile
                  </Button>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button 
                        variant="ghost" 
                        size="icon"
                        className="h-9 w-9"
                      >
                        <Settings className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-48">
                      <DropdownMenuItem
                        onClick={() => {
                          toast.info('Change password coming soon');
                        }}
                      >
                        Change Password
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        onClick={handleLogout}
                      >
                        Logout
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            </CardHeader>
            
            <CardContent>
              <div className="space-y-4">
              </div>
            </CardContent>
          </Card>
          
          <Tabs defaultValue="activity">
            <TabsList className="mb-6">
              <TabsTrigger value="activity" className="px-4">Activity</TabsTrigger>
            </TabsList>
            
            <TabsContent value="activity">
              <TransitionWrapper animation="slide-up">
                <div className="text-center py-12 bg-muted/50 rounded-lg">
                  <h3 className="text-lg font-medium mb-2">No Conversations Yet</h3>
                </div>
              </TransitionWrapper>
            </TabsContent>
          </Tabs>
        </div>
      </TransitionWrapper>
      
      <Dialog open={showValidateDialog} onOpenChange={setShowValidateDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Verify your {selectedPlatform} profile</DialogTitle>
            <DialogDescription>
              Follow these steps to verify your profile
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Verification Symbol</Label>
              <div className="flex items-center gap-2">
                <Input
                  readOnly
                  value={selectedPlatform ? verificationStatus[selectedPlatform].code || '' : ''}
                />
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => {
                    if (selectedPlatform && verificationStatus[selectedPlatform].code) {
                      handleCopyCode(verificationStatus[selectedPlatform].code!);
                    }
                  }}
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
              <p className="text-sm text-muted-foreground">
                Copy this symbol and paste it in your {selectedPlatform} bio
              </p>
            </div>
            <div className="space-y-2">
              <Label>Profile URL</Label>
              <Input
                placeholder={`Enter your ${selectedPlatform} profile URL`}
                value={selectedPlatform ? socialLinks[selectedPlatform] : ''}
                onChange={(e) => {
                  if (selectedPlatform) {
                    setSocialLinks(prev => ({
                      ...prev,
                      [selectedPlatform]: e.target.value
                    }));
                  }
                }}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              onClick={() => {
                if (selectedPlatform) {
                  handleVerificationSubmit(selectedPlatform, socialLinks[selectedPlatform]);
                }
              }}
              disabled={!selectedPlatform || !socialLinks[selectedPlatform]}
            >
              Verify Profile
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Image Editor Dialog */}
      <Dialog open={imageEditor.isOpen} onOpenChange={(open) => setImageEditor(prev => ({ ...prev, isOpen: open }))}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{photoURL ? 'Edit Profile Picture' : 'Upload Profile Picture'}</DialogTitle>
            <DialogDescription>
              {photoURL ? 'Make adjustments to your profile picture or upload a new one' : 'Choose a photo that represents you best'}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-6 py-4">
            {!tempImage ? (
              <div className="space-y-4">
                {photoURL && (
                  <div className="flex justify-center">
                    <div className="relative">
                      <Avatar className="h-32 w-32">
                        <AvatarImage 
                          src={photoURL}
                          alt="Current profile picture"
                          className="object-cover"
                        />
                      </Avatar>
                    </div>
                  </div>
                )}
                <div 
                  className="border-2 border-dashed rounded-lg p-8 transition-colors hover:border-primary/50 hover:bg-muted/50"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <div className="flex flex-col items-center justify-center gap-4 text-center">
                    <div className="rounded-full bg-primary/10 p-4">
                      <ImagePlus className="h-8 w-8 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm font-medium mb-1">Click to {photoURL ? 'change' : 'upload'} or drag and drop</p>
                      <p className="text-xs text-muted-foreground">JPEG, PNG, or HEIC (max 5MB)</p>
                    </div>
                  </div>
                </div>
                {photoURL && (
                  <Button 
                    variant="destructive" 
                    className="w-full"
                    onClick={handleImageDelete}
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Remove Profile Picture
                  </Button>
                )}
              </div>
            ) : (
              <div className="space-y-6">
                <div className="flex justify-center">
                  <div className="relative">
                    <AvatarEditor
                      ref={editorRef}
                      image={tempImage}
                      width={250}
                      height={250}
                      border={50}
                      borderRadius={125}
                      color={[0, 0, 0, 0.6]}
                      scale={imageEditor.scale}
                      rotate={0}
                    />
                    <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-background/80 backdrop-blur-sm px-3 py-1 rounded-full text-xs text-muted-foreground">
                      Drag to reposition
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label>Zoom</Label>
                      <span className="text-xs text-muted-foreground">{Math.round(imageEditor.scale * 100)}%</span>
                    </div>
                    <Slider
                      value={[imageEditor.scale]}
                      min={1}
                      max={3}
                      step={0.1}
                      onValueChange={([value]) => setImageEditor(prev => ({ ...prev, scale: value }))}
                      className="[&_[role=slider]]:h-4 [&_[role=slider]]:w-4"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setImageEditor(prev => ({ ...prev, isOpen: false }));
              setTempImage(null);
            }}>
              Cancel
            </Button>
            {tempImage && (
              <Button onClick={handleEditorSave}>
                Save Changes
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <input 
        ref={fileInputRef}
        type="file" 
        className="hidden" 
        accept="image/png,image/jpeg,image/jpg,image/heic"
        onChange={(e) => {
          console.log('File input changed');
          const file = e.target.files?.[0];
          if (file) {
            console.log('File selected:', file.name, file.type, file.size);
            handleImageEdit(file);
          }
        }}
      />

      {/* Edit Profile Dialog */}
      <Dialog open={isEditing} onOpenChange={setIsEditing}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader className="pb-2">
            <DialogTitle className="text-lg">Edit Profile</DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              Update your profile information
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2 py-1">
            {/* Profile Picture Section */}
            <div className="space-y-1">
              <Label className="text-xs font-medium">Profile Picture</Label>
              <div className="flex flex-col items-center gap-1">
                <div className="relative group cursor-pointer" onClick={() => {
                  if (photoURL) {
                    fetch(photoURL)
                      .then(res => res.blob())
                      .then(blob => {
                        const file = new File([blob], 'profile.jpg', { type: 'image/jpeg' });
                        handleImageEdit(file);
                      })
                      .catch(error => {
                        console.error('Error loading image:', error);
                        toast.error('Failed to load image for editing');
                      });
                  } else {
                    fileInputRef.current?.click();
                  }
                }}>
                  <Avatar className="h-16 w-16">
                    <AvatarImage 
                      src={photoURL || undefined} 
                      alt={currentUser.name}
                      className="object-cover rounded-full"
                    />
                    <AvatarFallback>
                      {currentUser.name ? currentUser.name.charAt(0).toUpperCase() : <UserIcon className="h-8 w-8" />}
                    </AvatarFallback>
                  </Avatar>
                  <div className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                    {photoURL ? (
                      <Edit3 className="h-3 w-3 text-white" />
                    ) : (
                      <Camera className="h-3 w-3 text-white" />
                    )}
                  </div>
                </div>
                <div className="flex gap-1">
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-[10px] h-6 px-2"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    {photoURL ? 'Change' : 'Upload'}
                  </Button>
                  {photoURL && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-[10px] h-6 px-2 text-red-500 hover:text-red-600"
                      onClick={handleImageDelete}
                    >
                      Remove
                    </Button>
                  )}
                </div>
              </div>
            </div>

            {/* Name Input */}
            <div className="space-y-1">
              <Label htmlFor="name" className="text-xs font-medium">Name</Label>
              <Input
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Your name"
                className="h-7 text-xs"
              />
            </div>

            {/* Username Input */}
            <div className="space-y-1">
              <Label htmlFor="username" className="text-xs font-medium">Username</Label>
              <Input
                id="username"
                name="username"
                value={formData.username}
                onChange={handleChange}
                placeholder="Your username"
                className="h-7 text-xs"
              />
            </div>

            {/* Bio Input */}
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <Label htmlFor="bio" className="text-xs font-medium">Bio</Label>
                <span className="text-[10px] text-muted-foreground">
                  {formData.bio.length}/280
                </span>
              </div>
              <Textarea
                id="bio"
                name="bio"
                value={formData.bio}
                onChange={handleChange}
                placeholder="Tell us about yourself..."
                rows={2}
                maxLength={280}
                className="resize-none text-xs min-h-[64px]"
              />
            </div>

            {/* Social Verification */}
            <div className="space-y-1">
              <Label className="text-xs font-medium">Social Verification</Label>
              <div className="grid grid-cols-6 gap-1">
                <Button 
                  variant="outline" 
                  size="icon"
                  className={cn(
                    "h-10 w-10 rounded-full",
                    verificationStatus.linkedin.status === 'verified' && "text-green-600 hover:text-green-700",
                    verificationStatus.linkedin.status === 'pending' && "text-yellow-500",
                    verificationStatus.linkedin.status === 'failed' && "text-red-500",
                    verificationStatus.linkedin.status === 'unverified' && "text-muted-foreground hover:text-foreground"
                  )}
                  onClick={() => handleVerificationStart('linkedin')}
                >
                  <Linkedin className="h-4 w-4" />
                </Button>

                <Button 
                  variant="outline" 
                  size="icon"
                  className={cn(
                    "h-10 w-10 rounded-full",
                    verificationStatus.twitter.status === 'verified' && "text-green-600 hover:text-green-700",
                    verificationStatus.twitter.status === 'pending' && "text-yellow-500",
                    verificationStatus.twitter.status === 'failed' && "text-red-500",
                    verificationStatus.twitter.status === 'unverified' && "text-muted-foreground hover:text-foreground"
                  )}
                  onClick={() => handleVerificationStart('twitter')}
                >
                  <XIcon className="h-4 w-4" />
                </Button>

                <Button 
                  variant="outline" 
                  size="icon"
                  className={cn(
                    "h-10 w-10 rounded-full",
                    verificationStatus.facebook.status === 'verified' && "text-green-600 hover:text-green-700",
                    verificationStatus.facebook.status === 'pending' && "text-yellow-500",
                    verificationStatus.facebook.status === 'failed' && "text-red-500",
                    verificationStatus.facebook.status === 'unverified' && "text-muted-foreground hover:text-foreground"
                  )}
                  onClick={() => handleVerificationStart('facebook')}
                >
                  <Facebook className="h-4 w-4" />
                </Button>

                <Button 
                  variant="outline" 
                  size="icon"
                  className={cn(
                    "h-10 w-10 rounded-full",
                    verificationStatus.instagram.status === 'verified' && "text-green-600 hover:text-green-700",
                    verificationStatus.instagram.status === 'pending' && "text-yellow-500",
                    verificationStatus.instagram.status === 'failed' && "text-red-500",
                    verificationStatus.instagram.status === 'unverified' && "text-muted-foreground hover:text-foreground"
                  )}
                  onClick={() => handleVerificationStart('instagram')}
                >
                  <Instagram className="h-4 w-4" />
                </Button>

                <Button 
                  variant="outline" 
                  size="icon"
                  className={cn(
                    "h-10 w-10 rounded-full",
                    verificationStatus.youtube.status === 'verified' && "text-green-600 hover:text-green-700",
                    verificationStatus.youtube.status === 'pending' && "text-yellow-500",
                    verificationStatus.youtube.status === 'failed' && "text-red-500",
                    verificationStatus.youtube.status === 'unverified' && "text-muted-foreground hover:text-foreground"
                  )}
                  onClick={() => handleVerificationStart('youtube')}
                >
                  <Youtube className="h-4 w-4" />
                </Button>

                <Button 
                  variant="outline" 
                  size="icon"
                  className={cn(
                    "h-10 w-10 rounded-full",
                    verificationStatus.tiktok.status === 'verified' && "text-green-600 hover:text-green-700",
                    verificationStatus.tiktok.status === 'pending' && "text-yellow-500",
                    verificationStatus.tiktok.status === 'failed' && "text-red-500",
                    verificationStatus.tiktok.status === 'unverified' && "text-muted-foreground hover:text-foreground"
                  )}
                  onClick={() => handleVerificationStart('tiktok')}
                >
                  <TikTokIcon className="h-4 w-4" />
                </Button>
              </div>
              <p className="text-[10px] text-muted-foreground">At least one social verification required</p>
            </div>
          </div>
          <DialogFooter className="gap-1 sm:gap-0 mt-2">
            <Button variant="outline" size="sm" className="h-7 text-xs" onClick={() => setIsEditing(false)}>
              Cancel
            </Button>
            <Button size="sm" className="h-7 text-xs" onClick={handleSave}>
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showInviteDialog} onOpenChange={setShowInviteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Invite Friends</DialogTitle>
            <DialogDescription>
              Share Arena with your friends and start debating together.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <a 
              href={`/profile/${currentUser.username}`}
              target="_blank"
              rel="noopener noreferrer"
              className="block hover:opacity-80 transition-opacity"
            >
              <Card>
                <CardHeader className="pb-4">
                  <div className="flex items-start gap-4">
                    <Avatar className="h-12 w-12">
                      <AvatarImage 
                        src={currentUser.photoURL || undefined} 
                        alt={currentUser.name}
                        className="object-cover"
                      />
                      <AvatarFallback>
                        {currentUser.name ? currentUser.name.charAt(0).toUpperCase() : <UserIcon className="h-8 w-8" />}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <h3 className="font-semibold">{currentUser.name}</h3>
                      <p className="text-sm text-muted-foreground">@{currentUser.username}</p>
                    </div>
                  </div>
                </CardHeader>
              </Card>
            </a>

            <div className="space-y-2">
              <Label>Share Link</Label>
              <div className="flex gap-2">
                <Input 
                  value={`${window.location.origin}/register?referral=${currentUser?.username}`}
                  readOnly
                />
                <Button onClick={copyInviteLink}>
                  Copy
                </Button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {currentUser?.isAdmin && (
        <div className="mt-4 p-4 bg-green-100 rounded">
          <p className="text-green-800">You are an admin! ✨</p>
          <Link 
            to="/admin"
            className="mt-2 inline-block bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded"
          >
            Go to Admin Panel
          </Link>
        </div>
      )}

      {currentUser?.email === 'gaurabolee123@gmail.com' && !currentUser?.isAdmin && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">
          <Button 
            onClick={makeAdminDirectly}
            variant="outline"
            className="w-full"
          >
            Make Admin
          </Button>
        </div>
      )}
    </>
  );
};

export default Profile;
