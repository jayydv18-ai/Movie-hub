import React, { useState, useEffect, useCallback } from 'react';
import { Tv, AlertCircle, Loader2 } from 'lucide-react';
import { Series, Category, FilterOptions } from '../types';
import { api } from '../services/api';
import { SeriesCard } from '../components/SeriesCard';
import { FilterBar } from '../components/FilterBar';

interface SeriesPageProps {
  onSelectSeries: (series: Series) => void;
  onPlayTrailer: (series: Series) => void;
}

export const SeriesPage: React.FC<SeriesPageProps> = ({
  onSelectSeries,
  onPlayTrailer,
}) => {
  const [seriesList, setSeriesList] = useState<Series[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<FilterOptions>({
    genre: 'All',
    language: 'All',
    sort: 'latest',
    search: '',
  });

  const loadCategories = async () => {
    try {
      const res = await api.getCategories();
      setCategories(res.categories || []);
    } catch (err) {
      console.error('Failed to load categories', err);
    }
  };

  const loadSeries = useCallback(async () => {
    try {
      setLoading(true);
      const params: Record<string, any> = {
        sort: filters.sort,
      };
      if (filters.genre && filters.genre !== 'All') params.genre = filters.genre;
      if (filters.language && filters.language !== 'All') params.language = filters.language;
      if (filters.search && filters.search.trim()) params.search = filters.search.trim();

      const res = await api.getSeries(params);
      setSeriesList(res.series || []);
    } catch (err) {
      console.error('Failed to load series', err);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    loadCategories();
  }, []);

  useEffect(() => {
    loadSeries();
  }, [loadSeries]);

  const handleResetFilters = () => {
    setFilters({
      genre: 'All',
      language: 'All',
      sort: 'latest',
      search: '',
    });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-b border-slate-800 pb-6">
        <div>
          <div className="flex items-center gap-2.5">
            <Tv className="w-6 h-6 text-purple-400" />
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Web Series
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Episodic dramas, seasons, and chapters created and managed in Movie Hub.
          </p>
        </div>
        <div className="text-xs font-semibold px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-purple-400">
          {seriesList.length} {seriesList.length === 1 ? 'Show Available' : 'Shows Available'}
        </div>
      </div>

      {/* Filter Bar */}
      <FilterBar
        categories={categories}
        filters={filters}
        onChange={setFilters}
        onReset={handleResetFilters}
      />

      {/* Series Grid */}
      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 sm:gap-5">
          {[1, 2, 3, 4, 5, 6].map(n => (
            <div key={n} className="aspect-[2/3] bg-slate-900/80 rounded-xl animate-pulse" />
          ))}
        </div>
      ) : seriesList.length === 0 ? (
        <div className="text-center py-16 bg-slate-900/40 border border-slate-800/80 rounded-2xl p-8 max-w-md mx-auto space-y-3">
          <AlertCircle className="w-12 h-12 text-slate-500 mx-auto" />
          <h3 className="text-base font-bold text-slate-200">No Web Series Found</h3>
          <p className="text-xs text-slate-400">
            No shows match your query. Series will appear here when the administrator adds them.
          </p>
          <button
            onClick={handleResetFilters}
            className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-xl text-xs font-semibold shadow transition"
          >
            Reset Filters
          </button>
        </div>
      ) : (
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
      )}
    </div>
  );
};
