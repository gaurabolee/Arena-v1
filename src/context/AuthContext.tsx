import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, onAuthStateChanged, createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { auth } from '../lib/firebase'; // Adjust path if needed
import { doc, setDoc, onSnapshot, collection, query, where, getDocs, getDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { toast } from 'sonner';

// Define the SocialLinks type
export interface SocialLinks {
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
  updateProfile: (user: ExtendedUser) => void;
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

  useEffect(() => {
    // Listen for authentication state changes
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      console.log('Auth state changed:', user);
      if (user) {
        // Get user data from Firestore
        const userRef = doc(db, 'users', user.uid);
        onSnapshot(userRef, (doc) => {
          if (doc.exists()) {
            const userData = doc.data();
            const extendedUser: ExtendedUser = {
              ...user,
              name: userData.name || user.displayName || '',
              username: userData.username || '',
              bio: userData.bio || '',
              photoURL: userData.photoURL || user.photoURL || '',
              socialLinks: userData.socialLinks || {},
              isAdmin: userData.isAdmin || false,
              verificationStatus: userData.verificationStatus || {}
            };
            setCurrentUser(extendedUser);
          } else {
            // If no Firestore document exists, use basic user data
            const extendedUser: ExtendedUser = {
              ...user,
              name: user.displayName || '',
              username: '',
              bio: '',
              photoURL: user.photoURL || '',
              socialLinks: {},
              isAdmin: false,
              verificationStatus: {}
            };
            setCurrentUser(extendedUser);
          }
        });
      } else {
        setCurrentUser(null);
      }
      setLoading(false);
    });

    // Cleanup subscription on unmount
    return unsubscribe;
  }, []);

  // Add notification listener
  useEffect(() => {
    if (!currentUser) return;

    // Listen for notifications
    const notificationsRef = collection(db, 'notifications', currentUser.uid, 'userNotifications');
    const unsubscribeNotifications = onSnapshot(notificationsRef, async (snapshot) => {
      snapshot.docChanges().forEach(async (change) => {
        if (change.type === 'added') {
          const data = change.doc.data();
          
          // Add new notification to state
          setNotifications(prev => [{
            id: change.doc.id,
            ...data
          } as NotificationType, ...prev]);

          // If it's a verification notification, refresh user data
          if (data.type === 'verification_approved') {
            // Get fresh user data from Firestore
            const userRef = doc(db, 'users', currentUser.uid);
            const userDoc = await getDoc(userRef);
            const userData = userDoc.data();

            if (userData) {
              // Update current user with fresh data
              setCurrentUser(prev => {
                if (!prev) return null;
                return {
                  ...prev,
                  verificationStatus: userData.verificationStatus || {},
                  socialLinks: userData.socialLinks || {}
                };
              });

              // Show toast notification
              toast.success(`Your ${data.platform} account has been verified!`);
            }
          } else if (data.type === 'verification_rejected') {
            toast.error(`Your ${data.platform} verification was rejected`);
          }
        }
      });
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
    // Implement login functionality
  };

  const logout = async () => {
    // Implement logout functionality
  };

  const updateProfile = async (user: ExtendedUser) => {
    if (!currentUser) return;

    // Update the user's profile in Firestore
    const userRef = doc(db, 'users', currentUser.uid);
    await setDoc(userRef, {
      name: user.name,
      username: user.username,
      bio: user.bio,
      photoURL: user.photoURL,
      updatedAt: new Date().toISOString(),
    }, { merge: true });

    // Update the local state
    setCurrentUser({
      ...currentUser,
      name: user.name,
      username: user.username,
      bio: user.bio,
      photoURL: user.photoURL || '',
      socialLinks: {}
    });
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
          isAdmin: firestoreData.isAdmin || false,
          verificationStatus: firestoreData.verificationStatus || {}
        } as ExtendedUser;
      }
      
      // For other users' profiles, return just the Firestore data
      return {
        ...firestoreData,
        socialLinks: firestoreData.socialLinks || {},
        verificationStatus: firestoreData.verificationStatus || {}
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
