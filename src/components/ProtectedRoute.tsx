import React, { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext'; // Adjust path if needed

interface ProtectedRouteProps {
  children: ReactNode; // The component/page to render if authenticated
  requireAdmin?: boolean;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, requireAdmin = false }) => {
  const { currentUser, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    // Optional: Show a loading spinner or similar while auth state is being determined
    // For simplicity, we can render null or a simple message
    return <div>Loading...</div>; // Or return null;
  }

  if (!currentUser) {
    // User is not logged in, redirect them to the login page.
    // Pass the current location in state so we can redirect back after login (optional)
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Check for admin access if required
  if (requireAdmin && !currentUser.isAdmin) {
    return <Navigate to="/" replace />;
  }

  // User is logged in, render the children component (the protected page)
  return <>{children}</>;
};

export default ProtectedRoute; 