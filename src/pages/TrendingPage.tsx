import React, { useState, useEffect } from 'react';
import { TrendingUp, Film, Tv } from 'lucide-react';
import { Movie, Series } from '../types';
import { api } from '../services/api';
import { MovieCard } from '../components/MovieCard';
import { SeriesCard } from '../components/SeriesCard';

interface TrendingPageProps {
  onSelectMovie: (movie: Movie) => void;
  onSelectSeries: (series: Series) => void;
  onPlayTrailer: (item: Movie | Series) => void;
}

export const TrendingPage: React.FC<TrendingPageProps> = ({
  onSelectMovie,
  onSelectSeries,
  onPlayTrailer,
}) => {
  const [movies, setMovies] = useState<Movie[]>([]);
  const [seriesList, setSeriesList] = useState<Series[]>([]);
  const [tab, setTab] = useState<'all' | 'movies' | 'series'>('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        const [movRes, serRes] = await Promise.all([
          api.getMovies({ trending: 'true' }),
          api.getSeries({ trending: 'true' }),
        ]);
        setMovies(movRes.movies || []);
        setSeriesList(serRes.series || []);
      } catch (err) {
        console.error('Failed to load trending items', err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-800 pb-6">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 rounded-lg bg-rose-500/20 text-rose-400">
              <TrendingUp className="w-6 h-6" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Trending Cinema
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Titles currently marked as "Trending = ON" in the Movie Hub database.
          </p>
        </div>

        {/* Tab switcher */}
        <div className="flex items-center p-1 bg-slate-900 border border-slate-800 rounded-xl">
          <button
            onClick={() => setTab('all')}
            className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg transition ${
              tab === 'all' ? 'bg-rose-600 text-white shadow' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            All Trending ({movies.length + seriesList.length})
          </button>
          <button
            onClick={() => setTab('movies')}
            className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg transition ${
              tab === 'movies' ? 'bg-cyan-600 text-white shadow' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Movies ({movies.length})
          </button>
          <button
            onClick={() => setTab('series')}
            className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg transition ${
              tab === 'series' ? 'bg-purple-600 text-white shadow' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Series ({seriesList.length})
          </button>
        </div>
      </div>

      {/* Grid */}
      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 sm:gap-5">
          {[1, 2, 3, 4, 5].map(n => (
            <div key={n} className="aspect-[2/3] bg-slate-900/80 rounded-xl animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="space-y-12">
          {(tab === 'all' || tab === 'movies') && movies.length > 0 && (
            <div className="space-y-4">
              {tab === 'all' && (
                <div className="flex items-center gap-2 text-sm font-bold text-cyan-400">
                  <Film className="w-4 h-4" />
                  <span>Trending Movies</span>
                </div>
              )}
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
            </div>
          )}

          {(tab === 'all' || tab === 'series') && seriesList.length > 0 && (
            <div className="space-y-4">
              {tab === 'all' && (
                <div className="flex items-center gap-2 text-sm font-bold text-purple-400">
                  <Tv className="w-4 h-4" />
                  <span>Trending Web Series</span>
                </div>
              )}
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 sm:gap-5">
                {seriesList.map(series => (
                  <SeriesCard
                    key={series.id}
                    series={series}
                    onSelect={onSelectSeries}
                    onPlayTrailer={onPlayTrailer}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
