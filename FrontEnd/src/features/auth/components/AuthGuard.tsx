import type { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { supabase } from '@/services/supabaseClient';

interface AuthGuardProps {
  children: ReactNode;
}

/**
 * Protects routes by requiring authentication.
 * When Supabase is not configured, passes through (local-only mode).
 */
export function AuthGuard({ children }: AuthGuardProps) {
  const user = useAuthStore((s) => s.user);
  const loading = useAuthStore((s) => s.loading);
  const initialized = useAuthStore((s) => s.initialized);

  // No Supabase — skip auth entirely
  if (!supabase) return <>{children}</>;

  // Still loading auth state
  if (!initialized || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  // Not authenticated — redirect to login
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}
