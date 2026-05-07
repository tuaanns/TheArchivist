import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

// AdminRoute — requires auth + admin role, redirects accordingly
export const AdminRoute = () => {
  const { token, user } = useAuth();

  if (!token) {
    return <Navigate to="/auth" replace />;
  }

  if (user?.role !== 'admin') {
    return <Navigate to="/unauthorized" replace />;
  }

  return <Outlet />;
};

