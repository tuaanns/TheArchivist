import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

// ProtectedRoute — requires auth, redirects to /auth preserving intended route
export const ProtectedRoute = ({ children }) => {
  const { token } = useAuth();
  const location = useLocation();

  if (!token) {
    // Save intended route to return after login
    return <Navigate to="/auth" state={{ from: location }} replace />;
  }

  return children;
};

