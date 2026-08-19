import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { WatchlistProvider } from './context/WatchlistContext';
import { Header } from './components/Header';
import { MobileNav } from './components/MobileNav';
import { Footer } from './components/Footer';
import { SearchModal } from './components/SearchModal';
import { TrailerModal } from './components/TrailerModal';
import { AuthModal } from './components/AuthModal';
import { LegalModal, LegalPageType } from './components/LegalModal';

import { HomePage } from './pages/HomePage';
import { MoviesPage } from './pages/MoviesPage';
import { SeriesPage } from './pages/SeriesPage';
import { CategoriesPage } from './pages/CategoriesPage';
import { TrendingPage } from './pages/TrendingPage';
import { MovieDetailsPage } from './pages/MovieDetailsPage';
import { SeriesDetailsPage } from './pages/SeriesDetailsPage';
import { ProfilePage } from './pages/ProfilePage';
import { AdminPage } from './pages/AdminPage';
import { Movie, Series } from './types';

function MainApp() {
  const { user } = useAuth();
  const [currentView, setCurrentView] = useState<string>('home');
  const [viewParams, setViewParams] = useState<any>({});

  // Modals
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [activeTrailerItem, setActiveTrailerItem] = useState<any | null>(null);
  const [activeLegalPage, setActiveLegalPage] = useState<LegalPageType | null>(null);

  // Global keyboard shortcut for search (Ctrl+K or Cmd+K)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setIsSearchOpen(prev => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleNavigate = (view: string, params: any = {}) => {
    setCurrentView(view);
    setViewParams(params);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSelectMovie = (movie: Movie) => {
    handleNavigate('movie-details', { slugOrId: movie.slug || movie.id });
  };

  const handleSelectSeries = (series: Series) => {
    handleNavigate('series-details', { slugOrId: series.slug || series.id });
  };

  const handlePlayTrailer = (item: any) => {
    setActiveTrailerItem(item);
  };

  // If in admin view, render AdminPage full screen without public header/footer
  if (currentView === 'admin') {
    return (
      <AdminPage
        onExitToApp={() => handleNavigate('home')}
        onOpenAuth={() => setIsAuthOpen(true)}
      />
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-cyan-500 selection:text-white">
      {/* 1. Main Header */}
      <Header
        currentView={currentView}
        onNavigate={handleNavigate}
        onOpenSearch={() => setIsSearchOpen(true)}
        onOpenAuth={() => setIsAuthOpen(true)}
      />

      {/* 2. Main View Container */}
      <main className="flex-1 w-full">
        {currentView === 'home' && (
          <HomePage
            onSelectMovie={handleSelectMovie}
            onSelectSeries={handleSelectSeries}
            onPlayTrailer={handlePlayTrailer}
            onNavigate={handleNavigate}
          />
        )}

        {currentView === 'movies' && (
          <MoviesPage
            initialGenre={viewParams.genre}
            initialSort={viewParams.sort}
            onSelectMovie={handleSelectMovie}
            onPlayTrailer={handlePlayTrailer}
          />
        )}

        {currentView === 'series' && (
          <SeriesPage
            onSelectSeries={handleSelectSeries}
            onPlayTrailer={handlePlayTrailer}
          />
        )}

        {currentView === 'categories' && (
          <CategoriesPage
            onSelectCategory={(genreName) => handleNavigate('movies', { genre: genreName })}
          />
        )}

        {currentView === 'trending' && (
          <TrendingPage
            onSelectMovie={handleSelectMovie}
            onSelectSeries={handleSelectSeries}
            onPlayTrailer={handlePlayTrailer}
          />
        )}

        {currentView === 'movie-details' && (
          <MovieDetailsPage
            slugOrId={viewParams.slugOrId}
            onBack={() => handleNavigate('movies')}
            onSelectMovie={handleSelectMovie}
            onPlayTrailer={handlePlayTrailer}
          />
        )}

        {currentView === 'series-details' && (
          <SeriesDetailsPage
            slugOrId={viewParams.slugOrId}
            onBack={() => handleNavigate('series')}
            onSelectSeries={handleSelectSeries}
            onPlayTrailer={handlePlayTrailer}
          />
        )}

        {currentView === 'profile' && (
          <ProfilePage
            initialTab={viewParams.tab || 'watchlist'}
            onSelectMovie={handleSelectMovie}
            onSelectSeries={handleSelectSeries}
            onPlayTrailer={handlePlayTrailer}
            onNavigate={handleNavigate}
            onOpenAuth={() => setIsAuthOpen(true)}
          />
        )}
      </main>

      {/* 3. Footer */}
      <Footer
        onNavigate={handleNavigate}
        onOpenLegal={(type) => setActiveLegalPage(type)}
      />

      {/* 4. Mobile Bottom Nav Bar */}
      <MobileNav
        currentView={currentView}
        onNavigate={handleNavigate}
        onOpenSearch={() => setIsSearchOpen(true)}
        onOpenAuth={() => setIsAuthOpen(true)}
        isLoggedIn={Boolean(user)}
      />

      {/* 5. Modals */}
      <SearchModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        onSelectMovie={handleSelectMovie}
        onSelectSeries={handleSelectSeries}
      />

      <TrailerModal
        item={activeTrailerItem}
        onClose={() => setActiveTrailerItem(null)}
      />

      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
      />

      <LegalModal
        pageType={activeLegalPage}
        onClose={() => setActiveLegalPage(null)}
      />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <WatchlistProvider>
        <MainApp />
      </WatchlistProvider>
    </AuthProvider>
  );
}
