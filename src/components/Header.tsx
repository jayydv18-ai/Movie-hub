import React, { useState, useRef, useEffect } from 'react';
import { Film, Search, Bookmark, User as UserIcon, Shield, LogOut, ChevronDown } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useWatchlist } from '../context/WatchlistContext';

interface HeaderProps {
  currentView: string;
  onNavigate: (view: string, data?: any) => void;
  onOpenSearch: () => void;
  onOpenAuth: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentView,
  onNavigate,
  onOpenSearch,
  onOpenAuth,
}) => {
  const { user, isAdmin, logout } = useAuth();
  const { watchlist } = useWatchlist();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const navItems = [
    { id: 'home', label: 'Home' },
    { id: 'movies', label: 'Movies' },
    { id: 'series', label: 'Web Series' },
    { id: 'categories', label: 'Categories' },
    { id: 'trending', label: 'Trending' },
  ];

  return (
    <header
      id="main-header"
      className="sticky top-0 z-40 w-full bg-[#0A0A0A]/95 backdrop-blur-xl border-b border-white/10 transition-all"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Left: Brand Logo & Navigation */}
        <div className="flex items-center gap-8 lg:gap-10">
          <button
            id="header-brand-logo"
            onClick={() => onNavigate('home')}
            className="flex items-center gap-2.5 group text-left focus:outline-none"
          >
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#C9A66B] to-[#8E6D3E] flex items-center justify-center text-black shadow-md shadow-amber-950/40 group-hover:scale-105 transition">
              <Film className="w-4 h-4 text-black stroke-[2.5]" />
            </div>
            <div className="flex flex-col">
              <span className="text-xl font-serif italic tracking-tighter text-[#C9A66B] font-bold leading-none">
                MOVIE HUB
              </span>
              <span className="text-[9px] uppercase tracking-[0.25em] text-white/40 font-semibold mt-0.5">
                Curated Cinema
              </span>
            </div>
          </button>

          {/* Desktop Navigation links */}
          <nav className="hidden md:flex items-center gap-6 text-xs uppercase tracking-widest font-medium">
            {navItems.map(item => (
              <button
                key={item.id}
                id={`nav-link-${item.id}`}
                onClick={() => onNavigate(item.id)}
                className={`transition-colors py-1 ${
                  currentView === item.id
                    ? 'text-white border-b-2 border-[#C9A66B] font-bold'
                    : 'text-white/60 hover:text-white'
                }`}
              >
                {item.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Right Action Icons & Profile */}
        <div className="flex items-center gap-3 sm:gap-4">
          {/* Quick Search Button */}
          <button
            id="header-search-trigger"
            onClick={onOpenSearch}
            className="flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-white/5 hover:bg-white/10 text-white/60 hover:text-white border border-white/10 hover:border-[#C9A66B]/50 text-xs font-medium transition"
            title="Search movies and series (Ctrl+K)"
          >
            <Search className="w-3.5 h-3.5 text-[#C9A66B]" />
            <span className="hidden sm:inline">Search cinema...</span>
            <kbd className="hidden lg:inline-block px-1.5 py-0.5 text-[9px] bg-black/50 text-white/40 rounded border border-white/10 uppercase font-mono">
              ⌘K
            </kbd>
          </button>

          {/* Watchlist Quick Access */}
          <button
            id="header-watchlist-btn"
            onClick={() => onNavigate('profile', { tab: 'watchlist' })}
            className="relative p-2 rounded-full bg-white/5 hover:bg-white/10 text-white/70 hover:text-white border border-white/10 transition"
            title="My Watchlist"
          >
            <Bookmark className="w-4 h-4" />
            {watchlist.length > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-[#C9A66B] text-black text-[9px] font-bold flex items-center justify-center shadow-md">
                {watchlist.length}
              </span>
            )}
          </button>

          {/* Admin Fast Access Badge (if admin) */}
          {isAdmin && (
            <button
              id="header-admin-portal-btn"
              onClick={() => onNavigate('admin')}
              className="hidden sm:flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white/5 hover:bg-white/10 border border-[#C9A66B]/40 text-[#C9A66B] text-xs font-bold uppercase tracking-tight transition"
            >
              <Shield className="w-3.5 h-3.5 text-[#C9A66B]" />
              <span>Admin Panel</span>
            </button>
          )}

          {/* User Profile / Login dropdown */}
          {user ? (
            <div className="relative" ref={dropdownRef}>
              <button
                id="user-profile-menu-btn"
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="flex items-center gap-2 p-1 pl-1.5 pr-2.5 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 transition"
              >
                <img
                  src={user.profileImage}
                  alt={user.name}
                  className="w-7 h-7 rounded-full object-cover border border-[#C9A66B]/50"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80';
                  }}
                />
                <span className="hidden md:inline text-xs font-medium text-white/90 max-w-[100px] truncate">
                  {user.name.split(' ')[0]}
                </span>
                <ChevronDown className="w-3.5 h-3.5 text-white/40" />
              </button>

              {dropdownOpen && (
                <div
                  id="user-profile-dropdown"
                  className="absolute right-0 mt-2 w-56 bg-[#0A0A0A] border border-white/15 rounded-2xl shadow-2xl py-2 z-50 animate-fade-in"
                >
                  <div className="px-4 py-2 border-b border-white/10">
                    <p className="text-sm font-serif italic text-white truncate">{user.name}</p>
                    <p className="text-xs text-white/50 truncate">{user.email}</p>
                    <span className="inline-block mt-1 px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-widest bg-[#C9A66B] text-black">
                      {user.role}
                    </span>
                  </div>

                  <button
                    onClick={() => {
                      onNavigate('profile');
                      setDropdownOpen(false);
                    }}
                    className="w-full px-4 py-2 text-left text-xs text-white/70 hover:text-white hover:bg-white/5 flex items-center gap-2.5 transition"
                  >
                    <UserIcon className="w-4 h-4 text-[#C9A66B]" />
                    <span>My Profile & Vault</span>
                  </button>

                  <button
                    onClick={() => {
                      onNavigate('profile', { tab: 'watchlist' });
                      setDropdownOpen(false);
                    }}
                    className="w-full px-4 py-2 text-left text-xs text-white/70 hover:text-white hover:bg-white/5 flex items-center gap-2.5 transition"
                  >
                    <Bookmark className="w-4 h-4 text-[#C9A66B]" />
                    <span>Watchlist ({watchlist.length})</span>
                  </button>

                  {isAdmin && (
                    <button
                      onClick={() => {
                        onNavigate('admin');
                        setDropdownOpen(false);
                      }}
                      className="w-full px-4 py-2 text-left text-xs text-[#C9A66B] hover:text-white hover:bg-white/5 flex items-center gap-2.5 transition"
                    >
                      <Shield className="w-4 h-4 text-[#C9A66B]" />
                      <span>Admin Console</span>
                    </button>
                  )}

                  <div className="my-1 border-t border-white/10" />

                  <button
                    onClick={() => {
                      logout();
                      setDropdownOpen(false);
                    }}
                    className="w-full px-4 py-2 text-left text-xs text-rose-400 hover:text-rose-300 hover:bg-rose-950/20 flex items-center gap-2.5 transition"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Sign Out</span>
                  </button>
                </div>
              )}
            </div>
          ) : (
            <button
              id="header-login-btn"
              onClick={onOpenAuth}
              className="px-5 py-2 rounded-full bg-[#C9A66B] hover:bg-[#b8955a] text-black text-xs font-bold uppercase tracking-wider shadow-lg shadow-amber-950/30 transition duration-200"
            >
              Sign In
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
