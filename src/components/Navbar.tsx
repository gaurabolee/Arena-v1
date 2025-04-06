import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { User, Home, Bell, MessageCircle, Share2, LogIn, UserPlus, Search } from 'lucide-react';
import Logo from './Logo';
import { useAuth } from '@/context/AuthContext';
import { useNotifications } from '@/context/NotificationContext';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';

const Navbar: React.FC = () => {
  const location = useLocation();
  const [scrolled, setScrolled] = useState(false);
  const { user } = useAuth();
  const { unreadBellCount, unreadMessageCount } = useNotifications();

  // Check if current page is landing, login or register
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

  // Navigation links with icons
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

  return (
    <header className={cn('fixed top-0 left-0 right-0 z-50 w-full transition-all duration-300', scrolled ? 'glassmorphism py-3' : 'bg-transparent py-5')}>
      <div className="mx-auto flex w-full max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2.5">
          <Logo size={32} angle={135} />
          <span className="text-xl font-medium">Arena</span>
        </Link>

        {/* Search Bar - only show if authenticated and not on landing/auth pages */}
        {user && !isLandingPage && !isAuthPage && (
          <div className="hidden md:block">
            <div className="relative flex items-center bg-muted/50 rounded-full px-3 py-1">
              <Search className="h-4 w-4 text-muted-foreground" />
              <input
                type="text"
                placeholder=""
                className="ml-2 flex-1 bg-transparent outline-none placeholder:text-muted-foreground focus:ring-0"
              />
            </div>
          </div>
        )}

        {/* Navigation - only show if authenticated and not on landing/auth pages */}
        {user && !isLandingPage && !isAuthPage && (
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
                        "rounded-full p-2 w-9 h-9 transition-all duration-200",
                        location.pathname === link.path ? "bg-gray-200" : ""
                      )}
                      aria-label={link.name}
                    >
                      {React.cloneElement(link.icon, {
                        className: cn(
                          "transition-all duration-200",
                          location.pathname === link.path ? "h-[22px] w-[22px] text-primary" : "h-5 w-5 text-foreground"
                        )
                      })}
                    </Button>
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        )}

        {/* Auth buttons */}
        <div className="flex items-center space-x-4">
          {user && !isLandingPage && !isAuthPage ? (
            <Link to="/profile" className={`nav-link ${isProfilePage ? 'profile-active' : ''}`}>
              <Button 
                variant="ghost" 
                size="sm" 
                className={cn(
                  "rounded-full p-0 w-9 h-9 transition-all duration-200",
                  isProfilePage ? "bg-gray-200" : ""
                )} 
                aria-label="Your profile"
              >
                <Avatar className="h-8 w-8">
                  <AvatarImage src={user?.photoURL || undefined} />
                  <AvatarFallback>
                    {user?.name ? user.name.charAt(0).toUpperCase() : <User className="h-4 w-4" />}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </Link>
          ) : (!user || isLandingPage) && (
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
        </div>
      </div>
    </header>
  );
};

export default Navbar;
