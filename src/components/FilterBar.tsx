import React from 'react';
import { Filter, RotateCcw, Search, SlidersHorizontal } from 'lucide-react';
import { Category, FilterOptions } from '../types';

interface FilterBarProps {
  categories: Category[];
  filters: FilterOptions;
  onChange: (newFilters: FilterOptions) => void;
  onReset: () => void;
  showContentTypeSwitch?: boolean;
  contentType?: 'all' | 'movie' | 'series';
  onContentTypeChange?: (type: 'all' | 'movie' | 'series') => void;
}

export const FilterBar: React.FC<FilterBarProps> = ({
  categories,
  filters,
  onChange,
  onReset,
  showContentTypeSwitch,
  contentType = 'all',
  onContentTypeChange,
}) => {
  const languages = ['All', 'English', 'Japanese', 'German', 'Swedish', 'Portuguese', 'Spanish', 'French'];
  const years = ['All', '2026', '2025', '2024', '2023', '2022'];

  const hasActiveFilters = Boolean(
    (filters.genre && filters.genre !== 'All') ||
    (filters.language && filters.language !== 'All') ||
    (filters.year && filters.year !== 'All') ||
    (filters.ratingMin && filters.ratingMin > 0) ||
    (filters.search && filters.search.trim() !== '') ||
    (filters.sort && filters.sort !== 'latest')
  );

  return (
    <div className="w-full bg-[#0A0A0A] border border-white/10 rounded-2xl p-4 sm:p-5 backdrop-blur-md shadow-2xl mb-8 space-y-4">
      {/* Top row: search + Content Type switch + reset */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-3 w-4 h-4 text-[#C9A66B]" />
          <input
            type="text"
            value={filters.search || ''}
            onChange={e => onChange({ ...filters, search: e.target.value })}
            placeholder="Search titles, directors, or actors..."
            className="w-full bg-white/5 border border-white/10 rounded-full pl-10 pr-4 py-2 text-xs text-white placeholder-white/40 focus:outline-none focus:border-[#C9A66B]/50 transition"
          />
        </div>

        {/* Content Type Switch (if enabled) */}
        {showContentTypeSwitch && onContentTypeChange && (
          <div className="flex items-center p-1 bg-black/60 rounded-full border border-white/10 shrink-0">
            <button
              onClick={() => onContentTypeChange('all')}
              className={`px-3.5 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider transition ${
                contentType === 'all' ? 'bg-[#C9A66B] text-black shadow' : 'text-white/50 hover:text-white'
              }`}
            >
              All
            </button>
            <button
              onClick={() => onContentTypeChange('movie')}
              className={`px-3.5 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider transition ${
                contentType === 'movie' ? 'bg-[#C9A66B] text-black shadow' : 'text-white/50 hover:text-white'
              }`}
            >
              Movies
            </button>
            <button
              onClick={() => onContentTypeChange('series')}
              className={`px-3.5 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider transition ${
                contentType === 'series' ? 'bg-[#C9A66B] text-black shadow' : 'text-white/50 hover:text-white'
              }`}
            >
              Series
            </button>
          </div>
        )}

        {/* Reset Filters button */}
        {hasActiveFilters && (
          <button
            onClick={onReset}
            className="flex items-center justify-center gap-1.5 px-3.5 py-2 text-xs font-bold uppercase tracking-wider text-[#C9A66B] hover:text-white bg-white/5 hover:bg-white/10 border border-[#C9A66B]/30 rounded-full transition"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset</span>
          </button>
        )}
      </div>

      {/* Filter Selects Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-5 gap-3 pt-3 border-t border-white/5 text-xs">
        {/* Genre */}
        <div>
          <label className="block text-[10px] uppercase tracking-widest text-[#C9A66B] font-bold mb-1.5">
            Genre
          </label>
          <select
            value={filters.genre || 'All'}
            onChange={e => onChange({ ...filters, genre: e.target.value })}
            className="w-full bg-[#111111] border border-white/10 rounded-xl px-3 py-2 text-white/90 focus:outline-none focus:border-[#C9A66B]/50"
          >
            <option value="All">All Genres</option>
            {categories.map(c => (
              <option key={c.id} value={c.name}>
                {c.name}
              </option>
            ))}
          </select>
        </div>

        {/* Language */}
        <div>
          <label className="block text-[10px] uppercase tracking-widest text-[#C9A66B] font-bold mb-1.5">
            Language
          </label>
          <select
            value={filters.language || 'All'}
            onChange={e => onChange({ ...filters, language: e.target.value })}
            className="w-full bg-[#111111] border border-white/10 rounded-xl px-3 py-2 text-white/90 focus:outline-none focus:border-[#C9A66B]/50"
          >
            {languages.map(l => (
              <option key={l} value={l}>
                {l}
              </option>
            ))}
          </select>
        </div>

        {/* Year */}
        <div>
          <label className="block text-[10px] uppercase tracking-widest text-[#C9A66B] font-bold mb-1.5">
            Release Year
          </label>
          <select
            value={filters.year || 'All'}
            onChange={e => onChange({ ...filters, year: e.target.value })}
            className="w-full bg-[#111111] border border-white/10 rounded-xl px-3 py-2 text-white/90 focus:outline-none focus:border-[#C9A66B]/50"
          >
            {years.map(y => (
              <option key={y} value={y}>
                {y}
              </option>
            ))}
          </select>
        </div>

        {/* Min Rating */}
        <div>
          <label className="block text-[10px] uppercase tracking-widest text-[#C9A66B] font-bold mb-1.5">
            Minimum Rating
          </label>
          <select
            value={filters.ratingMin || 0}
            onChange={e => onChange({ ...filters, ratingMin: parseFloat(e.target.value) })}
            className="w-full bg-[#111111] border border-white/10 rounded-xl px-3 py-2 text-white/90 focus:outline-none focus:border-[#C9A66B]/50"
          >
            <option value="0">Any Rating</option>
            <option value="9">★ 9.0+ Masterpiece</option>
            <option value="8">★ 8.0+ Exceptional</option>
            <option value="7">★ 7.0+ Curated</option>
          </select>
        </div>

        {/* Sort by */}
        <div className="col-span-2 sm:col-span-2 md:col-span-1">
          <label className="block text-[10px] uppercase tracking-widest text-[#C9A66B] font-bold mb-1.5">
            Sort Order
          </label>
          <select
            value={filters.sort || 'latest'}
            onChange={e => onChange({ ...filters, sort: e.target.value as any })}
            className="w-full bg-[#111111] border border-white/10 rounded-xl px-3 py-2 text-white/90 focus:outline-none focus:border-[#C9A66B]/50"
          >
            <option value="latest">Recently Added</option>
            <option value="rating">Top Rated</option>
            <option value="popular">Most Popular</option>
            <option value="title">Alphabetical (A-Z)</option>
            <option value="oldest">Oldest Release</option>
          </select>
        </div>
      </div>
    </div>
  );
};
