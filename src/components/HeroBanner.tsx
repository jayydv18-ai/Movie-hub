import React, { useState, useEffect } from 'react';
import { Play, Info, Star, ChevronLeft, ChevronRight, Bookmark, Sparkles } from 'lucide-react';
import { Movie, Banner } from '../types';
import { useWatchlist } from '../context/WatchlistContext';

interface HeroBannerProps {
  banners: Banner[];
  featuredMovies: Movie[];
  onSelectMovie: (movie: Movie) => void;
  onPlayTrailer: (movie: Movie) => void;
}

export const HeroBanner: React.FC<HeroBannerProps> = ({
  banners,
  featuredMovies,
  onSelectMovie,
  onPlayTrailer,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const { isInWatchlist, toggleWatchlist } = useWatchlist();

  // Combine banners with featured movies if banners list is short
  const slides = React.useMemo(() => {
    if (banners.length > 0) {
      return banners.map(b => {
        // Find matching movie if any
        const linked = featuredMovies.find(m => m.id === b.contentId || m.slug === b.contentId);
        return {
          id: b.id,
          title: b.title,
          description: b.subtitle || linked?.description || '',
          backdrop: b.image,
          movie: linked || featuredMovies[0],
          rating: linked?.rating || 8.8,
          year: linked?.releaseYear || 2025,
          genres: linked?.genres || ['Action', 'Sci-Fi'],
          buttonText: b.buttonText || 'View Details',
          buttonUrl: b.buttonUrl,
        };
      });
    }

    return featuredMovies.slice(0, 5).map(m => ({
      id: m.id,
      title: m.title,
      description: m.description,
      backdrop: m.backdrop || m.poster,
      movie: m,
      rating: m.rating,
      year: m.releaseYear,
      genres: m.genres,
      buttonText: 'View Details',
      buttonUrl: `/movie/${m.slug}`,
    }));
  }, [banners, featuredMovies]);

  useEffect(() => {
    if (slides.length <= 1 || isPaused) return;
    const interval = setInterval(() => {
      setCurrentIndex(prev => (prev + 1) % slides.length);
    }, 6000);
    return () => clearInterval(interval);
  }, [slides.length, isPaused]);

  if (slides.length === 0) return null;

  const currentSlide = slides[currentIndex] || slides[0];
  const activeMovie = currentSlide.movie;
  const inWatchlist = activeMovie ? isInWatchlist(activeMovie.id) : false;

  const handleNext = () => {
    setCurrentIndex(prev => (prev + 1) % slides.length);
  };

  const handlePrev = () => {
    setCurrentIndex(prev => (prev - 1 + slides.length) % slides.length);
  };

  return (
    <div
      id="hero-banner-section"
      className="relative w-full h-[520px] sm:h-[600px] lg:h-[680px] bg-[#050505] overflow-hidden select-none"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* Background Backdrop with Gradient Overlays */}
      <div className="absolute inset-0">
        <img
          src={currentSlide.backdrop}
          alt={currentSlide.title}
          className="w-full h-full object-cover object-center transition-all duration-1000 grayscale-[0.25] opacity-70 scale-105"
          onError={(e) => {
            (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1446776811953-b23d57bd21aa?w=1600&auto=format&fit=crop&q=80';
          }}
        />
        {/* Cinematic multi-layer gradient overlays */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-[#050505]/50 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#050505] via-[#050505]/75 to-transparent w-full md:w-4/5" />
      </div>

      {/* Content Layer */}
      <div className="relative max-w-7xl mx-auto h-full px-4 sm:px-6 lg:px-8 flex items-end pb-16 sm:pb-20">
        <div className="max-w-2xl space-y-4 z-20">
          {/* Top Tag Badges */}
          <div className="flex items-center gap-2.5 flex-wrap">
            <span className="px-2.5 py-0.5 bg-[#C9A66B] text-black text-[10px] font-bold uppercase tracking-widest rounded shadow-md">
              Featured Premiere
            </span>
            <span className="px-2.5 py-0.5 bg-white/10 border border-white/15 text-white text-[10px] font-bold uppercase tracking-widest rounded backdrop-blur-md">
              {currentSlide.year}
            </span>
            <div className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-black/60 backdrop-blur-md border border-white/10 text-[#C9A66B] text-[10px] font-bold">
              <Star className="w-3 h-3 fill-[#C9A66B] text-[#C9A66B]" />
              <span>{currentSlide.rating?.toFixed(1) || '8.5'}</span>
            </div>
            <span className="text-white/40 text-xs">•</span>
            <span className="text-xs uppercase tracking-wider text-[#C9A66B] font-medium">
              {currentSlide.genres?.slice(0, 3).join(' • ')}
            </span>
          </div>

          {/* Title */}
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-serif italic text-white mb-2 leading-tight drop-shadow-md">
            {currentSlide.title}
          </h1>

          {/* Subtitle / Description */}
          <p className="text-sm sm:text-base text-white/60 line-clamp-2 sm:line-clamp-3 mb-6 leading-relaxed">
            {currentSlide.description}
          </p>

          {/* Action Buttons */}
          <div className="flex items-center gap-3 pt-2 flex-wrap">
            {activeMovie && (
              <button
                id="hero-view-details-btn"
                onClick={() => onSelectMovie(activeMovie)}
                className="px-6 py-2.5 bg-white hover:bg-[#C9A66B] text-black text-xs font-bold uppercase tracking-widest rounded-full transition-colors flex items-center gap-2 shadow-lg shadow-white/10"
              >
                <Info className="w-3.5 h-3.5" />
                <span>{currentSlide.buttonText}</span>
              </button>
            )}

            {activeMovie && (
              <button
                id="hero-watch-trailer-btn"
                onClick={() => onPlayTrailer(activeMovie)}
                className="px-6 py-2.5 bg-white/10 border border-white/20 hover:bg-white/20 text-white text-xs font-bold uppercase tracking-widest rounded-full backdrop-blur-md transition-colors flex items-center gap-2"
              >
                <Play className="w-3.5 h-3.5 fill-white" />
                <span>Watch Trailer</span>
              </button>
            )}

            {activeMovie && (
              <button
                id="hero-watchlist-btn"
                onClick={() => toggleWatchlist(activeMovie, 'movie')}
                className={`p-2.5 rounded-full border backdrop-blur-md transition-colors ${
                  inWatchlist
                    ? 'bg-[#C9A66B] text-black border-[#C9A66B] shadow-lg shadow-amber-950/40'
                    : 'bg-white/10 border-white/20 text-white hover:bg-white/20'
                }`}
                title={inWatchlist ? 'Remove from Watchlist' : 'Add to Watchlist'}
                aria-label="Toggle Watchlist"
              >
                <Bookmark className={`w-4 h-4 ${inWatchlist ? 'fill-black' : ''}`} />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Slider Nav Arrows */}
      {slides.length > 1 && (
        <>
          <button
            onClick={handlePrev}
            className="absolute left-4 top-1/2 -translate-y-1/2 p-2.5 rounded-full bg-[#0A0A0A]/80 hover:bg-[#0A0A0A] text-white border border-white/15 backdrop-blur-md transition opacity-70 hover:opacity-100 hidden sm:flex items-center justify-center"
            aria-label="Previous Slide"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            onClick={handleNext}
            className="absolute right-4 top-1/2 -translate-y-1/2 p-2.5 rounded-full bg-[#0A0A0A]/80 hover:bg-[#0A0A0A] text-white border border-white/15 backdrop-blur-md transition opacity-70 hover:opacity-100 hidden sm:flex items-center justify-center"
            aria-label="Next Slide"
          >
            <ChevronRight className="w-5 h-5" />
          </button>

          {/* Dots Indicator */}
          <div className="absolute bottom-6 right-6 sm:right-12 flex items-center gap-2 z-10">
            {slides.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentIndex(idx)}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  idx === currentIndex ? 'w-8 bg-[#C9A66B]' : 'w-2 bg-white/30 hover:bg-white/60'
                }`}
                aria-label={`Go to slide ${idx + 1}`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
};
