import { NavLink, useNavigate } from 'react-router-dom';
import { BarChart3, Sticker, MessageCircle, Settings, LogOut } from 'lucide-react';
import { useAuthStore } from '@/features/auth/store/authStore';
import { supabase } from '@/services/supabaseClient';

const NAV_ITEMS = [
  { path: '/', label: 'Home', icon: null },
  { path: '/stats', label: 'Stats', icon: BarChart3 },
  { path: '/stickers', label: 'Stickers', icon: Sticker },
  { path: '/chat', label: 'Chat', icon: MessageCircle },
  { path: '/settings', label: 'Settings', icon: Settings },
];

export function NavBar() {
  const user = useAuthStore((s) => s.user);
  const navigate = useNavigate();

  const handleSignOut = async () => {
    if (!supabase) return;
    await supabase.auth.signOut();
    navigate('/login');
  };

  return (
    <nav className="sticky top-0 z-40 bg-white/80 backdrop-blur-lg border-b border-border">
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
        {/* Logo */}
        <NavLink to="/" className="flex items-center gap-2">
          <span className="text-xl font-extrabold text-primary">Lookie Dookie</span>
        </NavLink>

        {/* Desktop nav items */}
        <div className="hidden sm:flex items-center gap-1">
          {NAV_ITEMS.filter(item => item.path !== '/').map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-semibold transition-colors ${
                  isActive
                    ? 'bg-primary/15 text-primary'
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                }`
              }
            >
              {item.icon && <item.icon size={16} />}
              {item.label}
            </NavLink>
          ))}

          {/* User avatar / sign out */}
          {user && (
            <button
              onClick={handleSignOut}
              className="ml-2 flex items-center gap-1.5 px-3 py-2 rounded-full text-sm font-semibold text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
              title="Sign out"
            >
              <div className="w-6 h-6 rounded-full bg-primary/20 text-primary flex items-center justify-center text-xs font-bold">
                {user.email?.charAt(0).toUpperCase() ?? '?'}
              </div>
              <LogOut size={14} />
            </button>
          )}
        </div>
      </div>

      {/* Mobile bottom nav */}
      <div className="sm:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/90 backdrop-blur-lg border-t border-border flex items-center justify-around py-2">
        {NAV_ITEMS.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `flex flex-col items-center gap-0.5 px-3 py-1 rounded-xl text-xs font-semibold transition-colors ${
                isActive
                  ? 'text-primary'
                  : 'text-muted-foreground'
              }`
            }
          >
            {item.icon ? <item.icon size={18} /> : <span className="text-lg leading-none">🏠</span>}
            <span>{item.label}</span>
          </NavLink>
        ))}
      </div>
    </nav>
  );
}
