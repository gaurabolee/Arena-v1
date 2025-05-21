import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
// Firebase imports are no longer directly used for auth operations in this simplified version
// import { User } from 'firebase/auth'; 
// import { auth as firebaseAuth } from '../lib/firebase';
// import { db as firestoreDb } from '../lib/firebase';
import { toast } from 'sonner';

// Keep ExtendedUser and other types for UI consistency if needed, but they won't be Firebase-backed
export interface SocialLinks {
  [key: string]: string | undefined;
  linkedin?: string;
  twitter?: string;
  // ... other social links
}

export interface VerificationStatus {
  status: 'unverified' | 'pending' | 'verified' | 'failed';
  timestamp?: number;
  code?: string;
}

// This User type can be a simplified local version
interface MockUser {
  uid: string;
  email: string | null;
  name: string;
  username: string;
  bio?: string;
  socialLinks: SocialLinks;
  isAdmin?: boolean;
  verificationStatus?: { [key: string]: VerificationStatus };
  updatedAt?: string;
  // Add other fields from ExtendedUser that your UI might expect
  displayName?: string | null;
  photoURL?: string | null;
  emailVerified?: boolean;
  isAnonymous?: boolean;
  // metadata, providerData, etc., are Firebase specific and can be omitted for mock
}

export type ExtendedUser = MockUser; // Use MockUser as ExtendedUser

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
  updateProfile: (updatedData: Partial<ExtendedUser>) => Promise<void>; // Will update local state only
  isEditing: boolean;
  setIsEditing: (value: boolean) => void;
  notifications: NotificationType[];
  markNotificationAsRead: (notificationId: string) => void;
  findUserByUsername: (username: string) => Promise<ExtendedUser | null>; // Will simulate
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps { children: ReactNode; }

const MOCK_USER_STORAGE_KEY = 'arenaMockUser';

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<ExtendedUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [notifications, setNotifications] = useState<NotificationType[]>([]);

  useEffect(() => {
    console.log('AuthProvider: Attempting to load mock user from localStorage...');
    const storedUserString = localStorage.getItem(MOCK_USER_STORAGE_KEY);
    if (storedUserString) {
      try {
        const storedUser = JSON.parse(storedUserString) as ExtendedUser;
        setCurrentUser(storedUser);
        console.log('AuthProvider: Successfully loaded mock user from localStorage:', storedUser);
      } catch (error) {
        console.error('AuthProvider: Error parsing mock user from localStorage. Clearing it.', error);
        localStorage.removeItem(MOCK_USER_STORAGE_KEY);
      }
    } else {
      console.log('AuthProvider: No mock user found in localStorage.');
    }
    setLoading(false);
  }, []);

  const persistUser = (user: ExtendedUser | null) => {
    if (user) {
      localStorage.setItem(MOCK_USER_STORAGE_KEY, JSON.stringify(user));
      console.log('AuthProvider: Saved mock user to localStorage:', user);
    } else {
      localStorage.removeItem(MOCK_USER_STORAGE_KEY);
      console.log('AuthProvider: Removed mock user from localStorage.');
    }
    setCurrentUser(user);
  };

  const register = async (name: string, email: string, username: string, password: string): Promise<ExtendedUser> => {
    console.log('AuthContext (Mock): Registering user -', { name, email, username });
    if (!name || !email || !username || !password) {
      toast.error('All fields are required for mock registration.');
      throw new Error('Validation Error: All fields are required.');
    }
    if (password.length < 6) {
      toast.error('Password must be at least 6 characters.');
      throw new Error('Validation Error: Password too short.');
    }
     if (!email.includes('@') || !email.includes('.')) {
      toast.error('Please enter a valid email address.');
      throw new Error('Validation Error: Invalid email format.');
    }

    const mockNewUser: ExtendedUser = {
      uid: `mock_uid_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`,
      email,
      name,
      username,
      bio: 'This is a mock bio. Edit your profile to change it!',
      socialLinks: { linkedin: '', twitter: '' },
      isAdmin: false,
      verificationStatus: {},
      updatedAt: new Date().toISOString(),
      displayName: name,
      photoURL: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(name)}`,
      emailVerified: true,
      isAnonymous: false,
    };
    persistUser(mockNewUser);
    setIsEditing(true);
    toast.success('Mock account created! You can now "edit" your profile.');
    return mockNewUser;
  };

  const login = async (email: string, password: string): Promise<void> => {
    console.log('AuthContext (Mock): Logging in user -', email);
    // Simple mock login: any non-empty email/password works for now, or define specific creds
    if (email && password) {
       if (email === 'admin@example.com' && password === 'admin123') {
        const mockAdminUser: ExtendedUser = {
            uid: 'mock_admin_uid',
            email,
            name: 'Mock Admin User',
            username: 'adminuser',
            bio: 'I am the mock admin.',
            socialLinks: {},
            isAdmin: true,
            displayName: 'Mock Admin',
            photoURL: `https://api.dicebear.com/7.x/initials/svg?seed=Admin`,
            emailVerified: true,
            isAnonymous: false,
            updatedAt: new Date().toISOString(),
        };
        persistUser(mockAdminUser);
        toast.success('Mock Admin login successful!');
        return;
      }

      const mockGenericUser: ExtendedUser = {
        uid: `mock_uid_${email.replace(/[^a-zA-Z0-9]/g, '')}`,
        email,
        name: 'Mock User',
        username: email.split('@')[0] || 'mockuser',
        bio: 'Logged in as a mock user.',
        socialLinks: {},
        isAdmin: false,
        displayName: 'Mock User',
        photoURL: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(email.split('@')[0] || 'User')}`,
        emailVerified: true,
        isAnonymous: false,
        updatedAt: new Date().toISOString(),
      };
      persistUser(mockGenericUser);
      toast.success('Mock login successful!');
    } else {
      toast.error('Mock login failed. Please enter email and password.');
      throw new Error('Mock login failed: Email and password required.');
    }
  };

  const logout = async (): Promise<void> => {
    console.log('AuthContext (Mock): Logging out user.');
    persistUser(null);
    setIsEditing(false);
    toast.success('Mock logout successful!');
  };

  const updateProfile = async (updatedData: Partial<ExtendedUser>): Promise<void> => {
    if (!currentUser) {
      toast.error('No mock user session to update.');
      throw new Error('No mock user session to update.');
    }
    console.log('AuthContext (Mock): Updating profile with -', updatedData);
    // Ensure critical fields like uid, email, username are not accidentally wiped if not in partial
    const newlyUpdatedUser: ExtendedUser = {
      ...currentUser,
      ...updatedData,
      updatedAt: new Date().toISOString(), // Always update timestamp
    };
    persistUser(newlyUpdatedUser);
    toast.success('Mock profile updated successfully!');
  };

  const findUserByUsername = async (username: string): Promise<ExtendedUser | null> => {
    console.log('AuthContext (Mock): Finding user by username -', username);
    // This is a very simple mock. For testing, if a user is logged in
    // and their username is queried, return them.
    // Otherwise, you might return a generic mock profile or null.
    if (currentUser && currentUser.username.toLowerCase() === username.toLowerCase()) {
      return currentUser;
    }
    // Simulate finding another user (for public profile pages, if any)
    // For now, let's return a generic mock if not the current user
     const otherMockUser: ExtendedUser = {
        uid: `mock_other_${username}`,
        email: `${username}@example.com`,
        name: username.charAt(0).toUpperCase() + username.slice(1),
        username: username,
        bio: `This is a mock profile for ${username}.`,
        socialLinks: {},
        isAdmin: false,
        displayName: username.charAt(0).toUpperCase() + username.slice(1),
        photoURL: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(username)}`,
        emailVerified: true,
        isAnonymous: false,
        updatedAt: new Date().toISOString(),
    };
    // return otherMockUser; // Uncomment this if you want to always return a mock user
    return null; // Or return null if no other user should be "found"
  };

  const markNotificationAsRead = (notificationId: string) => {
    setNotifications(prev =>
      prev.map(n => n.id === notificationId ? { ...n, read: true } : n)
    );
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
    findUserByUsername
  };

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
