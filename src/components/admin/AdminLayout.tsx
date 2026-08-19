import React from 'react';
import {
  Film,
  LayoutDashboard,
  Tv,
  Layers,
  Image as ImageIcon,
  Users,
  LogOut,
  ChevronRight,
  ArrowLeft,
  ShieldCheck,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export type AdminTab = 'dashboard' | 'movies' | 'series' | 'categories' | 'banners' | 'users';

interface AdminLayoutProps {
  activeTab: AdminTab;
  onSelectTab: (tab: AdminTab) => void;
  onExitToApp: () => void;
  children: React.ReactNode;
}

export const AdminLayout: React.FC<AdminLayoutProps> = ({
  activeTab,
  onSelectTab,
  onExitToApp,
  children,
}) => {
  const { user, logout } = useAuth();

  const navItems = [
    { id: 'dashboard' as AdminTab, label: 'Dashboard', icon: LayoutDashboard },
    { id: 'movies' as AdminTab, label: 'Manage Movies', icon: Film },
    { id: 'series' as AdminTab, label: 'Manage Web Series', icon: Tv },
    { id: 'categories' as AdminTab, label: 'Genres & Categories', icon: Layers },
    { id: 'banners' as AdminTab, label: 'Hero Banners', icon: ImageIcon },
    { id: 'users' as AdminTab, label: 'Registered Users', icon: Users },
  ];

  return (
    <div className="min-h-screen bg-[#050505] text-[#E0E0E0] flex flex-col md:flex-row font-sans">
      {/* Sidebar */}
      <aside className="w-full md:w-64 bg-[#0A0A0A] border-r border-white/10 shrink-0 flex flex-col justify-between">
        <div>
          {/* Brand header */}
          <div className="p-5 border-b border-white/10 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#C9A66B] to-[#8E6D3E] flex items-center justify-center text-black shadow-lg">
                <ShieldCheck className="w-5 h-5 stroke-[2.5]" />
              </div>
              <div>
                <h2 className="font-serif italic font-bold text-sm text-[#C9A66B] leading-tight">Admin Vault</h2>
                <span className="text-[10px] text-white/50 font-semibold tracking-widest uppercase">
                  Movie Hub Studio
                </span>
              </div>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="p-3 space-y-1">
            {navItems.map(item => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  id={`admin-nav-${item.id}`}
                  onClick={() => onSelectTab(item.id)}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition ${
                    isActive
                      ? 'bg-[#C9A66B] text-black shadow-md'
                      : 'text-white/60 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className={`w-4 h-4 ${isActive ? 'text-black' : 'text-white/50'}`} />
                    <span>{item.label}</span>
                  </div>
                  {isActive && <ChevronRight className="w-3.5 h-3.5" />}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Bottom Actions */}
        <div className="p-4 border-t border-white/10 space-y-2">
          <button
            onClick={onExitToApp}
            className="w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-white text-xs font-bold uppercase tracking-wider border border-white/10 transition"
          >
            <ArrowLeft className="w-3.5 h-3.5 text-[#C9A66B]" />
            <span>Return to User Website</span>
          </button>

          <button
            onClick={logout}
            className="w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl text-rose-400 hover:bg-rose-950/20 text-xs font-bold uppercase tracking-wider transition"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out ({user?.name.split(' ')[0]})</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 min-w-0 bg-[#050505] overflow-y-auto">
        {/* Top bar */}
        <header className="h-16 border-b border-white/10 px-6 flex items-center justify-between bg-[#0A0A0A]/80 backdrop-blur-md">
          <div className="flex items-center gap-2 text-xs text-white/50">
            <span>Movie Hub Management</span>
            <span>/</span>
            <span className="font-bold text-[#C9A66B] capitalize">{activeTab}</span>
          </div>

          <div className="flex items-center gap-3">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#C9A66B]/10 border border-[#C9A66B]/30 text-[#C9A66B] text-[10px] font-bold uppercase tracking-widest">
              <span className="w-1.5 h-1.5 rounded-full bg-[#C9A66B] animate-pulse" />
              Self-Contained DB Active
            </span>
            <img
              src={user?.profileImage || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&auto=format&fit=crop&q=80'}
              alt={user?.name || 'Admin'}
              className="w-8 h-8 rounded-lg object-cover border border-[#C9A66B]/40"
            />
          </div>
        </header>

        {/* Tab Body */}
        <div className="p-6 lg:p-8 max-w-7xl mx-auto">{children}</div>
      </main>
    </div>
  );
};
