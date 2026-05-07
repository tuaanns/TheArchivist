import React, { useEffect } from 'react';
import { HashRouter, RouterProvider, createHashRouter, useNavigate, useLocation } from 'react-router-dom';
import { routes } from './router/routes';
import { GOOGLE_CLIENT_ID } from './lib/constants';
import { NotifyProvider } from './hooks/useNotify';

// Create router instance
const router = createHashRouter(routes);

// Legacy hash redirect component
const LegacyHashRedirect = () => {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // Handle legacy hash routes like /#payment, /#home, etc.
    const hash = window.location.hash;

    // Extract legacy view from hash (e.g., /#payment -> payment)
    const legacyMatch = hash.match(/^#\/?([^/]+)$/);

    if (legacyMatch) {
      const legacyView = legacyMatch[1];

      // Map legacy views to new routes
      const legacyMap = {
        'debate': '/',
        'home': '/',
        'lines': '/ceramics',
        'ceramics': '/ceramics',
        'history': '/history',
        'profile': '/profile',
        'payment': '/payment',
        'transaction_history': '/transactions',
        'transactions': '/transactions',
        'contact': '/contact',
        'about': '/about',
        'terms': '/terms',
        'privacy': '/privacy',
        'admin_dashboard': '/admin',
        'admin': '/admin',
      };

      const newPath = legacyMap[legacyView];

      if (newPath && location.pathname !== newPath) {
        console.log('[Legacy Redirect]', legacyView, '->', newPath);
        navigate(newPath, { replace: true });
      }
    }
  }, [navigate, location]);

  return null;
};

function App() {
  // Inject Google Identity Services script once
  useEffect(() => {
    if (document.getElementById('google-identity-script')) return;
    const script = document.createElement('script');
    script.id = 'google-identity-script';
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    document.head.appendChild(script);
  }, []);

  // Set Google client id meta
  useEffect(() => {
    let meta = document.querySelector('meta[name="google-signin-client_id"]');
    if (!meta) {
      meta = document.createElement('meta');
      meta.setAttribute('name', 'google-signin-client_id');
      document.head.appendChild(meta);
    }
    meta.setAttribute('content', GOOGLE_CLIENT_ID);
  }, []);

  return (
    <NotifyProvider>
      <RouterProvider router={router} />
    </NotifyProvider>
  );
}

export default App;

