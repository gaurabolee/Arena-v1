import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import TransitionWrapper from '@/components/TransitionWrapper'; // Assuming you want consistent transitions
import Navbar from '@/components/Navbar'; // Assuming you want the Navbar here too
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { auth } from '../lib/firebase';
import { toast } from 'sonner'; // Using toast for feedback consistency
import { useAuth } from '@/context/AuthContext';

// We don't need separate inline styles now as we use UI library components

const SignUp: React.FC = () => {
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState(''); // Added confirm password state
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { register } = useAuth();

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validation
    if (!name || !username || !email || !password || !confirmPassword) {
      setError('Please fill in all fields.');
      toast.error('Please fill in all fields.');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      toast.error('Passwords do not match.');
      return;
    }
    if (password.length < 6) {
      setError('Password should be at least 6 characters long.');
      toast.error('Password should be at least 6 characters long.');
      return;
    }

    setLoading(true);
    try {
      // Use the register function from AuthContext which handles both Firebase Auth and user data
      await register(name, email, username, password);
      
      toast.success('Account created successfully!');
      
      // Navigate to profile page
      navigate('/profile', {
        replace: true,
        state: {
          openEditMode: true
        }
      });
    } catch (err: any) {
      console.error('Sign up error:', err);
      let friendlyError = 'Failed to create account. Please try again.';
      if (err.code === 'auth/email-already-in-use') {
        friendlyError = 'This email address is already registered.';
      } else if (err.code === 'auth/weak-password') {
        friendlyError = 'Password should be at least 6 characters long.';
      } else if (err.code === 'auth/invalid-email') {
        friendlyError = 'Please enter a valid email address.';
      }
      setError(friendlyError);
      toast.error(friendlyError);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Navbar />
      <TransitionWrapper animation="slide-up" className="min-h-screen pt-20 pb-10 px-4">
        <div className="max-w-md mx-auto pt-10">
          {/* Using Card structure similar to Login.tsx */}
          <Card className="border-0 shadow-subtle overflow-hidden">
            <CardHeader className="space-y-1 text-center">
              <CardTitle className="text-2xl font-medium">Create an Account</CardTitle>
              <CardDescription>
                Join the Arena! Fill in your details below.
              </CardDescription>
            </CardHeader>

            <form onSubmit={handleSignUp}>
              <CardContent className="space-y-4">
                 {/* Display error message */} 
                {error && <p className="text-sm text-red-600 text-center">{error}</p>}

                {/* Name Input */}
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  <Input
                    id="name"
                    name="name"
                    placeholder="Your full name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="input-effect"
                    required
                  />
                </div>

                {/* Username Input */}
                <div className="space-y-2">
                  <Label htmlFor="username">Username</Label>
                  <Input
                    id="username"
                    name="username"
                    placeholder="Choose a unique username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value.toLowerCase())} // Force lowercase?
                    className="input-effect"
                    required
                  />
                </div>

                {/* Email Input */}
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="input-effect"
                    required
                  />
                </div>

                {/* Password Input */}
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    name="password"
                    type="password"
                    placeholder="•••••••• (min. 6 characters)"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="input-effect"
                    required
                  />
                </div>

                {/* Confirm Password Input */}
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirm Password</Label>
                  <Input
                    id="confirmPassword"
                    name="confirmPassword"
                    type="password"
                    placeholder="••••••••"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="input-effect"
                    required
                  />
                </div>
              </CardContent>

              <CardFooter className="flex flex-col space-y-4">
                <Button
                  type="submit"
                  className="w-full rounded-md button-effect"
                  disabled={loading}
                >
                  {loading ? 'Creating Account...' : 'Sign Up'}
                </Button>

                <div className="text-center text-sm text-muted-foreground">
                  Already have an account?{' '}
                  <Link
                    to="/login" // Link to Login page
                    className="text-primary underline-offset-4 transition-colors hover:underline"
                  >
                    Log in
                  </Link>
                </div>
              </CardFooter>
            </form>
          </Card>
        </div>
      </TransitionWrapper>
    </>
  );
};

export default SignUp; 