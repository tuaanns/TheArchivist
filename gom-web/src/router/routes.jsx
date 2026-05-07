import React from 'react';
import { Navigate } from 'react-router-dom';

// Layouts
import { AuthLayout } from '../components/layout/AuthLayout';
import { AppLayout } from '../components/layout/AppLayout';

// Auth
import { NewAuthShell } from '../components/auth/NewAuthShell';

// Features
import { AnalysisPageWrapper } from '../features/analysis/AnalysisPageWrapper';
import { CeramicsPageWrapper } from '../features/ceramics/CeramicsPageWrapper';
import { HistoryPageWrapper } from '../features/history/HistoryPageWrapper';
import { ProfilePageWrapper } from '../features/profile/ProfilePageWrapper';
import { PaymentPageWrapper } from '../features/payment/PaymentPageWrapper';
import { TransactionsPageWrapper } from '../features/transactions/TransactionsPageWrapper';
import { ContactPageWrapper } from '../features/contact/ContactPageWrapper';
import { AboutPage } from '../features/about/AboutPage';
import { TermsPage } from '../features/legal/TermsPage';
import { PrivacyPage } from '../features/legal/PrivacyPage';
import { AdminLayout } from '../features/admin/AdminLayout';
import { DashboardPageWrapper } from '../features/admin/pages/DashboardPageWrapper';
import { UsersPageWrapper } from '../features/admin/pages/UsersPageWrapper';
import { CeramicsPageWrapper as AdminCeramicsPageWrapper } from '../features/admin/pages/CeramicsPageWrapper';
import { PaymentsPageWrapper } from '../features/admin/pages/PaymentsPageWrapper';
import { PredictionsPageWrapper } from '../features/admin/pages/PredictionsPageWrapper';
import { TokenHistoryPageWrapper } from '../features/admin/pages/TokenHistoryPageWrapper';

// Guards
import { ProtectedRoute } from './ProtectedRoute';
import { GuestOnlyRoute } from './GuestOnlyRoute';
import { AdminRoute } from './AdminRoute';

// 404
import { NotFoundPage } from '../features/errors/NotFoundPage';
import { UnauthorizedPage } from '../features/errors/UnauthorizedPage';

// Route configuration — HashRouter for static hosting compatibility
export const routes = [
  // ── Auth Routes (guest-only) ──
  {
    path: '/auth',
    element: <GuestOnlyRoute />,
    children: [
      {
        element: <AuthLayout />,
        children: [
          {
            index: true,
            element: <NewAuthShell />,
          },
        ],
      },
    ],
  },

  // ── Admin Routes (separate layout, no header/footer) ──
  {
    path: '/admin',
    element: <AdminRoute />,
    children: [
      {
        element: <AdminLayout />,
        children: [
          {
            index: true,
            element: <DashboardPageWrapper />,
          },
          {
            path: 'users',
            element: <UsersPageWrapper />,
          },
          {
            path: 'ceramics',
            element: <AdminCeramicsPageWrapper />,
          },
          {
            path: 'payments',
            element: <PaymentsPageWrapper />,
          },
          {
            path: 'predictions',
            element: <PredictionsPageWrapper />,
          },
          {
            path: 'token-history',
            element: <TokenHistoryPageWrapper />,
          },
        ],
      },
    ],
  },

  // ── App Routes (protected + public) ──
  {
    path: '/',
    element: <AppLayout />,
    children: [
      // Home - protected, requires auth
      {
        index: true,
        element: (
          <ProtectedRoute>
            <AnalysisPageWrapper />
          </ProtectedRoute>
        ),
      },

      // Protected routes
      {
        path: 'history',
        element: (
          <ProtectedRoute>
            <HistoryPageWrapper />
          </ProtectedRoute>
        ),
      },
      {
        path: 'profile',
        element: (
          <ProtectedRoute>
            <ProfilePageWrapper />
          </ProtectedRoute>
        ),
      },
      {
        path: 'payment',
        element: (
          <ProtectedRoute>
            <PaymentPageWrapper />
          </ProtectedRoute>
        ),
      },
      {
        path: 'transactions',
        element: (
          <ProtectedRoute>
            <TransactionsPageWrapper />
          </ProtectedRoute>
        ),
      },

      // Public routes (accessible without auth)
      {
        path: 'ceramics',
        element: <CeramicsPageWrapper />,
      },
      {
        path: 'contact',
        element: <ContactPageWrapper />,
      },
      {
        path: 'about',
        element: <AboutPage />,
      },
      {
        path: 'terms',
        element: <TermsPage />,
      },
      {
        path: 'privacy',
        element: <PrivacyPage />,
      },

      // Error pages
      {
        path: 'unauthorized',
        element: <UnauthorizedPage />,
      },
      {
        path: '*',
        element: <NotFoundPage />,
      },
    ],
  },
];

