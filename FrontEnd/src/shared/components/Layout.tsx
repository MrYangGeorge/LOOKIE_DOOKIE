import { Outlet } from 'react-router-dom';
import { NavBar } from './NavBar';
import { useDetection } from '@/features/detection/hooks/useDetection';
import { useNavigationGuard } from '@/features/detection/hooks/useNavigationGuard';
import { DrowsinessOverlay } from '@/features/detection/components/DrowsinessOverlay';

export function Layout() {
  useDetection();
  useNavigationGuard();

  return (
    <div className="min-h-screen bg-background">
      <NavBar />
      <main className="pb-20 sm:pb-8">
        <Outlet />
      </main>
      <DrowsinessOverlay />
    </div>
  );
}
