import React from 'react';
import { Home, Film, Tv, Search, User } from 'lucide-react';

interface MobileNavProps {
  currentView: string;
  onNavigate: (view: string, data?: any) => void;
  onOpenSearch: () => void;
  onOpenAuth: () => void;
  isLoggedIn: boolean;
}

export const MobileNav: React.FC<MobileNavProps> = ({
  currentView,
  onNavigate,
  onOpenSearch,
  onOpenAuth,
  isLoggedIn,
}) => {
  return (
    <nav
      id="mobile-bottom-navigation"
      className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-slate-950/95 backdrop-blur-xl border-t border-slate-800/90 px-3 py-2 flex items-center justify-around shadow-2xl"
    >
      <button
        id="mobile-nav-home"
        onClick={() => onNavigate('home')}
        className={`flex flex-col items-center gap-1 py-1 px-2.5 rounded-lg text-[10px] font-medium transition ${
          currentView === 'home' ? 'text-cyan-400 font-bold' : 'text-slate-400 hover:text-slate-200'
        }`}
      >
        <Home className={`w-5 h-5 ${currentView === 'home' ? 'text-cyan-400' : ''}`} />
        <span>Home</span>
      </button>

      <button
        id="mobile-nav-movies"
        onClick={() => onNavigate('movies')}
        className={`flex flex-col items-center gap-1 py-1 px-2.5 rounded-lg text-[10px] font-medium transition ${
          currentView === 'movies' ? 'text-cyan-400 font-bold' : 'text-slate-400 hover:text-slate-200'
        }`}
      >
        <Film className={`w-5 h-5 ${currentView === 'movies' ? 'text-cyan-400' : ''}`} />
        <span>Movies</span>
      </button>

      <button
        id="mobile-nav-series"
        onClick={() => onNavigate('series')}
        className={`flex flex-col items-center gap-1 py-1 px-2.5 rounded-lg text-[10px] font-medium transition ${
          currentView === 'series' ? 'text-cyan-400 font-bold' : 'text-slate-400 hover:text-slate-200'
        }`}
      >
        <Tv className={`w-5 h-5 ${currentView === 'series' ? 'text-cyan-400' : ''}`} />
        <span>Series</span>
      </button>

      <button
        id="mobile-nav-search"
        onClick={onOpenSearch}
        className="flex flex-col items-center gap-1 py-1 px-2.5 rounded-lg text-[10px] font-medium text-slate-400 hover:text-slate-200 transition"
      >
        <Search className="w-5 h-5" />
        <span>Search</span>
      </button>

      <button
        id="mobile-nav-profile"
        onClick={() => {
          if (isLoggedIn) {
            onNavigate('profile');
          } else {
            onOpenAuth();
          }
        }}
        className={`flex flex-col items-center gap-1 py-1 px-2.5 rounded-lg text-[10px] font-medium transition ${
          currentView === 'profile' ? 'text-cyan-400 font-bold' : 'text-slate-400 hover:text-slate-200'
        }`}
      >
        <User className={`w-5 h-5 ${currentView === 'profile' ? 'text-cyan-400' : ''}`} />
        <span>{isLoggedIn ? 'Profile' : 'Login'}</span>
      </button>
    </nav>
  );
};
