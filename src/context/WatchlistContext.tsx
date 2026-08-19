import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { WatchlistItem, Movie, Series } from '../types';
import { api } from '../services/api';
import { useAuth } from './AuthContext';

interface WatchlistContextType {
  watchlist: WatchlistItem[];
  loading: boolean;
  isInWatchlist: (id: string) => boolean;
  toggleWatchlist: (item: Movie | Series, itemType: 'movie' | 'series') => Promise<void>;
  refreshWatchlist: () => Promise<void>;
}

const WatchlistContext = createContext<WatchlistContextType | undefined>(undefined);

export const WatchlistProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [watchlist, setWatchlist] = useState<WatchlistItem[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  const refreshWatchlist = useCallback(async () => {
    if (!user) {
      // Local fallback for guest
      try {
        const stored = localStorage.getItem('moviehub_local_watchlist');
        if (stored) {
          setWatchlist(JSON.parse(stored));
        } else {
          setWatchlist([]);
        }
      } catch {
        setWatchlist([]);
      }
      return;
    }

    try {
      setLoading(true);
      const data = await api.getWatchlist();
      setWatchlist(data.watchlist || []);
    } catch (err) {
      console.error('Failed to fetch watchlist', err);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    refreshWatchlist();
  }, [refreshWatchlist]);

  const isInWatchlist = (id: string): boolean => {
    return watchlist.some(
      w => w.movieId === id || w.seriesId === id || (w.item && w.item.id === id)
    );
  };

  const toggleWatchlist = async (item: Movie | Series, itemType: 'movie' | 'series') => {
    const existing = watchlist.find(
      w => w.movieId === item.id || w.seriesId === item.id || (w.item && w.item.id === item.id)
    );

    if (existing) {
      // Optimistic removal
      setWatchlist(prev => prev.filter(w => w.id !== existing.id && w.movieId !== item.id && w.seriesId !== item.id));
      if (user) {
        try {
          await api.removeFromWatchlist(existing.id || item.id);
        } catch (err) {
          console.error('Error removing from watchlist', err);
          refreshWatchlist();
        }
      } else {
        const updated = watchlist.filter(w => w.movieId !== item.id && w.seriesId !== item.id);
        localStorage.setItem('moviehub_local_watchlist', JSON.stringify(updated));
      }
    } else {
      // Optimistic addition
      const tempId = `temp_${Date.now()}`;
      const newItem: WatchlistItem = {
        id: tempId,
        userId: user?.id || 'guest',
        movieId: itemType === 'movie' ? item.id : undefined,
        seriesId: itemType === 'series' ? item.id : undefined,
        itemType,
        item,
        createdAt: new Date().toISOString(),
      };
      setWatchlist(prev => [newItem, ...prev]);

      if (user) {
        try {
          const res = await api.addToWatchlist(
            itemType === 'movie' ? item.id : undefined,
            itemType === 'series' ? item.id : undefined,
            itemType
          );
          setWatchlist(prev => prev.map(w => (w.id === tempId ? { ...res.item, item } : w)));
        } catch (err) {
          console.error('Error adding to watchlist', err);
          refreshWatchlist();
        }
      } else {
        const updated = [newItem, ...watchlist];
        localStorage.setItem('moviehub_local_watchlist', JSON.stringify(updated));
      }
    }
  };

  return (
    <WatchlistContext.Provider
      value={{
        watchlist,
        loading,
        isInWatchlist,
        toggleWatchlist,
        refreshWatchlist,
      }}
    >
      {children}
    </WatchlistContext.Provider>
  );
};

export function useWatchlist() {
  const context = useContext(WatchlistContext);
  if (!context) {
    throw new Error('useWatchlist must be used within a WatchlistProvider');
  }
  return context;
}
