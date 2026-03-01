import { createBrowserRouter } from 'react-router-dom';
import { Layout } from '@/shared/components/Layout';
import { AuthGuard } from '@/features/auth/components/AuthGuard';
import { LoginPage } from '@/features/auth/components/LoginPage';
import { HomePage, StatsPage, StickersPage, ChatPage, SettingsPage } from '@/pages';

export const router = createBrowserRouter([
  // Public route
  { path: '/login', element: <LoginPage /> },

  // Protected routes
  {
    element: (
      <AuthGuard>
        <Layout />
      </AuthGuard>
    ),
    children: [
      { path: '/', element: <HomePage /> },
      { path: '/stats', element: <StatsPage /> },
      { path: '/stickers', element: <StickersPage /> },
      { path: '/chat', element: <ChatPage /> },
      { path: '/settings', element: <SettingsPage /> },
    ],
  },
]);
