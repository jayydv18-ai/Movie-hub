import React, { useState } from 'react';
import {
  User as UserIcon,
  Mail,
  Shield,
  Bookmark,
  Trash2,
  Play,
  Film,
  Tv,
  Calendar,
  Sparkles,
  Edit2,
  Check,
  LogOut,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useWatchlist } from '../context/WatchlistContext';
import { Movie, Series } from '../types';

interface ProfilePageProps {
  initialTab?: 'watchlist' | 'settings';
  onSelectMovie: (movie: Movie) => void;
  onSelectSeries: (series: Series) => void;
  onPlayTrailer: (item: Movie | Series) => void;
  onNavigate: (view: string, data?: any) => void;
  onOpenAuth: () => void;
}

export const ProfilePage: React.FC<ProfilePageProps> = ({
  initialTab = 'watchlist',
  onSelectMovie,
  onSelectSeries,
  onPlayTrailer,
  onNavigate,
  onOpenAuth,
}) => {
  const { user, isGuest, logout, updateProfile } = useAuth();
  const { watchlist, removeFromWatchlist } = useWatchlist();
  const [activeTab, setActiveTab] = useState<'watchlist' | 'settings'>(initialTab);
  const [watchlistType, setWatchlistType] = useState<'all' | 'movie' | 'series'>('all');

  // Edit profile state
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(user?.name || '');
  const [editAvatar, setEditAvatar] = useState(user?.profileImage || '');
  const [savingProfile, setSavingProfile] = useState(false);

  const presetAvatars = [
    'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=200&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1527980965255-d3b416303d12?w=200&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=200&auto=format&fit=crop&q=80',
  ];

  if (!user && isGuest) {
    return (
      <div className="max-w-md mx-auto py-20 px-4 text-center space-y-4">
        <div className="w-16 h-16 rounded-2xl bg-cyan-600/20 text-cyan-400 flex items-center justify-center mx-auto">
          <UserIcon className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-bold text-white">Guest Session</h2>
        <p className="text-xs text-slate-400 leading-relaxed">
          You are currently browsing Movie Hub in Guest Mode. Your watchlist is saved locally in your browser. Sign in or create a free account to sync across devices.
        </p>
        <div className="flex justify-center gap-3 pt-2">
          <button
            onClick={onOpenAuth}
            className="px-5 py-2.5 bg-gradient-to-r from-cyan-600 to-indigo-600 text-white rounded-xl text-xs font-semibold shadow-lg transition"
          >
            Sign In / Register
          </button>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="max-w-md mx-auto py-20 px-4 text-center space-y-4">
        <UserIcon className="w-12 h-12 text-slate-500 mx-auto" />
        <h2 className="text-xl font-bold text-white">Sign In Required</h2>
        <p className="text-xs text-slate-400">
          Please sign in to view your profile and account settings.
        </p>
        <button
          onClick={onOpenAuth}
          className="px-5 py-2.5 bg-cyan-600 hover:bg-cyan-500 text-white rounded-xl text-xs font-semibold"
        >
          Open Sign In
        </button>
      </div>
    );
  }

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingProfile(true);
    try {
      await updateProfile({
        name: editName,
        profileImage: editAvatar,
      });
      setIsEditing(false);
    } catch (err) {
      console.error(err);
    } finally {
      setSavingProfile(false);
    }
  };

  const filteredWatchlist = watchlist.filter(item => {
    if (watchlistType === 'all') return true;
    return item.type === watchlistType;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8">
      {/* Profile Header Banner */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 sm:p-8 backdrop-blur-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col sm:flex-row items-center sm:items-start justify-between gap-6 relative z-10">
          {/* Avatar + Info */}
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5 text-center sm:text-left">
            <div className="relative group">
              <img
                src={user.profileImage}
                alt={user.name}
                className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl object-cover border-2 border-cyan-500 shadow-xl"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200&auto=format&fit=crop&q=80';
                }}
              />
              <button
                onClick={() => setIsEditing(true)}
                className="absolute inset-0 bg-black/60 rounded-2xl flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition"
              >
                <Edit2 className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-center sm:justify-start gap-2 flex-wrap">
                <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                  {user.name}
                </h1>
                <span
                  className={`px-2.5 py-0.5 rounded-lg text-[10px] font-bold uppercase tracking-wider ${
                    user.role === 'admin'
                      ? 'bg-indigo-600 text-white'
                      : 'bg-slate-800 text-cyan-400 border border-slate-700'
                  }`}
                >
                  {user.role}
                </span>
              </div>

              <div className="flex items-center justify-center sm:justify-start gap-1.5 text-xs text-slate-400">
                <Mail className="w-3.5 h-3.5 text-slate-500" />
                <span>{user.email}</span>
              </div>

              <div className="flex items-center justify-center sm:justify-start gap-1.5 text-[11px] text-slate-500 pt-1">
                <Calendar className="w-3.5 h-3.5 text-slate-600" />
                <span>Member since {new Date(user.createdAt || Date.now()).toLocaleDateString()}</span>
              </div>
            </div>
          </div>

          {/* Header Action Buttons */}
          <div className="flex items-center gap-2.5">
            {user.role === 'admin' && (
              <button
                id="profile-admin-panel-link"
                onClick={() => onNavigate('admin')}
                className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-lg shadow-indigo-950/50 transition"
              >
                <Shield className="w-4 h-4" />
                <span>Admin Dashboard</span>
              </button>
            )}

            <button
              onClick={() => setIsEditing(!isEditing)}
              className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-200 border border-slate-700 text-xs font-semibold transition"
            >
              <Edit2 className="w-4 h-4 text-cyan-400" />
              <span>Edit Profile</span>
            </button>

            <button
              onClick={logout}
              className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-rose-950/40 hover:bg-rose-950 text-rose-300 border border-rose-800/60 text-xs font-semibold transition"
              title="Sign Out"
            >
              <LogOut className="w-4 h-4" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>

        {/* Edit Profile Form Sub-panel */}
        {isEditing && (
          <form
            onSubmit={handleSaveProfile}
            className="mt-6 pt-6 border-t border-slate-800/80 space-y-4 max-w-xl animate-fade-in"
          >
            <h3 className="text-sm font-bold text-white">Update Account Profile</h3>
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">Display Name</label>
                <input
                  type="text"
                  required
                  value={editName}
                  onChange={e => setEditName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">Avatar Image URL</label>
                <input
                  type="url"
                  value={editAvatar}
                  onChange={e => setEditAvatar(e.target.value)}
                  placeholder="https://..."
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div>
                <p className="text-[11px] text-slate-400 mb-2">Or choose a preset avatar:</p>
                <div className="flex items-center gap-2">
                  {presetAvatars.map((av, idx) => (
                    <img
                      key={idx}
                      src={av}
                      alt="Preset avatar"
                      onClick={() => setEditAvatar(av)}
                      className={`w-10 h-10 rounded-xl object-cover cursor-pointer border-2 transition ${
                        editAvatar === av ? 'border-cyan-400 scale-105' : 'border-slate-800 opacity-70 hover:opacity-100'
                      }`}
                    />
                  ))}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 pt-2">
              <button
                type="submit"
                disabled={savingProfile}
                className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow"
              >
                <Check className="w-3.5 h-3.5" />
                <span>Save Changes</span>
              </button>
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-medium"
              >
                Cancel
              </button>
            </div>
          </form>
        )}
      </div>

      {/* Watchlist Section */}
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
          <div className="flex items-center gap-2.5">
            <Bookmark className="w-6 h-6 text-rose-500" />
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                My Saved Watchlist
              </h2>
              <p className="text-xs text-slate-400">
                Manage films and series you intend to watch.
              </p>
            </div>
          </div>

          {/* Type filters */}
          <div className="flex items-center p-1 bg-slate-900 border border-slate-800 rounded-xl">
            <button
              onClick={() => setWatchlistType('all')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition ${
                watchlistType === 'all' ? 'bg-rose-600 text-white shadow' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              All ({watchlist.length})
            </button>
            <button
              onClick={() => setWatchlistType('movie')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition ${
                watchlistType === 'movie' ? 'bg-cyan-600 text-white shadow' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Movies ({watchlist.filter(i => i.type === 'movie').length})
            </button>
            <button
              onClick={() => setWatchlistType('series')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition ${
                watchlistType === 'series' ? 'bg-purple-600 text-white shadow' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Series ({watchlist.filter(i => i.type === 'series').length})
            </button>
          </div>
        </div>

        {/* Watchlist Grid */}
        {filteredWatchlist.length === 0 ? (
          <div className="text-center py-16 bg-slate-900/40 border border-slate-800/80 rounded-2xl p-8 max-w-md mx-auto space-y-3">
            <Bookmark className="w-12 h-12 text-slate-600 mx-auto" />
            <h3 className="text-base font-bold text-slate-200">Your Watchlist is Empty</h3>
            <p className="text-xs text-slate-400">
              You haven't bookmarked any movies or series yet. Click the bookmark icon on any title to save it for later.
            </p>
            <button
              onClick={() => onNavigate('movies')}
              className="px-5 py-2.5 bg-cyan-600 hover:bg-cyan-500 text-white rounded-xl text-xs font-semibold shadow transition"
            >
              Explore Movies Catalog
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredWatchlist.map(item => (
              <div
                key={item.id}
                className="bg-slate-900/80 border border-slate-800 hover:border-slate-700 rounded-2xl p-3.5 flex gap-3.5 transition group"
              >
                <div
                  onClick={() => {
                    if (item.type === 'movie' && item.movie) onSelectMovie(item.movie);
                    if (item.type === 'series' && item.series) onSelectSeries(item.series);
                  }}
                  className="w-20 aspect-[2/3] rounded-xl overflow-hidden bg-slate-950 shrink-0 cursor-pointer"
                >
                  <img
                    src={item.movie?.poster || item.series?.poster || 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=300&auto=format&fit=crop&q=80'}
                    alt={item.movie?.title || item.series?.title || 'Poster'}
                    className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                  />
                </div>

                <div className="flex-1 min-w-0 flex flex-col justify-between py-0.5">
                  <div className="space-y-1">
                    <span className="text-[10px] uppercase font-bold tracking-wider text-cyan-400">
                      {item.type}
                    </span>
                    <h4
                      onClick={() => {
                        if (item.type === 'movie' && item.movie) onSelectMovie(item.movie);
                        if (item.type === 'series' && item.series) onSelectSeries(item.series);
                      }}
                      className="text-sm font-bold text-white hover:text-cyan-400 cursor-pointer transition line-clamp-1"
                    >
                      {item.movie?.title || item.series?.title || 'Saved Item'}
                    </h4>
                    <p className="text-[11px] text-slate-400">
                      {item.movie?.genres?.slice(0, 2).join(', ') || item.series?.genres?.slice(0, 2).join(', ')}
                    </p>
                  </div>

                  <div className="flex items-center gap-2 pt-2">
                    <button
                      onClick={() => {
                        const target = item.movie || item.series;
                        if (target) onPlayTrailer(target);
                      }}
                      className="p-1.5 rounded-lg bg-red-600/20 hover:bg-red-600 text-red-400 hover:text-white transition"
                      title="Play Trailer"
                    >
                      <Play className="w-3.5 h-3.5 fill-current" />
                    </button>

                    <button
                      onClick={() => removeFromWatchlist(item.id)}
                      className="p-1.5 rounded-lg bg-slate-800 hover:bg-rose-950 text-slate-400 hover:text-rose-400 transition"
                      title="Remove from Watchlist"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
