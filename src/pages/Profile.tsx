import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useAuth, SocialLinks as ContextSocialLinks, VerificationStatus as ContextVerificationStatus, ExtendedUser } from '@/context/AuthContext';
import { updateProfile as updateFirebaseAuthProfile } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { User as UserIcon, Linkedin, Twitter, Facebook, Instagram, Copy, Mail, Share, Youtube, Shield, Settings, Camera, CopyIcon, CheckIcon, Loader2, MoreVertical, ImagePlus, Edit3, Trash2, Check } from 'lucide-react';
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
import { doc, setDoc, serverTimestamp, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Badge } from "@/components/ui/badge";

interface SocialVerification {
  linkedin: ContextVerificationStatus;
  twitter: ContextVerificationStatus;
  facebook: ContextVerificationStatus;
  instagram: ContextVerificationStatus;
  youtube: ContextVerificationStatus;
  tiktok: ContextVerificationStatus;
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

const generateVerificationCode = () => {
  const characters = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < 4; i++) {
    code += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return code;
};

const generateVerificationSymbol = () => {
  const letters = 'ABCDEFGHJKLMNPQRSTUVWXYZ';
  const randomIndex = Math.floor(Math.random() * letters.length);
  return letters[randomIndex];
};

const Profile: React.FC<ProfileProps> = () => {
  const { currentUser, logout, updateProfile: updateContextProfile, isEditing, setIsEditing, makeAdmin } = useAuth();
  const navigate = useNavigate();
  const { username } = useParams();
  const [formData, setFormData] = useState({
    name: currentUser?.name ?? '',
    username: currentUser?.username ?? '',
    bio: currentUser?.bio ?? '',
    photoURL: currentUser?.photoURL ?? '',
  });
  const [showInviteDialog, setShowInviteDialog] = useState(false);
  const [showValidateDialog, setShowValidateDialog] = useState(false);
  const [socialLinks, setSocialLinks] = useState<ContextSocialLinks>({
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
  const [selectedPlatform, setSelectedPlatform] = useState<keyof ContextSocialLinks | null>(null);
  const [verificationStatus, setVerificationStatus] = useState<SocialVerification>(() => {
    const savedStatus = localStorage.getItem('userVerificationStatus');
    const initialStatus = savedStatus ? JSON.parse(savedStatus) : {};
    return {
      linkedin: initialStatus.linkedin || { status: 'unverified' },
      twitter: initialStatus.twitter || { status: 'unverified' },
      facebook: initialStatus.facebook || { status: 'unverified' },
      instagram: initialStatus.instagram || { status: 'unverified' },
      youtube: initialStatus.youtube || { status: 'unverified' },
      tiktok: initialStatus.tiktok || { status: 'unverified' }
    };
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

  const isOwnProfile = !username || (currentUser && currentUser.username === username);

  useEffect(() => {
    console.log('Profile component mounted/updated. Current user:', currentUser);
    if (currentUser) {
      setFormData({
        name: currentUser.name ?? '',
        username: currentUser.username ?? '',
        bio: currentUser.bio ?? '',
        photoURL: currentUser.photoURL ?? '',
      });
  
      // Handle social links loading
      let linksToSet = currentUser.socialLinks || {};
      if (!linksToSet || Object.keys(linksToSet).length === 0) {
          const savedSocialLinks = localStorage.getItem('userSocialLinks');
          if (savedSocialLinks) {
              try {
                  console.log('Loading social links from localStorage');
                  const parsedLinks = JSON.parse(savedSocialLinks);
                   linksToSet = {
                     linkedin: parsedLinks.linkedin,
                     twitter: parsedLinks.twitter,
                     facebook: parsedLinks.facebook,
                     instagram: parsedLinks.instagram,
                     youtube: parsedLinks.youtube,
                     tiktok: parsedLinks.tiktok
                   };
              } catch (error) {
                  console.error('Error parsing social links from localStorage:', error);
                  linksToSet = {};
              }
          }
      }
      setSocialLinks({
          linkedin: linksToSet.linkedin ?? '',
          twitter: linksToSet.twitter ?? '',
          facebook: linksToSet.facebook ?? '',
          instagram: linksToSet.instagram ?? '',
          youtube: linksToSet.youtube ?? '',
          tiktok: linksToSet.tiktok ?? ''
      });
  
      // IMPROVED VERIFICATION STATUS LOADING LOGIC
      let statusToSet: SocialVerification = {
          linkedin: { status: 'unverified' },
          twitter: { status: 'unverified' },
          facebook: { status: 'unverified' },
          instagram: { status: 'unverified' },
          youtube: { status: 'unverified' },
          tiktok: { status: 'unverified' }
      };
  
      // Try to get verification status from localStorage first to ensure we
      // have the most recent status that was seen by the user
      const savedVerificationStatus = localStorage.getItem('userVerificationStatus');
      if (savedVerificationStatus) {
          try {
              console.log('Loading verification status from localStorage first');
              const parsedStatus = JSON.parse(savedVerificationStatus);
              
              if (parsedStatus && Object.keys(parsedStatus).length > 0) {
                  statusToSet = {
                      linkedin: parsedStatus.linkedin || { status: 'unverified' },
                      twitter: parsedStatus.twitter || { status: 'unverified' },
                      facebook: parsedStatus.facebook || { status: 'unverified' },
                      instagram: parsedStatus.instagram || { status: 'unverified' },
                      youtube: parsedStatus.youtube || { status: 'unverified' },
                      tiktok: parsedStatus.tiktok || { status: 'unverified' }
                  };
              }
          } catch (error) {
              console.error('Error parsing verification status from localStorage:', error);
          }
      }
  
      // Then check if currentUser has verification status and update if needed
      const userStatus = currentUser.verificationStatus;  
      if (userStatus && Object.keys(userStatus).length > 0) {
          console.log('Found verification status in currentUser:', userStatus);
          
          // Merge with what we loaded from localStorage, preferring Firestore data for any conflicts
          const mergedStatus = {
              linkedin: userStatus.linkedin || statusToSet.linkedin,
              twitter: userStatus.twitter || statusToSet.twitter,
              facebook: userStatus.facebook || statusToSet.facebook,
              instagram: userStatus.instagram || statusToSet.instagram,
              youtube: userStatus.youtube || statusToSet.youtube,
              tiktok: userStatus.tiktok || statusToSet.tiktok
          };
          
          statusToSet = mergedStatus;
          
          // Update localStorage with the merged status
          localStorage.setItem('userVerificationStatus', JSON.stringify(statusToSet));
          console.log('Updated localStorage with merged verification status');
      }
      
      console.log('Setting verification status in component:', statusToSet);
      setVerificationStatus(statusToSet);
  
    } else {
        setFormData({ name: '', username: '', bio: '', photoURL: '' });
        setSocialLinks({ linkedin: '', twitter: '', facebook: '', instagram: '', youtube: '', tiktok: '' });
        setVerificationStatus({
            linkedin: { status: 'unverified' }, twitter: { status: 'unverified' }, facebook: { status: 'unverified' },
            instagram: { status: 'unverified' }, youtube: { status: 'unverified' }, tiktok: { status: 'unverified' }
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

  const handleSaveProfile = async () => {
    if (!currentUser) return;
    try {
      const dataToUpdate: Partial<ExtendedUser> = {
        name: formData.name,
        username: formData.username,
        bio: formData.bio,
        socialLinks: socialLinks
      };
      await updateContextProfile(dataToUpdate);
      setIsEditing(false);
      toast.success('Profile updated successfully!');
    } catch (error: any) {
      toast.error('Failed to update profile: ' + error.message);
      console.error('Profile update error:', error);
    }
  };

  const handleImageSave = async () => {
    if (editorRef.current && currentUser && auth.currentUser) {
      const canvas = editorRef.current.getImageScaledToCanvas();
      const newPhotoURL = canvas.toDataURL();
      setPhotoURL(newPhotoURL);

      try {
        await updateFirebaseAuthProfile(auth.currentUser, { photoURL: newPhotoURL });
        console.log('Firebase Auth profile picture updated.');

        await updateContextProfile({ photoURL: newPhotoURL });
        console.log('Firestore and context state updated with new photoURL.');

        toast.success("Profile picture updated.");
        setImageEditor({ ...imageEditor, isOpen: false });
        setTempImage(null);

      } catch (error: any) {
         console.error("Error updating profile picture:", error);
         toast.error("Failed to update profile picture: " + error.message);
         setPhotoURL(currentUser.photoURL || '');
      }
    }
  };

  const handleSaveSocialLinks = async () => {
    if (!currentUser) return;
    try {
      await updateContextProfile({ socialLinks: socialLinks });
      toast.success('Social links updated!');
    } catch (error: any) {
      toast.error('Failed to update social links: ' + error.message);
      console.error('Error saving social links:', error);
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
      setTempImage(null);
      setImageEditor(prev => ({ ...prev, isOpen: false }));

      if (file.size > 5 * 1024 * 1024) {
        toast.error('Image size should be less than 5MB');
        return;
      }

      const validTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/heic'];
      if (!validTypes.includes(file.type)) {
        toast.error('Please upload a valid image file (JPEG, PNG, HEIC)');
        return;
      }

      let processedFile = file;
      
      if (file.type === 'image/heic') {
        try {
          console.log('Converting HEIC to JPEG');
          const blob = await heic2any({
            blob: file,
            toType: 'image/jpeg',
            quality: 0.8
          });
          const processedBlob = Array.isArray(blob) ? blob[0] : blob;
          processedFile = new File([processedBlob], file.name.replace('.heic', '.jpg'), { type: 'image/jpeg' });
        } catch (error) {
          console.error('Error converting HEIC:', error);
          toast.error('Failed to process HEIC image. Please try again.');
          return;
        }
      }

      if (!processedFile || processedFile.size === 0) {
        toast.error('Invalid image file. Please try again.');
        return;
      }

      const objectUrl = URL.createObjectURL(processedFile);
      
      console.log('Setting tempImage and opening image editor');
      setTempImage(processedFile);
      setImageEditor(prev => ({ 
        ...prev, 
        isOpen: true,
        scale: 1
      }));

      return () => URL.revokeObjectURL(objectUrl);
    } catch (error) {
      console.error('Error processing image:', error);
      toast.error('Failed to process image. Please try again.');
      setTempImage(null);
      setImageEditor(prev => ({ ...prev, isOpen: false }));
    }
  };

  const handleImageDelete = async () => {
    try {
      if (!window.confirm('Are you sure you want to remove your profile photo?')) {
        return;
      }

      const updatedUser = {
        ...currentUser,
        photoURL: null
      };

      await updateContextProfile(updatedUser);

      setPhotoURL('');

      localStorage.setItem('user', JSON.stringify(updatedUser));

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

      const base64 = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(blob);
      });

      let attempts = 0;
      const maxAttempts = 3;
      let success = false;

      while (!success && attempts < maxAttempts) {
        try {
          console.log('Updating profile with new photo');
          await updateContextProfile({
            ...currentUser,
            photoURL: base64
          });

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
            await new Promise(resolve => setTimeout(resolve, 1000));
          }
        }
      }
    } catch (error) {
      console.error('Error saving image:', error);
      toast.error('Failed to save image. Please try again.');
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

  const socialIcons = [
    { name: 'linkedin', Icon: Linkedin, label: 'LinkedIn' },
    { name: 'twitter', Icon: Twitter, label: 'Twitter/X' },
    { name: 'facebook', Icon: Facebook, label: 'Facebook' },
    { name: 'instagram', Icon: Instagram, label: 'Instagram' },
    { name: 'youtube', Icon: Youtube, label: 'YouTube' },
    { name: 'tiktok', Icon: Shield, label: 'TikTok' },
  ] as const;

  const renderSocialButtons = () => {
    return (
      <div className="flex flex-wrap gap-2 mt-3">
        {socialIcons.map(({ name, Icon, label }) => {
          const platformKey = name;
          const statusInfo: ContextVerificationStatus = verificationStatus[platformKey] || { status: 'unverified' };
          const status = statusInfo.status;
          const currentLink = socialLinks[platformKey] || '';
          const isPending = status === 'pending';
          const isVerified = status === 'verified';

          return (
            <div key={platformKey} className="flex items-center">
              <Button
                variant="ghost"
                size="sm"
                className={cn(
                  "flex items-center gap-2 relative",
                  isVerified && "text-green-500 hover:text-green-600",
                  isPending && "text-yellow-500 hover:text-yellow-600",
                  !isVerified && !isPending && "text-muted-foreground hover:text-foreground"
                )}
                onClick={() => isVerified ? window.open(currentLink, '_blank') : handleVerificationStart(platformKey)}
                disabled={isPending}
              >
                <Icon className="h-4 w-4" />
                <span>{label}</span>
                {isVerified && <CheckIcon className="h-3 w-3 text-green-500 absolute -top-1 -right-1 bg-background rounded-full p-0.5" />}
                {isPending && <Loader2 className="h-3 w-3 text-yellow-500 absolute -top-1 -right-1 animate-spin" />}
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

  const handleVerificationStart = (platform: keyof ContextSocialLinks) => {
    const symbol = generateVerificationSymbol();
    
    // Create the updated verification status
    const updatedStatus = {
      ...verificationStatus,
      [platform]: { 
        ...verificationStatus[platform], 
        status: 'pending', 
        code: symbol,
        timestamp: Date.now()
      }
    };

    // Update component state
    setVerificationStatus(updatedStatus);
    
    // Also update localStorage to ensure persistence across navigations
    localStorage.setItem('userVerificationStatus', JSON.stringify(updatedStatus));
    
    // Set UI state for dialog
    setSelectedPlatform(platform);
    setShowValidateDialog(true);
    setVerificationStep('code');
    setVerificationScreenshots({ code: null, profile: null });
  };

  const profileUrlPatterns: { [key in keyof ContextSocialLinks]: RegExp } = {
      twitter: /^https?:\/\/(www\.)?(twitter|x)\.com\/[a-zA-Z0-9_]+\/?$/,
      linkedin: /^https?:\/\/(www\.)?linkedin\.com\/(in|pub|company)\/[a-zA-Z0-9_-]+\/?$/,
      facebook: /^https?:\/\/(www\.)?facebook\.com\/[a-zA-Z0-9._-]+\/?$/,
      instagram: /^https?:\/\/(www\.)?instagram\.com\/[a-zA-Z0-9._]+\/?$/,
      youtube: /^https?:\/\/(www\.)?youtube\.com\/(user\/|channel\/|c\/)?[a-zA-Z0-9_-]+\/?$/,
      tiktok: /^https?:\/\/(www\.)?tiktok\.com\/@?[a-zA-Z0-9._-]+\/?$/
  };

  const validateProfileUrl = (platform: keyof ContextSocialLinks, url: string): boolean => {
    if (!url) return false;
    const pattern = profileUrlPatterns[platform];
    return pattern ? pattern.test(url) : false;
  };

  const syncVerificationStatusWithFirestore = async (statusToSync: SocialVerification) => {
    if (!currentUser) return;
    try {
      const userRef = doc(db, 'users', currentUser.uid);
      await setDoc(userRef, { verificationStatus: statusToSync }, { merge: true });
      console.log('Synced verification status with Firestore:', statusToSync);

      localStorage.setItem('userVerificationStatus', JSON.stringify(statusToSync));

      const contextUpdate: { [key: string]: ContextVerificationStatus } = {};
      for (const key in statusToSync) {
          if (Object.prototype.hasOwnProperty.call(statusToSync, key)) {
              const platformKey = key as keyof SocialVerification;
              contextUpdate[platformKey] = statusToSync[platformKey];
          }
      }
      await updateContextProfile({ verificationStatus: contextUpdate });

      setVerificationStatus(statusToSync);
    } catch (error) {
      console.error('Error syncing verification status with Firestore:', error);
    }
  };

  const handleVerificationSubmit = async (platform: keyof ContextSocialLinks, link: string) => {
    if (!currentUser) {
      toast.error("User not logged in.");
      return;
    }
    if (!link || !validateProfileUrl(platform, link)) {
      toast.error('Please enter a valid profile URL');
      return;
    }

    try {
      await setDoc(doc(db, 'verificationRequests', `${currentUser.uid}_${platform}`), {
        userId: currentUser.uid,
        username: currentUser.username,
        platform,
        profileUrl: link,
        verificationCode: verificationStatus[platform].code,
        requestedAt: serverTimestamp(),
        status: 'pending'
      });

      const updatedStatus = {
        ...verificationStatus,
        [platform]: {
          status: 'pending',
          code: verificationStatus[platform].code,
          timestamp: Date.now()
        }
      };
      
      await syncVerificationStatusWithFirestore(updatedStatus);

      setShowValidateDialog(false);
      toast.success('Verification request sent! We will notify you once verified.');

    } catch (error) {
      console.error('Error submitting verification:', error);
      toast.error('Failed to submit verification request. Please try again.');
    }
  };

  const handleCopyCode = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('Verification code copied!');
  };

  const handleMakeAdmin = async () => {
    if (currentUser) {
      try {
        await updateContextProfile({ isAdmin: true });
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
      
      const updatedUser = {
        ...currentUser,
        isAdmin: true
      };
      
      await updateContextProfile(updatedUser);
      
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
    <TransitionWrapper>
      <Navbar />
      <div className="container mx-auto px-4 py-8 max-w-4xl">
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
              {Object.values(verificationStatus).some(status => status.status === 'verified') && (
                <div className="space-y-2">
                  <h3 className="text-sm font-medium">Verified Accounts</h3>
                  <div className="flex flex-wrap gap-3">
                    {Object.entries(verificationStatus).map(([platform, status]) => {
                      if (status.status !== 'verified') return null;
                      
                      const Icon = platform === 'twitter' ? XIcon :
                        platform === 'tiktok' ? TikTokIcon :
                        platform === 'linkedin' ? Linkedin :
                        platform === 'facebook' ? Facebook :
                        platform === 'instagram' ? Instagram :
                        platform === 'youtube' ? Youtube : UserIcon;
                      
                      return (
                        <a 
                          key={platform}
                          href={socialLinks[platform as keyof ContextSocialLinks] || ''}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="block"
                        >
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-12 w-12 rounded-full relative hover:bg-gray-100 transition-colors text-green-600 shadow-md shadow-green-200 ring-1 ring-green-500 animate-pulse"
                          >
                            <Icon className="h-5 w-5" />
                            <div className="absolute -top-0.5 -right-0.5">
                              <Check className="h-3.5 w-3.5 text-green-500 stroke-[3px]" />
                            </div>
                          </Button>
                        </a>
                      );
                    })}
                  </div>
                </div>
              )}
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
      
      <Dialog open={showValidateDialog} onOpenChange={setShowValidateDialog}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Verify your {selectedPlatform ? selectedPlatform.charAt(0).toUpperCase() + selectedPlatform.slice(1) : 'Social Account'}</DialogTitle>
            <DialogDescription>
              Follow the steps to verify your account.
            </DialogDescription>
          </DialogHeader>
          {selectedPlatform && (
             <> 
              {verificationStep === 'code' && (
                  <div className="space-y-4 py-4">
                       <div className="space-y-2">
                           <Label>Verification Code</Label>
                           <div className="flex items-center gap-2">
                               <Input
                                   readOnly
                                   value={verificationStatus[selectedPlatform]?.code || ''}
                               />
                               <Button
                                   variant="outline"
                                   size="icon"
                                   onClick={() => {
                                       const codeToCopy = verificationStatus[selectedPlatform]?.code;
                                       if (codeToCopy) {
                                         handleCopyCode(codeToCopy);
                                       }
                                   }}
                                   disabled={!verificationStatus[selectedPlatform]?.code}
                               >
                                   <Copy className="h-4 w-4" />
                               </Button>
                           </div>
                           <p className="text-sm text-muted-foreground">
                               Copy this code and paste it temporarily in your {selectedPlatform} profile bio or a new post.
                           </p>
                       </div>
                  </div>
              )}
              {verificationStep === 'profile' && (
                   <div className="space-y-4 py-4">
                       {/* ... JSX for profile link input and screenshot ... */} 
                   </div>
              )}
             </> 
          )}
          <DialogFooter>
            <Button
              onClick={() => {
                if (selectedPlatform && socialLinks[selectedPlatform]) {
                  handleVerificationSubmit(selectedPlatform, socialLinks[selectedPlatform] || '');
                }
              }}
              disabled={!selectedPlatform || !socialLinks[selectedPlatform]}
            >
              Verify Profile
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

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

      <Dialog open={isEditing} onOpenChange={setIsEditing}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader className="pb-2">
            <DialogTitle className="text-lg">Edit Profile</DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              Update your profile information
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2 py-1">
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

            <div className="space-y-1">
              <Label className="text-xs font-medium">Social Verification</Label>
              <div className="grid grid-cols-6 gap-1">
                {socialIcons.map(({ name, Icon }) => {
                  const platformName = name;
                  const statusInfo = verificationStatus[platformName] || { status: 'unverified' };
                  const isVerified = statusInfo.status === 'verified';
                  const isPending = statusInfo.status === 'pending';
                  return (
                    <Button
                      key={platformName}
                      variant="outline"
                      size="icon"
                      className={cn(
                        "h-10 w-10 rounded-full relative",
                        isVerified && "border-green-500 text-green-500 ring-1 ring-green-500",
                        isPending && "border-yellow-500 text-yellow-500",
                        !isVerified && !isPending && "text-muted-foreground"
                      )}
                      onClick={() => handleVerificationStart(platformName)}
                      disabled={isVerified || isPending}
                    >
                      <Icon className="h-5 w-5" />
                      {isVerified && (
                        <CheckIcon className="h-3 w-3 text-white bg-green-500 rounded-full absolute -top-1 -right-1 p-0.5" />
                      )}
                      {isPending && (
                        <Loader2 className="h-3 w-3 text-yellow-500 absolute -top-1 -right-1 animate-spin" />
                      )}
                    </Button>
                  );
                })}
              </div>
              <p className="text-[10px] text-muted-foreground">At least one social verification required</p>
            </div>
          </div>
          <DialogFooter className="gap-1 sm:gap-0 mt-2">
            <Button variant="outline" size="sm" className="h-7 text-xs" onClick={() => setIsEditing(false)}>
              Cancel
            </Button>
            <Button size="sm" className="h-7 text-xs" onClick={handleSaveProfile}>
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
    </TransitionWrapper>
  );
};

export default Profile;
