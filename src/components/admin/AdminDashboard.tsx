import React, { useState, useEffect } from 'react';
import {
  Film,
  Tv,
  Layers,
  Users,
  Eye,
  PlusCircle,
  TrendingUp,
  ShieldCheck,
  Sparkles,
  ExternalLink,
  Loader2,
} from 'lucide-react';
import { AdminStats, Movie, Series } from '../../types';
import { api } from '../../services/api';
import { AdminTab } from './AdminLayout';

interface AdminDashboardProps {
  onNavigateTab: (tab: AdminTab) => void;
  onOpenAddMovie: () => void;
  onOpenAddSeries: () => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  onNavigateTab,
  onOpenAddMovie,
  onOpenAddSeries,
}) => {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [recentMovies, setRecentMovies] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadStats() {
      try {
        setLoading(true);
        const [statsData, moviesData] = await Promise.all([
          api.getAdminStats(),
          api.getMovies({ limit: 6, sort: 'latest' }),
        ]);
        setStats(statsData);
        setRecentMovies(moviesData.movies || []);
      } catch (err) {
        console.error('Failed to load admin stats', err);
      } finally {
        setLoading(false);
      }
    }
    loadStats();
  }, []);

  if (loading || !stats) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
      </div>
    );
  }

  const statCards = [
    {
      label: 'Total Movies',
      value: stats.totalMovies,
      icon: Film,
      tab: 'movies' as AdminTab,
    },
    {
      label: 'Web Series',
      value: stats.totalSeries,
      icon: Tv,
      tab: 'series' as AdminTab,
    },
    {
      label: 'Categories',
      value: stats.totalCategories,
      icon: Layers,
      tab: 'categories' as AdminTab,
    },
    {
      label: 'Registered Users',
      value: stats.totalUsers,
      icon: Users,
      tab: 'users' as AdminTab,
    },
    {
      label: 'Catalog Impressions',
      value: stats.totalViews.toLocaleString(),
      icon: Eye,
      tab: 'movies' as AdminTab,
    },
  ];

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Welcome Banner */}
      <div className="bg-[#0A0A0A] border border-white/10 rounded-3xl p-6 sm:p-8 relative overflow-hidden shadow-2xl">
        <div className="max-w-2xl space-y-3 relative z-10">
          <div className="flex items-center gap-2 text-[#C9A66B] text-[10px] font-bold uppercase tracking-widest">
            <ShieldCheck className="w-4 h-4" />
            <span>Master Administration Console</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-serif italic text-white tracking-wide">
            Movie Hub Database & Catalog Vault
          </h1>
          <p className="text-xs sm:text-sm text-white/60 leading-relaxed">
            All movies, series episodes, and genres in Movie Hub are stored directly in your self-hosted backend. No third-party scrapers or external movie APIs are utilized.
          </p>

          <div className="flex items-center gap-3 pt-3 flex-wrap">
            <button
              id="admin-quick-add-movie-btn"
              onClick={onOpenAddMovie}
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-full bg-[#C9A66B] hover:bg-[#b59458] text-black text-xs font-bold uppercase tracking-wider shadow-lg transition"
            >
              <PlusCircle className="w-4 h-4 text-black" />
              <span>Add New Movie</span>
            </button>

            <button
              id="admin-quick-add-series-btn"
              onClick={onOpenAddSeries}
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-full bg-white/5 hover:bg-white/10 text-white text-xs font-bold uppercase tracking-wider border border-white/10 transition"
            >
              <PlusCircle className="w-4 h-4 text-[#C9A66B]" />
              <span>Add Web Series</span>
            </button>
          </div>
        </div>
      </div>

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {statCards.map((card, idx) => {
          const Icon = card.icon;
          return (
            <div
              key={idx}
              onClick={() => onNavigateTab(card.tab)}
              className="bg-[#0A0A0A] border border-white/10 hover:border-[#C9A66B]/50 rounded-2xl p-5 cursor-pointer transition-all duration-200 hover:-translate-y-0.5 group shadow-xl"
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-[10px] font-bold uppercase tracking-widest text-[#C9A66B]">{card.label}</span>
                <div className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-[#C9A66B]">
                  <Icon className="w-4 h-4" />
                </div>
              </div>
              <p className="text-2xl font-serif italic text-white group-hover:text-[#C9A66B] transition">
                {card.value}
              </p>
            </div>
          );
        })}
      </div>

      {/* Quick Overview Tables */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Movies Table */}
        <div className="lg:col-span-2 bg-[#0A0A0A] border border-white/10 rounded-2xl p-5 space-y-4 shadow-xl">
          <div className="flex items-center justify-between border-b border-white/10 pb-3">
            <h3 className="font-serif italic text-white text-base flex items-center gap-2">
              <Film className="w-4 h-4 text-[#C9A66B]" />
              <span>Recently Cataloged Titles</span>
            </h3>
            <button
              onClick={() => onNavigateTab('movies')}
              className="text-[10px] font-bold uppercase tracking-widest text-[#C9A66B] hover:text-white transition"
            >
              View Full Table →
            </button>
          </div>

          <div className="divide-y divide-white/5">
            {recentMovies.map(movie => (
              <div key={movie.id} className="py-3 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3 min-w-0">
                  <img
                    src={movie.poster}
                    alt={movie.title}
                    className="w-10 h-14 rounded-lg object-cover bg-black shrink-0 border border-white/5"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=100&auto=format&fit=crop&q=80';
                    }}
                  />
                  <div className="min-w-0">
                    <p className="text-xs sm:text-sm font-bold text-white truncate">{movie.title}</p>
                    <p className="text-[11px] text-white/40">
                      {movie.releaseYear} • {movie.genres?.slice(0, 2).join(', ')} • Rating: ★ {movie.rating}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  {movie.featured && (
                    <span className="px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider bg-[#C9A66B]/15 text-[#C9A66B] border border-[#C9A66B]/30">
                      Featured
                    </span>
                  )}
                  {movie.trending && (
                    <span className="px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider bg-rose-950/40 text-rose-400 border border-rose-800/40">
                      Trending
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* System & Architecture Info */}
        <div className="bg-[#0A0A0A] border border-white/10 rounded-2xl p-5 space-y-4 shadow-xl">
          <h3 className="font-serif italic text-white text-base border-b border-white/10 pb-3 flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-[#C9A66B]" />
            <span>Database & Storage Specs</span>
          </h3>

          <div className="space-y-3 text-xs text-white/70">
            <div className="p-3 bg-white/5 rounded-xl border border-white/10 space-y-1">
              <p className="font-bold text-white text-[11px] uppercase tracking-wider">Database Engine</p>
              <p className="text-white/40 text-[11px]">JSON Persistent File Store (`data/db.json`)</p>
            </div>

            <div className="p-3 bg-white/5 rounded-xl border border-white/10 space-y-1">
              <p className="font-bold text-white text-[11px] uppercase tracking-wider">External API Status</p>
              <p className="text-[#C9A66B] text-[11px] font-bold flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-[#C9A66B]"></span> 0 External Scrapers (100% Admin Driven)
              </p>
            </div>

            <div className="p-3 bg-white/5 rounded-xl border border-white/10 space-y-1">
              <p className="font-bold text-white text-[11px] uppercase tracking-wider">Authentication Protocol</p>
              <p className="text-white/40 text-[11px]">JWT Bearer Tokens (Role Based Access)</p>
            </div>

            <div className="p-3 bg-white/5 rounded-xl border border-white/10 space-y-1">
              <p className="font-bold text-white text-[11px] uppercase tracking-wider">Image Upload Support</p>
              <p className="text-white/40 text-[11px]">URL Direct Linking & Base64 Embedded File Upload</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
