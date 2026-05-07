import React from 'react';
import { Outlet } from 'react-router-dom';
import { Aurora } from '../ui/Aurora';
import './AuthLayout.css';

// AuthLayout — full-screen layout for auth pages with Aurora animated background
export const AuthLayout = () => {
  return (
    <div className="auth-layout">
      {/* Aurora Background - only for auth */}
      <div className="auth-layout-aurora">
        <Aurora colorStops={['#0F265C', '#D4AF37', '#F7F1E8', '#9A6A4F']} />
      </div>

      {/* Decorative Elements */}
      <div className="auth-layout-grid" />
      <div className="auth-layout-glow auth-layout-glow-1" />
      <div className="auth-layout-glow auth-layout-glow-2" />

      {/* Content */}
      <div className="auth-layout-content">
        <Outlet />
      </div>
    </div>
  );
};

