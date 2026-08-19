import React, { useState, useEffect } from 'react';
import {
  ArrowLeft,
  Star,
  Clock,
  Globe,
  Calendar,
  User,
  Play,
  ExternalLink,
  Bookmark,
  Share2,
  Film,
  Sparkles,
  Check,
} from 'lucide-react';
import { Movie } from '../types';
import { api } from '../services/api';
import { useWatchlist } from '../context/WatchlistContext';
import { MovieCard } from '../components/MovieCard';

interface MovieDetailsPageProps {
  slugOrId: string;
  onBack: () => void;
  onSelectMovie: (movie: Movie) => void;
  onPlayTrailer: (movie: Movie) => void;
}

export const MovieDetailsPage: React.FC<MovieDetailsPageProps> = ({
  slugOrId,
  onBack,
  onSelectMovie,
  onPlayTrailer,
}) => {
  const [movie, setMovie] = useState<Movie | null>(null);
  const [similar, setSimilar] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const { isInWatchlist, toggleWatchlist } = useWatchlist();

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        const data = await api.getMovie(slugOrId);
        setMovie(data.movie);
        setSimilar(data.similar || []);
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } catch (err) {
        console.error('Failed to load movie details', err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [slugOrId]);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8 animate-pulse">
        <div className="h-8 w-32 bg-slate-800 rounded-lg" />
        <div className="w-full h-[400px] bg-slate-900 rounded-2xl" />
      </div>
    );
  }

  if (!movie) {
    return (
      <div className="max-w-md mx-auto py-24 text-center px-4">
        <Film className="w-12 h-12 text-slate-500 mx-auto mb-3" />
        <h2 className="text-xl font-bold text-white">Movie Not Found</h2>
        <p className="text-sm text-slate-400 mt-1 mb-6">
          The requested movie record could not be located in our catalog.
        </p>
        <button
          onClick={onBack}
          className="px-5 py-2.5 bg-cyan-600 hover:bg-cyan-500 text-white rounded-xl text-xs font-semibold"
        >
          Return to Catalog
        </button>
      </div>
    );
  }

  const inWatchlist = isInWatchlist(movie.id);

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="pb-16 space-y-12">
      {/* Top Backdrop Area */}
      <div className="relative w-full min-h-[480px] lg:min-h-[560px] bg-slate-950 flex items-end">
        {/* Backdrop Image */}
        <div className="absolute inset-0 overflow-hidden">
          <img
            src={movie.backdrop || movie.poster}
            alt={movie.title}
            className="w-full h-full object-cover object-top opacity-35 filter blur-[1px]"
            onError={(e) => {
              (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1446776811953-b23d57bd21aa?w=1600&auto=format&fit=crop&q=80';
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/80 to-transparent" />
          <div className="absolute inset-0 bg-radial-gradient from-transparent to-slate-950 opacity-70" />
        </div>

        {/* Back button on top */}
        <div className="absolute top-6 left-4 sm:left-8 z-10">
          <button
            onClick={onBack}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-950/80 hover:bg-slate-900 text-slate-300 hover:text-white border border-slate-700/80 backdrop-blur-md text-xs font-semibold transition"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back</span>
          </button>
        </div>

        {/* Movie Header Content */}
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-8 w-full">
          <div className="flex flex-col md:flex-row gap-8 items-start md:items-end">
            {/* Poster Card */}
            <div className="w-48 sm:w-56 lg:w-64 aspect-[2/3] rounded-2xl overflow-hidden shadow-2xl border-2 border-slate-700/80 shrink-0 bg-slate-900 group">
              <img
                src={movie.poster}
                alt={movie.title}
                className="w-full h-full object-cover"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=600&auto=format&fit=crop&q=80';
                }}
              />
            </div>

            {/* Info details */}
            <div className="flex-1 space-y-4">
              {/* Badges */}
              <div className="flex items-center gap-2.5 flex-wrap">
                <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-900/90 border border-amber-500/40 text-amber-400 font-bold text-sm shadow-md">
                  <Star className="w-4 h-4 fill-amber-400" />
                  <span>{movie.rating ? movie.rating.toFixed(1) : '8.0'}</span>
                  <span className="text-slate-500 text-xs font-normal">/ 10</span>
                </div>

                {movie.trending && (
                  <span className="flex items-center gap-1 px-3 py-1 rounded-full bg-rose-500 text-white text-xs font-bold shadow-md">
                    <Sparkles className="w-3.5 h-3.5" /> Trending
                  </span>
                )}

                <div className="flex items-center gap-1.5 text-xs text-slate-300">
                  <Calendar className="w-3.5 h-3.5 text-cyan-400" />
                  <span>{movie.releaseYear || new Date(movie.releaseDate).getFullYear()}</span>
                </div>

                {movie.runtime && (
                  <div className="flex items-center gap-1.5 text-xs text-slate-300">
                    <Clock className="w-3.5 h-3.5 text-cyan-400" />
                    <span>{movie.runtime} minutes</span>
                  </div>
                )}

                <div className="flex items-center gap-1.5 text-xs text-slate-300">
                  <Globe className="w-3.5 h-3.5 text-cyan-400" />
                  <span>{movie.language}</span>
                </div>
              </div>

              {/* Title */}
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight leading-tight">
                {movie.title}
              </h1>

              {/* Genre Pills */}
              <div className="flex items-center gap-2 flex-wrap">
                {movie.genres?.map(g => (
                  <span
                    key={g}
                    className="px-3 py-1 rounded-lg text-xs font-semibold bg-slate-800/90 text-cyan-300 border border-slate-700"
                  >
                    {g}
                  </span>
                ))}
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-3 pt-2 flex-wrap">
                {movie.trailerUrl && (
                  <button
                    id="play-trailer-hero-btn"
                    onClick={() => onPlayTrailer(movie)}
                    className="flex items-center gap-2 px-6 py-3 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-sm shadow-xl shadow-red-950/60 transition transform hover:scale-105 active:scale-95"
                  >
                    <Play className="w-4 h-4 fill-white" />
                    <span>Watch Trailer</span>
                  </button>
                )}

                {movie.officialWatchUrl && (
                  <a
                    id="official-watch-link-btn"
                    href={movie.officialWatchUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 px-5 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-sm shadow-xl shadow-indigo-950/60 transition"
                  >
                    <ExternalLink className="w-4 h-4" />
                    <span>Stream Official</span>
                  </a>
                )}

                <button
                  id="details-watchlist-toggle-btn"
                  onClick={() => toggleWatchlist(movie, 'movie')}
                  className={`flex items-center gap-2 px-4 py-3 rounded-xl border font-semibold text-sm transition ${
                    inWatchlist
                      ? 'bg-rose-600 text-white border-rose-500 shadow-lg shadow-rose-950/50'
                      : 'bg-slate-900/90 hover:bg-slate-850 text-slate-200 border-slate-700'
                  }`}
                >
                  <Bookmark className={`w-4 h-4 ${inWatchlist ? 'fill-white' : ''}`} />
                  <span>{inWatchlist ? 'In Watchlist' : 'Add to Watchlist'}</span>
                </button>

                <button
                  onClick={handleShare}
                  className="p-3 rounded-xl bg-slate-900/90 hover:bg-slate-850 text-slate-300 hover:text-white border border-slate-700 transition"
                  title="Share Movie Link"
                >
                  {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Share2 className="w-4 h-4" />}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Details Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column: Synopsis and Cast */}
          <div className="lg:col-span-2 space-y-8">
            {/* Synopsis */}
            <div className="bg-slate-900/70 border border-slate-800/80 rounded-2xl p-6 space-y-3">
              <h2 className="text-lg font-bold text-white tracking-wide">Storyline & Synopsis</h2>
              <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
                {movie.description}
              </p>
            </div>

            {/* Cast & Characters */}
            {movie.cast && movie.cast.length > 0 && (
              <div className="bg-slate-900/70 border border-slate-800/80 rounded-2xl p-6 space-y-4">
                <h2 className="text-lg font-bold text-white tracking-wide">Leading Cast</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3.5">
                  {movie.cast.map((actor, idx) => (
                    <div
                      key={idx}
                      className="flex items-center gap-3 p-2.5 rounded-xl bg-slate-950/70 border border-slate-800"
                    >
                      <img
                        src={actor.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80'}
                        alt={actor.name}
                        className="w-11 h-11 rounded-full object-cover border border-cyan-500/30 shrink-0"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80';
                        }}
                      />
                      <div className="min-w-0">
                        <p className="font-semibold text-slate-100 text-xs sm:text-sm truncate">
                          {actor.name}
                        </p>
                        {actor.role && (
                          <p className="text-[11px] text-cyan-400 truncate">{actor.role}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right Column: Crew & Technical Details */}
          <div className="space-y-6">
            <div className="bg-slate-900/70 border border-slate-800/80 rounded-2xl p-6 space-y-4 text-xs sm:text-sm">
              <h2 className="text-base font-bold text-white border-b border-slate-800 pb-3">
                Production Details
              </h2>

              <div className="space-y-3 divide-y divide-slate-800/60 text-slate-300">
                <div className="flex justify-between items-center pt-2 first:pt-0">
                  <span className="text-slate-400">Director</span>
                  <span className="font-semibold text-white">{movie.director || 'N/A'}</span>
                </div>

                <div className="flex justify-between items-center pt-2">
                  <span className="text-slate-400">Writer</span>
                  <span className="font-semibold text-white">{movie.writer || 'N/A'}</span>
                </div>

                <div className="flex justify-between items-center pt-2">
                  <span className="text-slate-400">Producer Studio</span>
                  <span className="font-semibold text-white">{movie.producer || 'N/A'}</span>
                </div>

                <div className="flex justify-between items-center pt-2">
                  <span className="text-slate-400">Country of Origin</span>
                  <span className="font-semibold text-white">{movie.country || 'N/A'}</span>
                </div>

                <div className="flex justify-between items-center pt-2">
                  <span className="text-slate-400">Language</span>
                  <span className="font-semibold text-white">{movie.language || 'English'}</span>
                </div>

                <div className="flex justify-between items-center pt-2">
                  <span className="text-slate-400">Release Date</span>
                  <span className="font-semibold text-white">{movie.releaseDate}</span>
                </div>

                <div className="flex justify-between items-center pt-2">
                  <span className="text-slate-400">Catalog Views</span>
                  <span className="font-semibold text-cyan-400">{movie.views?.toLocaleString() || 0}</span>
                </div>
              </div>
            </div>

            {/* Official Legal Provider notice */}
            <div className="bg-cyan-950/30 border border-cyan-800/40 rounded-2xl p-4 text-xs text-slate-300 space-y-2">
              <p className="font-semibold text-cyan-300">Legal Viewing Information</p>
              <p className="text-slate-400 text-[11px] leading-relaxed">
                Movie Hub operates strictly as a discovery directory and editorial guide. All external streaming links redirect to official authorized providers.
              </p>
            </div>
          </div>
        </div>

        {/* Similar Movies Section */}
        {similar.length > 0 && (
          <div className="space-y-4 pt-6 border-t border-slate-800">
            <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
              Recommended Similar Films
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {similar.map(sim => (
                <MovieCard
                  key={sim.id}
                  movie={sim}
                  onSelect={onSelectMovie}
                  onPlayTrailer={onPlayTrailer}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
