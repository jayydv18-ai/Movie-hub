import React from 'react';
import { Star, Bookmark, Play, Tv, Sparkles } from 'lucide-react';
import { Series } from '../types';
import { useWatchlist } from '../context/WatchlistContext';

interface SeriesCardProps {
  series: Series & { seasonCount?: number; episodeCount?: number };
  onSelect: (series: Series) => void;
  onPlayTrailer?: (series: Series) => void;
}

export const SeriesCard: React.FC<SeriesCardProps> = ({ series, onSelect, onPlayTrailer }) => {
  const { isInWatchlist, toggleWatchlist } = useWatchlist();
  const inWatchlist = isInWatchlist(series.id);

  const handleWatchlistClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    toggleWatchlist(series, 'series');
  };

  const handleTrailerClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onPlayTrailer) {
      onPlayTrailer(series);
    } else {
      onSelect(series);
    }
  };

  return (
    <div
      id={`series-card-${series.id}`}
      onClick={() => onSelect(series)}
      className="group relative flex flex-col bg-[#0E0E0E] hover:bg-[#141414] border border-white/5 hover:border-[#C9A66B]/40 rounded-xl overflow-hidden cursor-pointer transition-all duration-300 hover:shadow-xl hover:shadow-black/60 hover:-translate-y-1"
    >
      {/* Poster Image Container */}
      <div className="relative aspect-[2/3] w-full overflow-hidden bg-[#1A1A1A]">
        <img
          src={series.poster}
          alt={series.title}
          loading="lazy"
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
          onError={(e) => {
            (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=600&auto=format&fit=crop&q=80';
          }}
        />

        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#0E0E0E] via-transparent to-black/40 opacity-70 group-hover:opacity-90 transition-opacity" />

        {/* Top Badges */}
        <div className="absolute top-2.5 left-2.5 right-2.5 flex items-center justify-between pointer-events-none">
          {/* Rating */}
          <div className="px-1.5 py-0.5 bg-black/70 backdrop-blur-md rounded text-[10px] text-[#C9A66B] font-bold flex items-center gap-1 border border-white/10">
            <Star className="w-3 h-3 fill-[#C9A66B] text-[#C9A66B]" />
            <span>{series.rating ? series.rating.toFixed(1) : '8.0'}</span>
          </div>

          {/* Series badge */}
          <div className="flex items-center gap-1 px-2 py-0.5 rounded bg-white/15 backdrop-blur-md text-white text-[9px] font-bold uppercase tracking-widest border border-white/10 shadow-md">
            <Tv className="w-3 h-3 text-[#C9A66B]" />
            <span>Series</span>
          </div>
        </div>

        {/* Bookmark Watchlist Button */}
        <button
          id={`watchlist-series-btn-${series.id}`}
          onClick={handleWatchlistClick}
          className={`absolute bottom-2.5 right-2.5 p-2 rounded-full backdrop-blur-md border transition-all duration-200 ${
            inWatchlist
              ? 'bg-[#C9A66B] text-black border-[#C9A66B] shadow-md shadow-amber-950/40'
              : 'bg-black/60 hover:bg-black/80 text-white/70 hover:text-white border-white/15'
          }`}
          title={inWatchlist ? 'Remove from Watchlist' : 'Add to Watchlist'}
          aria-label="Toggle Watchlist"
        >
          <Bookmark className={`w-3.5 h-3.5 ${inWatchlist ? 'fill-black' : ''}`} />
        </button>

        {/* Hover Center Play Button */}
        {series.trailerUrl && (
          <button
            onClick={handleTrailerClick}
            className="absolute inset-0 m-auto w-11 h-11 rounded-full bg-[#C9A66B] text-black flex items-center justify-center shadow-xl opacity-0 group-hover:opacity-100 scale-75 group-hover:scale-100 transition-all duration-300"
            title="Watch Trailer"
            aria-label="Play Series Trailer"
          >
            <Play className="w-4 h-4 fill-black ml-0.5" />
          </button>
        )}
      </div>

      {/* Card Info */}
      <div className="p-3 flex flex-col flex-grow justify-between">
        <div>
          <div className="text-[10px] uppercase tracking-tighter text-[#C9A66B] mb-0.5 font-medium truncate">
            {series.genres?.slice(0, 2).join(' • ') || 'Drama'}
          </div>
          <h4 className="text-sm font-medium text-white group-hover:text-[#C9A66B] transition-colors truncate">
            {series.title}
          </h4>
        </div>
        <div className="mt-2 flex items-center justify-between text-[11px] text-white/40">
          <span className="text-[#C9A66B]/80 font-medium">
            {series.seasonCount ? `${series.seasonCount} Season${series.seasonCount > 1 ? 's' : ''}` : 'Series'}
          </span>
          <span>{series.releaseYear || 2024}</span>
        </div>
      </div>
    </div>
  );
};
