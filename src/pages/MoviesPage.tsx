import React, { useState, useEffect, useCallback } from 'react';
import { Film, AlertCircle, Loader2 } from 'lucide-react';
import { Movie, Category, FilterOptions } from '../types';
import { api } from '../services/api';
import { MovieCard } from '../components/MovieCard';
import { FilterBar } from '../components/FilterBar';

interface MoviesPageProps {
  initialGenre?: string;
  initialSort?: 'latest' | 'oldest' | 'rating' | 'popular' | 'title';
  onSelectMovie: (movie: Movie) => void;
  onPlayTrailer: (movie: Movie) => void;
}

export const MoviesPage: React.FC<MoviesPageProps> = ({
  initialGenre,
  initialSort = 'latest',
  onSelectMovie,
  onPlayTrailer,
}) => {
  const [movies, setMovies] = useState<Movie[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<FilterOptions>({
    genre: initialGenre || 'All',
    language: 'All',
    year: 'All',
    ratingMin: 0,
    sort: initialSort,
    search: '',
  });

  // Sync if initialGenre changes
  useEffect(() => {
    if (initialGenre) {
      setFilters(prev => ({ ...prev, genre: initialGenre }));
    }
  }, [initialGenre]);

  const loadCategories = async () => {
    try {
      const res = await api.getCategories();
      setCategories(res.categories || []);
    } catch (err) {
      console.error('Failed to load categories', err);
    }
  };

  const loadMovies = useCallback(async () => {
    try {
      setLoading(true);
      const params: Record<string, any> = {
        sort: filters.sort,
      };
      if (filters.genre && filters.genre !== 'All') params.genre = filters.genre;
      if (filters.language && filters.language !== 'All') params.language = filters.language;
      if (filters.year && filters.year !== 'All') params.year = filters.year;
      if (filters.ratingMin && filters.ratingMin > 0) params.ratingMin = filters.ratingMin;
      if (filters.search && filters.search.trim()) params.search = filters.search.trim();

      const res = await api.getMovies(params);
      setMovies(res.movies || []);
    } catch (err) {
      console.error('Failed to load movies', err);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    loadCategories();
  }, []);

  useEffect(() => {
    loadMovies();
  }, [loadMovies]);

  const handleResetFilters = () => {
    setFilters({
      genre: 'All',
      language: 'All',
      year: 'All',
      ratingMin: 0,
      sort: 'latest',
      search: '',
    });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8">
      {/* Header Title */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-b border-slate-800 pb-6">
        <div>
          <div className="flex items-center gap-2.5">
            <Film className="w-6 h-6 text-cyan-400" />
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Movie Catalog
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Browse our manually curated collection of original feature films.
          </p>
        </div>
        <div className="text-xs font-semibold px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-cyan-400">
          {movies.length} {movies.length === 1 ? 'Film Available' : 'Films Available'}
        </div>
      </div>

      {/* Filter Bar */}
      <FilterBar
        categories={categories}
        filters={filters}
        onChange={setFilters}
        onReset={handleResetFilters}
      />

      {/* Movie Grid / States */}
      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 sm:gap-5">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(n => (
            <div key={n} className="aspect-[2/3] bg-slate-900/80 rounded-xl animate-pulse" />
          ))}
        </div>
      ) : movies.length === 0 ? (
        <div className="text-center py-16 bg-slate-900/40 border border-slate-800/80 rounded-2xl p-8 max-w-md mx-auto space-y-3">
          <AlertCircle className="w-12 h-12 text-slate-500 mx-auto" />
          <h3 className="text-base font-bold text-slate-200">No Movies Found</h3>
          <p className="text-xs text-slate-400">
            No films match your current filter settings. Try clearing the filters or search terms.
          </p>
          <button
            onClick={handleResetFilters}
            className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded-xl text-xs font-semibold shadow transition"
          >
            Reset All Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 sm:gap-5">
          {movies.map(movie => (
            <MovieCard
              key={movie.id}
              movie={movie}
              onSelect={onSelectMovie}
              onPlayTrailer={onPlayTrailer}
            />
          ))}
        </div>
      )}
    </div>
  );
};
