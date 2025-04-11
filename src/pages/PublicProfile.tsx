import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { UserIcon, Linkedin, Facebook, Instagram, Youtube, Check, Twitter } from "lucide-react";
import Logo from "@/components/Logo";
import { useParams } from "react-router-dom";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useState, useEffect, useRef } from "react";
import { db } from "@/lib/firebase";
import { doc, onSnapshot, query, collection, where, getDocs, limit } from "firebase/firestore";
import Navbar from "@/components/Navbar";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import type { ExtendedUser, VerificationStatus } from "@/context/AuthContext";

// Declare global window property
declare global {
  interface Window {
    _verifiedProfiles: {
      [username: string]: boolean;
    } | undefined;
  }
}

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
  const [profileUser, setProfileUser] = useState<ExtendedUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [lastKnownVerification, setLastKnownVerification] = useState<{[key: string]: VerificationStatus} | null>(null);
  const [isVerified, setIsVerified] = useState(false);
  const lastKnownVerificationRef = useRef(lastKnownVerification);
  // Add a flag to track if localStorage has been checked
  const [localStorageChecked, setLocalStorageChecked] = useState(false);

  // For extreme persistence, store verification in a global property as well
  useEffect(() => {
    // Check if the window global cache already has verification for this user
    if (username && window._verifiedProfiles && window._verifiedProfiles[username]) {
      console.log("Using global window cache for verification status");
      setIsVerified(true);
    }
  }, [username]);

  // Setup global object to store verified profiles across renders
  useEffect(() => {
    if (!window._verifiedProfiles) {
      window._verifiedProfiles = {};
    }
  }, []);

  // When verification status changes, update global cache
  useEffect(() => {
    if (isVerified && username) {
      console.log("Storing verification in global window cache");
      window._verifiedProfiles = window._verifiedProfiles || {};
      window._verifiedProfiles[username] = true;
    }
  }, [isVerified, username]);

  // Keep ref in sync with state
  useEffect(() => { 
    lastKnownVerificationRef.current = lastKnownVerification; 
  }, [lastKnownVerification]);

  // Add tab visibility handler to restore verification when switching back to tab
  useEffect(() => {
    if (!username) return;
    
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        console.log("Tab became visible, restoring verification status");
        const storedVerification = localStorage.getItem(`verified_profile_${username}`);
        if (storedVerification) {
          try {
            const parsed = JSON.parse(storedVerification);
            const hasVerifiedStatus = Object.values(parsed).some(
              (status: any) => status && typeof status === 'object' && 
                            'status' in status && status.status === 'verified'
            );
            
            if (hasVerifiedStatus) {
              console.log("Found verification in localStorage, restoring verification badge");
              setLastKnownVerification(parsed);
              setIsVerified(true);
            }
          } catch (error) {
            console.error("Error parsing stored verification:", error);
          }
        }
      }
    };
    
    // Run once on mount to ensure we have verification status
    handleVisibilityChange();
    
    // Add event listener for tab visibility changes
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [username]);

  // Load any previously stored verification data from localStorage on component mount
  useEffect(() => {
    if (!username) return;
    
    try {
      console.log("CHECKING LOCALSTORAGE FOR:", username);
      const storedVerification = localStorage.getItem(`verified_profile_${username}`);
      
      if (storedVerification) {
        console.log(`Found stored verification for ${username}:`, storedVerification);
        const parsed = JSON.parse(storedVerification);
        setLastKnownVerification(parsed);
        
        // Pre-set verification status based on localStorage
        const hasVerified = Object.values(parsed).some(
          (status: any) => status && typeof status === 'object' && 
                         'status' in status && status.status === 'verified'
        );
        
        if (hasVerified) {
          console.log("PRE-SETTING VERIFIED STATUS TO TRUE FROM CACHE");
          setIsVerified(true);
        }
      } else {
        console.log("No stored verification found in localStorage");
      }
    } catch (error) {
      console.error("Error loading cached verification:", error);
    } finally {
      setLocalStorageChecked(true);
    }
  }, [username]);

  // Wait for localStorage check before setting up Firestore listener
  useEffect(() => {
    if (!username || !localStorageChecked) {
      console.log("Waiting for localStorage check to complete...");
      return;
    }
    
    console.log("localStorage check complete, setting up Firestore listener");
    setLoading(true);

    // Query Firestore once to find the user ID by username
    const usersRef = collection(db, "users");
    const q = query(usersRef, where("username", "==", username), limit(1));

    let unsubscribe: (() => void) | undefined;

    const getUserAndListen = async () => {
      try {
        const querySnapshot = await getDocs(q);

        if (querySnapshot.empty) {
          console.log("No user found with username:", username);
          setProfileUser(null);
          setLoading(false);
          return;
        }

        const userDoc = querySnapshot.docs[0];
        const userId = userDoc.id;

        // Now set up the real-time listener using the user ID
        const userDocRef = doc(db, "users", userId);
        unsubscribe = onSnapshot(userDocRef, (docSnap) => {
          if (docSnap.exists()) {
            const userData = docSnap.data();
            console.log("Real-time update for user:", username);
            console.log("Verification status in Firestore:", userData.verificationStatus);
            
            // Combine user data with UID (useful for consistency)
            const updatedUser = { ...userData, uid: userId } as ExtendedUser;
            
            // Compute verification state using the ref instead of state
            const cacheVerified = lastKnownVerificationRef.current ? 
              Object.values(lastKnownVerificationRef.current).some(
                status => status && typeof status === 'object' && 'status' in status && status.status === 'verified'
              ) : false;
            
            const firestoreVerified = Object.values(userData.verificationStatus || {}).some(
              status => status && typeof status === 'object' && 'status' in status && status.status === 'verified'
            );
            
            const verified = firestoreVerified || cacheVerified;
            
            if (firestoreVerified && !cacheVerified) {
              console.log("Found verified status in Firestore, saving to localStorage");
              // Save to both localStorage and sessionStorage for redundancy
              localStorage.setItem(`verified_profile_${username}`, JSON.stringify(userData.verificationStatus));
              sessionStorage.setItem(`verified_profile_${username}`, JSON.stringify(userData.verificationStatus));
              setLastKnownVerification(userData.verificationStatus);
            }
            // If localStorage has verification but Firestore doesn't, inject the verified status
            else if (!firestoreVerified && cacheVerified && lastKnownVerificationRef.current) {
              console.log("Using cached verification, not found in Firestore");
              
              // Inject cached verification data into user object for consistent display
              if (!updatedUser.verificationStatus) {
                updatedUser.verificationStatus = {};
              }
              
              // Add verified platforms from cache to ensure icons display properly
              Object.entries(lastKnownVerificationRef.current).forEach(([platform, status]) => {
                if (status && typeof status === 'object' && 'status' in status && status.status === 'verified') {
                  if (!updatedUser.verificationStatus![platform] || 
                      updatedUser.verificationStatus![platform].status !== 'verified') {
                    console.log(`Adding verified status for ${platform} from cache`);
                    updatedUser.verificationStatus![platform] = status;
                  }
                }
              });
            }
            
            setIsVerified(verified);
            
            // Set the profile user with potentially modified verification data
            setProfileUser(updatedUser);
          } else {
            console.log("User document deleted for:", username);
            setProfileUser(null); 
          }
          setLoading(false);
        }, (error) => {
          console.error("Error listening to user document:", error);
          setProfileUser(null);
          setLoading(false);
        });

      } catch (error) {
        console.error("Error fetching user ID by username:", error);
        setProfileUser(null);
        setLoading(false);
      }
    };

    getUserAndListen();

    return () => {
      if (unsubscribe) {
        console.log("Unsubscribing from user listener:", username);
        unsubscribe();
      }
    };
  }, [username, localStorageChecked]); // Add localStorageChecked back to the dependency array

  // If loading, show a loading state (WITH Navbar)
  if (loading && !isVerified) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen pt-20 pb-10">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h1 className="text-2xl font-semibold mb-4">Loading profile...</h1>
          </div>
        </div>
      </>
    );
  }

  // If no user is found and no verification, show a message (WITH Navbar)
  if (!profileUser && !isVerified) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen pt-20 pb-10">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h1 className="text-2xl font-semibold mb-4">Profile Not Found</h1>
            <p>The user you're looking for doesn't exist.</p>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className="container mx-auto px-4 pt-32 pb-8 max-w-4xl">
        <div className="h-64 border border-red-500 bg-red-100 p-4">
          Simple Placeholder Content
        </div>
      </div>
    </>
  );
} 