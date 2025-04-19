import React, { createContext, useContext, useState, useEffect, ReactNode, useRef } from 'react';
import { User, onAuthStateChanged, createUserWithEmailAndPassword, updateProfile, signInWithEmailAndPassword, signOut } from 'firebase/auth';
import { auth } from '../lib/firebase'; // Adjust path if needed
import { doc, setDoc, onSnapshot, collection, query, where, getDocs, getDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { toast } from 'sonner';

// Define the SocialLinks type
export interface SocialLinks {
  [key: string]: string | undefined;
  linkedin?: string;
  twitter?: string;
  facebook?: string;
  instagram?: string;
  youtube?: string;
  tiktok?: string;
}

export interface VerificationStatus {
  status: 'unverified' | 'pending' | 'verified' | 'failed';
  timestamp?: number;
  code?: string;
}

export interface ExtendedUser extends User {
  name: string;
  username: string;
  bio?: string;
  socialLinks: SocialLinks;
  isAdmin?: boolean;
  verificationStatus?: {
    [key: string]: VerificationStatus;
  };
  updatedAt?: string;
}

interface NotificationType {
  id: string;
  type: 'verification_pending' | 'verification_approved' | 'verification_rejected';
  message: string;
  timestamp: number;
  read: boolean;
  platform?: string;
}

interface AuthContextType {
  currentUser: ExtendedUser | null;
  loading: boolean;
  register: (name: string, email: string, username: string, password: string) => Promise<ExtendedUser>;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  updateProfile: (updatedData: Partial<ExtendedUser>) => Promise<void>;
  isEditing: boolean;
  setIsEditing: (value: boolean) => void;
  notifications: NotificationType[];
  markNotificationAsRead: (notificationId: string) => void;
  makeAdmin: () => Promise<void>;
  findUserByUsername: (username: string) => Promise<ExtendedUser | null>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<ExtendedUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [notifications, setNotifications] = useState<NotificationType[]>([]);
  
  // Keep track of already processed notification IDs at component level so it persists across renders
  const processedNotifications = useRef(new Set<string>());

  useEffect(() => {
    // Auth state listener
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      try {
        if (user) {
          // Get user data from Firestore
          const userRef = doc(db, 'users', user.uid);
          const userDoc = await getDoc(userRef);
          const userData = userDoc.data();

          if (userData) {
            console.log('Auth state changed: Setting user data with verification status:', userData.verificationStatus);
            
            // Set current user with all necessary data
            setCurrentUser({
              ...user, // Start with the base Firebase User object
              // Explicitly assign properties from Firestore data (userData) or Firebase user
              name: userData.name || userData.displayName || user.displayName || '',
              username: userData.username || '', // Ensure username is always defined
              displayName: userData.displayName || user.displayName, // Use Firestore displayName first
              photoURL: userData.photoURL || user.photoURL, // Use Firestore photoURL first
              bio: userData.bio || '', // Use Firestore bio
              isAdmin: userData.isAdmin || user.email === 'gaurabolee123@gmail.com', // Firestore admin or specific email override
              verificationStatus: userData.verificationStatus || {}, // Use Firestore verificationStatus
              socialLinks: userData.socialLinks || {}, // Use Firestore socialLinks
              updatedAt: userData.updatedAt || '', // Use Firestore updatedAt
              // Removed the potentially problematic ...userData spread
            });

            // Store verification status in localStorage as backup
            localStorage.setItem('userVerificationStatus', JSON.stringify(userData.verificationStatus || {}));
            localStorage.setItem('userSocialLinks', JSON.stringify(userData.socialLinks || {}));
          } else {
            // If no Firestore data, set basic user data
            setCurrentUser({
              ...user,
              name: user.displayName || '',
              username: '',
              displayName: user.displayName,
              photoURL: user.photoURL,
              bio: '',
              isAdmin: user.email === 'gaurabolee123@gmail.com', // Always admin if this email
              verificationStatus: {},
              socialLinks: {},
              updatedAt: '',
            });
          }
        } else {
          // User is signed out
          setCurrentUser(null);
          localStorage.removeItem('userVerificationStatus');
          localStorage.removeItem('userSocialLinks');
        }
      } catch (error) {
        console.error('Error in auth state listener:', error);
        // On error, try to load from localStorage as fallback
        if (user) {
          const verificationStatus = localStorage.getItem('userVerificationStatus');
          const socialLinks = localStorage.getItem('userSocialLinks');
          setCurrentUser({
            ...user,
            name: user.displayName || '',
            username: '',
            displayName: user.displayName,
            photoURL: user.photoURL,
            bio: '',
            isAdmin: user.email === 'gaurabolee123@gmail.com', // Always admin if this email
            verificationStatus: verificationStatus ? JSON.parse(verificationStatus) : {},
            socialLinks: socialLinks ? JSON.parse(socialLinks) : {},
            updatedAt: '',
          });
        } else {
          setCurrentUser(null);
        }
      } finally {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  // Add notification listener
  useEffect(() => {
    if (!currentUser) return;

    // Listen for notifications
    const notificationsRef = collection(db, 'notifications', currentUser.uid, 'userNotifications');
    const unsubscribeNotifications = onSnapshot(notificationsRef, async (snapshot) => {
      try {
        for (const change of snapshot.docChanges()) {
          // Only process new notifications that we haven't seen before
          if (change.type === 'added') {
            const data = change.doc.data();
            const notificationKey = `${data.type}_${data.platform}_${change.doc.id}`;
            
            // Check if we've already processed this notification
            if (processedNotifications.current.has(change.doc.id) || localStorage.getItem(notificationKey)) {
              continue; // Skip this notification
            }
            
            // Mark as processed
            processedNotifications.current.add(change.doc.id);
            
            // Add new notification to state
            setNotifications(prev => [{
              id: change.doc.id,
              ...data
            } as NotificationType, ...prev]);

            // If it's a verification notification, refresh user data
            if (data.type === 'verification_approved') {
              try {
                // Get fresh user data from Firestore
                const userRef = doc(db, 'users', currentUser.uid);
                const userDoc = await getDoc(userRef);
                const userData = userDoc.data();

                if (userData) {
                  console.log('Verification approved: Updating user data with:', userData.verificationStatus);
                  
                  // Update current user with fresh data
                  setCurrentUser(prev => {
                    if (!prev) return null;
                    return {
                      ...prev,
                      verificationStatus: userData.verificationStatus || {},
                      socialLinks: userData.socialLinks || {},
                      updatedAt: userData.updatedAt || '',
                    };
                  });

                  // Store verification status in localStorage as backup
                  localStorage.setItem('userVerificationStatus', JSON.stringify(userData.verificationStatus));
                  localStorage.setItem('userSocialLinks', JSON.stringify(userData.socialLinks));

                  // Only show toast if not already handled in admin dashboard
                  if (!data.handledInAdmin) {
                    toast.success(`Your ${data.platform} account has been verified!`);
                    localStorage.setItem(notificationKey, 'true');
                  }
                }
              } catch (error) {
                console.error('Error updating user data after verification:', error);
              }
            } else if (data.type === 'verification_rejected') {
              // Only show toast if not already handled in admin dashboard
              if (!data.handledInAdmin) {
                toast.error(`Your ${data.platform} verification was rejected.`);
                localStorage.setItem(notificationKey, 'true');
              }
            }
          }
        }
      } catch (error) {
        console.error('Error processing notifications:', error);
      }
    }, (error) => {
      console.error('Error in notification listener:', error);
    });

    return () => {
      unsubscribeNotifications();
    };
  }, [currentUser]);

  // Add this new useEffect to set admin status
  useEffect(() => {
    if (currentUser?.email === 'gaurabolee123@gmail.com') {
      const userRef = doc(db, 'users', currentUser.uid);
      setDoc(userRef, { isAdmin: true }, { merge: true })
        .then(() => {
          setCurrentUser(prev => prev ? { ...prev, isAdmin: true } : null);
          console.log('Admin status set for gaurabolee123@gmail.com');
        })
        .catch(error => {
          console.error('Error setting admin status:', error);
        });
    }
  }, [currentUser?.email]);

  const register = async (name: string, email: string, username: string, password: string): Promise<ExtendedUser> => {
    try {
      console.log('Attempting to create user with email:', email);
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      console.log('User created:', user);

      // Create a clean user object for Firestore
      const userDoc = {
        uid: user.uid,
        email: user.email || '',
        name,
        username,
        bio: '',
        photoURL: user.photoURL || '',
        socialLinks: {},
        verificationStatus: {}
      };

      console.log('Creating Firestore document for user:', userDoc);

      // Create the user document in Firestore
      const userRef = doc(db, 'users', user.uid);
      await setDoc(userRef, userDoc);
      console.log('Firestore document created successfully');

      // Set the current user by combining Firebase user and our custom fields
      const extendedUser: ExtendedUser = {
        ...user,
        name,
        username,
        bio: '',
        socialLinks: {},
        verificationStatus: {}
      };
      setCurrentUser(extendedUser);

      // Open the Edit Profile popup
      setIsEditing(true);

      // Return the new user
      return extendedUser;
    } catch (error: any) {
      console.error('Error during registration:', error);
      if (error.code) {
        console.error('Firebase error code:', error.code);
      }
      if (error.message) {
        console.error('Firebase error message:', error.message);
      }
      throw error;
    }
  };

  const login = async (email: string, password: string) => {
    try {
      // Just perform the sign in - the auth state listener will handle the rest
      await signInWithEmailAndPassword(auth, email, password);
      
      // No need to set currentUser here as onAuthStateChanged will handle it
      // Just show the success message after a short delay to ensure state is set
      setTimeout(() => {
        toast.success('Welcome back!');
      }, 500);
    } catch (error: any) {
      console.error('Login error:', error);
      toast.error(error.message || 'Failed to log in');
      throw error;
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
      setCurrentUser(null);
      // Clear localStorage
      localStorage.removeItem('userVerificationStatus');
      localStorage.removeItem('userSocialLinks');
      toast.success('Logged out successfully');
    } catch (error: any) {
      console.error('Logout error:', error);
      toast.error('Failed to log out');
      throw error;
    }
  };

  const updateProfile = async (updatedData: Partial<ExtendedUser>) => {
    if (!currentUser) return;

    // Prepare data for Firestore update (only include fields relevant to Firestore)
    const dataToUpdate: { [key: string]: any } = {}; // Use a more flexible type for Firestore data
    
    // Explicitly copy fields intended for Firestore
    if (updatedData.name !== undefined) dataToUpdate.name = updatedData.name;
    if (updatedData.username !== undefined) dataToUpdate.username = updatedData.username;
    if (updatedData.bio !== undefined) dataToUpdate.bio = updatedData.bio;
    if (updatedData.photoURL !== undefined) dataToUpdate.photoURL = updatedData.photoURL; // Storing photoURL in Firestore
    if (updatedData.socialLinks !== undefined) dataToUpdate.socialLinks = updatedData.socialLinks;
    if (updatedData.isAdmin !== undefined) dataToUpdate.isAdmin = updatedData.isAdmin;
    if (updatedData.verificationStatus !== undefined) dataToUpdate.verificationStatus = updatedData.verificationStatus;
    // Add other custom fields as needed
    
    dataToUpdate.updatedAt = new Date().toISOString(); // Add timestamp

    try {
      // Update Firestore
      const userRef = doc(db, 'users', currentUser.uid);
      await setDoc(userRef, dataToUpdate, { merge: true });
      console.log('Firestore updated with:', dataToUpdate);

      // Update the local state by merging
      // Note: We merge the entire updatedData, even if some props are read-only on the base User type
      // The local state update should reflect the intended state after potential Firebase Auth updates (handled by the component)
      setCurrentUser(prevUser => {
        if (!prevUser) return null;
        console.log('Updating local currentUser state by merging:', updatedData);
        // Merge existing currentUser with the *provided* updated fields
        return { ...prevUser, ...updatedData };
      });

    } catch (error) {
      console.error("Error updating Firestore or local state:", error);
      toast.error("Failed to save profile changes.");
      // Re-throw the error if the calling component needs to handle it
      throw error;
    }
  };

  const markNotificationAsRead = (notificationId: string) => {
    setNotifications(prev =>
      prev.map(notification =>
        notification.id === notificationId
          ? { ...notification, read: true }
          : notification
      )
    );
  };

  const makeAdmin = async () => {
    if (!currentUser) return;
    
    try {
      const userRef = doc(db, 'users', currentUser.uid);
      await setDoc(userRef, {
        isAdmin: true
      }, { merge: true });
      
      // Update local state
      setCurrentUser(prev => prev ? { ...prev, isAdmin: true } : null);
      toast.success('You are now an admin!');
    } catch (error) {
      console.error('Error making user admin:', error);
      toast.error('Failed to set admin status');
    }
  };

  const findUserByUsername = async (username: string): Promise<ExtendedUser | null> => {
    try {
      const q = query(collection(db, 'users'), where('username', '==', username));
      const querySnapshot = await getDocs(q);
      
      if (querySnapshot.empty) {
        return null;
      }

      // Get the Firestore data
      const firestoreData = querySnapshot.docs[0].data();
      
      // Get the current Firebase user if it matches the uid
      const firebaseUser = auth.currentUser;
      
      // If this is the current user's profile, merge with Firebase user data
      if (firebaseUser && firebaseUser.uid === firestoreData.uid) {
        return {
          ...firebaseUser,
          name: firestoreData.name || '',
          username: firestoreData.username || '',
          bio: firestoreData.bio || '',
          photoURL: firestoreData.photoURL || firebaseUser.photoURL || '',
          socialLinks: firestoreData.socialLinks || {},
          isAdmin: firestoreData.isAdmin || firebaseUser.email === 'gaurabolee123@gmail.com', // Firestore admin or specific email override
          verificationStatus: firestoreData.verificationStatus || {},
          updatedAt: firestoreData.updatedAt || '',
        } as ExtendedUser;
      }
      
      // For other users' profiles, return just the Firestore data
      return {
        ...firestoreData,
        socialLinks: firestoreData.socialLinks || {},
        verificationStatus: firestoreData.verificationStatus || {},
        updatedAt: firestoreData.updatedAt || '',
      } as ExtendedUser;
    } catch (error) {
      console.error('Error finding user:', error);
      return null;
    }
  };

  const value = {
    currentUser,
    loading,
    register,
    login,
    logout,
    updateProfile,
    isEditing,
    setIsEditing,
    notifications,
    markNotificationAsRead,
    makeAdmin,
    findUserByUsername
  };

  // Don't render children until loading is complete
  // Render null or a loading indicator if you prefer while loading
  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

// Add a function to generate a unique verification symbol
function generateVerificationSymbol() {
  const specialCharacters = ['#', '*', '@', '&', '%', '$', '!', '^'];
  const randomIndex1 = Math.floor(Math.random() * specialCharacters.length);
  const randomIndex2 = Math.floor(Math.random() * specialCharacters.length);
  const symbol = `${specialCharacters[randomIndex1]}${specialCharacters[randomIndex2]}`;
  return symbol;
}

// Example usage of the function
const userSymbol = generateVerificationSymbol();
console.log(`Your verification symbol is: ${userSymbol}`);

// Placeholder for user to submit their social media profile link
// This would typically be part of a form in the UI
const userProfileLink = ""; // User will input their profile link here
