import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { User, Home, Bell, MessageCircle, Share2, LogIn, UserPlus, Search, LogOut, Sun, Moon } from 'lucide-react';
import Logo from './Logo';
import { useAuth } from '@/context/AuthContext';
import { useNotifications } from '@/context/NotificationContext';
import { useTheme } from '@/context/ThemeContext';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { signOut } from 'firebase/auth';
import { auth } from '../lib/firebase';
import { toast } from 'sonner';

const Navbar: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);
  const { currentUser, loading } = useAuth();
  const { unreadBellCount, unreadMessageCount } = useNotifications();
  const { theme, toggleTheme } = useTheme();

  const isLandingPage = location.pathname === '/';
  const isAuthPage = ['/login', '/register'].includes(location.pathname);
  const isProfilePage = location.pathname === '/profile';

  useEffect(() => {
    const handleScroll = () => {
      const offset = window.scrollY;
      setScrolled(offset > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      toast('Goodbye', {
        description: 'You have been logged out',
        duration: 3000,
      });
      navigate('/login');
    } catch (error) {
      console.error("Logout Error:", error);
      toast('Error', {
        description: 'Failed to log out',
        duration: 3000,
      });
    }
  };

  const navLinks = [
    {
      name: 'Home',
      path: '/home',
      icon: <Home className="h-5 w-5" />
    }, 
    {
      name: 'Activity',
      path: '/notifications',
      icon: (
        <div className="relative">
          <Bell className="h-5 w-5" />
          {unreadBellCount > 0 && (
            <Badge 
              variant="default" 
              className="absolute -top-2 -right-2 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs"
            >
              {unreadBellCount}
            </Badge>
          )}
        </div>
      )
    }, 
    {
      name: 'Conversations',
      path: '/messages',
      icon: <MessageCircle className="h-5 w-5" />
    },
    {
      name: 'Invite',
      path: '/invite',
      icon: <Share2 className="h-5 w-5" />
    }
  ];

  if (loading) {
    return (
      <header className={cn('fixed top-0 left-0 right-0 z-50 w-full transition-all duration-300 bg-transparent py-5')}>
        <div className="mx-auto flex w-full max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link to="/" className="flex items-center gap-2.5">
            <Logo size={32} angle={135} />
            <span className="text-xl font-medium">Arena</span>
          </Link>
        </div>
      </header>
    );
  }

  return (
    <header className={cn('fixed top-0 left-0 right-0 z-50 w-full transition-all duration-300', scrolled ? 'glassmorphism py-3' : 'bg-transparent py-5')}>
      <div className="mx-auto flex w-full max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link to={currentUser && !isLandingPage && !isAuthPage ? "/home" : "/"} className="flex items-center gap-2.5">
          <Logo size={32} angle={135} />
          <span className="text-xl font-medium">Arena</span>
        </Link>

        {currentUser && !isLandingPage && !isAuthPage && (
          <div className="hidden md:block">
            <div className="relative flex items-center bg-muted/50 rounded-full px-3 py-1">
              <Search className="h-4 w-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search Arena..."
                className="ml-2 flex-1 bg-transparent outline-none placeholder:text-muted-foreground focus:ring-0"
              />
            </div>
          </div>
        )}

        {currentUser && !isLandingPage && !isAuthPage && (
          <nav className="hidden md:block">
            <ul className="flex items-center space-x-8">
              {navLinks.map((link) => (
                <li key={link.path}>
                  <Link
                    to={link.path}
                    className={cn(
                      "flex items-center gap-3 text-sm font-medium transition-colors hover:text-primary",
                      location.pathname === link.path ? "text-primary" : "text-foreground"
                    )}
                  >
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className={cn(
                        "rounded-full p-2 w-9 h-9 transition-all duration-200 flex items-center justify-center",
                        location.pathname === link.path ? "bg-muted/20 dark:bg-muted/50" : ""
                      )}
                      aria-label={link.name}
                    >
                      {link.name === 'Activity' ? (
                        <div className="relative flex items-center justify-center w-full h-full">
                          <Bell className={cn(
                            "transition-all duration-200",
                            location.pathname === link.path ? "h-[22px] w-[22px] text-primary" : "h-5 w-5 text-foreground"
                          )} />
                          {unreadBellCount > 0 && (
                            <Badge
                              variant="default"
                              className="absolute -top-2 -right-2 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs"
                            >
                              {unreadBellCount}
                            </Badge>
                          )}
                        </div>
                      ) : (
                        React.cloneElement(link.icon, {
                          className: cn(
                            "transition-all duration-200",
                            location.pathname === link.path ? "h-[22px] w-[22px] text-primary" : "h-5 w-5 text-foreground"
                          )
                        })
                      )}
                    </Button>
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        )}

        <div className="flex items-center space-x-4">
          {currentUser && !isLandingPage && !isAuthPage ? (
            <>
              <Link to="/profile" className={`nav-link ${isProfilePage ? 'profile-active' : ''}`}>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className={cn(
                    "rounded-full p-0 w-9 h-9 transition-all duration-200",
                    isProfilePage ? "bg-muted/20 dark:bg-muted/50" : ""
                  )} 
                  aria-label="Your profile"
                >
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={currentUser?.photoURL || undefined} />
                    <AvatarFallback>
                      {currentUser?.name ? currentUser.name.charAt(0).toUpperCase() : (currentUser?.email ? currentUser.email.charAt(0).toUpperCase() : <User className="h-4 w-4" />)}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </Link>
            </>
          ) : (!currentUser || isLandingPage) && (
            <>
              {!isAuthPage && (
                <>
                  <Link to="/login">
                    <Button variant="ghost" size="sm" className="button-effect font-display">
                      Log in
                    </Button>
                  </Link>
                  <Link to="/register">
                    <Button variant="default" size="sm" className="button-effect font-display">
                      Sign up
                    </Button>
                  </Link>
                </>
              )}
            </>
          )}
          <Button variant="ghost" size="sm" onClick={toggleTheme}>
            {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
          </Button>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
