import React, { useState, useEffect } from 'react';
import {
  ArrowLeft,
  Star,
  Tv,
  Calendar,
  Globe,
  Play,
  ExternalLink,
  Bookmark,
  Clock,
  Share2,
  Check,
} from 'lucide-react';
import { Series, Season, Episode } from '../types';
import { api } from '../services/api';
import { useWatchlist } from '../context/WatchlistContext';
import { SeriesCard } from '../components/SeriesCard';

interface SeriesDetailsPageProps {
  slugOrId: string;
  onBack: () => void;
  onSelectSeries: (series: Series) => void;
  onPlayTrailer: (item: any) => void;
}

export const SeriesDetailsPage: React.FC<SeriesDetailsPageProps> = ({
  slugOrId,
  onBack,
  onSelectSeries,
  onPlayTrailer,
}) => {
  const [series, setSeries] = useState<Series | null>(null);
  const [similar, setSimilar] = useState<Series[]>([]);
  const [activeSeasonId, setActiveSeasonId] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const { isInWatchlist, toggleWatchlist } = useWatchlist();

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        const data = await api.getSeriesById(slugOrId);
        setSeries(data.series);
        setSimilar(data.similar || []);
        if (data.series.seasons && data.series.seasons.length > 0) {
          setActiveSeasonId(data.series.seasons[0].id);
        }
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } catch (err) {
        console.error('Failed to load series details', err);
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

  if (!series) {
    return (
      <div className="max-w-md mx-auto py-24 text-center px-4">
        <Tv className="w-12 h-12 text-slate-500 mx-auto mb-3" />
        <h2 className="text-xl font-bold text-white">Series Not Found</h2>
        <p className="text-sm text-slate-400 mt-1 mb-6">
          The requested web series record could not be found.
        </p>
        <button
          onClick={onBack}
          className="px-5 py-2.5 bg-purple-600 hover:bg-purple-500 text-white rounded-xl text-xs font-semibold"
        >
          Return to Series
        </button>
      </div>
    );
  }

  const inWatchlist = isInWatchlist(series.id);
  const seasons: Season[] = series.seasons || [];
  const currentSeason = seasons.find(s => s.id === activeSeasonId) || seasons[0];
  const episodes: Episode[] = currentSeason?.episodes || [];

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="pb-16 space-y-12">
      {/* Top Backdrop Banner */}
      <div className="relative w-full min-h-[480px] lg:min-h-[560px] bg-slate-950 flex items-end">
        <div className="absolute inset-0 overflow-hidden">
          <img
            src={series.backdrop || series.poster}
            alt={series.title}
            className="w-full h-full object-cover object-top opacity-35 filter blur-[1px]"
            onError={(e) => {
              (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1514565131-fce0801e5785?w=1600&auto=format&fit=crop&q=80';
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/80 to-transparent" />
        </div>

        {/* Back button */}
        <div className="absolute top-6 left-4 sm:left-8 z-10">
          <button
            onClick={onBack}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-950/80 hover:bg-slate-900 text-slate-300 hover:text-white border border-slate-700/80 backdrop-blur-md text-xs font-semibold transition"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back</span>
          </button>
        </div>

        {/* Series Header */}
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-8 w-full">
          <div className="flex flex-col md:flex-row gap-8 items-start md:items-end">
            {/* Poster Card */}
            <div className="w-48 sm:w-56 lg:w-64 aspect-[2/3] rounded-2xl overflow-hidden shadow-2xl border-2 border-slate-700/80 shrink-0 bg-slate-900">
              <img
                src={series.poster}
                alt={series.title}
                className="w-full h-full object-cover"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=600&auto=format&fit=crop&q=80';
                }}
              />
            </div>

            {/* Info */}
            <div className="flex-1 space-y-4">
              <div className="flex items-center gap-2.5 flex-wrap">
                <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-900/90 border border-amber-500/40 text-amber-400 font-bold text-sm shadow-md">
                  <Star className="w-4 h-4 fill-amber-400" />
                  <span>{series.rating ? series.rating.toFixed(1) : '8.0'}</span>
                  <span className="text-slate-500 text-xs font-normal">/ 10</span>
                </div>

                <div className="flex items-center gap-1 px-3 py-1 rounded-full bg-purple-600/90 text-white text-xs font-bold shadow-md">
                  <Tv className="w-3.5 h-3.5" /> Web Series
                </div>

                <div className="flex items-center gap-1.5 text-xs text-slate-300">
                  <Calendar className="w-3.5 h-3.5 text-purple-400" />
                  <span>{new Date(series.releaseDate).getFullYear()}</span>
                </div>

                <div className="flex items-center gap-1.5 text-xs text-slate-300">
                  <Globe className="w-3.5 h-3.5 text-purple-400" />
                  <span>{series.language}</span>
                </div>
              </div>

              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight leading-tight">
                {series.title}
              </h1>

              <div className="flex items-center gap-2 flex-wrap">
                {series.genres?.map(g => (
                  <span
                    key={g}
                    className="px-3 py-1 rounded-lg text-xs font-semibold bg-slate-800/90 text-purple-300 border border-slate-700"
                  >
                    {g}
                  </span>
                ))}
              </div>

              {/* Actions */}
              <div className="flex items-center gap-3 pt-2 flex-wrap">
                {series.trailerUrl && (
                  <button
                    onClick={() => onPlayTrailer(series)}
                    className="flex items-center gap-2 px-6 py-3 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-sm shadow-xl shadow-purple-950/60 transition transform hover:scale-105 active:scale-95"
                  >
                    <Play className="w-4 h-4 fill-white" />
                    <span>Watch Series Trailer</span>
                  </button>
                )}

                <button
                  onClick={() => toggleWatchlist(series, 'series')}
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
                  title="Share Series Link"
                >
                  {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Share2 className="w-4 h-4" />}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main details & Seasons / Episodes Viewer */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        {/* Storyline */}
        <div className="bg-slate-900/70 border border-slate-800/80 rounded-2xl p-6 space-y-3">
          <h2 className="text-lg font-bold text-white tracking-wide">Overview</h2>
          <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
            {series.description}
          </p>
        </div>

        {/* Seasons & Episodes Explorer */}
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                Seasons & Episodes
              </h2>
              <p className="text-xs text-slate-400">
                Explore every chapter and episode in this series.
              </p>
            </div>

            {/* Season Selector Tabs */}
            {seasons.length > 0 && (
              <div className="flex items-center gap-2 overflow-x-auto hide-scrollbar max-w-full pb-1">
                {seasons.map(sea => (
                  <button
                    key={sea.id}
                    onClick={() => setActiveSeasonId(sea.id)}
                    className={`px-4 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap ${
                      activeSeasonId === sea.id
                        ? 'bg-purple-600 text-white shadow-lg shadow-purple-950/50 border border-purple-500'
                        : 'bg-slate-900 text-slate-300 hover:text-white hover:bg-slate-800 border border-slate-800'
                    }`}
                  >
                    {sea.title || `Season ${sea.seasonNumber}`}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Episode Cards */}
          {episodes.length === 0 ? (
            <div className="text-center py-12 bg-slate-900/30 rounded-2xl border border-slate-800 text-slate-400 text-sm">
              No published episodes listed under this season yet.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {episodes.map(ep => (
                <div
                  key={ep.id}
                  className="bg-slate-900/80 border border-slate-800/80 hover:border-purple-500/50 rounded-2xl overflow-hidden transition duration-200 flex flex-col justify-between group"
                >
                  <div>
                    {/* Thumbnail */}
                    <div className="relative aspect-video w-full bg-slate-950 overflow-hidden">
                      <img
                        src={ep.thumbnail || series.backdrop || series.poster}
                        alt={ep.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=600&auto=format&fit=crop&q=80';
                        }}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent opacity-60" />

                      <div className="absolute top-2.5 left-2.5 px-2 py-1 bg-slate-950/80 rounded-md text-[11px] font-bold text-purple-300 border border-purple-500/30">
                        Episode {ep.episodeNumber}
                      </div>

                      {ep.duration && (
                        <div className="absolute bottom-2.5 right-2.5 flex items-center gap-1 px-2 py-0.5 bg-slate-950/80 rounded text-[11px] font-medium text-slate-300">
                          <Clock className="w-3 h-3 text-slate-400" />
                          <span>{ep.duration}m</span>
                        </div>
                      )}

                      {ep.trailerUrl && (
                        <button
                          onClick={() => onPlayTrailer({ ...ep, title: `${series.title} - ${ep.title}` })}
                          className="absolute inset-0 m-auto w-10 h-10 rounded-full bg-purple-600/90 text-white flex items-center justify-center shadow-lg opacity-0 group-hover:opacity-100 transition duration-200"
                          title="Watch Episode Preview"
                        >
                          <Play className="w-4 h-4 fill-white ml-0.5" />
                        </button>
                      )}
                    </div>

                    {/* Content */}
                    <div className="p-4 space-y-2">
                      <h4 className="font-bold text-white text-sm sm:text-base group-hover:text-purple-400 transition line-clamp-1">
                        {ep.title}
                      </h4>
                      <p className="text-xs text-slate-400 line-clamp-3 leading-relaxed">
                        {ep.description || 'No description provided for this episode.'}
                      </p>
                    </div>
                  </div>

                  {/* Watch Link */}
                  {ep.officialWatchUrl && (
                    <div className="px-4 pb-4 pt-1">
                      <a
                        href={ep.officialWatchUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-full flex items-center justify-center gap-1.5 py-2 bg-slate-800 hover:bg-purple-950 hover:text-purple-200 text-slate-200 rounded-xl text-xs font-semibold border border-slate-700 transition"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                        <span>Stream Episode</span>
                      </a>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Cast */}
        {series.cast && series.cast.length > 0 && (
          <div className="bg-slate-900/70 border border-slate-800/80 rounded-2xl p-6 space-y-4">
            <h2 className="text-lg font-bold text-white tracking-wide">Cast & Stars</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3.5">
              {series.cast.map((actor, idx) => (
                <div
                  key={idx}
                  className="flex items-center gap-3 p-2.5 rounded-xl bg-slate-950/70 border border-slate-800"
                >
                  <img
                    src={actor.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80'}
                    alt={actor.name}
                    className="w-11 h-11 rounded-full object-cover border border-purple-500/30 shrink-0"
                  />
                  <div className="min-w-0">
                    <p className="font-semibold text-slate-100 text-xs sm:text-sm truncate">
                      {actor.name}
                    </p>
                    {actor.role && (
                      <p className="text-[11px] text-purple-400 truncate">{actor.role}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Similar Series */}
        {similar.length > 0 && (
          <div className="space-y-4 pt-6 border-t border-slate-800">
            <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
              More Series You Might Like
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {similar.map(sim => (
                <SeriesCard
                  key={sim.id}
                  series={sim}
                  onSelect={onSelectSeries}
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
