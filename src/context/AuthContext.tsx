import { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { toast } from 'sonner';

interface User {
  id: string;
  name: string;
  username: string;
  email: string;
  bio?: string;
  photoURL?: string;
  socialLinks: {
    twitter?: string;
    instagram?: string;
    linkedin?: string;
    facebook?: string;
    youtube?: string;
    tiktok?: string;
  };
  verificationStatus: {
    [key: string]: {
      status: 'unverified' | 'pending' | 'verified' | 'failed';
      verifiedAt?: string;
      code?: string;
      timestamp?: number;
    };
  };
}

interface AuthContextType {
  user: User | null;
  register: (name: string, email: string, username: string, password: string, invitationData?: any) => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  updateProfile: (data: Partial<User>) => void;
  inviteUser: (email: string, platforms: string[]) => Promise<void>;
  findUserByUsername: (username: string) => User | null;
}

const AuthContext = createContext<AuthContextType | null>(null);

// In-memory user storage
let users: User[] = [];

// Load users from localStorage on initialization
const loadUsers = () => {
  const storedUsers = localStorage.getItem('users');
  if (storedUsers) {
    users = JSON.parse(storedUsers);
  }
};

// Save users to localStorage
const saveUsers = () => {
  localStorage.setItem('users', JSON.stringify(users));
};

// Load users on initialization
loadUsers();

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);

  // Load current user from localStorage on initialization
  useEffect(() => {
    const storedUser = localStorage.getItem('currentUser');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  const register = async (name: string, email: string, username: string, password: string, invitationData?: any) => {
    try {
      // Check if email already exists
      if (users.some(u => u.email === email)) {
        toast.error('Email already registered');
        return;
      }

      // Create new user
      const newUser: User = {
        id: Math.random().toString(36).substr(2, 9),
        name,
        email,
        username,
        bio: '',
        socialLinks: {},
        verificationStatus: {
          twitter: { status: 'unverified' },
          instagram: { status: 'unverified' },
          linkedin: { status: 'unverified' },
          facebook: { status: 'unverified' },
          youtube: { status: 'unverified' },
          tiktok: { status: 'unverified' }
        }
      };

      // Add to users array
      users.push(newUser);
      
      // Save users to localStorage
      saveUsers();
      
      // Set as current user
      setUser(newUser);
      localStorage.setItem('currentUser', JSON.stringify(newUser));
    } catch (error) {
      toast.error('Failed to create account');
      throw error;
    }
  };

  const login = async (email: string, password: string) => {
    try {
      const foundUser = users.find(u => u.email === email);
      if (!foundUser) {
        toast.error('Invalid email or password');
        return;
      }
      setUser(foundUser);
      localStorage.setItem('currentUser', JSON.stringify(foundUser));
      toast.success('Welcome back!');
    } catch (error) {
      toast.error('Login failed');
      throw error;
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('currentUser');
  };

  const updateProfile = (data: Partial<User>) => {
    if (!user) return;
    
    const updatedUser = { ...user, ...data };
    setUser(updatedUser);
    localStorage.setItem('currentUser', JSON.stringify(updatedUser));
    
    // Update in users array
    const index = users.findIndex(u => u.id === user.id);
    if (index !== -1) {
      users[index] = updatedUser;
      saveUsers();
    }
  };

  const inviteUser = async (email: string, platforms: string[]) => {
    // For prototype, just show a success message
    toast.success(`Invitation sent to ${email}`);
  };

  const findUserByUsername = (username: string) => {
    return users.find(u => u.username === username) || null;
  };

  return (
    <AuthContext.Provider value={{ user, register, login, logout, updateProfile, inviteUser, findUserByUsername }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
