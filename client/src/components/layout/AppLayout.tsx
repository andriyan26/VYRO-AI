import React from 'react';
import { Outlet, NavLink, useNavigate, useLocation } from 'react-router-dom';
import {
  Home,
  Compass,
  PlusSquare,
  Film,
  MessageCircle,
  Bell,
  User as UserIcon,
  LayoutDashboard,
  ShieldAlert,
  LogOut,
  Sparkles,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const AppLayout: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const isEditorPage = location.pathname.startsWith('/editor');

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navItems = [
    { label: 'For You', path: '/', icon: Home },
    { label: 'Explore', path: '/explore', icon: Compass },
    { label: 'Upload Video', path: '/upload', icon: PlusSquare, creatorOnly: true },
    { label: 'Video Editor', path: '/editor', icon: Film, creatorOnly: true },
    { label: 'Messages', path: '/messages', icon: MessageCircle },
    { label: 'Notifications', path: '/notifications', icon: Bell },
    { label: 'Profile', path: user ? `/profile/${user.username}` : '/login', icon: UserIcon },
  ];

  return (
    <div className="flex h-[100dvh] w-screen overflow-hidden bg-[#07080c] text-white">
      {/* DESKTOP SIDEBAR */}
      <aside className="hidden md:flex flex-col w-64 lg:w-72 border-r border-white/10 bg-[#090b12]/95 backdrop-blur-2xl p-5 select-none shrink-0 z-30 justify-between shadow-2xl">
        <div className="space-y-6">
          {/* Brand Logo with Glowing Orb */}
          <NavLink to="/" className="flex items-center gap-3 px-2 group">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-amber-500 via-amber-400 to-yellow-300 shadow-[0_0_20px_rgba(245,158,11,0.5)] flex items-center justify-center transition-transform group-hover:scale-105">
              <Sparkles className="w-5 h-5 text-stone-950 stroke-[2.5]" />
            </div>
            <div>
              <div className="flex items-center gap-1.5 font-extrabold text-xl tracking-tight text-white font-sans">
                VYRO <span className="text-amber-400">AI</span>
              </div>
              <p className="text-[10px] text-stone-400 tracking-wider uppercase font-semibold">Create • Connect • Inspire</p>
            </div>
          </NavLink>

          {/* Navigation Links */}
          <nav className="space-y-1.5 pt-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  end={item.path === '/'}
                  className={({ isActive }) =>
                    `flex items-center gap-3.5 px-4 py-3 rounded-2xl text-sm font-bold transition-all ${
                      isActive
                        ? 'bg-gradient-to-r from-amber-500/20 to-amber-500/5 text-amber-300 border border-amber-500/40 shadow-[0_0_20px_rgba(245,158,11,0.2)]'
                        : 'text-stone-400 hover:text-white hover:bg-white/[0.04]'
                    }`
                  }
                >
                  <Icon className="w-5 h-5" />
                  <span>{item.label}</span>
                </NavLink>
              );
            })}

            {/* Creator Studio link (Only for Creators & Admin) */}
            {(user?.role === 'CREATOR' || user?.role === 'ADMIN') && (
              <NavLink
                to="/creator"
                className={({ isActive }) =>
                  `flex items-center gap-3.5 px-4 py-3 rounded-2xl text-sm font-bold transition-all ${
                    isActive
                      ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-[0_0_15px_rgba(245,158,11,0.2)]'
                      : 'text-stone-400 hover:text-white hover:bg-white/[0.04]'
                  }`
                }
              >
                <LayoutDashboard className="w-5 h-5 text-amber-400" />
                <span className="flex items-center gap-2">
                  Creator Studio
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-500/30 text-amber-300 font-bold border border-amber-500/40">
                    PRO
                  </span>
                </span>
              </NavLink>
            )}

            {/* Admin Dashboard link (Only for Superadmins) */}
            {user?.role === 'ADMIN' && (
              <NavLink
                to="/admin"
                className={({ isActive }) =>
                  `flex items-center gap-3.5 px-4 py-3 rounded-2xl text-sm font-bold transition-all ${
                    isActive
                      ? 'bg-red-500/20 text-red-300 border border-red-500/40 shadow-[0_0_15px_rgba(239,68,68,0.2)]'
                      : 'text-red-400 hover:text-red-300 hover:bg-red-500/10'
                  }`
                }
              >
                <ShieldAlert className="w-5 h-5" />
                <span>Admin Panel</span>
              </NavLink>
            )}
          </nav>
        </div>

        {/* User Card & Logout */}
        <div className="pt-4 border-t border-white/10 space-y-3">
          {user ? (
            <div className="flex items-center justify-between p-2.5 rounded-2xl bg-white/[0.03] border border-white/10 shadow">
              <div className="flex items-center gap-2.5 overflow-hidden">
                <img
                  src={user.avatarUrl || `https://api.dicebear.com/7.x/bottts/svg?seed=${user.username}`}
                  alt={user.fullName}
                  className="w-9 h-9 rounded-full object-cover border border-amber-400/50"
                />
                <div className="truncate">
                  <div className="text-xs font-bold text-white truncate flex items-center gap-1">
                    {user.fullName}
                    {user.isVerified && <span className="text-amber-400 text-[10px]">✓</span>}
                  </div>
                  <div className="text-[11px] text-stone-400 truncate">@{user.username}</div>
                </div>
              </div>
              <button
                onClick={handleLogout}
                title="Log out"
                className="p-1.5 rounded-lg text-stone-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors cursor-pointer"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <NavLink
              to="/login"
              className="w-full py-2.5 px-4 rounded-xl text-center text-xs font-bold text-stone-950 bg-gradient-to-r from-amber-400 to-yellow-400 hover:from-amber-300 transition-all flex items-center justify-center gap-2 shadow-lg"
            >
              Sign In to VYRO AI
            </NavLink>
          )}
        </div>
      </aside>

      {/* MAIN VIEWPORT */}
      <main className="flex-1 flex flex-col h-full overflow-hidden relative">
        <div className="flex-1 overflow-y-auto overflow-x-hidden relative">
          <Outlet />
        </div>

        {/* MOBILE BOTTOM NAVIGATION BAR (Hidden on Studio Editor so editor gets 100% viewport) */}
        {!isEditorPage && (
          <div className="md:hidden flex items-center justify-around bg-[#0a0d17]/95 backdrop-blur-2xl border-t border-amber-500/20 pt-2 pb-[max(env(safe-area-inset-bottom),0.75rem)] px-3 z-40 select-none shadow-[0_-5px_30px_rgba(0,0,0,0.85)]">
            <NavLink
              to="/"
              end
              className={({ isActive }) =>
                `flex flex-col items-center gap-1 text-[10px] font-bold transition-all ${
                  isActive ? 'text-amber-400 drop-shadow-[0_0_10px_rgba(245,158,11,0.6)] scale-105' : 'text-stone-400 hover:text-stone-200'
                }`
              }
            >
              <Home className="w-5 h-5 stroke-[2.2]" />
              <span>Feed</span>
            </NavLink>

            <NavLink
              to="/explore"
              className={({ isActive }) =>
                `flex flex-col items-center gap-1 text-[10px] font-bold transition-all ${
                  isActive ? 'text-amber-400 drop-shadow-[0_0_10px_rgba(245,158,11,0.6)] scale-105' : 'text-stone-400 hover:text-stone-200'
                }`
              }
            >
              <Compass className="w-5 h-5 stroke-[2.2]" />
              <span>Explore</span>
            </NavLink>

            {/* Plus / Create Button */}
            <NavLink
              to="/upload"
              className="flex items-center justify-center w-12 h-8 rounded-xl bg-gradient-to-tr from-amber-500 via-amber-400 to-yellow-300 text-stone-950 shadow-[0_0_16px_rgba(245,158,11,0.5)] active:scale-90 transition-transform"
              title="Upload / Buat Video"
            >
              <PlusSquare className="w-5 h-5 stroke-[2.6]" />
            </NavLink>

            <NavLink
              to="/messages"
              className={({ isActive }) =>
                `flex flex-col items-center gap-1 text-[10px] font-bold transition-all ${
                  isActive ? 'text-amber-400 drop-shadow-[0_0_10px_rgba(245,158,11,0.6)] scale-105' : 'text-stone-400 hover:text-stone-200'
                }`
              }
            >
              <MessageCircle className="w-5 h-5 stroke-[2.2]" />
              <span>Inbox</span>
            </NavLink>

            <NavLink
              to={user ? `/profile/${user.username}` : '/login'}
              className={({ isActive }) =>
                `flex flex-col items-center gap-1 text-[10px] font-bold transition-all ${
                  isActive ? 'text-amber-400 drop-shadow-[0_0_10px_rgba(245,158,11,0.6)] scale-105' : 'text-stone-400 hover:text-stone-200'
                }`
              }
            >
              {user?.avatarUrl ? (
                <img
                  src={user.avatarUrl}
                  alt={user.username}
                  className="w-5 h-5 rounded-full object-cover border border-amber-400 shadow-[0_0_8px_rgba(245,158,11,0.4)]"
                />
              ) : (
                <UserIcon className="w-5 h-5 stroke-[2.2]" />
              )}
              <span>Profile</span>
            </NavLink>
          </div>
        )}
      </main>
    </div>
  );
};

